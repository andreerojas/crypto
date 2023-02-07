const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const Article = require('./article');
const getPriceDecimals = (v)=>{
    const value = Number.parseFloat(v);
    let decimals = (value < 1 ) ? 7 : 2; 
    return value.toFixed(decimals);
}

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
        get         : getPriceDecimals
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
},
{
    timestamps : true,
    toJSON  :   {virtuals : true},
    toObject:   {virtuals : true}
});

currencySchema.virtual('articles',{
    ref:    'Article',
    localField: '_id',
    foreignField: 'currency'
})

currencySchema.post('deleteMany', async (doc)=>{
    if(doc){
        await User.updateMany({},{$set : {'favorites' : [], 'wallet' : []}});
        await Article.deleteMany({});
    }
})
mongoose.set('strictQuery', true);
const Currency = mongoose.model('Currency',currencySchema);
module.exports = Currency; 