const CategoryMongo = require("../../mongo/Category");

module.exports = async function (categoryId, Category, Product) {
    
    console.log('categoryMongo', categoryId);
    const category = await Category.findByPk(categoryId, {
        include: [
            {
                model: Product,
                where: {
                    active: true,
                },
                required: false,
            },
        ]
    });
    await CategoryMongo.deleteOne({ _id: categoryId });

    console.log('categoryMongo', category);

    const categoryMongo = new CategoryMongo({
        _id: categoryId,
        name: category.name,
        slug: category.slug,
        description: category.description,
        products: category.products.map(product => product.id)
    });
    await categoryMongo.save();
};
