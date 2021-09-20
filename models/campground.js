const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;
//Saves campgroundSchema virtuals to the MongoDB which is accessible via .js
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
    url: String,
    filename: String
});

//Uses Cloudinary transformation to get thumbnail version of images by ref. field name 'thumbnail'
//Not saved to MongoDB and only accessible via html
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200,h_150');
});

const campgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        }, 
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts);

campgroundSchema.virtual('properties.popupMarkUp').get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
});

/*
 * 'doc' is the campground document that was just deleted which we have access to even after deletion
 * if a 'doc' is deleted by 'findByIdAndDelete()', the findOneAndDelete middleware below will be triggered 
 * to delete all reviews where '_id' matches ids in the doc.reviews array
 */
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc) {
        await Review.deleteMany({_id: {$in: doc.reviews}});
    }
});

module.exports = mongoose.model('Campground',campgroundSchema);