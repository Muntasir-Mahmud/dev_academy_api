const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async'); 
const geocoder = require('../utils/geocoder');
const Bootcamp = require('../models/Bootcamp');


// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => { 
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Field to exclude from matching because those are not database fields (eg, select)
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=> `$${match}`);

    // Finding  resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    // Select fields from query
    // for select we have to do someting like this : query.select('name description');
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields); 
    }

    // Sort fields
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt')
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit // Equation of skip make sense
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const bootcamps = await query;

    // Pagonation result
    const pagination = {}

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    res.status(200)
        .json({ success: true, count: bootcamps.length, pagination, data: bootcamps }); 
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
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        ); // return is necessary if we res.status more than one 
    }

    bootcamp.remove();
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
