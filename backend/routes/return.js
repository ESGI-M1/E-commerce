const { Router } = require("express");
const router = new Router();
const { ReturnProduct } = require('../models');

router.post('/', async (req, res, next) => {
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
            reason,
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

    module.exports = router;