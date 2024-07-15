const { Model, DataTypes } = require("sequelize");

module.exports = function(connection) {
    class ProductOption extends Model {}

    ProductOption.init(
        {
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            variantOptionId: {
                type: DataTypes.INTEGER,
                allowNull: false,
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
            modelName: 'ProductOption',
            tableName: 'ProductOptions',
        }
    );

    return ProductOption;
};
