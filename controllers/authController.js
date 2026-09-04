const Admin = require('../models/Admin');
const { sanitizeString } = require('../utils/helpers');

const getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login - Material Stock Management',
    error: null,
    username: ''
  });
};

const postLogin = async (req, res) => {
  try {
    const usernameOrEmail = sanitizeString(req.body.username || req.body.email || '').toLowerCase();
    const password = req.body.password || '';

    if (!usernameOrEmail || !password) {
      return res.render('auth/login', {
        title: 'Login - Material Stock Management',
        error: 'Username/Email and password are required.',
        username: usernameOrEmail
      });
    }

    // Find by username or email
    const admin = await Admin.findOne({
      $or: [
        { username: usernameOrEmail },
        { email: usernameOrEmail }
      ]
    });

    if (!admin) {
      return res.render('auth/login', {
        title: 'Login - Material Stock Management',
        error: 'Invalid username or password.',
        username: usernameOrEmail
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Login - Material Stock Management',
        error: 'Invalid username or password.',
        username: usernameOrEmail
      });
    }

    // Set session
    req.session.isAuthenticated = true;
    req.session.adminId = admin._id.toString();
    req.session.adminName = admin.name;
    req.session.adminEmail = admin.email;
    req.session.adminUsername = admin.username;

    const returnTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    return res.redirect(returnTo);
  } catch (err) {
    console.error('Login error:', err);
    return res.render('auth/login', {
      title: 'Login - Material Stock Management',
      error: 'Something went wrong. Please try again.',
      username: req.body.username || ''
    });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/login');
  });
};

const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.session.adminId).select('-password');
    if (!admin) {
      req.session.destroy(() => {});
      return res.redirect('/login');
    }
    res.render('profile', {
      title: 'My Profile',
      admin,
      success: null,
      error: null
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.render('profile', {
      title: 'My Profile',
      admin: {
        name: req.session.adminName,
        email: req.session.adminEmail,
        username: req.session.adminUsername,
        phone: ''
      },
      success: null,
      error: 'Could not load full profile.'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.session.adminId);
    if (!admin) {
      return res.redirect('/login');
    }

    const name = sanitizeString(req.body.name || '') || admin.name;
    const phone = sanitizeString(req.body.phone || '');
    const email = sanitizeString(req.body.email || '').toLowerCase() || admin.email;

    // Basic email validation
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.render('profile', {
        title: 'My Profile',
        admin,
        success: null,
        error: 'Please enter a valid email address.'
      });
    }

    // Check email uniqueness if changed
    if (email !== admin.email) {
      const exists = await Admin.findOne({ email, _id: { $ne: admin._id } });
      if (exists) {
        return res.render('profile', {
          title: 'My Profile',
          admin,
          success: null,
          error: 'That email is already in use.'
        });
      }
    }

    admin.name = name;
    admin.phone = phone;
    admin.email = email;
    await admin.save();

    req.session.adminName = admin.name;
    req.session.adminEmail = admin.email;

    res.render('profile', {
      title: 'My Profile',
      admin,
      success: 'Profile updated successfully.',
      error: null
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.render('profile', {
      title: 'My Profile',
      admin: {
        name: req.session.adminName,
        email: req.session.adminEmail,
        username: req.session.adminUsername,
        phone: ''
      },
      success: null,
      error: 'Failed to update profile. Please try again.'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.session.adminId);
    if (!admin) {
      return res.redirect('/login');
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render('profile', {
        title: 'My Profile',
        admin,
        success: null,
        error: 'All password fields are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.render('profile', {
        title: 'My Profile',
        admin,
        success: null,
        error: 'New password must be at least 6 characters.'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render('profile', {
        title: 'My Profile',
        admin,
        success: null,
        error: 'New password and confirmation do not match.'
      });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.render('profile', {
        title: 'My Profile',
        admin,
        success: null,
        error: 'Current password is incorrect.'
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.render('profile', {
      title: 'My Profile',
      admin,
      success: 'Password changed successfully. Please use the new password next time you log in.',
      error: null
    });
  } catch (err) {
    console.error('Change password error:', err);
    const admin = await Admin.findById(req.session.adminId).select('-password').catch(() => null);
    res.render('profile', {
      title: 'My Profile',
      admin: admin || {
        name: req.session.adminName,
        email: req.session.adminEmail,
        username: req.session.adminUsername,
        phone: ''
      },
      success: null,
      error: 'Failed to change password. Please try again.'
    });
  }
};

module.exports = {
  getLogin,
  postLogin,
  logout,
  getProfile,
  updateProfile,
  changePassword
};
