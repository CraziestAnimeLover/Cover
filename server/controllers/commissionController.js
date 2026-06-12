import Course from '../models/Course.js';
import Section from '../models/Section.js';
import Lecture from '../models/Lecture.js';
import Enrollment from '../models/Enrollment.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// ============ COURSE CRUD OPERATIONS ============

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
export const createCourse = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      price, 
      whatYouWillLearn, 
      requirements, 
      targetAudience,
      level, 
      language, 
      thumbnail,
      tags 
    } = req.body;
    
    const course = await Course.create({
      title,
      description,
      instructor: req.user._id,
      category,
      price: price || 0,
      whatYouWillLearn: whatYouWillLearn || [],
      requirements: requirements || [],
      targetAudience: targetAudience || [],
      level: level || 'beginner',
      language: language || 'English',
      thumbnail: thumbnail || 'https://via.placeholder.com/300x200?text=Course+Thumbnail',
      tags: tags || [],
    });
    
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses (with advanced filters)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const { 
      category, 
      level, 
      price, 
      search, 
      page = 1, 
      limit = 12, 
      instructor,
      sortBy = 'newest',
      rating,
      language,
      priceMin,
      priceMax
    } = req.query;
    
    let query = { isPublished: true, isApproved: true };
    
    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) query.category = categoryDoc._id;
      else query.category = category;
    }
    
    // Level filter
    if (level) query.level = level;
    
    // Instructor filter
    if (instructor) query.instructor = instructor;
    
    // Language filter
    if (language) query.language = language;
    
    // Price filters
    if (price === 'free') query.price = 0;
    if (price === 'paid') query.price = { $gt: 0 };
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = parseFloat(priceMin);
      if (priceMax) query.price.$lte = parseFloat(priceMax);
    }
    
    // Rating filter
    if (rating) query.rating = { $gte: parseFloat(rating) };
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { whatYouWillLearn: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
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
      case 'best-selling':
        sort = { totalStudents: -1, rating: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar bio totalStudents totalCourses')
      .populate('category', 'name slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);
    
    const total = await Course.countDocuments(query);
    
    // Get additional stats for the result
    const stats = {
      totalCourses: total,
      averagePrice: await Course.aggregate([
        { $match: query },
        { $group: { _id: null, avg: { $avg: '$price' } } }
      ]).then(res => res[0]?.avg || 0),
      categories: await Course.distinct('category', query).then(ids => ids.length),
    };
    
    res.json({
      courses,
      stats,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured courses
// @route   GET /api/courses/featured
// @access  Public
export const getFeaturedCourses = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const featuredCourses = await Course.find({ isPublished: true, isApproved: true })
      .populate('instructor', 'name avatar')
      .populate('category', 'name')
      .sort({ totalStudents: -1, rating: -1 })
      .limit(parseInt(limit));
    
    res.json(featuredCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get instructor's courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor)
export const getMyCourses = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { instructor: req.user._id };
    if (status === 'published') query.isPublished = true;
    if (status === 'draft') query.isPublished = false;
    if (status === 'pending') query.isApproved = false;
    
    const courses = await Course.find(query)
      .populate('category', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Course.countDocuments(query);
    
    res.json({
      courses,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course with full details
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email bio avatar totalStudents totalEarnings createdAt')
      .populate('category', 'name slug description');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Get sections and lectures
    const sections = await Section.find({ course: course._id }).sort('order');
    const lectures = await Lecture.find({ 
      section: { $in: sections.map(s => s._id) } 
    }).sort('order');
    
    // Get curriculum with nested lectures
    const curriculum = sections.map(section => ({
      ...section.toObject(),
      lectures: lectures.filter(l => l.section.toString() === section._id.toString()),
    }));
    
    // Check if user is enrolled
    let isEnrolled = false;
    let enrollmentProgress = 0;
    let enrollmentId = null;
    
    if (req.user) {
      const enrollment = await Enrollment.findOne({ 
        user: req.user._id, 
        course: course._id 
      });
      isEnrolled = !!enrollment;
      enrollmentProgress = enrollment?.progress || 0;
      enrollmentId = enrollment?._id;
    }
    
    // Get reviews with pagination
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({ course: course._id, isApproved: true })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalReviews = await Review.countDocuments({ course: course._id, isApproved: true });
    
    // Get related courses (same category)
    const relatedCourses = await Course.find({
      _id: { $ne: course._id },
      category: course.category,
      isPublished: true,
      isApproved: true,
    })
      .limit(4)
      .populate('instructor', 'name')
      .select('title thumbnail price rating totalStudents');
    
    res.json({
      course: course.toObject(),
      curriculum,
      isEnrolled,
      enrollmentProgress,
      enrollmentId,
      reviews: {
        data: reviews,
        pagination: {
          totalPages: Math.ceil(totalReviews / limit),
          currentPage: parseInt(page),
          total: totalReviews,
        },
      },
      relatedCourses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    
    // Delete all related data
    await Section.deleteMany({ course: course._id });
    await Lecture.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });
    await Review.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(req.params.id);
    
    // Update instructor's course count
    await User.findByIdAndUpdate(course.instructor, {
      $inc: { totalCourses: -1 }
    });
    
    res.json({ message: 'Course deleted successfully' });
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
    
    // Check if course has at least one section and lecture
    const sectionCount = await Section.countDocuments({ course: course._id });
    const lectureCount = await Lecture.countDocuments({ course: course._id });
    
    if (sectionCount === 0 || lectureCount === 0) {
      return res.status(400).json({ 
        message: 'Course must have at least one section and lecture before publishing' 
      });
    }
    
    course.isPublished = !course.isPublished;
    await course.save();
    
    res.json({ 
      isPublished: course.isPublished,
      message: course.isPublished ? 'Course published successfully' : 'Course unpublished'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload course thumbnail
// @route   POST /api/courses/upload-thumbnail
// @access  Private
export const uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'course-thumbnails',
      width: 1280,
      height: 720,
      crop: 'fill',
    });
    
    res.json({ 
      url: result.secure_url, 
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete thumbnail
// @route   DELETE /api/courses/thumbnail/:publicId
// @access  Private
export const deleteThumbnail = async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ message: 'Thumbnail deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ SECTIONS MANAGEMENT ============

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
    
    // Delete all lectures in this section
    const lectures = await Lecture.find({ section: section._id });
    const totalDuration = lectures.reduce((sum, l) => sum + (l.videoDuration || 0), 0);
    
    await Lecture.deleteMany({ section: section._id });
    await Section.findByIdAndDelete(req.params.sectionId);
    
    // Update course total lectures and duration
    await Course.findByIdAndUpdate(section.course._id, {
      $inc: { 
        totalLectures: -lectures.length,
        duration: -totalDuration
      }
    });
    
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reorder sections
// @route   PUT /api/courses/:courseId/sections/reorder
// @access  Private (Instructor)
export const reorderSections = async (req, res) => {
  try {
    const { sectionOrders } = req.body; // [{ id, order }]
    
    for (const item of sectionOrders) {
      await Section.findByIdAndUpdate(item.id, { order: item.order });
    }
    
    res.json({ message: 'Sections reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ LECTURES MANAGEMENT ============

// @desc    Add lecture to section
// @route   POST /api/courses/sections/:sectionId/lectures
// @access  Private (Instructor)
export const addLecture = async (req, res) => {
  try {
    const { title, description, videoUrl, isPreview, videoDuration, resources } = req.body;
    const section = await Section.findById(req.params.sectionId).populate('course');
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    if (section.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const lectureCount = await Lecture.countDocuments({ section: req.params.sectionId });
    
    const lecture = await Lecture.create({
      title,
      description,
      videoUrl,
      videoDuration: videoDuration || 0,
      isPreview: isPreview || false,
      section: req.params.sectionId,
      order: lectureCount + 1,
      resources: resources || [],
    });
    
    // Update course total lectures and duration
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
    
    // Update duration if videoDuration changed
    const oldDuration = lecture.videoDuration;
    const newDuration = req.body.videoDuration || oldDuration;
    
    const updatedLecture = await Lecture.findByIdAndUpdate(
      req.params.lectureId,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Update course duration if needed
    if (oldDuration !== newDuration) {
      await Course.findByIdAndUpdate(lecture.section.course._id, {
        $inc: { duration: newDuration - oldDuration }
      });
    }
    
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

// @desc    Reorder lectures
// @route   PUT /api/courses/sections/:sectionId/lectures/reorder
// @access  Private (Instructor)
export const reorderLectures = async (req, res) => {
  try {
    const { lectureOrders } = req.body; // [{ id, order }]
    
    for (const item of lectureOrders) {
      await Lecture.findByIdAndUpdate(item.id, { order: item.order });
    }
    
    res.json({ message: 'Lectures reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ ENROLLMENT & PROGRESS ============

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
    
    // Update instructor stats
    await User.findByIdAndUpdate(course.instructor, {
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
      enrollment.progress = Math.min(100, Math.round(progress));
      
      if (progress >= 100) {
        enrollment.isCompleted = true;
        enrollment.completedAt = new Date();
      }
      
      enrollment.lastAccessed = new Date();
      await enrollment.save();
    }
    
    res.json({ 
      progress: enrollment.progress, 
      isCompleted: enrollment.isCompleted,
      completedLectures: enrollment.completedLectures.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get course progress
// @route   GET /api/courses/:courseId/progress
// @access  Private
export const getProgress = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
    }).populate('completedLectures');
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }
    
    res.json({
      progress: enrollment.progress,
      isCompleted: enrollment.isCompleted,
      completedLectures: enrollment.completedLectures.length,
      lastAccessed: enrollment.lastAccessed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ REVIEWS & RATINGS ============

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
      rating: parseInt(rating),
      comment,
    });
    
    // Update course rating
    const reviews = await Review.find({ course: course._id, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;
    
    course.rating = Number(avgRating.toFixed(1));
    course.totalReviews = reviews.length;
    await course.save();
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get course reviews
// @route   GET /api/courses/:id/reviews
// @access  Public
export const getCourseReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const reviews = await Review.find({ 
      course: req.params.id, 
      isApproved: true 
    })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments({ 
      course: req.params.id, 
      isApproved: true 
    });
    
    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(req.params.id), isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      reviews,
      ratingDistribution,
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/courses/reviews/:reviewId
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();
    
    // Update course rating
    const reviews = await Review.find({ course: review.course, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / reviews.length;
    
    await Course.findByIdAndUpdate(review.course, {
      rating: Number(avgRating.toFixed(1)),
    });
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/courses/reviews/:reviewId
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await review.deleteOne();
    
    // Update course rating
    const reviews = await Review.find({ course: review.course, isApproved: true });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    await Course.findByIdAndUpdate(review.course, {
      rating: Number(avgRating.toFixed(1)),
      totalReviews: reviews.length,
    });
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ COURSE ANALYTICS ============

// @desc    Get course analytics for instructor
// @route   GET /api/courses/:id/analytics
// @access  Private (Instructor)
export const getCourseAnalytics = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get enrollment trends
    const enrollmentsOverTime = await Enrollment.aggregate([
      { $match: { course: course._id } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);
    
    // Get completion rate
    const totalEnrollments = await Enrollment.countDocuments({ course: course._id });
    const completedEnrollments = await Enrollment.countDocuments({ 
      course: course._id, 
      isCompleted: true 
    });
    
    const completionRate = totalEnrollments > 0 
      ? (completedEnrollments / totalEnrollments) * 100 
      : 0;
    
    // Get average watch time per lecture
    const lectureEngagement = await Lecture.aggregate([
      { $match: { course: course._id } },
      {
        $lookup: {
          from: 'enrollments',
          let: { lectureId: '$_id' },
          pipeline: [
            { $match: { $expr: { $in: ['$$lectureId', '$completedLectures'] } } }
          ],
          as: 'completions'
        }
      },
      {
        $project: {
          title: 1,
          completions: { $size: '$completions' }
        }
      }
    ]);
    
    res.json({
      totalEnrollments,
      completedEnrollments,
      completionRate: completionRate.toFixed(1),
      averageRating: course.rating,
      totalReviews: course.totalReviews,
      enrollmentsOverTime,
      lectureEngagement,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};