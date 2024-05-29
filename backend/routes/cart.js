// routes/cart.js
const express = require('express');
const router = express.Router();
const { Cart, Product } = require('../models');
const { authenticateUser } = require('../middleware/auth');

// Endpoint pour ajouter un article au panier
router.post('/cart', authenticateUser, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const existingCartItem = await Cart.findOne({ where: { userId, productId } });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
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

module.exports = router;
