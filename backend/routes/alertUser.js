const { Router } = require("express");
const { User, AlertUser, Alert } = require("../models");
const mailer = require('../services/mailer');
const router = new Router();

router.get("/", async (req, res) => {
  const alerts = await Alert.findAll();
  res.json(alerts);
});

router.get("/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const userAlertsIds = await AlertUser.findAll({
      where: {
        user_id: userId
      },
    });

    const userAlerts = [];
    for (let i = 0; i < userAlertsIds.length; i++) {
      userAlerts.push(userAlertsIds[i].alert_id);
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

    const deletedAlert = await AlertUser.destroy({
      where: {
        user_id: userId,
        alert_id: alertId
      },
    });

    if (deletedAlert === 1) {
      res.status(204);
    } else {
      await AlertUser.create({
        user_id: userId,
        alert_id: alertId
      });
      const alert = await Alert.findOne({
        where: {
          id: alertId
        }
      });
      if (alert.name === 'news_letter') {
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