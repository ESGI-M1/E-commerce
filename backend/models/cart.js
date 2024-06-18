const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class Cart extends Model {
    
    static associate(models) {
      Cart.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
      Cart.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product',
      });
      Cart.belongsTo(models.PromoCode, {
        foreignKey: 'promoCodeId',
        as: 'promoCode',
      });
    }
  }

  Cart.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
      },
      promoCodeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'PromoCodes',
          key: 'id',
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: DataTypes.ENUM('en attente', 'livré', 'payé'),
        allowNull: false,
        defaultValue: 'en attente',
      },
    },
    {
      sequelize: connection,
      modelName: 'Cart',
      tableName: 'carts',
    }
  );

  return Cart;
};
