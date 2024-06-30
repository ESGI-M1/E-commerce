const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = (req, res, next) => {
  const token = req.cookies.JWT;
  console.log(token);

  if (!token) return res.sendStatus(401);

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
 
    if (!decoded || decoded.purpose !== 'authentication') {
      res.clearCookie("JWT");
      return res.sendStatus(401);
    }
  
    const user = User.findByPk(decoded.id);
  
    req.user = user;
  }
  catch(err){
    res.clearCookie("JWT");
    return res.sendStatus(401);
  }

  next();
};