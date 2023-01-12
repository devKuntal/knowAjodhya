// is loggedin middleware for chacking if the user is logged in or not
module.exports.isLoggedIn = (req, res, next) => {
    // console.log('req.user...', req.user) // to get the user information
    if (!req.isAuthenticated()) {
        // redirect a user where the user attempt to login
        // return to is the url whre the user back ( you can put whatever you want)
        // req.session.returnTo = req.originalUrl // move it to the app.js
        // console.log(req.path, req.originalUrl)
        req.flash('error', 'you must be logged in first')
        return res.redirect('/login')
    }
    next()
}