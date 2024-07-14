const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class AlerteUser extends Model {}

  AlerteUser.init({
    alerte_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Alertes',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize: connection,
    modelName: 'AlerteUser',
    tableName: 'AlerteUsers',
  });

  return AlerteUser;
}