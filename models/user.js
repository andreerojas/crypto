const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const Currency = require('./currency')

const getQtyDecimals = (v)=>{
    const value = Number.parseFloat(v).toFixed(5);
    let ret = Number.parseFloat(value);
    if(value * 10 === Number.parseInt(value*10)){
        ret = Number.parseFloat(v).toFixed(2);
    }
    return ret;
}

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
        type : {
            'currency' : {
                    type : Schema.Types.ObjectId,
                    ref  : 'Currency' 
            },
            'qty' : {
                type    :  Schema.Types.Decimal128,
                get     : getQtyDecimals,
                set     : v => Number.parseFloat(v).toFixed(5)
            }
        }
    }],
    favorites : [{
        type : Schema.Types.ObjectId,
        ref  : 'Currency'
    }]
})

mongoose.set('strictQuery', true);
userSchema.plugin(passportLocalMongoose, {
    populateFields : [{ 
            path : 'wallet',
            populate : {
                path : 'currency',
                select : ['price','name','logo','API_id']
                }
            },
            {
                path    :   'favorites',
                select  :   ['API_id','name','logo']
            }]
});
const User = mongoose.model('User',userSchema);
module.exports =  User;

