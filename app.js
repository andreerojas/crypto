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
const port = 3000;
const updatePricesPeriod = 10 * 60 * 1000; // 10 minutes
const {isLoggedIn} = require('./utilities/authMiddleware');

mongoose.connect('mongodb://127.0.0.1:27017/crypto')
.then(()=>{
    console.log("CONNECTED TO DATABASE");
    const id = setInterval( updatePrices, updatePricesPeriod);
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
    // console.log('req.user is: ',req.user.favorites[0]);
    res.locals.fiatSymbol = fiatSymbol;
    next();
})

app.get('/home',async (req,res)=>{
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
    res.redirect(`/wallet/${newUser._id}`); 
    })
}))

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/login', passport.authenticate('local',{failureFlash : true , failureRedirect : '/login'}),(req,res)=>{
    const redirectUrl = req.session.returnTo || `/wallet/${req.user._id}`;
    delete req.session.returnTo;
    req.flash('success','Welcome back!');
    res.redirect(redirectUrl);
})

app.get('/wallet/:id', isLoggedIn, wrapAsync(async (req,res)=>{
    const {id}= req.params;
    const user = await User.findById(id);
    res.render(`wallet`,{user});
}))


app.get('/logout', isLoggedIn, (req,res)=>{
    req.logout(err =>{
        if(err){
            return next(err);
        }
        req.flash('success','good bye!')
        res.redirect('/home')
    })
});

app.post('/favorites', isLoggedIn, wrapAsync(async (req,res)=>{
    const user = await User.findById(req.user._id);
    const {name : currencyName, action} = req.body;
    let msg = '';

    const currency = await Currency.findOne({'name' : currencyName});
    if(action === 'add'){
        console.log('id: ',currency)
        user.favorites.push(currency._id);
        await user.save();
    }else if(action === 'remove'){
        const idx = user.favorites.indexOf(currency);
        user.favorites.splice(idx,1);
        await user.save();
    }else{
        next();
    }
    res.json({msg:action})
}))

app.all("*",(req,res,next)=>{
    next(new AppError("page not found",404));
})

app.use((err,req,res,next)=>{
    if(!err.message) err.message = 'unknown error';
    if(!err.status) err.status = 405,
    res.status(err.status).send(`error is: ${err.message}`);
})

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})



