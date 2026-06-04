import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';
import useSettingsStore from './store/settingsStore';

// Always-loaded core (tiny, needed immediately)
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SupportWidget from './components/common/SupportWidget';

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
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const Cookies = lazy(() => import('./pages/Cookies'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ContactHost = lazy(() => import('./pages/ContactHost'));
const Messages = lazy(() => import('./pages/Messages'));
const ConversationDetail = lazy(() => import('./pages/ConversationDetail'));
const SupportTickets = lazy(() => import('./pages/support/SupportTickets'));
const TicketChat = lazy(() => import('./pages/support/TicketChat'));

const BecomeHost = lazy(() => import('./pages/auth/BecomeHost'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminContactMessages = lazy(() => import('./pages/admin/AdminContactMessages'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminAmenities = lazy(() => import('./pages/admin/AdminAmenities'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminDisplayCategories = lazy(() => import('./pages/admin/AdminDisplayCategories'));
const AdminPropertyTypes = lazy(() => import('./pages/admin/AdminPropertyTypes'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAccounting = lazy(() => import('./pages/admin/AdminAccounting'));
const AdminEarnings = lazy(() => import('./pages/admin/AdminEarnings'));
const AdminRewardsPoints = lazy(() => import('./pages/admin/AdminRewardsPoints'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminRefunds = lazy(() => import('./pages/admin/AdminRefunds'));
const AdminHMSSettings = lazy(() => import('./pages/admin/AdminHMSSettings'));

// Shared Reports Pages
const BookingReports = lazy(() => import('./pages/shared/reports/BookingReports'));
const FinancialReports = lazy(() => import('./pages/shared/reports/FinancialReports'));
const PropertyPerformance = lazy(() => import('./pages/shared/reports/PropertyPerformance'));
const CancellationReports = lazy(() => import('./pages/shared/reports/CancellationReports'));
const PayoutReports = lazy(() => import('./pages/shared/reports/PayoutReports'));

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
const PropertyOwnerReports = lazy(() => import('./pages/property-owner/PropertyOwnerReports'));
const HMSPricing = lazy(() => import('./pages/property-owner/HMSPricing'));
const HMSRooms = lazy(() => import('./pages/property-owner/HMSRooms'));
const HMSStaff = lazy(() => import('./pages/property-owner/HMSStaff'));
const HMSBilling = lazy(() => import('./pages/property-owner/HMSBilling'));
const HMSReservations = lazy(() => import('./pages/property-owner/HMSReservations'));
const HMSEmployees = lazy(() => import('./pages/property-owner/hms/hr/Employees'));
const HMSDepartments = lazy(() => import('./pages/property-owner/hms/hr/Departments'));
const HMSDesignations = lazy(() => import('./pages/property-owner/hms/hr/Designations'));
const HMSShifts = lazy(() => import('./pages/property-owner/hms/hr/Shifts'));
const HMSPayroll = lazy(() => import('./pages/property-owner/hms/hr/Payroll'));
const HMSAllowances = lazy(() => import('./pages/property-owner/hms/hr/Allowances'));
const HMSDeductions = lazy(() => import('./pages/property-owner/hms/hr/Deductions'));
const HMSRoster = lazy(() => import('./pages/property-owner/hms/hr/Roster'));
const HMSAttendance = lazy(() => import('./pages/property-owner/hms/hr/Attendance'));
const HMSAccountsDashboard = lazy(() => import('./pages/property-owner/hms/accounts/AccountsDashboard'));
const HMSVouchers = lazy(() => import('./pages/property-owner/hms/accounts/Vouchers'));
const HMSTransactions = lazy(() => import('./pages/property-owner/hms/accounts/Transactions'));
const HMSPublicPayment = lazy(() => import('./pages/HMSPublicPayment'));
const HMSInvoice = lazy(() => import('./pages/HMSInvoice'));
const HMSHousekeeping = lazy(() => import('./pages/property-owner/HMSHousekeeping'));
const HMSFoodBeverage = lazy(() => import('./pages/property-owner/HMSFoodBeverage'));

// Staff Pages
const StaffAttendance = lazy(() => import('./pages/staff/StaffAttendance'));

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
const GuestRefunds = lazy(() => import('./pages/guest/GuestRefunds'));
const GuestReports = lazy(() => import('./pages/guest/GuestReports'));

// Protected Route Component


function App() {
  const { user, isAdmin } = useAuthStore();
  const { settings, isMaintenanceMode, loadPublicSettings } = useSettingsStore();

  // Load public settings and authenticate on app initialization
  useEffect(() => {
    loadPublicSettings();
    if (useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().fetchProfile();
    }
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
          <Route path="/property/:slug" element={<PropertyDetail />} />
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
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/car-booking" element={<CarBooking />} />
          <Route path="/payment/:bookingId" element={<Payment />} />
          <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Help />} />
          <Route path="/faqs" element={<Help />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/hms/pay/:token" element={<HMSPublicPayment />} />
          <Route path="/hms/invoice/:id" element={<HMSInvoice />} />
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
          <Route path="/admin/contact-messages" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminContactMessages />
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
          <Route path="/admin/coupons" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminCoupons />
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
          <Route path="/admin/hms-settings" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminHMSSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/refunds" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminRefunds />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/bookings" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <BookingReports userRole="admin" />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/financials" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <FinancialReports userRole="admin" />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/performance" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <PropertyPerformance userRole="admin" />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/payouts" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <PayoutReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/cancellations" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <CancellationReports userRole="admin" />
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
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <PropertyOwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/properties" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <MyProperties />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/properties/new" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <AddProperty />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/properties/:id/edit" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <EditProperty />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/bookings" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <PropertyOwnerBookings />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/calendar" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <PropertyOwnerCalendar />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/analytics" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/earnings" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <PropertyOwnerEarnings />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/profile" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <PropertyOwnerProfile />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/reports" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <PropertyOwnerReports />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/pricing" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSPricing />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/rooms" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSRooms />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/staff" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSStaff />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/employees" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSEmployees />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/departments" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSDepartments />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/designations" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSDesignations />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/shifts" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSShifts />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/payroll" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSPayroll />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/allowances" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSAllowances />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/deductions" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSDeductions />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/roster" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSRoster />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/attendance" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSAttendance />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/accounts" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSAccountsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/accounts/vouchers" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSVouchers />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/accounts/transactions" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSTransactions />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/billing" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSBilling />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/reservations" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSReservations />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/housekeeping" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSHousekeeping />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/food-beverage" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <HMSFoodBeverage />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/reports/bookings" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <BookingReports userRole="property_owner" />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/reports/financials" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <FinancialReports userRole="property_owner" />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/reports/performance" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <PropertyPerformance userRole="property_owner" />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/reports/cancellations" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <CancellationReports userRole="property_owner" />
            </ProtectedRoute>
          } />

          <Route path="/staff/attendance" element={
            <ProtectedRoute requireAuth requireRole="staff">
              <StaffAttendance />
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
          <Route path="/guest/refunds" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <GuestRefunds />
            </ProtectedRoute>
          } />
          <Route path="/guest/profile" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <GuestProfile />
            </ProtectedRoute>
          } />
          <Route path="/guest/reports" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <GuestReports />
            </ProtectedRoute>
          } />

          {/* Support Routes */}
          <Route path="/support" element={
            <ProtectedRoute>
              <SupportTickets />
            </ProtectedRoute>
          } />
          <Route path="/support/ticket/:id" element={
            <ProtectedRoute>
              <TicketChat />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
      <SupportWidget />
    </Suspense>
  );
}

export default App;