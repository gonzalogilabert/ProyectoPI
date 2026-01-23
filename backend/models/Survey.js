const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    type: { type: String, enum: ['text', 'test', 'multi', 'scale'], required: true },
    required: { type: Boolean, default: false },
    options: [{ type: String }] // For 'test' and 'multi' types
});

const SurveySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    questions: [QuestionSchema],
    timeLimit: { type: Number }, // in minutes, 0 for no limit
    isAnonymous: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});

module.exports = mongoose.model('Survey', SurveySchema);
