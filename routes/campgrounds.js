const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary'); //index.js is the default file
const upload = multer({ storage });

const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
// Needs to be destructed otherwise causes error 
const { isLoggedIn, isAuthor, validateId, validateCampground} = require('../middleware');

//The full route paths are defined in app.js
router.route('/')
    .get(catchAsync(campgrounds.renderIndex))
    //TODO: rewrite validateCampground to include multer's req.body
    .post(isLoggedIn, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.createCamp));

//This route MUST come before '/:id' to avoid route interference    
router.get('/new', isLoggedIn, campgrounds.renderNewCampForm);

router.route('/:id')
    .get(validateId, catchAsync(campgrounds.renderDetails))
    .put(isLoggedIn, isAuthor, validateId, upload.array('campground[image]'), validateCampground, catchAsync(campgrounds.updateCamp))
    .delete(isLoggedIn, isAuthor, validateId, catchAsync(campgrounds.deleteCamp));

router.get('/:id/edit', validateId, isLoggedIn, catchAsync(campgrounds.renderEdit));

module.exports = router;