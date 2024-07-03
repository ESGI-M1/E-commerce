let request = require('supertest');
request = request('http://localhost:3000');
const { PromoCode, Cart } = require('../models');

describe('Promos routes', () => {
    it('should create a new promo code', async () => {
    const newPromoData = {
      code: 'PROMO123',
      startDate: '2024-07-01',
      endDate: '2024-07-31',
      discountPercentage: 10,
    };

    const response = request
      .post('/promos')
      .send(newPromoData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.code).toEqual(newPromoData.code);
    expect(response.body.startDate).toEqual(newPromoData.startDate);
    expect(response.body.endDate).toEqual(newPromoData.endDate);
    expect(response.body.discountPercentage).toEqual(newPromoData.discountPercentage);
  });

  it('should return 400 if any required field is missing', async () => {
    const invalidPromoData = {
    };

    const response = request
      .post('/promos')
      .send(invalidPromoData)
      .expect(400);

    expect(response.body.error).toEqual('All fields are required');
  });

  it('should update an existing promo code', async () => {
    const promo = await PromoCode.create({
      code: 'PROMO123',
      startDate: '2024-07-01',
      endDate: '2024-07-31',
      discountPercentage: 10,
    });

    const updatedPromoData = {
      code: 'UPDATEDPROMO123',
      startDate: '2024-08-01',
      endDate: '2024-08-31',
      discountPercentage: 20,
    };

    const response = request
      .put(`/promos/${promo.id}`)
      .send(updatedPromoData)
      .expect(200);

    expect(response.body.code).toEqual(updatedPromoData.code);
    expect(response.body.startDate).toEqual(updatedPromoData.startDate);
    expect(response.body.endDate).toEqual(updatedPromoData.endDate);
    expect(response.body.discountPercentage).toEqual(updatedPromoData.discountPercentage);
  });

  it('should return 404 if the promo code does not exist', async () => {
    const nonExistentPromoId = 'non-existent-promo-id';

    const updatedPromoData = {
      code: 'NONEXISTENTPROMO123',
      startDate: '2024-08-01',
      endDate: '2024-08-31',
      discountPercentage: 20,
    };

    const response = request
      .put(`/promos/${nonExistentPromoId}`)
      .send(updatedPromoData)
      .expect(404);

    expect(response.body.error).toEqual('Promo code not found');
  });

  it('should verify a valid promo code', async () => {
    const promo = await PromoCode.create({
      code: 'VALIDPROMO123',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)), 
      discountPercentage: 10,
    });

    const response = request
      .post(`/promos/${promo.code}`)
      .expect(200);

    expect(response.body.success).toBeTruthy();
    expect(response.body.discountPercentage).toEqual(promo.discountPercentage);
  });

  it('should return 404 for a non-existent promo code', async () => {
    const nonExistentPromoCode = 'NONEXISTENTPROMO';

    const response = request
      .post(`/promos/${nonExistentPromoCode}`)
      .expect(404);

    expect(response.body.error).toEqual('Promo code not found');
  });

  it('should return 400 for an expired promo code', async () => {
    const expiredPromo = await PromoCode.create({
      code: 'EXPIREDPROMO123',
      startDate: new Date(new Date().setDate(new Date().getDate() - 2)),
      endDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      discountPercentage: 10,
    });

    const response = request
      .post(`/promos/${expiredPromo.code}`)
      .expect(400);

    expect(response.body.error).toEqual('Ce code promo est invalide ou a expiré.');
  });

  it('should apply a valid promo code to a user\'s cart', async () => {
    const promo = await PromoCode.create({
      code: 'APPLYPROMO123',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      discountPercentage: 10,
    });

    const userId = 1;
    const cart = await Cart.create({ userId });

    const response = request
      .post(`/promocodes/${promo.code}/apply`)
      .query({ userId })
      .expect(200);

    expect(response.body.success).toBeTruthy();
    expect(response.body.discountPercentage).toEqual(promo.discountPercentage);
    expect(response.body.code).toEqual(promo.code);

    const updatedCart = await Cart.findOne({ where: { userId } });
    expect(updatedCart.promoCodeId).toEqual(promo.id);
  });

  it('should return 400 for an expired promo code', async () => {
    const promo = await PromoCode.create({
      code: 'EXPIREDPROMO123',
      startDate: new Date(new Date().setDate(new Date().getDate() - 2)),
      endDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      discountPercentage: 10,
    });

    const userId = 2;
    const cart = await Cart.create({ userId });

    const response = request
      .post(`/promos/${promo.code}/apply`)
      .query({ userId })
      .expect(400);

    expect(response.body.error).toEqual('Ce code promo a expiré.');
  });

  it('should return 404 for a non-existent promo code', async () => {
    const userId = 3; 
    const cart = await Cart.create({ userId });

    const response = request
      .post(`/promos/NONEXISTENTPROMO/apply`)
      .query({ userId })
      .expect(404);

  });

  it('should return 500 if an error occurs', async () => {
    const userId = 4;
    const cart = await Cart.create({ userId });

    const response = request
      .post(`/promos/INVALIDCODE/apply`)
      .query({ userId })
      .expect(500);

    expect(response.body.error).toEqual('Unable to apply promo code.');
  });
});
