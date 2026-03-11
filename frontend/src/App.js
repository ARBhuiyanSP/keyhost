import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useSettingsStore from './store/settingsStore';

// Always-loaded core (tiny, needed immediately)
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layouts — lazy loaded (each contains Navbar/Sidebar which are heavy)
const PublicLayout = lazy(() => import('./components/layout/PublicLayout'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));

// Public Pages
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const FlightResultsPage = lazy(() => import('./pages/FlightResultsPage'));
const CarBooking = lazy(() => import('./pages/CarBooking'));
const FlightBooking = lazy(() => import('./components/booking/FlightBooking'));
const BookingSuccess = lazy(() => import('./components/booking/BookingSuccess'));
const TicketIssuePage = lazy(() => import('./components/booking/TicketIssuePage'));
const Help = lazy(() => import('./pages/Help'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ContactHost = lazy(() => import('./pages/ContactHost'));
const Messages = lazy(() => import('./pages/Messages'));
const ConversationDetail = lazy(() => import('./pages/ConversationDetail'));

const BecomeHost = lazy(() => import('./pages/auth/BecomeHost'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminAmenities = lazy(() => import('./pages/admin/AdminAmenities'));
const AdminDisplayCategories = lazy(() => import('./pages/admin/AdminDisplayCategories'));
const AdminPropertyTypes = lazy(() => import('./pages/admin/AdminPropertyTypes'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAccounting = lazy(() => import('./pages/admin/AdminAccounting'));
const AdminEarnings = lazy(() => import('./pages/admin/AdminEarnings'));
const AdminRewardsPoints = lazy(() => import('./pages/admin/AdminRewardsPoints'));

// Property Owner Pages
const PropertyOwnerDashboard = lazy(() => import('./pages/property-owner/PropertyOwnerDashboard'));
const MyProperties = lazy(() => import('./pages/property-owner/MyProperties'));
const AddProperty = lazy(() => import('./pages/property-owner/AddProperty'));
const EditProperty = lazy(() => import('./pages/property-owner/EditProperty'));
const PropertyOwnerBookings = lazy(() => import('./pages/property-owner/PropertyOwnerBookings'));
const Analytics = lazy(() => import('./pages/property-owner/Analytics'));
const EarningsSummary = lazy(() => import('./pages/property-owner/EarningsSummary'));
const PropertyOwnerEarnings = lazy(() => import('./pages/property-owner/PropertyOwnerEarnings'));
const PropertyOwnerProfile = lazy(() => import('./pages/property-owner/PropertyOwnerProfile'));
const PropertyOwnerCalendar = lazy(() => import('./pages/property-owner/PropertyOwnerCalendar'));

// Guest Pages
const GuestDashboard = lazy(() => import('./pages/guest/GuestDashboard'));
const GuestBookings = lazy(() => import('./pages/guest/GuestBookings'));
const GuestFavorites = lazy(() => import('./pages/guest/GuestFavorites'));
const GuestBooking = lazy(() => import('./pages/guest/GuestBooking'));
const GuestBookingDetail = lazy(() => import('./pages/guest/GuestBookingDetail'));
const GuestProfile = lazy(() => import('./pages/guest/GuestProfile'));
const RewardsPoints = lazy(() => import('./pages/guest/RewardsPoints'));
const Payment = lazy(() => import('./pages/Payment'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));

// Protected Route Component


function App() {
  const { user, isAdmin } = useAuthStore();
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

  // NOTE: Do NOT block the entire app on isLoading — that unmounts the whole
  // React tree during login and causes a full re-render (looks like page refresh).
  // Auth loading is handled locally inside AuthModal and individual components.

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Layout Routes */}
        <Route element={<PublicLayout />}>
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
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/car-booking" element={<CarBooking />} />
          <Route path="/payment/:bookingId" element={<Payment />} />
          <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />

          <Route path="/become-host" element={
            <ProtectedRoute requireAuth>
              <BecomeHost />
            </ProtectedRoute>
          } />


        </Route>

        {/* Dashboard Layout Routes */}
        <Route element={<DashboardLayout />}>
          {/* Admin Routes */}
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

          {/* Messages Routes — inside DashboardLayout for sidebar */}
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/messages/:id" element={
            <ProtectedRoute>
              <ConversationDetail />
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
          <Route path="/property-owner/calendar" element={
            <ProtectedRoute requireAuth requireRole="property_owner">
              <PropertyOwnerCalendar />
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
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <GuestDashboard />
            </ProtectedRoute>
          } />
          <Route path="/guest/bookings" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <GuestBookings />
            </ProtectedRoute>
          } />
          <Route path="/guest/favorites" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <GuestFavorites />
            </ProtectedRoute>
          } />
          <Route path="/guest/rewards-points" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <RewardsPoints />
            </ProtectedRoute>
          } />
          <Route path="/guest/booking/new/:propertyId" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <GuestBooking />
            </ProtectedRoute>
          } />
          <Route path="/guest/bookings/:id" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <GuestBookingDetail />
            </ProtectedRoute>
          } />
          <Route path="/guest/profile" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <GuestProfile />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;