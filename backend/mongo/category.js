const mongoose = require('mongoose'); 

module.exports = function (connection) {
  const CategorySchema = new mongoose.Schema(
    {
      _id: Number,
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
        type: Number,
        ref: 'Category',
      },
      products: Array
    },
    {
      timestamps: true,
    }
  );

  const Category = connection.model('Category', CategorySchema);

  return Category;
}
