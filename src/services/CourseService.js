import api from '../api/axios';

const getAllCourses = () => {
  return api.get('/public/courses');
};

const getCourseById = (id) => {
  return api.get(`/courses/${id}`);
};

const createCourse = (courseData) => {
  return api.post('/public/courses', courseData);
};

const updateCourse = (courseId, courseData) => {
  return api.put(`/public/courses/${courseId}`, courseData);
};

const deleteCourse = (courseId) => {
  return api.delete(`/public/courses/${courseId}`);
};

const CourseService = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};

export default CourseService; 
 