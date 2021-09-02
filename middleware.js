const mongoose = require('mongoose');

const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas.js');

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const currentUser = req.user;
    //Find campground
    //Compare the author to current user
    const campground = await Campground.findById(id);
    if (currentUser && !campground.author._id.equals(currentUser._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const currentUser = req.user;
    //Find campground
    //Compare the author to current user
    const review = await Review.findById(reviewId);
    if (!review.author._id.equals(currentUser._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; //Stores the url user tried to visit before login
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
}

//Middleware to validate the campground form before saving to DB
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

//Confirms that id format is valid before querying MongoDB
module.exports.validateId = (req, res, next) => {
    let msg = '';
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        msg = 'Cannot find that campground';
        throw new ExpressError(msg);
    }
    if(req.params.reviewId && !mongoose.Types.ObjectId.isValid(req.params.reviewId)) {
        msg = 'Cannot find that review';
        throw new ExpressError(msg);
    }
    next();
}

// Middleware to validate the campground form before saving to DB
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}