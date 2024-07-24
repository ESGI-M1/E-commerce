const { Router } = require("express");
const { NewsLetter } = require("../models");
const checkRole = require('../middlewares/checkRole')
const router = new Router();

router.get("/", async (req, res) => {
  const newsLetters = await NewsLetter.findAll();
  res.json(newsLetters);
});

router.post("/", checkRole({ roles: "admin" }), async (req, res, next) => {
  try {
    const newsletterData = req.body;
    const newsletter = await NewsLetter.create(newsletterData);
    res.status(201).json(newsletter);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
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

router.delete("/:id", checkRole({ roles: "admin" }), async (req, res, next) => {
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