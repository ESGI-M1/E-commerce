const { Model, DataTypes } = require("sequelize");

const connection = require("../db");

class Image extends Model {}

Image.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        url: {
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
        timestamps: false,
        sequelize: connection
    }
);

module.exports = Image;