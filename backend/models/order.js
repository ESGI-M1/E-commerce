const { Model, DataTypes } = require('sequelize');
const denormalizeOrder = require('../dtos/denormalization/order');

module.exports = function (connection) {
  class Order extends Model {

    static associate(models) {

      Order.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });

      models.User.hasMany(models.Order, {
        foreignKey: 'userId',
        as: 'orders',
      });

      Order.hasMany(models.Cart, {
        foreignKey: 'orderId',
        as: 'carts',
      });
      
      Order.belongsTo(models.AddressOrder, {
        foreignKey: 'deliveryMethod',
        as: 'addressOrder',
      });

      Order.belongsTo(models.BillingAddress, {
        foreignKey: 'billingAddressId',
        as: 'billingAddress',
      });

      Order.hasOne(models.PaymentMethod, {
        foreignKey: 'orderId',
        as: 'paymentMethod',
      });
    }

    static addHooks(models) {
      
      Order.addHook("afterCreate", (order) =>
        denormalizeOrder(order, models)
      );

      Order.addHook("afterUpdate", (order, { fields }) => {
        if (fields.includes("totalAmount") || fields.includes("status") || fields.includes("deliveryDate") || fields.includes("deliveryMethod")) {
          denormalizeOrder(order, models);
        }
      });

      Order.addHook("afterDestroy", (order) =>
        denormalizeOrder(order, models)
      );
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
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      deliveryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deliveryMethod: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'AddressOrders',
          key: 'id',
        },
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
    {
      sequelize: connection,
      modelName: 'Order',
      tableName: 'Orders',
      timestamps: true,
    }
  );

  return Order;
};
