const express = require('express')
const router = express.Router()
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

const Place = require('../models/place')

const catchAsync = require('../utils/catchAsync')

const { isLoggedIn, validatePlace, isAuthor } = require('../middleware')

const placeController = require('../controllers/place')

// Place Routes
// All Campgrounds
router.route('/')
    .get(catchAsync(placeController.index))
    .post(isLoggedIn, upload.array('image'), validatePlace, catchAsync(placeController.createPlace)) // Create New campgrounds 
// get the new campground form
router.get('/new', isLoggedIn, catchAsync(placeController.renderNewForm))

router.route('/:id')
// show campground details
    .get(catchAsync(placeController.showPlace))
    .put(isLoggedIn, isAuthor, upload.array('image'), validatePlace, catchAsync(placeController.updatePlace)) // update campground
    .delete(isLoggedIn, isAuthor, catchAsync(placeController.deletePlace))  // delete campground
// update campground form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(placeController.renderEditForm))

// Exports roures
module.exports = router