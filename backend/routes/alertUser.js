const { Router } = require("express");
const { User, AlertUser, Alert, AlertUserProduct } = require("../models");
const mailer = require('../services/mailer');
const router = new Router();

router.get("/", async (req, res) => {
  const alerts = await Alert.findAll();
  res.json(alerts);
});

router.get("/user/:userId", async (req, res, next) => {
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

router.get("/:id/user/:userId", async (req, res, next) => {
  try {
    const alertUser = await AlertUser.findOne({
      where: {
        alert_id: req.params.id,
        user_id: req.params.userId
      }
    });

    if (!alertUser) {
      return res.sendStatus(404);
    } else {
      const alertsUserProduct = await AlertUserProduct.findAll( {
        where: {
          alertUserId: alertUser.id
        }
      });

      if (!alertsUserProduct) {
        res.sendStatus(404);
      } else {
        res.json(alertsUserProduct);
      }
    }
  } catch (e) {
    next(e);
  }
});

router.get("/:id/user/:userId/product/:productId", async (req, res, next) => {
  try {
    const alertUser = await AlertUser.findOne({
      where: {
        alert_id: req.params.id,
        user_id: req.params.userId
      }
    });

    if (!alertUser) { return res.sendStatus(404); }
    else {
      try {
        const alertUserProduct = await AlertUserProduct.findOne({
          where: {
            alertUserId: alertUser.id,
            productId: req.params.productId
          }
        });
        if (!alertUserProduct) {
          res.sendStatus(404);
        } else {
          res.json(alertUserProduct);
        }
      } catch (e) {res.sendStatus(404);}
    }

  } catch (e) {
    next(e);
  }
});

router.post("/:id/user/:userId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const alertId = req.params.id;

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
      res.sendStatus(201);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/user/:userId/product/:productId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const alertId = req.params.id;
    const productId = req.params.productId;

    let alertUser = await AlertUser.findOne({
      where: {
        alert_id: alertId,
        user_id: userId
      }
    });

    if (!alertUser) {
      alertUser = await AlertUser.create({
        user_id: userId,
        alert_id: alertId
      });
    }

    await AlertUserProduct.create({
      alertUserId: alertUser.id,
      productId: productId
    });
    res.sendStatus(201);

  } catch (e) {
    next(e);
  }
});

router.delete("/:id/user/:userId", async (req, res, next) => {
  try {
    const deletedAlert = await AlertUser.destroy({
      where: {
        user_id: req.params.userId,
        alert_id: req.params.id
      },
    });

    if (deletedAlert === 1) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
});

router.delete("/:id/user/:userId/product/:productId", async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const alertId = req.params.id;
    const productId = req.params.productId;

    let alertUser = await AlertUser.findOne({
      where: {
        alert_id: alertId,
        user_id: userId
      }
    });

    const alertUserProduct = await AlertUserProduct.findOne({
      where: {
        alertUserId: alertUser.id,
        productId: productId
      }
    });

    if (alertUserProduct) {
      const alertUserProduct = await AlertUserProduct.destroy({
        where: {
          alertUserId: alertUser.id,
          productId: productId
        }
      });
      if (alertUserProduct === 1) {
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }

});
module.exports = router;