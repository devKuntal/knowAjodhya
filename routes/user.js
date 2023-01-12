const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')

// Register Rpoutes
router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async(req, res, next) => {
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
}))
// Login Routes
router.get('/login', (req, res) => {
    res.render('users/login')
})
// passport authienticate middleware verify the user and login see documentation for more info
router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureMessage: true, failureFlash: true, keepSessionInfo: true}), (req, res) => {
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
})

// logout routes
// router.get('/logout', (req, res) => {
//     req.logout()
//     req.flash('success', 'See you again soon')
//     res.redirect('/')
// })
router.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'See you again soon')
      res.redirect('campgrounds');
    });
  });

module.exports = router