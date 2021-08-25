const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

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

// Returns a random data in the array
const sample = (array) => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() *20) + 10;
        // instatiate Campground object with 50 random cities and states
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corporis, sunt, cumque sapiente fuga, iusto atque aut commodi quo quis quos porro rem vel enim iste laudantium nisi voluptatibus odit ipsam.',
            price
        });
        // save camp object to DB
        await camp.save();
    }
}

// returns a promise because it is defined as an async function
// closes database connection
seedDB().then(() => {
    mongoose.connection.close();
});