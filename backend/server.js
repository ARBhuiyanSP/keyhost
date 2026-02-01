const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const propertiesRoutes = require('./routes/properties');
const bkashPaymentRoutes = require('./routes/bkash-payment');
const reportRoutes = require('./routes/reports');
const messagesRoutes = require('./routes/messages');

// Import role-based routes
const adminRoutes = require('./routes/admin/admin');
const propertyOwnerRoutes = require('./routes/property-owner/property-owner');
const guestRoutes = require('./routes/guest/guest');
const settingsRoutes = require('./routes/settings');
const rewardsPointsRoutes = require('./routes/rewards-points');

// Import middleware
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: true, // Reflect request origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting (disabled for development)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10000, // limit each IP to 10000 requests per windowMs (greatly increased for development)
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.'
//   },
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// });
// app.use('/api/', limiter);



// Catch unhandled exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Keyhost Homes API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/payments', verifyToken, paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/bkash', bkashPaymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/messages', messagesRoutes);

// Role-based API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/property-owner', propertyOwnerRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/rewards-points', rewardsPointsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Import scheduled tasks
const { cancelExpiredBookings } = require('./utils/bookingCleanup');

// Start scheduled tasks
// Run booking cleanup every minute to check for expired bookings
setInterval(async () => {
  try {
    await cancelExpiredBookings();
  } catch (error) {
    console.error('Scheduled task error:', error);
  }
}, 60 * 1000); // Run every 60 seconds (1 minute)

console.log('Scheduled tasks started: Booking cleanup runs every minute.');

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.details
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry. This record already exists.'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record not found.'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Keyhost Homes API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
// Force restart 2
