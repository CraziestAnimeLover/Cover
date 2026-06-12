import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  // Video source type: 'upload' (default) or 'youtube'
  videoType: {
    type: String,
    enum: ['upload', 'youtube'],
    default: 'upload',
  },
  // For YouTube videos: store the full URL or embed ID
  youtubeUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (this.videoType !== 'youtube') return true;
        return v && (v.includes('youtube.com/watch') || v.includes('youtu.be/') || v.includes('youtube.com/embed/'));
      },
      message: 'Invalid YouTube URL',
    },
  },
  // For Cloudinary uploaded videos: store the public ID
  videoPublicId: {
    type: String,
  },
  // For uploaded videos (S3/Spaces key) - legacy, kept for backward compatibility
  videoKey: {
    type: String,
  },
  // Legacy field (optional, for backward compatibility)
  videoUrl: {
    type: String,
  },
  videoDuration: {
    type: Number,
    default: 0,
  },
  isPreview: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
  },
  resources: [{
    name: String,
    url: String,
  }],
}, {
  timestamps: true,
});

// Prevent model overwrite error
const Lecture = mongoose.models.Lecture || mongoose.model('Lecture', lectureSchema);
export default Lecture;