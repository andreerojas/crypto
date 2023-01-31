const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const Currency = require('./currency')

const userSchema = new Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    age      : {
        type : Number,
        required : true
    },
    email    : {
        type : String,
        required : true
    },
    wallet : [{
        type : {'currency' : Schema.Types.ObjectId, 'qty' : Number},
        ref  : 'Currency' 
    }],
    favorites : [{
        type : Schema.Types.ObjectId,
        ref  : 'Currency'
    }]
})

mongoose.set('strictQuery', true);
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User',userSchema);
module.exports =  User;

