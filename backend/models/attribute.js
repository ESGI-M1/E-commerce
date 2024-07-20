const { Model, DataTypes } = require("sequelize");

module.exports = function(connection) {
    class Attribute extends Model {

        static associate(models) {
            Attribute.hasMany(models.AttributeValue, { as: 'values', foreignKey: 'attributeId', onDelete: 'CASCADE' });
        }

     }

    Attribute.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
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

    return Attribute
};
