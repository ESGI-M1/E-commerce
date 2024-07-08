const ProductMongo = require("../../mongo/product");

module.exports = async function (productId, Category, Product, isDelete = false) {

    await ProductMongo.deleteOne({ _id: productId });
    if(isDelete) return;
    
    const product = await Product.findByPk(productId, {
        include: [
            {
                model: Category,
                required: false,
            }
        ]
    });

    const productMongo = new ProductMongo({
        _id: productId,
        name: product.name,
        reference: product.reference,
        price: product.price,
        active: product.active,
        categories: product.Categories.length > 0 ? product.Categories.map(category => category.id) : [],
    });
    
    await productMongo.save();
    
};
