const request = require('supertest');
const { Attribute, AttributeValue, User } = require('../models');
const server = request('http://localhost:3000');

let adminUser;
let adminCookie;

const getAdminUser = async () => {
  if (adminUser) return adminUser;

  adminUser = await User.create({
    firstname: 'Admin',
    lastname: 'User',
    email: 'admin@domain.com',
    password: 'AdminPassword123!',
    role: 'admin',
  });

  return adminUser;
};

const getAdminCookie = async () => {
  if (!adminUser) await getAdminUser();

  if (adminCookie) return adminCookie;

  const loginResponse = await server
    .post('/login')
    .send({
      email: adminUser.email,
      password: 'AdminPassword123!',
    })
    .expect(200);

  adminCookie = loginResponse.headers['set-cookie'];

  return adminCookie;
};

beforeAll(async () => {
  adminUser = await getAdminUser();
  adminCookie = await getAdminCookie();
});

describe('Attribute routes', () => {
  it('should create a new attribute with valid details', async () => {
    const attributeData = {
      name: 'Color',
      values: [
        { value: 'Red' },
        { value: 'Blue' }
      ]
    };

    const response = await server
      .post('/attributes')
      .set('Cookie', adminCookie)
      .send(attributeData)
      .expect(201);

    expect(response.body.name).toBe(attributeData.name);
    expect(response.body.values).toHaveLength(attributeData.values.length);
  });

  it('should update an attribute with valid details', async () => {
    const attribute = await Attribute.create({
      name: 'Size',
      values: [
        { value: 'Small' },
        { value: 'Medium' }
      ]
    }, {
      include: [{ model: AttributeValue, as: 'values' }]
    });

    const updatedData = {
      name: 'Updated Size',
      values: [
        { id: attribute.values[0].id, value: 'Large' },
        { value: 'Extra Large' } // Adding new value
      ]
    };

    const response = await server
      .patch(`/attributes/${attribute.id}`)
      .set('Cookie', adminCookie)
      .send(updatedData)
      .expect(200);

    expect(response.body.name).toBe(updatedData.name);
    expect(response.body.values).toHaveLength(updatedData.values.length);
    expect(response.body.values[0].value).toBe(updatedData.values[0].value);
  });

  it('should delete an attribute', async () => {
    const attribute = await Attribute.create({
      name: 'Material',
      values: [{ value: 'Cotton' }]
    }, {
      include: [{ model: AttributeValue, as: 'values' }]
    });

    await server
      .delete(`/attributes/${attribute.id}`)
      .set('Cookie', adminCookie)
      .expect(204);

    const deletedAttribute = await Attribute.findByPk(attribute.id);
    expect(deletedAttribute).toBeNull();
  });

  it('should replace an attribute with valid details', async () => {
    const attribute = await Attribute.create({
      name: 'Pattern',
      values: [{ value: 'Striped' }]
    }, {
      include: [{ model: AttributeValue, as: 'values' }]
    });

    const replacementData = {
      name: 'Updated Pattern',
      values: [{ value: 'Checked' }]
    };

    const response = await server
      .put(`/attributes/${attribute.id}`)
      .set('Cookie', adminCookie)
      .send(replacementData)
      .expect(200);

    expect(response.body.name).toBe(replacementData.name);
    expect(response.body.values).toHaveLength(replacementData.values.length);
    expect(response.body.values[0].value).toBe(replacementData.values[0].value);
  });

});
