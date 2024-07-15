const request = require('supertest');
const { AddressOrder } = require('../models');
const server = request('http://localhost:3000');

describe('AddressOrder routes', () => {

  it('should create a new address order with valid details', async () => {
    const addressData = {
      street: '123 Main St',
      postalCode: '12345',
      city: 'Somewhere',
      country: 'Someland'
    };

    const response = await server
      .post('/addressorders')
      .send(addressData)
      .expect(201);

    expect(response.body.street).toBe(addressData.street);
    expect(response.body.postalCode).toBe(addressData.postalCode);
    expect(response.body.city).toBe(addressData.city);
    expect(response.body.country).toBe(addressData.country);
  });

});
