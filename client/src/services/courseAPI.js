import api from './api'

export const courseAPI = {
  // Course CRUD
  getCourses: (params) => api.get('/courses', { params }),
  getCourseById: (id) => api.get(`/courses/${id}`),
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  publishCourse: (id) => api.patch(`/courses/${id}/publish`),
  
  // Sections
  addSection: (courseId, sectionData) => api.post(`/courses/${courseId}/sections`, sectionData),
  updateSection: (sectionId, sectionData) => api.put(`/courses/sections/${sectionId}`, sectionData),
  deleteSection: (sectionId) => api.delete(`/courses/sections/${sectionId}`),
  
  // Lectures
  addLecture: (sectionId, lectureData) => api.post(`/courses/sections/${sectionId}/lectures`, lectureData),
  updateLecture: (lectureId, lectureData) => api.put(`/courses/lectures/${lectureId}`, lectureData),
  deleteLecture: (lectureId) => api.delete(`/courses/lectures/${lectureId}`),
  
  // Enrollment & Progress
  enrollCourse: (courseId) => api.post(`/courses/${courseId}/enroll`),
  updateProgress: (courseId, lectureId) => api.post(`/courses/${courseId}/progress/${lectureId}`),
  getProgress: (courseId) => api.get(`/courses/${courseId}/progress`),
  
  // Reviews
  addReview: (courseId, reviewData) => api.post(`/courses/${courseId}/reviews`, reviewData),
  getReviews: (courseId, params) => api.get(`/courses/${courseId}/reviews`, { params }),
  
  // Upload
  uploadThumbnail: (formData) => api.post('/courses/upload-thumbnail', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
}

export default courseAPI