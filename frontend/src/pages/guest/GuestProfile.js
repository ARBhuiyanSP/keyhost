import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { 
  FiUser, 
  FiMapPin, 
  FiSliders, 
  FiCheckCircle, 
  FiClock, 
  FiShield, 
  FiAlertTriangle, 
  FiPhone, 
  FiMail, 
  FiCalendar 
} from 'react-icons/fi';

const GuestProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isSendingEmailVerify, setIsSendingEmailVerify] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    bio: '',
    email_notifications: false,
    sms_notifications: false
  });

  const scrollbarHideStyle = {
    msOverflowStyle: 'none',  /* IE and Edge */
    scrollbarWidth: 'none',   /* Firefox */
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      const userData = response.data.data?.user;

      setProfile(userData);

      setFormData({
        first_name: userData?.first_name || '',
        last_name: userData?.last_name || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        date_of_birth: userData?.date_of_birth ? userData.date_of_birth.substring(0, 10) : '',
        gender: userData?.gender || '',
        address: userData?.address || '',
        city: userData?.city || '',
        state: userData?.state || '',
        country: userData?.country || '',
        postal_code: userData?.postal_code || '',
        bio: userData?.bio || '',
        email_notifications: !!userData?.email_notifications,
        sms_notifications: !!userData?.sms_notifications
      });
    } catch (err) {
      showError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVerifyEmail = async () => {
    try {
      setIsSendingEmailVerify(true);
      await api.post('/auth/send-verification-email');
      showSuccess('Verification email sent successfully! Please check your inbox.');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send verification email.');
    } finally {
      setIsSendingEmailVerify(false);
    }
  };

  const handleSendPhoneOtp = async () => {
    try {
      setIsSendingOtp(true);
      await api.post('/auth/send-verification-otp');
      showSuccess('Verification code (OTP) sent to your phone number.');
      setPhoneOtp('');
      setIsPhoneModalOpen(true);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    try {
      setIsVerifyingOtp(true);
      const response = await api.post('/auth/verify-phone', { otp: phoneOtp });
      showSuccess('Phone number verified successfully!');
      
      if (response.data.data?.user) {
        useAuthStore.setState({ user: response.data.data.user });
        setProfile(response.data.data.user);
      }
      
      setIsPhoneModalOpen(false);
      fetchProfile();
    } catch (err) {
      showError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updateData = {
        ...formData,
        email_notifications: formData.email_notifications ? 1 : 0,
        sms_notifications: formData.sms_notifications ? 1 : 0
      };

      const response = await api.put('/users/profile', updateData);
      showSuccess('Profile updated successfully');
      
      if (response.data.data?.user) {
        useAuthStore.setState({ user: response.data.data.user });
      }
      
      fetchProfile();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (!profile?.first_name) return 'G';
    const first = profile.first_name.charAt(0).toUpperCase();
    const last = profile.last_name ? profile.last_name.charAt(0).toUpperCase() : '';
    return `${first}${last}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Never';
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateCompletionPercentage = () => {
    if (!formData) return 0;
    const fieldsToTrack = [
      formData.first_name,
      formData.last_name,
      formData.email,
      formData.phone,
      formData.date_of_birth,
      formData.gender,
      formData.bio,
      formData.address,
      formData.city,
      formData.state,
      formData.country,
      formData.postal_code
    ];
    
    const filledFields = fieldsToTrack.filter(field => {
      if (typeof field === 'string') return field.trim() !== '';
      if (typeof field === 'number') return true;
      return field !== null && field !== undefined;
    });
    
    return Math.round((filledFields.length / fieldsToTrack.length) * 100);
  };

  if (loading) return <LoadingSpinner />;

  const isEmailVerified = !!profile?.email_verified_at;
  const isPhoneVerified = !!profile?.phone_verified_at;
  const isFullyVerified = isEmailVerified && isPhoneVerified;
  const isPartiallyVerified = isEmailVerified || isPhoneVerified;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors mb-3 group focus:outline-none"
            >
              <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary-600 to-navy-600 bg-clip-text text-transparent">Guest Profile</span>
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">Configure personal information, contact records, and notification preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Profile Card & Tabs Navigation */}
          <div className="lg:col-span-1 space-y-6">
            {/* Guest Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Card Banner */}
              <div className="h-28 bg-gradient-to-r from-navy-600 to-primary-600 relative">
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                    isFullyVerified
                      ? 'bg-green-500 text-white'
                      : isPartiallyVerified
                        ? 'bg-amber-500 text-white'
                        : 'bg-red-500 text-white'
                  }`}>
                    {isFullyVerified ? (
                      <>
                        <FiCheckCircle className="w-3 h-3" />
                        Verified
                      </>
                    ) : isPartiallyVerified ? (
                      <>
                        <FiClock className="w-3 h-3" />
                        Partially Verified
                      </>
                    ) : (
                      <>
                        <FiAlertTriangle className="w-3 h-3" />
                        Unverified
                      </>
                    )}
                  </span>
                </div>
              </div>
              
              {/* Card Profile Area */}
              <div className="px-6 pb-6 pt-0 relative flex flex-col items-center">
                {/* Avatar Initial Circle */}
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gradient-to-tr from-primary-500 to-navy-500 text-white flex items-center justify-center font-black text-2xl shadow-md -mt-12 mb-4 select-none">
                  {getInitials()}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 justify-center">
                  <FiMail className="w-3.5 h-3.5 text-gray-400" />
                  {profile?.email}
                </p>
                {profile?.phone && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 justify-center">
                    <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                    {profile.phone}
                  </p>
                )}

                {/* Profile Completion Bar */}
                <div className="w-full mt-5 bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Profile Completion</span>
                    <span className="text-xs font-bold text-primary-600">{calculateCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-navy-500 transition-all duration-500 ease-out rounded-full" 
                      style={{ width: `${calculateCompletionPercentage()}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-2 font-medium">
                    {calculateCompletionPercentage() === 100 
                      ? "🎉 Awesome! Your profile is 100% complete." 
                      : "Complete all sections to reach 100%."}
                  </p>
                </div>

                <div className="w-full border-t border-gray-100 my-5"></div>

                <div className="w-full space-y-3 text-xs text-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Account Type</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1 capitalize">
                      <FiShield className="text-primary-500 w-3.5 h-3.5" />
                      {profile?.user_type || 'Guest'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Member Since</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <FiCalendar className="text-gray-400 w-3.5 h-3.5" />
                      {formatDate(profile?.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Last Login</span>
                    <span className="font-semibold text-gray-900">
                      {formatTime(profile?.last_login_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Scrollable on Mobile, Stacked on Desktop) */}
            <div 
              style={scrollbarHideStyle}
              className="bg-white rounded-2xl border border-gray-100 p-3 lg:p-4 shadow-sm flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar"
            >
              {[
                { id: 'personal', name: 'Personal Details', icon: FiUser },
                { id: 'address', name: 'Address & Contact', icon: FiMapPin },
                { id: 'preferences', name: 'Preferences', icon: FiSliders },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 lg:gap-3 px-4 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 focus:outline-none ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Tab Content Card */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 flex flex-col min-h-[480px]">
              <div className="flex-1">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6 animate-slide-up">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FiUser className="text-primary-500" />
                        Personal Information
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Manage your basic personal profile details and biography.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          required
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          required
                        />
                      </div>

                      <div className="relative group">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                          {profile?.email_verified_at ? (
                            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                              <FiCheckCircle className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleVerifyEmail}
                              disabled={isSendingEmailVerify}
                              className="text-[10px] text-amber-600 hover:text-amber-700 font-bold underline focus:outline-none disabled:opacity-50"
                            >
                              {isSendingEmailVerify ? 'Sending Link...' : 'Verify Now'}
                            </button>
                          )}
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          required
                        />
                      </div>

                      <div className="relative group">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                          {profile?.phone_verified_at ? (
                            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                              <FiCheckCircle className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            formData.phone ? (
                              <button
                                type="button"
                                onClick={handleSendPhoneOtp}
                                disabled={isSendingOtp}
                                className="text-[10px] text-amber-600 hover:text-amber-700 font-bold underline focus:outline-none disabled:opacity-50"
                              >
                                {isSendingOtp ? 'Sending OTP...' : 'Verify Now'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-400">Enter phone to verify</span>
                            )
                          )}
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. +8801700000000"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={formData.date_of_birth}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50 bg-white"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="md:col-span-2 relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Bio / Description</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="4"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 resize-none hover:bg-gray-100/50"
                          placeholder="Write a brief introduction about yourself..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Information Tab */}
                {activeTab === 'address' && (
                  <div className="space-y-6 animate-slide-up">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FiMapPin className="text-primary-500" />
                        Address & Location
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Specify your current residential address details.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Street Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. House 45, Road 12, Banani"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. Dhaka"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">State / Province</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. Dhaka Division"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. Bangladesh"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Postal Code</label>
                        <input
                          type="text"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. 1213"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6 animate-slide-up">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FiSliders className="text-primary-500" />
                        Notification Preferences
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Configure your default communication preferences.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between p-5 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100/50 transition-all duration-200">
                        <div className="pr-4">
                          <h4 className="text-sm font-bold text-gray-900">Email Notifications</h4>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Receive booking status updates, receipt details, and general account notices via email.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, email_notifications: !prev.email_notifications }))}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            formData.email_notifications ? 'bg-primary-600' : 'bg-gray-300'
                          }`}
                          role="switch"
                          aria-checked={formData.email_notifications}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              formData.email_notifications ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* SMS Notifications */}
                      <div className="flex items-center justify-between p-5 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100/50 transition-all duration-200">
                        <div className="pr-4">
                          <h4 className="text-sm font-bold text-gray-900">SMS Notifications</h4>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            Receive real-time reservation alerts, check-in instructions, and security alerts directly to your mobile phone.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, sms_notifications: !prev.sms_notifications }))}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            formData.sms_notifications ? 'bg-primary-600' : 'bg-gray-300'
                          }`}
                          role="switch"
                          aria-checked={formData.sms_notifications}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              formData.sms_notifications ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button Card Footer */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-navy-600 hover:from-primary-700 hover:to-navy-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[150px] focus:outline-none"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Saving Changes...</span>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Phone OTP Verification Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-sm w-full shadow-xl animate-slide-up space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FiPhone className="text-primary-500 animate-pulse" />
                Verify Phone Number
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                We've sent a 6-digit verification code to <span className="font-semibold text-gray-950">{formData.phone}</span>. Please enter the OTP to verify your account.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Verification OTP Code</label>
              <input
                type="text"
                maxLength="6"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.75em] text-lg font-bold px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200"
                placeholder="000000"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyPhoneOtp}
                disabled={isVerifyingOtp || phoneOtp.length !== 6}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-navy-600 text-white rounded-xl text-xs font-bold hover:from-primary-700 hover:to-navy-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none"
              >
                {isVerifyingOtp ? 'Verifying...' : 'Verify & Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestProfile;
