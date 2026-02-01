import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiUser, FiMail, FiPhone, FiLock, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, isLoading } = useAuthStore();
  const { settings } = useSettingsStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const fromLocation = location.state?.from;

  const buildRedirectPath = (user) => {
    if (fromLocation) {
      const pathname = typeof fromLocation === 'string'
        ? fromLocation
        : `${fromLocation.pathname}${fromLocation.search || ''}${fromLocation.hash || ''}`;

      if (pathname.startsWith('/admin') && user?.user_type !== 'admin') {
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

  const onSubmit = async (data) => {
    const result = await registerUser(data);

    if (result.success) {
      const user = result.data?.data?.user || result.data?.user;
      toast.success('Registration successful!');

      // Also check from authStore directly (similar to Login.js)
      const authStoreUser = useAuthStore.getState().user;
      console.log('User from register result:', user);
      console.log('User from authStore:', authStoreUser);

      // Wait a bit for authStore to update
      await new Promise(resolve => setTimeout(resolve, 100));
      const updatedAuthStoreUser = useAuthStore.getState().user;
      console.log('Updated user from authStore after delay:', updatedAuthStoreUser);

      const currentUser = updatedAuthStoreUser || authStoreUser || user;
      const userType = currentUser?.user_type;

      console.log('Final user type check:', userType);

      // Check if there's a pending booking in localStorage
      const pendingBooking = localStorage.getItem('pendingBooking');
      console.log('Checking for pending booking after signup:', pendingBooking ? 'Found' : 'Not found');

      // If user_type is undefined, assume guest (default) and proceed with booking redirect
      if (pendingBooking && (userType === 'guest' || !userType)) {
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
        console.log('⚠️ No pending booking or user is not guest. User type:', userType);
      }

      const redirectPath = buildRedirectPath(currentUser || user);
      navigate(redirectPath, { replace: true });
    } else {
      toast.error(result.error || 'Registration failed. Please try again.');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('first_name', { required: 'First name is required' })}
                    type="text"
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="First name"
                  />
                  <FiUser className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('last_name', { required: 'Last name is required' })}
                    type="text"
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                    placeholder="Last name"
                  />
                  <FiUser className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
                <FiMail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Invalid phone number',
                    },
                  })}
                  type="tel"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Phone number"
                />
                <FiPhone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
                <FiLock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                />
                <FiLock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="user_type" className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                {...register('user_type', { required: 'Please select an account type' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select account type</option>
                <option value="guest">Guest (Book properties)</option>
                <option value="property_owner">Property Owner (List properties)</option>
              </select>
              {errors.user_type && (
                <p className="mt-1 text-sm text-red-600">{errors.user_type.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E73367] hover:bg-[#d42c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E73367]"
            >
              Create Account
            </button>
          </div>

          <div className="text-sm text-center">
            <p className="text-gray-600">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;