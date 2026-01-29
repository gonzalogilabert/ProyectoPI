const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    description: { type: String },
    type: {
        type: String, enum: [
            'short', 'paragraph', 'test', 'multi', 'dropdown',
            'file', 'scale', 'rating', 'grid_radio', 'grid_check',
            'date', 'time'
        ], required: true
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }], // For test, multi, dropdown, scale
    rows: [{ type: String }],    // For grids
    columns: [{ type: String }]  // For grids
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
