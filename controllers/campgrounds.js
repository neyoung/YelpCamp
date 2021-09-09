const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary/index');

module.exports.renderIndex = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/', { campgrounds });
}
module.exports.renderNewCampForm = (req, res) => {
    res.render('campgrounds/new');
}
module.exports.renderDetails = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds/');
    }
    res.render('campgrounds/details', { campground });
}
module.exports.renderEdit = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        // throw new ExpressError('id is not valid', 500);
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds/');
    }
    res.render('campgrounds/edit', { campground });
}
module.exports.createCamp = async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    newCampground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    newCampground.author = req.user;
    await newCampground.save();
    //Displays a flash message which is a temporary message that disappears upon page reload
    req.flash('success', 'Successfully created campground!');
    res.redirect(`/campgrounds/${newCampground.id}`);
}
module.exports.updateCamp = async (req, res) => {
    const { id } = req.params;
    const camp = req.body.campground;
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    //Update the Campground fields and push new images to the images array
    const campground = await Campground.findByIdAndUpdate(id, {$set: { 
        title: camp.title,
        location: camp.location,
        price: camp.price,
        description: camp.description 
        }, 
        $push: { 
            images: [...imgs] 
        },
        });

        if(req.body.deleteImages) {
            for (let img of req.body.deleteImages) await cloudinary.uploader.destroy(img);
            await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
}
module.exports.deleteCamp = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds/');
}