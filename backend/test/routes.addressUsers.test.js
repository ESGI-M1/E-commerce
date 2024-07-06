const request = require('supertest');
const { User, AddressUser } = require('../models');
const server = request('http://localhost:3000');

let user;
let cookie;

const getUser = async () => {

  if (user) return user;

  user = await User.create({
    firstname: 'John',
    lastname: 'Doe',
    email: 'zorglux+addressusers@zorglux.com',
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

describe('User Address Routes', () => {

  it('should create a new address for a user', async () => {

    const user = await getUser();

    const newAddressData = {
      street: '123 Main St',
      postalCode: '12345',
      city: 'Cityville',
      country: 'Countryland',
      userId: user.id
    };

    const response = await server
      .post('/addressusers')
      .send(newAddressData)
      .set('Cookie', await getCookie())
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.street).toEqual(newAddressData.street);
    expect(response.body.postalCode).toEqual(newAddressData.postalCode);
    expect(response.body.city).toEqual(newAddressData.city);
    expect(response.body.country).toEqual(newAddressData.country);
    expect(response.body.userId).toEqual(user.id);
  });

  it('should return 404 if user does not exist', async () => {
    const nonExistentUserId = 'non-existent-user-id';

    const newAddressData = {
      street: '123 Main St',
      postalCode: '12345',
      city: 'Cityville',
      country: 'Countryland',
    };

    await server
      .post(`/addressusers/${nonExistentUserId}`)
      .send(newAddressData)
      .expect(404);
  });

  it('should update an existing address for a user', async () => {

    const user = await getUser();

    const address = await AddressUser.create({
      street: '456 Oak St',
      postalCode: '54321',
      city: 'Villageville',
      country: 'Otherland',
      userId: user.id
    });

    const updatedAddressData = {
      street: '789 Elm St',
      postalCode: '67890',
      city: 'Townsville',
      country: 'Anotherland',
    };

    const cookie = await getCookie();

    const response = await server
      .put(`/addressusers/${address.id}`)
      .send(updatedAddressData)
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body).toHaveProperty('id', address.id);
    expect(response.body.street).toEqual(updatedAddressData.street);
    expect(response.body.postalCode).toEqual(updatedAddressData.postalCode);
    expect(response.body.city).toEqual(updatedAddressData.city);
    expect(response.body.country).toEqual(updatedAddressData.country);
    expect(response.body.userId).toEqual(user.id);
  });

  it('should return 404 if address does not exist (update)', async () => {
    const nonExistentAddressId = 10001;

    const cookie = await getCookie();

    await server
      .put(`/addressusers/${nonExistentAddressId}`)
      .set('Cookie', cookie)
      .send({
        street: '789 Elm St',
        postalCode: '67890',
        city: 'Townsville',
        country: 'Anotherland',
      })
      .expect(404);
  });

  it('should delete an existing address for a user', async () => {

    const user = await getUser();

    const address = await AddressUser.create({
      street: '890 Pine St',
      postalCode: '98765',
      city: 'Hamletville',
      country: 'Fantasyland',
      userId: user.id
    });

    const cookie = await getCookie();

    await server
      .delete(`/addressusers/${address.id}`)
      .set('Cookie', cookie)
      .expect(204);

    const deletedAddress = await AddressUser.findByPk(address.id);
    expect(deletedAddress).toBeNull();
  });

  it('should return 404 if address does not exist (delete)', async () => {
    const nonExistentAddressId = 10001;

    await server
      .delete(`/addressusers/${nonExistentAddressId}`)
      .set('Cookie', await getCookie())
      .expect(404);
  });

  it('should return 200 if address user is present', async () => {

    const newAddressData = {
      street: '1278 Rue de Moulin',
      postalCode: '51234',
      city: 'Test Paris',
      country: 'Test Belgium',
    };

    const user = await getUser();

    const addressUser = await AddressUser.create({
      street: newAddressData.street,
      postalCode: newAddressData.postalCode,
      city: newAddressData.city,
      country: newAddressData.country,
      userId: user.id
    });

    const cookie = await getCookie();

    const response = await server
      .get(`/addressusers/${addressUser.id}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body.street).toBe(newAddressData.street);
    expect(response.body.postalCode).toBe(newAddressData.postalCode);
    expect(response.body.city).toBe(newAddressData.city);
    expect(response.body.country).toBe(newAddressData.country);
    expect(response.body.id).toBe(addressUser.id);
    expect(response.body.userId).toBe(user.id);

  });

});
