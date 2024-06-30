const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      Order.hasMany(models.Cart, {
        foreignKey: 'orderId',
        as: 'carts',
      });
      Order.belongsTo(models.AdressOrder, {
        foreignKey: 'deliveryMethod',
        as: 'adressOrder',
        allowNull: false,
      });
    }
  }

  Order.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      deliveryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deliveryMethod: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'AdressOrders',
          key: 'id',
        },
      },
    },
    {
      sequelize: connection,
      modelName: 'Order',
      tableName: 'Orders',
    }
  );

  return Order;
};
