const Survey = require('../models/Survey');
const Response = require('../models/Response');

class SurveyService {
    async create(surveyData) {
        const survey = new Survey(surveyData);
        return await survey.save();
    }

    async findAll() {
        return await Survey.find().sort({ createdAt: -1 });
    }

    async findById(id) {
        const survey = await Survey.findById(id);
        if (!survey) {
            throw new Error('Survey not found');
        }
        return survey;
    }

    async update(id, surveyData) {
        return await Survey.findByIdAndUpdate(id, surveyData, { new: true });
    }

    async delete(id) {
        await Survey.findByIdAndDelete(id);
        // Cascading delete: remove all responses associated with this survey
        await Response.deleteMany({ surveyId: id });
        return { message: 'Survey and its responses deleted' };
    }
}

module.exports = new SurveyService();
