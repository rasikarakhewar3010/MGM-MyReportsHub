const Form = require('../models/Form');
const Submission = require('../models/Submission');

const { Parser } = require('json2csv');

// GET /dashboard
exports.getDashboard = async (req, res) => {
    try {
        const forms = await Form.find({ createdBy: req.faculty.id }).sort({ createdAt: 'desc' });
        res.render('faculty/dashboard', {
            title: 'Faculty Dashboard',
            forms,
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error' });
    }
};

// GET /dashboard/forms/new - Show the new form builder page
exports.getNewFormPage = (req, res) => {
    res.render('faculty/create-form', {
        title: 'Create New Form'
    });
};

// POST /dashboard/forms - Create the new dynamic form
exports.createForm = async (req, res) => {
    try {
        const { title, description, field_label, field_type, field_required } = req.body;

        const fields = [];
        if (Array.isArray(field_label)) {
            for (let i = 0; i < field_label.length; i++) {
                fields.push({
                    label: field_label[i],
                    type: field_type[i],
                    required: field_required && field_required[i] === 'on' ? true : false,
                });
            }
        } else if (field_label) { // Case for a single field
            fields.push({
                label: field_label,
                type: field_type,
                required: field_required === 'on' ? true : false,
            });
        }

        await Form.create({
            title,
            description,
            fields,
            createdBy: req.faculty.id,
        });

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error Creating Form' });
    }
};

// GET /dashboard/forms/:id - NEW: Show details for a single form
exports.getFormDetails = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form || form.createdBy.toString() !== req.faculty.id) {
            return res.render('error', { title: 'Not Found', message: 'Form not found or you do not have permission to view it.' });
        }

        const submissions = await Submission.find({ formId: form._id }).sort({ createdAt: 'desc' });

        res.render('faculty/form-details', {
            title: `Details for ${form.title}`,
            form,
            submissions,
            req: req, // Pass req for URL generation
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error' });
    }
};


// GET /dashboard/forms/:id/export - NEW: Export data for a single form
exports.exportFormSubmissions = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form || form.createdBy.toString() !== req.faculty.id) {
            return res.status(404).send('Form not found.');
        }

        const submissions = await Submission.find({ formId: form._id }).lean();

        if (submissions.length === 0) {
            return res.status(404).send('No submissions for this form to export.');
        }

        // Dynamically create headers from the form fields
        const fields = form.fields.map(field => field.label);
        fields.push('Submission Date'); // Add a standard submission date field

        const data = submissions.map(sub => {
            // No changes needed above this line

            // Create a row by spreading the plain 'data' object into a new object.
            // This is a clean and modern way to handle it.
            let row = { ...sub.data };

            // Then, add the submission date.
            row['Submission Date'] = new Date(sub.createdAt).toLocaleString();
            return row;
        });

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(data);

        res.header('Content-Type', 'text/csv');
        // Sanitize title for filename
        const filename = form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        res.attachment(`${filename}_submissions.csv`);
        res.send(csv);

    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error exporting data' });
    }
};

// controllers/formController.js
// ... (keep all the existing controller functions)

// NEW API FUNCTION
exports.getFormSubmissionsAPI = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        // Security check: ensure the faculty owns this form
        if (!form || form.createdBy.toString() !== req.faculty.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        const submissions = await Submission.find({ formId: form._id }).sort({ createdAt: 'desc' });

        // Send the data back as JSON
        res.status(200).json({ submissions });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};