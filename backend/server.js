const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('Falta MONGO_URI en el .env');
    process.exit(1);
}
app.use(cors());
app.use(bodyParser.json());
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
const surveyRoutes = require('./routes/surveyRoutes');
const responseRoutes = require('./routes/responseRoutes');
app.use('/api/surveys', surveyRoutes);
app.use('/api/responses', responseRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});