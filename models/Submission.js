const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  data: {
    type: Map,
    of: String // example: "Student Name" => "Rasika"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
