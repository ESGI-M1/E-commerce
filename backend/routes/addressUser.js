const { Router } = require("express");
const { AddressUser, User } = require("../models");
const router = new Router();

router.get("/", async (req, res) => {
    const address = await AddressUser.findAll();
    res.json(address);
});

router.post("/:id", async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.sendStatus(404);
      }
  
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
  
  router.put("/:id", async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.sendStatus(404);
      }
  
      const address = await AddressUser.findOne({
        where: { userId: user.id } // Utilisation de userId au lieu de UserId
      });
  
      if (!address) {
        return res.sendStatus(404);
      }
  
      address.street = req.body.street;
      address.postalCode = req.body.postalCode;
      address.city = req.body.city;
      address.country = req.body.country;
      await address.save();
  
      res.json(address);
    } catch (e) {
      next(e);
    }
  });
  
  router.delete("/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      const deletedAddress = await AddressUser.destroy({
        where: {
          id: id,
        },
      });
  
      if (deletedAddress === 1) {
        res.status(204).send(); // 204 No Content si la suppression réussit
      } else {
        res.status(404).send({ error: "Adresse non trouvée" });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'adresse :", error);
      res.status(500).send({ error: "Erreur lors de la suppression de l'adresse" });
    }
  });

module.exports = router;
