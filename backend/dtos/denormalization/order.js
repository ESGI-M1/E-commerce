const { Order : OrderMongo } = require("../../mongo");

module.exports = async function denormalizeOrder (order, models) {

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
                                model: Product,
                                as: 'product',
                                attributes: ['id', 'reference', 'name', 'price', 'description'],
                                include: [Category, Image],
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
