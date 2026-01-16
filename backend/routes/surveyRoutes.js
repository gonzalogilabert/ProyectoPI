const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

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
        await Survey.findByIdAndDelete(req.params.id);
        res.json({ message: 'Survey deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
