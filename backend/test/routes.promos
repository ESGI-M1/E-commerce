const request = require('supertest');
const { User, PromoCode } = require('../models'); // Assurez-vous du bon chemin d'accès à vos modèles
const server = request('http://localhost:3000');
let user;
let cookie;

const getUser = async () => {
  user = User.findOne({ where: { email: 'zorglux+addressusers@zorglux.com' } });

  if (!user) {
    user = User.create({
      firstname: 'John',
      lastname: 'Doe',
      email: 'zorglux+addressusers@zorglux.com',
      password: 'Password123254369!',
      role: 'admin'
    });
  }

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

describe('PromoCode routes', () => {

  beforeAll(async () => {
    user = await getUser();
  });

  it('should update a promo code with valid details', async () => {
    const promo = PromoCode.create({
      code: 'SUMMER2024',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      discountPercentage: 15
    });

    const updatedData = {
      code: 'AUTUMN2024',
      startDate: '2024-09-01',
      endDate: '2024-11-30',
      discountPercentage: 20
    };

    const response = await server
      .put(`/promos/${promo.id}`)
      .send(updatedData)
      .set('Cookie', await getCookie())
      .expect(200);

    expect(response.body.code).toBe(updatedData.code);
    expect(response.body.startDate).toBe(updatedData.startDate);
    expect(response.body.endDate).toBe(updatedData.endDate);
    expect(response.body.discountPercentage).toBe(updatedData.discountPercentage);
  });

  it('should verify promo code with valid code', async () => {
    const promo = {
      code: 'SUMMER2024',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      discountPercentage: 15
    };

    const response = await server
      .post(`/promos/${promo.code}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.discountPercentage).toBe(promo.discountPercentage);
  });

  it('should apply promo code to user cart with valid code and user ID', async () => {
    const promo = PromoCode.create({
      code: 'SUMMER2024',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      discountPercentage: 15
    });

    const response = await server
      .post(`/promos/${promo.code}/apply`)
      .set('Cookie', await getCookie())
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.discountPercentage).toBe(promo.discountPercentage);
    expect(response.body.code).toBe(promo.code);

    // Vérifiez la mise à jour du panier utilisateur si nécessaire
    const updatedUser = await User.findByPk(user.id);
    expect(updatedUser.promoCodeId).toBe(promo.id);
  });

});
