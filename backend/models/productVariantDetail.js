const { Model, DataTypes } = require("sequelize");
const productMongo = require("../dtos/denormalization/productMongo");

module.exports = function(connection) {
    class ProductVariantDetail extends Model {
        static associate(models) {
            ProductVariantDetail.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId', as: 'productVariant', onDelete: 'CASCADE' });
            ProductVariantDetail.belongsTo(models.VariantOption, { foreignKey: 'variantOptionId', as: 'variantOption' });
            ProductVariantDetail.belongsTo(models.VariantValue, { foreignKey: 'variantValueId', as: 'variantValue' });
        }
    }

    ProductVariantDetail.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            productVariantId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            variantOptionId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    notEmpty: true,
                },
            },
            variantValueId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    notEmpty: true,
                },
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
            modelName: 'ProductVariantDetail',
            tableName: 'ProductVariantDetails',
        }
    );

    return ProductVariantDetail;
};
