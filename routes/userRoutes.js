const express = require('express')
const router = express.Router()
const Currency = require('../models/currency');
const User = require('../models/user');
const passport = require('passport');
const {isLoggedIn, checkReturnTo, isWalletEmpty} = require('../utilities/middleware');
const {validateUser} = require('../utilities/validationSchema');
const wrapAsync = require('../utilities/wrapAsync');
const multer  = require('multer');
const {storageProfilePics} = require('../cloudinary');
const uploadProfilePics = multer({ storage : storageProfilePics});

router.route('/register')
    .get((req,res)=>{
        res.render('register.ejs');
    })
    .post(validateUser, wrapAsync(async(req,res)=>{
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

router.route('/login')
    .get((req,res)=>{
        res.render('login');
    })
    .post(checkReturnTo, passport.authenticate('local',{failureFlash : true , failureRedirect : '/login'}),(req,res)=>{
        const redirectUrl = res.locals.returnTo || `/wallet`;
        req.flash('success','Welcome back!');
        res.redirect(redirectUrl);
    })

router.get('/wallet/', isLoggedIn, (req,res)=>{
    res.render(`wallet`);
})

router.get('/logout', isLoggedIn, (req,res)=>{
    req.logout(err =>{
        if(err){ return next(err); }
        req.flash('success','good bye!')
        res.redirect('/')
    })
});

router.post('/favorites', isLoggedIn, wrapAsync(async (req,res)=>{
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

router.route('/deposit')
    .get(isLoggedIn, wrapAsync(async(req,res)=>{
        const currencies = await Currency.find({},['API_id','name','symbol','logo','price']);
        res.render('deposit', {currencies});
    }))
    .post(isLoggedIn, wrapAsync(async (req,res)=>{
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

router.route('/withdraw')
    .get(isLoggedIn, isWalletEmpty, wrapAsync(async (req,res)=>{
        res.render('withdraw');
    }))
    .post(isLoggedIn, isWalletEmpty, wrapAsync(async (req,res)=>{
        const {selectedCoinID, amount} = req.body;
        const coin = await Currency.findOne({'API_id' : selectedCoinID});
        const foundUser = await User.findOne({'_id' : req.user._id , 'wallet.currency' : coin._id, 'wallet.qty' : {$gte : amount}});
        if(foundUser){
            await User.findOneAndUpdate({'_id' : req.user._id , 'wallet.currency' : coin._id, 'wallet.qty' : {$gte : amount}},
                                                        {$inc : { 'wallet.$.qty' : -amount}});
            await User.findOneAndUpdate({'_id' : req.user._id , 'wallet.currency' : coin._id},
                                                        {$pull : {'wallet' : { 'qty' : { $lte : 0}}}})
            req.flash('success', 'withdraw was completed succesfully');
        }else{
            req.flash('error', 'an error occurred');
        }
        res.redirect('/wallet');
    }))

router.get('/news', isLoggedIn ,wrapAsync(async (req,res)=>{
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

router.route('/userEdit')
    .get(isLoggedIn, wrapAsync(async (req,res)=>{
        res.render('userEdit')
    }))
    .post(isLoggedIn ,uploadProfilePics.single('picture'), wrapAsync(async (req,res)=>{
        const update = req.body['user'];
        if(req.file){
            const {filename, path : url} = req.file; 
            update.picture = {filename, url}
        }
        await User.findByIdAndUpdate(req.user._id, update);
        req.flash('success','You personal information was updated');
        res.redirect('/wallet')
    }))

module.exports = router;