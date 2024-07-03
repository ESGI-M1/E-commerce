const { Router } = require("express");
const { AddressUser, User } = require("../models");
const checkAuth = require("../middlewares/checkAuth");
const router = new Router();

router.get("/", checkAuth, async (req, res) => {
    const address = await AddressUser.findAll({
      where: { userId: req.user.id },
    });
    res.json(address);
});

router.get("/:id", checkAuth, async (req, res) => {
  const id = parseInt(req.params.id);

  const address = await AddressUser.findOne({
    where: {
      id: id,
      userId: req.user.id,
    },
  });
  res.json(address);
});

router.post("/", checkAuth, async (req, res, next) => {
  try {
    const newAddress = await AddressUser.create({
      street: req.body.street,
      postalCode: req.body.postalCode,
      city: req.body.city,
      country: req.body.country,
      userId: req.user.id,
    });

    res.status(201).json(newAddress);
  } catch (e) {
    next(e);
  }
});
  
router.put("/:id", checkAuth, async (req, res, next) => {
  const id = parseInt(req.params.id);
  try {
    const [nbUpdated, updatedAddress] = await AddressUser.update(req.body, {
      where: {
        id: id,
        userId: req.user.id,
      },
      returning: true,
    });

    nbUpdated === 1 ? res.json(updatedAddress[0]) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});
  
router.delete("/:id", checkAuth, async (req, res) => { 
  const id = parseInt(req.params.id);
  try {
    const deletedAddress = await AddressUser.destroy({
      where: {
        id: id,
        userId: req.user.id,
      },
    });

    deletedAddress === 1 ? res.sendStatus(204) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
