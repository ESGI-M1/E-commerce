const OrderMongo = require("../../mongo/order");

module.exports = async function (order, models) {

    const { Order, Product } = models;

    const orderDenormalized = await Order.findByPk(order.id, {
        include: [
            {
                model: Product,
                attributes: ["id", "name", "reference", "price", "description"],
                required: false,
            },
        ]
    });

    console.log(orderDenormalized.toJSON());

    const orderMongo = await OrderMongo.findByIdAndUpdate(
        order.id,
        orderDenormalized.toJSON(),
        {
            upsert: true,
            new: true,
        }
    );
    
};
