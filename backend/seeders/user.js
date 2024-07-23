'use strict';

const bcrypt = require("bcryptjs");
const { User } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('Password123**', 10);

    await User.create({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      phone: '+33123456789',
      password: hashedPassword,
      active: true,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await User.create({
      firstname: 'Admin',
      lastname: 'User',
      email: 'admin@example.com',
      phone: '+33098765432',
      password: hashedPassword,
      active: true,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  },

  down: async (queryInterface, Sequelize) => {
    await User.destroy({ where: { role: ['user', 'admin'] } });
  }
};
