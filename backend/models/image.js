const { Model, DataTypes } = require("sequelize");

module.exports = function(connection) {

    class Image extends Model {
        static associate(models) {
            Image.belongsTo(models.ProductVariant, { foreignKey: 'productVariantId' });
            models.ProductVariant.hasMany(Image, { foreignKey: 'productVariantId' });
        }
    }

    Image.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            url: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
                defaultValue: '../../produit_avatar.jpg',
            },
            description: {
                type: DataTypes.TEXT,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true
              },
              updatedAt: {
                type: DataTypes.DATE,
                allowNull: true
              }
            
        },
        { sequelize: connection, timestamps: true, }
    );
    return Image;
}

