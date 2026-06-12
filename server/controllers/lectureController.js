import Lecture from '../models/Lecture.js';

// Add a resource to a lecture
export const addResourceToLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { name, url } = req.body;
    const lecture = await Lecture.findById(lectureId).populate('section');
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    // Check instructor ownership
    if (lecture.section.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    lecture.resources.push({ name, url });
    await lecture.save();
    res.json({ message: 'Resource added', resources: lecture.resources });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a resource from a lecture
export const removeResourceFromLecture = async (req, res) => {
  try {
    const { lectureId, resourceIndex } = req.params;
    const lecture = await Lecture.findById(lectureId).populate('section');
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    if (lecture.section.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    lecture.resources.splice(parseInt(resourceIndex), 1);
    await lecture.save();
    res.json({ message: 'Resource removed', resources: lecture.resources });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};