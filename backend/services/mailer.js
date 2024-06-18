const nodemailer = require('nodemailer');

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
let mailOptions = {
  from: process.env.MAILER_SERVICE,
  to: 'dabh45@gmail.com',
  subject: 'Envoi test',
  text: 'Coucou je suis un mail test'
};

async function envoiTest() {
  await transporter.sendMail(mailOptions);
}

module.exports = { envoiTest }