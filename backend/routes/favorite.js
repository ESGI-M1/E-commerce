const express = require('express');
const router = express.Router();
const { Favorite, Product, Image, Category } = require('../models');
const checkAuth = require('../middlewares/checkAuth');

router.get('/', checkAuth, async (req, res) => {

  const favorites = await Favorite.findAll({
    where: { userId: req.user.id },
    include: [
      { model: Product, as: 'product',          
        include: [Category, Image],
      }
    ]
  });

  res.json(favorites);
});

router.post('/', checkAuth, async (req, res, next) => {
  try {
    const productId = req.body.productId;

    if (!productId) {
      return res.status(400).json({ error: 'ProductId is required' });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
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

// Supprimer un produit des favoris d'un utilisateur
router.delete('/:productId', checkAuth, async (req, res, next) => {
  const productId = parseInt(req.params.productId);

  try {
    const nbDeleted = await Favorite.destroy({ where: { userId: req.user.id, productId: productId } });
    nbDeleted ? res.sendStatus(204) : res.sendStatus(404);
  } catch (e) {
    next(e)
  }
});

module.exports = router;
