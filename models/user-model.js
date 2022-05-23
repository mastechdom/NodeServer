const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,

    email: String,

    password: String,

    mobile: String,

    childInfo:Array

}, {timestamps : true});

const User = mongoose.model('user', userSchema);

module.exports = User;