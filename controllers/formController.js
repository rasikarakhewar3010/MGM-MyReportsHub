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
        const { title, description, field_label, field_type, field_required, deadline } = req.body;

        // Validate deadline is in the future
        const deadlineDate = new Date(deadline);
        if (deadlineDate <= new Date()) {
            return res.render('error', { 
                title: 'Invalid Deadline', 
                message: 'Deadline must be in the future.' 
            });
        }

        const fields = [];
        if (Array.isArray(field_label)) {
            for (let i = 0; i < field_label.length; i++) {
                fields.push({
                    label: field_label[i],
                    type: field_type[i],
                    required: field_required && field_required[i] === 'on' ? true : false,
                });
            }
        } else if (field_label) {
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
            deadline: deadlineDate,
        });

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error Creating Form' });
    }
};

// GET /dashboard/forms/:id - Show details for a single form
exports.getFormDetails = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form || form.createdBy.toString() !== req.faculty.id) {
            return res.render('error', { 
                title: 'Not Found', 
                message: 'Form not found or you do not have permission to view it.' 
            });
        }

        const submissions = await Submission.find({ formId: form._id }).sort({ createdAt: 'desc' });
        const now = new Date();
        const isExpired = now > form.deadline;

        res.render('faculty/form-details', {
            title: `Details for ${form.title}`,
            form,
            submissions,
            isExpired,
            req: req,
        });
    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error' });
    }
};

// GET /dashboard/forms/:id/export - Export data for a single form
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

        const fields = form.fields.map(field => field.label);
        fields.push('Submission Date');

        const data = submissions.map(sub => {
            let row = { ...sub.data };
            row['Submission Date'] = new Date(sub.createdAt).toLocaleString();
            return row;
        });

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(data);

        res.header('Content-Type', 'text/csv');
        const filename = form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        res.attachment(`${filename}_submissions.csv`);
        res.send(csv);

    } catch (err) {
        console.error(err);
        res.render('error', { title: 'Error exporting data' });
    }
};

// NEW API FUNCTION
exports.getFormSubmissionsAPI = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form || form.createdBy.toString() !== req.faculty.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        
        const submissions = await Submission.find({ formId: form._id }).sort({ createdAt: 'desc' });
        res.status(200).json({ submissions });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
};