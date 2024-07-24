
const { PaymentMethod } = require("../models");
const stripe = require('stripe')(process.env.VITE_PRIVATE_KEY_STRIPE);

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
        const { orderId, userId } = paymentIntent.metadata;

        if (!orderId) {
          console.error('L\'orderId est manquant dans les métadonnées.');
          return res.status(400).send('L\'orderId est manquant dans les métadonnées.');
        }

        if(!userId) {
          console.error('L\'userId est manquant dans les métadonnées.');
          return res.status(400).send('L\'userId est manquant dans les métadonnées.');
        }

        const payment = await PaymentMethod.findOne({
          where: {
            orderId: orderId,
            userId: userId,
          },
        });

        payment.status = 'succeeded';
        await payment.save();
        
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
