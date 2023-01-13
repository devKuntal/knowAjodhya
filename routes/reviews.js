const express = require('express')
const router = express.Router({ mergeParams: true}) // to pass the campground id params to app.js
const catchAsync = require('../utils/catchAsync')
// const ExpressError = require('../utils/ExpressError')
// const { reviewSchema } = require('../schemas')
const campground = require('../models/campground');
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

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
router.post('/', isLoggedIn, validateReview, catchAsync(async(req, res) => {
    // res.send('You made it!!')
    const camp = await campground.findById(req.params.id)
    const review = new Review(req.body.review)
    // author
    review.author = req.user._id
    camp.reviews.push(review)
    await review.save()
    await camp.save()
    req.flash('success', 'Thanks for your review!')
    res.redirect(`/campgrounds/${camp._id}`)
}))
// Displaying Review
router.get('/:reviewId', catchAsync(async(req, res) => {
    const review = await Review.findById(req.params.id)
    res.render('campgrounds/show', { review })
}))
// Delete Reviews
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req,res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted your review!')
    res.redirect(`/campgrounds/${id}`);
}))


module.exports = router