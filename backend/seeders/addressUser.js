'use strict';

const { AddressUser, User } = require('../models');  

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await User.findAll();

    for (const user of users) {
      await AddressUser.create({
        street: '123 Main St',
        postalCode: '75001',
        city: 'Paris',
        country: 'France',
        userId: user.id, 
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await AddressUser.create({
        street: '456 Elm St',
        postalCode: '69002',
        city: 'Lyon',
        country: 'France',
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await AddressUser.destroy({ where: {} });
  }
};
