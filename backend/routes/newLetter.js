const { Router } = require("express");
const { NewsLetter, AlertUser, Alert, User } = require("../models");
const mailer = require('../services/mailer')
const router = new Router();

router.get("/", async (req, res) => {
  const newsLetters = await NewsLetter.findAll();
  res.json(newsLetters);
});

router.post("/", async (req, res, next) => {
  try {
    const newsletterData = req.body;
    const newsletter = await NewsLetter.create(newsletterData);
    const idAlert = await Alert.findOne({
      where: {
        name: 'news_letter'
      }
    });
    if (idAlert) {
      const userToPrevent = await AlertUser.findAll({
        where: {
          alert_id: idAlert.id
        }
      });
      if (userToPrevent) {
        for (let i=0; i < userToPrevent.length; i++) {
          const user = await User.findByPk(userToPrevent[i].user_id);
          mailer.sendNewsLetterArticle(user, newsletter.title, newsletter.content);
        }
      }

    }
    res.status(201).json(newsletter);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const newsletterData = req.body;
    const newsletter = await NewsLetter.findByPk(parseInt(req.params.id));
    if (newsletter) {
      await newsletter.update(newsletterData);
      res.json(newsletter);
    } else {
      res.status(404);
    }
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const nbDeleted = await NewsLetter.destroy({
      where: {
        id: parseInt(req.params.id),
      },
    });
    if (nbDeleted === 1 ? res.sendStatus(204) : res.sendStatus(404));
  } catch (e) {
    next(e);
  }
});

module.exports = router;