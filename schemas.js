// using Joi package for server side validation
const Joi = require('joi')
// this is server side schema validaation 
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required()
    }).required()
})