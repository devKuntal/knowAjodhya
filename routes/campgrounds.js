const express = require('express')
const router = express.Router()
const campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync')
// const ExpressError = require('../utils/ExpressError')
// const { campgroundSchema } = require('../schemas')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')



// // saperating the joi validation
// const validateCampground = (req, res, next) => {
//     // pass our data through schema
//     const { error } = campgroundSchema.validate(req.body)
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400)
//     } else {
//         next()
//     }
// }
// // Checking if the user is author
// const isAuthor = async(req, res, next) => {
//     const {id} = req.params
//     const camp = await campground.findById(id)
//     if (!camp.author.equals(req.user._id)) {
//         req.flash('error', 'You do not have the permission to do it')
//         return res.redirect(`/campgrounds/${id}`)
//     }
// }

// getting all the campgrounds
// With Async error handler
router.get('/', catchAsync(async(req, res) => {
    const campgrounds = await campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))
//make new campgrounds (put before read routes otherwise it will show cast error)
router.get('/new', isLoggedIn, catchAsync(async(req, res) => {
    // check if the user is logged in or not using passport isauthenticated method
    // moved in separate file to use as a middleware in all the required routes
    // if (!req.isAuthenticated()) {
    //     req.flash('error', 'you must be logged in first')
    //     return res.redirect('/login')
    // }
    res.render('campgrounds/new')
}))
// Handling post request
// using Joi
// for extra safty that cannot send a post request from postman use isLoggedIn middleware
router.post('/', isLoggedIn, validateCampground, catchAsync(async(req, res, next) => {
    const camp = new campground(req.body.campground);
    await camp.save();
    req.flash('success', 'Successfully created a Campground')
    res.redirect(`/campgrounds/${camp._id}`)
}))
// show campground details
router.get('/:id', catchAsync(async(req, res) => {
    // populating reviews and users to get the information
    const camp = await campground.findById(req.params.id).populate({path: 'reviews', populate: { path: 'author'}}).populate('author');
    // console.log(camp)
    // if someone try find a deleted campground by campground_id then display error
    if(!camp) {
        req.flash('error', 'Cannot find the campground')
        return res.redirect('/campgrounds')  // return the value to stop further executions
    }
    res.render('campgrounds/show', { camp } )
}))
//update  Route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async(req, res) => {
    // const { id } = req.params;
    const camp = await campground.findById(id);
    if(!camp) {
        req.flash('error', 'Cannot find the campground')
        return res.redirect('/campgrounds')  // return the value to stop further executions
    }
    // if (!camp.author.equals(req.user._id)) {
    //     req.flash('error', 'You do not have the permission to do it')
    //     return res.redirect(`/campgrounds/${id}`)
    // }
    req.flash('success', 'Successfully updated the Campground')
    res.render('campgrounds/edit', { camp } )
}))
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async(req, res) => {
    const { id } = req.params;
    // for protecting routes check the user is currently logged in and the author of the campground
    // const camp = await campground.findById(id)
    // if (!camp.author.equals(req.user._id)) {
    //     req.flash('error', 'You do not have the permission to do it')
    //     return res.redirect(`/campgrounds/${id}`)
    // }
    const camp = await campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true}); 
    res.redirect(`/campgrounds/${camp._id}`); 
}))
// delete routes
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async(req,res) => {
    const { id } = req.params;
    // proctcting routes (moved to middleware is author)
    // const camp = await campground.findById(id)
    // if (!camp.author.equals(req.user._id)) {
    //     req.flash('error', 'You do not have the permission to do it')
    //     return res.redirect(`/campgrounds/${id}`)
    // }
    await campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted your Campground!')
    res.redirect('/campgrounds');
}))

module.exports =  router