const { Router } = require("express");
const { CartProduct, Cart } = require("../models");
const router = new Router();

router.get('/', async (req, res) => {
    try {
      const orders = await CartProduct.findAll({
        order: [['createdAt', 'DESC']],
      });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur lors de la récupération des commandes' });
    }
  });

router.patch("/:id", async (req, res) => {
    const id = req.params.id;
    const {quantity} = req.body;
  
    try {
      const cartProduct = await CartProduct.findByPk(id);
      if (!cartProduct) {
        return res.status(404).json({ error: 'CartProduct not found' });
      }
  
      cartProduct.quantity = quantity;
      await cartProduct.save();
  
      res.status(200).json({ message: 'CartProduct quantity updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Unable to update cartProduct quantity' });
    }
  });
  
  router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    const cartProduct = await CartProduct.findByPk(id);
    const deleted = await cartProduct.destroy();

      if (deleted) {
        const remainingCartProducts = await CartProduct.findAll({ where: { cartId: cartProduct.cartId } });
        if (remainingCartProducts.length === 0) {
        const cart = await Cart.findByPk(cartProduct.cartId);
        if (cart) {
          await cart.destroy();
        }
      }
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
  });
  

  module.exports = router;
