const { Router } = require("express");
const { Cart, Product, User, CartProduct, Image, Category, AddressUser, ProductVariant, AttributeValue, Attribute } = require("../models");
const router = new Router();
const crypto = require('crypto');
const checkAuth = require("../middlewares/checkAuth");

// ERROR rajouter token pour toutes les functions !!

// Récupère tous les produits du panier d'un utilisateur
router.get("/:userId", async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    const cartItems = await Cart.findOne({
      where: { userId, orderId: null },
      include: [
        {
          model: CartProduct,
          as: 'CartProducts',
          include: [{
            model: ProductVariant,
            as: 'productVariant',
            include: [
              Product, 
              {   
                model: Image, 
                as: 'images' 
              },
              { 
                model: AttributeValue, 
                as: 'attributeValues',
                include: [
                  {
                    model: Attribute,
                    as: 'attribute',
                  }
                ]
              },
            ]
            
          }]
        },
        {
          model: User,
          as: 'user',
        }
      ]
    });

    if (cartItems) {
      const user = cartItems.user;

      const addresses = await AddressUser.findAll({
        where: { userId: user.id },
      });

      user.dataValues.deliveryAddress = addresses;
      res.json(cartItems);
    } else {
      res.status(200).json();
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
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
    const userId = parseInt(req.body.userId);
    const quantity = parseInt(req.body.quantity);
    const productVariantId = parseInt(req.body.productVariantId);

    if (!userId || !productVariantId) return res.status(400).json({ error: 'Missing userId or productId' });
    
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

    let cart = await Cart.findOne({ where: { userId: user.id, orderId: null } });

    if (!cart) {
      cart = await Cart.create({ userId : parseInt(userId) });
    }

    const cartProduct = await CartProduct.findOne({ where: { cartId: cart.id, productVariantId } });
    const productVariant = await ProductVariant.findByPk(productVariantId);

    if(!productVariant.stock > 0) return res.status(400).json({ error: 'Not enough stock' });

    if(productVariant.stock < quantity) return res.status(400).json({ error: 'Not enough stock' });

    if (cartProduct) {
      cartProduct.quantity += 1;
      await cartProduct.save();
    } else {
      await CartProduct.create({ cartId: cart.id, productVariantId, quantity });
    }

    res.status(200).json({ message: 'Product added to cart' });
  } catch (e) {
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
        const existingProduct = existingCart.CartProducts.find(cp => cp.productVariantId === cartProduct.productVariantId);
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

router.post('/remove-promo', async (req, res, next) => {
  const { userId, cartIds } = req.body;

  try {
    await Cart.update({ promoCodeId: null }, { where: { userId : parseInt(userId), id: parseInt(cartIds) } });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

router.post("/hold", async (req, res, next) => {
  try {
    const { cartId } = req.body;

    const cart = await Cart.findByPk(cartId, {
      include: [{
        model: CartProduct,
        as: 'CartProducts',
        include: [{
          model: ProductVariant,
          as: 'productVariant'
        }]
      }]
    });

    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.heldUntil = new Date(Date.now() + 15 * 60 * 1000);
    await cart.save();

    for (const cartProduct of cart.CartProducts) {
      const productVariant = cartProduct.productVariant;  
      if (productVariant.stock < 1) return res.status(400).json({ error: 'Not enough stock' });

      productVariant.stock -= 1;
      await productVariant.save();
    }

    res.status(200).json({ message: 'Cart reserved for 15 minutes' });
  } catch (e) {
    next(e);
  }
});

router.post("/unhold", async (req, res, next) => {
  try {
    const { cartId } = req.body;

    const cart = await Cart.findByPk(cartId, {
      include: [{
        model: CartProduct,
        as: 'CartProducts',
        include: [{
          model: ProductVariant,
          as: 'productVariant'
        }]
      }]
    });

    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.heldUntil = null;
    await cart.save();

    for (const cartProduct of cart.CartProducts) {
      const productVariant = cartProduct.productVariant;
      productVariant.stock += 1;
      await productVariant.save();
    }

    res.status(200).json({ message: 'Cart unheld' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
