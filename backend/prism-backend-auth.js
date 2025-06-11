// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth, authorize, optionalAuth };

// utils/jwt.js
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };

// utils/validators.js
const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('role').isIn(['student', 'mentor', 'parent', 'admin']).optional(),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors
];

const validateUpdateProfile = [
  body('firstName').notEmpty().trim().optional(),
  body('lastName').notEmpty().trim().optional(),
  body('phone').isMobilePhone().optional(),
  body('interests').isArray().optional(),
  body('expertise').isArray().optional(),
  handleValidationErrors
];

const validateLesson = [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('videoUrl').isURL(),
  handleValidationErrors
];

const validateScholarship = [
  body('name').notEmpty().trim(),
  body('country').notEmpty().trim(),
  body('deadline').isISO8601(),
  body('amount').notEmpty(),
  body('field').notEmpty().trim(),
  body('targetGroup').notEmpty().trim(),
  handleValidationErrors
];

const validateBooking = [
  body('mentorId').isUUID(),
  body('date').isISO8601(),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('topic').notEmpty().trim().optional(),
  handleValidationErrors
];

const validatePost = [
  body('title').notEmpty().trim(),
  body('content').notEmpty().trim(),
  body('category').notEmpty().trim(),
  handleValidationErrors
];

const validateTask = [
  body('title').notEmpty().trim(),
  body('deadline').isISO8601().optional(),
  body('priority').isIn(['low', 'medium', 'high']).optional(),
  body('status').isIn(['pending', 'in_progress', 'completed']).optional(),
  handleValidationErrors
];

const validatePagination = [
  query('page').isInt({ min: 1 }).optional(),
  query('limit').isInt({ min: 1, max: 100 }).optional(),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateLesson,
  validateScholarship,
  validateBooking,
  validatePost,
  validateTask,
  validatePagination
};

// utils/email.js
// Mock email service - in production, integrate with real email service
const sendEmail = async (to, subject, html) => {
  console.log(`Email sent to ${to}: ${subject}`);
  // In production, use services like SendGrid, AWS SES, etc.
  return true;
};

const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  const html = `
    <h1>Welcome to Prism!</h1>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verificationUrl}">Verify Email</a>
  `;
  return sendEmail(user.email, 'Verify your Prism account', html);
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const html = `
    <h1>Password Reset Request</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail(user.email, 'Password Reset - Prism', html);
};

const sendBookingNotification = async (booking, user, type) => {
  const subjects = {
    'new': 'New Booking Request',
    'accepted': 'Booking Accepted',
    'declined': 'Booking Declined',
    'cancelled': 'Booking Cancelled'
  };
  
  const html = `
    <h1>${subjects[type]}</h1>
    <p>Booking details:</p>
    <ul>
      <li>Date: ${booking.date}</li>
      <li>Time: ${booking.time}</li>
      <li>Topic: ${booking.topic || 'General consultation'}</li>
    </ul>
  `;
  
  return sendEmail(user.email, subjects[type], html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingNotification
};

// utils/pagination.js
const getPagination = (page = 1, size = 10) => {
  const limit = +size;
  const offset = (+page - 1) * limit;
  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: items } = data;
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(totalItems / limit);
  
  return { 
    items, 
    totalItems, 
    totalPages, 
    currentPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

module.exports = { getPagination, getPagingData };

// utils/notifications.js
const { Notification } = require('../models');

const createNotification = async (userId, type, title, message, data = {}) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    data
  });
  
  // Emit socket event if io is available
  const io = global.io;
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
  
  return notification;
};

const notificationTypes = {
  LESSON_COMPLETED: 'lesson_completed',
  QUIZ_PASSED: 'quiz_passed',
  BOOKING_REQUEST: 'booking_request',
  BOOKING_ACCEPTED: 'booking_accepted',
  BOOKING_DECLINED: 'booking_declined',
  TASK_REMINDER: 'task_reminder',
  NEW_MESSAGE: 'new_message',
  FORUM_REPLY: 'forum_reply',
  SCHOLARSHIP_DEADLINE: 'scholarship_deadline'
};

module.exports = { createNotification, notificationTypes };