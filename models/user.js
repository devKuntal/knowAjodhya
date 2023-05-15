const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true 
    }
})
// this is adding a username to schema and a field for a password and also give some additional
// methods so we can use (like authenticate) this is very crucial
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)