const request = require('supertest');
const { Category, Product, User } = require('../models');
const server = request('http://localhost:3000');

let cookie;
let user;

const getUser = async () => {
  if (user) return user;

  user = User.create({
    firstname: 'John',
    lastname: 'Doe',
    email: 'admin@zorglux.com',
    password: 'Password123254369!',
    role: 'admin'
  });

  return user;
};

const getCookie = async () => {
  if (!user) getUser();

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
};

beforeAll(async () => {
  await getCookie();
});

describe('Product routes', () => {

  it('should create a new product', async () => {
    const newProduct = {
      name: 'Laptop',
      reference: 'LT123',
      price: 1500,
      active: true,
      description: 'High-end gaming laptop',
    };

    const response = await server
      .post('/products')
      .set('Cookie', cookie)
      .send(newProduct)
      .expect(201);

    expect(response.body.name).toBe(newProduct.name);
    expect(response.body.reference).toBe(newProduct.reference);
  });

  it('should update a product with categories', async () => {
    const product = Product.create({
      name: 'Smartphone',
      reference: 'SP123',
      price: 800,
      active: true,
      description: 'Latest model smartphone',
    });

    const category1 = Category.create({
      name: 'Electronics',
      description: 'Electronic items',
    });

    const category2 = Category.create({
      name: 'Gadgets',
      description: 'Various gadgets',
    });

    const response = await server
      .patch(`/products/${product.id}`)
      .set('Cookie', cookie)
      .send({
        name: 'Updated Smartphone',
        Categories: [category1.id, category2.id],
      })
      .expect(200);

    expect(response.body.name).toBe('Updated Smartphone');
    const updatedProduct = Product.findByPk(product.id, { include: Category });
    expect(updatedProduct.Categories.length).toBe(2);
  });

  it('should delete a product', async () => {
    const product = Product.create({
      name: 'Temporary Product',
      reference: 'TP123',
      price: 300,
      active: true,
      description: 'This product will be deleted',
    });

    await server
      .delete(`/products/${product.id}`)
      .set('Cookie', cookie)
      .expect(204);

    const deletedProduct = Product.findByPk(product.id);
    expect(deletedProduct).toBeNull();
  });

  it('should replace a product', async () => {
    const product = Product.create({
      name: 'Old Product',
      reference: 'OP123',
      price: 1000,
      active: true,
      description: 'This product will be replaced',
    });

    const newProductData = {
      name: 'New Product',
      reference: 'NP123',
      price: 1200,
      active: true,
      description: 'This is the new product',
      Categories: []
    };

    const response = await server
      .put(`/products/${product.id}`)
      .set('Cookie', cookie)
      .send(newProductData)
      .expect(200);

    expect(response.body.name).toBe(newProductData.name);
    expect(response.body.reference).toBe(newProductData.reference);

    const replacedProduct = Product.findByPk(product.id);
    expect(replacedProduct.name).toBe(newProductData.name);
  });

});
