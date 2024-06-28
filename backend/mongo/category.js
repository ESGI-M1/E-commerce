const { connection, Schema } = require('./db');

const CategorySchema = new Schema(
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
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    products: [{
      type: Number,
      ref: 'Product',
    }],
  },
  {
    timestamps: true,
  }
);

const Category = connection.model('Category', CategorySchema);

module.exports = Category;
