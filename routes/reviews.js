const express = require('express')
const router = express.Router({ mergeParams: true}) // to pass the campground id params to app.js
const catchAsync = require('../utils/catchAsync')
// const ExpressError = require('../utils/ExpressError')
// const { reviewSchema } = require('../schemas')
// const campground = require('../models/campground');
// const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

const reviewController = require('../controllers/reviews')

// Validating reviews using joi
// const validateReview = (req, res, next) => {
//     const { error } = reviewSchema.validate(req.body)
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next()
//     }
// }

// creating reviews model routes
// reviews routes
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview))
// Displaying Review
router.get('/:reviewId', catchAsync(reviewController.renderReviewForm))
// Delete Reviews
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview))


module.exports = router