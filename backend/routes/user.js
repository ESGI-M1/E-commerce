const { Router } = require("express");
const { User } = require("../models");
const router = new Router();

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
    res.status(201).json(user);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
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
    if (nbUpdated) res.json(users[0]);
    else res.sendStatus(404);
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
    res.json({ success: true });
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

module.exports = router;
