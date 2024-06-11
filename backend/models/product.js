const { Model, DataTypes } = require("sequelize");
const categoryMongo = require("../dtos/denormalization/categoryMongo");

module.exports = function(connection){

    class Product extends Model {
        static associate(db) {
            Product.belongsToMany(db.Category, { through: 'ProductCategories' });
            db.Category.belongsToMany(Product, { through: 'ProductCategories' });

            Product.hasMany(db.Image);
            db.Image.belongsTo(Product);
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


