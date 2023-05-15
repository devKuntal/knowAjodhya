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

// include virtuals when document is converted to json
const opts = {toJSON: {virtuals: true}}

//Create the schema for the model
const placeSchema = new Schema({
    title:String,
    images: [ImageSchema],
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
    description:String,
    location: String,
    longitude: Schema.Types.Decimal128,
    latitude: Schema.Types.Decimal128,
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
    ],
}, opts)

// adding virtuals to show the campground data in the map
placeSchema.virtual('properties.popUpMarkup').get(function() {
    return `<a href="/places/${this._id}">${this.title}</a>
    <p>${this.description.substring(0,20)}...</p>`
})

// When delete a campground delete all the reviews related to it (mongoose middleware)
// if there is something in the document remove all the reviews 
// which matches to the id in the reviews in the campground schema
// Review.remove is deprected so hete deleteMany is used 
placeSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await Review.deleteMany({      
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//exporting the model
module.exports = mongoose.model('Place', placeSchema);