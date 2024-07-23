const { Order : OrderMongo } = require("../../mongo");

module.exports = async function denormalizeOrder (order, models) {

    return;
    const { Order, Cart, User, PromoCode, CartProduct, Product, Category, Image } = models;

    const orderDenormalized = await Order.findByPk(order.id, {
        attributes: ["id", "totalAmount", "status", "deliveryDate", "deliveryMethod"],
        include: [
            {
                model: Cart,
                as: "carts",
                attributes: ["id", "promoCodeId"],
                include: [
                    {
                        model: PromoCode,
                        as: 'promoCode',
                        attributes: ['discountPercentage']
                    },
                    {
                        model: CartProduct,
                        as: 'CartProducts',
                        include: [
                            {
                                model: VariantOption,
                                as: 'variantOption',
                                include: [
                                    {
                                        model: ProductVariant,
                                        as: 'productVariant',
                                        include: [
                                            {
                                                model: Image,
                                                as: 'images',
                                            },
                                            {
                                                model: Product,
                                                as: 'product',
                                            }
                                        ]
                                    }
                                ],
                            }
                        ]
                    }
                ]
            },
            {
                model: User,
                as: "user",
                attributes: ["id", "firstname", "lastname", "email", "phone"],
            },
        ]
    });

    await OrderMongo.findByIdAndUpdate(
        order.id,
        orderDenormalized.toJSON(),
        {
            upsert: true,
            new: true,
        }
    );
    
};
