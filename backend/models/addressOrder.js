const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class AddressOrder extends Model {
  }

  AddressOrder.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
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
    { sequelize: connection }
  );

  return AddressOrder;
};
