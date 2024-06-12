const { Model, DataTypes } = require("sequelize");
const productMongo = require("../dtos/denormalization/productMongo");

module.exports = function(connection){

    class Product extends Model {
        static associate(db) {
            Product.belongsToMany(db.Category, { through: 'ProductCategories' });
            db.Category.belongsToMany(Product, { through: 'ProductCategories' });

            Product.hasMany(db.Image);
            db.Image.belongsTo(Product);
        }

        static addHooks(db) {
            Product.addHook("afterCreate", (product) =>
                productMongo(product.id, db.Category, db.Product, db.Image)
            );
            Product.addHook("afterUpdate", (product) =>
                productMongo(product.id, db.Category, db.Product, db.Image)
            );
            /*
            Product.addHook("afterDestroy", (product) =>
                productMongo(product, db.Category, db.Product)
            );*/
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
    
        },
        {
            timestamps: true,
            createdAt: true,
            updatedAt: 'updateTimestamp',
            sequelize: connection
        }
    );
    return Product;
}


