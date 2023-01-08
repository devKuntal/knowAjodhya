const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

//Create the schema for the model
const campgroundSchema = new Schema({
    title:String,
    image:String,
    price: Number,
    description:String,
    location:String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

// When delete a campground delete all the reviews related to it (mongoose middleware)
// if there is something in the document remove all the reviews 
// which matches to the id in the reviews in the campground schema 
campgroundSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//exporting the model
module.exports = mongoose.model('campground', campgroundSchema);