const { Router } = require("express");
const { Order, Cart, Product, Image, Category, PromoCode, User, CartProduct, AddressOrder, PaymentMethod, ProductVariant, AttributeValue, Attribute, BillingAddress, OrderStatus, OrderStatusHistory } = require("../models");
const router = new Router();
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");
const { Op, where } = require("sequelize");

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
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistory',
          include: [
            {
              model: OrderStatus,
              as: 'orderStatus',
            }
          ]
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: OrderStatusHistory, as: 'statusHistory' }, 'changeDate', 'DESC']
      ],
      
    });
    res.json(orders);
  } catch (e) {
    next(e)
  }
});

router.get('/own', checkAuth, async (req, res, next) => {
  const userId = req.user.id;
  
  try {
    const ordersWithCarts = await Order.findAll({
      where: { 
        userId,
      },
      include: [
        {
          model: OrderStatusHistory,
          as: 'statusHistory',
          include: [
            {
              model: OrderStatus,
              as: 'orderStatus',
              where: {
                name: {
                  [Op.ne]: 'cancelled',
                }
              }
            }
          ]
        },
        {
          model: Cart,
          as: 'carts',
          include: [
            {
              model: CartProduct,
              as: 'CartProducts',
            },
          ],
        },
        {
          model: PaymentMethod,
          as: 'paymentMethod',
          where: {
            userId,
          },
          required: false,
        },
      ],
      order: [
        [{ model: OrderStatusHistory, as: 'statusHistory' }, 'changeDate', 'DESC']
      ],
    });

    res.json(ordersWithCarts);
  } catch (e) {
    console.error(e);
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
                  model: AttributeValue,
                  as: 'attributeValues',
                  include: {
                    model: Attribute,
                    as: 'attribute',
                  }
                },
                {
                  model: Product,
                  include: [Category],
                }
              ]
            }
          ]
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
          model: OrderStatusHistory,
          as: 'statusHistory',
          include: [
            {
              model: OrderStatus,
              as: 'orderStatus',
              where: {
                name: {
                  [Op.ne]: 'cancelled',
                }
              }
            }
          ]
        },
        {
          model: User,
          as: 'user',
        },
        {
          model: AddressOrder,
          as: 'addressOrder',
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: OrderStatusHistory, as: 'statusHistory' }, 'changeDate', 'DESC']
      ],
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
    const { total, method, billingId } = req.body;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const newOrder = await Order.create({
        userId: req.user.id,
        totalAmount: parseFloat(total),
        deliveryDate: deliveryDate,
        deliveryMethod: method,
        billingAddressId: billingId,
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
    const billingAddressId = order.billingAddressId;

    if (order) {
    const deletedOrder = await Order.destroy({
       where: { id } 
      });
    if (addressId) {
      await AddressOrder.destroy({ where: { id: addressId } });
    }
    if (billingAddressId) {
      await BillingAddress.destroy({ where: { id: billingAddressId } });
    }
    deletedOrder > 0 ? res.sendStatus(204) : res.sendStatus(404);
  }
});

router.patch("/:id", checkAuth, async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (req.user.id !== order.userId) {
    return res.sendStatus(403);
  }

  const status = await OrderStatus.findOne({
    where: {
      name: 'cancelled',
    }
  });

  await OrderStatusHistory.create({
    orderId: order.id,
    statusId: status.id,
    changeDate: new Date(),
  });

  if (order) {
    res.json(order);
  } else {
    res.sendStatus(404);
  }
});

router.patch("/admin/:id", checkRole({ roles: "admin" }), async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  const status = await OrderStatus.findOne({
    where: {
      name: 'completed',
    }
  });

  await OrderStatusHistory.create({
    orderId: order.id,
    statusId: status.id,
    changeDate: new Date(),
  });
  if (order) {
    res.json(order);
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;