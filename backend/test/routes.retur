let request = require('supertest');
request = request('http://localhost:3000');
const { ReturnProduct, User, Order, Product } = require('../models');

describe('Retour routes', () => {
  it('should create a new return product', async () => {
    const user = await User.create({ id: 1, role: 'user' });
    const order = await Order.create({ id: 1, userId: user.id });
    const product = await Product.create({ id: 1 });

    const response = request
      .post('/return')
      .send({
        userId: user.id,
        orderId: order.id,
        productId: product.id,
        quantityReturned: 1,
        reason: 'Defective',
        deliveryMethod: 'Mail'
      })
      .expect(201);

    expect(response.body.userId).toEqual(user.id);
    expect(response.body.orderId).toEqual(order.id);
    expect(response.body.productId).toEqual(product.id);
    expect(response.body.quantity).toEqual(1);
    expect(response.body.reason).toEqual('Defective');
  });

  it('should delete a return product', async () => {
    const user = await User.create({ id: 2, role: 'user' });
    const returnProduct = await ReturnProduct.create({
      userId: user.id,
      orderId: 2,
      productId: 2,
      quantity: 1,
      reason: 'Defective',
      deliveryMethod: 'Mail'
    });

    const response = request
      .delete(`/return`)
      .query({
        userId: user.id,
        orderId: returnProduct.orderId,
        productId: returnProduct.productId
      })
      .expect(200);

    const deletedReturnProduct = await ReturnProduct.findByPk(returnProduct.id);
    expect(deletedReturnProduct).toBeNull();
  });

  it('should update the status of a return product', async () => {
    const returnProduct = await ReturnProduct.create({
      userId: 3,
      orderId: 3,
      productId: 3,
      quantity: 1,
      reason: 'Defective',
      deliveryMethod: 'Mail',
      status: 'pending'
    });

    const response = request
      .patch(`/return/${returnProduct.id}`)
      .send({ status: 'returned' })
      .expect(200);

    const updatedReturnProduct = await ReturnProduct.findByPk(returnProduct.id);
    expect(updatedReturnProduct.status).toEqual('returned');
  });
});
