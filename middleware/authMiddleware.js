const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAuthenticated && req.session.adminId) {
    return next();
  }
  // Store the original URL to redirect after login
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login');
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.isAuthenticated && req.session.adminId) {
    return res.redirect('/dashboard');
  }
  return next();
};

module.exports = { requireAuth, redirectIfAuthenticated };
