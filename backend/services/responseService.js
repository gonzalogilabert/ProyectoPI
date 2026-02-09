const Response = require('../models/Response');

class ResponseService {
    async create(responseData) {
        const response = new Response(responseData);
        return await response.save();
    }

    async findBySurveyId(surveyId) {
        return await Response.find({ surveyId }).sort({ submittedAt: -1 });
    }
}

module.exports = new ResponseService();
