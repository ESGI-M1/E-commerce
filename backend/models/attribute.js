const { Model, DataTypes } = require("sequelize");
const { denormalizeRelatedProducts } = require("../dtos/denormalization/product");

module.exports = function(connection) {
    class Attribute extends Model {

        static associate(models) {
            Attribute.hasMany(models.AttributeValue, { as: 'values', foreignKey: 'attributeId', onDelete: 'CASCADE' });
        }

        static addHooks(models) {
            Attribute.addHook("afterCreate", async (attribute) => {
                await denormalizeRelatedProducts(attribute, models);
            });

            Attribute.addHook("afterUpdate", async (attribute, { fields }) => {
                if (fields.includes("name")) {
                    await denormalizeRelatedProducts(attribute, models);
                }
            });

            Attribute.addHook("afterDestroy", async (attribute) => {
                await denormalizeRelatedProducts(attribute, models);
            });
        }

     }

    Attribute.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
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

    return Attribute
};
