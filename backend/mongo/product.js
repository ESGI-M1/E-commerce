const mongoose = require('mongoose'); 

module.exports = function (connection) {
  const ProductSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      reference: {
        type: String,
        required: true,
        unique: true,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
      },
      active: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
      categories: Array,
    },
    {
      timestamps: true,
    }
  );

  const Product = connection.model('Product', ProductSchema);

  return Product;
}