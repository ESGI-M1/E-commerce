const CategoryMongo = require("../../mongo/category");

module.exports = async function (category, models) {
    
    const { Category, Product } = models;
    const categoryDenormalized = await Category.findByPk(category.id, {
        include: [
            {
                model: Product,
                attributes: ["id", "name", "reference", "price", "description"],
                where: {
                    active: true,
                },
                required: false,
            },
            {
                model: Category,
                as: "parentCategory",
                attributes: ["id", "name", "slug", "description", "active"],
                required: false,
            },
        ]
    });

    console.log(categoryDenormalized.toJSON());

    const categoryMongo = await CategoryMongo.findByIdAndUpdate(
        category.id,
        categoryDenormalized.toJSON(),
        {
            upsert: true,
            new: true,
        }
    );
};
