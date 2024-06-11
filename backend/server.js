const express = require("express");
const cookieParser = require("cookie-parser");

const UserRouter = require("./routes/user");
const ProductRouter = require("./routes/product");
const CategoryRouter = require("./routes/category");
const ImageRouter = require("./routes/image");
const CartRouter = require("./routes/cart");
const SecurityRouter = require("./routes/security");

const app = express();
const cors = require('cors')
require ("./migrate");

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

app.use(SecurityRouter);
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});