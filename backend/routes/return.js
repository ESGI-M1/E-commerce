const { Router } = require("express");
const router = new Router();
const { ReturnProduct, User, Product, ProductVariant, AttributeValue, Order, PaymentMethod } = require("../models");
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");
const Stripe = require('stripe');
const fs = require('fs');
const path = require('path');

const stripe = Stripe(`${process.env.VITE_PRIVATE_KEY_STRIPE}`);


router.get('/', checkRole({ roles: "admin" }), async (req, res, next) => {
  try {
    const returns = await ReturnProduct.findAll({
      where: req.query,
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: ProductVariant,
          as: 'ProductVariants',
          include: [
            {
              model: AttributeValue,
              as: 'attributeValues',
            },
            {
              model: Product,
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(returns);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.post('/', checkAuth, async (req, res, next) => {
  try {
    const { orderId, productVariantId, quantityReturned, reason, deliveryMethod } = req.body; // TODO add parseInt
    const userId = req.user.id;

    if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

    const existingReturn = await ReturnProduct.findOne({
      where: {
          userId: userId,
          orderId: orderId,
          productVariantId: productVariantId,
      },
    });

    if (!existingReturn) {
        
    const newReturn = await ReturnProduct.create({
      userId,
      orderId,
      productVariantId,
      quantity: quantityReturned,
      reason: reason || 'aucune',
      deliveryMethod
    });

    res.status(201).json(newReturn);
    }
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.get("/:productVariantId", checkAuth, async (req, res, next) => {
  const { productVariantId } = req.params;
  const { orderId } = req.query;
  const userId = req.user.id;

  if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

  try {
    const returnProduct = await ReturnProduct.findOne({
      where: {
        orderId: parseInt(orderId),
        userId: userId,
        productVariantId: parseInt(productVariantId),
      }
    });

    returnProduct ? res.json(returnProduct) : res.sendStatus(200);
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.delete("/", checkAuth, async (req, res, next ) => {

  try {

    const { productVariantId, orderId } = req.query;
    const userId = req.user.id;

    if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

    const deleted = await ReturnProduct.destroy({
      where: {
        userId: userId,
        orderId: parseInt(orderId),
        productVariantId: parseInt(productVariantId),
      }
    });

    deleted ? res.sendStatus(200) : res.sendStatus(404);

  } catch (e) {
    console.log(e);
    next(e);
  }

});
  
router.patch("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
  try {
    const returnProduct = await ReturnProduct.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: 'order',
        },
        {
          model: ProductVariant,
          as: 'ProductVariants',
          include: ['Product']
        }
      ]
    });

    if (!returnProduct) return res.sendStatus(404);

    if (returnProduct.status !== 'returned') {
      returnProduct.status = 'returned';
      await returnProduct.save();

      const order = returnProduct.order;
      const paymentMethod = await PaymentMethod.findOne({
        where: { orderId: order.id }
      });

      if (paymentMethod && paymentMethod.status === 'succeeded') {
        const amountToRefund = parseFloat(returnProduct.ProductVariants.price) * returnProduct.quantity * 100; // Amount in cents

        await stripe.refunds.create({
          payment_intent: paymentMethod.paymentIntentId,
          amount: amountToRefund,
          reason: 'requested_by_customer'
        });

        paymentMethod.status = 'refunded';
        await paymentMethod.save();
      }
    }

    return res.json(returnProduct);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.get('/creditNote/:returnId', checkAuth, async (req, res, next) => {
  try {
    const { returnId } = req.params;

    const returnProduct = await ReturnProduct.findByPk(returnId, {
      include: [
        { model: Order, as: 'order' }
      ]
    });

    if (!returnProduct) return res.sendStatus(404);

    if (returnProduct.order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.sendStatus(403);
    }

    const creditNoteDirectory = path.join(__dirname, '..', 'stripe', 'invoices');
    const creditNotePath = path.join(creditNoteDirectory, `creditnote_${returnProduct.order.id}.pdf`);

    if (fs.existsSync(creditNotePath)) {
      return res.sendFile(creditNotePath);
    } else {
      return res.status(404).json({ error: 'Avoir non trouvé' });
    }

  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
