const nodemailer = require('nodemailer');
//import { config } from '@vue-email/compiler';
const compiler = require('@vue-email/compiler');
const jwt = require('jsonwebtoken')
const { User } = require('../models');

const vueEmail = compiler.config('./services/emails');

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

async function sendEmail(title, content, templateName, receiver, subject, link, textLink, informativeline) {
  const template = await vueEmail.render(templateName, {
    props: {
      title: title,
      body: content,
      link: link,
      textLink: textLink,
      informativeline: informativeline,
    },
  });

  const mailOptions = {
    from: process.env.MAILER_SERVICE,
    to: receiver,
    subject: subject,
    html: template.html
  };

  await transporter.sendMail(mailOptions);
}

async function sendConsecutiveConnexionError(user) {
  const content = [
    "Bonjour " + user.firstname + ",",
    "Nous avons détecté 3 tentatives de connexion infructueuses à votre compte."
  ];
  await sendEmail(
    "Tentative de connexion",
    content,
    "Template.vue",
    user.email,
    "Tentative de connexion");
}

async function sendNewsLetterInscription(user) {
  const content = [
    "Bonjour " + user.firstname + ",",
    "Suite à votre demande, vous êtes désormais inscrit à notre newsletter. Désormais, vous recevrez nos différents articles."
  ];
  await sendEmail(
    "Inscription newsletter",
    content,
    "Template.vue",
    user.email,
    "Inscription newsletter");
}

async function sendNewsLetterArticle(user, title, content) {
  await sendEmail(
    title,
    content,
    "Template.vue",
    user.email,
    title);
}

async function sendNewProductNotification(user, product) {
  const content = ['Bonjour ' + user.firstname + ','];
  const categories = product.Categories;
  if (categories.length > 1) {
    let textCategories = "";
    for (let i=0; i<categories.length; i++) { textCategories += categories[i].name + ", "; }
    content.push('Découvrez dès maintenant notre nouvel arrivage "' + product.name + '" dans les catégories ' + textCategories + 'le prix du produit est de ' + product.price + '€');
  } else {
    content.push('Découvrez dès maintenant notre nouvel arrivage "' + product.name + '" dans la catégorie ' + categories[0].name + ' pour le prix de ' + product.price + '€');
  }

  await sendEmail(
    "Découvrez notre nouveau produit",
    content,
    "Template.vue",
    user.email,
    "Découvrez notre nouveau produit");
}

async function sendRestockNotification(user, product) {
  const content = [
    'Bonjour ' + user.firstname + ',',
    'Nous avons à nouveau du stock pour le produit suivant "' + product.name + '".'
  ];

  await sendEmail(
    "Restock de produit",
    content,
    "Template.vue",
    user.email,
    "Restock de produit");
}

async function sendPriceChangeNotification(user, product) {
  const content = [
    'Bonjour ' + user.firstname + ',',
    'Nous avons un changement de prix concernant le produit suivant "' + product.name + '", le nouveau prix est de ' + product.price + '€.'
  ];

  await sendEmail(
    "Changement de prix",
    content,
    "Template.vue",
    user.email,
    "Changement de prix");
}

async function sendValidateInscription(user) {
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      purpose: "confirm_address"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30 days",
      algorithm: "HS256",
    }
  );
  const link = process.env.BASE_URL + "/users/confirm-address/" + token;
  const textLink = "Confirmez votre adresse";
  const content = [
    "Bonjour " + user.firstname + ",",
    "Une demande de création de compte nous as été adressé, si vous êtes bien à l'origine de cette demande, veuillez cliquer sur le bouton ci-dessous."
  ];

  const informativeLine = "Le lien concernant la validation de votre compte expirera 30 jours après l'envoi de ce mail"

  await sendEmail(
    "Votre demande de création de compte",
    content,
    "Template.vue",
    user.email,
    "Votre demande de création de compte",
    link,
    textLink,
    informativeLine);
}

async function sendConnexionWithoutConfirmAccount(user) {
  const token = jwt.sign(
    {
      id: user.id,
      purpose: "reset-password"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30 days",
      algorithm: "HS256",
    }
  );
  const link = process.env.BASE_URL + "/reset-password/" + token;
  const textLink = "Réinitialiser mot de passe";

  const content = [
    "Bonjour " + user.firstname + ",",
    "Nous avons détecté une connexion sur votre compte alors que vous n'avez pas encore validé votre adresse mail.",
    "Si vous n'êtes pas à l'origine de cette connexion, veuillez modifier immédiatement votre mot de passe avec le bouton ci-dessous."
  ];

  const informativeLine = "Le lien concernant la réinitialisation de votre compte expirera 30 jours après l'envoi de ce mail"

  await sendEmail(
    "Information de connexion",
    content,
    "Template.vue",
    user.email,
    "Information de connexion",
    link,
    textLink,
    informativeLine
    );
}

async function sendResetPassword(user) {
  const token = jwt.sign(
    {
      id: user.id,
      purpose: "reset-password"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1 hour",
      algorithm: "HS256",
    }
  );
  const link = process.env.BASE_URL + "/reset-password/" + token;
  const textLink = "Réinitialiser mot de passe";

  const content = [
    "Bonjour " + user.firstname + ",",
    "Vous nous avez adressé une demande de renouvellement du mot de passe de votre compte.",
    "Pour le renouveler, veuillez cliquer sur le bouton ci-dessous"
  ];

  const informativeLine = "Le lien concernant la réinitialisation de votre compte expirera 1 heure après l'envoi de ce mail"

  await sendEmail(
    "Votre demande de renouvellement de votre mot de passe",
    content,
    "Template.vue",
    user.email,
    "Votre demande de renouvellement de votre mot de passe",
    link,
    textLink,
    informativeLine);
}

async function sendPasswordTooOld(user) {
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      purpose: "reset-password"
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30 days",
      algorithm: "HS256",
    }
  );
  const link = process.env.BASE_URL + "/users/reset-password/" + token;
  const textLink = "Réinitialiser mot de passe";

  const content = [
    "Bonjour " + user.firstname + ",",
    "La dernière actualisation de votre mot de passe à été faite il y a plus de 60jours.",
    "Pour des raisons de sécurité, veuillez le renouveler avec le lien ci-dessous."
  ];

  const informativeLine = "Le lien concernant la réinitialisation de votre compte expirera 30 jours après l'envoi de ce mail"

  await sendEmail(
    "Veuillez renouveller votre mot de passe",
    content,
    "Template.vue",
    user.email,
    "Veuillez renouveller votre mot de passe",
    link,
    textLink,
    informativeLine);
}

module.exports = {
  sendConsecutiveConnexionError,
  sendValidateInscription,
  sendConnexionWithoutConfirmAccount,
  sendResetPassword,
  sendPasswordTooOld,
  sendNewsLetterInscription,
  sendNewProductNotification,
  sendRestockNotification,
  sendNewsLetterArticle,
  sendPriceChangeNotification
}