const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class AlertUser extends Model {}

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
    }
  }, {
    sequelize: connection,
    modelName: 'AlertUser',
    tableName: 'AlertUsers',
  });

  return AlertUser;
}