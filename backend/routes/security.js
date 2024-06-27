const { Router } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const mailer = require('../services/mailer');

const router = new Router();
let tentativeConnexion = {};

router.post("/login", async (req, res) => {
  const user = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (!user) return res.sendStatus(401);
  if (!(await bcrypt.compare(req.body.password, user.password))) {
    if (tentativeConnexion[user.id]) {
      tentativeConnexion[user.id] += 1
      if (tentativeConnexion[user.id] === 3) {
        try {
          mailer.sendConsecutiveConnexionError(user);
        } catch (e) {
          console.log("Error sending email : " + e);
        }
      }
    } else {
      tentativeConnexion[user.id] = 1;
    }
    return res.sendStatus(401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30 days",
      algorithm: "HS256",
    }
  );

  if (!user.active) {
    mailer.sendConnexionWithoutConfirmAccount(user);
  }

  res.cookie("JWT", token, {
    httpOnly: true,
    signed: true,
  });

  res.json(user);
});

module.exports = router;
