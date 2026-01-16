const express = require('express');
const router = express.Router();
const Response = require('../models/Response');

// Submit a response
router.post('/', async (req, res) => {
    try {
        const response = new Response(req.body);
        await response.save();
        res.status(201).json(response);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get responses for a specific survey
router.get('/survey/:surveyId', async (req, res) => {
    try {
        const responses = await Response.find({ surveyId: req.params.surveyId }).sort({ submittedAt: -1 });
        res.json(responses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
