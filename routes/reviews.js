const express = require('express')
const router = express.Router({ mergeParams: true}) // to pass the campground id params to app.js

const catchAsync = require('../utils/catchAsync')

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

const reviewController = require('../controllers/reviews')

// creating reviews model routes
// reviews routes
router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview))
// Displaying Review
router.get('/:reviewId', catchAsync(reviewController.renderReviewForm))
// Delete Reviews
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview))


module.exports = router