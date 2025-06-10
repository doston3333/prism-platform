// routes/forum.routes.js
const router = require('express').Router();
const { Post, Comment, PostLike, User } = require('../models');
const { auth, optionalAuth } = require('../middleware/auth');
const { validatePost, validatePagination } = require('../utils/validators');
const { getPagination, getPagingData } = require('../utils/pagination');
const { createNotification, notificationTypes } = require('../utils/notifications');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all posts with filters
router.get('/posts', optionalAuth, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sortBy = 'createdAt' } = req.query;
    const { limit: limitNum, offset } = getPagination(page, limit);
    
    // Build where clause
    const where = {};
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Determine sort order
    let order = [['isPinned', 'DESC']];
    switch (sortBy) {
      case 'popular':
        order.push(['likes', 'DESC']);
        break;
      case 'views':
        order.push(['views', 'DESC']);
        break;
      default:
        order.push(['createdAt', 'DESC']);
    }
    
    const data = await Post.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'postCount']
        },
        {
          model: Comment,
          attributes: ['id'],
          required: false
        }
      ],
      limit: limitNum,
      offset,
      order,
      distinct: true
    });
    
    // Add user like status if authenticated
    if (req.user) {
      const postIds = data.rows.map(post => post.id);
      const userLikes = await PostLike.findAll({
        where: {
          postId: { [Op.in]: postIds },
          userId: req.user.id
        },
        attributes: ['postId']
      });
      
      const likedPostIds = new Set(userLikes.map(like => like.postId));
      data.rows = data.rows.map(post => ({
        ...post.toJSON(),
        isLiked: likedPostIds.has(post.id),
        commentCount: post.Comments ? post.Comments.length : 0
      }));
    } else {
      data.rows = data.rows.map(post => ({
        ...post.toJSON(),
        isLiked: false,
        commentCount: post.Comments ? post.Comments.length : 0
      }));
    }
    
    const response = getPagingData(data, page, limitNum);
    res.json(response);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Get single post
router.get('/posts/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'postCount']
        },
        {
          model: Comment,
          include: [{
            model: User,
            attributes: ['id', 'firstName', 'lastName', 'avatar', 'postCount']
          }],
          order: [['createdAt', 'ASC']]
        }
      ]
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Increment view count
    await post.increment('views');
    
    // Add user like status and badges
    const postData = post.toJSON();
    postData.User.badge = post.User.getBadge();
    
    if (req.user) {
      const userLike = await PostLike.findOne({
        where: { postId: id, userId: req.user.id }
      });
      postData.isLiked = !!userLike;
    } else {
      postData.isLiked = false;
    }
    
    // Add badges to comments
    postData.Comments = postData.Comments.map(comment => ({
      ...comment,
      User: {
        ...comment.User,
        badge: comment.User.postCount >= 15 ? 'Mentor Buddy' : 
               comment.User.postCount >= 5 ? 'Contributor' : 'New Member'
      }
    }));
    
    res.json({ post: postData });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

// Create post
router.post('/posts', auth, validatePost, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    const post = await Post.create({
      userId: req.user.id,
      title,
      content,
      category
    });
    
    // Increment user's post count
    await User.increment('postCount', { where: { id: req.user.id } });
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    io.emit('newPost', {
      postId: post.id,
      category: post.category
    });
    
    const postWithUser = await Post.findByPk(post.id, {
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'avatar', 'postCount']
      }]
    });
    
    res.status(201).json({ post: postWithUser });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Update post
router.put('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await post.update({ title, content });
    
    const updatedPost = await Post.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'avatar', 'postCount']
      }]
    });
    
    res.json({ post: updatedPost });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// Delete post
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (post.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await post.destroy();
    
    // Decrement user's post count
    await User.decrement('postCount', { where: { id: post.userId } });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// Like/unlike post
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const existingLike = await PostLike.findOne({
      where: { postId: id, userId: req.user.id }
    });
    
    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await post.decrement('likes');
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like
      await PostLike.create({
        postId: id,
        userId: req.user.id
      });
      await post.increment('likes');
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Failed to update like status' });
  }
});

// Create comment
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const post = await Post.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id']
      }]
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const comment = await Comment.create({
      postId: id,
      userId: req.user.id,
      content: content.trim()
    });
    
    // Notify post author
    if (post.userId !== req.user.id) {
      await createNotification(
        post.userId,
        notificationTypes.FORUM_REPLY,
        'New Comment',
        `${req.user.firstName} commented on your post "${post.title}"`,
        { postId: id, commentId: comment.id }
      );
    }
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(`post:${id}`).emit('newComment', {
      commentId: comment.id,
      postId: id
    });
    
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'avatar', 'postCount']
      }]
    });
    
    res.status(201).json({ comment: commentWithUser });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// Update comment
router.put('/comments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await comment.update({ content: content.trim() });
    
    const updatedComment = await Comment.findByPk(id, {
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'avatar', 'postCount']
      }]
    });
    
    res.json({ comment: updatedComment });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// Get forum categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'ielts', name: 'IELTS Preparation', icon: '📚' },
      { id: 'essays', name: 'Essay Writing', icon: '✍️' },
      { id: 'visa', name: 'Visa Process', icon: '📄' },
      { id: 'university', name: 'University Selection', icon: '🎓' },
      { id: 'scholarships', name: 'Scholarships', icon: '💰' },
      { id: 'general', name: 'General Discussion', icon: '💬' }
    ];
    
    // Get post counts for each category
    const counts = await Post.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });
    
    const countMap = counts.reduce((acc, { category, count }) => {
      acc[category] = parseInt(count);
      return acc;
    }, {});
    
    const categoriesWithCounts = categories.map(cat => ({
      ...cat,
      postCount: countMap[cat.id] || 0
    }));
    
    res.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Pin/unpin post (admin only)
router.patch('/posts/:id/pin', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned } = req.body;
    
    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    await post.update({ isPinned });
    res.json({ message: `Post ${isPinned ? 'pinned' : 'unpinned'}` });
  } catch (error) {
    console.error('Pin post error:', error);
    res.status(500).json({ message: 'Failed to update pin status' });
  }
});

module.exports = router;