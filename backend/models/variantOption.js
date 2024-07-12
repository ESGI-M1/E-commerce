const { Model, DataTypes } = require("sequelize");
const productMongo = require("../dtos/denormalization/productMongo");

module.exports = function(connection) {
    class VariantOption extends Model {
        static associate(models) {
            VariantOption.hasMany(models.VariantValue, { foreignKey: 'variantOptionId', as: 'variantValues' });
        }
    }

    VariantOption.init(
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
            modelName: 'VariantOption',
            tableName: 'VariantOptions',
        }
    );

    return VariantOption;
};
