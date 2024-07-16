const { Model, DataTypes } = require("sequelize");
const denormalizeCategory = require("../dtos/denormalization/category");
const { model } = require("mongoose");

module.exports = function (connection) {

    class Category extends Model {

        static associate(models) {
            Category.belongsTo(models.Category, { as: 'parentCategory' });
        }

        static addHooks(models) {
            
            Category.addHook("afterCreate", (category) =>
                denormalizeCategory(category, models)
            );

            Category.addHook("afterUpdate", (category, { fields }) => {
                if(fields.includes("name") || fields.includes("slug") || fields.includes("description") || fields.includes("active")) {
                    denormalizeCategory(category, models)
                }
            });

            Category.addHook("afterDestroy", (category) =>
                denormalizeCategory(category, models)
            );
        }
    }

    Category.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
            slug: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true,
                },
            },
            description: {
                type: DataTypes.TEXT,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true
              },
            updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
            }
        },
        { sequelize: connection, timestamps: true }
    );
    return Category;
};
