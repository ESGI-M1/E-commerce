const { Model, DataTypes } = require("sequelize");

module.exports = function(connection) {
    class AttributeValue extends Model {

        static associate(models) {
            AttributeValue.belongsTo(models.Attribute, { as: 'attribute', foreignKey: 'attributeId', onDelete: 'CASCADE' });
            AttributeValue.hasMany(models.ProductVariant, { as: 'productVariants', foreignKey: 'attributeValueId' });
        }

     }

     AttributeValue.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
        },
        {
            sequelize: connection,
            timestamps: true,
        }
    );

    return AttributeValue
};
