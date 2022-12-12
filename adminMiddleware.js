module.exports.isAdminLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You Must Be Signed In First!')
        return res.redirect('/groceries/adminLogin');
    }
    next();

}