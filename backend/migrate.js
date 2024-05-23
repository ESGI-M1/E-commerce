const connection = require("./models/db");

// User
require("./models/user");

// Product
require("./models/product/product");
require("./models/product/category");
require("./models/product/image");
require("./models/product/productRelation");

connection
  .sync({ alter: true })
  .then(() => console.log("Database synced"))
  //.then(() => connection.close());
