// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'mentor', 'parent', 'admin'),
    defaultValue: 'student'
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  phone: {
    type: DataTypes.STRING
  },
  bio: {
    type: DataTypes.TEXT
  },
  interests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  goals: {
    type: DataTypes.TEXT
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // For mentors
  expertise: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  hourlyRate: {
    type: DataTypes.DECIMAL(10, 2)
  },
  availability: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // For forum badges
  postCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.getBadge = function() {
  if (this.postCount >= 15) return 'Mentor Buddy';
  if (this.postCount >= 5) return 'Contributor';
  return 'New Member';
};

// models/Lesson.js
const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER // in seconds
  },
  thumbnail: {
    type: DataTypes.STRING
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
});

// models/LessonProgress.js
const LessonProgress = sequelize.define('LessonProgress', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  lastWatchedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE
  }
});

// models/Note.js
const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  timestamp: {
    type: DataTypes.INTEGER // video timestamp in seconds
  }
});

// models/Quiz.js
const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  questions: {
    type: DataTypes.JSON,
    allowNull: false
    // Format: [{ question: string, options: string[], correctAnswer: number }]
  },
  passingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 70
  }
});

// models/QuizAttempt.js
const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  quizId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false
  },
  passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// models/Scholarship.js
const Scholarship = sequelize.define('Scholarship', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  amount: {
    type: DataTypes.STRING,
    allowNull: false
  },
  field: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetGroup: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  requirements: {
    type: DataTypes.TEXT
  },
  applicationUrl: {
    type: DataTypes.STRING
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// models/ScholarshipBookmark.js
const ScholarshipBookmark = sequelize.define('ScholarshipBookmark', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  scholarshipId: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

// models/Booking.js
const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  mentorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60 // minutes
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  topic: {
    type: DataTypes.STRING
  },
  notes: {
    type: DataTypes.TEXT
  },
  meetingUrl: {
    type: DataTypes.STRING
  }
});

// models/Review.js
const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bookingId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  mentorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT
  }
});

// models/Post.js
const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// models/Comment.js
const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// models/PostLike.js
const PostLike = sequelize.define('PostLike', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

// models/Task.js
const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  deadline: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  milestone: {
    type: DataTypes.STRING
  }
});

// models/Notification.js
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  data: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
});

// models/University.js
const University = sequelize.define('University', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ranking: {
    type: DataTypes.INTEGER
  },
  tuitionFee: {
    type: DataTypes.STRING
  },
  ieltsRequirement: {
    type: DataTypes.DECIMAL(2, 1)
  },
  description: {
    type: DataTypes.TEXT
  },
  majors: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  applicationUrl: {
    type: DataTypes.STRING
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  deadline: {
    type: DataTypes.STRING
  }
});

// models/FAQ.js
const FAQ = sequelize.define('FAQ', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  question: {
    type: DataTypes.STRING,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// models/Testimonial.js
const Testimonial = sequelize.define('Testimonial', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// models/ParentConnection.js
const ParentConnection = sequelize.define('ParentConnection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  connectionCode: {
    type: DataTypes.STRING,
    unique: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// models/Message.js
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

// Set up associations
const setupAssociations = () => {
  // User associations
  User.hasMany(LessonProgress, { foreignKey: 'userId' });
  User.hasMany(Note, { foreignKey: 'userId' });
  User.hasMany(QuizAttempt, { foreignKey: 'userId' });
  User.hasMany(ScholarshipBookmark, { foreignKey: 'userId' });
  User.hasMany(Post, { foreignKey: 'userId' });
  User.hasMany(Comment, { foreignKey: 'userId' });
  User.hasMany(Task, { foreignKey: 'userId' });
  User.hasMany(Notification, { foreignKey: 'userId' });

  // Lesson associations
  Lesson.hasMany(LessonProgress, { foreignKey: 'lessonId' });
  Lesson.hasMany(Note, { foreignKey: 'lessonId' });
  Lesson.hasOne(Quiz, { foreignKey: 'lessonId' });

  // Quiz associations
  Quiz.belongsTo(Lesson, { foreignKey: 'lessonId' });
  Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId' });

  // Progress associations
  LessonProgress.belongsTo(User, { foreignKey: 'userId' });
  LessonProgress.belongsTo(Lesson, { foreignKey: 'lessonId' });

  // Note associations
  Note.belongsTo(User, { foreignKey: 'userId' });
  Note.belongsTo(Lesson, { foreignKey: 'lessonId' });

  // Scholarship associations
  Scholarship.hasMany(ScholarshipBookmark, { foreignKey: 'scholarshipId' });
  ScholarshipBookmark.belongsTo(User, { foreignKey: 'userId' });
  ScholarshipBookmark.belongsTo(Scholarship, { foreignKey: 'scholarshipId' });

  // Booking associations
  Booking.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
  Booking.belongsTo(User, { as: 'mentor', foreignKey: 'mentorId' });
  Booking.hasOne(Review, { foreignKey: 'bookingId' });

  // Review associations
  Review.belongsTo(Booking, { foreignKey: 'bookingId' });
  Review.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
  Review.belongsTo(User, { as: 'mentor', foreignKey: 'mentorId' });

  // Forum associations
  Post.belongsTo(User, { foreignKey: 'userId' });
  Post.hasMany(Comment, { foreignKey: 'postId' });
  Post.hasMany(PostLike, { foreignKey: 'postId' });

  Comment.belongsTo(Post, { foreignKey: 'postId' });
  Comment.belongsTo(User, { foreignKey: 'userId' });

  PostLike.belongsTo(Post, { foreignKey: 'postId' });
  PostLike.belongsTo(User, { foreignKey: 'userId' });

  // Task associations
  Task.belongsTo(User, { foreignKey: 'userId' });

  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'userId' });

  // Parent connections
  ParentConnection.belongsTo(User, { as: 'parent', foreignKey: 'parentId' });
  ParentConnection.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

  // Message associations
  Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
  Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
};

setupAssociations();

module.exports = {
  User,
  Lesson,
  LessonProgress,
  Note,
  Quiz,
  QuizAttempt,
  Scholarship,
  ScholarshipBookmark,
  Booking,
  Review,
  Post,
  Comment,
  PostLike,
  Task,
  Notification,
  University,
  FAQ,
  Testimonial,
  ParentConnection,
  Message
};