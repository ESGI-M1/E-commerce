const { Model, DataTypes } = require("sequelize");

const connection = require("../db");

const Category = require('./category');
const Product = require('./product');
const Image = require('./image');

class ProductCategory extends Model {}

ProductCategory.init(
    {
        ProductId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Products',
                key: 'id',
            },
        },
        CategoryId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Categories',
                key: 'id',
            },
        }
    },
    {
        timestamps: false,
        sequelize: connection,
    }
);

Category.belongsToMany(Product, { through: ProductCategory });
Product.belongsToMany(Category, { through: ProductCategory });

class ProductImage extends Model {}

ProductImage.init(
    {
        ProductId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Products',
                key: 'id',
            },
        },
        ImageId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Images',
                key: 'id',
            },
        }
    },
    {
        timestamps: false,
        sequelize: connection,
    }
);

Product.belongsToMany(Image, { through: ProductImage });
Image.belongsToMany(Product, { through: ProductImage });

module.exports = { ProductCategory, ProductImage}
