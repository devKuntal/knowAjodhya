const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create the schema for the model
const campgroundSchema = new Schema({
    title:String,
    image:String,
    price: Number,
    description:String,
    location:String
})

//exporting the model
module.exports = mongoose.model('campground', campgroundSchema);