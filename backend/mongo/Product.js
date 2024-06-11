const { connection, Schema } = require('./db');

const ProductSchema = new Schema(
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
    categories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category',
    }],
    images: [{
      type: Schema.Types.ObjectId,
      ref: 'Image',
    }],
  },
  {
    timestamps: true,
  }
);

const Product = connection.model('Product', ProductSchema);

module.exports = Product;
