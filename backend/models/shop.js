const { Model, DataTypes } = require("sequelize");

module.exports = function (connection) {

    class Shop extends Model {

        static addHooks(models) {
            
            Product.addHook("beforeCreate", async (shop) => {
                const existingShop = await Shop.findOne();
                if (existingShop) {
                    throw new Error('A shop already exists. Only one shop is allowed.');
                }
            }
        }

    }

    Shop.init({
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                RegExp: /^[a-zA-Z0-9]{1,255}$/,
            },

            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },

            favicon: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            logo: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            street: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            postalCode: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            city: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            country: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                    isEmail: true,
                },
            },

            legalNotice: {
                type: DataTypes.TEXT,
                allowNull: false,
            },

            cgu: {
                type: DataTypes.TEXT,
                allowNull: false,
            },

            rgpd: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            
            siret: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            tva: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            }
        },
        { sequelize: connection, timestamps: true}
    );
  
    return Shop
  }