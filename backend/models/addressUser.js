const { Model, DataTypes } = require("sequelize");

module.exports = function (connection) {
  class AddressUser extends Model {}

  AddressUser.init(
    {
      street: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
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
    { sequelize: connection, timestamps: true, }
  );

  return AddressUser;
};
