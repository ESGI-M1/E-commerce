const { Model, DataTypes } = require("sequelize");
const categoryMongo = require("../dtos/denormalization/categoryMongo");

module.exports = function (connection) {

    class Category extends Model {

        static associate(db) {
            Category.belongsTo(db.Category, { as: 'parentCategory' });
        }

        static addHooks(db) {
            Category.addHook("afterCreate", (category) =>
              categoryMongo(category.id, db.Category, db.Product)
            );
            Category.addHook("afterUpdate", (category) =>
              categoryMongo(category.id, db.Category, db.Product)
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
