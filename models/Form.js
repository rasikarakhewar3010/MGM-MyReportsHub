const mongoose = require('mongoose');

// This defines the structure of a single custom field
const FieldSchema = new mongoose.Schema({
    label: { type: String, required: true },
    type: { 
        type: String, 
        required: true, 
        enum: ['text', 'email', 'number', 'textarea', 'file'] 
    },
    required: { type: Boolean, default: false },
    // Optional: Add validation pattern if needed
    validationPattern: { type: String, required: false },
    validationMessage: { type: String, required: false }
});

const FormSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true,
    },
    fields: [FieldSchema],
    submissionCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('Form', FormSchema);