const { Router } = require("express");
const { User, AddressUser } = require("../models");
const router = new Router();
const mailer = require('../services/mailer');
const jwt = require("jsonwebtoken");


router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
    order: [
        ['lastname', 'ASC'],
        ['firstname', 'ASC']
      ],  });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Unable to fetch users' });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    mailer.sendValidateInscription(user);
    res.status(201).json(user);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }
    next(e);
  }
});

router.get("/:id", async (req, res) => {
    const userId = req.params.id;
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

router.patch("/:id", async (req, res, next) => {
  try {
    const [nbUpdated, users] = await User.update(req.body, {
      where: {
        id: parseInt(req.params.id, 10),
      },
      individualHooks: true,
      returning: true,
    });
    if (nbUpdated ? res.json(users[0]) : res.sendStatus(404));
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const nbDeleted = await User.destroy({
      where: {
        id: id,
      },
    });
    res.sendStatus(nbDeleted === 1 ? 200 : 404);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const nbDeleted = await User.destroy({
      where: {
        id: parseInt(req.params.id),
      },
    });
    const user = await User.create({
      ...req.body,
      id: parseInt(req.params.id),
    });
    res.status(nbDeleted ? 200 : 201).json(user);
  } catch (e) {
    next(e);
  }
});

router.get("/confirm-address/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!tokenDecoded || tokenDecoded.operation !== "confirm_address") {
      return res.sendStatus(406);
    } else {
      User.update({active: true}, {
        where: {
          id: tokenDecoded.id,
        }
      });
      return res.sendStatus(201);
    }
  } catch (e) {
    return res.sendStatus(406);
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const token = req.body.token;
    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!tokenDecoded || tokenDecoded.operation !== "reset-password") {
      return res.sendStatus(406);
    } else {
      await User.update({password: req.body.password },
        {
          where: {
            id: tokenDecoded.id
          },
          individualHooks: true
        });
      return res.sendStatus(201);
    }
  } catch (e) {
    return res.sendStatus(406);
  }
});

module.exports = router;
