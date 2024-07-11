const { Router } = require('express');
const router = Router();
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PSJfGRvgxYLdiJ7BNE7Bd66RYSlpx4rxDPaZaNA3Gp3BbpTpX9TMiFQzgRMtWViErcK6NJiWrCj1613DtUr756M00OVXx6tdH');
const PDFDocument = require('pdf-lib').PDFDocument; // Importer la bibliothèque pour créer des PDFs
const { format } = require('date-fns');
const { PaymentMethod } = require("../models");
const checkAuth = require("../middlewares/checkAuth");

router.post('/', checkAuth, async (req, res) => {
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

router.post('/invoice/:idOrder', async (req, res) => {
  const orderId = req.params.idOrder;

  const payment = await PaymentMethod.findOne({
    where: {
      orderId: orderId,
      userId: req.user.id
    },
  });

  try {
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

    res.json({ invoiceId: finalizedInvoice.id });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
