const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class ReturnProduct extends Model {
    static associate(models) {
      ReturnProduct.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
      });
      ReturnProduct.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      ReturnProduct.belongsTo(models.ProductVariant, {
        foreignKey: 'productVariantId',
        as: 'ProductVariants',
      });
    }
  }

  ReturnProduct.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        },
        productVariantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ProductVariants',
            key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM('returned', 'processing'),
        allowNull: false,
        defaultValue: 'processing',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deliveryMethod: {
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
    {
      sequelize: connection,
      modelName: 'ReturnProduct',
      tableName: 'ReturnProducts',
      timestamps: true,
    }
  );

  return ReturnProduct;
};
