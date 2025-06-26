const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/database');

// Load config
dotenv.config({ path: './.env' });

// --- ADDED: A "Guard Clause" for robust deployment ---
// This checks if the essential variables are loaded. If not, the app will exit
// with a clear error message instead of a confusing library error.
if (!process.env.MONGO_URI || !process.env.SESSION_SECRET) {
    console.error('FATAL ERROR: MONGO_URI or SESSION_SECRET is not defined in the environment variables.');
    process.exit(1); // Exit the process with an error code
}
// ----------------------------------------------------

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

// --- UPDATED: Session Middleware ---
// This is the key change. We are now telling MongoStore to use the
// existing, active database connection from Mongoose instead of creating a new one.
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        // This is more efficient and reliable than using mongoUrl here.
        client: mongoose.connection.getClient()
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Sets cookie to expire in 1 day
    }
}));
// ------------------------------------

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