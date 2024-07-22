const { Model, DataTypes } = require("sequelize");
const { denormalizeRelatedProducts } = require("../dtos/denormalization/product");

module.exports = function(connection) {

    class Image extends Model {
        static associate(models) {
            Image.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId' });
            models.ProductVariant.hasMany(Image, { foreignKey: 'productVariantId', as: 'images' });
        }


        static addHooks(models) {
            Image.addHook("afterCreate", async (image) => {
                await denormalizeRelatedProducts(image, models);
            });

            Image.addHook("afterUpdate", async (image, { fields }) => {
                if (fields.includes("description")) {
                    await denormalizeRelatedProducts(image, models);
                }
            });

            Image.addHook("afterDestroy", async (image) => {
                await denormalizeRelatedProducts(image, models);
            });
        }
    }

    Image.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            description: {
                type: DataTypes.TEXT,
            },
            fileName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
        },
        { sequelize: connection, timestamps: true, }
    );
    return Image;
}

