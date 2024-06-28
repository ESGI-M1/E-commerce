const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = function (connection) {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.AddressUser, { foreignKey: "userId", as: "deliveryAddress" });
    }
    static addHooks() {
      User.addHook("beforeCreate", async (user) => {
        user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
        user.lastPasswordUpdate = Date.now();
      });
    
      User.addHook("beforeUpdate", async (user, options) => {
        if (options.fields.includes("password")) {
          user.password = await bcrypt.hash(user.password, await bcrypt.genSalt(10));
          user.lastPasswordUpdate = Date.now();
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
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          isEmail: true,
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
        defaultValue: false
      },
      role: {
        type: DataTypes.ENUM("user", "admin", "temp", "store"),
        allowNull: false,
        defaultValue: "user",
      },
      lastPasswordUpdate: {
        type: DataTypes.DATE
      }
    },
    { sequelize: connection }
  );

  return User;
}

