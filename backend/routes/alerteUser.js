const { Router } = require("express");
const { User, AlerteUser, Alerte } = require("../models");
const mailer = require('../services/mailer');
const router = new Router();

router.get("/", async (req, res) => {
  const alertes = await Alerte.findAll();
  res.json(alertes);
});

router.get("/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const userAlertsIds = await AlerteUser.findAll({
      where: {
        user_id: userId
      },
    });

    const userAlerts = [];
    for (let i = 0; i < userAlertsIds.length; i++) {
      userAlerts.push(userAlertsIds[i].alerte_id);
    }

    res.json(userAlerts);
  } catch (e) {
    next(e);
  }
});

router.post("/:userId/:id", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const alertId = req.params.id;

    const deletedAlert = await AlerteUser.destroy({
      where: {
        user_id: userId,
        alerte_id: alertId
      },
    });

    if (deletedAlert === 1) {
      res.status(204);
    } else {
      await AlerteUser.create({
        user_id: userId,
        alerte_id: alertId
      });
      const alerte = await Alerte.findOne({
        where: {
          id: alertId
        }
      });
      if (alerte.name === 'news_letter') {
        const user = await User.findOne({
          where: {
            id: userId
          }
        })
        mailer.sendNewsLetterInscription(user);
      }
      res.status(201);
    }
  } catch (e) {
    next(e);
    res.status(500);
  }
});

module.exports = router;