const { Router } = require("express");
const { Cart, Product, User, CartProduct, Image, Category } = require("../models");
const router = new Router();
const crypto = require('crypto'); // Importer le module crypto pour générer des mots de passe aléatoires

router.get("/", async (req, res) => {
    const cartItems = await Cart.findAll({ include: [{ model: Product, as: 'product' }] });
    res.json(cartItems);
});

router.get("/product/:id", async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: {
        productId: req.params.id
      }
    });
    if (cart) {
      res.json(cart);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
});

router.get("/order/:id", async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: {
        orderId: req.params.id
      },
      include: [{
        model: CartProduct,
        as: 'CartProducts',
        include: [{ 
          model: Product, 
          as: 'product',
          include: [Category, Image],
        }]
      }]
    });
    if (cart) {
      res.json(cart);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
});



// Fonction pour générer un mot de passe aléatoire qui répond aux critères de validation
function generateRandomPassword(length) {
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[{]}|;:,<.>/?';

  // Concaténer tous les caractères autorisés dans le mot de passe
  const allChars = lowercaseLetters + uppercaseLetters + numbers + specialChars;

  let password = '';
  let charTypesCount = 0;

  // Générer un mot de passe jusqu'à ce qu'il réponde à tous les critères de validation
  while (password.length < length || charTypesCount < 4) {
    password = '';
    charTypesCount = 0;

    // Ajouter des caractères aléatoires au mot de passe
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(allChars.length);
      password += allChars[randomIndex];
    }

    // Vérifier la présence des différents types de caractères dans le mot de passe
    if (/[a-z]/.test(password)) charTypesCount++;
    if (/[A-Z]/.test(password)) charTypesCount++;
    if (/\d/.test(password)) charTypesCount++;
    if (/[^a-zA-Z\d]/.test(password)) charTypesCount++;
  }

  return password;
}

router.post("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: 'Missing userId or productId' });
    }

    let user = await User.findByPk(userId);

    if (!user) {
      const tempPassword = generateRandomPassword(12);
      user = await User.create({
        id: userId,
        firstname: 'Temp',
        lastname: 'User',
        email: 'temporary@example.com',
        password: tempPassword,
        role: 'temp'
      });
    }

    let cart = await Cart.findOne({ where: { userId, orderId: null } });

    if (!cart) {
      cart = await Cart.create({ userId });
    }

    let cartProduct = await CartProduct.findOne({ where: { cartId: cart.id, productId } });

    if (cartProduct) {
      cartProduct.quantity += 1;
      await cartProduct.save();
    } else {
      await CartProduct.create({ cartId: cart.id, productId, quantity: 1 });
    }

    res.status(200).json({ message: 'Product added to cart' });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ error: 'Unable to add product to cart' });
  }
});

// Récupère tous les produits du panier d'un utilisateur
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const cartItems = await Cart.findAll({
      where: { userId, orderId: null },
      include: [{
        model: CartProduct,
        as: 'CartProducts', // Utilisez l'alias correct défini dans le modèle CartProduct
        include: [{ 
          model: Product, 
          as: 'product',
          include: [Category, Image],
        }]
      }]
    });

    if (cartItems || cartItems.length > 0) {
    res.json(cartItems);
    }
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(500).json({ error: 'Unable to fetch cart details' });
  }
});

router.patch("/update-order/:cartId", async (req, res) => {
  const { cartId } = req.params;
  const { orderId } = req.body;

  try {
    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.orderId = orderId;
    await cart.save();

    res.status(200).json({ message: 'Cart order updated successfully' });
  } catch (error) {
    console.error('Error updating cart order:', error);
    res.status(500).json({ error: 'Unable to update cart order' });
  }
});

router.patch("/update-user/:cartId", async (req, res) => {
  const { cartId } = req.params;
  const { userId } = req.body;

  try {
    const cart = await Cart.findByPk(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.userId = userId;
    await cart.save();

    res.status(200).json({ message: 'Cart order updated successfully' });
  } catch (error) {
    console.error('Error updating cart order:', error);
    res.status(500).json({ error: 'Unable to update cart order' });
  }
});


router.delete("/:id", async (req, res) => {
  const userId = req.query.userId;
  const cartItemId = req.params.id;

  try {
    const deleted = await Cart.destroy({ where: { id: cartItemId, userId } });

    if (deleted) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete cart item' });
  }
});

router.post('/remove-promo', async (req, res) => {
  const { userId, cartIds } = req.body;

  try {
    await Cart.update({ promoCodeId: null }, { where: { userId, id: cartIds } });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression du code promo.' });
  }
});

module.exports = router;
