const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

// create virtuals
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

//Create the schema for the model
const campgroundSchema = new Schema({
    title:String,
    images: [ImageSchema],
    price: Number,
    description:String,
    location:String,
    // adding author from users
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
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
// Review.remove is deprected so hete deleteMany is used 
campgroundSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.deleteMany({      
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//exporting the model
module.exports = mongoose.model('campground', campgroundSchema);