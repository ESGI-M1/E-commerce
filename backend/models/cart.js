const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
    class Cart extends Model {
        static associate(models) {
            Cart.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
            Cart.belongsTo(models.PromoCode, {
                foreignKey: 'promoCodeId',
                as: 'promoCode',
            });
            Cart.hasMany(models.CartProduct, {
                foreignKey: 'cartId',
                as: 'CartProducts',
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
            promoCodeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'PromoCodes',
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
            modelName: 'Cart',
            tableName: 'carts',
            timestamps: true,
        }
    );

    return Cart;
};
