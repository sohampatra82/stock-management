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
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }
}));

app.use((req, res, next) => {
  if (!req.session.adminName) {
    req.session.adminName = 'Admin';
    req.session.adminEmail = 'admin@example.com';
  }
  res.locals.adminName = req.session.adminName;
  res.locals.adminEmail = req.session.adminEmail;
  res.locals.isAuthenticated = true;
  res.locals.currentPath = req.path;
  next();
});

app.use('/', require('./routes/authRoutes'));
app.get('/dashboard', requireAuth, dashboardController.getDashboard);
app.use('/materials', require('./routes/materialRoutes'));
app.use('/stock', require('./routes/stockRoutes'));
app.use('/reports', require('./routes/reportRoutes'));
app.get('/', (req, res) => res.redirect('/dashboard'));

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
  console.log('No login required — open dashboard directly.');
});
