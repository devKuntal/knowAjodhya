const campground = require('../models/campground')
const { cloudinary } = require('../cloudinary/index')

module.exports.index = async(req, res) => {
    const campgrounds = await campground.find({});
    res.render('campgrounds/index', { campgrounds });
} 

module.exports.renderNewForm = async(req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async(req, res, next) => {
    const camp = new campground(req.body.campground);
    camp.images = req.files.map(f => ({url: f.path, filename: f.filename })) // mapping the images array and set url and filename
    camp.author = req.user._id
    await camp.save()
    req.flash('success', 'Successfully created a Campground')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.showCampgrounds = async(req, res) => {
    const camp = await campground.findById(req.params.id).populate({path: 'reviews', populate: { path: 'author'}}).populate('author');
    if(!camp) { // someone bookmarked camp id and camp is deleted from database then display error
        req.flash('error', 'Cannot find the campground')
        return res.redirect('/campgrounds')  // return the value to stop further executions
    }
    // console.log(camp)
    res.render('campgrounds/show', { camp } )
}

module.exports.renderEditForm = async(req, res) => {
    const { id } = req.params;
    const camp = await campground.findById(id);
    if(!camp) {
        req.flash('error', 'Cannot find the campground')
        return res.redirect('/campgrounds')  // return the value to stop further executions
    }
    res.render('campgrounds/edit', { camp } )
}

module.exports.updateCampground = async(req, res) => {
    const { id } = req.params;
    const camp = await campground.findByIdAndUpdate(id, {...req.body.campground}, {new: true}); 
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename }))
    camp.images.push(...imgs)
    await camp.save()
    if (req.body.deleteImages) { // delete images from mongo
        for(let filename of req.body.deleteImages) {  // delete images from cloudinary
            await cloudinary.uploader.destroy(filename)
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages}}}},{new: true}) // pull form the images array where the filename is in deleteimages
    }
    // console.log(req.body)
    req.flash('success', 'Successfully updated the Campground')
    res.redirect(`/campgrounds/${camp._id}`); 
}

module.exports.deleteCampground = async(req,res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted your Campground!')
    res.redirect('/campgrounds');
}