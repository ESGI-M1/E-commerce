const { Model, DataTypes } = require("sequelize");

module.exports = function(connection) {
    class VariantOption extends Model {
        static associate(models) {
            VariantOption.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId', as: 'productVariant', onDelete: 'CASCADE' });
        }
    }

    VariantOption.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            size: {
                type: DataTypes.ENUM("S", "M", "L"),
                defaultValue: "M",
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            color: {
                type: DataTypes.ENUM("red", "white", "black", "blue", "green", "yellow"),
                defaultValue: "white",
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            price: {
                type: DataTypes.DECIMAL,
                allowNull: true,
                validate: {
                    notEmpty: true,
                },
            },
            stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    notEmpty: true,
                },
            },
            productVariantId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
        },
        {
            sequelize: connection,
            modelName: 'VariantOption',
            tableName: 'VariantOptions',
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['size', 'color', 'productVariantId']
                }
            ]
        }
    );

    return VariantOption;
};
