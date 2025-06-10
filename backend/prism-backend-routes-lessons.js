// routes/lesson.routes.js
const router = require('express').Router();
const { Lesson, LessonProgress, Note, Quiz, User } = require('../models');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { validateLesson, validatePagination } = require('../utils/validators');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require('sequelize');
const { createNotification, notificationTypes } = require('../utils/notifications');

// Get all lessons (with optional filters)
router.get('/', optionalAuth, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, orderBy = 'order' } = req.query;
    const { limit: limitNum, offset } = getPagination(page, limit);
    
    // Build where clause
    const where = { isPublished: true };
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Get lessons with progress if user is authenticated
    const include = [];
    if (req.user) {
      include.push({
        model: LessonProgress,
        where: { userId: req.user.id },
        required: false
      });
    }
    
    const data = await Lesson.findAndCountAll({
      where,
      include,
      limit: limitNum,
      offset,
      order: [[orderBy, 'ASC']],
      distinct: true
    });
    
    const response = getPagingData(data, page, limitNum);
    res.json(response);
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
});

// Get single lesson
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const include = [
      {
        model: Quiz,
        required: false
      }
    ];
    
    if (req.user) {
      include.push({
        model: LessonProgress,
        where: { userId: req.user.id },
        required: false
      });
      include.push({
        model: Note,
        where: { userId: req.user.id },
        required: false,
        order: [['createdAt', 'DESC']]
      });
    }
    
    const lesson = await Lesson.findByPk(id, { include });
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Increment view count
    if (req.user) {
      await lesson.increment('views');
    }
    
    res.json({ lesson });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Failed to fetch lesson' });
  }
});

// Create lesson (admin only)
router.post('/', auth, authorize('admin'), validateLesson, async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Failed to create lesson' });
  }
});

// Update lesson (admin only)
router.put('/:id', auth, authorize('admin'), validateLesson, async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    await lesson.update(req.body);
    res.json({ lesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Failed to update lesson' });
  }
});

// Delete lesson (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    await lesson.destroy();
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Failed to delete lesson' });
  }
});

// Update lesson progress
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, timestamp } = req.body;
    
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Progress must be between 0 and 100' });
    }
    
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    let lessonProgress = await LessonProgress.findOne({
      where: { lessonId: id, userId: req.user.id }
    });
    
    if (!lessonProgress) {
      lessonProgress = await LessonProgress.create({
        lessonId: id,
        userId: req.user.id,
        progress,
        lastWatchedAt: new Date()
      });
    } else {
      const updateData = {
        progress,
        lastWatchedAt: new Date()
      };
      
      // Mark as completed if progress is 100%
      if (progress === 100 && !lessonProgress.completed) {
        updateData.completed = true;
        updateData.completedAt = new Date();
        
        // Create notification
        await createNotification(
          req.user.id,
          notificationTypes.LESSON_COMPLETED,
          'Lesson Completed!',
          `Congratulations! You've completed "${lesson.title}"`,
          { lessonId: id }
        );
      }
      
      await lessonProgress.update(updateData);
    }
    
    res.json({ progress: lessonProgress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
});

// Get user's lesson progress
router.get('/progress/all', auth, async (req, res) => {
  try {
    const progress = await LessonProgress.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Lesson,
        attributes: ['id', 'title', 'category', 'thumbnail', 'duration']
      }],
      order: [['lastWatchedAt', 'DESC']]
    });
    
    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

// Add note to lesson
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, timestamp } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Note content is required' });
    }
    
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    const note = await Note.create({
      userId: req.user.id,
      lessonId: id,
      content: content.trim(),
      timestamp: timestamp || 0
    });
    
    res.status(201).json({ note });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ message: 'Failed to add note' });
  }
});

// Get notes for a lesson
router.get('/:id/notes', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notes = await Note.findAll({
      where: {
        lessonId: id,
        userId: req.user.id
      },
      order: [['timestamp', 'ASC'], ['createdAt', 'DESC']]
    });
    
    res.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// Update note
router.put('/notes/:noteId', auth, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Note content is required' });
    }
    
    const note = await Note.findOne({
      where: { id: noteId, userId: req.user.id }
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    await note.update({ content: content.trim() });
    res.json({ note });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Failed to update note' });
  }
});

// Delete note
router.delete('/notes/:noteId', auth, async (req, res) => {
  try {
    const { noteId } = req.params;
    
    const note = await Note.findOne({
      where: { id: noteId, userId: req.user.id }
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    await note.destroy();
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

// Get lesson categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Lesson.findAll({
      attributes: ['category'],
      group: ['category'],
      where: { isPublished: true }
    });
    
    res.json({ categories: categories.map(c => c.category) });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

module.exports = router;

// routes/quiz.routes.js
const quizRouter = require('express').Router();
const { Quiz, QuizAttempt, Lesson, LessonProgress } = require('../models');
const { auth } = require('../middleware/auth');
const { createNotification, notificationTypes } = require('../utils/notifications');

// Get quiz for a lesson
quizRouter.get('/lesson/:lessonId', auth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    const quiz = await Quiz.findOne({
      where: { lessonId },
      include: [{
        model: Lesson,
        attributes: ['id', 'title']
      }]
    });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found for this lesson' });
    }
    
    // Check if user has already attempted
    const previousAttempt = await QuizAttempt.findOne({
      where: {
        userId: req.user.id,
        quizId: quiz.id
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ quiz, previousAttempt });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz' });
  }
});

// Submit quiz attempt
quizRouter.post('/:id/attempt', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    
    const quiz = await Quiz.findByPk(id, {
      include: [{
        model: Lesson,
        attributes: ['id', 'title']
      }]
    });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers array is required' });
    }
    
    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    
    // Create attempt record
    const attempt = await QuizAttempt.create({
      userId: req.user.id,
      quizId: id,
      score,
      answers,
      passed
    });
    
    // Update lesson progress if passed
    if (passed) {
      await LessonProgress.update(
        { completed: true, completedAt: new Date() },
        { where: { userId: req.user.id, lessonId: quiz.Lesson.id } }
      );
      
      // Send notification
      await createNotification(
        req.user.id,
        notificationTypes.QUIZ_PASSED,
        'Quiz Passed!',
        `Great job! You scored ${score}% on the quiz for "${quiz.Lesson.title}"`,
        { quizId: id, score }
      );
    }
    
    res.json({
      attempt,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      passed,
      score
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

// Get user's quiz attempts
quizRouter.get('/attempts', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Quiz,
        include: [{
          model: Lesson,
          attributes: ['id', 'title', 'category']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ attempts });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz attempts' });
  }
});

// Create/update quiz (admin only)
quizRouter.post('/lesson/:lessonId', auth, authorize('admin'), async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, questions, passingScore = 70 } = req.body;
    
    if (!title || !questions || !Array.isArray(questions) || questions.length < 1) {
      return res.status(400).json({ message: 'Valid title and questions array required' });
    }
    
    // Validate question format
    const isValidFormat = questions.every(q => 
      q.question && 
      Array.isArray(q.options) && 
      q.options.length >= 2 && 
      typeof q.correctAnswer === 'number' &&
      q.correctAnswer >= 0 &&
      q.correctAnswer < q.options.length
    );
    
    if (!isValidFormat) {
      return res.status(400).json({ message: 'Invalid question format' });
    }
    
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    let quiz = await Quiz.findOne({ where: { lessonId } });
    
    if (quiz) {
      await quiz.update({ title, questions, passingScore });
    } else {
      quiz = await Quiz.create({
        lessonId,
        title,
        questions,
        passingScore
      });
    }
    
    res.json({ quiz });
  } catch (error) {
    console.error('Create/update quiz error:', error);
    res.status(500).json({ message: 'Failed to save quiz' });
  }
});

// Delete quiz (admin only)
quizRouter.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    await quiz.destroy();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Failed to delete quiz' });
  }
});

module.exports = quizRouter;