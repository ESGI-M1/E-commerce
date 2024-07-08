const { Router } = require("express");
const { AddressOrder } = require("../models");
const router = new Router();
const checkAuth = require("../middlewares/checkAuth");
const checkRole = require("../middlewares/checkRole");

router.get("/", checkRole({ roles: "admin" }), async (req, res) => {
    const address = await AddressOrder.findAll();
    res.json(address);
});

router.get("/:id", checkAuth, async (req, res) => {
  const id = parseInt(req.params.id);

  const address = await AddressOrder.findOne({
    where: {
      id: id,
    },
  });
  res.json(address);
});

router.post("/", async (req, res) => {
      const { street, postalCode, city, country } = req.body;
      const newAddress = await AddressOrder.create({
        street: street,
        postalCode: postalCode,
        city: city,
        country: country,
      });
      res.status(201).json(newAddress);
  });
  

module.exports = router;