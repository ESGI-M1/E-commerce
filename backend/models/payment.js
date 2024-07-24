const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class PaymentMethod extends Model {
    static associate(models) {
      PaymentMethod.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
      });
    }
  }

  PaymentMethod.init(
    {
      paymentId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id',
        },
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cardLast4: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '4242',
      },
      cardBrand: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      receiptUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize: connection,
      modelName: 'PaymentMethod',
      tableName: 'PaymentMethods',
    }
  );

  return PaymentMethod;
};
