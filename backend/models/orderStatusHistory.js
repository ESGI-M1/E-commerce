const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class OrderStatusHistory extends Model {
    static associate(models) {
      OrderStatusHistory.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
      });

      OrderStatusHistory.belongsTo(models.OrderStatus, {
        foreignKey: 'statusId',
        as: 'orderStatus',
      });
    }
  }

  OrderStatusHistory.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id',
        },
      },
      statusId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'OrderStatus',
          key: 'id',
        },
      },
      changeDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize: connection,
      modelName: 'OrderStatusHistory',
      tableName: 'OrderStatusHistory',
      timestamps: false,
    }
  );

  return OrderStatusHistory;
};
