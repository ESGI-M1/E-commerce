const mongoose = require("mongoose");

module.exports = function (connection) {
  const UserSchema = new mongoose.Schema({
    _id: Number,
    email: {
        type: String,
        required: true,
        unique: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "temp", "store"],
      default: "user",
    },
    orders: Array,
    favorites: Array,
    addressUser: Array,

  });

  const User = connection.model("User", UserSchema);

  return User;
};