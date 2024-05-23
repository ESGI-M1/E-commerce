const { Model, DataTypes } = require("sequelize");

const connection = require("../db");

class Category extends Model {}

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

module.exports = Category;