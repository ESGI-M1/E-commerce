const { Router } = require("express");
const { User, AddressUser, Favorite, ReturnProduct, Cart, PaymentMethod, Order, AddressOrder } = require("../models");
const router = new Router();
const checkRole = require("../middlewares/checkRole");
const checkAuth = require("../middlewares/checkAuth");
const { Op } = require('sequelize');
const mailer = require('../services/mailer');

router.get("/", checkAuth, checkRole({ roles: "admin" }), async (req, res) => {

    const users = await User.findAll({
      where: {
        ...req.query,
        role: { [Op.ne]: 'anonymous' }
      },
      order: [
        ['lastname', 'ASC'],
        ['firstname', 'ASC'],
        ['email', 'ASC']
      ]
    });

    res.json(users);
});

router.get("/details", checkAuth, async (req, res) => {

  const userId = req.user.id;

  if(!userId || userId !== req.user.id && req.user.role !== 'admin') return res.sendStatus(403);

  const addresses = await AddressUser.findAll({
    where: { userId: userId },
  });

  const user = await User.findByPk(userId);

  if (!user) {
    return res.sendStatus(404);
  }
  user.dataValues.deliveryAddress = addresses;
  res.json(user);
});

router.get("/:id", checkAuth, async (req, res, next) => {
  try{
    const id = parseInt(req.params.id);

    if(!id) return res.sendStatus(400);

    if(id !== req.user.id && req.user.role !== 'admin') return res.sendStatus(403);
  
    const user = await User.findByPk(id);
    if (user) {
      res.json(user);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }

});

router.post("/", checkAuth, checkRole({ roles: "admin" }), async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    mailer.sendValidateInscriptionByAdmin(user, req.body.password);
    res.status(201).json(user);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    } else {
      next(e);
    }
  }
});

router.post("/signup", async (req, res, next) => {
  try {

    if(req.body.role && req.body.role === 'admin') return res.status(401).send('Unauthorized');

    if(req.body.cgu !== true) return res.status(400).send('CGU not accepted');

    const user = await User.create(req.body);
    mailer.sendNewsLetterInscription(user);
    res.status(201).json(user);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    } else {
      next(e);
    }
  }
});

router.patch("/:id", checkAuth, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

    const [nbUpdated, users] = await User.update(req.body, {
      where: {
        id: userId,
      },
      individualHooks: true,
      returning: true,
    });

    nbUpdated === 1 ? res.json(users[0]) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", checkAuth, async (req, res, next) => {
  try {
    const user = parseInt(req.params.id);
    
    if(!user || ( user !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);
    let userId = parseInt(req.params.id);

    await AddressUser.destroy({
      where: { userId: userId },
    });

    await Favorite.destroy({
      where: { userId: userId },
    });

    const carts = await Cart.findAll({
      where: { userId: userId },
    });    

    const returns = await ReturnProduct.findAll({
      where: { userId: userId },
    }); 

    const payments = await PaymentMethod.findAll({
      where: { userId: userId },
    }); 

    const orders = await Order.findAll({
      where: { userId: userId },
    }); 

    if (carts.length === 0 && returns.length === 0 && payments.length === 0 && orders.length === 0) {
      const deleted = await User.destroy({
        where: { id: userId },
      });
      res.sendStatus(deleted === 1 ? 204 : 404);
    } else {
      const deliveryMethodIds = orders.map(order => order.deliveryMethod).filter(id => id !== null);
      if (deliveryMethodIds.length > 0) {
        await Order.update(
          { deliveryMethod: null },
          { where: { userId: userId } }
        );
        await AddressOrder.destroy({
          where: { id: deliveryMethodIds }
        });
      }
    
    const nbUpdated = await User.update(
      {
        firstname: 'Anonymous',
        lastname: 'Anonymous',
        role: 'anonymous',
        email: null,
        phone: null,
        dashboard: null,
        active: false
      },
      {
        where: {
          id: userId,
        },
      }
    );

    res.sendStatus(nbUpdated[0] === 1 ? 200 : 404);
  }
  } catch (e) {
    next(e);
  }
});

router.put("/:id", checkAuth, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    if(!userId || ( userId !== req.user.id && req.user.role !== 'admin')) return res.sendStatus(403);

    const nbDeleted = await User.destroy({
      where: {
        id: userId,
      },
    });
    
    const user = await User.create({
      ...req.body,
      id: userId,
    });

    res.status(nbDeleted ? 200 : 201).json(user);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
