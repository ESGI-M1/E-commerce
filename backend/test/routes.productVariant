const request = require('supertest');
const { ProductVariant, Product, AttributeValue, Attribute, Image, User } = require('../models');
const server = request('http://localhost:3000');

let user;
let cookie;
let product;

const getUser = async () => {
  if (user) return user;

  user = await User.create({
    firstname: 'John',
    lastname: 'Doe',
    email: 'zorglux+productvariantuser@zorglux.com',
    password: 'Password123254369!',
    role: 'admin'
  });

  return user;
};

const getCookie = async () => {
  if (!user) await getUser();

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

const getProduct = async () => {
  if (product) return product;

  product = await Product.create({
    name: 'Test Product',
    description: 'Test Description',
  });

  return product;
};

beforeAll(async () => {
  user = await getUser();
  cookie = await getCookie();
  product = await getProduct();
});

describe('ProductVariant routes', () => {
  it('should create a new product variant with valid details', async () => {
    const productVariantData = {
      reference: 'PV123',
      price: 99.99,
      stock: 10,
      productId: product.id
    };

    const response = await server
      .post('/productVariants')
      .set('Cookie', cookie)
      .send(productVariantData)
      .expect(201);

    expect(response.body.reference).toBe(productVariantData.reference);
    expect(response.body.price).toBe(String(productVariantData.price)); // Comparaison des nombres en tant que chaînes pour les décimales
    expect(response.body.stock).toBe(productVariantData.stock);
    expect(response.body.productId).toBe(productVariantData.productId);
  });

  it('should delete a product variant', async () => {
    const productVariantData = {
      reference: 'PV125',
      price: 299.99,
      stock: 2,
      productId: product.id
    };

    const productVariant = await ProductVariant.create(productVariantData);

    await server
      .delete(`/productVariants/${productVariant.id}`)
      .set('Cookie', cookie)
      .expect(204);
  });

  it('should set a product variant as default', async () => {
    const productVariantData = {
      reference: 'PV126',
      price: 399.99,
      stock: 1,
      productId: product.id,
      default: false
    };

    const productVariant = await ProductVariant.create(productVariantData);

    await server
      .post(`/productVariants/set-default/${productVariant.id}`)
      .set('Cookie', cookie)
      .expect(200);

    const updatedProductVariant = await ProductVariant.findByPk(productVariant.id);
    expect(updatedProductVariant.default).toBe(true);
  });
});
