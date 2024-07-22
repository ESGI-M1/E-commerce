const { Model, DataTypes } = require("sequelize");
const { Op } = require("sequelize");
const mailer = require('../services/mailer')

module.exports = function(connection) {
    class ProductVariant extends Model {
        static associate(models) {
            ProductVariant.belongsTo(models.Product, { foreignKey: 'productId', as: 'product', onDelete: 'CASCADE' });
            ProductVariant.hasMany(models.ProductVariantDetail, { foreignKey: 'productVariantId', as: 'productVariantDetails' });
        }
        static addHooks(models) {
          ProductVariant.addHook("beforeUpdate", async (productvariant, { fields }) => {

            if (fields.includes("stockQuantity")) {
              const newQuantity = productvariant.dataValues.stockQuantity;
              const oldQuantity = productvariant._previousDataValues.stockQuantity;

              if ((oldQuantity === 0 && newQuantity > 0) || (oldQuantity > 0 && newQuantity === 0)) {
                const product = await models.Product.findByPk(productvariant.productId);
                // restock, send restock mail to users subcribed to the restock of this product
                if (oldQuantity === 0 && newQuantity > 0) {
                  const idAlertRestockProduct = await models.Alert.findOne({
                    where: {
                      name: 'restock_product'
                    }
                  });
                  const userAlerts = await models.AlertUser.findAll({
                    where: {
                      alert_id: idAlertRestockProduct.id
                    }
                  });
                  const userAlertProducts = await models.AlertUserProduct.findAll({
                    where: {
                      productId: product.id
                    }
                  });
                  for (let i = 0; i < userAlertProducts.length; i++) {
                    for (let j = 0; j < userAlerts.length; j++) {
                      if (userAlertProducts[i].alertUserId === userAlerts[j].id) {
                        const user = await models.User.findByPk(userAlerts[j].user_id);
                        mailer.sendRestockNotification(user, product);
                      }
                    }
                  }
                } else {
                  // empty stock, send emptyStock mail to users with role admin and store
                  const usersToPrevent = await models.User.findAll({
                    where: {
                      [Op.or] : [
                        {
                          role: "admin"
                        },
                        {
                          role: "store"
                        }
                      ]
                    }
                  });
                  for (let i=0; i < usersToPrevent.length; i++) {
                    mailer.sendEmptyStockNotification(usersToPrevent[i], product);
                  }
                }
              }
            }
          });
      }
    }

    ProductVariant.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    notEmpty: true,
                },
            },
            reference: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
                validate: {
                    notEmpty: true,
                },
            },
            price: {
                type: DataTypes.DECIMAL,
                allowNull: true,
                validate: {
                    notEmpty: true,
                },
            },
            stockQuantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    notEmpty: true,
                },
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                defaultValue: DataTypes.NOW,
            }
        },
        {
            sequelize: connection,
            modelName: 'ProductVariant',
            tableName: 'ProductVariants',
        }
    );

    return ProductVariant;
};
