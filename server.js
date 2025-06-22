const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/database');

// Load config
dotenv.config({ path: './.env' });

// Connect to Database
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set view engine
app.set('view engine', 'ejs');

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
}));

// Global variables for views
app.use(function (req, res, next) {
    res.locals.faculty = req.session.faculty || null;
    res.locals.currentRoute = req.path;
    next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/dashboard', require('./routes/index'));
app.use('/form', require('./routes/student'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));