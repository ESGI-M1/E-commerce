const ProductMongo = require("../../mongo/product");

async function denormalizeProduct(product, models) {
    const { Product, Category, ProductVariant, AttributeValue, Image } = models;

    // Fetch the full product including related data
    const productDenormalized = await Product.findByPk(product.id, {
        include: [
            {
                model: Category,
                attributes: ["id", "name", "slug", "description"],
                required: false,
            },
            {
                model: ProductVariant,
                as: 'variants',
                include: [
                    {
                        model: AttributeValue,
                        as: 'attributeValues',
                        include: [
                            {
                                model: models.Attribute,
                                as: 'attribute'
                            }
                        ]
                    },
                    {
                        model: Image,
                        as: 'images'
                    }
                ]
            }
        ]
    });

    // Upsert the denormalized product into MongoDB
    await ProductMongo.findByIdAndUpdate(
        product.id,
        productDenormalized.toJSON(),
        {
            upsert: true,
            new: true,
        }
    );
}

// Utility function to handle denormalization when related entities change
async function denormalizeRelatedProducts(entity, models) {
    const { Product, Category, ProductVariant, Image, AttributeValue, Attribute } = models;

    let products;

    if (entity instanceof models.AttributeValue) {
        products = await Product.findAll({
            include: [
                {
                    model: ProductVariant,
                    as: 'variants',
                    where: { attributeValueId: entity.id },
                    include: [{ model: AttributeValue, as: 'attributeValues' }],
                }
            ]
        });
    } else if (entity instanceof models.Attribute) {
        products = await Product.findAll({
            include: [
                {
                    model: ProductVariant,
                    as: 'variants',
                    include: [{ model: AttributeValue, as: 'attributeValues', where: { '$attribute.id$': entity.id } }],
                }
            ]
        });
    } else if (entity instanceof models.Category) {
        products = await Product.findAll({
            include: [
                { model: Category, where: { id: entity.id } },
                { model: ProductVariant },
            ]
        });
    } else if (entity instanceof models.Image) {
        const productVariant = await models.ProductVariant.findByPk(entity.productVariantId);
        products = await Product.findAll({
            include: [
                {
                    model: ProductVariant,
                    as: 'variants',
                    where: { id: productVariant.id },
                    include: [{ model: Image, as: 'images' }],
                }
            ]
        });
    } else if (entity instanceof models.ProductVariant) {
        products = await Product.findAll({
            include: [
                {
                    model: ProductVariant,
                    as: 'variants',
                    where: { id: entity.id },
                }
            ]
        });
    }

    if (products) {
        for (const product of products) {
            await denormalizeProduct(product, models);
        }
    }
}

module.exports = {
    denormalizeProduct,
    denormalizeRelatedProducts
};