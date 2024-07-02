let request = require('supertest');
request = request('http://localhost:3000');
const { Order, AddressOrder, User } = require('../models');

describe('Order routes', () => {
  it('should delete an order and its associated address', async () => {
    const adminUser = await User.create({ id: 1, role: 'admin' });
    const address = await AddressOrder.create({ id: 1 });
    const order = await Order.create({ id: 1, deliveryMethod: address.id });

    const response = request
      .delete(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${adminUser.token}`)
      .expect(204);

    const deletedOrder = await Order.findByPk(order.id);
    const deletedAddress = await AddressOrder.findByPk(address.id);
    expect(deletedOrder).toBeNull();
    expect(deletedAddress).toBeNull();
  });

  it('should return 404 when trying to delete a non-existent order', async () => {
    const adminUser = await User.create({ id: 2, role: 'admin' });

    request
      .delete(`/orders/9999`)
      .set('Authorization', `Bearer ${adminUser.token}`)
      .expect(404);
  });

  it('should update the status of an order to completed', async () => {
    const order = await Order.create({ id: 2, status: 'pending' });

    const response = request
      .patch(`/orders/${order.id}`)
      .send({ status: 'completed' })
      .expect(200);

    const updatedOrder = await Order.findByPk(order.id);
    expect(updatedOrder.status).toEqual('completed');
  });

  it('should return 404 when trying to update a non-existent order', async () => {
    request
      .patch(`/orders/9999`)
      .send({ status: 'completed' })
      .expect(404);
  });
});
