const { Model, DataTypes } = require("sequelize");

module.exports = function (sequelize) {
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
    },
    { sequelize }
  );

  return AddressUser;
};
