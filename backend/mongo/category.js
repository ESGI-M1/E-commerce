const mongoose = require('mongoose'); 

module.exports = function (connection) {
  const CategorySchema = new mongoose.Schema(
    {
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

  return Category;
}
