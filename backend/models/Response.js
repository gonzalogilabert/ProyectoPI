const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true } // Can be string or array of strings
});

const ResponseSchema = new mongoose.Schema({
    surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
    answers: [AnswerSchema],
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Response', ResponseSchema);
