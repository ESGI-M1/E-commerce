const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class BillingAddress extends Model {
  }

  BillingAddress.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
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
    {
      sequelize: connection,
      modelName: 'BillingAddress',
      tableName: 'BillingAddress',
      timestamps: true,
    }
  );

  return BillingAddress;
};
