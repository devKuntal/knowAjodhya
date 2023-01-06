const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const campground = require('./models/campground');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const { campgroundSchema } = require('./schemas')


// supress deprecation warning for mongoose 7
mongoose.set('strictQuery', false);

//connect to the mongoose database
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')

//logic to check an error
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
})

// Set the engine ejs-mate
app.engine('ejs', ejsMate)

//set the views engine and directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

// Middleware
// parsing reqbody using urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// method override
app.use(methodOverride('_method'));
// saperating the joi validation
const validateCampground = (req, res, next) => {
    // pass our data through schema
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

//getting the responce
app.get('/', (req, res) => {
    // res.send('Hello from yelpCamp!');
    res.render('home');
})
// getting all the campgrounds
// With Async error handler
app.get('/campgrounds', catchAsync(async(req, res) => {
    const campgrounds = await campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))
//make new campgrounds (put before read routes otherwise it will show cast error)
app.get('/campgrounds/new', catchAsync(async(req, res) => {
    res.render('campgrounds/new')
}))
// Handling post request
// using Joi
app.post('/campgrounds', validateCampground, catchAsync(async(req, res, next) => {
    const camp = new campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`)
}))
// show campground details
app.get('/campgrounds/:id', catchAsync(async(req, res) => {
    const camp = await campground.findById(req.params.id);
    res.render('campgrounds/show', { camp } )
}))
//update  Route
app.get('/campgrounds/:id/edit', catchAsync(async(req, res) => {
    const camp = await campground.findById(req.params.id);
    res.render('campgrounds/edit', { camp } )
}))
app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res) => {
    const { id } = req.params;
    const camp = await campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true});
    res.redirect(`/campgrounds/${camp._id}`); 
}))
// delete routes
app.delete('/campgrounds/:id', catchAsync(async(req,res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// Respond if something is not there
// Respond with express error
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})
// Basic Error Handler
//respond with a template
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if(!err.message) err.message  = 'Something went wrong'
    res.status(statusCode).render('error', {  err })
})


//listening to the port 3000
app.listen(3000, () => {
    console.log('Serving on port 3000');
})