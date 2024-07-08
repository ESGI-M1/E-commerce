let request = require('supertest');
const { User, Product, Favorite } = require("../models");
const server = request('http://localhost:3000');

let user;
let cookie;

const getUser = async () => {

  if (user) return user;

  user = await User.create({
    firstname: 'John',
    lastname: 'Doe',
    email: 'zorglux+favorites@zorglux.com',
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

describe('Favoris routes', () => {

  it('should add a product to favorites', async () => {

    const product = await Product.create({
      name: 'Product Test',
      price: 10.99,
      description: 'Test product description',
      reference: 'product-test',
    });

    const user = await getUser();

    const newFavoriteData = {
      userId: user.id,
      productId: product.id,
    };

    const cookie = await getCookie();

    server
      .post('/favorites')
      .send(newFavoriteData)
      .set('Cookie', cookie)
      .expect(201)
      .then(response => {
        expect(response.body).toHaveProperty('id');
        expect(response.body.userId).toEqual(newFavoriteData.userId);
        expect(response.body.productId).toEqual(newFavoriteData.productId);
      });

  });

  it('should return 400 if userId or productId are missing', async () => {
    const invalidFavoriteData = {
    };

    const cookie = await getCookie();

    server
      .post('/favorites')
      .send(invalidFavoriteData)
      .set('Cookie', cookie)
      .expect(400)

  });

  it('should return 404 if product does not exist', async () => {
    const nonExistentProductId = 2000

    const nonExistentFavoriteData = {
      productId: nonExistentProductId,
    };

    const cookie = await getCookie();

    const response = await server
      .post('/favorites')
      .send(nonExistentFavoriteData)
      .set('Cookie', cookie)
      .expect(404)
   
    expect(response.body.error).toEqual('Product not found');

  });

  it('should retrieve favorites for a user', async () => {

    const product1 = await Product.create({
      name: 'Product 1',
      price: 19.99,
      description: 'Test product 1 description',
      reference: 'product1',
    });

    const product2 = await Product.create({
      name: 'Product 2',
      price: 29.99,
      description: 'Test product 2 description',
      reference: 'product2',
    });

    const user = await getUser();

    await Favorite.create({
      userId: user.id,
      productId: product1.id,
    });

    await Favorite.create({
      userId: user.id,
      productId: product2.id,
    });

    const cookie = await getCookie();

    const response = await server
      .get('/favorites')
      .set('Cookie', cookie)
      .expect(200)
    
    // TODO Check if the response contains the two products
  });


  it('should delete a favorite product for a user', async () => {

    const product = await Product.create({
      name: 'Favorite Product',
      price: 15.99,
      description: 'Test favorite product description',
      reference: 'favorite-product',
    });

    const user = await getUser();

    await Favorite.create({
      userId: user.id,
      productId: product.id,
    });

    const cookie = await getCookie();

    await server
      .delete(`/favorites/${product.id}`)
      .set('Cookie', cookie)
      .expect(204)


    const deletedFavorite = await Favorite.findOne({
      where: { userId: user.id, productId: product.id },
    });
    expect(deletedFavorite).toBeNull();

  });

});
