const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class Cookie extends Model{}

  Cookie.init({
    type: {
      type: DataTypes.ENUM("essentiels", "statistiques", "marketing"),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(2048),
      allowNull: false,
    }
  }, {
      sequelize: connection,
      modelName: 'Cookie',
      tableName: 'Cookies',
  });

  return Cookie;
}