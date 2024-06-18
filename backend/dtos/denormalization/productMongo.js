const ProductMongo = require("../../mongo/product");

module.exports = async function (productId, Category, Product, Image) {
    
    const product = await Product.findByPk(productId, {
        include: [
            {
                model: Category,
                required: false,
            },
            {
                model: Image,
                required: false,
            }
        ]
    });
    await ProductMongo.deleteOne({ _id: productId });

    console.log('productMongo', product);

    const productMongo = new ProductMongo({
        _id: productId,
        name: product.name,
        reference: product.reference,
        price: product.price,
        active: product.active,
        categories: product.Categories.length > 0 ? product.Categories.map(category => category.id) : [],
        images: product.Images.length > 0 ? product.Images.map(image => image.id) : [],
    });
    await productMongo.save();
    
};
