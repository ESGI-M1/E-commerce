const { Model, DataTypes, Op } = require("sequelize");
const { denormalizeRelatedProducts } = require("../dtos/denormalization/product");
const mailer = require('../services/mailer')

module.exports = function(connection) {
    class ProductVariant extends Model {
        static associate(models) {
            ProductVariant.belongsTo(models.Product, { foreignKey: 'productId' });
            ProductVariant.belongsToMany(models.AttributeValue, {
                through: 'ProductVariantAttributeValue',
                as: 'attributeValues',
                foreignKey: 'productVariantId'
            });
        }

        static async createImageForVariant(productVariant, models) {
          try {
              await models.Image.create({
                  fileName: productVariant.id + '-undefined.png',
                  description: productVariant.reference,
                  productVariantId: productVariant.id
              });
          } catch (error) {
              console.error('Error creating image:', error);
          }
      }


        static addHooks(models) {
            ProductVariant.addHook("afterCreate", async (productVariant) => {
                await denormalizeRelatedProducts(productVariant, models);
                await ProductVariant.createImageForVariant(productVariant, models);
            });

            ProductVariant.addHook("afterUpdate", async (productVariant, { fields }) => {
                if (fields.includes("price") || fields.includes("name") || fields.includes("active") || fields.includes("stock")) {
                    await denormalizeRelatedProducts(productVariant, models);
                }
            });

            ProductVariant.addHook("afterDestroy", async (productVariant) => {
                await denormalizeRelatedProducts(productVariant, models);
            });

            ProductVariant.addHook("beforeUpdate", async (productvariant, { fields }) => {

              if (fields.includes("stock")) {
                const newQuantity = productvariant.dataValues.stock;
                const oldQuantity = productvariant._previousDataValues.stock;

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
            reference: {
                type: DataTypes.STRING,
                allowNull: true,
                validate: {
                    notEmpty: true,
                },
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },            
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    notEmpty: true,
                },
            },
            default: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            sequelize: connection,
            timestamps: true,
        }
    );

    return ProductVariant;
};
