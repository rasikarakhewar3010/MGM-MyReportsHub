const Form = require('../models/Form');
const Submission = require('../models/Submission');
const supabase = require('../utils/supabase');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
exports.upload = upload;

// getForm function remains the same
exports.getForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id).populate('createdBy', 'name');
        if (!form) {
            return res.status(404).render('error', { title: 'Not Found', message: 'The form you are looking for does not exist.' });
        }
        res.render('student/fill-form', {
            title: `Submission for: ${form.title}`,
            form,
        });
    } catch (err) {
        console.error("Error in getForm:", err);
        res.status(500).render('error', { title: 'Server Error' });
    }
};

exports.submitForm = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) return res.status(404).render('error', { message: 'Form not found.' });

        // Validate required fields and specific field types
        for (const field of form.fields) {
            if (field.required && !req.body[field.label] && field.type !== 'file') {
                return res.status(400).render('error', { 
                    message: `Required field '${field.label}' is missing.` 
                });
            }

            // Phone number validation
            if (field.label.toLowerCase().includes('phone') && req.body[field.label]) {
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(req.body[field.label])) {
                    return res.status(400).render('error', { 
                        message: `Invalid phone number. Must be 10 digits.` 
                    });
                }
            }

            // Roll number validation
            if (field.label.toLowerCase().includes('roll') && req.body[field.label]) {
                const rollRegex = /^[0-9]+$/;
                if (!rollRegex.test(req.body[field.label])) {
                    return res.status(400).render('error', { 
                        message: `Invalid roll number. Must contain only digits.` 
                    });
                }
                if (parseInt(req.body[field.label]) < 0) {
                    return res.status(400).render('error', { 
                        message: `Roll number cannot be negative.` 
                    });
                }
            }
        }

        if (!req.file) {
            const hasFileField = form.fields.some(f => f.type === 'file' && f.required);
            if (hasFileField) {
                return res.status(400).render('error', { message: 'PDF file required.' });
            }
        }

        // Rest of the file upload and submission logic remains the same
        const fileName = req.file ? `${Date.now()}_${req.file.originalname}` : null;

        let fileUrl = null;
        if (req.file) {
            const { data, error } = await supabase.storage
                .from('student-submissions')
                .upload(fileName, req.file.buffer, {
                    contentType: 'application/pdf',
                });

            if (error) {
                console.error('Supabase Upload Error:', error);
                return res.status(500).render('error', { message: 'File upload failed.' });
            }

            const { data: publicUrlData } = supabase
                .storage
                .from('student-submissions')
                .getPublicUrl(fileName);

            fileUrl = publicUrlData.publicUrl;
        }

        const submissionData = new Map();

        for (const field of form.fields) {
            if (field.type !== 'file' && req.body[field.label]) {
                submissionData.set(field.label, req.body[field.label]);
            }
        }

        const fileField = form.fields.find(f => f.type === 'file');
        if (fileField && fileUrl) {
            submissionData.set(fileField.label, fileUrl);
        }

        await Submission.create({
            formId: req.params.id,
            data: submissionData,
        });

        form.submissionCount += 1;
        await form.save();

        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Submission Successful</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background-color: #f5f9fc;
      font-family: 'Segoe UI', sans-serif;
    }

    .header-bar {
      background-color: #0d6efd;
      color: white;
      padding: 1rem;
      font-size: 1.5rem;
      font-weight: 600;
      border-radius: 8px 8px 0 0;
    }

    .thank-you-card {
      background-color: white;
      border-radius: 12px;
      border: 1px solid #e3e6ea;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .check-icon {
      fill: #0d6efd;
    }

    .card-body h3 {
      color: #198754;
    }

    .btn-return {
      margin-top: 1.5rem;
      background-color: #0d6efd;
      color: white;
      font-weight: 500;
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      text-decoration: none;
    }

    .btn-return:hover {
      background-color: #0548b4;
    }
  </style>
</head>
<body class="d-flex flex-column align-items-center justify-content-center vh-100">

  <div class="thank-you-card text-center" style="max-width: 600px;">
    <div class="header-bar">Submission Received</div>
    <div class="card-body p-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" class="check-icon mb-3" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 10.97l4.992-4.992-1.414-1.414L6.97 8.142 5.07 6.243 3.656 7.657l3.314 3.314z"/>
      </svg>
      <h3 class="fw-bold">Thank you!</h3>
      <p class="fs-5 mb-3">Your submission for <strong>${form.title}</strong> has been received successfully.</p>
    </div>
  </div>

</body>
</html>
`);

    } catch (err) {
        console.error("Submit Error:", err);
        res.status(500).render('error', { message: 'Something went wrong.' });
    }
};