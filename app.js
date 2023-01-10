const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')

const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const ExpressError = require('./utils/ExpressError')

// Importing Routes
const campgrounds = require('./routes/campgrounds')  // Importing campgrounds
const reviews = require('./routes/reviews')  // Importing Reviews

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
// serving public directory
app.use(express.static(path.join(__dirname, 'public')))
// adding express sessions
const sessionConfig = {
    secret: 'thisshouldnotbeinproduction',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

//Setting up flash
app.use(flash())

// Flash middleware
app.use((req, res, next)  => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// Campgrounds routes
app.use('/campgrounds', campgrounds)

// review routes
app.use('/campgrounds/:id/reviews', reviews)

//getting the responce
app.get('/', (req, res) => {
    // res.send('Hello from yelpCamp!');
    res.render('home');
})





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