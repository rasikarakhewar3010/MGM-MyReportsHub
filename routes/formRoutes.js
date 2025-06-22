// routes/search.js

const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { ensureAuthenticated } = require('../middleware/auth'); // Good practice to protect routes

// Protect the search route to ensure only logged-in faculty can use it.
router.get('/search', ensureAuthenticated, async (req, res) => {
    // Trim whitespace and handle empty query
    const query = req.query.q?.trim() || '';
    const facultyId = req.faculty.id; // Assuming you have faculty info in `req`

    if (!query) {
        // Redirect back or show a message if search is empty
        return res.redirect('/dashboard');
    }
    
    try {
        // More efficient search: Let MongoDB do the work.
        // We will build a query that looks for the search term in several possible fields.
        const searchRegex = new RegExp(query, 'i'); // 'i' for case-insensitive search
        
        // These are the keys in the `data` map where a student's name might be stored.
        const possibleNameKeys = ['Student Name', 'Full Name', 'Name', 'Student'];

        // Create an array of conditions for the $or operator.
        // This tells MongoDB: "find documents where 'data.Student Name' matches OR 'data.Full Name' matches OR..."
        const orConditions = possibleNameKeys.map(key => ({
            [`data.${key}`]: searchRegex
        }));

        // Find submissions that match the name AND belong to forms created by the current faculty.
        // This is a crucial security and data-scoping improvement.
        const results = await Submission.find()
            .populate({
                path: 'formId',
                match: { createdBy: facultyId }, // Only get submissions for forms this faculty owns
                select: 'title _id' // Only populate the fields we need
            })
            .where({ $or: orConditions }) // Apply the search conditions
            .lean(); // Use .lean() for performance

        // The populate `match` can result in submissions where `formId` is null (if the form didn't belong to the faculty).
        // We must filter these out.
        const finalResults = results.filter(sub => sub.formId !== null);
        
        res.render('faculty/searchResults', {
            title: `Search Results for "${query}"`,
            searchQuery: query,
            results: finalResults,
            faculty: req.faculty // Pass faculty data to navbar
        });

    } catch (err) {
        console.error('Search error:', err);
        res.status(500).render('error', { title: 'Server Error', message: 'An error occurred during your search.' });
    }
});

module.exports = router;