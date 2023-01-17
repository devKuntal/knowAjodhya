const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const ExpressError = require('./utils/ExpressError')

// Importing Routes
const campgroundRoutes = require('./routes/campgrounds')  // Importing campgrounds
const reviewRoutes = require('./routes/reviews');  // Importing Reviews
const userRoutes = require('./routes/user')

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

// Passrort middleware or initilize passport
app.use(passport.initialize())
app.use(passport.session()) // for persistent login session we need this middleware and make sure session is used before passport sessions
// set a new local strategy
passport.use(new LocalStrategy(User.authenticate())) // hello passport we need to use a local strategy to authienticate user model 
// these model are automatically defined with passport-local-mongoose
//Store user in the session and get out user from this sessions 
passport.serializeUser(User.serializeUser())

passport.deserializeUser(User.deserializeUser())

// Flash middleware
app.use((req, res, next)  => {
    // if you are not comming from login or home page then set the return to property to originalurl (prevvious url) 
    if (!['/login', '/'].includes(req.originalUrl)) { 
        req.session.returnTo = req.originalUrl
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// Campgrounds routes
app.use('/campgrounds', campgroundRoutes)

// review routes
app.use('/campgrounds/:id/reviews', reviewRoutes)

//User routes
app.use('/', userRoutes)

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