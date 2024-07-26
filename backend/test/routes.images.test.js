const request = require('supertest');
const { Image, User, Product } = require('../models');
const server = request('http://localhost:3000');

let user;

const getUser = async () => {
  if (user) return user;

  user = User.create({
    firstname: 'John',
    lastname: 'Doe',
    email: 'test+@zorglux.com',
    password: 'Password123254369!',
  });

  return user;
};

describe('Image routes', () => {

  beforeAll(async () => {
    user = getUser();
  });

    it('should create a new image', async () => {
        const product = await Product.create({
          name: 'Sample Product',
          reference: 'SP123',
          price: 500,
          active: true,
          description: 'Sample product description',
        });
      
        const newImage = {
          url: 'http://example.com/image.jpg',
          description: 'Sample image description',
          productId: product.id,
        };
      
        const response = await server
          .post('/images')
          .send(newImage)
          .expect(201);
      
        expect(response.body.url).toBe(newImage.url);
        expect(response.body.description).toBe(newImage.description);
        expect(response.body.productId).toBe(newImage.productId);
      });
      

  it('should update an image', async () => {
    const image = await Image.create({
      url: 'http://example.com/old-image.jpg',
      description: 'Old image description',
      productId: null,
    });

    const updatedImage = {
      url: 'http://example.com/new-image.jpg',
      description: 'New image description',
      productId: null,
    };

    const response = await server
      .patch(`/images/${image.id}`)
      .send(updatedImage)
      .expect(200);

    expect(response.body.url).toBe(updatedImage.url);
    expect(response.body.description).toBe(updatedImage.description);
  });

  it('should replace an image', async () => {
    const image = await Image.create({
      url: 'http://example.com/replace-old-image.jpg',
      description: 'Old image description to be replaced',
      productId: null,
    });

    const newImageData = {
      url: 'http://example.com/replace-new-image.jpg',
      description: 'New image description',
      productId: null,
    };

    const response = await server
      .put(`/images/${image.id}`)
      .send(newImageData)
      .expect(200);

    expect(response.body.url).toBe(newImageData.url);
    expect(response.body.description).toBe(newImageData.description);

    const replacedImage = Image.findByPk(response.body.id);
    expect(replacedImage.url).toBe(newImageData.url);
  });

});
