const express = require('express')
const router = express.Router()
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

const campground = require('../models/campground')

const catchAsync = require('../utils/catchAsync')

const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')

const campgroundController = require('../controllers/campgrounds')

// Campground Routes
// All Campgrounds
router.route('/')
    .get(catchAsync(campgroundController.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgroundController.createCampground)) // Create New campgrounds
    // .post(upload.array('image'), (req, res) => {
    //     res.send('It worked')
    // }) 
// get the new campground form
router.get('/new', isLoggedIn, catchAsync(campgroundController.renderNewForm))

router.route('/:id')
// show campground details
    .get(catchAsync(campgroundController.showCampgrounds))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgroundController.updateCampground)) // update campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground))  // delete campground
// update campground form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.renderEditForm))

// Exports roures
module.exports = router