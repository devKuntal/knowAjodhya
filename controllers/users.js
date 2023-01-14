const User = require('../models/user')

module.exports.renderRegForm = (req, res) => {
    res.render('users/register')
}

module.exports.register = async(req, res, next) => {
    // res.send(req.body)
    try {
        const {username, email, password } = req.body
        const user = new User({email, username})
        const registeredUser = await User.register(user, password)
        // console.log(registeredUser)
        // logged in after a user is registrated 
        req.login(registeredUser, err => {
            if (err) { return next(err)}
            req.flash('success', 'Welcome to Yelp-camp')
            res.redirect('/campgrounds')
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
    // get back the user where he is actually before login
    // let returnTo = '/'
    // if (req.session.returnTo) {
    //     returnTo = req.session.returnTo
    //     console.log('returnto..',returnTo)
    //     delete req.session.returnTo
    // }
    // console.log('returnTo..', req.session.returnTo)
    const redirectUrl = req.session.returnTo || '/campgrounds'
    // // Deleting the return to from the sessions
    delete req.session.returnTo
    // redirect to the previous url
    res.redirect(redirectUrl)
}

module.exports.logout = function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'See you again soon')
      req.session.destroy
      res.redirect('campgrounds');
    });
  }