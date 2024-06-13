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
        type: DataTypes.DATE,
        allowNull: false
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      discountPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
      }
    },
    {
      sequelize: connection,
      modelName: 'PromoCode',
      timestamps: false
    }
  );

  return PromoCode;
};
