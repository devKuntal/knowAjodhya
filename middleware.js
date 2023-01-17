const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require('./schemas')
const campground = require('./models/campground');
const Review = require('./models/review')


// is loggedin middleware for chacking if the user is logged in or not
module.exports.isLoggedIn = (req, res, next) => {
    // console.log('req.user...', req.user) // to get the user information
    if (!req.isAuthenticated()) {
        // redirect a user where the user attempt to login
        // return to is the url whre the user back ( you can put whatever you want)
        // req.session.returnTo = req.originalUrl // move it to the app.js
        req.flash('error', 'you must be logged in first')
        return res.redirect('/login')
    }
    next()
}
// saperating the joi validation
module.exports.validateCampground = (req, res, next) => {
    // pass our data through schema
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
// Checking if the user is author
module.exports.isAuthor = async(req, res, next) => {
    const {id} = req.params
    const camp = await campground.findById(id)
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do it')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

// Validating reviews using joi
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}
// review author
module.exports.isReviewAuthor = async(req, res, next) => {
    const {id, reviewId} = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do it')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}