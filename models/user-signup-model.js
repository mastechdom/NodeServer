const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: String,

    subscription: String,

    relationWithKids: String,

    photo:String,

    country:String

}, {timestamps : true});

const User = mongoose.model('user', userSchema);

module.exports = User;