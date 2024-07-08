const { Router } = require('express');
const router = Router();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PSJfGRvgxYLdiJ7BNE7Bd66RYSlpx4rxDPaZaNA3Gp3BbpTpX9TMiFQzgRMtWViErcK6NJiWrCj1613DtUr756M00OVXx6tdH');

router.post('/', async (req, res) => {
  try {
    const { items, promo, orderId, cartId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => {
        let unitAmount = item.product.price;
        if (promo && promo.discountPercentage) {
          unitAmount -= (unitAmount * promo.discountPercentage) / 100;
        }
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.product.name,
              description: `Quantité: ${item.quantity}\nPrix unitaire: ${unitAmount} €`
            },
            unit_amount: Math.round(unitAmount * 100),
          },
          quantity: item.quantity,
        };
      }),
      mode: 'payment',
      success_url: `http://localhost:5173/success/${orderId}/${cartId}`,
      cancel_url: `http://localhost:5173/error/${orderId}`,
    });

    res.json({ sessionId: session.id });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
