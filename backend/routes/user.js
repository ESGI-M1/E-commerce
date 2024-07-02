const { Router } = require("express");
const { User, AddressUser } = require("../models");
const router = new Router();
const jwt = require("jsonwebtoken");
const checkRole = require("../middlewares/checkRole");
const checkAuth = require("../middlewares/checkAuth");
const { nb } = require("date-fns/locale");

router.get("/", checkRole({ roles: "admin" }), async (req, res, next) => {

    const users = await User.findAll({
      where: req.query,
    });

    res.json(users);
});

router.post("/", async (req, res, next) => {
  const { code, startDate, endDate, discountPercentage } = req.body;

  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }
    next(e);
  }
});

router.get("/:id", checkAuth, async (req, res) => {

    const userId = parseInt(req.params.id);

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

router.delete("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
  try {

    const nbDeleted = await User.destroy({
      where: {
        id: parseInt(req.params.id),
      },
    });

    res.sendStatus(nbDeleted === 1 ? 200 : 404);
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
