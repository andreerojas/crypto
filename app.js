const express = require('express');
const app = express();
const path = require('path');
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const session = require('express-session');
const mongoose = require('mongoose');
const mongoSessionStore = require('connect-mongo');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ejsMate = require('ejs-mate');
const AppError = require('./utilities/AppError');
const flash = require('connect-flash');
const {updatePrices, fiatSymbol} = require('./utilities/updatePrices')
const {updateArticles} = require('./utilities/updateArticles');
const port = process.env.PORT || 3000
const updatePricesPeriod = 20 * 60 * 1000; // 10 minutes
const updateArticlesPeriod = 24 * 60 * 60 * 1000; // 1day
const generalRoutes = require('./routes/generalRoutes');
const userRoutes = require('./routes/userRoutes');
const mongoURL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/crypto';
mongoose.connect(mongoURL)
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
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.user = req.user;
    res.locals.fiatSymbol = fiatSymbol;
    next();
})

app.use('/',generalRoutes);
app.use('/',userRoutes);

app.all("*",(req,res,next)=>{ next(new AppError("page not found",404))})

app.use((err,req,res,next)=>{
    if(!err.message) err.message = 'unknown error';
    if(!err.status) err.status = 405;
    res.status(err.status).send(`error is: ${err.message}`);
})


app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})



