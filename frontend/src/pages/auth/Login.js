import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const fromLocation = location.state?.from;

  const buildRedirectPath = (user) => {
    if (fromLocation) {
      const pathname = typeof fromLocation === 'string'
        ? fromLocation
        : `${fromLocation.pathname}${fromLocation.search || ''}${fromLocation.hash || ''}`;

      if (pathname.startsWith('/admin') && user?.user_type !== 'admin') {
        // Prevent non-admins from landing on admin routes
        return '/';
      }

      if (pathname.startsWith('/property-owner') && user?.user_type !== 'property_owner') {
        return user?.user_type === 'admin' ? '/admin' : '/';
      }

      if (pathname.startsWith('/guest') && user?.user_type !== 'guest') {
        return user?.user_type === 'admin'
          ? '/admin'
          : user?.user_type === 'property_owner'
            ? '/property-owner'
            : '/';
      }

      return pathname;
    }

    if (user?.user_type === 'admin') return '/admin';
    if (user?.user_type === 'property_owner') return '/property-owner';
    if (user?.user_type === 'guest') return '/guest';
    return '/';
  };

  useEffect(() => {
    // Initialize auth on component mount
    useAuthStore.getState().initializeAuth();
  }, []);

  const onSubmit = async (data) => {
    const result = await login(data);

    if (result.success) {
      toast.success('Login successful!');

      const user = result.data?.data?.user || result.data?.user;
      console.log('Full login result:', result);
      console.log('User object from login:', user);
      console.log('User type:', user?.user_type);

      // Check if there's a pending booking in localStorage
      const pendingBooking = localStorage.getItem('pendingBooking');
      console.log('Checking for pending booking after login:', pendingBooking ? 'Found' : 'Not found');

      // Also check from authStore directly
      const authStoreUser = useAuthStore.getState().user;
      console.log('User from authStore:', authStoreUser);
      console.log('User type from authStore:', authStoreUser?.user_type);

      // Use authStore user if available, otherwise use result user
      // Wait a bit for authStore to update
      await new Promise(resolve => setTimeout(resolve, 100));
      const updatedAuthStoreUser = useAuthStore.getState().user;
      console.log('Updated user from authStore after delay:', updatedAuthStoreUser);

      const currentUser = updatedAuthStoreUser || authStoreUser || user;
      const userType = currentUser?.user_type;

      console.log('Final user type check:', userType);
      console.log('Current user object:', currentUser);

      // If user_type is still undefined, try to get it from the response structure
      if (!userType) {
        console.log('⚠️ User type is undefined, checking response structure...');
        console.log('Result structure:', JSON.stringify(result, null, 2));
      }

      if (pendingBooking && (userType === 'guest' || !userType)) {
        // If user_type is undefined, assume guest (default) and proceed
        console.log('⚠️ Proceeding with booking redirect (user_type:', userType || 'undefined, assuming guest)');
        try {
          const bookingData = JSON.parse(pendingBooking);
          console.log('✅ Pending booking data:', bookingData);
          console.log('Property ID:', bookingData.property_id);
          console.log('Check-in date:', bookingData.check_in_date);
          console.log('Check-out date:', bookingData.check_out_date);
          console.log('Number of guests:', bookingData.number_of_guests);

          // Keep localStorage data intact - GuestBooking page will read from there
          // Just redirect with URL params for backup
          const params = new URLSearchParams();
          if (bookingData.check_in_date) params.set('check_in_date', bookingData.check_in_date);
          if (bookingData.check_out_date) params.set('check_out_date', bookingData.check_out_date);
          if (bookingData.number_of_guests) params.set('guests', bookingData.number_of_guests.toString());
          const queryString = params.toString();

          const bookingUrl = `/guest/booking/new/${bookingData.property_id}${queryString ? `?${queryString}` : ''}`;
          console.log('🚀 Redirecting to booking page:', bookingUrl);
          console.log('📦 localStorage will be preserved for GuestBooking page to read');
          console.log('localStorage content:', localStorage.getItem('pendingBooking'));

          // Navigate without clearing localStorage - GuestBooking page will handle it
          setTimeout(() => {
            navigate(bookingUrl);
            console.log('✅ Navigation called');
          }, 100);
          return;
        } catch (error) {
          console.error('❌ Error parsing pending booking data:', error);
        }
      } else {
        console.log('⚠️ No pending booking or user is not guest. User type:', user?.user_type);
      }

      const redirectPath = buildRedirectPath(user);
      navigate(redirectPath, { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Decoration Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E73367] to-[#be123c] opacity-90"></div>
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'overlay' }}></div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="mb-8">
            {/* Logo Placeholder */}
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Welcome Back</h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Access your personalized dashboard, manage your bookings, and explore new destinations with ease.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white/80">
              <div className="p-1 bg-white/10 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <div className="p-1 bg-white/10 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#E73367] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ff5c8a] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-[#E73367] hover:text-[#d42c5c] transition-colors"
              >
                Create a new account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#E73367]">
                    <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-[#E73367]" />
                  </div>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] transition duration-150 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                    <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-[#E73367]" />
                  </div>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] transition duration-150 sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#E73367] focus:ring-[#E73367] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer select-none">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-[#E73367] hover:text-[#d42c5c] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#E73367] hover:bg-[#d42c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E73367] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="pt-6 mt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Protected by reCAPTCHA and subject to the Google <a href="#" className="underline hover:text-gray-700">Privacy Policy</a> and <a href="#" className="underline hover:text-gray-700">Terms of Service</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
