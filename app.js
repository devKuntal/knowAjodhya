if(process.env.NODE_ENV !== "production") {   // if running in development mode require env file
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const multer  = require('multer')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");

const User = require('./models/user')
const Place = require('./models/place')

const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const ExpressError = require('./utils/ExpressError')

// Importing Routes
const placeRoutes = require('./routes/place')  // Importing campgrounds
const reviewRoutes = require('./routes/reviews');  // Importing Reviews
const userRoutes = require('./routes/user')

// supress deprecation warning for mongoose 7
mongoose.set('strictQuery', false);

//connect to the mongoose database
mongoose.connect('mongodb://127.0.0.1:27017/ajodhya-hill')

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
// mongo Sanatize for mongo injection
app.use(mongoSanitize());
// adding express sessions
const sessionConfig = {
    name: 'session',  // used to hide the default name
    secret: 'thisshouldnotbeinproduction',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

//Setting up flash
app.use(flash())
//Helmet

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dqsjjbp5w/"
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://res.cloudinary.com/dqsjjbp5w/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://res.cloudinary.com/dqsjjbp5w/"
];
const fontSrcUrls = [
    "https://res.cloudinary.com/dqsjjbp5w/"
];
app.use(
    helmet.contentSecurityPolicy({
        useDefaults: false,
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dqsjjbp5w/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc   : [ "https://res.cloudinary.com/dqsjjbp5w/" ],
            childSrc   : [ "blob:" ],
            upgradeInsecureRequests: [],
        },
        crossOriginEmbedderPolicy: false,
    })
);
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));


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
app.use('/places', placeRoutes)

// review routes
app.use('/places/:id/reviews', reviewRoutes)

//User routes
app.use('/', userRoutes)

//getting the responce
app.get('/', async(req, res) => {
    const places = await Place.find({})
    const featuredPlace = places.slice(0,3)
    const secondFeatured = places.slice(3,6)
    res.render('home', {featuredPlace, secondFeatured, places});
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