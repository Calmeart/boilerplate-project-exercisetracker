const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    userId : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;