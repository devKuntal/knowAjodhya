const campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async(req, res) => {
    const camp = await campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id         // asign author
    camp.reviews.push(review)
    await review.save()
    await camp.save()
    req.flash('success', 'Thanks for your review!')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.renderReviewForm = async(req, res) => {
    const review = await Review.findById(req.params.id)
    res.render('campgrounds/show', { review })
}

module.exports.deleteReview = async(req,res) => {
    const { id, reviewId } = req.params;
    await campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted your review!')
    res.redirect(`/campgrounds/${id}`);
}
