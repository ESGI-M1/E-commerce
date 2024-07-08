const { Model, DataTypes } = require('sequelize');

module.exports = function(connection) {
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
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true
              },
              updatedAt: {
                type: DataTypes.DATE,
                allowNull: true
              }
        },
        {
            sequelize: connection,
            modelName: 'Favorite',
            tableName: 'Favorites',
            timestamps: true
        }
    );

    return Favorite;
};
