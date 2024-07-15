const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {
  class NewsLetter extends Model {}

  NewsLetter.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize: connection,
    modelName: 'NewsLetter',
    tableName: 'NewsLetters',
  });

  return NewsLetter;
};