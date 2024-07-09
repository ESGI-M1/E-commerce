const ProductMongo = require("../../mongo/product");

module.exports = async function (product, models) {

    const { Product, Category } = models;
    const productDenormalized = await Product.findByPk(product.id, {
        include: [
            {
                model: Category,
                attributes: ["id", "name", "slug", "description"],
                where: {
                    active: true,
                },
                required: false,
            },
        ]
    });

    console.log(productDenormalized.toJSON());

    const productMongo = await ProductMongo.findByIdAndUpdate(
        product.id,
        productDenormalized.toJSON(),
        {
            upsert: true,
            new: true,
        }
    );
    
};
