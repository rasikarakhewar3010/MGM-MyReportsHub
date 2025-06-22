const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest, ensureAuth } = require('../middleware/auth');

// @desc    Login/Landing page
// @route   GET /
router.get('/', ensureGuest, authController.getLogin);

// @desc    Process login form
// @route   POST /login
router.post('/login', ensureGuest, authController.postLogin);

// @desc    Show register page
// @route   GET /register
router.get('/register', ensureGuest, authController.getRegister);

// @desc    Process register form
// @route   POST /register
router.post('/register', ensureGuest, authController.postRegister);

// @desc    Logout user
// @route   GET /logout
router.get('/logout', ensureAuth, authController.logout);

module.exports = router;