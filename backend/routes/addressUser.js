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

router.post("/:id", checkAuth, async (req, res, next) => { // TODO remove id
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.sendStatus(404);

    const newAddress = await AddressUser.create({
      street: req.body.street,
      postalCode: req.body.postalCode,
      city: req.body.city,
      country: req.body.country,
      userId: user.id,
    });

    res.status(201).json(newAddress);
  } catch (e) {
    next(e);
  }
});
  
router.put("/:id", checkAuth, async (req, res, next) => { // TODO remove id
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.sendStatus(404);

    const address = await AddressUser.findOne({
      where: { userId: user.id } // Utilisation de userId au lieu de UserId
    });

    if (!address) {
      return res.sendStatus(404);
    }

    const [nbUpdated, updatedAddress] = await AddressUser.update(req.body, {
      where: {
        id: address.id,
      },
      returning: true,
    });

    nbUpdated === 1 ? res.json(updatedAddress[0]) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});
  
router.delete("/:id", checkAuth, async (req, res) => { // TODO remove id
  try {
    const deletedAddress = await AddressUser.destroy({
      where: {
        id: req.user.id,
      },
    });

    deletedAddress ? res.sendStatus(204) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
