const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class OrderStatus extends Model {}

  OrderStatus.init(
    {
        name: {
            type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending',
        },
    },
    {
      sequelize: connection,
      modelName: 'OrderStatus',
      tableName: 'OrderStatus',
      timestamps: false,
    }
  );

  return OrderStatus;
};
