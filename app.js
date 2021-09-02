const ejsMate = require('ejs-mate');
const express = require('express');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const path = require('path');
const session = require('express-session');

const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');
const User = require('./models/user');

const app = express();

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // convert ms to a week
        maxAge: 1000 * 60 * 60 * 24 * 7 // expires = maxAge
    }
};

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// for allowing application to access data submitted via HTML form
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
//Serves static files located in the public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig)); // for cookies & must appear before passport.initialize per Docs
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//Defines the authentication method
passport.use(new LocalStrategy(User.authenticate()));
//Defines how to store and un-store user from the session cookies
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Locals are my defined variables that I can pass on to all HTML files
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//Importing the campground and reviews routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

//If user visit any other links besides those listed above
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

//Error handler middleware
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
});
// TODO: remove unneccessary 'next' parameters in the routes