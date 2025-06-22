const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// @desc    Show a form for a student to fill
// @route   GET /form/:id
router.get('/:id', studentController.getForm);

// @desc    Process a student's form submission
// @route   POST /form/:id
router.post('/:id', studentController.upload.single('reportFile'), studentController.submitForm);

module.exports = router;
