const mongoose = require('mongoose'); 

module.exports = function (connection) {
  const OrderSchema = new mongoose.Schema(
    {
        _id: Number,
        user: Array,
        carts: Array,
        totalAmount: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'shipped', 'delivered'],
            default: 'pending',
        },
        deliveryDate: {
            type: Date,
            required: true,
        },
        deliveryMethod: Array,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
      
  );

  const Order = connection.model('Order', OrderSchema);

  return Order
}