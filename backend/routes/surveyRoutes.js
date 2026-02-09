const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');

// Create a survey
router.post('/', surveyController.createSurvey);

// Get all surveys
router.get('/', surveyController.getSurveys);

// Get a single survey
router.get('/:id', surveyController.getSurvey);

// Update a survey
router.put('/:id', surveyController.updateSurvey);

// Delete a survey
router.delete('/:id', surveyController.deleteSurvey);

module.exports = router;

