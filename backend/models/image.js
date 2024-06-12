const { Model, DataTypes } = require("sequelize");

module.exports = function(connection) {

    class Image extends Model {
        static associate(db) {
            this.belongsTo(db.Product, { foreignKey: 'productId' });
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
            },
            description: {
                type: DataTypes.TEXT,
            },
        },
        {
            timestamps: false,
            sequelize: connection
        }
    );
    return Image;
}

