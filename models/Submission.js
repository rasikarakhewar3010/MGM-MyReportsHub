const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true,
    },
    // This is the new flexible data field. It's a "Map" (like a dictionary or object)
    // that can store any key-value pairs. The key is the field label (e.g., "Roll Number")
    // and the value is the student's input.
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed, // Allows storing strings, numbers, booleans, file URLs etc.
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);