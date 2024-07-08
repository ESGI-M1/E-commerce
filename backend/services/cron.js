var cron = require('node-cron');
const mailer = require('./mailer');
const { User } = require('../models');

// every 1st day of month, check if users last password modification are later than 60 days
module.exports = cron.schedule('0 0 1 * *', async () => {
    try {
      const users = await User.findAll();
      for (let user of users) {
        let actualDate = new Date();
        let lastUpdate = user.lastPasswordUpdate;
        lastUpdate.setDate(lastUpdate.getDate() + 60);
        if (lastUpdate < actualDate) {
          await mailer.sendPasswordTooOld(user);
        }
      }
    } catch (e) {
      console.log("Error while getting users");
    }
  })