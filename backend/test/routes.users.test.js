let request = require('supertest');
request = request('http://localhost:3000');

describe('Utilisateurs routes', () => {

  it('should fail to register with wrong email', async () => {
    request
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
    request
      .post('/users')
      .send({
        email: 'toto@toto.com',
        password: 'Toto123456!',
        lastname: 'toto'
      })
      .expect(500);
  });

  it('should fail to register with empty last name', async () => {
    request
      .post('/users')
      .send({
        email: 'toto@toto.com',
        password: 'Toto123456!',
        firstname: 'toto'
      })
      .expect(500);
  });

  it('should register with correct details', async () => {
    request
      .post('/users')
      .send({
        email: 'toto@toto.com',
        password: 'Toto123456!',
        firstname: 'toto',
        lastname: 'toto'
      })
      .expect(201);
  });

  it('should login with correct credentials', async () => {
    request
      .post('/login')
      .send({
        email: 'toto@toto.com',
        password: 'Toto123456!'
      })
      .expect(200);

  });

  it('should fail to login with wrong email', async () => {
    request
      .post('/login')
      .send({
        email: 'wrong@toto.com',
        password: 'Toto123456!'
      })
      .expect(401);
  });
});
