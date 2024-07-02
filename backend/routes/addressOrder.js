const { Router } = require("express");
const { AddressOrder } = require("../models");
const router = new Router();

router.get("/", async (req, res) => {
    const address = await AddressOrder.findAll();
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