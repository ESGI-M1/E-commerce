const request = require('supertest');
const { Order, AddressOrder, User } = require('../models');
const server = request('http://localhost:3000');

const uniqueSuffix = Date.now(); // Génère un suffixe unique à chaque fois

let adminUser;
let addressOrder;

const getAdminUser = async () => {
  if (adminUser) return adminUser;

  adminUser = await User.create({
    firstname: 'John',
    lastname: 'Doe',
    email: `admin${uniqueSuffix}@example.com`,
    password: 'Password123!',
    role: 'admin',
  });

  return adminUser;
};

const getAddressOrder = async () => {
  if (addressOrder) return addressOrder;

  addressOrder = await AddressOrder.create({
    street: `123 Rue de Test ${uniqueSuffix}`,
    postalCode: '12345',
    city: 'Test City',
    country: 'Test Country',
  });

  return addressOrder;
};

describe('Order routes', () => {
  it('should delete an order and its associated address', async () => {
    const adminUser = await getAdminUser();
    const address = await getAddressOrder();
    const order = await Order.create({
      deliveryMethod: address.id,
      userId: adminUser.id,
      totalAmount: 100,
      deliveryDate: new Date(),
    });

    await server
      .delete(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${adminUser.token}`)
      .expect(204);

    const deletedOrder = await Order.findByPk(order.id);
    const deletedAddress = await AddressOrder.findByPk(address.id);
    expect(deletedOrder).toBeNull();
    expect(deletedAddress).toBeNull();
  });

  it('should return 404 when trying to delete a non-existent order', async () => {
    const adminUser = await getAdminUser();

    await server
      .delete(`/orders/9999`)
      .set('Authorization', `Bearer ${adminUser.token}`)
      .expect(404);
  });

  it('should update the status of an order to completed', async () => {
    const adminUser = await getAdminUser();
    const order = await Order.create({
      status: 'pending',
      userId: adminUser.id,
      totalAmount: 100,
      deliveryDate: new Date(),
      deliveryMethod: 1,
    });

    const response = await server
      .patch(`/orders/${order.id}`)
      .send({ status: 'completed' })
      .expect(200);

    const updatedOrder = await Order.findByPk(order.id);
    expect(updatedOrder.status).toEqual('completed');
  });

  it('should return 404 when trying to update a non-existent order', async () => {
    await server
      .patch(`/orders/9999`)
      .send({ status: 'completed' })
      .expect(404);
  });
});
