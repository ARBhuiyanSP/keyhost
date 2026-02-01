# Keyhost Homes - Booking System

A complete booking system built with Node.js, Express, React, and MySQL. This system allows users to book accommodations, manage properties, and handle payments.

## 🚀 Features

### Core Features
- **User Management**: Admin, Property Owners, and Guests
- **Property Management**: Rooms, Villas, Apartments, Houses
- **Booking System**: Complete booking flow with availability checking
- **Payment Processing**: Multiple payment methods (bKash, Nagad, Rocket, Cards)
- **Review & Rating System**: Guest reviews and property ratings
- **Food Ordering**: Room service and food delivery
- **Car Booking**: Transportation booking system
- **Messaging System**: Host-guest communication
- **Coupon System**: Discount codes and promotions
- **Refund Management**: Advanced refund system with service charges
- **User Blocking**: Admin can block users and property owners
- **Security**: JWT authentication, rate limiting, audit logging

### Technical Features
- **RESTful API**: Well-structured API endpoints
- **Database**: MySQL with 31 tables and comprehensive relationships
- **Authentication**: JWT tokens with refresh mechanism
- **File Upload**: Image upload for properties and profiles
- **Real-time**: WebSocket support for messaging
- **Responsive**: Mobile-first design
- **SEO**: Optimized for search engines

## 📁 Project Structure

```
keyhost-homes/
├── backend/                 # Express.js API
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication, validation
│   ├── routes/            # API routes
│   ├── utils/             # Helper functions
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── frontend/              # React.js application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # State management
│   │   ├── utils/         # API utilities
│   │   └── App.js         # Main app component
│   └── package.json       # Frontend dependencies
├── database-schema.sql    # Complete database schema
└── README.md             # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Database Setup

1. **Create MySQL Database**:
   ```sql
   CREATE DATABASE keyhost_booking_system;
   ```

2. **Import Database Schema**:
   ```bash
   mysql -u root -p keyhost_booking_system < database-schema.sql
   ```

### 2. Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables** in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=keyhost_booking_system
   DB_PORT=3306
   
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your_refresh_secret_key_here
   JWT_REFRESH_EXPIRES_IN=30d
   
   PORT=5000
   NODE_ENV=development
   
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start the backend server**:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

### 3. Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. **Start the frontend development server**:
   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`

## 🎯 Default Admin Account

After importing the database schema, you can login with:

- **Email**: admin@keyhosthomes.com
- **Password**: admin123

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Forgot password

### Property Endpoints
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (Property owners only)
- `PUT /api/properties/:id` - Update property (Property owners only)
- `DELETE /api/properties/:id` - Delete property (Property owners only)

### Booking Endpoints
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/favorites` - Get user's favorites
- `POST /api/users/favorites/:propertyId` - Add to favorites

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/properties` - Get all properties
- `GET /api/admin/bookings` - Get all bookings
- `PATCH /api/admin/users/:id/block` - Block/unblock user

## 🎨 Frontend Features

### Pages
- **Home**: Search and featured properties
- **Properties**: Property listing with filters
- **Property Detail**: Detailed property view
- **Search Results**: Filtered property results
- **Login/Register**: Authentication pages
- **Dashboard**: User dashboard
- **My Bookings**: User's booking history
- **My Favorites**: Saved properties
- **Profile**: User profile management
- **Admin Dashboard**: Admin management panel

### Components
- **Responsive Design**: Mobile-first approach
- **Search Filters**: Advanced property filtering
- **Date Picker**: Check-in/check-out selection
- **Image Gallery**: Property image carousel
- **Rating System**: Star ratings and reviews
- **Payment Forms**: Secure payment processing
- **Loading States**: Skeleton loaders and spinners

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start    # Start React development server
```

### Database Management
- Use MySQL Workbench or phpMyAdmin for database management
- All tables are properly indexed for performance
- Foreign key constraints ensure data integrity

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment variables
2. Use PM2 or similar process manager
3. Set up reverse proxy with Nginx
4. Configure SSL certificates

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, etc.)
3. Configure environment variables for production API URL

### Database Deployment
1. Use managed MySQL service (AWS RDS, Google Cloud SQL)
2. Set up database backups
3. Configure connection pooling

## 📊 Database Schema

The database includes 31 tables:

### Core Tables
- `users` - User accounts
- `property_owners` - Property owner details
- `properties` - Property listings
- `bookings` - Booking records
- `payments` - Payment transactions
- `reviews` - Property reviews

### Advanced Features
- `refunds` - Refund management with service charges
- `user_blocks` - User blocking system
- `property_owner_blocks` - Property owner blocking
- `coupons` - Discount system
- `messages` - Messaging system
- `audit_logs` - System audit trail
- `user_sessions` - Session management

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API request limiting
- **Input Validation**: Comprehensive validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Cross-origin request handling
- **Helmet.js**: Security headers
- **Audit Logging**: Track all system changes

## 📱 Mobile Support

- **Responsive Design**: Works on all device sizes
- **Touch-Friendly**: Optimized for mobile interactions
- **Progressive Web App**: Can be installed on mobile devices
- **Offline Support**: Basic offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@keyhosthomes.com or create an issue in the repository.

---

**Built with ❤️ for the hospitality industry in Bangladesh**
# keyhost
