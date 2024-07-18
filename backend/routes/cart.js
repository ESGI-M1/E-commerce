const { Router } = require("express");
const { Cart, Product, User, CartProduct, Image, Category, AddressUser, ProductVariant, VariantOption } = require("../models");
const router = new Router();
const crypto = require('crypto');
const checkAuth = require("../middlewares/checkAuth");

router.get("/", async (req, res) => {
  const cartItems = await Cart.findAll({ include: [{ model: Product, as: 'product' }] });
  res.json(cartItems);
});

router.get("/product/:id", async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: {
        productId: parseInt(req.params.id),
      }
    });
    cart ? res.json(cart) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

router.get("/order/:id", async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: {
        orderId: parseInt(req.params.id),
      },
      include: [{
        model: CartProduct,
        as: 'CartProducts',
        include: [{ 
          model: Product, 
          as: 'product',
          include: [Category],
        }]
      }]
    });
    cart ? res.json(cart) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

function generateRandomPassword(length) {
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[{]}|;:,<.>/?';

  const allChars = lowercaseLetters + uppercaseLetters + numbers + specialChars;

  let password = '';
  let charTypesCount = 0;

  while (password.length < length || charTypesCount < 4) {
    password = '';
    charTypesCount = 0;

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(allChars.length);
      password += allChars[randomIndex];
    }

    if (/[a-z]/.test(password)) charTypesCount++;
    if (/[A-Z]/.test(password)) charTypesCount++;
    if (/\d/.test(password)) charTypesCount++;
    if (/[^a-zA-Z\d]/.test(password)) charTypesCount++;
  }

  return password;
}

router.post("/", async (req, res, next) => {
  try {
    const { userId, variantId } = req.body;

    if (!userId || !variantId) {
      return res.status(400).json({ error: 'Missing userId or productId' });
    }

    let user = await User.findByPk(parseInt(userId));

    if (!user) {
      const tempPassword = generateRandomPassword(20);
      user = await User.create({
        id: parseInt(userId),
        firstname: 'Temp',
        lastname: 'User',
        email: 'temporary@example.com',
        password: tempPassword,
        role: 'temp'
      });
    }

    let cart = await Cart.findOne({ where: { userId : parseInt(userId), orderId: null } });

    if (!cart) {
      cart = await Cart.create({ userId : parseInt(userId) });
    }

    let cartProduct = await CartProduct.findOne({ where: { cartId: cart.id, variantId : parseInt(variantId) } });

    if (cartProduct) {
      cartProduct.quantity += 1;
      await cartProduct.save();
    } else {
      await CartProduct.create({ cartId: cart.id, variantId, quantity: 1 });
    }

    res.status(200).json({ message: 'Product added to cart' });
  } catch (e) {
    next(e);
  }
});

// Récupère tous les produits du panier d'un utilisateur
router.get("/:userId", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    const cartItems = await Cart.findAll({
      where: { userId, orderId: null },
      include: [
        {
          model: CartProduct,
          as: 'CartProducts',
          include: [{
            model: VariantOption,
            as: 'variantOption',
            include: [
              {
                model: ProductVariant,
                as: 'productVariant',
                include: [ 
                  {
                    model: Image,
                    as: 'images',
                  },
                  {
                    model: Product,
                    as: 'product',
                    include: [Category],
                  }
                ]
              }
            ],
          }]
        },
        {
          model: User,
          as: 'user',
        }
      ]
    });

    if (cartItems.length > 0) {
      const user = cartItems[0].user;

      const addresses = await AddressUser.findAll({
        where: { userId: user.id },
      });

      user.dataValues.deliveryAddress = addresses;

      res.json(cartItems);
    } else {
      res.status(200).json();
    }
  } catch (e) {
    console.error(e);  // Log l'erreur complète pour le débogage
    next(e);
  }
});

router.patch("/update-order/:cartId", async (req, res, next) => {
  const cartId = parseInt(req.params.cartId);
  const orderId = parseInt(req.body.orderId);

  try {
    const cart = await Cart.findByPk(cartId);
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    
    const [nbUpdated, updatedCart] = await Cart.update({ orderId }, { where: { id: cartId }, returning: true });

    nbUpdated ? res.json(updatedCart) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

router.patch("/update-user/:cartId", checkAuth, async (req, res, next) => {
  const cartId = parseInt(req.params.cartId);
  const userId = req.user.id;

  try {
    const cart = await Cart.findByPk(cartId, { include: 'CartProducts' });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const existingCart = await Cart.findOne({
      where: { userId, orderId: null },
      include: 'CartProducts'
    });

    if (!existingCart) {
      cart.userId = userId;
      await cart.save();
    } else {
      for (const cartProduct of cart.CartProducts) {
        const existingProduct = existingCart.CartProducts.find(cp => cp.productId === cartProduct.productId);
        if (existingProduct) {
          existingProduct.quantity += cartProduct.quantity;
          await existingProduct.save();
        } else {
          cartProduct.cartId = existingCart.id;
          await cartProduct.save();
        }
      }
      await cart.destroy();
    }
    res.status(200).json({ message: 'Cart order updated successfully' });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  const cartItemId = parseInt(req.params.id);
  const userId = parseInt(req.body.userId);

  try {
    const deleted = await Cart.destroy({ where: { id: cartItemId, userId } });

    if (deleted ? res.sendStatus(204) : res.sendStatus(404));
  } catch (e) {
    next(e);
  }
});

router.post('/remove-promo', async (req, res) => {
  const { userId, cartIds } = req.body;

  try {
    await Cart.update({ promoCodeId: null }, { where: { userId : parseInt(userId), id: parseInt(cartIds) } });

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
