import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiAlertTriangle, FiLoader, FiArrowRight } from 'react-icons/fi';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please make sure you clicked the complete link in your email.');
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setStatus('verifying');
      const response = await api.post('/auth/verify-email', { token });
      
      // Update global auth store user object with verified state
      if (response.data.data?.user) {
        useAuthStore.setState({ 
          user: response.data.data.user,
          isAuthenticated: true 
        });
      }
      
      setStatus('success');
      setMessage('Your email address has been successfully verified. You can now access all platform features.');
    } catch (err) {
      console.error('Verify email token error:', err);
      setStatus('error');
      setMessage(err.response?.data?.message || 'The verification link is invalid or has expired. Please request a new verification email from your profile.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-[#1A2A44] to-[#121E36] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-white/10 p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-fade-in">
        
        {/* State: Verifying */}
        {status === 'verifying' && (
          <div className="space-y-4 py-6">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-600 animate-spin">
              <FiLoader className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-950">Verifying your email</h2>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              We're validating your security token with our servers. This will only take a moment...
            </p>
          </div>
        )}

        {/* State: Success */}
        {status === 'success' && (
          <div className="space-y-6 py-4">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 animate-bounce-in shadow-inner">
              <FiCheckCircle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-950 tracking-tight">Email Verified!</h2>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={() => navigate('/property-owner/profile')}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-navy-600 hover:from-primary-700 hover:to-navy-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Go to Profile</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* State: Error */}
        {status === 'error' && (
          <div className="space-y-6 py-4">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-inner">
              <FiAlertTriangle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-950 tracking-tight">Verification Failed</h2>
              <p className="text-sm text-gray-550 max-w-sm mx-auto leading-relaxed">
                {message}
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => navigate('/property-owner/profile')}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm shadow-sm transition-all duration-200"
              >
                Go to Profile
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl font-bold text-sm transition-all duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
