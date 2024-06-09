const { Router } = require("express");
const { Cart, Product } = require("../models");
const router = new Router();
const { authenticateUser } = require('../middleware/auth');

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItems = await Cart.findAll({ where: { userId }, include: [Product] });
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Unable to fetch cart items' });
  }
});

router.post("/", authenticateUser, async (req, res, next) => {
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

router.delete("/:id", authenticateUser, async (req, res, next) => {
  const userId = req.user.id;
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
