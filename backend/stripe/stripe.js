const { Router } = require('express');
const router = Router();
const Stripe = require('stripe');
const { PaymentMethod } = require('../models');
const checkAuth = require("../middlewares/checkAuth");

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
          cartId: cartId,
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

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
});

module.exports = router;
