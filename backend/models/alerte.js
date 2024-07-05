const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class Alerte extends Model {}

  Alerte.init({
    name: {
      type: DataTypes.ENUM("news_letter", "new_product", "restock_product", "change_product_price"),
      allowNull: false,
    }
  }, {
    sequelize: connection,
    modelName: 'Alerte',
    tableName: 'Alertes',
  });

  return Alerte;
}