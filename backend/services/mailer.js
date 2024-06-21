const nodemailer = require('nodemailer');
//import { config } from '@vue-email/compiler';
const compiler = require('@vue-email/compiler');

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

async function sendEmail(title, content, templateName, receiver, subject) {
  const template = await vueEmail.render(templateName, {
    props: {
      title: title,
      body: content
    },
  });

  mailOptions = {
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

module.exports = { sendConsecutiveConnexionError }