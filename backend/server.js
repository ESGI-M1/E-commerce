const express = require("express");
const cookieParser = require("cookie-parser");

const UserRouter = require("./routes/user");
const ProductRouter = require("./routes/product");
const CategoryRouter = require("./routes/category");
const ImageRouter = require("./routes/image");
const CartRouter = require("./routes/cart");
const SecurityRouter = require("./routes/security");
const PromoRouter = require("./routes/promo");
const FavoriteRouter = require("./routes/favorite");
const OrderRouter = require("./routes/order");
const ReturnRouter = require("./routes/return");
var cron = require('node-cron');
const mailer = require('./services/mailer');
const { User } = require('./models')

//const StripeRouter = require("./stripe/stripe");

const app = express();
const cors = require('cors')
require ("./migrate");
require("./mongo/db");

const options = {
  origin: ['http://localhost:5173'],
}

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors(options))

app.use("/users", UserRouter);
app.use("/products", ProductRouter);
app.use('/categories', CategoryRouter);
app.use('/images', ImageRouter);
app.use('/carts', CartRouter);
app.use('/promos', PromoRouter);
app.use('/favorites', FavoriteRouter);
app.use('/orders', OrderRouter);
app.use('/return', ReturnRouter);

//app.use('/stripe', StripeRouter);
app.use(SecurityRouter);

// every 1st day of month, check if users last password modification are later than 60 days
cron.schedule('0 0 1 * *', async () => {
  try {
    const users = await User.findAll();
    for (let user of users) {
      let actualDate = new Date();
      let lastUpdate = user.lastPasswordUpdate;
      lastUpdate.setDate(lastUpdate.getDate() + 60);
      if (lastUpdate < actualDate) {
        await mailer.sendPasswordTooOld(user);
      }
    }
  } catch (e) {
    console.log("Error while getting users");
  }
})

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});