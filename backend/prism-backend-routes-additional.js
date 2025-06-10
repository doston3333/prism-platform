// routes/task.routes.js
const router = require('express').Router();
const { Task } = require('../models');
const { auth } = require('../middleware/auth');
const { validateTask, validatePagination } = require('../utils/validators');
const { createNotification, notificationTypes } = require('../utils/notifications');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');

// Get user's tasks
router.get('/', auth, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, milestone } = req.query;
    const { limit: limitNum, offset } = getPagination(page, limit);
    
    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (milestone) where.milestone = milestone;
    
    const data = await Task.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [
        ['status', 'ASC'],
        ['deadline', 'ASC'],
        ['priority', 'DESC']
      ]
    });
    
    const response = getPagingData(data, page, limitNum);
    res.json(response);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// Get upcoming deadlines
router.get('/upcoming', auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        userId: req.user.id,
        status: { [Op.ne]: 'completed' },
        deadline: {
          [Op.gte]: new Date(),
          [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      },
      order: [['deadline', 'ASC']],
      limit: 5
    });
    
    res.json({ tasks });
  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming tasks' });
  }
});

// Create task
router.post('/', auth, validateTask, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user.id
    });
    
    // Set reminder notification if deadline is set
    if (task.deadline) {
      const reminderDate = new Date(task.deadline);
      reminderDate.setDate(reminderDate.getDate() - 1); // 1 day before
      
      if (reminderDate > new Date()) {
        // In production, schedule this notification
        setTimeout(() => {
          createNotification(
            req.user.id,
            notificationTypes.TASK_REMINDER,
            'Task Reminder',
            `Don't forget: "${task.title}" is due tomorrow!`,
            { taskId: task.id }
          );
        }, reminderDate - new Date());
      }
    }
    
    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', auth, validateTask, async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await task.update(req.body);
    res.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Task.destroy({
      where: { id, userId: req.user.id }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

// Get milestones
router.get('/milestones', auth, async (req, res) => {
  try {
    const milestones = [
      { id: 'ielts_prep', name: 'IELTS Preparation', icon: '📚' },
      { id: 'essay_writing', name: 'Essay Writing', icon: '✍️' },
      { id: 'university_research', name: 'University Research', icon: '🔍' },
      { id: 'application_submission', name: 'Application Submission', icon: '📤' },
      { id: 'visa_application', name: 'Visa Application', icon: '📄' },
      { id: 'scholarship_search', name: 'Scholarship Search', icon: '💰' }
    ];
    
    // Get completion status for each milestone
    const tasks = await Task.findAll({
      where: { 
        userId: req.user.id,
        milestone: { [Op.ne]: null }
      },
      attributes: ['milestone', 'status']
    });
    
    const milestoneStatus = tasks.reduce((acc, task) => {
      if (!acc[task.milestone]) {
        acc[task.milestone] = { total: 0, completed: 0 };
      }
      acc[task.milestone].total++;
      if (task.status === 'completed') {
        acc[task.milestone].completed++;
      }
      return acc;
    }, {});
    
    const milestonesWithProgress = milestones.map(m => ({
      ...m,
      progress: milestoneStatus[m.id] 
        ? Math.round((milestoneStatus[m.id].completed / milestoneStatus[m.id].total) * 100)
        : 0,
      totalTasks: milestoneStatus[m.id]?.total || 0,
      completedTasks: milestoneStatus[m.id]?.completed || 0
    }));
    
    res.json({ milestones: milestonesWithProgress });
  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({ message: 'Failed to fetch milestones' });
  }
});

module.exports = router;

// routes/ai.routes.js
const aiRouter = require('express').Router();
const { FAQ } = require('../models');
const { auth, optionalAuth } = require('../middleware/auth');
const axios = require('axios');

// Get FAQs
aiRouter.get('/faqs', async (req, res) => {
  try {
    const { category } = req.query;
    
    const where = {};
    if (category) where.category = category;
    
    const faqs = await FAQ.findAll({
      where,
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });
    
    res.json({ faqs });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Failed to fetch FAQs' });
  }
});

// AI Chat endpoint
aiRouter.post('/chat', auth, async (req, res) => {
  try {
    const { message, context = [] } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Check for FAQ match first
    const faqMatch = await FAQ.findOne({
      where: {
        question: {
          [Op.iLike]: `%${message}%`
        }
      }
    });
    
    if (faqMatch) {
      return res.json({
        response: faqMatch.answer,
        type: 'faq',
        faqId: faqMatch.id
      });
    }
    
    // Call OpenAI API
    try {
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are Prism AI Assistant, helping Uzbek students with international university applications. 
                       Be helpful, encouraging, and provide specific advice about:
                       - IELTS preparation
                       - Essay writing
                       - University selection
                       - Scholarship opportunities
                       - Visa processes
                       Keep responses concise and actionable.`
            },
            ...context.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const aiResponse = openaiResponse.data.choices[0].message.content;
      
      res.json({
        response: aiResponse,
        type: 'ai'
      });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError.response?.data || openaiError);
      
      // Fallback response
      res.json({
        response: "I'm having trouble connecting to my AI service right now. Please try again later or check our FAQs for common questions.",
        type: 'error'
      });
    }
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Failed to process chat request' });
  }
});

// Create FAQ (admin only)
aiRouter.post('/faqs', auth, authorize('admin'), async (req, res) => {
  try {
    const { question, answer, category, order = 0 } = req.body;
    
    if (!question || !answer || !category) {
      return res.status(400).json({ message: 'Question, answer, and category are required' });
    }
    
    const faq = await FAQ.create({
      question,
      answer,
      category,
      order
    });
    
    res.status(201).json({ faq });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ message: 'Failed to create FAQ' });
  }
});

module.exports = aiRouter;

// routes/user.routes.js
const userRouter = require('express').Router();
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const { validateUpdateProfile } = require('../utils/validators');
const multer = require('multer');
const path = require('path');

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile
userRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update profile
userRouter.put('/profile', auth, validateUpdateProfile, async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'bio', 
      'interests', 'goals', 'expertise', 'hourlyRate', 'availability'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    await req.user.update(updates);
    
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Upload avatar
userRouter.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await req.user.update({ avatar: avatarUrl });
    
    res.json({ 
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl 
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// Get notifications
userRouter.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
userRouter.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const updated = await Notification.update(
      { isRead: true },
      { where: { id, userId: req.user.id } }
    );
    
    if (!updated[0]) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// Mark all notifications as read
userRouter.patch('/notifications/read-all', auth, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Failed to update notifications' });
  }
});

module.exports = userRouter;