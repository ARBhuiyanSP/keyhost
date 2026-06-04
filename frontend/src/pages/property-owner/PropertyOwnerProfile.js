import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { 
  FiUser, 
  FiMapPin, 
  FiBriefcase, 
  FiCreditCard, 
  FiSliders, 
  FiCheckCircle, 
  FiClock, 
  FiShield, 
  FiAlertTriangle, 
  FiPhone, 
  FiMail, 
  FiCalendar 
} from 'react-icons/fi';

const PropertyOwnerProfile = () => {
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
    } catch (err) {
      showError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };
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
    business_name: '',
    business_license: '',
    tax_id: '',
    bank_account_number: '',
    bank_name: '',
    bank_routing_number: '',
    commission_rate: 0,
    auto_accept_bookings: false
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
      const response = await api.get('/property-owner/profile');
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
        business_name: userData?.property_owner_info?.business_name || '',
        business_license: userData?.property_owner_info?.business_license || '',
        tax_id: userData?.property_owner_info?.tax_id || '',
        bank_account_number: userData?.property_owner_info?.bank_account_number || '',
        bank_name: userData?.property_owner_info?.bank_name || '',
        bank_routing_number: userData?.property_owner_info?.bank_routing_number || '',
        commission_rate: userData?.property_owner_info?.commission_rate || 0,
        auto_accept_bookings: !!userData?.auto_accept_bookings
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await api.put('/property-owner/profile', formData);
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
    if (!profile?.first_name) return 'H';
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
      formData.postal_code,
      formData.business_name,
      formData.business_license,
      formData.tax_id,
      formData.bank_name,
      formData.bank_account_number,
      formData.bank_routing_number
    ];
    
    const filledFields = fieldsToTrack.filter(field => {
      if (typeof field === 'string') return field.trim() !== '';
      if (typeof field === 'number') return true;
      return field !== null && field !== undefined;
    });
    
    return Math.round((filledFields.length / fieldsToTrack.length) * 100);
  };

  if (loading) return <LoadingSpinner />;

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
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary-600 to-navy-600 bg-clip-text text-transparent">Profile & Settings</span>
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">Configure personal information, business records, and default preferences.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Profile Card & Tabs Navigation */}
          <div className="lg:col-span-1 space-y-6">
            {/* Owner Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Card Banner */}
              <div className="h-28 bg-gradient-to-r from-navy-600 to-primary-600 relative">
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                    profile?.property_owner_info?.is_verified
                      ? 'bg-green-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}>
                    {profile?.property_owner_info?.is_verified ? (
                      <>
                        <FiCheckCircle className="w-3 h-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <FiClock className="w-3 h-3" />
                        Pending Verification
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
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <FiShield className="text-primary-500 w-3.5 h-3.5" />
                      Host
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
                { id: 'business', name: 'Business Settings', icon: FiBriefcase },
                { id: 'payout', name: 'Payout & Banking', icon: FiCreditCard },
                { id: 'preferences', name: 'Preferences', icon: FiSliders },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 lg:gap-3 px-4 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
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
                          placeholder="Write a brief introduction..."
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
                      <p className="text-xs text-gray-500 mt-1">Specify your current residential or administrative office address.</p>
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

                {/* Business Settings Tab */}
                {activeTab === 'business' && (
                  <div className="space-y-6 animate-slide-up">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FiBriefcase className="text-primary-500" />
                        Business Settings
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Configure your corporate entity identity and registration details.</p>
                    </div>

                    {!profile?.property_owner_info?.is_verified && (
                      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 text-xs">
                        <FiAlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block mb-1">Account Verification Pending</span>
                          Provide your official business name, license number, and tax ID below. Once verified, you will be authorized to activate PMS billing, housekeeping, and payouts.
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Business Name</label>
                        <input
                          type="text"
                          name="business_name"
                          value={formData.business_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          required
                          placeholder="e.g. Keyhost Properties Ltd."
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Business License</label>
                        <input
                          type="text"
                          name="business_license"
                          value={formData.business_license}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. TRAD/DNCC/12345/2026"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tax ID / TIN</label>
                        <input
                          type="text"
                          name="tax_id"
                          value={formData.tax_id}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. 123456789012"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Commission Rate (%)</label>
                        <input
                          type="number"
                          name="commission_rate"
                          value={formData.commission_rate}
                          disabled
                          readOnly
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-400 mt-1.5">Platform commission rate configured by system administrators.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payout & Banking Tab */}
                {activeTab === 'payout' && (
                  <div className="space-y-6 animate-slide-up">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FiCreditCard className="text-primary-500" />
                        Payout & Banking
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Configure your bank account information to receive property earnings.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="relative group md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Bank Name</label>
                        <input
                          type="text"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. Dutch-Bangla Bank PLC."
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Account Number</label>
                        <input
                          type="text"
                          name="bank_account_number"
                          value={formData.bank_account_number}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. 123.456.7890"
                        />
                      </div>

                      <div className="relative group">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Routing Number</label>
                        <input
                          type="text"
                          name="bank_routing_number"
                          value={formData.bank_routing_number}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none transition-all duration-200 hover:bg-gray-100/50"
                          placeholder="e.g. 090261947"
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
                        Booking Preferences
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Configure default configuration presets and automation switches.</p>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100/50 transition-all duration-200">
                      <div className="pr-4">
                        <h4 className="text-sm font-bold text-gray-900">Default Auto-Accept for new properties</h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          When enabled, newly created properties will default to auto-accepting bookings automatically. You can override this setting individually for each property.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, auto_accept_bookings: !prev.auto_accept_bookings }))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          formData.auto_accept_bookings ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={formData.auto_accept_bookings}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formData.auto_accept_bookings ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button Card Footer */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-navy-600 hover:from-primary-700 hover:to-navy-700 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[150px]"
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
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyPhoneOtp}
                disabled={isVerifyingOtp || phoneOtp.length !== 6}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-navy-600 text-white rounded-xl text-xs font-bold hover:from-primary-700 hover:to-navy-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default PropertyOwnerProfile;
