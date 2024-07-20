const { Model, DataTypes } = require("sequelize");
const denormalizeProduct = require("../dtos/denormalization/product");

module.exports = function(connection) {
    class Product extends Model {
        static associate(models) {
            Product.belongsToMany(models.Category, { through: 'ProductCategories' });
            models.Category.belongsToMany(Product, { through: 'ProductCategories' });

            Product.belongsToMany(models.User, { through: models.Favorite, as: 'favoritedBy', foreignKey: 'productId' });

            // Déclinaison
            Product.hasMany(models.ProductVariant, { foreignKey: 'productId', as: 'variants' });

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
            reference: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
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
