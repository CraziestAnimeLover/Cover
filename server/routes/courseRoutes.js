import express from 'express';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  uploadThumbnail,
  addSection,
  updateSection,
  deleteSection,
  addLecture,
  updateLecture,
  deleteLecture,
  togglePublishCourse,
  enrollCourse,
  updateProgress,
  addReview,
  getMyCourses
} from '../controllers/courseController.js';
import { addResourceToLecture, removeResourceFromLecture } from '../controllers/lectureController.js';
import { protect } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCourses)
  .post(protect, roleMiddleware('instructor', 'admin'), createCourse);

router.get('/my-courses', protect, roleMiddleware('instructor'), getMyCourses);
router.get('/featured', getCourses);
router.post('/upload-thumbnail', protect, upload.single('thumbnail'), uploadThumbnail);
router.post('/lectures/:lectureId/resources', protect, addResourceToLecture);
router.delete('/lectures/:lectureId/resources/:resourceIndex', protect, removeResourceFromLecture);

router.route('/:id')
  .get(getCourseById)
  .put(protect, updateCourse)
  .delete(protect, deleteCourse);

router.patch('/:id/publish', protect, togglePublishCourse);
router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/reviews', protect, addReview);
router.post('/:courseId/progress/:lectureId', protect, updateProgress);

// Section routes
router.post('/:courseId/sections', protect, roleMiddleware('instructor', 'admin'), addSection);
router.put('/sections/:sectionId', protect, updateSection);
router.delete('/sections/:sectionId', protect, deleteSection);

// Lecture routes
router.post('/sections/:sectionId/lectures', protect, addLecture);
router.put('/lectures/:lectureId', protect, updateLecture);
router.delete('/lectures/:lectureId', protect, deleteLecture);

export default router;