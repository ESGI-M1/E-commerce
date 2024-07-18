const { Model, DataTypes } = require("sequelize");
const denormalizeProduct = require("../dtos/denormalization/product");

module.exports = function(connection) {
    class Product extends Model {
        static associate(models) {
            Product.belongsToMany(models.Category, { through: 'ProductCategories' });
            Product.belongsToMany(models.User, { through: models.Favorite, as: 'favoritedBy', foreignKey: 'productId' });
            Product.hasMany(models.ProductVariant, { foreignKey: 'productId', as: 'ProductVariants' });
        }

        static addHooks(models) {
            Product.addHook("afterCreate", (product) =>
                denormalizeProduct(product, models)
            );

            Product.addHook("afterUpdate", (product, { fields }) => {
                if (fields.includes("active") || fields.includes("description")) {
                    denormalizeProduct(product, models);
                }
            });

            Product.addHook("afterDestroy", (product) =>
                denormalizeProduct(product, models)
            );
        }
    }

    Product.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    notEmpty: true,
                },
            },
            description: {
                type: DataTypes.TEXT,
            },
        },
        {
            sequelize: connection,
            modelName: 'Product',
            tableName: 'Products',
            timestamps: true,
        }
    );

    return Product;
};
