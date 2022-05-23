const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const childSchema = new Schema({
    name: String,

    month: String,

    year: String,

    photo: String

}, {timestamps : true});

const Child = mongoose.model('user', childSchema);

module.exports = Child;