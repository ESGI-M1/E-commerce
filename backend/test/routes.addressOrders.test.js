const request = require('supertest');
const { User, AddressOrder } = require('../models'); // Assurez-vous que AddressOrder est bien défini dans vos modèles
const server = request('http://localhost:3000');

let user;
let cookie;

const getUser = async () => {

  if (user) return user;

  user = await User.create({
    firstname: 'John',
    lastname: 'Doe',
    email: 'zorglux+addressorders@zorglux.com',
    password: 'Password123254369!',
  });

  return user;
  
};

const getCookie = async () => {

  if(!user) await getUser();

  if (cookie) return cookie;

  const loginResponse = await server
    .post('/login')
    .send({
      email: user.email,
      password: 'Password123254369!',
    })
    .expect(200);

  cookie = loginResponse.headers['set-cookie'];

  return cookie;

}

describe('Commandes routes', () => {

  it('should create a new address order', async () => {

    const newAddressData = {
      street: '123 Rue de Test',
      postalCode: '12345',
      city: 'Test City',
      country: 'Test Country',
    };

    const response = await server
      .post('/addressorders')
      .send(newAddressData)
      .set('Cookie', await getCookie())
      .expect(201);

    expect(response.body.street).toBe(newAddressData.street);
    expect(response.body.postalCode).toBe(newAddressData.postalCode);
    expect(response.body.city).toBe(newAddressData.city);
    expect(response.body.country).toBe(newAddressData.country);
  });

  it('should return 200 if address order is present', async () => {

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

    const response = await server
      .get(`/addressorders/${addressOrder.id}`)
      .set('Cookie', await getCookie())
      .expect(200);

    expect(response.body.street).toBe(newAddressData.street);
    expect(response.body.postalCode).toBe(newAddressData.postalCode);
    expect(response.body.city).toBe(newAddressData.city);
    expect(response.body.country).toBe(newAddressData.country);
    expect(response.body.id).toBe(addressOrder.id);

  });

});
