'use strict';

const { PromoCode } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await PromoCode.create({
      code: 'SUMMER2024',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      discountPercentage: 15,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await PromoCode.create({
      code: 'WINTER2024',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      discountPercentage: 20,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await PromoCode.create({
      code: 'SPRINGSALE2024',
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      discountPercentage: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await PromoCode.create({
      code: 'FALL2024',
      startDate: '2024-09-01',
      endDate: '2024-11-30',
      discountPercentage: 25,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  },

  down: async (queryInterface, Sequelize) => {
    await PromoCode.destroy({ where: {} });
  }
};
