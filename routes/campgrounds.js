const express = require('express');
const router = express.Router();

const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
// Needs to be destructed otherwise causes error 
const { isLoggedIn, isAuthor, validateId, validateCampground} = require('../middleware');

router.route('/')
    .get(catchAsync(campgrounds.renderIndex))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCamp));

//This route MUST come before '/:id' to avoid route interference    
router.get('/new', isLoggedIn, campgrounds.renderNewCampForm);

router.route('/:id')
    .get(validateId, catchAsync(campgrounds.renderDetails))
    .put(isLoggedIn, isAuthor, validateId, validateCampground, catchAsync(campgrounds.updateCamp))
    .delete(isLoggedIn, isAuthor, validateId, catchAsync(campgrounds.deleteCamp));

router.get('/:id/edit', validateId, isLoggedIn, catchAsync(campgrounds.renderEdit));

module.exports = router;