const { Router } = require("express");
const router = new Router();
const { ReturnProduct, User, Product, ProductVariant, VariantOption } = require('../models');
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
          model: VariantOption,
          as: 'variantOption',
          include: [
            {
              model: ProductVariant,
              as: 'productVariant',
              include: [
                {
                  model: Product,
                  as: 'product',
                }
              ]
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
    const { orderId, variantOptionId, quantityReturned, reason, deliveryMethod } = req.body; // TODO add parseInt*
    const userId = req.user.id;

    if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

    const existingReturn = await ReturnProduct.findOne({
      where: {
          userId: userId,
          orderId: orderId,
          variantOptionId: variantOptionId,
      },
    });

    if (!existingReturn) {
        
    const newReturn = await ReturnProduct.create({
      userId,
      orderId,
      variantOptionId,
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

router.get("/:variantOptionId", checkAuth, async (req, res, next) => {
  const variantOptionId = req.params.variantOptionId;
  const { orderId } = req.query;
  const userId = req.user.id;

  if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

  try {
    const returnProduct = await ReturnProduct.findOne({
      where: {
        orderId: parseInt(orderId),
        userId: userId,
        variantOptionId: parseInt(variantOptionId),
      }
    });

    returnProduct ? res.json(returnProduct) : res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

router.delete("/", checkAuth, async (req, res) => {
  const { variantOptionId, orderId } = req.query;
  const userId = req.user.id;

  if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

  const deleted = await ReturnProduct.destroy({
     where: {
       userId: userId,
       orderId: parseInt(orderId),
       variantOptionId: parseInt(variantOptionId),
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
