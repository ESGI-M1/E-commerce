const { Model, DataTypes } = require('sequelize');

module.exports = function(sequelize) {
    class Favorite extends Model {
        static associate(models) {
            Favorite.belongsTo(models.User, { foreignKey: 'userId' });
            Favorite.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
        }
    }

    Favorite.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            }
        },
        {
            sequelize,
            modelName: 'Favorite',
            tableName: 'Favorites'
        }
    );

    return Favorite;
};
