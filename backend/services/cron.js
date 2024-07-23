var cron = require('node-cron');
const mailer = require('./mailer');
const { Op } = require("sequelize");
const { User, Cart, CartProduct, ProductVariant } = require('../models');

// every 1st day of month, check if users last password modification are later than 60 days
cron.schedule('0 0 * * *', async () => {
  try {
    const users = await User.findAll();
    for (let user of users) {
      let actualDate = new Date();
      let lastUpdate = new Date(user.lastPasswordUpdate);

      lastUpdate.setDate(lastUpdate.getDate() + 60);

      if (lastUpdate < actualDate) {
        await mailer.sendPasswordTooOld(user);
      }
    }
  } catch (e) {
    console.log("Error while getting users:", e);
  }
});

// every minute, check if there are carts with an expired reservation
cron.schedule('* * * * *', async () => {
  try {
    const expiredCarts = await Cart.findAll({
      where: {
        heldUntil: {
          [Op.not]: null,
          [Op.lt]: new Date()
        }
      },
      include: [{
        model: CartProduct,
        as: 'CartProducts',
        include: [{
          model: ProductVariant,
          as: 'productVariant'
        }]
      }]
    });

    for (let cart of expiredCarts) {
      for (let cartProduct of cart.CartProducts) {
        const productVariant = cartProduct.productVariant;
        productVariant.stock += 1;
        await productVariant.save();
      }

      cart.heldUntil = null;
      await cart.save();
    }
  } catch (e) {
    console.log("Error while checking expired carts:", e);
  }
});
