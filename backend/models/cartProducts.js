const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
    class CartProduct extends Model {
        static associate(models) {
            CartProduct.belongsTo(models.Cart, {
                foreignKey: 'cartId',
                as: 'cart',
            });
            CartProduct.belongsTo(models.Product, {
                foreignKey: 'productId',
                as: 'product',
            });
        }
    }

    CartProduct.init(
        {
            cartId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'carts',
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
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
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
            modelName: 'CartProduct',
            tableName: 'CartProducts',
            timestamps: true,
        }
    );

    return CartProduct;
};
