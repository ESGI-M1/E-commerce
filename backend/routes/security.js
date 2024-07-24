const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const mailer = require('../services/mailer');
const { setTimeout: setTimeoutPromise } = require('node:timers/promises');
const { Op } = require('sequelize');

const router = new Router();

let loginAttempt = {};
let timerActivate = false;
router.post("/login", async (req, res) => {
  const user = await User.findOne({
    attributes: ['id', 'firstname', 'email', 'password', 'role', 'active'],
    where: {
      email: req.body.email,
      active: true,
      role: { [Op.ne]: 'anonymous' }
    },
  });

  if (!user) return res.sendStatus(401);
  if (timerActivate) {
    return res.sendStatus(429);
  }
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    if (loginAttempt[user.id]) {

      loginAttempt[user.id] += 1
      if (loginAttempt[user.id] === 3) {
        try {
          timerActivate = true;
          loginAttempt[user.id] = 0;
          mailer.sendConsecutiveConnexionError(user);
          setTimeoutPromise(900000)
            .then(() => {
              timerActivate = false;
            });
        } catch (error) {
          console.log(error);
        }
      }

    } else {
      loginAttempt[user.id] = 1;
    }
    return res.sendStatus(401);
  }

  if (!user.active) {
    mailer.sendConnexionWithoutConfirmAccount(user);
    return res.sendStatus(401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      purpose: 'authentication',
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30 days",
      algorithm: "HS256",
    }
  );

  res.cookie("JWT", token, {
    httpOnly: true,
    signed: true,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  })

  res.cookie("USER", { id: user.id, role: user.role },
    {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    }
  );

  return res.sendStatus(200);

});

router.post("/forgot-password", async (req, res, next) => {

  const user = await User.findOne({
    attributes: ['id', 'firstname', 'email'],
    where: {
      email: req.body.email,
    },
  });

  if(user){
    try{
      mailer.sendResetPassword(user);
    }
    catch(e){
      next(e)
    }
  }

  return res.sendStatus(200);

});

router.post('/reset-password', async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDecoded || tokenDecoded.purpose !== 'reset-password') {
      return res.sendStatus(400);
    }

    const user = await User.findByPk(tokenDecoded.id);

    if (!user) {
      return res.sendStatus(400);
    }

    await user.update({ password : password });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});


router.post("/confirm-address", async (req, res, next) => {
  const token = req.body.token;

  try {
    const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(tokenDecoded);

    if (!tokenDecoded || tokenDecoded.purpose !== "confirm_address") {
      return res.sendStatus(400);
    } 

    await User.update({active: true}, {
      where: {
        id: tokenDecoded.id,
      }
    });

    res.sendStatus(201);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
