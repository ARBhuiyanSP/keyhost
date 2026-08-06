import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  FiX, FiUser, FiPhone, FiMail, FiGlobe, FiShield, 
  FiEye, FiAward, FiCalendar, FiDollarSign, FiMapPin, FiTrendingUp
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import { getImageUrl } from '../../utils/imageUrl';

const GuestProfileModal = ({ phone, onClose }) => {
  const { showError } = useToast();
  const [previewDocUrl, setPreviewDocUrl] = useState(null);
  const [previewDocTitle, setPreviewDocTitle] = useState('');

  // Fetch guest profile details and booking history
  const { data, isLoading } = useQuery(
    ['hms-guest-profile-details', phone],
    async () => {
      if (!phone) return null;
      const response = await api.get(`/property-owner/hms/guests/profile-details?phone=${encodeURIComponent(phone)}`);
      return response.data?.data || null;
    },
    {
      enabled: !!phone,
      onError: (err) => {
        showError(err.response?.data?.message || 'Failed to fetch guest details');
        onClose();
      }
    }
  );

  if (!phone) return null;

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
            <FiUser className="text-[#004e59]" /> Guest Profile & History
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004e59]" />
            <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest">Loading Profile details...</p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Upper Profile Box */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-slate-50 border border-slate-150 rounded-xl p-5">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 border border-slate-350">
                <span className="text-xl font-black uppercase text-[#004e59]">
                  {profile.guest_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'G'}
                </span>
              </div>

              {/* Basic Details */}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {profile.guest_name || 'Guest walk-in'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-650">
                  <div className="flex items-center gap-2 font-medium">
                    <FiPhone className="text-slate-400 shrink-0" size={13} />
                    <a href={`tel:${profile.guest_phone}`} className="hover:text-primary-600 hover:underline">
                      {profile.guest_phone}
                    </a>
                  </div>
                  {profile.guest_email && (
                    <div className="flex items-center gap-2 font-medium">
                      <FiMail className="text-slate-400 shrink-0" size={13} />
                      <a href={`mailto:${profile.guest_email}`} className="hover:text-primary-600 hover:underline break-all">
                        {profile.guest_email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 font-medium">
                    <FiGlobe className="text-slate-400 shrink-0" size={13} />
                    <span>Nationality: <strong className="text-slate-800">{profile.nationality || 'Unspecified'}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Document Verification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Loyalty Metrics */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <FiAward className="text-amber-500" /> Loyalty Metrics (This Owner)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Stays</span>
                    <span className="text-lg font-black text-slate-850">{profile.total_bookings_count || 0}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Revenue</span>
                    <span className="text-lg font-black text-slate-850">৳{formatBDTRate(profile.total_revenue_spent)}</span>
                  </div>
                </div>
                {profile.total_bookings_count > 0 && (
                  <div className="text-[10px] text-slate-500 flex flex-col gap-1 mt-1 font-semibold">
                    <div className="flex justify-between">
                      <span>First Visit:</span>
                      <span className="text-slate-800 font-bold">
                        {new Date(profile.first_visit_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Visit:</span>
                      <span className="text-slate-800 font-bold">
                        {new Date(profile.last_visit_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ID Verification */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <FiShield className="text-emerald-500" /> ID Verification
                  </h4>
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-semibold">National ID (NID):</span>
                      <span className="font-bold text-gray-800">{profile.nid_number || 'Not Provided'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-semibold">Passport:</span>
                      <span className="font-bold text-gray-800">{profile.passport_number || 'Not Provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-4 pt-3 border-t border-gray-100">
                  {profile.nid_document_url && (
                    <button
                      onClick={() => {
                        setPreviewDocUrl(getDocImgSrc(profile.nid_document_url));
                        setPreviewDocTitle(`${profile.guest_name} - NID Card`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xxs font-black uppercase tracking-wider transition-all"
                    >
                      <FiEye size={12} /> View NID
                    </button>
                  )}
                  {profile.passport_document_url && (
                    <button
                      onClick={() => {
                        setPreviewDocUrl(getDocImgSrc(profile.passport_document_url));
                        setPreviewDocTitle(`${profile.guest_name} - Passport Scan`);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xxs font-black uppercase tracking-wider transition-all"
                    >
                      <FiEye size={12} /> View Passport
                    </button>
                  )}
                  {!profile.nid_document_url && !profile.passport_document_url && (
                    <div className="w-full text-center text-slate-400 italic text-xxs py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                      No document scans uploaded
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Recent Bookings History */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <FiCalendar className="text-primary-600" /> Recent Bookings History (Last 5)
              </h4>
              
              {recentBookings.length === 0 ? (
                <div className="text-center py-6 text-slate-400 italic text-xs bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  No previous bookings found.
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-55 border-b border-gray-200 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                        <th className="px-4 py-2">Booking Ref</th>
                        <th className="px-4 py-2">Property & Room</th>
                        <th className="px-4 py-2 text-center">Dates</th>
                        <th className="px-4 py-2 text-right">Total Price</th>
                        <th className="px-4 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-xs text-gray-700 font-semibold">
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-slate-800">
                            {b.booking_reference}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-805 leading-tight">{b.property_title}</div>
                            {b.hms_room_number && (
                              <span className="text-[10px] text-gray-400 mt-0.5 block">Room: {b.hms_room_number}</span>
                            )}
                          </td>
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

      {/* Lightbox / Secondary Modal for Document Scan Image Preview */}
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

export default GuestProfileModal;
