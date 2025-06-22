// This is the complete and corrected content for middleware/auth.js

module.exports = {
    ensureAuth: function (req, res, next) {
        // First, check if the user is logged in by looking at the session.
        if (req.session.faculty) {
            
            // If they are logged in, copy their session data to the main request object.
            // This is the CRUCIAL line that was missing.
            req.faculty = req.session.faculty; 
            
            // Now, proceed to the next step (the controller).
            return next();

        } else {
            // If they are not logged in, send them back to the login page.
            res.redirect('/');
        }
    },

    ensureGuest: function (req, res, next) {
        if (req.session.faculty) {
            res.redirect('/dashboard');
        } else {
            return next();
        }
    },
};