//Require dotenv config when application is not running in PROD ENV
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const ejsMate = require('ejs-mate');
const express = require('express');
const flash = require('connect-flash');
const helmet = require('helmet');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const path = require('path');
const session = require('express-session');
//Prod || Demo Environment
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const port = process.env.PORT || 3000;

const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');
const User = require('./models/user');

const app = express();

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//Stores session details in MongoDB in the collection named sessions rather than local storage
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret: secret,
    toucheAfer: 24 * 60* 60 //unit is seconds
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store,
    name: 'YC.session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, //disabled because it breaks the app; code needs adjusment to enable this setting
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // convert ms to a week
        maxAge: 1000 * 60 * 60 * 24 * 7 // expires = maxAge
    }
};

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
mongoose.set('useFindAndModify', false); //Added to prevent displaying warnings on terminal //TODO: remove after upgrade to v 6.0

// for allowing application to access data submitted via HTML form
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
//Serves static files located in the public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig)); // for cookies & must appear before passport.initialize per Docs
app.use(flash());
app.use(helmet());
app.use(mongoSanitize());

const scriptSrcUrls = [
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/",
    "https://cdn.jsdelivr.net/npm/@popperjs/"
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/", 
    "https://stackpath.bootstrapcdn.com/bootstrap/"
];

const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
]

const fontSrcUrls = [];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/doecn0ljl/",
            "https://images.unsplash.com",
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
    },
}));

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

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
// TODO: remove unneccessary 'next' parameters in the routes
// TODO: Update mongoose to v 6.0.5 https://github.com/Automattic/mongoose