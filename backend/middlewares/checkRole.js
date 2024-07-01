const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = function (options = {}) {

   const allowedRoles = Array.isArray(options.role) ? options.role : [options.role];

   return function (req, res, next) {
      const token = req.signedCookies.JWT;

      if (!token) return res.sendStatus(401);

      try {
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

         if (!allowedRoles.includes(user.role)) {
            return res.sendStatus(403);
         }

         req.user = user;
         next();
         return res.sendStatus(401);
      }
      catch (err) {
         console.log(err);
         res.clearCookie("JWT");
         return res.sendStatus(401);
      }
   }
};