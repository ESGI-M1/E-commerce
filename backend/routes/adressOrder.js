const { Router } = require("express");
const { AdressOrder } = require("../models");
const router = new Router();

router.get("/", async (req, res) => {
    const adress = await AdressOrder.findAll();
    res.json(adress);
});

router.post("/", async (req, res) => {
      const { street, postalCode, city, country } = req.body;
      const newAddress = await AdressOrder.create({
        street: street,
        postalCode: postalCode,
        city: city,
        country: country,
      });
      res.status(201).json(newAddress);
  });
  

module.exports = router;