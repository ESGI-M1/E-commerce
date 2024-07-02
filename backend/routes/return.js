const { Router } = require("express");
const router = new Router();
const { ReturnProduct, User, Product } = require('../models');
const checkAuth = require("../middlewares/checkAuth");

router.get('/', checkAuth, async (req, res) => {
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
  } catch (e) {
    next(e);
  }
});

router.post('/', checkAuth, async (req, res) => {
  try {
    const { userId, orderId, productId, quantityReturned, reason, deliveryMethod } = req.body; // TODO add parseInt

    if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

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
      deliveryMethod
    });

    res.status(201).json(newReturn);
    }
  } catch (e) {
    next(e);
  }
});

router.get("/:productId", async (req, res, next) => {
  const productId = req.params.productId;
  const { userId, orderId } = req.query;

  if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

  try {
    const returnProduct = await ReturnProduct.findOne({
      where: {
        orderId: parseInt(orderId),
        userId: parseInt(userId),
        productId: parseInt(productId),
      }
    });

    returnProduct ? res.json(returnProduct) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

router.delete("/", async (req, res) => {
  const { productId, orderId, userId } = req.query;

  if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

  const deleted = await ReturnProduct.destroy({
     where: {
       userId: parseInt(userId),
       orderId: parseInt(orderId),
       productId: parseInt(productId),
     }
  });

  deleted ? res.sendStatus(200) : res.sendStatus(404);
});
  

router.patch("/:id", async (req, res, next) => {
  const returned = await ReturnProduct.findByPk(req.params.id); // TODO security

  if (returned) {
    returned.status = 'returned';
    await returned.save();
    return res.json(returned);
  }

  res.sendStatus(404);
});

  
module.exports = router;
