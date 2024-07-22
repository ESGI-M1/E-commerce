const { Model, DataTypes } = require('sequelize');
const mailer = require('../services/mailer')


module.exports = function (connection) {
  class NewsLetter extends Model {
    static addHooks(models) {
      NewsLetter.addHook("afterCreate", async (newsletter) => {
        const idAlert = await models.Alert.findOne({
          where: {
            name: 'news_letter'
          }
        });
        if (idAlert) {
          const userToPrevent = await models.AlertUser.findAll({
            where: {
              alert_id: idAlert.id
            }
          });
          if (userToPrevent) {
            for (let i=0; i < userToPrevent.length; i++) {
              const user = await models.User.findByPk(userToPrevent[i].user_id);
              mailer.sendNewsLetterArticle(user, newsletter.title, newsletter.content);
            }
          }
        }
      });
    }
  }

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