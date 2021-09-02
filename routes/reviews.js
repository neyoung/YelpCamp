const express = require('express');
//This option allows reviews to have access to the campground params 
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
// Needs to be destructed otherwise causes error 
const { isReviewAuthor, isLoggedIn, validateId, validateReview } = require('../middleware');

router.post('/', isLoggedIn, validateId, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', validateId, isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;