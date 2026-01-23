const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const Response = require('../models/Response');

// Create a survey
router.post('/', async (req, res) => {
    try {
        const survey = new Survey(req.body);
        await survey.save();
        res.status(201).json(survey);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all surveys
router.get('/', async (req, res) => {
    try {
        const surveys = await Survey.find().sort({ createdAt: -1 });
        res.json(surveys);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single survey
router.get('/:id', async (req, res) => {
    try {
        const survey = await Survey.findById(req.id || req.params.id);
        if (!survey) return res.status(404).json({ message: 'Survey not found' });
        res.json(survey);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a survey
router.put('/:id', async (req, res) => {
    try {
        const survey = await Survey.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(survey);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a survey
router.delete('/:id', async (req, res) => {
    try {
        const surveyId = req.params.id;
        await Survey.findByIdAndDelete(surveyId);
        // Cascading delete: remove all responses associated with this survey
        await Response.deleteMany({ surveyId: surveyId });
        res.json({ message: 'Survey and its responses deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
