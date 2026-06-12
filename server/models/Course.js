import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  previewVideo: String,
  whatYouWillLearn: [String],
  requirements: [String],
  targetAudience: [String],
  language: {
    type: String,
    default: 'English',
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  duration: {
    type: Number,
    default: 0,
  },
  totalLectures: {
    type: Number,
    default: 0,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  discountPrice: Number,
  discountExpiry: Date,
  tags: [String],
}, {
  timestamps: true,
});

// Check if model already exists before creating
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

export default Course;