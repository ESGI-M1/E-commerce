const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const mailer = require('../services/mailer');
const denormalizeUser = require('../dtos/denormalization/user');

module.exports = function (connection) {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.AddressUser, { foreignKey: "userId", as: "deliveryAddress" });
    }
    static addHooks(models) {
      User.addHook("beforeCreate", async (user) => {
        user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
        user.lastPasswordUpdate = Date.now();
      });
    
      User.addHook("beforeUpdate", async (user, options) => {
        if (options.fields.includes("password")) {
          user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
          user.lastPasswordUpdate = Date.now();
        }

        if(options.fields.includes("dashboard") && user.role !== 'admin') {
          user.dashboard = null;
        }

      });

      User.addHook("afterCreate", async (user) => {
        mailer.sendValidateInscription(user);
        await denormalizeUser(user, models);
      });

      User.addHook("afterUpdate", async (user, { fields }) => {
        if (fields.includes("firstname") || fields.includes("lastname") || fields.includes("email") || fields.includes("phone") || fields.includes("role") || fields.includes("active")) {
          await denormalizeUser(user, models);
        }
      });
    }
  }

  User.init(
    {
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isAlpha: true,
        },
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          isAlpha: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          notEmpty: true,
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^(\+33[1-9]\d{8}|0\d{9})$|/,
        },
      }, 
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
          notEmpty: true,
          min: 8,
          max: 32,
        },
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      role: {
        type: DataTypes.ENUM("user", "admin", "temp", "store", "anonymous"),
        allowNull: false,
        defaultValue: "user",
      },
      dashboard: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      lastPasswordUpdate: {
        type: DataTypes.DATE
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    { sequelize: connection, timestamps: true}
  );

  return User;
}

