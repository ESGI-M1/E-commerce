const { Model, DataTypes } = require("sequelize");
const productMongo = require("../dtos/denormalization/productMongo");

module.exports = function(connection) {
    class Product extends Model {
        static associate(models) {
            Product.belongsToMany(models.Category, { through: 'ProductCategories' });
            models.Category.belongsToMany(Product, { through: 'ProductCategories' });

            Product.belongsToMany(models.User, { through: models.Favorite, as: 'favoritedBy', foreignKey: 'productId' });

            Product.hasMany(models.CartProduct, {
                foreignKey: 'productId',
                as: 'CartProducts',
            });
        }

        static addHooks(models) {
            /*
            Product.addHook("afterCreate", (product) =>
                productMongo(product.id, models.Category, models.Product)
            );
            Product.addHook("afterUpdate", (product) =>
                productMongo(product.id, models.Category, models.Product)
            );
            Product.addHook("afterDestroy", (product) =>
                productMongo(product.id, models.Category, models.Product, true)
            );
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
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
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
            description: {
                type: DataTypes.TEXT,
            },
            imageId: {
                type: DataTypes.INTEGER,
                allowNull: true,
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
