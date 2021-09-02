const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    image: String,
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