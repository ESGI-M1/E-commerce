const { Router } = require("express");
const { Order, Cart, Product, Image, Category, PromoCode, User } = require("../models");
const router = new Router();
const { PDFDocument } = require('pdf-lib');
const { format } = require('date-fns');
router.get('/', async (req, res) => {
    try {
      const orders = await Order.findAll({
        where: req.query, // Si vous souhaitez filtrer les commandes en fonction de certains critères
        include: [
          {
            model: User, // Inclure le modèle User avec l'alias 'user'
            as: 'user', // Utilisation de l'alias 'user' pour l'association
          },
        ],
      });
      res.json(orders);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes :', error);
      res.status(500).json({ error: 'Erreur serveur lors de la récupération des commandes' });
    }
  });

router.get("/:idUser", async (req, res) => {
    const { idUser } = req.params;

    try {
        const carts = await Cart.findAll({
            where: { userId: idUser },
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
                        updatedAt: order.updatedAt,
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
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes et des paniers:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des commandes et des paniers' });
    }
});

router.get("/details/:idUser", async (req, res) => {
    const { idUser } = req.params;
    const { orderId } = req.query;

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
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes et des paniers:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des commandes et des paniers' });
    }
});

// Télécharger la facture PDF
router.get('/invoice/:orderId', async (req, res) => {
  const orderId = req.params.orderId;
  
  try {
    const order = await Order.findByPk(orderId);
  
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
  
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
  
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

module.exports = router;