const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
require('dotenv').config();
const session = require('express-session');
const mongoose = require('mongoose');
const mongoSessionStore = require('connect-mongo');
const User = require('./models/user');
const Currency = require('./models/currency')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ejsMate = require('ejs-mate');
const AppError = require('./utilities/AppError');
const wrapAsync = require('./utilities/wrapAsync');
const {userValidationSchema, validateUser} = require('./utilities/validationSchema');
const flash = require('connect-flash');
const {updatePrices, fiatSymbol} = require('./utilities/updatePrices')
const {updateArticles} = require('./utilities/updateArticles');
updateArticles
const port = 3000;
const updatePricesPeriod = 24 * 60 * 60 * 1000; // 10 minutes
const updateArticlesPeriod = 24 * 60 * 60 * 1000; // 1day
const {isLoggedIn, checkReturnTo, isWalletEmpty} = require('./utilities/middleware');


mongoose.connect('mongodb://127.0.0.1:27017/crypto')
.then(()=>{
    console.log("CONNECTED TO DATABASE");
    const id = setInterval( updatePrices, updatePricesPeriod);
    const id2 = setInterval( updateArticles, updateArticlesPeriod);
})
.catch(e =>{
    console.log("ERROR CONNECTING TO DATABASE");
    console.error(e);        
});
const mongoClient = mongoose.connection.getClient();

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

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.user = req.user;
    res.locals.fiatSymbol = fiatSymbol;
    next();
})

app.get('/',async (req,res)=>{
    res.render('home');
})

app.get('/summary',wrapAsync(async (req,res)=>{
    const currencies = await Currency.find({});
    res.render('summary',{currencies});
}))

app.get('/register',(req,res)=>{
    res.render('register.ejs');
})

app.post('/register', validateUser ,wrapAsync(async(req,res)=>{
    const {firstName, lastName, age, email, username, password} = req.body.user;
    const newUser = new User({firstName, lastName, age, email, username});
    const registeredUser = await User.register(newUser,password);
    req.login(registeredUser,err =>{
        if(err){
            return next(err);
        }
    req.flash('success','User registered succesfully');
    res.redirect(`/wallet`); 
    })
}))

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/login', checkReturnTo, passport.authenticate('local',{failureFlash : true , failureRedirect : '/login'}),(req,res)=>{
    const redirectUrl = res.locals.returnTo || `/wallet`;
    console.log('after login', res.locals.returnTo)
    req.flash('success','Welcome back!');
    res.redirect(redirectUrl);
})

app.get('/wallet/', isLoggedIn, (req,res)=>{
    res.render(`wallet`);
})

app.get('/logout', isLoggedIn, (req,res)=>{
    req.logout(err =>{
        if(err){ return next(err); }
        req.flash('success','good bye!')
        res.redirect('/')
    })
});

app.post('/favorites', isLoggedIn, wrapAsync(async (req,res)=>{
    const user = await User.findById(req.user._id);
    const {name : currencyName, action} = req.body;
    let msg = '';

    const currency = await Currency.findOne({'name' : currencyName});
    if(action === 'add'){
        await User.findByIdAndUpdate(req.user._id,{$push : {'favorites' : currency._id}})
    }else if(action === 'remove'){
        await User.findByIdAndUpdate(req.user._id, {$pull : {'favorites' : currency._id}})
    }else{
        throw new AppError('Request to modify user favorite currencies is not allowed',404);
    }
    res.json({msg:action})
}))

app.get('/deposit', isLoggedIn, wrapAsync(async(req,res)=>{
    const currencies = await Currency.find({},['API_id','name','symbol','logo','price']);
    res.render('deposit', {currencies});
}))

app.post('/deposit', isLoggedIn, wrapAsync(async (req,res)=>{
    const {selectedCoinID, amount} = req.body
    const coin = await Currency.findOne({'API_id' : selectedCoinID});
    const foundUser = await User.findOne({'_id' : req.user._id , 'wallet.currency' : coin._id});
    if(foundUser){
        await User.findOneAndUpdate( {'_id' : req.user._id , 'wallet.currency' : coin._id},{$inc : { 'wallet.$.qty' : amount}});
    }else{
        const addedCoin = {'currency' : coin._id , 'qty' : amount};
        await User.findByIdAndUpdate(req.user._id, {$push : {'wallet' : addedCoin}});
    }
    res.redirect('/wallet')
}))

app.get('/withdraw', isLoggedIn, isWalletEmpty, wrapAsync(async (req,res)=>{
    res.render('withdraw');
}))

app.post('/withdraw',isLoggedIn, isWalletEmpty, wrapAsync(async (req,res)=>{
    const {selectedCoinID, amount} = req.body;
    const coin = await Currency.findOne({'API_id' : selectedCoinID});
    const foundUser = await User.findOne({'_id' : req.user._id , 'wallet.currency' : coin._id, 'wallet.qty' : {$gte : amount}});
    if(foundUser){
        console.log('found')
        await User.findOneAndUpdate({'_id' : req.user._id , 'wallet.currency' : coin._id, 'wallet.qty' : {$gte : amount}},
                                                    {$inc : { 'wallet.$.qty' : -amount}});
        await User.findOneAndUpdate({'_id' : req.user._id , 'wallet.currency' : coin._id},
                                                    {$pull : {'wallet' : { 'qty' : { $lte : 0}}}})
        req.flash('success', 'withdraw was completed succesfully');
    }else{
        console.log('not found')
        req.flash('error', 'an error occurred');
    }
    res.redirect('/wallet');
}))

app.get('/news', isLoggedIn ,wrapAsync(async (req,res)=>{
    const favs = await Currency.find({'_id' :  {$in : req.user.favorites.map(f => f._id)}}).populate('articles');
    const articles = [];
    for(let fav of favs){
        let aux = [];
        for(let article of fav.articles){
            const {title, description, url, urlToImage, author, publishedAt} = article;
            aux.push({title, description, url, urlToImage, author, publishedAt});
        }
        articles.push({'coinName' : fav.name, 'coinArticles' : aux})
    }
    res.render('news',{articles});
}))

app.all("*",(req,res,next)=>{
    next(new AppError("page not found",404));
})

app.use((err,req,res,next)=>{
    if(!err.message) err.message = 'unknown error';
    if(!err.status) err.status = 405;
    res.status(err.status).send(`error is: ${err.message}`);
})

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})



