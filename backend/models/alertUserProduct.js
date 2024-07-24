const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class AlertUserProduct extends Model {}

  AlertUserProduct.init({
    alertUserId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'AlertUsers',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Products',
        key: 'id'
      }
    }
  }, {
    sequelize: connection,
    modelName: 'AlertUserProduct',
    tableName: 'AlertUserProducts',
  });

  return AlertUserProduct;
}