'use strict';

//npx sequelize-cli migration:generate --name users

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isAlpha: true,
        },
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isAlpha: true,
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          notEmpty: true,
          isEmail: true,
        },
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          is: /^(\+33[1-9]\d{8}|0\d{9})$/,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
          notEmpty: true,
          min: 8,
          max: 32,
        },
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      role: {
        type: Sequelize.ENUM("user", "admin", "temp", "store", "anonymous"),
        allowNull: false,
        defaultValue: "user",
      },
      dashboard: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      lastPasswordUpdate: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};
