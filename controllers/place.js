const Place = require('../models/place')
const { cloudinary } = require('../cloudinary/index')
// adding mapbox sdk
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken})

module.exports.index = async(req, res) => {
    const place = await Place.find({});
    res.render('places/index', { place });
} 

module.exports.renderNewForm = async(req, res) => {
    res.render('places/new')
}

module.exports.createPlace = async(req, res, next) => {
    const locationArray = new Array(req.body.place.longitude, req.body.place.latitude) // Create an array of latitute and longitude value
    const geoData = await geocoder.reverseGeocode ({
        query:locationArray.map(parseFloat), // extracting the floating point number form the array
        limit: 1
    }).send()
    const place = new Place(req.body.place);
    place.geometry = geoData.body.features[0].geometry
    place.location = geoData.body.features[0].place_name
    place.images = req.files.map(f => ({url: f.path, filename: f.filename })) // mapping the images array and set url and filename
    place.author = req.user._id
    await place.save()
    req.flash('success', 'Successfully Added a Place')
    res.redirect(`/places/${place._id}`)
}

module.exports.showPlace = async(req, res) => {
    const place = await Place.findById(req.params.id).populate({path: 'reviews', populate: { path: 'author'}}).populate('author');
    if(!place) { // someone bookmarked camp id and camp is deleted from database then display error
        req.flash('error', 'Cannot find the place')
        return res.redirect('/places')  // return the value to stop further executions
    }
    res.render('places/show', { place } )
}

module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    const place = await Place.findById(id);
    if(!place) {
        req.flash('error', 'Cannot find the place')
        return res.redirect('/places')  // return the value to stop further executions
    }
    res.render('places/edit', { place } )
}

module.exports.updatePlace = async(req, res) => {
    const { id } = req.params;
    const place = await Place.findByIdAndUpdate(id, {...req.body.place}, {new: true}); 
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename }))
    place.images.push(...imgs)
    await place.save()
    if (req.body.deleteImages) { // delete images from mongo
        for(let filename of req.body.deleteImages) {  // delete images from cloudinary
            await cloudinary.uploader.destroy(filename)
        }
        await place.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages}}}},{new: true}) // pull form the images array where the filename is in deleteimages
    }
    req.flash('success', 'Successfully updated the place')
    res.redirect(`/places/${place._id}`); 
}

module.exports.deletePlace = async(req,res) => {
    const { id } = req.params;
    await Place.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted your place!')
    res.redirect('/places');
}