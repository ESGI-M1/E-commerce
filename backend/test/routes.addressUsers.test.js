let request = require('supertest');
const { User, AddressUser } = require("../models");
request = request('http://localhost:3000');

describe('User Routes', () => {
  
  it('should create a new address for a user', async () => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
    });

    const newAddressData = {
      street: '123 Main St',
      postalCode: '12345',
      city: 'Cityville',
      country: 'Countryland',
    };

    const response = await request(app)
      .post(`/adressusers/${user.id}`)
      .send(newAddressData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.street).toEqual(newAddressData.street);
    expect(response.body.postalCode).toEqual(newAddressData.postalCode);
    expect(response.body.city).toEqual(newAddressData.city);
    expect(response.body.country).toEqual(newAddressData.country);
  });

  it('should return 404 if user does not exist', async () => {
    const nonExistentUserId = 'non-existent-user-id';

    const newAddressData = {
      street: '123 Main St',
      postalCode: '12345',
      city: 'Cityville',
      country: 'Countryland',
    };

    const response = await request(app)
      .post(`/adressusers/${nonExistentUserId}`)
      .send(newAddressData)
      .expect(404);

    expect(response.body.error).toEqual('User not found');
  });

  it('should update an existing address for a user', async () => {
    const user = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'Password456!',
    });

    const address = await AddressUser.create({
      street: '456 Oak St',
      postalCode: '54321',
      city: 'Villageville',
      country: 'Otherland',
      userId: user.id,
    });

    const updatedAddressData = {
      street: '789 Elm St',
      postalCode: '67890',
      city: 'Townsville',
      country: 'Anotherland',
    };

    const response = await request(app)
      .put(`/adressusers/${user.id}`)
      .send(updatedAddressData)
      .expect(200);

    expect(response.body).toHaveProperty('id', address.id);
    expect(response.body.street).toEqual(updatedAddressData.street);
    expect(response.body.postalCode).toEqual(updatedAddressData.postalCode);
    expect(response.body.city).toEqual(updatedAddressData.city);
    expect(response.body.country).toEqual(updatedAddressData.country);
  });

  it('should return 404 if user does not exist', async () => {
    const nonExistentUserId = 'non-existent-user-id';

    const updatedAddressData = {
      street: '789 Elm St',
      postalCode: '67890',
      city: 'Townsville',
      country: 'Anotherland',
    };

    const response = await request(app)
      .put(`/adressusers/${nonExistentUserId}`)
      .send(updatedAddressData)
      .expect(404);

    expect(response.body.error).toEqual('User not found');
  });

  it('should delete an existing address for a user', async () => {
    const user = await User.create({
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      password: 'Password789!',
    });

    const address = await AddressUser.create({
      street: '890 Pine St',
      postalCode: '98765',
      city: 'Hamletville',
      country: 'Fantasyland',
      userId: user.id,
    });

    const response = await request(app)
      .delete(`/adressusers/${address.id}`)
      .expect(204);

    const deletedAddress = await AddressUser.findByPk(address.id);
    expect(deletedAddress).toBeNull();
  });

  it('should return 404 if address does not exist', async () => {
    const nonExistentAddressId = 'non-existent-address-id';

    const response = await request(app)
      .delete(`/adressusers/${nonExistentAddressId}`)
      .expect(404);

    expect(response.body.error).toEqual('Address not found');
  });
});
