const { Router } = require("express");
const { Order, Cart, Product, Image, Category, PromoCode, User, CartProduct, AddressOrder } = require("../models");
const router = new Router();
const { PDFDocument } = require('pdf-lib');
const { format } = require('date-fns');
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

router.get('/', async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: req.query,
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (e) {
    next(e)
  }
});

router.get('/:id', checkAuth, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: {
        orderId: parseInt(req.params.id),
        userId: req.user.id
      },
      include: [
        {
          model: CartProduct,
          as: 'CartProducts',
          include: [{ 
            model: Product, 
            as: 'product',
            include: [Category, Image],
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
        id: parseInt(req.params.id),
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
    
    order.dataValues.Cart = cart;

    res.json(order);
  } catch (error) {
    next(error)
  }
});

router.post('/', checkAuth, async (req, res) => {
  try {
    const { total, method } = req.body;
    /*const exist = await Order.findAll({
        where: { 
            userId: userId,
            totalAmount: total,
            deliveryMethod: method
        },
    });
*/
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

router.get("/user/:idUser", async (req, res) => {   // TODO SECURITY

  const { idUser } = req.params;

  try {
      const carts = await Cart.findAll({
          where: { userId: parseInt(idUser) },
          include: [
              {
                  model: PromoCode,
                  as: 'promoCode',
                  attributes: ['discountPercentage']
              },
              {
                  model: CartProduct,
                  as: 'CartProducts', // Nom de l'association dans votre modèle Cart
                  include: [
                      {
                          model: Product,
                          as: 'product', // Nom de l'association dans votre modèle CartProduct
                          attributes: ['id', 'name', 'price'],
                          include: [Category, Image], // Incluez d'autres associations si nécessaire
                      }
                  ]
              }
          ]
      });

      // Transformez les résultats pour avoir une structure avec commandes et paniers
      const orderMap = {};

      for (const cart of carts) {
          const orderId = cart.orderId;

          if (!orderMap[orderId]) {
              const order = await Order.findByPk(orderId);
              if (order) {
                  orderMap[orderId] = {
                      id: order.id,
                      userId: order.userId,
                      totalAmount: order.totalAmount,
                      status: order.status,
                      createdAt: order.createdAt,
                      updatedAt: order.updatedAt,
                      carts: [] // Initialiser le tableau de paniers
                  };
              }
          }

          if (orderMap[orderId]) {
              orderMap[orderId].carts.push({
                  id: cart.id,
                  quantity: cart.quantity,
                  product: cart.CartProducts.map(cp => ({
                      id: cp.productId,
                      quantity: cp.quantity,
                      product: cp.product,
                  })),
                  promo: cart.promoCode, // Associer le promoCode au niveau du cart
              });
          }
      }

      const ordersWithCarts = Object.values(orderMap);

      res.json(ordersWithCarts);
  } catch (e) {
    next(e);
  }
});


router.get("/details/:idUser", async (req, res) => {    // TODO SECURITY
  const idUser = parseInt(req.params.idUser);
  const orderId = parseInt(req.query.orderId);

  try {
      const carts = await Cart.findAll({
          where: { userId: idUser, orderId: orderId },
          include: [
              {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'price'],
                  include: [Category, Image],
              },
              {
                  model: PromoCode,
                  as: 'promoCode',
                  attributes: ['discountPercentage']
              }
          ]
      });

      const orderMap = {};

      for (const cart of carts) {
          const orderId = cart.orderId;

          if (!orderMap[orderId]) {
              const order = await Order.findByPk(orderId);
              if (order) {
                  orderMap[orderId] = {
                      id: order.id,
                      userId: order.userId,
                      totalAmount: order.totalAmount,
                      status: order.status,
                      createdAt: order.createdAt,
                      deliveryDate: order.deliveryDate,
                      deliveryMethod: order.deliveryMethod,
                      carts: [] // Initialiser le tableau de paniers
                  };
              }
          }

          if (orderMap[orderId]) {
              console.log('cart:', cart)
              orderMap[orderId].carts.push({
                  id: cart.id,
                  quantity: cart.quantity,
                  product: cart.product,
                  promo: cart.promoCode,
              });
          }
      }

      const ordersWithCarts = Object.values(orderMap);

      res.json(ordersWithCarts);
  } catch (e) {
      next(e);
  }
});

// Télécharger la facture PDF
router.get('/invoice/:orderId', async (req, res) => {
  const orderId = parseInt(req.params.orderId);
  
  try {
    const order = await Order.findByPk(orderId);
  
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
  
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
  
    page.setFontSize(20);
    page.drawText(`Invoice for Order ${order.id}`, {
      x: 50,
      y: 700,
      size: 20,
    });
  
    page.setFontSize(12);
    page.drawText(`Date: ${format(order.createdAt, 'dd/MM/yyyy')}`, {
      x: 50,
      y: 650,
      size: 12,
    });
  
    const pdfBytes = await pdfDoc.save();
  
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBytes);
  
  } catch (e){
    next(e);
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


module.exports = router;