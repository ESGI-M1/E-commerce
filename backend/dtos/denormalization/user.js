const { User: UserMongo } = require("../../mongo");

module.exports = async function denormalizeUser(user, models) {
  const { User, AddressUser, Order } = models;
  const userDenormalized = await User.findByPk(user.id, {
    attributes: ["id", "email", "lastname", "firstname", "active", "role"],
    include: [
        {
            model: AddressUser,
            as: "deliveryAddress",
            attributes: ["id", "street", "postalCode", "city", "country"],
            required: false,
        },
        {
            model: Order,
            attributes: ["id", "totalAmount", "status", "deliveryDate", "deliveryMethod"],
            required: false,
        }
    ]
  });

  console.log(userDenormalized.toJSON());

  const userMongo = await UserMongo.findByIdAndUpdate(
    user.id,
    userDenormalized.toJSON(),
    {
      upsert: true,
      new: true,
    }
  );
  console.log(userDenormalized.toJSON(), userMongo);
};