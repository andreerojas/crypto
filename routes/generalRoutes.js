const express = require('express')
const router = express.Router()
const Currency = require('../models/currency');
const wrapAsync = require('../utilities/wrapAsync');

router.get('/',async (req,res)=>{
    res.render('home');
})

router.get('/summary',wrapAsync(async (req,res)=>{
    const currencies = await Currency.find({});
    res.render('summary',{currencies});
}))

module.exports = router