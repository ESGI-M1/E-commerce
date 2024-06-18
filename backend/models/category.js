const { Model, DataTypes } = require("sequelize");
const categoryMongo = require("../dtos/denormalization/categoryMongo");

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
        },
        {
            timestamps: true,
            createdAt: true,
            updatedAt: 'updateTimestamp',
            sequelize: connection
        }
    );
    return Category;
};
