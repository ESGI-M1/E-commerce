const express = require("express");
const cookieParser = require("cookie-parser");

const checkAuth = require("./middlewares/checkAuth");
const bodyParser = require('body-parser');

const UserRouter = require("./routes/user");
const ProductRouter = require("./routes/product");
const ProductVariantRouter = require("./routes/productVariant");
const CategoryRouter = require("./routes/category");
const ImageRouter = require("./routes/image");
const CartRouter = require("./routes/cart");
const CartProductsRouter = require("./routes/cartProducts");
const SecurityRouter = require("./routes/security");
const PromoRouter = require("./routes/promo");
const FavoriteRouter = require("./routes/favorite");
const OrderRouter = require("./routes/order");
const ReturnRouter = require("./routes/return");
const StripeRouter = require("./stripe/stripe");
const rateLimiter = require('./rateLimiter');
const AlertsRouter = require("./routes/alertUser")
const NewsLetterRouter = require("./routes/newLetter");
const PaypalRouter = require("./paypal/paypal");
const AddressOrderRouter = require("./routes/addressOrder");
const AddressUserRouter = require("./routes/addressUser");
const StatsRouter = require("./routes/stats");
const ShopRouter = require("./routes/shop");

const app = express();
const cors = require('cors')
require('./services/cron');

const options = {
  origin: 'http://localhost:5173',
  credentials: true,
};

require('./migrate');

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors(options))
app.use(bodyParser.json());

app.use("/users", UserRouter, checkAuth);
app.use("/products", ProductRouter);
app.use("/productVariants", ProductVariantRouter);
app.use('/categories', CategoryRouter);
app.use('/images', ImageRouter);
app.use('/carts', CartRouter);
app.use('/promos', PromoRouter);
app.use('/favorites', FavoriteRouter);
app.use('/orders', OrderRouter);
app.use('/return', ReturnRouter);
app.use('/cartproducts', CartProductsRouter);
app.use('/stripe', StripeRouter);
app.use('/alerts', AlertsRouter);
app.use('/newsletters', NewsLetterRouter);
app.use('/paypal', PaypalRouter);
app.use('/addressorders', AddressOrderRouter);
app.use('/addressusers', AddressUserRouter);
app.use('/stats', StatsRouter);
app.use('/shop', ShopRouter);
app.use(SecurityRouter, rateLimiter);

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});