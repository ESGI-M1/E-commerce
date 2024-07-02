const express = require('express');
const router = express.Router();
const { Favorite, Product, User } = require('../models');
const checkAuth = require('../middlewares/checkAuth');

router.post('/', checkAuth, async (req, res, next) => {
  try {
    const productId = req.body.productId;

    if (!productId) {
      return res.status(400).json({ error: 'ProductId is required' });
    }

    const user = await User.findByPk(req.user.id);
    const product = await Product.findByPk(productId);

    if (!user || !product) {
      return res.status(404).json({ error: 'User or Product not found' });
    }

    const favorite = await Favorite.create({
      userId: req.user.id,
      productId: productId,
    });
    
    res.status(201).json(favorite);
  } catch (e){
    next(e)
  }
});

router.get('/:userId', checkAuth, async (req, res, next) => {
  try {
    const favorites = await Favorite.findAll({
        where: { userId: req.user.id },
        include: [{ model: Product, as: 'product' }] // Utiliser l'alias défini dans l'association
    });

    res.json(favorites);
  } catch (e){
    next(e)
  }
});

// Supprimer un produit des favoris d'un utilisateur
router.delete('/:productId', checkAuth, async (req, res, next) => {
  const productId = parseInt(req.params.productId);

  try {
    await Favorite.destroy({ where: { userId: req.user.id, productId: productId } });
    res.sendStatus(204);
  } catch (e) {
    next(e)
  }
});

module.exports = router;
