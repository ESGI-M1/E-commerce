const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class CookieUser extends Model {}

  CookieUser.init({
    cookie_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize: connection,
    modelName: 'CookieUser',
    tableName: 'CookieUsers',
  });

  return CookieUser;
}