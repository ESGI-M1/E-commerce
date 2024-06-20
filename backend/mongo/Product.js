const { connection, Schema } = require('./db');

const ProductSchema = new Schema(
  {
    _id: {
      type: Number,
      required: true,
      unique: true,
    },
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
    categories: [{
      type: Number,
      ref: 'Category',
    }],
  },
  {
    timestamps: true,
  }
);

const Product = connection.model('Product', ProductSchema);

module.exports = Product;
