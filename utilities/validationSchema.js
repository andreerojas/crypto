const Joi = require('joi');
const AppError = require('./AppError');

const userValidationSchema = Joi.object({
    user    : Joi.object({
        firstName   : Joi.string().pattern(/^[a-zA-Z]+$/).required(),
        lastName    : Joi.string().pattern(/^[a-zA-Z]+$/).required(),
        username    : Joi.string().alphanum().min(6).required(),
        password    : Joi.string().min(6).required()
    }).required()
})

const validateUser = (req,res,next)=>{
    // console.log('schema is: ',userValidationSchema);
    const {error} = userValidationSchema.validate(req.body);
    if(error){
        console.log('detailes are: ',error.details)
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, 400);
    }else{
        next();
    }
}
module.exports = {userValidationSchema, validateUser};