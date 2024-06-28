const { Router } = require("express");
const router = new Router();
const { ReturnProduct, User, Product } = require('../models');

router.get('/', async (req, res) => {
  try {
    const returns = await ReturnProduct.findAll({
      where: req.query,
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: Product,
          as: 'product',
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(returns);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des commandes' });
  }
});

router.post('/', async (req, res) => {
    try {
        const { userId, orderId, productId, quantityReturned, reason, deliveryMethod } = req.body;

        const existingReturn = await ReturnProduct.findOne({
            where: {
                userId: userId,
                orderId: orderId,
                productId: productId,
            },
        });

        if (!existingReturn) {
            
        const newReturn = await ReturnProduct.create({
            userId,
            orderId,
            productId,
            quantity: quantityReturned,
            reason: reason || 'aucune',
            deliveryMethod,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(201).json(newReturn);
        }
    } catch (error) {
        console.error('Error creating return:', error);
        res.status(500).json({ error: 'Unable to create return' });
    }
});

router.get("/:productId", async (req, res, next) => {
    const  productId  = req.params.productId;
    const { userId, orderId } = req.query;

    try {
      // Utiliser Sequelize pour trouver les produits retournés par orderId, userId et productId
      const returnProduct = await ReturnProduct.findOne({
        where: {
          orderId: orderId,
          userId: userId,
          productId: productId
        }
      });
  
      if (returnProduct) {
        res.json(returnProduct);
      }
    } catch (error) {
      next(error); // Passer l'erreur au gestionnaire d'erreurs global
    }
  });

  router.delete("/", async (req, res, next) => {
    const { productId, orderId, userId } = req.query;
  
    try {
      const deleted = await ReturnProduct.destroy({ where: { productId: productId, userId: userId, orderId: orderId } });
  
      if (deleted) {
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du produit retourné :', error);
      res.status(500).json({ error: 'Unable to delete return product' });
    }
  });
  

    module.exports = router;