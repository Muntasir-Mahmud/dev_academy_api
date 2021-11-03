const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async'); 
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');


// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => { 
    let query;
    let queryStr = JSON.stringify(req.query);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=> `$${match}`);

    query = Bootcamp.find(JSON.parse(queryStr));
    const bootcamps = await query;
    res.status(200)
        .json({ success: true, count: bootcamps.length, data: bootcamps }); 
})


// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => { 
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }
    res.status(200)
        .json({success: true, data: bootcamp});
})


// @desc    Create New bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body)

    res.status(201)
        .json({success: true,data: bootcamp});   
})

// @desc    Update New bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Privat
exports.updateBootcamp = asyncHandler(async (req, res, next) => { 
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // this will give us the updated data
        runValidators: true, // update the validator
    })
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }
    res.status(200)
        .json({success: true, data: bootcamp})
})


// @desc    Delete New bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => { 
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        ); // return is necessary if we res.status more than one 
    }
    res.status(200).json({success: true});
})


// @desc    Get bootcamp with radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => { 
    const { zipcode, distance } = req.params;

    // Get lat and lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius using radius
    // Divide distance by radius of earth
    // Earth radius = 3,963 miles / 6,378 km
    const radius = distance / 6378;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
      });
    
      res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
      });
})
