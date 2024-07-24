const { Router } = require("express");
const { BillingAddress } = require("../models");
const router = new Router();
const checkAuth = require("../middlewares/checkAuth");

router.post("/", checkAuth, async (req, res) => {
  const { street, postalCode, city, country, firstname, lastname } = req.body;
  
  try {
    const user = req.user;

    const newAddress = await BillingAddress.create({
      firstName: firstname || user.firstname,
      lastName: lastname || user.lastname,
      street,
      postalCode,
      city,
      country,
    });

    res.status(201).json(newAddress);
  } catch (error) {
    console.error("Erreur lors de la création de l'adresse :", error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la création de l\'adresse' });
  }
});
  

module.exports = router;