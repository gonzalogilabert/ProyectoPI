const responseService = require('../services/responseService');

exports.submitResponse = async (req, res) => {
    try {
        const response = await responseService.create(req.body);
        res.status(201).json(response);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getResponses = async (req, res) => {
    try {
        const responses = await responseService.findBySurveyId(req.params.surveyId);
        res.json(responses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

