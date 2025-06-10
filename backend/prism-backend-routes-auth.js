// routes/auth.routes.js
const router = require('express').Router();
const { User, ParentConnection } = require('../models');
const { generateToken } = require('../utils/jwt');
const { validateRegister, validateLogin } = require('../utils/validators');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');
const { Op } = require('sequelize');

// Register
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'student' } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role
    });
    
    // Generate token
    const token = generateToken(user);
    
    // Send verification email (mock)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await sendVerificationEmail(user, verificationToken);
    
    // Return user data without password
    const userData = user.toJSON();
    delete userData.password;
    
    res.status(201).json({
      message: 'Registration successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last active
    await user.update({ lastActive: new Date() });
    
    // Generate token
    const token = generateToken(user);
    
    // Return user data without password
    const userData = user.toJSON();
    delete userData.password;
    
    res.json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: ParentConnection,
          as: 'ParentConnections',
          where: { parentId: req.user.id, isActive: true },
          required: false,
          include: [{
            model: User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }
      ]
    });
    
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// Update password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    // Get user with password
    const user = await User.findByPk(req.user.id);
    
    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    await user.update({ password: newPassword });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }
    
    // Generate reset token (in production, store this with expiry)
    const resetToken = crypto.randomBytes(32).toString('hex');
    await sendPasswordResetEmail(user, resetToken);
    
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // In production, verify token and expiry
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    // Mock implementation - in production, find user by reset token
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    // In production, verify token and mark email as verified
    if (!token) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ message: 'Failed to verify email' });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', auth, async (req, res) => {
  try {
    // Update last active
    await req.user.update({ lastActive: new Date() });
    
    // In production, you might want to blacklist the token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Parent connection
router.post('/parent-connect', auth, async (req, res) => {
  try {
    const { connectionCode } = req.body;
    
    if (req.user.role !== 'parent') {
      return res.status(403).json({ message: 'Only parents can connect to student accounts' });
    }
    
    // Find connection by code
    const connection = await ParentConnection.findOne({
      where: { connectionCode, isActive: true },
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }]
    });
    
    if (!connection) {
      return res.status(404).json({ message: 'Invalid connection code' });
    }
    
    // Update parent ID
    await connection.update({ parentId: req.user.id });
    
    res.json({
      message: 'Successfully connected to student account',
      student: connection.student
    });
  } catch (error) {
    console.error('Parent connect error:', error);
    res.status(500).json({ message: 'Failed to connect accounts' });
  }
});

// Generate parent connection code (for students)
router.post('/generate-parent-code', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can generate parent connection codes' });
    }
    
    // Generate unique code
    const connectionCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Create connection entry
    const connection = await ParentConnection.create({
      studentId: req.user.id,
      parentId: null,
      connectionCode
    });
    
    res.json({
      message: 'Connection code generated',
      code: connectionCode
    });
  } catch (error) {
    console.error('Generate parent code error:', error);
    res.status(500).json({ message: 'Failed to generate code' });
  }
});

module.exports = router;