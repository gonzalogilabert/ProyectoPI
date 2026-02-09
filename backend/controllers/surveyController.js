const surveyService = require('../services/surveyService');

exports.createSurvey = async (req, res) => {
    try {
        const survey = await surveyService.create(req.body);
        res.status(201).json(survey);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getSurveys = async (req, res) => {
    try {
        const surveys = await surveyService.findAll();
        res.json(surveys);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getSurvey = async (req, res) => {
    try {
        const survey = await surveyService.findById(req.id || req.params.id);
        res.json(survey);
    } catch (err) {
        const status = err.message === 'Survey not found' ? 404 : 500;
        res.status(status).json({ message: err.message });
    }
};

exports.updateSurvey = async (req, res) => {
    try {
        const survey = await surveyService.update(req.params.id, req.body);
        res.json(survey);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteSurvey = async (req, res) => {
    try {
        const result = await surveyService.delete(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

