const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    author      : {
        type        : String
    },
    title      : {
        type        : String,
        required    : true
    },
    description      : {
        type        : String
    },
    url      : {
        type        : String,
        required    : true
    },
    urlToImage      : {
        type        : String
    },
    publishedAt     :{
        type        : Date
    },
    currency        :[{
        type        : Schema.Types.ObjectId,
        ref  : 'Currency'
    }]
},{timestamps : true})

mongoose.set('strictQuery', true);
const Article = mongoose.model('Article',articleSchema);
module.exports = Article; 