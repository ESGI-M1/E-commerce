const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class Alert extends Model {}

  Alert.init({
    name: {
      type: DataTypes.ENUM("news_letter", "new_product", "restock_product", "change_product_price"),
      allowNull: false,
    }
  }, {
    sequelize: connection,
    modelName: 'Alert',
    tableName: 'Alerts',
  });

  return Alert;
}