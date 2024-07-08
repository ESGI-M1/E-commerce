const { Router } = require('express');
const router = Router();
const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: 'sandbox', // Change to 'live' for production
  client_id: 'AY_zGN7odDXkUZKbzft6rgVyoIO6PCCwJFsGhfxqqexDfjjy9tmormcO6b7pv4dtd9yBLdN_v8YVJenp',
  client_secret: 'ED-r4LZIXqNWudkWznrWIvk4UOsEwALkyLfeoHIQItMpdmmcoDXc9J0-89NqVDblhNQZoNHpxllyU00Q'
});

router.post('/', async (req, res) => {
  try {
    const { items, promo, orderId, cartId } = req.body;

    const paypalItems = items.map(item => {
      let unitAmount = item.product.price;
      if (promo && promo.discountPercentage) {
        unitAmount -= (unitAmount * promo.discountPercentage) / 100;
      }
      unitAmount = parseFloat(unitAmount.toFixed(2)); // Ensure the amount is rounded to 2 decimal places
      return {
        name: item.product.name,
        quantity: item.quantity,
        price: unitAmount.toFixed(2), // Convert to string with 2 decimal places
        currency: 'EUR'
      };
    });

    const totalAmount = paypalItems.reduce((acc, curr) => acc + parseFloat(curr.price) * curr.quantity, 0).toFixed(2);

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: `http://localhost:5173/success/${orderId}/${cartId}`,
        cancel_url: `http://localhost:5173/error/${orderId}`
      },
      transactions: [{
        item_list: {
          items: paypalItems
        },
        amount: {
          currency: 'EUR',
          total: totalAmount
        },
        description: 'Achat via PayPal'
      }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        console.error('Erreur lors de la création du paiement PayPal :', error);
        throw error;
      } else {
        console.log('Création du paiement PayPal réussie');
        console.log('PayPal payment response:', payment);

        const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
        if (approvalUrl) {
          res.json({ approvalUrl: approvalUrl.href });
        } else {
          res.status(500).json({ error: 'No approval_url found in PayPal response' });
        }
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
