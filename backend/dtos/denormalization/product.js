const { Product : ProductMongo } = require("../../mongo");

module.exports = async function denormalizeProduct (product, models) {

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

    await ProductMongo.findByIdAndUpdate(
        product.id,
        productDenormalized.toJSON(),
        {
            upsert: true,
            new: true,
        }
    );
    
};
