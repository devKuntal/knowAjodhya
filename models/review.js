// Creating review model 
const mongoose = require('mongoose')
const schema = mongoose.Schema

// Creating the schema
const reviewSchema = new schema({
    body: String,
    rating: Number
})

// Exporting Model
module.exports = mongoose.model('Review', reviewSchema)