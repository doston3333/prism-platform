// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
    return Promise.reject(error);
  }
);

export default api;

// src/services/auth.service.js
import api from './api';

const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  generateParentCode: async () => {
    const response = await api.post('/auth/generate-parent-code');
    return response.data;
  },

  connectParent: async (connectionCode) => {
    const response = await api.post('/auth/parent-connect', { connectionCode });
    return response.data;
  }
};

export default authService;

// src/services/lesson.service.js
import api from './api';

const lessonService = {
  getLessons: async (params = {}) => {
    const response = await api.get('/lessons', { params });
    return response.data;
  },

  getLesson: async (id) => {
    const response = await api.get(`/lessons/${id}`);
    return response.data.lesson;
  },

  updateProgress: async (lessonId, progress) => {
    const response = await api.post(`/lessons/${lessonId}/progress`, { progress });
    return response.data.progress;
  },

  getUserProgress: async () => {
    const response = await api.get('/lessons/progress/all');
    return response.data.progress;
  },

  addNote: async (lessonId, content, timestamp) => {
    const response = await api.post(`/lessons/${lessonId}/notes`, { content, timestamp });
    return response.data.note;
  },

  getNotes: async (lessonId) => {
    const response = await api.get(`/lessons/${lessonId}/notes`);
    return response.data.notes;
  },

  updateNote: async (noteId, content) => {
    const response = await api.put(`/lessons/notes/${noteId}`, { content });
    return response.data.note;
  },

  deleteNote: async (noteId) => {
    const response = await api.delete(`/lessons/notes/${noteId}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/lessons/meta/categories');
    return response.data.categories;
  }
};

export default lessonService;

// src/services/quiz.service.js
import api from './api';

const quizService = {
  getQuizByLesson: async (lessonId) => {
    const response = await api.get(`/quizzes/lesson/${lessonId}`);
    return response.data;
  },

  submitQuizAttempt: async (quizId, answers) => {
    const response = await api.post(`/quizzes/${quizId}/attempt`, { answers });
    return response.data;
  },

  getUserAttempts: async () => {
    const response = await api.get('/quizzes/attempts');
    return response.data.attempts;
  }
};

export default quizService;

// src/services/scholarship.service.js
import api from './api';

const scholarshipService = {
  getScholarships: async (params = {}) => {
    const response = await api.get('/scholarships', { params });
    return response.data;
  },

  getScholarship: async (id) => {
    const response = await api.get(`/scholarships/${id}`);
    return response.data.scholarship;
  },

  getRecommended: async () => {
    const response = await api.get('/scholarships/recommended');
    return response.data.scholarships;
  },

  bookmarkScholarship: async (id) => {
    const response = await api.post(`/scholarships/${id}/bookmark`);
    return response.data;
  },

  removeBookmark: async (id) => {
    const response = await api.delete(`/scholarships/${id}/bookmark`);
    return response.data;
  },

  getUserBookmarks: async () => {
    const response = await api.get('/scholarships/user/bookmarks');
    return response.data.bookmarks;
  }
};

export default scholarshipService;

// src/services/mentor.service.js
import api from './api';

const mentorService = {
  getMentors: async (params = {}) => {
    const response = await api.get('/mentors', { params });
    return response.data;
  },

  getMentor: async (id) => {
    const response = await api.get(`/mentors/${id}`);
    return response.data.mentor;
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/mentors/book', bookingData);
    return response.data.booking;
  },

  getUserBookings: async () => {
    const response = await api.get('/mentors/bookings/my');
    return response.data.bookings;
  },

  updateBookingStatus: async (bookingId, status, meetingUrl = null) => {
    const response = await api.patch(`/mentors/bookings/${bookingId}/status`, { status, meetingUrl });
    return response.data.booking;
  },

  submitReview: async (bookingId, rating, comment) => {
    const response = await api.post(`/mentors/bookings/${bookingId}/review`, { rating, comment });
    return response.data.review;
  },

  getMentorAvailability: async (mentorId, date) => {
    const response = await api.get(`/mentors/${mentorId}/availability`, { params: { date } });
    return response.data;
  }
};

export default mentorService;

// src/services/forum.service.js
import api from './api';

const forumService = {
  getPosts: async (params = {}) => {
    const response = await api.get('/forum/posts', { params });
    return response.data;
  },

  getPost: async (id) => {
    const response = await api.get(`/forum/posts/${id}`);
    return response.data.post;
  },

  createPost: async (postData) => {
    const response = await api.post('/forum/posts', postData);
    return response.data.post;
  },

  updatePost: async (id, postData) => {
    const response = await api.put(`/forum/posts/${id}`, postData);
    return response.data.post;
  },

  deletePost: async (id) => {
    const response = await api.delete(`/forum/posts/${id}`);
    return response.data;
  },

  likePost: async (id) => {
    const response = await api.post(`/forum/posts/${id}/like`);
    return response.data;
  },

  createComment: async (postId, content) => {
    const response = await api.post(`/forum/posts/${postId}/comments`, { content });
    return response.data.comment;
  },

  updateComment: async (id, content) => {
    const response = await api.put(`/forum/comments/${id}`, { content });
    return response.data.comment;
  },

  deleteComment: async (id) => {
    const response = await api.delete(`/forum/comments/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/forum/categories');
    return response.data.categories;
  }
};

export default forumService;

// src/services/task.service.js
import api from './api';

const taskService = {
  getTasks: async (params = {}) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getUpcomingTasks: async () => {
    const response = await api.get('/tasks/upcoming');
    return response.data.tasks;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data.task;
  },

  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data.task;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getMilestones: async () => {
    const response = await api.get('/tasks/milestones');
    return response.data.milestones;
  }
};

export default taskService;

// src/services/ai.service.js
import api from './api';

const aiService = {
  sendMessage: async (message, context = []) => {
    const response = await api.post('/ai/chat', { message, context });
    return response.data;
  },

  getFAQs: async (category = null) => {
    const params = category ? { category } : {};
    const response = await api.get('/ai/faqs', { params });
    return response.data.faqs;
  }
};

export default aiService;

// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      authService.getCurrentUser()
        .then(currentUser => {
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        })
        .catch(() => {
          logout();
        });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      toast.success('Login successful!');
      
      // Navigate based on role
      switch (data.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'parent':
          navigate('/parent/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      toast.success('Registration successful! Welcome to Prism!');
      navigate('/dashboard');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    navigate('/');
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isMentor: user?.role === 'mentor',
    isStudent: user?.role === 'student',
    isParent: user?.role === 'parent'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      socketRef.current = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        socketRef.current.emit('authenticate', user.id);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [user]);

  return socketRef.current;
};
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));