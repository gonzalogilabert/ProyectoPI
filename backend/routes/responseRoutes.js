const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');

// Submit a response
router.post('/', responseController.submitResponse);

// Get responses for a specific survey
router.get('/survey/:surveyId', responseController.getResponses);

module.exports = router;

