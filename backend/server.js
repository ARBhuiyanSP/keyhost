// Server entry point - Cache cleared at 2026-05-03 12:59
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const analyticsRoutes = require('./routes/analytics');
const propertiesRoutes = require('./routes/properties');
const bkashPaymentRoutes = require('./routes/bkash-payment');
const nagadPaymentRoutes = require('./routes/nagad-payment');
const reportRoutes = require('./routes/reports');
const messagesRoutes = require('./routes/messages');
const sslCommerzRoutes = require('./routes/sslcommerz');

// Import role-based routes
const adminRoutes = require('./routes/admin/admin');
const adminAccountingRoutes = require('./routes/admin/admin-accounting');
const adminHRRoutes = require('./routes/admin/admin-hr');
const propertyOwnerRoutes = require('./routes/property-owner/property-owner');
const guestRoutes = require('./routes/guest/guest');
const settingsRoutes = require('./routes/settings');
const rewardsPointsRoutes = require('./routes/rewards-points');
const icalRoutes = require('./routes/ical');
const supportRoutes = require('./routes/support');
const contactRoutes = require('./routes/contact');
const hmsHRRoutes = require('./routes/property-owner/hms-hr');
const hmsAccountsRoutes = require('./routes/property-owner/hms-accounts');
const pushRoutes = require('./routes/push');
const metaPixelRoutes = require('./routes/meta-pixel');

// Import middleware
const { verifyToken, requireAdmin, requirePlatformPermission } = require('./middleware/auth');

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
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}));
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



// Static files with aggressive browser caching
// Map both /uploads and /api/uploads to the same path so it works everywhere
const staticOptions = {
  maxAge: '30d',
  immutable: true,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000');
  }
};
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));

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
// Route definitions to support flexible mounting (both /api/x and /x)
const apiRoutes = [
  { path: '/auth', route: authRoutes },
  { path: '/users', route: userRoutes, middleware: verifyToken },
  { path: '/payments', route: paymentRoutes, middleware: verifyToken },
  { path: '/reviews', route: reviewRoutes },
  { path: '/analytics', route: analyticsRoutes },
  { path: '/properties', route: propertiesRoutes },
  { path: '/bkash', route: bkashPaymentRoutes },
  { path: '/nagad', route: nagadPaymentRoutes },
  { path: '/reports', route: reportRoutes },
  { path: '/messages', route: messagesRoutes },
  { path: '/admin/accounting', route: adminAccountingRoutes, middleware: [verifyToken, requireAdmin] },
  { path: '/admin/hr', route: adminHRRoutes, middleware: [verifyToken, requireAdmin] },
  { path: '/admin', route: adminRoutes },
  { path: '/property-owner', route: propertyOwnerRoutes },
  { path: '/guest', route: guestRoutes },
  { path: '/settings', route: settingsRoutes },
  { path: '/rewards-points', route: rewardsPointsRoutes },
  { path: '/sslcommerz', route: sslCommerzRoutes },
  { path: '/ical', route: icalRoutes },
  { path: '/support', route: supportRoutes, middleware: verifyToken },
  { path: '/contact', route: contactRoutes },
  { path: '/hms/hr', route: hmsHRRoutes, middleware: [verifyToken, requirePlatformPermission('can_use_hms')] },
  { path: '/hms/accounts', route: hmsAccountsRoutes, middleware: [verifyToken, requirePlatformPermission('can_use_hms')] },
  { path: '/push', route: pushRoutes },
  { path: '/meta-pixel', route: metaPixelRoutes }
];

// Mount routes
apiRoutes.forEach(({ path, route, middleware }) => {
  const paths = [`/api${path}`, path];
  paths.forEach(p => {
    if (middleware) {
      app.use(p, middleware, route);
    } else {
      app.use(p, route);
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Import scheduled tasks
const { cancelExpiredBookings, cancelUnacceptedBookings } = require('./utils/bookingCleanup');
const cron = require('node-cron');
const { syncAllExternalCalendars } = require('./utils/icalSync');
const { expireHMSSubscriptions, checkMaintenanceAlerts } = require('./utils/hmsCron');

// Start scheduled tasks
// Run booking cleanup every minute to check for expired bookings
setInterval(async () => {
  try {
    await cancelExpiredBookings();
  } catch (error) {
    console.error('Scheduled task error:', error);
  }
}, 60 * 1000); // Run every 60 seconds (1 minute)

// Auto-cancel unaccepted pending bookings every 5 minutes
setInterval(async () => {
  try {
    await cancelUnacceptedBookings();
  } catch (error) {
    console.error('Auto-cancel unaccepted bookings error:', error);
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Run iCal sync every 15 minutes
cron.schedule('*/15 * * * *', () => {
  console.log('Running scheduled iCal sync...');
  syncAllExternalCalendars();
});

// Run HMS checks daily at midnight
cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled HMS expiration checks...');
  expireHMSSubscriptions();
  console.log('Running scheduled HMS maintenance due alerts checks...');
  checkMaintenanceAlerts();
});

console.log('Scheduled tasks started: Booking cleanup runs every minute. iCal sync every 15m. HMS checks daily.');
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

// Start server (triggered restart 2)
app.listen(PORT, () => {
  console.log(`🚀 Keyhost Homes API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

module.exports = app; 