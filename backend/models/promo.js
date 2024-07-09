const { Model, DataTypes } = require('sequelize');

module.exports = function(connection) {
  class PromoCode extends Model {
    static associate(models) {
      PromoCode.hasMany(models.Cart, {
        foreignKey: 'promoCodeId',
        as: 'carts',
      });
    }
  }

  PromoCode.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      discountPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false
    }    
    },
    {
      sequelize: connection,
      modelName: 'PromoCode',
    }
  );

  return PromoCode;
};
