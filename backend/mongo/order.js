const { create } = require('domain');
const mongoose = require('mongoose'); 

module.exports = function (connection) {
  const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        products: Array,
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