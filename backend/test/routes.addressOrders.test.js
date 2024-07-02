let request = require('supertest');
const { User } = require("../models");
request = request('http://localhost:3000');

describe('Commandes routes', () => {

  it('should create a new address order', async () => {
    const newAddressData = {
      street: '123 Rue de Test',
      postalCode: '12345',
      city: 'Test City',
      country: 'Test Country'
    };

     request
      .post('/adressorders')
      .send(newAddressData)
      .expect(201)
      .then(response => {
        expect(response.body.street).toBe(newAddressData.street);
        expect(response.body.postalCode).toBe(newAddressData.postalCode);
        expect(response.body.city).toBe(newAddressData.city);
        expect(response.body.country).toBe(newAddressData.country);
      });
  });


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

    const response = request
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

    const response = request
      .post(`/adressusers/${nonExistentUserId}`)
      .send(newAddressData)
      .expect(404);

    expect(response.body.error).toEqual('User not found');
  });
});
