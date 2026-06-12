import cloudinary from '../config/cloudinary.js';

import Course from '../models/Course.js';
import Section from '../models/Section.js';
import Lecture from '../models/Lecture.js';
import Enrollment from '../models/Enrollment.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
export const createCourse = async (req, res) => {
  try {
    console.log('📝 Create course request body:', req.body);
    console.log('👤 Authenticated user:', req.user?._id);

    const { title, description, category, price, whatYouWillLearn, requirements, level, language, thumbnail } = req.body;

    // 1. Validate required fields
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    if (price === undefined || price === null) {
      return res.status(400).json({ message: 'Price is required' });
    }

    // 2. Ensure user is authenticated and has an ID
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // 3. Handle category: if provided, ensure it's a valid ObjectId; else set null
    let categoryId = null;
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      categoryId = category;
    } else if (category) {
      // If category is a string, try to find by name or slug
      const existingCategory = await Category.findOne({ $or: [{ name: category }, { slug: category }] });
      if (existingCategory) {
        categoryId = existingCategory._id;
      } else {
        // Optionally create a default category or ignore
        console.warn(`Category "${category}" not found, will be saved as null`);
      }
    }

    // 4. Create course
    const course = await Course.create({
      title,
      description,
      instructor: req.user._id,
      category: categoryId,
      price: Number(price),
      whatYouWillLearn: whatYouWillLearn || [],
      requirements: requirements || [],
      level: level || 'beginner',
      language: language || 'English',
      thumbnail: thumbnail || 'https://via.placeholder.com/300',
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('❌ Create course error:', error);
    // Send detailed error in development
    const message = process.env.NODE_ENV === 'development' ? error.message : 'Failed to create course';
    res.status(500).json({ message, stack: error.stack });
  }
};

// @desc    Get all courses (with filters)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const { category, level, price, search, page = 1, limit = 10, instructor, sortBy = 'newest' } = req.query;
    
    let query = { isPublished: true, isApproved: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (instructor) query.instructor = instructor;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (price === 'free') query.price = 0;
    if (price === 'paid') query.price = { $gt: 0 };
    
    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      case 'popular':
        sort = { totalStudents: -1 };
        break;
      case 'rating':
        sort = { rating: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar bio totalStudents')
      .populate('category', 'name slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);
    
    const total = await Course.countDocuments(query);
    
    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get instructor courses
// @route   GET /api/courses/my-courses
// @access  Private (Instructor)

export const getMyCourses = async (req, res) => {
  try {
    console.log('=== getMyCourses called ===');
    console.log('User from token:', req.user);
    console.log('Instructor ID:', req.user._id);

    const courses = await Course.find({ instructor: req.user._id })
      .populate('category', 'name')
      .sort('-createdAt');
    
    console.log(`Found ${courses.length} courses`);
    res.json(courses);
  } catch (error) {
    console.error('Error in getMyCourses:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email bio avatar totalStudents totalEarnings')
      .populate('category', 'name slug');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get sections and their lectures
    const sections = await Section.find({ course: course._id }).sort('order').lean();
    
    const sectionsWithLectures = await Promise.all(
      sections.map(async (section) => {
        const lectures = await Lecture.find({ section: section._id }).sort('order').lean();
        return { ...section, lectures };
      })
    );

    // Check enrollment
    let isEnrolled = false;
    let enrollmentProgress = 0;
    if (req.user) {
      const enrollment = await Enrollment.findOne({ user: req.user._id, course: course._id });
      isEnrolled = !!enrollment;
      enrollmentProgress = enrollment?.progress || 0;
    }

    // Reviews
    const reviews = await Review.find({ course: course._id, isApproved: true })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .limit(10)
      .lean();

    // Related courses
    let relatedCourses = [];
    if (course.category) {
      relatedCourses = await Course.find({
        _id: { $ne: course._id },
        category: course.category,
        isPublished: true,
        isApproved: true,
      })
      .limit(4)
      .populate('instructor', 'name')
      .select('title thumbnail price rating totalStudents')
      .lean();
    }

    res.json({
      course: course.toObject(),
      sections: sectionsWithLectures,
      isEnrolled,
      enrollmentProgress,
      reviews,
      relatedCourses,
    });
  } catch (error) {
    console.error('Error in getCourseById:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete all sections and lectures
    await Section.deleteMany({ course: course._id });
    await Lecture.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });
    await Review.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload course thumbnail (FIXED - only one version)
// @route   POST /api/courses/upload-thumbnail
// @access  Private
export const uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // No need to reconfigure; cloudinary is already configured
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'course-thumbnails',
      width: 1280,
      height: 720,
      crop: 'fill',
    });
    
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add section to course
// @route   POST /api/courses/:courseId/sections
// @access  Private (Instructor)
export const addSection = async (req, res) => {
  try {
    const { title } = req.body;
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const sectionCount = await Section.countDocuments({ course: req.params.courseId });
    
    const section = await Section.create({
      title,
      course: req.params.courseId,
      order: sectionCount + 1,
    });
    
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update section
// @route   PUT /api/courses/sections/:sectionId
// @access  Private (Instructor)
export const updateSection = async (req, res) => {
  try {
    const { title } = req.body;
    const section = await Section.findById(req.params.sectionId).populate('course');
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    if (section.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    section.title = title;
    await section.save();
    
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete section
// @route   DELETE /api/courses/sections/:sectionId
// @access  Private (Instructor)
export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.sectionId).populate('course');
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    if (section.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Lecture.deleteMany({ section: section._id });
    await Section.findByIdAndDelete(req.params.sectionId);
    
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add lecture to section
// @route   POST /api/courses/sections/:sectionId/lectures
// @access  Private (Instructor)
export const addLecture = async (req, res) => {
  try {
    const { title, description, videoType, youtubeUrl, videoPublicId, videoDuration, isPreview } = req.body;
    const section = await Section.findById(req.params.sectionId).populate('course');
    if (!section) return res.status(404).json({ message: 'Section not found' });

    if (section.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const lectureCount = await Lecture.countDocuments({ section: req.params.sectionId });
    const lecture = await Lecture.create({
      title,
      description,
      videoType,
      youtubeUrl: videoType === 'youtube' ? youtubeUrl : undefined,
      videoPublicId: videoType === 'upload' ? videoPublicId : undefined,
      videoDuration: videoDuration || 0,
      isPreview: isPreview || false,
      section: req.params.sectionId,
      order: lectureCount + 1,
    });

    await Course.findByIdAndUpdate(section.course._id, {
      $inc: { totalLectures: 1, duration: videoDuration || 0 }
    });

    res.status(201).json(lecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lecture
// @route   PUT /api/courses/lectures/:lectureId
// @access  Private (Instructor)
export const updateLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.lectureId).populate({
      path: 'section',
      populate: { path: 'course' }
    });
    
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    
    if (lecture.section.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedLecture = await Lecture.findByIdAndUpdate(
      req.params.lectureId,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedLecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete lecture
// @route   DELETE /api/courses/lectures/:lectureId
// @access  Private (Instructor)
export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.lectureId).populate({
      path: 'section',
      populate: { path: 'course' }
    });
    
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    
    if (lecture.section.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Lecture.findByIdAndDelete(req.params.lectureId);
    
    // Update course total lectures and duration
    await Course.findByIdAndUpdate(lecture.section.course._id, {
      $inc: { totalLectures: -1, duration: -lecture.videoDuration }
    });
    
    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle course publish status
// @route   PATCH /api/courses/:id/publish
// @access  Private (Instructor)
export const togglePublishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    course.isPublished = !course.isPublished;
    await course.save();
    
    res.json({ isPublished: course.isPublished });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const alreadyEnrolled = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });
    
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: course._id,
    });
    
    // Update course total students
    await Course.findByIdAndUpdate(course._id, {
      $inc: { totalStudents: 1 }
    });
    
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update lecture progress
// @route   POST /api/courses/:courseId/progress/:lectureId
// @access  Private
export const updateProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    if (!enrollment.completedLectures.includes(lectureId)) {
      enrollment.completedLectures.push(lectureId);
      
      // Calculate progress
      const course = await Course.findById(courseId);
      const progress = (enrollment.completedLectures.length / course.totalLectures) * 100;
      enrollment.progress = Math.round(progress);
      
      if (progress >= 100) {
        enrollment.isCompleted = true;
        enrollment.completedAt = new Date();
      }
      
      await enrollment.save();
    }
    
    res.json({ progress: enrollment.progress, isCompleted: enrollment.isCompleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review to course
// @route   POST /api/courses/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: course._id,
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You must enroll in this course to leave a review' });
    }
    
    // Check if already reviewed
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      course: course._id,
    });
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Already reviewed this course' });
    }
    
    const review = await Review.create({
      user: req.user._id,
      course: course._id,
      rating,
      comment,
    });
    
    // Update course rating
    const reviews = await Review.find({ course: course._id, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;
    
    course.rating = avgRating;
    course.totalReviews = reviews.length;
    await course.save();
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};