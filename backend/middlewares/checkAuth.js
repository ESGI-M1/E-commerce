const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = (req, res, next) => {
  const token = req.signedCookies.JWT;

  if (!token) return res.sendStatus(401);

  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    if (!decoded || decoded.purpose !== 'authentication') {
      res.clearCookie("JWT");
      return res.sendStatus(401);
    }
  
    const user = User.findByPk(decoded.id);
  
    if (!user) {
      res.clearCookie("JWT");
      return res.sendStatus(401);
    }

    req.user = user;
    next();
  }
  catch(err){
    console.log(err);
    res.clearCookie("JWT");
    return res.sendStatus(401);
  }
};