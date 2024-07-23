const Stripe = require('stripe');

const stripe = Stripe(`${process.env.VITE_PRIVATE_KEY_STRIPE}`);
const { PaymentMethod } = require("../models");

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.VITE_WEBHOOK_SECRET_STRIPE);
  } catch (err) {
    console.error('Erreur lors de la construction de l\'événement webhook :', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      const payment = await PaymentMethod.findOne({
        where: {
          orderId: orderId,
          userId: req.user.id,
        },
      });

      payment.status = 'succeeded';
      await payment.save();
      
      await generateInvoice(session);

      console.log('Paiement réussi :', session.id);
      break;
    default:
      console.log('Événement Stripe non géré :', event.type);
  }

  res.json({ received: true });
};

const generateInvoice = async (session) => {
  const PDFDocument = require('pdfkit');
  const fs = require('fs');
  const path = require('path');

  const doc = new PDFDocument();
  const filePath = path.join('factures', `invoices/invoice_${session.id}.pdf`);

  doc.pipe(fs.createWriteStream(filePath));
  
  doc.fontSize(25).text('Facture', 100, 100);

  doc.end();

  return filePath;
};


module.exports = handleStripeWebhook;
