const Admin = require('../models/Admin');
const { sanitizeString } = require('../utils/helpers');

const getLogin = (req, res) => {
  res.redirect('/dashboard');
};

const postLogin = (req, res) => {
  res.redirect('/dashboard');
};

const logout = (req, res) => {
  res.redirect('/dashboard');
};

const getProfile = async (req, res) => {
  // No-login mode: show guest profile (no DB admin required)
  const admin = {
    name: req.session.adminName || 'Admin',
    email: req.session.adminEmail || 'admin@example.com',
    phone: ''
  };
  res.render('profile', {
    title: 'My Profile',
    admin,
    success: null,
    error: null
  });
};

const updateProfile = async (req, res) => {
  const name = sanitizeString(req.body.name || '') || 'Admin';
  const phone = sanitizeString(req.body.phone || '');
  req.session.adminName = name;
  const admin = {
    name,
    email: req.session.adminEmail || 'admin@example.com',
    phone
  };
  res.render('profile', {
    title: 'My Profile',
    admin,
    success: 'Profile updated (session only — login is disabled).',
    error: null
  });
};

module.exports = {
  getLogin,
  postLogin,
  logout,
  getProfile,
  updateProfile
};
