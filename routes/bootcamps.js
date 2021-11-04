const express = require('express');
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius
} = require('../controllers/bootcamps')
const router = express.Router();

// Include other resource routers
const courseRouter = require('./courses');

// Re-route to course routers
router
    .use('/:bootcampId/courses', courseRouter);

router
    .route("/radius/:zipcode/:distance")
    .get(getBootcampInRadius);

router
    .route("/")
    .get(getBootcamps)
    .post(createBootcamp);

router
    .route("/:id")
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp)

module.exports = router;