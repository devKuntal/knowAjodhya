// Creating review model 
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Creating the schema
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

// Exporting Model
module.exports = mongoose.model('Review', reviewSchema)