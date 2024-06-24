module.exports = function (options = {}) {
 const allowedRoles = Array.isArray(options.role) ? options.role : [options.role];
 return function (req, res, next) {
    const user = req.user;
   if (!user) res.status(401).json({ error: 'Unauthorized' });
   if (allowedRoles.includes(user.role)) {
    req.roles = [user.role];
    next();
   } else res.status(403).json({ error: 'Unauthorized' }); 
}
};