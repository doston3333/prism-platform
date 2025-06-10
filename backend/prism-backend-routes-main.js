// routes/scholarship.routes.js
const router = require('express').Router();
const { Scholarship, ScholarshipBookmark, User } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { validateScholarship, validatePagination } = require('../utils/validators');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require('sequelize');
const { createNotification, notificationTypes } = require('../utils/notifications');

// Get scholarships with filters
router.get('/', validatePagination, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      country, 
      field, 
      targetGroup,
      minAmount,
      maxAmount,
      search 
    } = req.query;
    
    const { limit: limitNum, offset } = getPagination(page, limit);
    
    // Build where clause
    const where = { isActive: true };
    if (country) where.country = country;
    if (field) where.field = field;
    if (targetGroup) where.targetGroup = targetGroup;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const data = await Scholarship.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['deadline', 'ASC']],
      distinct: true
    });
    
    const response = getPagingData(data, page, limitNum);
    res.json(response);
  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({ message: 'Failed to fetch scholarships' });
  }
});

// Get recommended scholarships for user
router.get('/recommended', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const userInterests = user.interests || [];
    
    // Basic recommendation logic based on user interests
    const where = {
      isActive: true,
      deadline: { [Op.gte]: new Date() }
    };
    
    if (userInterests.length > 0) {
      where.field = { [Op.in]: userInterests };
    }
    
    const scholarships = await Scholarship.findAll({
      where,
      limit: 5,
      order: [['deadline', 'ASC']]
    });
    
    res.json({ scholarships });
  } catch (error) {
    console.error('Get recommended scholarships error:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

// Get single scholarship
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    res.json({ scholarship });
  } catch (error) {
    console.error('Get scholarship error:', error);
    res.status(500).json({ message: 'Failed to fetch scholarship' });
  }
});

// Bookmark scholarship
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    const [bookmark, created] = await ScholarshipBookmark.findOrCreate({
      where: {
        userId: req.user.id,
        scholarshipId: id
      }
    });
    
    res.json({ 
      message: created ? 'Scholarship bookmarked' : 'Already bookmarked',
      bookmark 
    });
  } catch (error) {
    console.error('Bookmark scholarship error:', error);
    res.status(500).json({ message: 'Failed to bookmark scholarship' });
  }
});

// Remove bookmark
router.delete('/:id/bookmark', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await ScholarshipBookmark.destroy({
      where: {
        userId: req.user.id,
        scholarshipId: id
      }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ message: 'Failed to remove bookmark' });
  }
});

// Get user's bookmarked scholarships
router.get('/user/bookmarks', auth, async (req, res) => {
  try {
    const bookmarks = await ScholarshipBookmark.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Scholarship,
        where: { isActive: true }
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ bookmarks });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ message: 'Failed to fetch bookmarks' });
  }
});

// Admin routes
router.post('/', auth, authorize('admin'), validateScholarship, async (req, res) => {
  try {
    const scholarship = await Scholarship.create(req.body);
    res.status(201).json({ scholarship });
  } catch (error) {
    console.error('Create scholarship error:', error);
    res.status(500).json({ message: 'Failed to create scholarship' });
  }
});

router.put('/:id', auth, authorize('admin'), validateScholarship, async (req, res) => {
  try {
    const { id } = req.params;
    
    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    await scholarship.update(req.body);
    res.json({ scholarship });
  } catch (error) {
    console.error('Update scholarship error:', error);
    res.status(500).json({ message: 'Failed to update scholarship' });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    await scholarship.destroy();
    res.json({ message: 'Scholarship deleted successfully' });
  } catch (error) {
    console.error('Delete scholarship error:', error);
    res.status(500).json({ message: 'Failed to delete scholarship' });
  }
});

module.exports = router;

// routes/mentor.routes.js
const mentorRouter = require('express').Router();
const { User, Booking, Review, Message } = require('../models');
const { auth, authorize } = require('../middleware/auth');
const { validateBooking, validatePagination } = require('../utils/validators');
const { getPagination, getPagingData } = require('../utils/pagination');
const { sendBookingNotification } = require('../utils/email');
const { createNotification, notificationTypes } = require('../utils/notifications');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all mentors
mentorRouter.get('/', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, expertise, search } = req.query;
    const { limit: limitNum, offset } = getPagination(page, limit);
    
    // Build where clause
    const where = { role: 'mentor' };
    if (expertise) {
      where.expertise = { [Op.contains]: [expertise] };
    }
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { bio: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const data = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: limitNum,
      offset,
      order: [['rating', 'DESC']],
      distinct: true
    });
    
    const response = getPagingData(data, page, limitNum);
    res.json(response);
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ message: 'Failed to fetch mentors' });
  }
});

// Get single mentor profile
mentorRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const mentor = await User.findOne({
      where: { id, role: 'mentor' },
      attributes: { exclude: ['password'] },
      include: [{
        model: Review,
        as: 'Reviews',
        include: [{
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'avatar']
        }],
        limit: 5,
        order: [['createdAt', 'DESC']]
      }]
    });
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    res.json({ mentor });
  } catch (error) {
    console.error('Get mentor error:', error);
    res.status(500).json({ message: 'Failed to fetch mentor' });
  }
});

// Create booking
mentorRouter.post('/book', auth, validateBooking, async (req, res) => {
  try {
    const { mentorId, date, time, topic, notes, duration = 60 } = req.body;
    
    // Verify mentor exists
    const mentor = await User.findOne({
      where: { id: mentorId, role: 'mentor' }
    });
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    // Check for existing booking at same time
    const existingBooking = await Booking.findOne({
      where: {
        mentorId,
        date,
        time,
        status: { [Op.in]: ['pending', 'accepted'] }
      }
    });
    
    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }
    
    // Create booking
    const booking = await Booking.create({
      studentId: req.user.id,
      mentorId,
      date,
      time,
      duration,
      topic,
      notes,
      status: 'pending'
    });
    
    // Send notifications
    await sendBookingNotification(booking, mentor, 'new');
    await createNotification(
      mentorId,
      notificationTypes.BOOKING_REQUEST,
      'New Booking Request',
      `${req.user.firstName} ${req.user.lastName} has requested a session`,
      { bookingId: booking.id }
    );
    
    res.status(201).json({ booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Get user's bookings
mentorRouter.get('/bookings/my', auth, async (req, res) => {
  try {
    const where = req.user.role === 'mentor' 
      ? { mentorId: req.user.id }
      : { studentId: req.user.id };
    
    const bookings = await Booking.findAll({
      where,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
        },
        {
          model: User,
          as: 'mentor',
          attributes: ['id', 'firstName', 'lastName', 'email', 'avatar', 'expertise']
        }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });
    
    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Update booking status (mentor only)
mentorRouter.patch('/bookings/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, meetingUrl } = req.body;
    
    if (!['accepted', 'declined', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const booking = await Booking.findOne({
      where: { id },
      include: [
        { model: User, as: 'student' },
        { model: User, as: 'mentor' }
      ]
    });
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check permissions
    const isMentor = req.user.id === booking.mentorId;
    const isStudent = req.user.id === booking.studentId;
    
    if (!isMentor && !isStudent) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Only mentors can accept/decline, students can only cancel
    if ((status === 'accepted' || status === 'declined') && !isMentor) {
      return res.status(403).json({ message: 'Only mentors can accept or decline bookings' });
    }
    
    if (status === 'cancelled' && !isStudent) {
      return res.status(403).json({ message: 'Only students can cancel bookings' });
    }
    
    const updateData = { status };
    if (status === 'accepted' && meetingUrl) {
      updateData.meetingUrl = meetingUrl;
    }
    
    await booking.update(updateData);
    
    // Send notifications
    const notifyUser = isMentor ? booking.student : booking.mentor;
    await sendBookingNotification(booking, notifyUser, status);
    
    if (status === 'accepted') {
      await createNotification(
        booking.studentId,
        notificationTypes.BOOKING_ACCEPTED,
        'Booking Accepted!',
        `Your session with ${booking.mentor.firstName} has been confirmed`,
        { bookingId: booking.id }
      );
    }
    
    res.json({ booking });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Failed to update booking' });
  }
});

// Submit review
mentorRouter.post('/bookings/:id/review', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Only students can review their sessions' });
    }
    
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed sessions' });
    }
    
    // Check if already reviewed
    const existingReview = await Review.findOne({
      where: { bookingId: id }
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'Session already reviewed' });
    }
    
    // Create review
    const review = await Review.create({
      bookingId: id,
      studentId: booking.studentId,
      mentorId: booking.mentorId,
      rating,
      comment
    });
    
    // Update mentor's average rating
    const avgRating = await Review.findOne({
      where: { mentorId: booking.mentorId },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews']
      ],
      raw: true
    });
    
    await User.update(
      {
        rating: parseFloat(avgRating.avgRating).toFixed(2),
        totalReviews: avgRating.totalReviews
      },
      { where: { id: booking.mentorId } }
    );
    
    res.status(201).json({ review });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

// Get mentor availability
mentorRouter.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    const mentor = await User.findOne({
      where: { id, role: 'mentor' },
      attributes: ['id', 'availability']
    });
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    // Get booked slots for the date
    const bookings = await Booking.findAll({
      where: {
        mentorId: id,
        date,
        status: { [Op.in]: ['pending', 'accepted'] }
      },
      attributes: ['time']
    });
    
    const bookedTimes = bookings.map(b => b.time);
    
    res.json({
      availability: mentor.availability,
      bookedTimes
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ message: 'Failed to fetch availability' });
  }
});

module.exports = mentorRouter;