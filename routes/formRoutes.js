// routes/formRoutes.js
const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { upload } = require('../config/cloudinary');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Protected Routes
router.get('/', ensureAuthenticated, formController.getDashboard);
router.get('/dashboard', ensureAuthenticated, formController.getDashboard);

// ==================== NEW SEARCH ROUTE ====================
router.get('/search', ensureAuthenticated, formController.searchResponses);
// =========================================================

router.get('/create-form', ensureAuthenticated, formController.getCreateFormPage);
// ... (rest of your routes)