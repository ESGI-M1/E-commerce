const { Model, DataTypes } = require('sequelize');

module.exports = function(connection) {
    class CartProduct extends Model {
        static associate(models) {
            CartProduct.belongsTo(models.Cart, { foreignKey: 'cartId', as: 'cart', onDelete: 'CASCADE' });
            CartProduct.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId', as: 'productVariant', onDelete: 'CASCADE' });
        }
    }

    CartProduct.init(
        {
            cartId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Carts',
                    key: 'id'
                }
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1
            }
        },
        {
            sequelize: connection,
            modelName: 'CartProduct',
            tableName: 'CartProducts',
            timestamps: true
        }
    );

    return CartProduct;
};
