const { Model, DataTypes } = require("sequelize");
const categoryMongo = require("../dtos/denormalization/categoryMongo");
const { tr } = require("date-fns/locale");

module.exports = function (connection) {

    class Category extends Model {

        static associate(models) {
            Category.belongsTo(models.Category, { as: 'parentCategory' });
        }

        static addHooks(models) {
            Category.addHook("afterCreate", (category) =>
              categoryMongo(category.id, models.Category, models.Product)
            );
            Category.addHook("afterUpdate", (category) =>
              categoryMongo(category.id, models.Category, models.Product)
            );
            Category.addHook("afterDestroy", (category) =>
              categoryMongo(category.id, models.Category, models.Product, true)
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
        },
        { sequelize: connection }
    );
    return Category;
};
