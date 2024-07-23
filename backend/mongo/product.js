const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  _id: Number,
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
  defaultCategoryId: {
    type: Number,
  },
  Categories: [{
    id: Number,
    name: String,
    slug: String,
    description: String,
    active: Boolean,
  }],
  variants: [{
    id: Number,
    reference: {
      type: String,
      required: true,
      trim: true,
    },
    stock: Number,
    price: Number,
    active: Boolean,
    default: Boolean,
    images: [{
      id: Number,
      description: String,
    }],
    attributeValues: [{
      value: {
        type: String,
        required: true,
      },
      attribute: {
        name: {
          type: String,
          required: true,
        },
      },
    }],
  }],
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;