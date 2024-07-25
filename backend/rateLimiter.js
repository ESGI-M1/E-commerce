const rateLimit = require("express-rate-limit");

const limiterSecurity = rateLimit({
  windowMs: 60 * 1000, // 1 minute by default
  max: 10, // limit each IP to 10 requests per windowMs by default
  message: "Too many requests, please try again later."
});

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute by default
  max: 300, // limit each IP to 10 requests per windowMs by default
  message: "Too many requests, please try again later."
});

module.exports = { limiter, limiterSecurity }