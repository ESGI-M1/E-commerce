const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class AlertUser extends Model {
    static associate(models) {
      AlertUser.belongsToMany(models.Product, {
        through: models.AlertUserProduct,
        foreignKey: 'alertUserId',
        otherKey: 'productId',
        as: 'Products'
      });
    };
  }

  AlertUser.init({
    alert_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Alerts',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
  }, {
    sequelize: connection,
    modelName: 'AlertUser',
    tableName: 'AlertUsers',
  });

  return AlertUser;
}