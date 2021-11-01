const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
    let error = { ...err }
    error.message = err.message

    // Log to console for the developer
    console.log(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404) 
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicated field value entered'
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message); 
        // UP : here we get all the values of all err.errors
        error = new ErrorResponse(message, 400)
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error"
    });
}

module.exports = errorHandler;