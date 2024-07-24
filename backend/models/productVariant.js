const { Model, DataTypes } = require("sequelize");
const { denormalizeRelatedProducts } = require("../dtos/denormalization/product");

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

        static addHooks(models) {
            ProductVariant.addHook("afterCreate", async (productVariant) => {
                await denormalizeRelatedProducts(productVariant, models);
            });

            ProductVariant.addHook("afterUpdate", async (productVariant, { fields }) => {
                if (fields.includes("price") || fields.includes("name") || fields.includes("active") || fields.includes("stock")) {
                    await denormalizeRelatedProducts(productVariant, models);
                }
            });

            ProductVariant.addHook("afterDestroy", async (productVariant) => {
                await denormalizeRelatedProducts(productVariant, models);
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
                type: DataTypes.DECIMAL(10, 2),
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
