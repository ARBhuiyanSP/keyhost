const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

// Generate unique reference numbers
const generateBookingReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `KH${timestamp}${random}`;
};

const generatePaymentReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `PAY${timestamp}${random}`;
};

const generateRefundReference = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `REF${timestamp}${random}`;
};

// Format response
const formatResponse = (success, message, data = null, errors = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (errors !== null) {
    response.errors = errors;
  }

  return response;
};

// Calculate booking total
const calculateBookingTotal = (basePrice, nights, cleaningFee = 0, securityDeposit = 0, extraGuestFee = 0, serviceFee = 0, taxAmount = 0) => {
  // Ensure all values are numbers
  const basePriceNum = parseFloat(basePrice) || 0;
  const nightsNum = parseFloat(nights) || 0;
  const cleaningFeeNum = parseFloat(cleaningFee) || 0;
  const securityDepositNum = parseFloat(securityDeposit) || 0;
  const extraGuestFeeNum = parseFloat(extraGuestFee) || 0;
  const serviceFeeNum = parseFloat(serviceFee) || 0;
  const taxAmountNum = parseFloat(taxAmount) || 0;
  
  const subtotal = (basePriceNum * nightsNum) + cleaningFeeNum + securityDepositNum + extraGuestFeeNum;
  const total = subtotal + serviceFeeNum + taxAmountNum;
  
  // Ensure all values are valid numbers
  const safeSubtotal = isNaN(subtotal) ? 0 : subtotal;
  const safeServiceFee = isNaN(serviceFeeNum) ? 0 : serviceFeeNum;
  const safeTaxAmount = isNaN(taxAmountNum) ? 0 : taxAmountNum;
  const safeTotal = isNaN(total) ? 0 : total;
  
  return {
    subtotal: parseFloat(safeSubtotal.toFixed(2)),
    serviceFee: parseFloat(safeServiceFee.toFixed(2)),
    taxAmount: parseFloat(safeTaxAmount.toFixed(2)),
    total: parseFloat(safeTotal.toFixed(2))
  };
};

/**
 * Calculate refund amount based on KeyHost24 Policy:
 * 1. Free cancellation (100% refund) up to 48 hours before check-in.
 * 2. Within 48 hours: Non-refundable (0% refund).
 * 3. Marked as Non-Refundable: 0% refund.
 */
const calculateRefundAmount = (amountPaid, checkInDate, isNonRefundable = false, cancellationTime = null) => {
  if (isNonRefundable) {
    return {
      originalAmount: parseFloat(amountPaid.toFixed(2)),
      refundAmount: 0,
      refundPercentage: 0,
      isEligible: false,
      reason: 'Non-refundable booking'
    };
  }

  const referenceTime = cancellationTime ? moment(cancellationTime) : moment();
  const checkIn = moment(checkInDate);
  const hoursUntilCheckIn = checkIn.diff(referenceTime, 'hours');

  if (hoursUntilCheckIn >= 48) {
    return {
      originalAmount: parseFloat(amountPaid.toFixed(2)),
      refundAmount: parseFloat(amountPaid.toFixed(2)),
      refundPercentage: 100,
      isEligible: true,
      reason: 'Cancelled more than 48 hours before check-in'
    };
  } else {
    return {
      originalAmount: parseFloat(amountPaid.toFixed(2)),
      refundAmount: 0,
      refundPercentage: 0,
      isEligible: false,
      reason: 'Cancelled within 48 hours of check-in'
    };
  }
};

// Format date for database
const formatDate = (date) => {
  return moment(date).format('YYYY-MM-DD');
};

// Format datetime for database
const formatDateTime = (date) => {
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

// Check if date is in the past
const isPastDate = (date) => {
  if (!date) return true;
  
  // Compare dates at start of day to avoid timezone issues
  return moment(date).startOf('day').isBefore(moment().startOf('day'));
};

// Check if date range is valid
const isValidDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return false;
  
  // Check if dates are valid
  if (!moment(checkIn).isValid() || !moment(checkOut).isValid()) {
    return false;
  }
  
  return moment(checkOut).isAfter(moment(checkIn), 'day');
};

// Generate pagination info
const generatePagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  };
};

// Sanitize filename for upload
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
};

// Generate random string
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  generateBookingReference,
  generatePaymentReference,
  generateRefundReference,
  formatResponse,
  calculateBookingTotal,
  calculateRefundAmount,
  formatDate,
  formatDateTime,
  isPastDate,
  isValidDateRange,
  generatePagination,
  sanitizeFilename,
  generateRandomString
};
