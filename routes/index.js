const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { ensureAuth } = require('../middleware/auth');

// All routes here are protected
router.use(ensureAuth);

// @desc    Show faculty dashboard (list of forms)
// @route   GET /dashboard
router.get('/', formController.getDashboard);

// @desc    Show page to create a new form
// @route   GET /dashboard/forms/new
router.get('/forms/new', formController.getNewFormPage);

// @desc    Handle creation of a new form
// @route   POST /dashboard/forms
router.post('/forms', formController.createForm);

// @desc    Show details and submissions for a specific form
// @route   GET /dashboard/forms/:id
router.get('/forms/:id', formController.getFormDetails);

// @desc    Export submissions for a specific form
// @route   GET /dashboard/forms/:id/export
router.get('/forms/:id/export', formController.exportFormSubmissions);


// @desc    API route to get submissions for a specific form
// @route   GET /dashboard/api/forms/:id/submissions
router.get('/api/forms/:id/submissions', formController.getFormSubmissionsAPI);

module.exports = router;