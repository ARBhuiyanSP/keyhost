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
    <div className="min-h-screen flex bg-white">
      {/* Left Decoration Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 justify-center items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E73367] to-[#be123c] opacity-90"></div>
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'overlay' }}></div>

        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="mb-8">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Join Our Community</h2>
            <p className="text-lg text-white/90 leading-relaxed">
              Create an account to unlock exclusive deals, manage your properties, and experience seamless booking.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-3xl font-bold">10k+</span>
              <span className="text-white/70 text-sm">Active Users</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">5k+</span>
              <span className="text-white/70 text-sm">Properties</span>
            </div>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#E73367] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ff5c8a] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 overflow-y-auto">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link
                to="/login"
                className="font-medium text-[#E73367] hover:text-[#d42c5c] transition-colors"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative group">
                    <input
                      {...register('first_name', { required: 'First name is required' })}
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] transition duration-150 sm:text-sm"
                      placeholder="John"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                      <FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-[#E73367] transition-colors" />
                    </div>
                  </div>
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative group">
                    <input
                      {...register('last_name', { required: 'Last name is required' })}
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] transition duration-150 sm:text-sm"
                      placeholder="Doe"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                      <FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-[#E73367] transition-colors" />
                    </div>
                  </div>
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative group">
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                    <FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-[#E73367] transition-colors" />
                  </div>
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <input
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'Invalid phone number',
                      },
                    })}
                    type="tel"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] transition duration-150 sm:text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                    <FiPhone className="h-5 w-5 text-gray-400 group-focus-within:text-[#E73367] transition-colors" />
                  </div>
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] transition duration-150 sm:text-sm"
                    placeholder="8+ characters"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                    <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-[#E73367] transition-colors" />
                  </div>
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
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] transition duration-150 sm:text-sm"
                    placeholder="Confirm password"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                    <FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-[#E73367] transition-colors" />
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="user_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  {...register('user_type', { required: 'Please select an account type' })}
                  className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm rounded-lg bg-gray-50 hover:bg-white transition-colors cursor-pointer"
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
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#E73367] hover:bg-[#d42c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E73367] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-sm text-center">
              <p className="text-gray-600">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-[#E73367] hover:text-[#d42c5c] font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#E73367] hover:text-[#d42c5c] font-medium">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;