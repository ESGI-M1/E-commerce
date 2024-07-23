const { Router } = require("express");
const { Order, Cart, Product, Image, Category, PromoCode, User, CartProduct, AddressOrder, PaymentMethod, VariantOption, ProductVariant } = require("../models");
const router = new Router();
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");
const { Op } = require('sequelize');

router.get('/', checkRole({ roles: "admin" }), async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: req.query,
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: AddressOrder,
          as: 'addressOrder',
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (e) {
    next(e)
  }
});

router.get('/own', checkAuth, async (req, res, next) => {
  const userId = req.user.id;

  try {
      const carts = await Cart.findAll({
          where: { userId },
      });

      const orderMap = {};

      for (const cart of carts) {
          const orderId = cart.orderId;

          if (!orderMap[orderId]) {
              const order = await Order.findAll({
                  where: { 
                    userId: userId, 
                    id: orderId,
                    status: { [Op.ne]: 'cancelled' }
                   }
              }
              );
              const payment = await PaymentMethod.findOne({
                where: {
                  orderId: orderId,
                  userId: userId,
                },
              });
              if (order && payment) {
                  orderMap[orderId] = {
                      id: order.id,
                      userId: order.userId,
                      totalAmount: order.totalAmount,
                      status: order.status,
                      createdAt: order.createdAt,
                      updatedAt: order.updatedAt,
                      carts: []
                  };
              } else {
                res.sendStatus(404);
              }
          }
      }

      const ordersWithCarts = Object.values(orderMap);

      res.json(ordersWithCarts);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', checkAuth, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      where: {
        orderId: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: CartProduct,
          as: 'CartProducts',
          include: [{ 
            model: VariantOption, 
            as: 'variantOption',
            include: [
              {
                model: ProductVariant,
                as: 'productVariant',
                include: [ 
                  {
                    model: Image,
                    as: 'images',
                  },
                  {
                    model: Product,
                    as: 'product',
                  }
                ]
              }
            ],
          }]
        },
        {
          model: PromoCode,
          as: 'promoCode',
        }
      ]
    });      

    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: AddressOrder,
          as: 'addressOrder',
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    if (!order || !cart) return res.status(404).json({ error: 'Commande ou panier non trouvé' });

    const payment = await PaymentMethod.findOne({
      where: {
        orderId: req.params.id,
        userId: req.user.id,
      },
    });

    if (payment) {
      order.dataValues.Payment = payment;
    }

    order.dataValues.Cart = cart;

    res.json(order);
  } catch (error) {
    next(error)
  }
});

router.post('/', checkAuth, async (req, res, next) => {
  try {
    const { total, method } = req.body;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    const newOrder = await Order.create({
        userId: req.user.id,
        totalAmount: parseFloat(total),
        deliveryDate: deliveryDate,
        deliveryMethod: method,
      });

    res.status(201).json(newOrder);
      
  } catch (e) {
    next(e)
  }
});

router.delete("/:id", checkRole({ roles: "admin" }), async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await Order.findByPk(id);
    const addressId = order.deliveryMethod;

    if (order) {
    const deletedOrder = await Order.destroy({
       where: { id } 
      });
    if (addressId) {
      await AddressOrder.destroy({ where: { id: addressId } });
    }
    deletedOrder > 0 ? res.sendStatus(204) : res.sendStatus(404);
  }
});

router.patch("/:id", checkAuth, async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (req.user.id !== order.userId) {
    return res.sendStatus(403);
  }
  if (order) {
    order.status = 'cancelled';
    await order.save();
      res.json(order);
  } else {
      res.sendStatus(404);
  }
});

router.patch("/admin/:id", checkRole({ roles: "admin" }), async (req, res) => {
  const order = await Order.findByPk(req.params.id);

  if (order) {
    order.status = 'completed';
    await order.save();
      res.json(order);
  } else {
      res.sendStatus(404);
  }
});

module.exports = router;