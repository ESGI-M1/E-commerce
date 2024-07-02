const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.log(err));

const connection = mongoose.connection;

module.exports = connection;