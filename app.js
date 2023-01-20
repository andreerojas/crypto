const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const { application } = require('express');
require('dotenv').config();
const session = require('express-session');
const mongoose = require('mongoose');
const mongoSessionStore = require('connect-mongo');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ejsMate = require('ejs-mate');

mongoose.connect('mongodb://127.0.0.1:27017/crypto')
    .then(()=>{
        console.log("CONNECTED TO DATABASE");
    })
    .catch(e =>{
        console.log("ERROR CONNECTING TO DATABASE");        
    });

    const mongoClient = mongoose.connection.getClient();

const port = 3000;
const baseURL = "https://pro-api.coinmarketcap.com/";


app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static('public'));

const sessionConfig = {
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
    cookie : {
        maxAge : 1000 * 60 * 60 *24 ,
    },
    store : mongoSessionStore.create({ client : mongoClient})
}

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})

app.get('/sandbox',async (req,res)=>{
    const quoteURL =   "https://sandbox-api.coinmarketcap.com/" + "v1/cryptocurrency/listings/latest?start=1&limit=5&convert_id=2781";
    const config = {headers : { 'X-CMC_PRO_API_KEY': "b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c",
                                 'Accept': 'application/json',
                                 'Accept-Encoding' : 'deflate,gzip'}};
    const {data : quoteData} = await axios.get(quoteURL, config);
    const ids = quoteData["data"].map( currency => currency.id);
    const metaURL = `https://sandbox-api.coinmarketcap.com/v2/cryptocurrency/info?id=${ids.join()}`;
    const {data : metadata} = await axios.get(metaURL,config);
    
    const currencies = quoteData["data"].map(currency =>{
        const ret = {};
        ret.id = currency.id;
        ret.logo = metadata["data"][`${currency.id}`]["logo"];
        ret.name = currency["name"];
        ret.symbol = currency["symbol"];
        ret.price = Number.parseFloat(currency["quote"]["2781"]["price"]).toFixed(2);
        ret.change24h = Number.parseFloat(currency["quote"]["2781"]["percent_change_24h"]).toFixed(2);
        ret.marketCap = Number.parseFloat(currency["quote"]["2781"]["market_cap"]).toFixed(2);
        ret.volume =  Number.parseFloat(currency["quote"]["2781"]["volume_24h"]).toFixed(2);;
        return ret;
    })
    // console.log(currencies);
    res.render('summary',{currencies});
})

app.get('/summary',async (req,res)=>{
    const quoteURL =   baseURL + "v1/cryptocurrency/listings/latest?start=1&limit=5&convert_id=2781";
    const config = {headers : { 'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
                                 'Accept': 'application/json',
                                 'Accept-Encoding' : 'deflate,gzip'}};
    const {data : quoteData} = await axios.get(quoteURL, config);
    const ids = quoteData["data"].map( currency => currency.id);
    const metaURL = `${baseURL}v2/cryptocurrency/info?id=${ids.join()}`;
    if(JSON.stringify(req.session.currencyIDs) !== JSON.stringify(ids)){
        req.session.currencyIDs = ids;
        req.session.currencyMetadata = {};
        const {data : metadata} = await axios.get(metaURL,config);
        for(let [key,value] of Object.entries(metadata["data"])){
            req.session.currencyMetadata[`${key}`] = value['logo'];
        }
        req.session.count = 1;
    }else{
        req.session.count ++;
    }
        
    const currencies = quoteData["data"].map(currency =>{
        const ret = {};
        ret.id = currency.id;
        ret.logo = req.session.currencyMetadata[`${currency.id}`];
        ret.name = currency["name"];
        ret.symbol = currency["symbol"];
        ret.price = Number.parseFloat(currency["quote"]["2781"]["price"]).toFixed(2);
        ret.change24h = Number.parseFloat(currency["quote"]["2781"]["percent_change_24h"]).toFixed(2);
        ret.marketCap = Number.parseFloat(currency["quote"]["2781"]["market_cap"]).toFixed(2);
        ret.volume =  Number.parseFloat(currency["quote"]["2781"]["volume_24h"]).toFixed(2);;
        return ret;
    })
    console.log(req.session.count);
    res.render('summary',{currencies});
})

app.get('/register',(req,res)=>{
    res.render('register');
})

app.post('/register', async(req,res)=>{
    res.send('register test')
})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/login', passport.authenticate('local',{failureFlash : true , failureRedirect : '/login'}),(req,res)=>{
    res.redirect('/');
})

app.get('/test',(req,res)=>{
    res.render('test');
})

app.get('/test2',(req,res)=>{
    res.render('test2');
})
