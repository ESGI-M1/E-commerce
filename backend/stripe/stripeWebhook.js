const { PaymentMethod, Order, Shop, BillingAddress, Cart, CartProduct, ProductVariant, Product, AttributeValue, Attribute } = require("../models");
const stripe = require('stripe')(process.env.VITE_PRIVATE_KEY_STRIPE);
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const handleStripeWebhook = async (req, res, next) => {
  const stripeSignature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, stripeSignature, process.env.VITE_WEBHOOK_SECRET_STRIPE);
  } catch (err) {
    console.error('Erreur lors de la construction de l\'événement webhook :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { orderId, userId, cartId } = paymentIntent.metadata;

        if (!orderId || !userId) {
          console.error('OrderId or UserId is missing in metadata.');
          return res.status(400).send('OrderId or UserId is missing in metadata.');
        }

        await Cart.update({ orderId }, { where: { id: cartId, userId}});

        const order = await Order.findOne({
          where: { id: orderId },
          include: [
            {
              model: BillingAddress,
              as: 'billingAddress',
            },
            {
              model: Cart,
              as: 'carts',
              include: [
                {
                  model: CartProduct,
                  as: 'CartProducts',
                  include: [{
                    model: ProductVariant,
                    as: 'productVariant',
                    include: [
                      Product, 
                      { 
                        model: AttributeValue, 
                        as: 'attributeValues',
                        include: [
                          {
                            model: Attribute,
                            as: 'attribute',
                          }
                        ]
                      },
                    ]
                  }]
                },
              ]
            }
          ],
        });

        const updatePromises = order.carts.flatMap(cart => 
          cart.CartProducts.map(async (cartProduct) => {
            const productVariant = cartProduct.productVariant;  

            if (productVariant) {
              productVariant.stock -= cartProduct.quantity;
              await productVariant.save();
            }
          })
        );

        await Promise.all(updatePromises);

        const payment = await PaymentMethod.findOne({ where: { orderId, userId } });
        if (payment) {
          payment.status = 'succeeded';
          payment.paymentIntentId = paymentIntent.id;
          await payment.save();
          await generateInvoice(orderId);
        }
        break;

      case 'charge.refunded':
        const refund = event.data.object;
        const { payment_intent: paymentIntentId } = refund;

        const refundedPayment = await PaymentMethod.findOne({ where: { paymentIntentId } });
        if (refundedPayment) {
          refundedPayment.status = 'refunded';
          await refundedPayment.save();

          await generateCreditNote(refundedPayment.orderId);
        }
        break;

      default:
        console.log('Événement Stripe non géré :', event.type);
    }
    res.json({ received: true });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const generateInvoice = async (orderId) => {
  try {
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: BillingAddress,
          as: 'billingAddress',
        },
        {
          model: Cart,
          as: 'carts',
          include: [
            {
              model: CartProduct,
              as: 'CartProducts',
              include: [{
                model: ProductVariant,
                as: 'productVariant',
                include: [
                  Product, 
                  { 
                    model: AttributeValue, 
                    as: 'attributeValues',
                    include: [
                      {
                        model: Attribute,
                        as: 'attribute',
                      }
                    ]
                  },
                ]
              }]
            },
          ]
        }
      ],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const shop = await Shop.findOne();
    if (!shop) {
      throw new Error('Shop information not found');
    }

    const doc = new PDFDocument();
    const directoryPath = path.join(__dirname, 'invoices');

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    const filePath = `invoice_${orderId}.pdf`;
    doc.pipe(fs.createWriteStream(path.join(directoryPath, filePath)));

    // Header
    doc.fontSize(25).text('Facture', 100, 50);

    // Shop information
    doc.fontSize(12).text(`Commande #${order.id}`, 100, 100);
    doc.text(`${shop.street} - ${shop.country}`, 100, 115);
    doc.text(`${shop.postalCode} ${shop.city}`, 100, 130);
    doc.text(`${shop.country}`, 100, 145);
    doc.text(`SIRET : ${shop.siret}`, 100, 160);
    doc.text(`${shop.phone}`, 100, 175);
    doc.text(`${shop.email}`, 100, 190);

    // Billing information
    doc.text(`Facturé à : ${order.billingAddress.firstName} ${order.billingAddress.lastName}`, 300, 100);
    doc.text(`${order.billingAddress.street}`, 300, 115);
    doc.text(`${order.billingAddress.postalCode} ${order.billingAddress.city}`, 300, 130);
    doc.text(`${order.billingAddress.country}`, 300, 145);

    // Order details
    doc.text(`Numéro de commande : ${order.id}`, 100, 220);
    doc.text(`Date : ${new Date(order.createdAt).toLocaleDateString()}`, 100, 235);

    let yPosition = 260;
    doc.text('Produits', 100, yPosition);
    yPosition += 20;

    order.carts.forEach(cart => {
      cart.CartProducts.forEach(product => {
        const { productVariant, quantity } = product;
        const productName = productVariant.Product.name;
        const unitPrice = parseFloat(productVariant.price).toFixed(2);
        const totalPrice = (unitPrice * quantity).toFixed(2);
        doc.text(`${productName} - ${productVariant.reference} - ${quantity} x ${unitPrice}€ = ${totalPrice}€`, 100, yPosition);
        yPosition += 20;
      });
    });

    yPosition += 20;
    doc.text(`Total : ${order.totalAmount}€`, 100, yPosition);

    doc.end();

    return filePath;
  } catch (error) {
    console.error('Erreur lors de la génération de la facture');
    console.error(error);
    throw error;
  }
};

const generateCreditNote = async (orderId) => {
  try {
    // Trouver la commande
    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: BillingAddress,
          as: 'billingAddress',
        },
        {
          model: Cart,
          as: 'carts',
          include: [
            {
              model: CartProduct,
              as: 'CartProducts',
              include: [{
                model: ProductVariant,
                as: 'productVariant',
                include: [
                  Product, 
                  { 
                    model: AttributeValue, 
                    as: 'attributeValues',
                    include: [
                      {
                        model: Attribute,
                        as: 'attribute',
                      }
                    ]
                  },
                ]
              }]
            },
          ]
        }
      ],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const shop = await Shop.findOne();
    if (!shop) {
      throw new Error('Shop information not found');
    }

    const doc = new PDFDocument();
    const directoryPath = path.join(__dirname, 'invoices');

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    const filePath = `creditnote_${orderId}.pdf`;
    doc.pipe(fs.createWriteStream(path.join(directoryPath, filePath)));

    // Header
    doc.fontSize(25).text('Facture d\'avoir', 100, 50);

    // Shop information
    doc.fontSize(12).text(`Commande #${order.id}`, 100, 100);
    doc.text(`${shop.street} - ${shop.country}`, 100, 115);
    doc.text(`${shop.postalCode} ${shop.city}`, 100, 130);
    doc.text(`${shop.country}`, 100, 145);
    doc.text(`SIRET : ${shop.siret}`, 100, 160);
    doc.text(`${shop.phone}`, 100, 175);
    doc.text(`${shop.email}`, 100, 190);

    // Billing information
    doc.text(`Facturé à : ${order.billingAddress.firstName} ${order.billingAddress.lastName}`, 300, 100);
    doc.text(`${order.billingAddress.street}`, 300, 115);
    doc.text(`${order.billingAddress.postalCode} ${order.billingAddress.city}`, 300, 130);
    doc.text(`${order.billingAddress.country}`, 300, 145);

    // Order details
    doc.text(`Numéro de commande : ${order.id}`, 100, 220);
    doc.text(`Date : ${new Date(order.createdAt).toLocaleDateString()}`, 100, 235);

    let yPosition = 260;
    doc.text('Produits', 100, yPosition);
    yPosition += 20;

    order.carts.forEach(cart => {
      cart.CartProducts.forEach(product => {
        const { productVariant, quantity } = product;
        const productName = productVariant.Product.name;
        const unitPrice = parseFloat(productVariant.price).toFixed(2);
        const totalPrice = (unitPrice * quantity).toFixed(2);
        doc.text(`${productName} - ${productVariant.reference} - ${quantity} x ${unitPrice}€ = ${totalPrice}€`, 100, yPosition);
        yPosition += 20;
      });
    });

    // Total
    yPosition += 20;
    doc.text(`Total : -${order.totalAmount}€`, 100, yPosition); // Montant négatif pour une note de crédit

    doc.end();

    return filePath;
  } catch (error) {
    console.error('Erreur lors de la génération de la facture d\'avoir');
    console.error(error);
    throw error;
  }
};

module.exports = handleStripeWebhook;
