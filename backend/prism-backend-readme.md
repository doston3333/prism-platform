# Prism Backend

Backend API for Prism - Educational platform for Uzbek students applying to international universities.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd prism-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Set up the database**
```bash
# Create PostgreSQL database
createdb prism_db

# Run migrations and seeders
npm run seed
```

5. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Using Docker

1. **Build and run with Docker Compose**
```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Build and run the backend API
- Run database migrations and seeders
- Expose the API on port 5000

## 📚 API Documentation

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Main Endpoints

#### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/parent-connect` - Connect parent to student

#### Lessons
- `GET /api/lessons` - Get all lessons (with filters)
- `GET /api/lessons/:id` - Get single lesson
- `POST /api/lessons/:id/progress` - Update lesson progress
- `POST /api/lessons/:id/notes` - Add note to lesson
- `GET /api/lessons/progress/all` - Get user's progress

#### Quizzes
- `GET /api/quizzes/lesson/:lessonId` - Get quiz for lesson
- `POST /api/quizzes/:id/attempt` - Submit quiz attempt
- `GET /api/quizzes/attempts` - Get user's attempts

#### Scholarships
- `GET /api/scholarships` - Get scholarships (with filters)
- `GET /api/scholarships/recommended` - Get recommendations
- `POST /api/scholarships/:id/bookmark` - Bookmark scholarship
- `GET /api/scholarships/user/bookmarks` - Get bookmarks

#### Mentors
- `GET /api/mentors` - Get all mentors
- `GET /api/mentors/:id` - Get mentor profile
- `POST /api/mentors/book` - Create booking
- `GET /api/mentors/bookings/my` - Get user's bookings
- `PATCH /api/mentors/bookings/:id/status` - Update booking
- `POST /api/mentors/bookings/:id/review` - Submit review

#### Forum
- `GET /api/forum/posts` - Get posts (with filters)
- `GET /api/forum/posts/:id` - Get single post
- `POST /api/forum/posts` - Create post
- `POST /api/forum/posts/:id/like` - Like/unlike post
- `POST /api/forum/posts/:id/comments` - Add comment
- `GET /api/forum/categories` - Get categories

#### Tasks
- `GET /api/tasks` - Get user's tasks
- `GET /api/tasks/upcoming` - Get upcoming deadlines
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/milestones` - Get milestones

#### AI Assistant
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/faqs` - Get FAQs

#### Universities
- `GET /api/universities` - Get universities (with filters)
- `GET /api/universities/:id` - Get university details
- `GET /api/universities/meta/countries` - Get countries list

## 🗄️ Database Schema

### Main Tables
- `Users` - User accounts (students, mentors, parents, admins)
- `Lessons` - Video lessons
- `LessonProgress` - User progress tracking
- `Notes` - Lesson notes
- `Quizzes` - Lesson quizzes
- `QuizAttempts` - Quiz submissions
- `Scholarships` - Scholarship listings
- `ScholarshipBookmarks` - User bookmarks
- `Bookings` - Mentor session bookings
- `Reviews` - Mentor reviews
- `Posts` - Forum posts
- `Comments` - Post comments
- `Tasks` - User tasks/todos
- `Notifications` - User notifications
- `Universities` - University database
- `FAQs` - Frequently asked questions
- `Testimonials` - User testimonials
- `ParentConnections` - Parent-student links
- `Messages` - Support messages

## 🔐 Security

- JWT authentication with role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (TODO)
- SQL injection protection via Sequelize ORM

## 🧪 Testing

```bash
# Run tests (TODO)
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Environment Variables
Required environment variables for production:
```env
NODE_ENV=production
PORT=5000
DB_NAME=prism_db
DB_USER=postgres
DB_PASSWORD=<secure-password>
DB_HOST=<database-host>
DB_PORT=5432
JWT_SECRET=<secure-random-string>
OPENAI_API_KEY=<your-api-key>
CLIENT_URL=<frontend-url>
```

### Production Build
```bash
# Install production dependencies only
npm ci --only=production

# Run migrations
npm run migrate

# Start server
npm start
```

### Using PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name prism-api

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🛠️ Development

### Project Structure
```
backend/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Express middleware
├── models/         # Sequelize models
├── routes/         # API routes
├── seeders/        # Database seeders
├── socket/         # Socket.io handlers
├── utils/          # Utility functions
├── uploads/        # File uploads
└── server.js       # Entry point
```

### Adding New Features
1. Create model in `models/`
2. Create routes in `routes/`
3. Add route to `server.js`
4. Update seeders if needed
5. Document in README

### Code Style
- Use ES6+ features
- Follow RESTful conventions
- Use async/await for asynchronous operations
- Validate all inputs
- Handle errors appropriately

## 📝 License

This project is proprietary and confidential.

## 👥 Test Users

After running seeders, these test accounts are available:

| Role    | Email              | Password    |
|---------|-------------------|-------------|
| Admin   | admin@prism.uz    | admin123    |
| Student | student@prism.uz  | student123  |
| Mentor  | mentor@prism.uz   | mentor123   |
| Parent  | parent@prism.uz   | parent123   |