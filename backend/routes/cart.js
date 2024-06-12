const { Router } = require("express");
const { Cart, Product, User } = require("../models");
const jwt = require('jsonwebtoken'); // Assurez-vous d'importer jwt pour décoder le token
const router = new Router();
const crypto = require('crypto'); // Importer le module crypto pour générer des mots de passe aléatoires

router.get("/", async (req, res, next) => {
  try {
    const cartItems = await Cart.findAll({ include: [{ model: Product, as: 'product' }] });
    console.log("Cart items:", cartItems); // Ajoutez ce log pour vérifier les données récupérées
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Unable to fetch cart items', details: error.message });
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

router.post("/", async (req, res, next) => {
  try {
    let userId = req.body.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const existingCart = await Cart.findOne({ where: { userId } });
    if (!existingCart) {
        const tempPassword = generateRandomPassword(12);
        const tempUser = await User.create({
          id: userId,
          firstname: 'Temp',
          lastname: 'User',
          email: 'temporary@example.com',
          password: tempPassword,
          role: 'temp'
        });
    }

    let productId = req.body.productId;
    let quantity = 1;
    const existingCartItem = await Cart.findOne({ where: { userId, productId } });

    if (existingCartItem) {
      existingCartItem.quantity += 1;
      await existingCartItem.save();
    } else {
      await Cart.create({ userId, productId, quantity });
    }

    res.status(200).json({ message: 'Product added to cart' });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ error: 'Unable to add product to cart' });
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const cartItems = await Cart.findAll({ where: { userId }, include: [{ model: Product, as: 'product' }] });

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(500).json({ error: 'Unable to fetch cart details' });
  }
});



router.delete("/:id", async (req, res, next) => {
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
    console.error('Error deleting cart item:', error);
    res.status(500).json({ error: 'Unable to delete cart item' });
  }
});

module.exports = router;
