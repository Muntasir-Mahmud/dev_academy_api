const express = require('express');
const {
    deleteCourse,
    updateCourse,
    getCourses,
    getCourse,
    addCourse
} = require('../controllers/courses');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getCourses)
    .post(addCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);

module.exports = router;