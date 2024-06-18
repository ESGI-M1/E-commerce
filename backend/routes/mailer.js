const { Router } = require("express");
const nodemailer = require('nodemailer');
const router = new Router();
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE,
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: true,
  auth: {
    user: process.env.MAILER_ADDRESS,
    pass: process.env.MAILER_PASSWORD
  }
});

// Email options
const mailOptions = {
  from: 'dabh45@gmail.com',
  to: 'dabh45@gmail.com',
  subject: 'Envoi test',
  text: 'Coucou je suis un mail test'
};

router.get("/", async (req, res) => {
  // template
  // compile avec les args
  await transporter.sendMail(mailOptions);

  //res.status(200);
  return res.json({message:"envoyé"});
});

router.get("/reset-mdp", async (req, res) => {
  await transporter.sendMail(mailOptions);
  return res.json({message:"reset-mdp"});
});

router.get("/tentative-connexion", async (req, res) => {
  await transporter.sendMail(mailOptions);
  return res.json({message:"tentative connexion"});
});

router.get("/demande-renouvellement-mdp", async (req, res) => {
  await transporter.sendMail(mailOptions);
  return res.json({message:"demande renouvellement mdp"});
});

router.get("/nv-produit", async (req, res) => {
  await transporter.sendMail(mailOptions);
  return res.json({message:"nv produit"});
});

router.get("/restock-produit", async (req, res) => {
  await transporter.sendMail(mailOptions);
  return res.json({message:"restock produit"});
});

router.get("/changement-prix", async (req, res) => {
  await transporter.sendMail(mailOptions);
  return res.json({message:"changement prix"});
});

router.get("/inscription-newsletter", async (req, res) => {
  await transporter.sendMail(mailOptions);
  return res.json({message:"inscription newsletter"});
});

router.get("/fin-stock", async (req, res) => {
  await transporter.sendMail(mailOptions);
  return res.json({message:"fin stock"});
});

module.exports = router;