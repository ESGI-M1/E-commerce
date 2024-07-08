const CategoryMongo = require("../../mongo/category");

module.exports = async function (categoryId, Category, Product, isDelete = false) {

    await CategoryMongo.deleteOne({ _id: categoryId });
    if(isDelete) return;
    
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

    console.log("category: ", category);

    const categoryMongo = new CategoryMongo({
        _id: categoryId,
        name: category.name,
        slug: category.slug,
        description: category.description,
        products: category.Products.length > 0 ? category.Products.map(product => product.id) : [],
    });
    await categoryMongo.save();
};
