module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        console.log('here', req.session)
        req.flash('error','You must loggin first');
        res.redirect('/login');
    }else{
        next();
    }
}

module.exports.checkReturnTo = (req,res,next)=>{
    if(req.session.returnTo){
        console.log('setting locals')
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isWalletEmpty = (req,res,next)=>{
    console.log('length is:', req.user.wallet.length)
    if(!req.user.wallet.length){
        req.flash('error','Your wallet is empty, you cannot withdraw anything');
        res.redirect('wallet');
    }
    next();
}


