const request = require('supertest');
const { User, AlertUser, Alert, Product, AlertUserProduct } = require('../models');
const server = request('http://localhost:3000');

let user;
let cookie;
let product;

const getUser = async () => {

  if (user) return user;

  try {
    user = await User.create({
      firstname: 'John',
      lastname: 'Doe',
      email: 'zorglux+alertuser@zorglux.com',
      password: 'Password123254369!',
      active: true
    });
  } catch (e) {
    user = await User.findOne({
      where: {
        firstname: 'John',
        lastname: 'Doe',
        email: 'zorglux+alertuser@zorglux.com',
      }
    })
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

async function initializeAlert() {
  const newsLetter = await Alert.findOne({
    where: {
      name: "news_letter"
    }
  });

  const restockAlert = await Alert.findOne({
    where: {
      name: "restock_product"
    }
  });

  product = await Product.findOne({
    where: {
      name: "ProductTestAlert"
    }
  });

  if (!product) {
    product = await Product.create({
      name: "ProductTestAlert",
      reference: "REF0022",
      price: 10.82,
      active: true,
      description: "Description of ProductTestAlert"
    });
  }

  if (user === undefined) {
    await getUser();
  }

  const existAlertUser = await AlertUser.findOne({
    where: {
      user_id: user.id,
      alert_id: newsLetter.id
    }
  });

  if (!existAlertUser) {
    await AlertUser.create({
      user_id: user.id,
      alert_id: newsLetter.id
    });
  }

  let existAlertUserRestock = await AlertUser.findOne({
    where: {
      user_id: user.id,
      alert_id: restockAlert.id
    }
  });

  if (!existAlertUserRestock) {
    existAlertUserRestock = await AlertUser.create({
      user_id: user.id,
      alert_id: restockAlert.id
    });
  }

  const existAlertUserRestockProduct = await AlertUserProduct.findOne({
    where: {
      alertUserId : existAlertUserRestock.id,
      productId : product.id
    }
  });

  if (!existAlertUserRestockProduct) {
    await AlertUserProduct.create({
      alertUserId : existAlertUserRestock.id,
      productId: product.id
    });
  }
}

describe('Alerts routes', () => {

  beforeEach(async () => {
    await initializeAlert();
  });

  it('should get all alerts of the current user', async () => {
    const cookie = await getCookie();
    const response = await server
      .get(`/alerts/user/${user.id}`)
      .set('Cookie', cookie);
    const newsLetter = await Alert.findOne({
      where: {
        name: "news_letter"
      }
    });
    expect(response.body).toContain(newsLetter.id);
  });

  it('should get all restock product alerts of the search user', async () => {
    const cookie = await getCookie();
    const restockAlert = await Alert.findOne({
      where: {
        name: "restock_product"
      }
    });

    const userRestockAlert = await AlertUser.findOne({
      where: {
        user_id: user.id,
        alert_id: restockAlert.id
      }
    });

    const alertUserProduct = await AlertUserProduct.findOne({
      where: {
        alertUserId : userRestockAlert.id,
        productId : product.id
      }
    });

    const response = await server
      .get(`/alerts/${restockAlert.id}/user/${user.id}`)
      .set('Cookie', cookie);

    expect(response.body[0].productId).toBe(alertUserProduct.productId);
    expect(response.body[0].productId).toBe(alertUserProduct.productId);
  });

  it('should get user alert restock of a product', async () => {
    const cookie = await getCookie();
    const restockAlert = await Alert.findOne({
      where: {
        name: "restock_product"
      }
    });

    const userRestockAlert = await AlertUser.findOne({
      where: {
        user_id: user.id,
        alert_id: restockAlert.id
      }
    });

    const alertUserProduct = await AlertUserProduct.findOne({
      where: {
        alertUserId : userRestockAlert.id,
        productId : product.id
      }
    });

    const response = await server
      .get(`/alerts/${restockAlert.id}/user/${user.id}/product/${product.id}`)
      .set('Cookie', cookie);

    expect(response.body.productId).toBe(alertUserProduct.productId);
    expect(response.body.productId).toBe(alertUserProduct.productId);
  });

  it('should enable an alert to user', async () => {
    const cookie = await getCookie();
    const newProduct = await Alert.findOne({
      where: {
        name: "new_product"
      }
    });

    await server
      .post(`/alerts/${newProduct.id}/user/${user.id}`)
      .set('Cookie', cookie).expect(201);
  });

  it('should enable the restock alert of user on the selected product', async () => {
    const cookie = await getCookie();
    const restockAlert = await Alert.findOne({
      where: {
        name: "restock_product"
      }
    });

    const newproduct = await Product.create({
      name: "ProductTestAlert3",
      reference: "REF00223",
      price: 10.823,
      active: true,
      description: "Description of ProductTestAlert3"
    });

    await server
      .post(`/alerts/${restockAlert.id}/user/${user.id}/product/${newproduct.id}`)
      .set('Cookie', cookie).expect(201);
  });

  it('should disable an alert to user', async () => {
    const cookie = await getCookie();
    const newsLetter = await Alert.findOne({
      where: {
        name: "news_letter"
      }
    });

    await server
      .delete(`/alerts/${newsLetter.id}/user/${user.id}`)
      .set('Cookie', cookie).expect(204);
  });

  it('should disable the restock alert of user on the selected product', async () => {
    const cookie = await getCookie();
    const restockAlert = await Alert.findOne({
      where: {
        name: "restock_product"
      }
    });

    const newproduct = await Product.findOne({
      where: {
        name: "ProductTestAlert3",
        reference: "REF00223",
        price: 10.823,
        active: true,
        description: "Description of ProductTestAlert3"
      }
    });
    await server
      .delete(`/alerts/${restockAlert.id}/user/${user.id}/product/${newproduct.id}`)
      .set('Cookie', cookie).expect(204);
  });

});