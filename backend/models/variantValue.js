const { Model, DataTypes } = require("sequelize");
const productMongo = require("../dtos/denormalization/productMongo");

module.exports = function(connection) {
    class VariantValue extends Model {
        static associate(models) {
            VariantValue.belongsTo(models.VariantOption, { foreignKey: 'variantOptionId', as: 'variantOption' });
        }
    }

    VariantValue.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            value: {
                type: DataTypes.STRING,
                allowNull: true,
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
            modelName: 'VariantValue',
            tableName: 'VariantValues',
        }
    );

    return VariantValue;
};
