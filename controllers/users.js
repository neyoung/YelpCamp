const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logout successful!');
    res.redirect('/campgrounds');
}
module.exports.register = async (req, res) => {
    //Defining a different error msg display instead of the catchAsync
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        //Auto login user immediately after user registers
        req.login(registeredUser, err => {
            if (err) return next(err); //Pass error to the error handler
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message); //Default error msg used
        res.redirect('register');
    }
}
module.exports.login = (req, res) =>{
    const redirectUrl = req.session.returnTo || '/campgrounds';
    req.flash('success', 'Welcome Back!');
    res.redirect(redirectUrl);
}