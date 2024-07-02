let request = require('supertest');
const { User, Product } = require("../models");
request = request('http://localhost:3000');

describe('Favoris routes', () => {

  it('should add a product to favorites', async () => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'Password123!',
    });

    const product = await Product.create({
      name: 'Product Test',
      price: 10.99,
      description: 'Test product description',
    });

    const newFavoriteData = {
      userId: user.id,
      productId: product.id,
    };

    const response = request
      .post('/favorites')
      .send(newFavoriteData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.userId).toEqual(newFavoriteData.userId);
    expect(response.body.productId).toEqual(newFavoriteData.productId);
  });

  it('should return 400 if userId or productId are missing', async () => {
    const invalidFavoriteData = {
    };

    const response = request
      .post('/favorites')
      .send(invalidFavoriteData)
      .expect(400);

    expect(response.body.error).toEqual('UserId and ProductId are required');
  });

  it('should return 404 if user or product does not exist', async () => {
    const nonExistentUserId = 'non-existent-user-id';
    const nonExistentProductId = 'non-existent-product-id';

    const nonExistentFavoriteData = {
      userId: nonExistentUserId,
      productId: nonExistentProductId,
    };

    const response = request
      .post('/favorites')
      .send(nonExistentFavoriteData)
      .expect(404);

    expect(response.body.error).toEqual('User or Product not found');
  });

  it('should retrieve favorites for a user', async () => {
    const user = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'Password456!',
    });

    const product1 = await Product.create({
      name: 'Product 1',
      price: 19.99,
      description: 'Test product 1 description',
    });

    const product2 = await Product.create({
      name: 'Product 2',
      price: 29.99,
      description: 'Test product 2 description',
    });

    await Favorite.create({
      userId: user.id,
      productId: product1.id,
    });

    await Favorite.create({
      userId: user.id,
      productId: product2.id,
    });

    const response = request
      .get(`/favorites/${user.id}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('id');
    expect(response.body[0]).toHaveProperty('userId', user.id);
    expect(response.body[0].product).toHaveProperty('id', product1.id);
    expect(response.body[1].product).toHaveProperty('id', product2.id);
  });

  it('should return 500 if an error occurs', async () => {
    const invalidUserId = 'invalid-user-id';

    const response = request
      .get(`/favorites/${invalidUserId}`)
      .expect(500);

    expect(response.body.error).toEqual('Une erreur est survenue lors de la récupération des favoris.');
  });

    it('should delete a favorite product for a user', async () => {
    const user = await User.create({
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      password: 'Password789!',
    });

    const product = await Product.create({
      name: 'Favorite Product',
      price: 15.99,
      description: 'Test favorite product description',
    });

    await Favorite.create({
      userId: user.id,
      productId: product.id,
    });

    const response = request
      .delete(`/favorites/${user.id}/${product.id}`)
      .expect(200);

    expect(response.body.success).toBeTruthy();

    const deletedFavorite = await Favorite.findOne({
      where: { userId: user.id, productId: product.id },
    });
    expect(deletedFavorite).toBeNull();
  });

  it('should return 500 if an error occurs', async () => {
    const invalidUserId = 'invalid-user-id';
    const invalidProductId = 'invalid-product-id';

    const response = request
      .delete(`/favorites/${invalidUserId}/${invalidProductId}`)
      .expect(500);

    expect(response.body.error).toEqual('Une erreur est survenue lors de la suppression du favori.');
  });

});
