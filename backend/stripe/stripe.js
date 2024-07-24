const { Router } = require('express');
const router = Router();
const Stripe = require('stripe');
const { PaymentMethod, Order, Shop, BillingAddress, Cart, CartProduct, ProductVariant, Product, AttributeValue, Attribute } = require('../models');
const checkAuth = require("../middlewares/checkAuth");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const stripe = Stripe(`${process.env.VITE_PRIVATE_KEY_STRIPE}`);

router.post('/', checkAuth, async (req, res, next) => {
  try {
    const { items, promo, orderId, cartId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => {
        if (item.productVariant) {
          let unitAmount = item.productVariant.price;
          if (promo && promo.discountPercentage) {
            unitAmount -= (unitAmount * promo.discountPercentage) / 100;
          }
          return {
            price_data: {
              currency: 'eur',
              product_data: {
                name: item.productVariant.Product.name,
              },
              unit_amount: Math.round(unitAmount * 100),
            },
            quantity: item.quantity,
          };
        } else {
          throw new Error(`Missing productVariant in item: ${JSON.stringify(item)}`);
        }
      }),
      mode: 'payment',
      success_url: `${process.env.VITE_API_SECOND_URL}/success/${orderId}/${cartId}`,
      cancel_url: `${process.env.VITE_API_SECOND_URL}/error/${orderId}`,
      payment_intent_data: {
        metadata: {
          orderId: orderId,
          userId: req.user.id,
        }
      }
    });
    
    await PaymentMethod.create({
      paymentId: session.id,
      amount: session.amount_total / 100,
      currency: session.currency,
      status: session.payment_status,
      userId: req.user.id,
      stripeCustomerId: session.customer,
      orderId: orderId,
      method: session.payment_method_types[0],
    });

    await generateInvoice(orderId);

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
});

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

module.exports = router;
