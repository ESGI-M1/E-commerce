const { Model, DataTypes } = require("sequelize");

module.exports = function(connection) {
    class ProductVariant extends Model {
        static associate(models) {
            ProductVariant.belongsTo(models.Product, { foreignKey: 'productId', as: 'product', onDelete: 'CASCADE' });
            ProductVariant.hasMany(models.VariantOption, { foreignKey: 'productVariantId', as: 'variantOptions' });
            ProductVariant.hasMany(models.Image, { foreignKey: 'productVariantId', as: 'images' });
        }
    }

    ProductVariant.init(
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
                defaultValue: 'Original',
            },
            reference: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    notEmpty: true,
                },
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
        },
        {
            sequelize: connection,
            modelName: 'ProductVariant',
            tableName: 'ProductVariants',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['name', 'productId']
                }
            ]
        }
    );

    return ProductVariant;
};
