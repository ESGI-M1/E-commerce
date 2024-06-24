const express = require('express');
const router = express.Router();
const { Favorite, Product, User } = require('../models');

router.post('/add', async (req, res) => {
  try {
    let userId = req.body.userId;
    let productId = req.body.productId;

    if (!userId || !productId) {
      return res.status(400).json({ error: 'UserId and ProductId are required' });
    }

    const user = await User.findByPk(userId);
    const product = await Product.findByPk(productId);

    if (!user || !product) {
      return res.status(404).json({ error: 'User or Product not found' });
    }

    const favorite = await Favorite.create({
      userId: userId,
      productId: productId,
    });
    
    res.status(201).json(favorite);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Unable to add to favorites' });
  }
});

router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      const favorites = await Favorite.findAll({
          where: { userId },
          include: [{ model: Product, as: 'product' }] // Utiliser l'alias défini dans l'association
      });

      res.json(favorites);
  } catch (error) {
      console.error('Erreur lors de la récupération des favoris :', error);
      res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des favoris.' });
  }
});

// Supprimer un produit des favoris d'un utilisateur
router.delete('/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    await Favorite.destroy({ where: { userId, productId } });
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du favori :', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la suppression du favori.' });
  }
});

module.exports = router;
