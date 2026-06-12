import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Async Thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/courses', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/create',
  async (courseData, { rejectWithValue }) => {
    try {
      const response = await api.post('/courses', courseData);
      toast.success('Course created successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/update',
  async ({ id, courseData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/courses/${id}`, courseData);
      toast.success('Course updated successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted successfully!');
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'courses/enroll',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/courses/${courseId}/enroll`);
      toast.success('Enrolled successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateProgress = createAsyncThunk(
  'courses/updateProgress',
  async ({ courseId, lectureId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/courses/${courseId}/progress/${lectureId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const addReview = createAsyncThunk(
  'courses/addReview',
  async ({ courseId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/courses/${courseId}/reviews`, reviewData);
      toast.success('Review submitted successfully!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  courses: [],
  currentCourse: null,
  myCourses: [],
  isLoading: false,
  error: null,
  pagination: {
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 12
  }
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.courses;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Course By ID
      .addCase(fetchCourseById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Course
      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.unshift(action.payload);
      })
      
      // Update Course
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      })
      
      // Delete Course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter(c => c._id !== action.payload);
      })
      
      // Enroll in Course
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        if (state.currentCourse) {
          state.currentCourse.isEnrolled = true;
        }
      });
  }
});

export const { clearCurrentCourse, clearError } = courseSlice.actions;
export default courseSlice.reducer;