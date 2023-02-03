const User = require('../models/user')

module.exports.renderRegForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async(req, res, next) => {
    try {
        const {username, email, password } = req.body
        const user = new User({email, username})
        const registeredUser = await User.register(user, password)
        // logged in after a user is registrated 
        req.login(registeredUser, err => {
            if (err) { return next(err)}
            req.flash('success', 'Welcome to Ajodhya-Hill')
            res.redirect('/places')
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!')
    const redirectUrl = req.session.returnTo || '/places'   // fetch the previous url where the user is oherwise it will be campground
    delete req.session.returnTo     // Deleting the return to from the sessions
    res.redirect(redirectUrl)    // redirect to the previous url
}

module.exports.logout = function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'See you again soon')
      req.session.destroy
      res.redirect('/');
    });
  }