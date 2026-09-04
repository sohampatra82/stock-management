require('dotenv').config();
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/db');
const { requireAuth } = require('./middleware/authMiddleware');
const dashboardController = require('./controllers/dashboardController');

const app = express();
connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'material-stock-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }
}));

// Make session data available to all views
app.use((req, res, next) => {
  res.locals.adminName = req.session.adminName || null;
  res.locals.adminEmail = req.session.adminEmail || null;
  res.locals.adminUsername = req.session.adminUsername || null;
  res.locals.isAuthenticated = !!(req.session && req.session.isAuthenticated);
  res.locals.currentPath = req.path;
  next();
});

app.use('/', require('./routes/authRoutes'));
app.get('/dashboard', requireAuth, dashboardController.getDashboard);
app.use('/materials', require('./routes/materialRoutes'));
app.use('/stock', require('./routes/stockRoutes'));
app.use('/reports', require('./routes/reportRoutes'));

// Root: redirect based on auth
app.get('/', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    status: 404
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong. Please try again later.',
    status: 500
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Material Stock Management running at http://localhost:' + PORT);
  console.log('Login with Username: admin  |  Password: admin123');
});
