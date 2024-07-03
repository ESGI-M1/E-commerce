const { Router } = require('express');
const router = Router();
const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: 'sandbox',
  client_id: 'AY_zGN7odDXkUZKbzft6rgVyoIO6PCCwJFsGhfxqqexDfjjy9tmormcO6b7pv4dtd9yBLdN_v8YVJenp',
  client_secret: 'ED-r4LZIXqNWudkWznrWIvk4UOsEwALkyLfeoHIQItMpdmmcoDXc9J0-89NqVDblhNQZoNHpxllyU00Q'
});

router.post('/', async (req, res) => {
  try {
    const { items, promo, orderId, cartId } = req.body;

    console.log('Received request:', req.body);

    const paypalItems = items.map(item => {
      let unitAmount = item.product.price;
      if (promo && promo.discountPercentage) {
        unitAmount -= (unitAmount * promo.discountPercentage) / 100;
      }
      return {
        name: item.product.name,
        quantity: item.quantity,
        price: Math.round(unitAmount * 100),
        currency: 'EUR'
      };
    });

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
          total: paypalItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0) / 100
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
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            res.json({ approvalUrl: payment.links[i].href });
            break;
          }
        }
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
