const express = require("express");
const cookieParser = require("cookie-parser");
const UserRouter = require("./routes/user");
const SecurityRouter = require("./routes/security");
const app = express();
const cors = require('cors')
require ("./migrate");

const options = {
  origin: ['http://localhost:3000'],
}

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors(options))

app.use("/users", UserRouter);
app.use(SecurityRouter);
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
