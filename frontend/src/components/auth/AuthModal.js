import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';
import LoadingSpinner from '../common/LoadingSpinner';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import api from '../../utils/api';

const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
    const [mode, setMode] = useState(defaultMode);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const { login, register: registerUser, isLoading } = useAuthStore();
    const { settings } = useSettingsStore();

    const {
        register: registerField,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm();

    const password = watch('password');

    // Lock body scroll when modal is open, restore on close
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setMode(defaultMode);
            reset();
            setShowPassword(false);
            setShowConfirmPassword(false);
            useAuthStore.getState().initializeAuth();
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, defaultMode, reset]);

    if (!isOpen) return null;

    const handleClose = () => {
        document.body.style.overflow = '';
        onClose();
    };

    const handlePostAuth = (user) => {
        const pendingBooking = localStorage.getItem('pendingBooking');
        const userType = user?.user_type;

        // Dispatch event so any listener can react (optional, Zustand handles re-renders)
        window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));

        if (pendingBooking && (userType === 'guest' || !userType)) {
            try {
                const bookingData = JSON.parse(pendingBooking);
                const params = new URLSearchParams();
                if (bookingData.check_in_date) params.set('check_in_date', bookingData.check_in_date);
                if (bookingData.check_out_date) params.set('check_out_date', bookingData.check_out_date);
                if (bookingData.number_of_guests) params.set('guests', bookingData.number_of_guests.toString());
                const queryString = params.toString();
                const bookingUrl = `/guest/booking/new/${bookingData.property_id}${queryString ? `?${queryString}` : ''}`;
                handleClose();
                setTimeout(() => navigate(bookingUrl), 100);
                return;
            } catch (error) {
                console.error('Error parsing pending booking data:', error);
            }
        }

        // Close modal — Zustand updates isAuthenticated/user, Navbar re-renders automatically
        handleClose();
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            useAuthStore.setState({ isLoading: true });
            const response = await api.post('/auth/google', {
                token: credentialResponse.credential,
            });

            if (response.data.success) {
                const userData = response.data.data.user;
                toast.success(`Welcome ${userData.first_name}!`);
                const tokens = {
                    token: response.data.data.token,
                    refreshToken: response.data.data.refreshToken
                };
                useAuthStore.setState({
                    user: userData,
                    isAuthenticated: true,
                    token: tokens.token,
                    refreshToken: tokens.refreshToken,
                    isLoading: false
                });
                localStorage.setItem('auth-storage', JSON.stringify({
                    state: {
                        user: userData,
                        isAuthenticated: true,
                        token: tokens.token,
                        refreshToken: tokens.refreshToken
                    },
                    version: 0
                }));
                handlePostAuth(userData);
            } else {
                useAuthStore.setState({ isLoading: false });
                toast.error(response.data.message || 'Google Auth failed');
            }
        } catch (error) {
            useAuthStore.setState({ isLoading: false });
            toast.error(error.response?.data?.message || 'Error occurred during Google Auth');
        }
    };

    const onSubmit = async (data) => {
        if (mode === 'login') {
            const result = await login(data);
            if (result.success) {
                toast.success('Login successful!');
                const currentUser = useAuthStore.getState().user || result.data?.data?.user || result.data?.user;
                handlePostAuth(currentUser);
            } else {
                toast.error(result.error);
            }
        } else {
            const result = await registerUser(data);
            if (result.success) {
                toast.success('Registration successful!');
                const currentUser = useAuthStore.getState().user || result.data?.data?.user || result.data?.user;
                handlePostAuth(currentUser);
            } else {
                toast.error(result.error || 'Registration failed. Please try again.');
            }
        }
    };

    const googleClientId = settings?.google_client_id || process.env.REACT_APP_GOOGLE_CLIENT_ID;

    return (
        <div
            className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm"
            style={{ animation: 'authFadeIn 0.2s ease' }}
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                style={{ animation: 'authSlideUp 0.25s ease' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 relative">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <FiX className="w-5 h-5 text-gray-500" />
                    </button>
                    <h2 className="text-base font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
                        {mode === 'login' ? 'Log in' : 'Sign up'}
                    </h2>
                    <div className="w-8" />
                </div>

                <div className="p-6 max-h-[85vh] overflow-y-auto">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">
                            Welcome to {settings?.site_name || 'Keyhost Homes'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {mode === 'login' ? 'Please sign in to continue.' : 'Create your account to continue.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {mode === 'register' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="relative group">
                                        <input
                                            {...registerField('first_name', { required: 'Required' })}
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] text-sm"
                                            placeholder="First Name"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                                            <FiUser className="h-4 w-4 text-gray-400 group-focus-within:text-[#E73367]" />
                                        </div>
                                    </div>
                                    {errors.first_name && <p className="mt-1 text-xs text-red-600">{errors.first_name.message}</p>}
                                </div>
                                <div>
                                    <div className="relative group">
                                        <input
                                            {...registerField('last_name', { required: 'Required' })}
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] text-sm"
                                            placeholder="Last Name"
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                                            <FiUser className="h-4 w-4 text-gray-400 group-focus-within:text-[#E73367]" />
                                        </div>
                                    </div>
                                    {errors.last_name && <p className="mt-1 text-xs text-red-600">{errors.last_name.message}</p>}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="relative group">
                                <input
                                    {...registerField('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] text-sm"
                                    placeholder="Email"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                                    <FiMail className="h-4 w-4 text-gray-400 group-focus-within:text-[#E73367]" />
                                </div>
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                        </div>

                        {mode === 'register' && (
                            <div>
                                <div className="relative group">
                                    <input
                                        {...registerField('phone', { required: 'Phone number is required' })}
                                        type="tel"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] text-sm"
                                        placeholder="Phone Number"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                                        <FiPhone className="h-4 w-4 text-gray-400 group-focus-within:text-[#E73367]" />
                                    </div>
                                </div>
                                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                            </div>
                        )}

                        <div>
                            <div className="relative group">
                                <input
                                    {...registerField('password', {
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                                    })}
                                    type={showPassword ? 'text' : 'password'}
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] text-sm"
                                    placeholder="Password"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                                    <FiLock className="h-4 w-4 text-gray-400 group-focus-within:text-[#E73367]" />
                                </div>
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                        </div>

                        {mode === 'register' && (
                            <div>
                                <div className="relative group">
                                    <input
                                        {...registerField('confirmPassword', {
                                            required: 'Please confirm your password',
                                            validate: (value) => value === password || 'Passwords do not match',
                                        })}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] text-sm"
                                        placeholder="Confirm password"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none group-focus-within:text-[#E73367]">
                                        <FiLock className="h-4 w-4 text-gray-400 group-focus-within:text-[#E73367]" />
                                    </div>
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
                            </div>
                        )}

                        {mode === 'register' && (
                            <div>
                                <select
                                    {...registerField('user_type', { required: 'Please select an account type' })}
                                    className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#E73367] focus:border-[#E73367] text-sm cursor-pointer"
                                >
                                    <option value="">Select account type</option>
                                    <option value="guest">Guest (Book properties)</option>
                                    <option value="property_owner">Property Owner (List properties)</option>
                                </select>
                                {errors.user_type && <p className="mt-1 text-xs text-red-600">{errors.user_type.message}</p>}
                            </div>
                        )}

                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => { handleClose(); navigate('/forgot-password'); }}
                                    className="text-sm font-medium text-[#E73367] hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-[#E73367] hover:bg-[#d42c5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E73367] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md transform active:scale-95"
                        >
                            {isLoading ? <LoadingSpinner size="small" color="white" /> : (mode === 'login' ? 'Continue' : 'Create Account')}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-center">
                        <div className="border-t border-gray-200 flex-grow"></div>
                        <span className="px-3 text-xs text-gray-500 uppercase tracking-wide">Or</span>
                        <div className="border-t border-gray-200 flex-grow"></div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        {googleClientId && (
                            <GoogleOAuthProvider clientId={googleClientId}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error('Google Auth Failed')}
                                    useOneTap
                                    width="100%"
                                />
                            </GoogleOAuthProvider>
                        )}
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        {mode === 'login' ? (
                            <p>
                                Don't have an account?{' '}
                                <button onClick={() => setMode('register')} className="font-semibold text-[#E73367] hover:underline">Sign up</button>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{' '}
                                <button onClick={() => setMode('login')} className="font-semibold text-[#E73367] hover:underline">Log in</button>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes authFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes authSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default AuthModal;
