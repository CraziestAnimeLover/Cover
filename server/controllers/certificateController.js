import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { generateCertificate } from '../services/certificateService.js';

// @desc    Generate certificate for a completed course
// @route   GET /api/certificates/:enrollmentId
// @access  Private (student only)
export const getCertificate = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId)
      .populate('user')
      .populate('course');
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    // Check ownership
    if (enrollment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Ensure course is completed
    if (!enrollment.isCompleted) {
      return res.status(400).json({ message: 'Course not completed yet' });
    }
    
    const pdfBuffer = await generateCertificate(
      enrollment.user,
      enrollment.course,
      enrollment.completedAt || new Date()
    );
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate_${enrollment.course.title.replace(/\s/g, '_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
};