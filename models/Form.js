const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
    label: { type: String, required: true },
    type: { 
        type: String, 
        required: true, 
        enum: ['text', 'email', 'number', 'textarea', 'file'] 
    },
    required: { type: Boolean, default: false },
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
    deadline: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

// Add a method to check if form is still accepting submissions
FormSchema.methods.isAcceptingSubmissions = function() {
    return this.isActive && new Date() < this.deadline;
};

module.exports = mongoose.model('Form', FormSchema);