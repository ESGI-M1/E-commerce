const { Router } = require('express');
const router = Router();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PSJfGRvgxYLdiJ7BNE7Bd66RYSlpx4rxDPaZaNA3Gp3BbpTpX9TMiFQzgRMtWViErcK6NJiWrCj1613DtUr756M00OVXx6tdH');
const { PaymentMethod } = require("../models");
const checkAuth = require("../middlewares/checkAuth");
const bodyParser = require('body-parser');

router.post('/', checkAuth, async (req, res) => {
  try {
    const { items, promo, orderId, cartId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => {
        if (item.variantOption && item.variantOption.productVariant) {
          let unitAmount = item.variantOption.price;
          if (promo && promo.discountPercentage) {
            unitAmount -= (unitAmount * promo.discountPercentage) / 100;
          }
          return {
            price_data: {
              currency: 'eur',
              product_data: {
                name: item.variantOption.productVariant.product.name +' | '+ item.variantOption.productVariant.name,
                description: `Quantité: ${item.quantity}\nPrix unitaire: ${unitAmount} €`
              },
              unit_amount: Math.round(unitAmount * 100),
            },
            quantity: item.quantity,
          };
        } else {
          throw new Error(`Missing variantOption.name in item: ${JSON.stringify(item)}`);
        }
      }),
      
      mode: 'payment',
      success_url: `http://localhost:5173/success/${orderId}/${cartId}`,
      cancel_url: `http://localhost:5173/error/${orderId}`,
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
  }
});

router.post('/invoice/:idOrder', checkAuth, async (req, res) => {
  const orderId = req.params.idOrder;

  try {
    const payment = await PaymentMethod.findOne({
      where: {
        orderId: orderId,
        userId: req.user.id,
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    const invoice = await stripe.invoices.create({
      customer: payment.stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      description: `Facture de la commande n° ${orderId}`,
      metadata: {
        orderId: orderId,
        userId: req.user.id,
      },
    });

    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    res.json({ invoicePdfUrl: finalizedInvoice.invoice_pdf });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  //const sig = req.headers['stripe-signature'];
  let payload = req.body.read
  let sig = req.env['HTTP_STRIPE_SIGNATURE']
  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, 'whsec_7TNIrhY9IN4UZ4HOyd9CIN0QhNQx1nh6');
  } catch (err) {
    console.error('Erreur lors de la construction de l\'événement webhook :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Paiement réussi :', paymentIntent.id);
      break;
    default:
      console.log('Événement Stripe non géré :', event.type);
  }

  res.json({ received: true });
});


module.exports = router;
