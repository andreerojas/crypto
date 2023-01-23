const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const User = new Schema({
    firstName : {
        type : String,
        required: true
    },
    lastName : {
        type : String,
        required: true
    }
})

mongoose.set('strictQuery', true);

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',User);
