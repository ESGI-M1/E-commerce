const connection = require("./models/db");
require("./models/user");
require("./models/product");
require("./models/category");

connection
  .sync({ alter: true })
  .then(() => console.log("Database synced"))
  //.then(() => connection.close());
