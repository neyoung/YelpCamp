const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user;
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
    req.flash('success', 'Successfully posted new review!')
    res.redirect(`/campgrounds/${id}`);
}
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    // Remove review from Campground.reviews array before...
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    // ... deleting the review from the Review database
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}