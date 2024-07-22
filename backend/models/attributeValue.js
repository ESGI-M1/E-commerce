const { Model, DataTypes } = require("sequelize");
const { denormalizeRelatedProducts } = require("../dtos/denormalization/product");

module.exports = function(connection) {
    class AttributeValue extends Model {

        static associate(models) {
            AttributeValue.belongsTo(models.Attribute, { as: 'attribute', foreignKey: 'attributeId', onDelete: 'CASCADE' });
            AttributeValue.belongsToMany(models.ProductVariant, {
                through: 'ProductVariantAttributeValue',
                as: 'productVariants',
                foreignKey: 'attributeValueId'
            });
        }

        static addHooks(models) {
            AttributeValue.addHook("afterCreate", async (attributeValue) => {
                await denormalizeRelatedProducts(attributeValue, models);
            });

            AttributeValue.addHook("afterUpdate", async (attributeValue, { fields }) => {
                if (fields.includes("value")) {
                    await denormalizeRelatedProducts(attributeValue, models);
                }
            });

            AttributeValue.addHook("afterDestroy", async (attributeValue) => {
                await denormalizeRelatedProducts(attributeValue, models);
            });
        }

     }

     AttributeValue.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
        },
        {
            sequelize: connection,
            timestamps: true,
        }
    );

    return AttributeValue
};
