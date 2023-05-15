const ExpressError = require('./utils/ExpressError')
const { placeSchema, reviewSchema } = require('./schemas')
const Place = require('./models/place');
const Review = require('./models/review')


// is loggedin middleware for chacking if the user is logged in or not
module.exports.isLoggedIn = (req, res, next) => {
 // to get the user information
    if (!req.isAuthenticated()) {
        // redirect a user where the user attempt to login
        req.flash('error', 'you must be logged in first')
        return res.redirect('/login')
    }
    next()
}
// saperating the joi validation
module.exports.validatePlace = (req, res, next) => {
    // pass our data through schema
    const { error } = placeSchema.validate(req.body)
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
    const place = await Place.findById(id)
    if (!place.author.equals(req.user._id)) {
        req.flash('error', 'You do not have the permission to do it')
        return res.redirect(`/places/${id}`)
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
        return res.redirect(`/places/${id}`)
    }
    next()
}