const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PSJfGRvgxYLdiJ7BNE7Bd66RYSlpx4rxDPaZaNA3Gp3BbpTpX9TMiFQzgRMtWViErcK6NJiWrCj1613DtUr756M00OVXx6tdH');

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, 'whsec_7TNIrhY9IN4UZ4HOyd9CIN0QhNQx1nh6');
  } catch (err) {
    console.error('Erreur lors de la construction de l\'événement webhook :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Paiement réussi :', session.id);
      break;
    default:
      console.log('Événement Stripe non géré :', event.type);
  }

  res.json({ received: true });
};

module.exports = handleStripeWebhook;
