// routes/university.routes.js
const router = require('express').Router();
const { University } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { validatePagination } = require('../utils/validators');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require('sequelize');

// Get universities with filters
router.get('/', validatePagination, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      country,
      minRanking,
      maxRanking,
      maxTuition,
      minIelts,
      search
    } = req.query;
    
    const { limit: limitNum, offset } = getPagination(page, limit);
    
    // Build where clause
    const where = {};
    if (country) where.country = country;
    if (minRanking) where.ranking = { [Op.gte]: parseInt(minRanking) };
    if (maxRanking) where.ranking = { ...where.ranking, [Op.lte]: parseInt(maxRanking) };
    if (minIelts) where.ieltsRequirement = { [Op.gte]: parseFloat(minIelts) };
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { majors: { [Op.contains]: [search] } }
      ];
    }
    
    const data = await University.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['ranking', 'ASC']],
      distinct: true
    });
    
    const response = getPagingData(data, page, limitNum);
    res.json(response);
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({ message: 'Failed to fetch universities' });
  }
});

// Get single university
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const university = await University.findByPk(id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    res.json({ university });
  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({ message: 'Failed to fetch university' });
  }
});

// Get countries list
router.get('/meta/countries', async (req, res) => {
  try {
    const countries = await University.findAll({
      attributes: ['country'],
      group: ['country'],
      order: [['country', 'ASC']]
    });
    
    res.json({ countries: countries.map(c => c.country) });
  } catch (error) {
    console.error('Get countries error:', error);
    res.status(500).json({ message: 'Failed to fetch countries' });
  }
});

// Admin routes
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const university = await University.create(req.body);
    res.status(201).json({ university });
  } catch (error) {
    console.error('Create university error:', error);
    res.status(500).json({ message: 'Failed to create university' });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const university = await University.findByPk(id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    await university.update(req.body);
    res.json({ university });
  } catch (error) {
    console.error('Update university error:', error);
    res.status(500).json({ message: 'Failed to update university' });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await University.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'University not found' });
    }
    
    res.json({ message: 'University deleted successfully' });
  } catch (error) {
    console.error('Delete university error:', error);
    res.status(500).json({ message: 'Failed to delete university' });
  }
});

module.exports = router;

// routes/stats.routes.js
const statsRouter = require('express').Router();
const { User, Lesson, Scholarship, University, Post } = require('../models');
const sequelize = require('../config/database');

// Get platform stats for landing page
statsRouter.get('/platform', async (req, res) => {
  try {
    const [studentCount, lessonCount, scholarshipCount, mentorCount] = await Promise.all([
      User.count({ where: { role: 'student' } }),
      Lesson.count({ where: { isPublished: true } }),
      Scholarship.count({ where: { isActive: true } }),
      User.count({ where: { role: 'mentor' } })
    ]);
    
    res.json({
      stats: {
        students: studentCount,
        lessons: lessonCount,
        scholarships: scholarshipCount,
        mentors: mentorCount
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get user dashboard stats
statsRouter.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [
      completedLessons,
      totalLessons,
      pendingTasks,
      upcomingBookings
    ] = await Promise.all([
      LessonProgress.count({
        where: { userId, completed: true }
      }),
      Lesson.count({ where: { isPublished: true } }),
      Task.count({
        where: { userId, status: { [Op.ne]: 'completed' } }
      }),
      Booking.count({
        where: {
          [req.user.role === 'mentor' ? 'mentorId' : 'studentId']: userId,
          status: 'accepted',
          date: { [Op.gte]: new Date() }
        }
      })
    ]);
    
    res.json({
      stats: {
        completedLessons,
        totalLessons,
        progressPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        pendingTasks,
        upcomingBookings
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = statsRouter;

// routes/parent.routes.js
const parentRouter = require('express').Router();
const { User, ParentConnection, LessonProgress, Task, Booking, Message } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// Get connected children
parentRouter.get('/children', auth, authorize('parent'), async (req, res) => {
  try {
    const connections = await ParentConnection.findAll({
      where: { parentId: req.user.id, isActive: true },
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'lastActive']
      }]
    });
    
    res.json({ children: connections.map(c => c.student) });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ message: 'Failed to fetch connected children' });
  }
});

// Get child's progress
parentRouter.get('/children/:childId/progress', auth, authorize('parent'), async (req, res) => {
  try {
    const { childId } = req.params;
    
    // Verify parent-child connection
    const connection = await ParentConnection.findOne({
      where: {
        parentId: req.user.id,
        studentId: childId,
        isActive: true
      }
    });
    
    if (!connection) {
      return res.status(403).json({ message: 'Not authorized to view this student\'s progress' });
    }
    
    // Get progress data
    const [lessonProgress, tasks, upcomingBookings] = await Promise.all([
      LessonProgress.findAll({
        where: { userId: childId },
        include: [{
          model: Lesson,
          attributes: ['id', 'title', 'category', 'duration']
        }],
        order: [['lastWatchedAt', 'DESC']]
      }),
      Task.findAll({
        where: {
          userId: childId,
          deadline: { [Op.gte]: new Date() }
        },
        order: [['deadline', 'ASC']],
        limit: 10
      }),
      Booking.findAll({
        where: {
          studentId: childId,
          status: 'accepted',
          date: { [Op.gte]: new Date() }
        },
        include: [{
          model: User,
          as: 'mentor',
          attributes: ['id', 'firstName', 'lastName']
        }],
        order: [['date', 'ASC'], ['time', 'ASC']],
        limit: 5
      })
    ]);
    
    res.json({
      progress: {
        lessons: lessonProgress,
        tasks,
        bookings: upcomingBookings
      }
    });
  } catch (error) {
    console.error('Get child progress error:', error);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

// Send message to admin
parentRouter.post('/support/message', auth, authorize('parent'), async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Find an admin user
    const admin = await User.findOne({ where: { role: 'admin' } });
    if (!admin) {
      return res.status(500).json({ message: 'No admin available' });
    }
    
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: admin.id,
      content: content.trim()
    });
    
    // Notify admin
    await createNotification(
      admin.id,
      notificationTypes.NEW_MESSAGE,
      'New Support Message',
      `${req.user.firstName} ${req.user.lastName} sent a message`,
      { messageId: message.id }
    );
    
    res.status(201).json({ message: 'Message sent to support' });
  } catch (error) {
    console.error('Send support message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = parentRouter;

// routes/admin.routes.js
const adminRouter = require('express').Router();
const { Testimonial, Message } = require('../models');
const { auth, authorize } = require('../middleware/auth');

// Middleware to ensure admin access
adminRouter.use(auth, authorize('admin'));

// Get all testimonials
adminRouter.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
});

// Create testimonial
adminRouter.post('/testimonials', async (req, res) => {
  try {
    const { name, role, content, image } = req.body;
    
    if (!name || !role || !content) {
      return res.status(400).json({ message: 'Name, role, and content are required' });
    }
    
    const testimonial = await Testimonial.create({
      name,
      role,
      content,
      image
    });
    
    res.status(201).json({ testimonial });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ message: 'Failed to create testimonial' });
  }
});

// Update testimonial
adminRouter.put('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    await testimonial.update(req.body);
    res.json({ testimonial });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ message: 'Failed to update testimonial' });
  }
});

// Delete testimonial
adminRouter.delete('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Testimonial.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ message: 'Failed to delete testimonial' });
  }
});

// Get support messages
adminRouter.get('/support/messages', async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { receiverId: req.user.id },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ messages });
  } catch (error) {
    console.error('Get support messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Reply to support message
adminRouter.post('/support/reply', async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }
    
    const message = await Message.create({
      senderId: req.user.id,
      receiverId: recipientId,
      content: content.trim()
    });
    
    await createNotification(
      recipientId,
      notificationTypes.NEW_MESSAGE,
      'Support Reply',
      'You have a new message from support',
      { messageId: message.id }
    );
    
    res.status(201).json({ message });
  } catch (error) {
    console.error('Send reply error:', error);
    res.status(500).json({ message: 'Failed to send reply' });
  }
});

module.exports = adminRouter;

// socket/socketHandler.js
const socketHandler = (io) => {
  // Store user socket connections
  const userSockets = new Map();
  
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);
    
    // Join user room on authentication
    socket.on('authenticate', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} joined room`);
      }
    });
    
    // Join post room for real-time comments
    socket.on('joinPost', (postId) => {
      socket.join(`post:${postId}`);
      console.log(`Socket joined post room: ${postId}`);
    });
    
    // Leave post room
    socket.on('leavePost', (postId) => {
      socket.leave(`post:${postId}`);
      console.log(`Socket left post room: ${postId}`);
    });
    
    // Handle mentor booking responses
    socket.on('bookingResponse', (data) => {
      const { bookingId, studentId, status } = data;
      io.to(`user:${studentId}`).emit('bookingUpdate', {
        bookingId,
        status
      });
    });
    
    // Handle typing indicators for messages
    socket.on('typing', (data) => {
      const { recipientId, isTyping } = data;
      io.to(`user:${recipientId}`).emit('userTyping', {
        userId: data.userId,
        isTyping
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove from userSockets map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
      console.log('Socket disconnected:', socket.id);
    });
  });
  
  // Make io available globally for notifications
  global.io = io;
};

module.exports = socketHandler;