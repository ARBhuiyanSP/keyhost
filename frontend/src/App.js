import React, { useEffect, Suspense, lazy, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useFbPixel } from './hooks/useFbPixel';
import useAuthStore from './store/authStore';
import useSettingsStore from './store/settingsStore';
import useConnectionStore from './store/connectionStore';
import ConnectionErrorScreen from './components/common/ConnectionErrorScreen';

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
const BookingNegotiation = lazy(() => import('./pages/property-owner/BookingNegotiation'));
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
const AdminSecurityDeposits = lazy(() => import('./pages/admin/AdminSecurityDeposits'));
const AdminHMSSettings = lazy(() => import('./pages/admin/AdminHMSSettings'));
const AdminRolePermissions = lazy(() => import('./pages/admin/AdminRolePermissions'));
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'));
const AdminHMSSubscriptions = lazy(() => import('./pages/admin/AdminHMSSubscriptions'));
const AdminCorporateExpenses = lazy(() => import('./pages/admin/AdminCorporateExpenses'));
const AdminCorporateHR = lazy(() => import('./pages/admin/AdminCorporateHR'));
const AdminProfitLossReport = lazy(() => import('./pages/admin/AdminProfitLossReport'));
const AdminRevenueReport = lazy(() => import('./pages/admin/AdminRevenueReport'));

// Shared Reports Pages
const BookingReports = lazy(() => import('./pages/shared/reports/BookingReports'));
const FinancialReports = lazy(() => import('./pages/shared/reports/FinancialReports'));
const PropertyPerformance = lazy(() => import('./pages/shared/reports/PropertyPerformance'));
const CancellationReports = lazy(() => import('./pages/shared/reports/CancellationReports'));
const PayoutReports = lazy(() => import('./pages/shared/reports/PayoutReports'));
const UserReports = lazy(() => import('./pages/admin/UserReports'));
const UserAnalyticsReport = lazy(() => import('./pages/admin/UserAnalyticsReport'));
const PropertyAnalyticsReport = lazy(() => import('./pages/admin/PropertyAnalyticsReport'));
const AdminOverviewReport = lazy(() => import('./pages/admin/AdminOverviewReport'));
const AdminHostPerformanceReport = lazy(() => import('./pages/admin/AdminHostPerformanceReport'));

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
const HMSCalendar = lazy(() => import('./pages/property-owner/HMSCalendar'));
const HMSMaintenance = lazy(() => import('./pages/property-owner/HMSMaintenance'));
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
const HMSReceipt = lazy(() => import('./pages/HMSReceipt'));
const HMSHousekeeping = lazy(() => import('./pages/property-owner/HMSHousekeeping'));
const HMSFoodBeverage = lazy(() => import('./pages/property-owner/HMSFoodBeverage'));
const HMSReservationDetail = lazy(() => import('./pages/property-owner/HMSReservationDetail'));
const HMSRoomRevenueReport = lazy(() => import('./pages/property-owner/hms/reports/HMSRoomRevenueReport'));
const HMSFinancialReports = lazy(() => import('./pages/property-owner/hms/reports/HMSFinancialReports'));
const HMSGuests = lazy(() => import('./pages/property-owner/HMSGuests'));
const HMSGuestAnalytics = lazy(() => import('./pages/property-owner/HMSGuestAnalytics'));


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
  const { user, isAdmin, isAuthenticated } = useAuthStore();
  const { settings, isMaintenanceMode, loadPublicSettings } = useSettingsStore();
  const { isServerUnreachable } = useConnectionStore();

  const { trackPageView } = useFbPixel();
  const location = useLocation();

  // Track PageView on route changes
  useEffect(() => {
    trackPageView();
  }, [location.pathname, trackPageView]);

  // Push notification reminder banner state
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [pushBannerLoading, setPushBannerLoading] = useState(false);
  const [pushBannerSuccess, setPushBannerSuccess] = useState(false);

  // Enable push directly from the banner (no page navigation)
  const handleBannerEnable = async () => {
    setPushBannerLoading(true);
    try {
      const { subscribeToPush } = await import('./utils/pushSubscription');
      const ok = await subscribeToPush();
      if (ok) {
        setPushBannerSuccess(true);
        // Show success briefly then dismiss
        setTimeout(() => setShowPushBanner(false), 2000);
      } else {
        // User denied or error — just dismiss the banner
        setShowPushBanner(false);
      }
    } catch {
      setShowPushBanner(false);
    } finally {
      setPushBannerLoading(false);
    }
  };

  // Load public settings and authenticate on app initialization
  useEffect(() => {
    loadPublicSettings();
    if (useAuthStore.getState().isAuthenticated) {
      useAuthStore.getState().fetchProfile();
    }

    // Automated client-side version check to clear cache and force updates
    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();
        
        const localVersion = localStorage.getItem('app_version');
        if (localVersion && localVersion !== data.version) {
          console.log(`New version detected: ${data.version}. Clearing cache and reloading...`);
          localStorage.setItem('app_version', data.version);
          
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }
          
          window.location.reload(true);
        } else if (!localVersion) {
          localStorage.setItem('app_version', data.version);
        }
      } catch (err) {
        console.error('Error checking app version:', err);
      }
    };

    checkVersion();
  }, [loadPublicSettings]);

  // Global PWA Push Notification initialization for logged-in users (all panels/dashboards)
  useEffect(() => {
    if (isAuthenticated) {
      const initPush = async () => {
        try {
          const { registerServiceWorker, isPushSupported, isSubscribed, subscribeToPush, getNotificationPermission, hasOptedOut } = await import('./utils/pushSubscription');
          await registerServiceWorker();

          if (isPushSupported()) {
            const permission = getNotificationPermission();
            const optedOut = hasOptedOut(); // User intentionally turned off notifications

            if (permission === 'granted') {
              // Already permitted — only sync if user hasn't intentionally opted out
              if (!isSubscribed() && !optedOut) {
                console.log('[Push] Syncing active subscription with server...');
                await subscribeToPush();
              } else if (optedOut) {
                // User has opted out — show reminder banner once per session
                const bannerShown = sessionStorage.getItem('push_banner_shown');
                if (!bannerShown) {
                  setTimeout(() => {
                    setShowPushBanner(true);
                    sessionStorage.setItem('push_banner_shown', 'true');
                    // Auto-dismiss after 10 seconds
                    setTimeout(() => setShowPushBanner(false), 10000);
                  }, 2000);
                }
              }
            } else if (permission === 'default' && !optedOut) {
              // Never asked yet & user hasn't opted out — wait 3 seconds then show browser native prompt
              setTimeout(async () => {
                console.log('[Push] Auto-prompting user for notification permission...');
                await subscribeToPush(); // This internally calls Notification.requestPermission()
              }, 3000);
            } else if (optedOut) {
              // Permission default but opted out — show reminder banner once per session
              const bannerShown = sessionStorage.getItem('push_banner_shown');
              if (!bannerShown) {
                setTimeout(() => {
                  setShowPushBanner(true);
                  sessionStorage.setItem('push_banner_shown', 'true');
                  setTimeout(() => setShowPushBanner(false), 10000);
                }, 2000);
              }
            }
            // If 'denied' or opted out — do nothing. User can enable via Profile > Preferences.
          }
        } catch (err) {
          console.error('[Push] Initialization failed:', err);
        }
      };
      initPush();
    } else {
      // On logout, reset banner for next login
      setShowPushBanner(false);
      sessionStorage.removeItem('push_banner_shown');
    }
  }, [isAuthenticated]);

  // Listen for push notifications in the foreground and play synthesized sound
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleServiceWorkerMessage = (event) => {
        if (event.data && event.data.type === 'PUSH_RECEIVED') {
          console.log('[Push] Received in foreground, playing synthesized chime sound');
          
          try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
              const audioCtx = new AudioContextClass();
              
              // Helper to play a clean chime tone (bell envelope)
              const playTone = (frequency, startOffset, duration) => {
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(frequency, audioCtx.currentTime + startOffset);
                
                // Gain envelope (bell curve: instant attack, decay to zero)
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startOffset);
                gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + startOffset + 0.04);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startOffset + duration);
                
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                osc.start(audioCtx.currentTime + startOffset);
                osc.stop(audioCtx.currentTime + startOffset + duration);
              };

              // Play a beautiful, premium double chime sound
              playTone(587.33, 0, 0.35);    // D5 note
              playTone(880.00, 0.1, 0.45);   // A5 note (harmonic fifth)
            }
          } catch (soundErr) {
            console.warn('[Push] Audio playback failed (user interaction required or API blocked):', soundErr);
          }
        }
      };

      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, []);

  if (isServerUnreachable) {
    return <ConnectionErrorScreen />;
  }

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
      {/* Push Notification Reminder Banner */}
      {showPushBanner && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: pushBannerSuccess
              ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              : 'linear-gradient(135deg, #004e59 0%, #00626f 100%)',
            color: 'white',
            padding: '14px 18px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,78,89,0.35)',
            maxWidth: '420px',
            width: 'calc(100vw - 32px)',
            animation: 'slideUpFade 0.4s ease',
            transition: 'background 0.4s ease',
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: '22px', flexShrink: 0 }}>
            {pushBannerSuccess ? '✅' : '🔔'}
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {pushBannerSuccess ? (
              <p style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>Notifications enabled! 🎉</p>
            ) : (
              <>
                <p style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>Push Notifications are off</p>
                <p style={{ fontSize: '11px', opacity: 0.8, margin: '2px 0 0', lineHeight: 1.4 }}>
                  Enable to get instant booking &amp; message alerts.
                </p>
              </>
            )}
          </div>

          {/* Enable button — inline action, no page navigation */}
          {!pushBannerSuccess && (
            <button
              onClick={handleBannerEnable}
              disabled={pushBannerLoading}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: pushBannerLoading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: pushBannerLoading ? 0.7 : 1,
              }}
            >
              {pushBannerLoading ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Enabling...
                </>
              ) : 'Enable'}
            </button>
          )}

          {/* Dismiss button */}
          {!pushBannerSuccess && (
            <button
              onClick={() => setShowPushBanner(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: '0 2px',
                flexShrink: 0,
              }}
              aria-label="Dismiss"
            >
              ×
            </button>
          )}
        </div>
      )}

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
          <Route path="/hms/receipt/:id" element={<HMSReceipt />} />
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
          <Route path="/admin/role-permissions" element={
            <ProtectedRoute requireAuth requireRole="admin" requirePermission="roles.read">
              <AdminRolePermissions />
            </ProtectedRoute>
          } />
          <Route path="/admin/hms-subscriptions" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminHMSSubscriptions />
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
          <Route path="/admin/calendar" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminCalendar />
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
          <Route path="/admin/security-deposits" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminSecurityDeposits />
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
          <Route path="/admin/reports/users" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <UserReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/user-analytics" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <UserAnalyticsReport />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/property-analytics" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <PropertyAnalyticsReport />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/overview" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminOverviewReport />
            </ProtectedRoute>
          } />
          <Route path="/admin/expenses" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminCorporateExpenses />
            </ProtectedRoute>
          } />
          <Route path="/admin/hr" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminCorporateHR />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/profit-loss" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminProfitLossReport />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/host-performance" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminHostPerformanceReport />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports/revenue" element={
            <ProtectedRoute requireAuth requireRole="admin">
              <AdminRevenueReport />
            </ProtectedRoute>
          } />


          {/* Messages Routes — inside DashboardLayout for sidebar */}
          <Route path="/messages" element={
            <ProtectedRoute requirePermission="can_access_messages">
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/messages/:id" element={
            <ProtectedRoute requirePermission="can_access_messages">
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
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="can_list_properties">
              <MyProperties />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/properties/new" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="can_list_properties">
              <AddProperty />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/properties/:id/edit" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="can_list_properties">
              <EditProperty />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/bookings" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="can_use_pms">
              <PropertyOwnerBookings />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/booking-negotiation/:bookingId" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="can_use_pms">
              <BookingNegotiation />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/calendar" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="can_use_calendar">
              <PropertyOwnerCalendar />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/analytics" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="can_view_analytics">
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/earnings" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="can_view_earnings">
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
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_inventory">
              <HMSPricing />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/rooms" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_inventory">
              <HMSRooms />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/staff" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="can_manage_staff">
              <HMSStaff />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/employees" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_hr">
              <HMSEmployees />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/departments" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_hr">
              <HMSDepartments />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/designations" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_hr">
              <HMSDesignations />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/shifts" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_hr">
              <HMSShifts />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/payroll" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_hr">
              <HMSPayroll />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/allowances" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_hr">
              <HMSAllowances />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/deductions" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_hr">
              <HMSDeductions />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/roster" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_hr">
              <HMSRoster />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/hr/attendance" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_hr">
              <HMSAttendance />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/accounts" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_accounts">
              <HMSAccountsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/accounts/vouchers" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_accounts">
              <HMSVouchers />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/accounts/transactions" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_accounts">
              <HMSTransactions />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/billing" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_billing">
              <HMSBilling />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/reservations" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_reservations">
              <HMSReservations />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/guests" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_reservations">
              <HMSGuests />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/analytics/guests" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_reservations">
              <HMSGuestAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/reservations/:id" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_reservations">
              <HMSReservationDetail />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/calendar" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_reservations">
              <HMSCalendar />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/housekeeping" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_housekeeping">
              <HMSHousekeeping />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/food-beverage" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_food_beverage">
              <HMSFoodBeverage />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/maintenance" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="manage_housekeeping">
              <HMSMaintenance />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/reports/room-revenue" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="view_analytics">
              <HMSRoomRevenueReport />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/reports/financials" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']} requirePermission="view_analytics">
              <HMSFinancialReports />
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
          <Route path="/property-owner/reports/user-analytics" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <UserAnalyticsReport userRole="property_owner" />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/reports/user-analytics" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <UserAnalyticsReport userRole="property_owner" />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/reports/property-analytics" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <PropertyAnalyticsReport userRole="property_owner" />
            </ProtectedRoute>
          } />
          <Route path="/property-owner/hms/reports/property-analytics" element={
            <ProtectedRoute requireAuth allowedRoles={['property_owner', 'staff']}>
              <PropertyAnalyticsReport userRole="property_owner" />
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
            <ProtectedRoute allowedRoles={['guest', 'property_owner']} requirePermission="can_view_booking_history">
              <GuestBookings />
            </ProtectedRoute>
          } />
          <Route path="/guest/favorites" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']} requirePermission="can_view_favorites">
              <GuestFavorites />
            </ProtectedRoute>
          } />
          <Route path="/guest/rewards-points" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']} requirePermission="can_use_rewards">
              <RewardsPoints />
            </ProtectedRoute>
          } />
          <Route path="/guest/booking/new/:propertyId" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']} requirePermission="can_make_bookings">
              <GuestBooking />
            </ProtectedRoute>
          } />
          <Route path="/guest/bookings/:id" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']} requirePermission="can_view_booking_history">
              <GuestBookingDetail />
            </ProtectedRoute>
          } />
          <Route path="/guest/booking-negotiation/:bookingId" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']} requirePermission="can_view_booking_history">
              <BookingNegotiation />
            </ProtectedRoute>
          } />
          <Route path="/guest/refunds" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']} requirePermission="can_request_refunds">
              <GuestRefunds />
            </ProtectedRoute>
          } />
          <Route path="/guest/profile" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']}>
              <GuestProfile />
            </ProtectedRoute>
          } />
          <Route path="/guest/reports" element={
            <ProtectedRoute allowedRoles={['guest', 'property_owner']} requirePermission="can_view_booking_history">
              <GuestReports />
            </ProtectedRoute>
          } />

          {/* Support Routes — requirePermission enforces access control even on direct URL navigation */}
          <Route path="/support" element={
            <ProtectedRoute requirePermission="support.read">
              <SupportTickets />
            </ProtectedRoute>
          } />
          <Route path="/support/ticket/:id" element={
            <ProtectedRoute requirePermission="support.read">
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