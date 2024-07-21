const { Router } = require('express');
const { Cookie, CookieUser } = require("../models");
const router = new Router();

router.get('/', async (req, res) => {
  const cookies = await Cookie.findAll();
  res.status(200).json(cookies);
});

router.get('/user/:userId', async (req, res, next) => {
  try {
    const userCookies = [];
    const cookies = await Cookie.findAll();
    let cookieUser;
    for (let i=0; i < cookies.length; i++) {
      cookieUser = await CookieUser.findOne({
        where: {
          cookie_id: cookies[i].id,
          user_id: req.params.userId
        }
      });
      if (cookieUser) {
        userCookies.push(cookieUser);
      }
    }
    if (userCookies.length === 0) {return res.sendStatus(404);}
    res.json(userCookies);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/user/:userId', async (req, res, next) => {
  try {
    const cookie = await Cookie.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!cookie) { return res.sendStatus(404); }
    const cookieUser = await CookieUser.findOne({
      where: {
        cookie_id: cookie.id,
        user_id: req.params.userId
      }
    });
    if (!cookieUser) {
      res.sendStatus(404);
    } else {
      res.status(200).json(cookieUser);
    }
  }
  catch (e) {
    next(e);
  }
});

router.post('/:id/user/:userId', async (req, res, next) => {
  try {
    const cookie = await Cookie.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!cookie) { return res.sendStatus(404); }

    try {
      const cookieUser = await CookieUser.create({
        cookie_id: cookie.id,
        user_id: req.params.userId
      });

      res.sendStatus(201).json(cookieUser);
    } catch (e) { res.sendStatus(200) }
  }
  catch (e) {
    next(e);
  }
});

router.delete('/:id/user/:userId', async (req, res, next) => {
  try {
    const cookie = await Cookie.findOne({
      where: {
        id: req.params.id
      }
    });
    if (!cookie) { return res.sendStatus(404); }

    const cookieUserDeleted = await CookieUser.destroy({
      where: {
        cookie_id: cookie.id,
        user_id: req.params.userId
      }
    });

    if (cookieUserDeleted === 1) {res.sendStatus(204);}
    res.sendStatus(404);
  }
  catch (e) {
    next(e);
  }
});

module.exports = router;