const { Router } = require("express");
const { CartProduct } = require("../models");
const router = new Router();

router.get('/', async (req, res) => {
    try {
      const orders = await CartProduct.findAll({
        order: [['createdAt', 'DESC']],
      });
      res.json(orders);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes :', error);
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
      console.error('Error updating cartProduct quantity:', error);
      res.status(500).json({ error: 'Unable to update cartProduct quantity' });
    }
  });
  
  router.delete("/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      const deleted = await CartProduct.destroy({ where: { id: id } });
      if (deleted) {
        res.sendStatus(204); // No Content
      } else {
        res.sendStatus(404); // Not Found
      }
    } catch (error) {
      res.status(500).json({ error: 'Unable to delete cartProduct item' });
    }
  });
  

  module.exports = router;
