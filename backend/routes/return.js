const { Router } = require("express");
const router = new Router();
const { ReturnProduct, User, Product, ProductVariant, AttributeValue } = require('../models');
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

router.get('/', checkRole({ roles: "admin" }), async (req, res, next) => {
  try {
    const returns = await ReturnProduct.findAll({
      where: req.query,
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: ProductVariant,
          as: 'ProductVariants',
          include: [
            {
              model: AttributeValue,
              as: 'attributeValues',
            },
            {
              model: Product,
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(returns);
  } catch (e) {
    next(e);
  }
});

router.post('/', checkAuth, async (req, res, next) => {
  try {
    const { orderId, productVariantId, quantityReturned, reason, deliveryMethod } = req.body; // TODO add parseInt*
    const userId = req.user.id;

    if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

    const existingReturn = await ReturnProduct.findOne({
      where: {
          userId: userId,
          orderId: orderId,
          productVariantId: productVariantId,
      },
    });

    if (!existingReturn) {
        
    const newReturn = await ReturnProduct.create({
      userId,
      orderId,
      productVariantId,
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

router.get("/:productVariantId", checkAuth, async (req, res, next) => {
  const { productVariantId } = req.params;
  const { orderId } = req.query;
  const userId = req.user.id;

  if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

  try {
    const returnProduct = await ReturnProduct.findOne({
      where: {
        orderId: parseInt(orderId),
        userId: userId,
        productVariantId: parseInt(productVariantId),
      }
    });

    returnProduct ? res.json(returnProduct) : res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

router.delete("/", checkAuth, async (req, res) => {
  const { productVariantId, orderId } = req.query;
  const userId = req.user.id;

  if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

  const deleted = await ReturnProduct.destroy({
     where: {
       userId: userId,
       orderId: parseInt(orderId),
       productVariantId: parseInt(productVariantId),
     }
  });

  deleted ? res.sendStatus(200) : res.sendStatus(404);
});
  
router.patch("/:id", checkRole({ roles: "admin" }), async (req, res) => {
  const returned = await ReturnProduct.findByPk(req.params.id); // TODO security

  if (returned) {
    returned.status = 'returned';
    await returned.save();
    return res.json(returned);
  }

  res.sendStatus(404);
});

module.exports = router;
