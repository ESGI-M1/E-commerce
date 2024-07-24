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

      Order.hasMany(models.OrderStatusHistory, {
        foreignKey: 'orderId',
        as: 'statusHistory',
      });
    }

    static async getStatusIdByName(name, models) {
      const status = await models.OrderStatus.findOne({
        where: { name }
      });
      if (status) {
        return status.id;
      }
      throw new Error(`OrderStatus with name '${name}' not found`);
    }

    static addHooks(models) {
      Order.addHook('afterCreate', async (order) => {
        try {
          const statusId = await Order.getStatusIdByName('pending', models);
          await models.OrderStatusHistory.create({
            orderId: order.id,
            statusId: statusId,
            changeDate: new Date(),
          });
          denormalizeOrder(order, models);
        } catch (error) {
          console.error('Error in afterCreate hook:', error);
        }
      });

      Order.addHook('afterUpdate', async (order, { fields }) => {
        try {
          if (fields.includes('totalAmount') || fields.includes('deliveryDate') || fields.includes('deliveryMethod')) {
            denormalizeOrder(order, models);
          }
        } catch (error) {
          console.error('Error in afterUpdate hook:', error);
        }
      });

      Order.addHook('afterDestroy', async (order) => {
        try {
          await denormalizeOrder(order, models);
        } catch (error) {
          console.error('Error in afterDestroy hook:', error);
        }
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
        allowNull: true,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
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
