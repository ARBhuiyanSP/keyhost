import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  FiX, FiUser, FiPhone, FiMail, FiGlobe, FiShield, 
  FiEye, FiAward, FiCalendar, FiDollarSign, FiMapPin, FiBriefcase,
  FiCheckCircle, FiAlertCircle, FiTrendingUp
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import { getImageUrl } from '../../utils/imageUrl';

const AdminUserProfileModal = ({ userId, phone, email, onClose }) => {
  const { showError } = useToast();
  const [previewDocUrl, setPreviewDocUrl] = useState(null);
  const [previewDocTitle, setPreviewDocTitle] = useState('');

  // Fetch guest or host profile details and booking history
  const { data, isLoading } = useQuery(
    ['admin-user-profile-details', userId, phone, email],
    async () => {
      let queryParams = [];
      if (userId) queryParams.push(`userId=${userId}`);
      if (phone) queryParams.push(`phone=${encodeURIComponent(phone)}`);
      if (email) queryParams.push(`email=${encodeURIComponent(email)}`);
      
      const response = await api.get(`/admin/users/profile-details?${queryParams.join('&')}`);
      return response.data?.data || null;
    },
    {
      enabled: !!(userId || phone || email),
      onError: (err) => {
        showError(err.response?.data?.message || 'Failed to fetch user details');
        onClose();
      }
    }
  );

  if (!userId && !phone && !email) return null;

  const profile = data?.profile || {};
  const recentBookings = data?.recentBookings || [];

  const getDocImgSrc = (url) => getImageUrl(url);

  const formatBDTRate = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-BD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      request_accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      checked_in: 'bg-purple-50 text-purple-700 border-purple-200',
      checked_out: 'bg-slate-100 text-slate-700 border-slate-300',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    const style = statusMap[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    return (
      <span className={`inline-block border px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Main Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-100 animate-fadeIn flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
            <FiUser className="text-blue-600" /> {profile.user_type === 'property_owner' ? 'Host / Owner' : 'Guest'} Profile &amp; History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-lg transition-all"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Modal Body */}
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest">Loading Profile details...</p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Upper Profile Box */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-slate-50 border border-slate-150 rounded-xl p-5">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
                <span className="text-xl font-black uppercase">
                  {profile.guest_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'U'}
                </span>
              </div>

              {/* Basic Details */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {profile.guest_name || 'Anonymous User'}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    profile.user_type === 'property_owner' 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                    {profile.user_type === 'property_owner' ? 'Host / Owner' : 'Guest'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    profile.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {profile.is_active ? 'Active' : 'Blocked'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-650 font-semibold">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-slate-400 shrink-0" size={13} />
                    {profile.guest_phone ? (
                      <a href={`tel:${profile.guest_phone}`} className="hover:text-blue-600 hover:underline">
                        {profile.guest_phone}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No Phone Number</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiMail className="text-slate-400 shrink-0" size={13} />
                    {profile.guest_email ? (
                      <a href={`mailto:${profile.guest_email}`} className="hover:text-blue-600 hover:underline break-all">
                        {profile.guest_email}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">No Email Address</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiGlobe className="text-slate-400 shrink-0" size={13} />
                    <span>Nationality: <strong className="text-slate-800">{profile.nationality || 'Unspecified'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-slate-400 shrink-0" size={13} />
                    <span>Joined: <strong className="text-slate-800">{profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Document Verification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Loyalty / Host Metrics */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                {profile.user_type === 'property_owner' ? (
                  <>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2">
                      <FiBriefcase className="text-[#004e59]" /> Hosting Metrics
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Properties</span>
                        <span className="text-base font-black text-slate-850">{profile.total_properties_count || 0}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Bookings</span>
                        <span className="text-base font-black text-slate-850">{profile.total_bookings_received || 0}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Total Earnings</span>
                        <span className="text-sm font-black text-emerald-600 truncate block">৳{formatBDTRate(profile.total_earnings)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2">
                      <FiAward className="text-amber-500" /> Guest Stay Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Stays</span>
                        <span className="text-lg font-black text-slate-850">{profile.total_bookings_count || 0}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Spent</span>
                        <span className="text-lg font-black text-slate-850">৳{formatBDTRate(profile.total_revenue_spent)}</span>
                      </div>
                    </div>
                    {profile.total_bookings_count > 0 && (
                      <div className="text-[10px] text-slate-500 flex flex-col gap-1 mt-1 font-semibold">
                        <div className="flex justify-between">
                          <span>First Stay:</span>
                          <span className="text-slate-800 font-bold">
                            {new Date(profile.first_visit_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Stay:</span>
                          <span className="text-slate-800 font-bold">
                            {new Date(profile.last_visit_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* ID Verification / Host settings */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <FiShield className="text-emerald-500" /> Host Verification &amp; Settings
                  </h4>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-400">Verfied Status:</span>
                      {profile.user_type === 'property_owner' ? (
                        <span className={`font-bold flex items-center gap-1 ${profile.owner_verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {profile.owner_verified ? <FiCheckCircle /> : <FiAlertCircle />}
                          {profile.owner_verified ? 'Verified' : 'Pending Verification'}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not Applicable</span>
                      )}
                    </div>
                    {profile.user_type === 'property_owner' && (
                      <>
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-gray-400">Business Name:</span>
                          <span className="font-bold text-gray-800">{profile.business_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-gray-400">Commission Rate:</span>
                          <span className="font-bold text-blue-600">{profile.commission_rate ? `${parseFloat(profile.commission_rate)}%` : '10%'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {profile.user_type === 'property_owner' && profile.verification_documents && (
                  <div className="flex gap-2.5 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setPreviewDocUrl(getDocImgSrc(profile.verification_documents));
                        setPreviewDocTitle(`${profile.guest_name} - Verification Documents`);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xxs font-black uppercase tracking-wider transition-all"
                    >
                      <FiEye size={12} /> View Docs / NID
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Recent Bookings History */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <FiCalendar className="text-blue-600" /> Recent Bookings (Last 5)
              </h4>
              
              {recentBookings.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-xs bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  No bookings found.
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-55 border-b border-gray-200 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="px-4 py-2">Ref</th>
                        <th className="px-4 py-2">Property</th>
                        {profile.user_type === 'property_owner' && <th className="px-4 py-2">Guest</th>}
                        <th className="px-4 py-2 text-center">Dates</th>
                        <th className="px-4 py-2 text-right">Amount</th>
                        <th className="px-4 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-xs text-gray-700 font-semibold">
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {b.booking_reference}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-805 leading-tight">
                            {b.property_title}
                          </td>
                          {profile.user_type === 'property_owner' && (
                            <td className="px-4 py-3 font-medium text-slate-700">
                              {b.guest_name}
                            </td>
                          )}
                          <td className="px-4 py-3 text-center space-y-0.5 whitespace-nowrap">
                            <div className="text-[10px] font-bold">
                              {new Date(b.check_in_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' })} - {new Date(b.check_out_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short' })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-black text-slate-900 whitespace-nowrap">
                            ৳{formatBDTRate(b.total_amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(b.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Document scan image preview Modal */}
      {previewDocUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-750 flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-xxs font-black uppercase tracking-wider">{previewDocTitle}</h3>
              <button
                onClick={() => {
                  setPreviewDocUrl(null);
                  setPreviewDocTitle('');
                }}
                className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 transition-all"
              >
                Close ✖
              </button>
            </div>
            <div className="p-4 flex justify-center bg-slate-900 min-h-[300px] max-h-[70vh] overflow-y-auto">
              <img
                src={previewDocUrl}
                alt={previewDocTitle}
                className="max-w-full h-auto object-contain rounded border border-slate-700 shadow-xl"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x300?text=Scan+Document+Not+Found';
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUserProfileModal;
