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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>

          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
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
                  className="input-field pl-10"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
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
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E73367] hover:bg-[#d42c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E73367] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="small" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
