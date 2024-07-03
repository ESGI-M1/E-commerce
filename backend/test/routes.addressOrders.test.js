const request = require('supertest');
const { User, AddressOrder } = require('../models'); // Assurez-vous que AddressOrder est bien défini dans vos modèles
const server = request('http://localhost:3000');

let uniqueUserId = 9000;
let uniqueEmailCount = 1;

describe('Commandes routes', () => {

  it('should create a new address order', async () => {
    const user = await User.create({
      firstname: 'User',
      lastname: `Test`,
      email: `addressOrder${uniqueEmailCount}@zorglux.com`,
      password: 'Password123456789!',
    });
    uniqueEmailCount++;

    const newAddressData = {
      street: '123 Rue de Test',
      postalCode: '12345',
      city: 'Test City',
      country: 'Test Country',
    };

    const loginResponse = await server
      .post('/login')
      .send({
        email: user.email,
        password: 'Password123456789!',
      })
      .expect(200);

    const response = await server
      .post('/addressorders')
      .send(newAddressData)
      .set('Cookie', loginResponse.headers['set-cookie'])
      .expect(201);

    expect(response.body.street).toBe(newAddressData.street);
    expect(response.body.postalCode).toBe(newAddressData.postalCode);
    expect(response.body.city).toBe(newAddressData.city);
    expect(response.body.country).toBe(newAddressData.country);
  });

  it('should return 200 if address order is present', async () => {
    const nonExistentUserId = uniqueUserId++;

    const user = await User.create({
      firstname: 'User',
      lastname: `Test`,
      email: `addressOrder${uniqueEmailCount}@zorglux.com`,
      password: 'Password123456789!',
    });
    uniqueEmailCount++;

    const newAddressData = {
      street: '1278 Rue de Moulin',
      postalCode: '51234',
      city: 'Test Paris',
      country: 'Test Belgium',
    };

    const addressOrder = await AddressOrder.create({
      street: newAddressData.street,
      postalCode: newAddressData.postalCode,
      city: newAddressData.city,
      country: newAddressData.country,
    });

    const loginResponse = await server
      .post('/login')
      .send({
        email: user.email,
        password: 'Password123456789!',
      })
      .expect(200);

    const response = await server
      .get(`/addressorders/${addressOrder.id}`)
      .set('Cookie', loginResponse.headers['set-cookie'])
      .expect(200);

    expect(response.body.street).toBe(newAddressData.street);
    expect(response.body.postalCode).toBe(newAddressData.postalCode);
    expect(response.body.city).toBe(newAddressData.city);
    expect(response.body.country).toBe(newAddressData.country);
    expect(response.body.id).toBe(addressOrder.id);

  });

});
