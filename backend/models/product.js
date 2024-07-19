const { Model, DataTypes } = require("sequelize");
const denormalizeProduct = require("../dtos/denormalization/product");

module.exports = function(connection) {
    class Product extends Model {
        static associate(models) {
            Product.belongsToMany(models.Category, { through: 'ProductCategories' });
            models.Category.belongsToMany(Product, { through: 'ProductCategories' });

            Product.belongsTo(models.Category, { as: 'defaultCategory', foreignKey: 'defaultCategoryId' });

            Product.belongsToMany(models.VariantOption, { through: 'ProductOptions' });
            models.VariantOption.belongsToMany(Product, { through: 'ProductOptions' });

            Product.belongsToMany(models.User, { through: models.Favorite, as: 'favoritedBy', foreignKey: 'productId' });
            Product.hasMany(models.ProductVariant, { foreignKey: 'productId', as: 'ProductVariants' });
        }

        static addHooks(models) {
            Product.addHook("afterCreate", async (product) => {
                await denormalizeProduct(product, models);
                await Product.verifyDefaultCategory(product, models);
            });

            Product.addHook("afterUpdate", async (product, { fields }) => {
                if (fields.includes("active") || fields.includes("price") || fields.includes("name") || fields.includes("description") || fields.includes("reference")) {
                    await denormalizeProduct(product, models);
                }
            });

            Product.addHook("afterDestroy", async (product) => {
                await denormalizeProduct(product, models)
            });
            

            Product.addHook("beforeCreate", async (product) => {
                await Product.verifyDefaultCategory(product);
            });

            Product.addHook("beforeUpdate", async (product) => {
                await Product.verifyDefaultCategory(product);
            });
        }

        static async verifyDefaultCategory(product) {
            // TO DO FIX

            /*const categories = await product.getCategories();
            if (categories.length === 1) {
                product.defaultCategoryId = categories[0].id;
            } else if (!categories.map(cat => cat.id).includes(product.defaultCategoryId)) {
                throw new Error('La catégorie par défaut doit correspondre à une des catégories sélectionnées.');
            }
                */
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
            defaultCategoryId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Categories',
                    key: 'id'
                }
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            }
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
