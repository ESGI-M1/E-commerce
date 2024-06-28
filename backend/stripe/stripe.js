const { Router } = require('express');
const router = Router();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PSJfGRvgxYLdiJ7BNE7Bd66RYSlpx4rxDPaZaNA3Gp3BbpTpX9TMiFQzgRMtWViErcK6NJiWrCj1613DtUr756M00OVXx6tdH');

router.post('/', async (req, res) => {
  try {
    const { items } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.product.name,
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/error',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe :', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
