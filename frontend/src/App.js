import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useSettingsStore from './store/settingsStore';

// Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileFooter from './components/layout/MobileFooter';
import LoadingSpinner from './components/common/LoadingSpinner';
import SEO from './components/common/SEO';
import GoToTop from './components/common/GoToTop';
import ScrollToTop from './components/common/ScrollToTop';

// Public Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import SearchResults from './pages/SearchResults';
import FlightResultsPage from './pages/FlightResultsPage';
import CarBooking from './pages/CarBooking';
import FlightBooking from './components/booking/FlightBooking';
import BookingSuccess from './components/booking/BookingSuccess';
import TicketIssuePage from './components/booking/TicketIssuePage';
import Help from './pages/Help';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import NotFound from './pages/NotFound';
import ContactHost from './pages/ContactHost';
import Messages from './pages/Messages';
import ConversationDetail from './pages/ConversationDetail';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminAmenities from './pages/admin/AdminAmenities';
import AdminDisplayCategories from './pages/admin/AdminDisplayCategories';
import AdminPropertyTypes from './pages/admin/AdminPropertyTypes';
import AdminBookings from './pages/admin/AdminBookings';
import AdminReviews from './pages/admin/AdminReviews';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAccounting from './pages/admin/AdminAccounting';
import AdminEarnings from './pages/admin/AdminEarnings';
import AdminRewardsPoints from './pages/admin/AdminRewardsPoints';

// Property Owner Pages
import PropertyOwnerDashboard from './pages/property-owner/PropertyOwnerDashboard';
import MyProperties from './pages/property-owner/MyProperties';
import AddProperty from './pages/property-owner/AddProperty';
import EditProperty from './pages/property-owner/EditProperty';
import PropertyOwnerBookings from './pages/property-owner/PropertyOwnerBookings';
import Analytics from './pages/property-owner/Analytics';
import EarningsSummary from './pages/property-owner/EarningsSummary';
import PropertyOwnerEarnings from './pages/property-owner/PropertyOwnerEarnings';
import PropertyOwnerProfile from './pages/property-owner/PropertyOwnerProfile';

// Guest Pages
import GuestDashboard from './pages/guest/GuestDashboard';
import GuestBookings from './pages/guest/GuestBookings';
import GuestFavorites from './pages/guest/GuestFavorites';
import GuestBooking from './pages/guest/GuestBooking';
import GuestBookingDetail from './pages/guest/GuestBookingDetail';
import GuestProfile from './pages/guest/GuestProfile';
import RewardsPoints from './pages/guest/RewardsPoints';
import Payment from './pages/Payment';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { isLoading, user, isAdmin } = useAuthStore();
  const { settings, isMaintenanceMode, loadPublicSettings } = useSettingsStore();

  // Load public settings on app initialization
  useEffect(() => {
    loadPublicSettings();
  }, [loadPublicSettings]);

  // Check for maintenance mode
  if (isMaintenanceMode() && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-500">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Under Maintenance
          </h1>
          <p className="text-gray-600 mb-6">
            We're currently performing scheduled maintenance. We'll be back soon!
          </p>
          <p className="text-sm text-gray-500">
            {settings?.site_name || 'Keyhost Homes'} Team
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-beige-100">
      <SEO />
      <ScrollToTop />
      <Navbar />

      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/properties/:id/contact-host" element={<ContactHost />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/flight/results" element={<FlightResultsPage />} />
          <Route path="/booking" element={<FlightBooking />} />
          <Route path="/booking-success" element={<BookingSuccess />} />
          <Route path="/ticket-issue" element={<TicketIssuePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/car-booking" element={<CarBooking />} />
          <Route path="/payment/:bookingId" element={<Payment />} />

          {/* Messages Routes */}
          <Route path="/messages" element={
            <ProtectedRoute requireAuth>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/messages/:id" element={
            <ProtectedRoute requireAuth>
              <ConversationDetail />
            </ProtectedRoute>
          } />

          <Route path="/help" element={<Help />} />
          <Route path="/admin" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/properties" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminProperties />
            </ProtectedRoute>
          } />
          <Route path="/admin/amenities" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminAmenities />
            </ProtectedRoute>
          } />
          <Route path="/admin/property-types" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminPropertyTypes />
            </ProtectedRoute>
          } />
          <Route path="/admin/display-categories" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminDisplayCategories />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/reviews" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminReviews />
            </ProtectedRoute>
          } />
          <Route path="/admin/rewards-points" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminRewardsPoints />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/earnings" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminEarnings />
            </ProtectedRoute>
          } />
          <Route path="/admin/accounting" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminAccounting />
            </ProtectedRoute>
          } />

          {/* Property Owner Routes */}
          <Route path="/property-owner" element={
            <ProtectedRoute requireAuth requireRole="property_owner">
              <PropertyOwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/properties" element={
            <ProtectedRoute requireAuth requireRole="property_owner">
              <MyProperties />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/properties/new" element={
            <ProtectedRoute requireAuth requireRole="property_owner">
              <AddProperty />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/properties/:id/edit" element={
            <ProtectedRoute requireAuth requireRole="property_owner">
              <EditProperty />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/bookings" element={
            <ProtectedRoute requireAuth requireRole="property_owner">
              <PropertyOwnerBookings />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/analytics" element={
            <ProtectedRoute requireAuth requireRole="property_owner">
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/earnings" element={
            <ProtectedRoute requireAuth requireRole="property_owner">
              <PropertyOwnerEarnings />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/profile" element={
            <ProtectedRoute requireAuth requireRole="property_owner">
              <PropertyOwnerProfile />
            </ProtectedRoute>
          } />

          {/* Guest Routes */}
          <Route path="/guest" element={
            <ProtectedRoute requireAuth requireRole="guest">
              <GuestDashboard />
            </ProtectedRoute>
          } />
          <Route path="/guest/bookings" element={
            <ProtectedRoute requireAuth requireRole="guest">
              <GuestBookings />
            </ProtectedRoute>
          } />
          <Route path="/guest/favorites" element={
            <ProtectedRoute requireAuth requireRole="guest">
              <GuestFavorites />
            </ProtectedRoute>
          } />
          <Route path="/guest/rewards-points" element={
            <ProtectedRoute requireAuth requireRole="guest">
              <RewardsPoints />
            </ProtectedRoute>
          } />
          <Route path="/guest/booking/new/:propertyId" element={
            <ProtectedRoute requireAuth requireRole="guest">
              <GuestBooking />
            </ProtectedRoute>
          } />
          <Route path="/guest/bookings/:id" element={
            <ProtectedRoute requireAuth requireRole="guest">
              <GuestBookingDetail />
            </ProtectedRoute>
          } />
          <Route path="/guest/profile" element={
            <ProtectedRoute requireAuth requireRole="guest">
              <GuestProfile />
            </ProtectedRoute>
          } />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <MobileFooter />
      <GoToTop />
    </div>
  );
}

export default App;