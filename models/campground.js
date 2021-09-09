const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

//Uses Cloudinary transformation to get thumbnail version of images by ref. field name 'thumbnail'
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200,h_150');
});

const campgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number, 
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