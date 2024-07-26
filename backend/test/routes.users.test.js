let request = require('supertest');
const { User } = require('../models');
const server = request('http://localhost:3000');

describe('Utilisateurs routes', () => {

  it('should fail to register with wrong email', async () => {
    await server
      .post('/users')
      .send({
        email: 'toto@toto',
        password: 'Toto123456!',
        firstname: 'toto',
        lastname: 'toto'
      })
      .expect(500);
  });

  it('should fail to register with empty first name', async () => {
    await server
      .post('/users')
      .send({
        email: 'toto@zorglux.com',
        password: 'Toto123456!',
        lastname: 'toto'
      })
      .expect(500);
  });

  it('should fail to register with empty last name', async () => {
    await server
      .post('/users')
      .send({
        email: 'toto@zorglux.com',
        password: 'Toto123456!',
        firstname: 'toto'
      })
      .expect(500);
  });

  it('should register with correct details', async () => {
    await server
      .post('/users')
      .send({
        email: 'toto@zorglux.com',
        password: 'Toto123456!',
        firstname: 'toto',
        lastname: 'toto'
      })
      .expect(201);
  });

  it('should fail to register with already registered email', async () => {

    const user = await User.create({
      email: 'already@zorglux.com',
      password: 'Toto123456!',
      firstname: 'toto',
      lastname: 'toto'
    });

    await server
      .post('/users')
      .send({
        email: user.email,
        password: 'Toto123456!',
        firstname: 'toto',
        lastname: 'toto'
      })
      .expect(400);

  });

  it('should fail to register with role admin', async () => {
    await server
      .post('/users')
      .send({
        email: 'admin@zorglux.com',
        password: 'Toto123456!',
        firstname: 'admin',
        lastname: 'admin',
        role: 'admin'
      })
      .expect(401);

  });
    

  it('should login with correct credentials', async () => {

    const user = await User.create({
      email: 'zorglux+users@zorglux.com',
      password: 'Toto123456!',
      firstname: 'toto',
      lastname: 'toto'
    });

    await server
      .post('/login')
      .send({
        email: user.email,
        password: 'Toto123456!'
      })
      .expect(200);

  });

  it('should fail to login with unregistered email', async () => {
    await server
      .post('/login')
      .send({
        email: 'wrong@zorglux.com',
        password: 'Toto123456!'
      })
      .expect(401);
  });
});
