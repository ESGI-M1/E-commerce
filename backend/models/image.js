const { Model, DataTypes } = require("sequelize");

module.exports = function(connection) {

    class Image extends Model {
        static associate(models) {
            Image.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId' });
            models.ProductVariant.hasMany(Image, { foreignKey: 'productVariantId', as: 'images' });
        }
    }

    Image.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            description: {
                type: DataTypes.TEXT,
            },
            fileName: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
        },
        { sequelize: connection, timestamps: true, }
    );
    return Image;
}

