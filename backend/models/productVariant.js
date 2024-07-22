const { Model, DataTypes } = require("sequelize");

module.exports = function(connection) {
    class ProductVariant extends Model {
        static associate(models) {
            ProductVariant.belongsTo(models.Product, { foreignKey: 'productId' });
            ProductVariant.belongsToMany(models.AttributeValue, {
                through: 'ProductVariantAttributeValue',
                as: 'attributeValues',
                foreignKey: 'productVariantId'
            });
        }
    }

    ProductVariant.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            reference: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    notEmpty: true,
                },
            },
            price: {
                type: DataTypes.DECIMAL,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    notEmpty: true,
                },
            },
            default: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize: connection,
            timestamps: true,
        }
    );

    return ProductVariant;
};
