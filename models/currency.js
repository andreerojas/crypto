const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const currencySchema = new Schema({
    API_id      : {
        type        : Number,
        required    : true
    },
    logo        : {
        type        : String,
        required    : true
    },
    name        : {
        type        : String,
        required    : true
    },
    symbol      : {
        type        : String,
        required    : true
    },
    price       :  {
        type        : Number,
        required    : true,
        get         : v => Number.parseFloat(v).toFixed(2)
    },
    change24h   : {
        type        : Number,
        required    : true,
        get         : v => Number.parseFloat(v).toFixed(2)  
    },
    marketCap   : {
        type        : Number,
        required    : true,
        get         : v => Number.parseFloat(v).toFixed(2)
    },
    volume     : {
        type        : Number,
        required    : true,
        get         : v => Number.parseFloat(v).toFixed(2)
    },
    API_ranking     :{
        type        : Number,
        required    : true
    }
},{timestamps : true})

mongoose.set('strictQuery', true);
const Currency = mongoose.model('Currency',currencySchema);
module.exports = Currency; 