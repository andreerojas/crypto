const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

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
    picture  : {
        type : {
            url : String,
            filename : String
        },
        default : {
          url :   '/img/generic-user.png',
          filename : 'generic-profile-picture'
        }
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
}, {toJSON : {virtuals : true}})

userSchema.virtual('totalMoney').get(function(){
    return this.wallet.reduce((acc, asset) => acc + asset.currency.price * asset.qty, parseFloat(0.0)).toFixed(2);
})

userSchema.virtual('thumbnail').get(function(){
    return this.picture.url.replace('upload','upload/c_fill,g_faces,h_200,w_200');
})

mongoose.set('strictQuery', true);
userSchema.plugin(passportLocalMongoose, {
    populateFields : [{ 
            path : 'wallet',
            populate : {
                path : 'currency',
                select : ['price','name','symbol','API_id']
                }
            },
            {
                path    :   'favorites',
                select  :   ['API_id','name','symbol','price']
            }]
});
const User = mongoose.model('User',userSchema);
module.exports =  User;

