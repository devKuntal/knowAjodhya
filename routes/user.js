const express = require('express')
const router = express.Router()
const passport = require('passport')
// const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')

const userController = require('../controllers/users')

// Register Rpoutes

router.route('/register')
    .get(userController.renderRegForm)
    .post(catchAsync(userController.register))
// Login Routes
router.route('/login')
    .get(userController.renderLoginForm)
// passport authienticate middleware verify the user and login see documentation for more info
    .post(passport.authenticate('local', 
        {
            failureRedirect: '/login', 
            failureMessage: true, 
            failureFlash: true, 
            keepSessionInfo: true
        }), 
        userController.login)

// logout routes
// router.get('/logout', (req, res) => {
//     req.logout()
//     req.flash('success', 'See you again soon')
//     res.redirect('/')
// })
router.post('/logout', userController.logout);

module.exports = router

// req.session.destroy((err) => {
//     res.clearCookie('connect.sid')
// })