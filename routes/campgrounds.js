const express = require('express')
const router = express.Router()

const campground = require('../models/campground')

const catchAsync = require('../utils/catchAsync')

const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')

const campgroundController = require('../controllers/campgrounds')

// Campground Routes
// All Campgrounds
router.get('/', catchAsync(campgroundController.index))
// get the new campground form
router.get('/new', isLoggedIn, catchAsync(campgroundController.renderNewForm))
// Create New campgrounds
router.post('/', isLoggedIn, validateCampground, catchAsync(campgroundController.createCampground))
// show campground details
router.get('/:id', catchAsync(campgroundController.showCampgrounds))
// update campground form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgroundController.renderEditForm))
// update campground
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgroundController.updateCampground))
// delete campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground))

// Exports roures
module.exports = router