const requireAuth = (req, res, next) => next();
const redirectIfAuthenticated = (req, res, next) => next();
module.exports = { requireAuth, redirectIfAuthenticated };
