const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Prism API is running!',
    version: '1.0.0',
    endpoints: ['/api/stats/platform']
  });
});

// Stats route (for landing page)
app.get('/api/stats/platform', (req, res) => {
  res.json({
    stats: {
      students: 100,
      lessons: 50,
      scholarships: 25,
      mentors: 10
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});