import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { getImageUrl } from '../../utils/imageUrl';
import {
  FiChevronLeft, FiMapPin, FiCalendar, FiUsers, FiClock,
  FiDollarSign, FiPrinter, FiCheck, FiAlertCircle, FiInfo,
  FiCreditCard, FiHome, FiStar
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CancellationModal from '../../components/bookings/CancellationModal';
import { formatPrice } from '../../utils/textUtils';

const GuestBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extension states
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDate, setExtendDate] = useState('');
  const [extendCalculation, setExtendCalculation] = useState(null);
  const [calculatingExtension, setCalculatingExtension] = useState(false);
  const [extending, setExtending] = useState(false);
  const [nextDayAvailable, setNextDayAvailable] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  
  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/guest/bookings/${id}`);
      const bookingData = response.data.data?.booking || response.data.booking;
      setBooking(bookingData);

      if (bookingData?.property_id && bookingData.check_out_date && ['confirmed', 'checked_in'].includes(bookingData.status)) {
        fetchPropertyData(bookingData.property_id, bookingData.check_out_date, bookingData.id);
      }
    } catch (err) {
      showError('Failed to fetch booking details');
      navigate('/guest/bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyData = async (propertyId, checkOutDate, bookingId) => {
    try {
      setCheckingAvailability(true);
      
      const checkOutLocal = new Date(checkOutDate);
      checkOutLocal.setHours(12, 0, 0, 0);
      const checkOutStr = checkOutLocal.toISOString().split('T')[0];

      const nextDayLocal = new Date(checkOutLocal.getTime() + 86400000);
      nextDayLocal.setHours(12, 0, 0, 0);
      const nextDayStr = nextDayLocal.toISOString().split('T')[0];
      
      // Pass exclude_booking_id so the current booking is NOT counted as a conflict
      const availRes = await api.get(`/properties/${propertyId}/availability?check_in_date=${checkOutStr}&check_out_date=${nextDayStr}&exclude_booking_id=${bookingId}`);
      setNextDayAvailable(availRes.data?.data?.isAvailable);
      
      const blockedRes = await api.get(`/properties/${propertyId}/blocked-dates`);
      setBlockedDates(blockedRes.data?.data?.blockedDates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const getMaxExtendDate = () => {
    if (!booking || !booking.check_out_date || !blockedDates || blockedDates.length === 0) return null;
    const checkOutLocal = new Date(booking.check_out_date);
    checkOutLocal.setHours(12, 0, 0, 0);
    const checkOutStr = checkOutLocal.toISOString().split('T')[0];

    const futureBlocked = blockedDates
      .map(dStr => {
        const [y, m, d] = dStr.split('-').map(Number);
        return new Date(y, m - 1, d);
      })
      .filter(d => {
        d.setHours(12, 0, 0, 0);
        return d.toISOString().split('T')[0] > checkOutStr; // Strictly after checkout date
      })
      .sort((a, b) => a - b);
      
    if (futureBlocked.length > 0) {
      return futureBlocked[0];
    }
    return null;
  };

  const handleCancelBooking = async (bookingId, reason) => {
    try {
      const response = await api.patch(`/guest/bookings/${bookingId}/cancel`, { reason });
      showSuccess('Booking cancelled successfully');
      if (response.data?.data?.booking) setBooking(response.data.data.booking);
      else fetchBooking();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleCalculateExtension = async (newDate) => {
    setExtendDate(newDate);
    if (!newDate) {
      setExtendCalculation(null);
      return;
    }

    try {
      setCalculatingExtension(true);
      const response = await api.post(`/guest/bookings/${id}/extend/calculate`, { new_check_out_date: newDate });
      setExtendCalculation(response.data.data);
    } catch (err) {
      setExtendCalculation(null);
      showError(err.response?.data?.message || 'Failed to calculate extension. Dates might not be available.');
    } finally {
      setCalculatingExtension(false);
    }
  };

  const handleConfirmExtension = async () => {
    if (!extendDate || !extendCalculation) return;

    try {
      setExtending(true);
      const response = await api.post(`/guest/bookings/${id}/extend`, { new_check_out_date: extendDate });
      showSuccess(response.data.message || 'Extension successful');
      setShowExtendModal(false);
      
      // Navigate to payment page, passing only the extra amount due
      const extraAmountDue = response.data?.data?.extra_amount_due;
      navigate(`/payment/${id}`, { state: { isExtension: true, extra_amount_due: extraAmountDue } });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to apply extension');
    } finally {
      setExtending(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!booking) return <div className="text-center p-8">Booking not found</div>;

  // ── Helpers ──
  const getStatusColor = (s) => ({ confirmed: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', cancelled: 'bg-red-100 text-red-800', checked_in: 'bg-blue-100 text-blue-800', checked_out: 'bg-gray-100 text-gray-800', request_accepted: 'bg-blue-100 text-blue-800' }[s] || 'bg-gray-100 text-gray-800');
  const getStatusDot = (s) => ({ confirmed: 'bg-green-500', pending: 'bg-yellow-500', cancelled: 'bg-red-500', checked_in: 'bg-blue-500', checked_out: 'bg-gray-400', request_accepted: 'bg-blue-500' }[s] || 'bg-gray-400');
  const getPayStatusColor = (s) => ({ paid: 'bg-green-100 text-green-800', completed: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', failed: 'bg-red-100 text-red-800', refunded: 'bg-purple-100 text-purple-800', cancelled: 'bg-gray-100 text-gray-800' }[s] || 'bg-gray-100 text-gray-800');
  const getPayMethodDisplay = (m) => ({ bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', bank_transfer: 'Bank Transfer', credit_card: 'Credit Card', cash: 'Cash on Arrival' }[m?.toLowerCase()] || m);
  const getRefundStatusColor = (s) => ({ pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', failed: 'bg-red-100 text-red-800', cancelled: 'bg-gray-100 text-gray-800' }[s?.toLowerCase()] || 'bg-gray-100 text-gray-800');
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const nights = (() => {
    if (!booking.check_in_date || !booking.check_out_date) return 0;
    return Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 60 * 60 * 24));
  })();

  const totalDR = booking.payments?.reduce((s, p) => s + parseFloat(p.dr_amount || 0), 0) || 0;
  const totalCR = booking.payments?.reduce((s, p) => s + parseFloat(p.cr_amount || 0), 0) || 0;
  const remaining = totalDR - totalCR;

  const heroImage = booking.property_image || booking.main_image || booking.property_images?.[0]?.image_url || null;
  const canCancel = ['pending', 'request_accepted'].includes(booking.status) ||
    (booking.status === 'confirmed' && new Date(booking.check_in_date).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0));
  const canExtend = ['confirmed', 'checked_in'].includes(booking.status);
  const needsPayment = ((booking.status === 'request_accepted' || booking.status === 'confirmed') && booking.payment_status !== 'paid') || booking.payment_status === 'pending_extra';

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-section, #printable-section * { visibility: visible; }
          #printable-section { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .print-show { display: block !important; }
        }
        .print-show { display: none; }
      `}</style>

      <div className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <div className="w-full h-[40vh] md:h-[55vh] bg-gray-100 relative overflow-hidden">
          {heroImage ? (
            <img src={getImageUrl(heroImage)} alt={booking.property_title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <FiHome className="w-20 h-20 text-gray-400" />
            </div>
          )}
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Back button */}
          <button
            onClick={() => navigate('/guest/bookings')}
            className="no-print absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all text-gray-900 font-medium text-sm"
          >
            <FiChevronLeft className="w-4 h-4" />
            My Bookings
          </button>

          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="no-print absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all text-gray-900 font-medium text-sm"
          >
            <FiPrinter className="w-4 h-4" />
            Print
          </button>

          {/* Hero info overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-6 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white`}>
                <span className={`w-2 h-2 rounded-full ${getStatusDot(booking.status)}`} />
                {booking.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold leading-tight mt-1">{booking.property_title || 'Property Booking'}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/90">
              {booking.property_address && <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" />{booking.property_address}</span>}
              <span className="flex items-center gap-1"><FiCalendar className="w-3.5 h-3.5" />{fmtDateShort(booking.check_in_date)} → {fmtDateShort(booking.check_out_date)}</span>
              {nights > 0 && <span>{nights} night{nights > 1 ? 's' : ''}</span>}
              <span className="flex items-center gap-1"><FiUsers className="w-3.5 h-3.5" /> {booking.number_of_guests} guest{booking.number_of_guests > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* ── 2-column content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">

          {/* Print header — only shows when printing */}
          <div className="print-show mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Booking Confirmation</h1>
            <p className="text-gray-600">Keyhost Homes — Booking #{booking.id}</p>
          </div>

          <div id="printable-section" className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-16 items-start">

            {/* ─── LEFT: Details ─── */}
            <div className="space-y-8">

              {/* Status alerts */}
              {booking.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex gap-3">
                  <FiClock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800 text-sm">Waiting for owner confirmation</p>
                    <p className="text-yellow-700 text-sm mt-0.5">Your request has been submitted. The property owner will respond shortly.</p>
                    <button 
                      onClick={() => navigate(`/guest/booking-negotiation/${booking.id}`)}
                      className="mt-3 px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Chat & Negotiate Rate
                    </button>
                  </div>
                </div>
              )}
              {booking.status === 'request_accepted' && booking.payment_status !== 'paid' && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-3">
                  <FiCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">Owner accepted your request!</p>
                    <p className="text-blue-700 text-sm mt-0.5">Please complete payment to confirm your booking.</p>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/payment/${booking.id}`)} className="mt-3 px-5 py-2 bg-[#E41D57] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                        Make Payment →
                      </button>
                      <button onClick={() => navigate(`/guest/booking-negotiation/${booking.id}`)} className="mt-3 px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                        Chat with Host
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {booking.status === 'confirmed' && booking.payment_status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-3">
                  <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">Payment required</p>
                    <p className="text-blue-700 text-sm mt-0.5">Your booking is confirmed. Complete payment to finalize your reservation.</p>
                    <button onClick={() => navigate(`/payment/${booking.id}`)} className="mt-3 px-5 py-2 bg-[#E41D57] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                      Make Payment →
                    </button>
                  </div>
                </div>
              )}
              {booking.status === 'confirmed' && booking.payment_status === 'paid' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex gap-3">
                  <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm">Booking confirmed & paid!</p>
                    <p className="text-green-700 text-sm mt-0.5">Your stay is all set. We look forward to welcoming you.</p>
                  </div>
                </div>
              )}
              {booking.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 text-sm">Booking Cancelled</p>
                    <p className="text-red-700 text-sm mt-0.5">This booking has been cancelled.</p>
                  </div>
                </div>
              )}

              {/* Section: Booking reference */}
              <div className="border-b border-gray-200 pb-8">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-semibold text-gray-900">Booking #{booking.id}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                {booking.booking_reference && (
                  <p className="text-sm text-gray-400 font-mono">Ref: {booking.booking_reference}</p>
                )}
              </div>

              {/* Section: Trip details */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-[#E41D57]" /> Trip details
                </h3>
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Check-in</p>
                    <p className="text-base font-semibold text-gray-900">{fmtDate(booking.check_in_date)}</p>
                    {booking.check_in_time && <p className="text-sm text-gray-500 mt-0.5">From {booking.check_in_time}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Check-out</p>
                    <p className="text-base font-semibold text-gray-900">{fmtDate(booking.check_out_date)}</p>
                    {booking.check_out_time && <p className="text-sm text-gray-500 mt-0.5">Until {booking.check_out_time}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Guests</p>
                    <p className="text-base font-semibold text-gray-900">{booking.number_of_guests} adult{booking.number_of_guests > 1 ? 's' : ''}</p>
                    {booking.number_of_children > 0 && <p className="text-sm text-gray-500">{booking.number_of_children} child{booking.number_of_children > 1 ? 'ren' : ''}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-base font-semibold text-gray-900">{nights} night{nights > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Section: Property info */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <FiHome className="w-5 h-5 text-[#E41D57]" /> Property
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-sm text-gray-500">Property name</span>
                    <span className="text-sm font-semibold text-gray-900">{booking.property_title || '—'}</span>
                  </div>
                  {booking.property_address && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="text-sm font-semibold text-gray-900 sm:text-right max-w-xs">{booking.property_address}</span>
                    </div>
                  )}
                  {booking.property_type && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-sm text-gray-500">Property type</span>
                      <span className="text-sm font-semibold text-gray-900">{booking.property_type}</span>
                    </div>
                  )}
                  {booking.hms_room_number && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <span className="text-sm text-gray-500">Room</span>
                      <span className="text-sm font-bold text-[#E41D57]">
                        Room {booking.hms_room_number} ({booking.hms_room_type})
                      </span>
                    </div>
                  )}
                </div>
                {booking.status === 'confirmed' && (
                  <button onClick={() => navigate(`/property/${booking.property_slug || booking.property_id}`)} className="mt-4 text-sm text-[#E41D57] font-semibold underline-offset-2 hover:underline">
                    View property →
                  </button>
                )}
              </div>

              {/* Section: Special requests */}
              {booking.special_requests && (
                <div className="border-b border-gray-200 pb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Special requests</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-2xl p-4 leading-relaxed">{booking.special_requests}</p>
                </div>
              )}

              {/* Section: Payment information */}
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5 text-[#E41D57]" /> Payment
                </h3>

                {/* Payment status badges */}
                <div className="flex flex-wrap gap-3 mb-5">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Payment status</p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getPayStatusColor(booking.payment_status)}`}>
                      {booking.payment_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'N/A'}
                    </span>
                  </div>
                  {booking.payments?.[0]?.payment_method && (
                    <div className="bg-gray-50 rounded-2xl px-4 py-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Method</p>
                      <p className="text-sm font-semibold text-gray-900">{getPayMethodDisplay(booking.payments[0].payment_method)}</p>
                    </div>
                  )}
                  {booking.payments?.[0]?.payment_date && (
                    <div className="bg-gray-50 rounded-2xl px-4 py-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Payment date</p>
                      <p className="text-sm font-semibold text-gray-900">{fmtDateShort(booking.payments[0].payment_date)}</p>
                    </div>
                  )}
                </div>

                {/* DR / CR / Balance summary */}
                {booking.payments?.length > 0 && (
                  <>
                    <div className={`grid gap-3 mb-5 ${booking.points_discount > 0 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                      <div className="text-center bg-gray-50 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Base Price</p>
                        <p className="text-xl font-bold text-gray-900">BDT {formatPrice(booking.total_amount || 0)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Total</p>
                      </div>
                      {booking.points_discount > 0 && (
                        <div className="text-center bg-yellow-50 rounded-2xl p-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Discount</p>
                          <p className="text-xl font-bold text-yellow-600">- BDT {formatPrice(booking.points_discount)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Points</p>
                        </div>
                      )}
                      <div className="text-center bg-green-50 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Paid (CR)</p>
                        <p className="text-xl font-bold text-green-600">BDT {formatPrice(totalCR)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Received</p>
                      </div>
                      <div className="text-center bg-orange-50 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Remaining</p>
                        <p className={`text-xl font-bold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>BDT {formatPrice(remaining)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Due</p>
                      </div>
                    </div>

                    {/* Refund Information */}
                    {booking.refunds && booking.refunds.length > 0 && (
                      <div className="mb-6 bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wider">Refund Information</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getRefundStatusColor(booking.refunds[0].status)}`}>
                            {booking.refunds[0].status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-rose-600/70 font-semibold uppercase mb-1">Refund Amount</p>
                            <p className="text-lg font-bold text-rose-600">BDT {formatPrice(booking.refunds[0].refund_amount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-rose-600/70 font-semibold uppercase mb-1">Requested At</p>
                            <p className="text-sm font-bold text-gray-900">{fmtDateShort(booking.refunds[0].requested_at)}</p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-xs text-rose-600/70 font-semibold uppercase mb-1">Refund ID</p>
                            <p className="text-xs font-mono font-bold text-gray-600 truncate">{booking.refunds[0].refund_reference}</p>
                          </div>
                        </div>
                        {booking.refunds[0].admin_notes && (
                          <div className="mt-4 pt-4 border-t border-rose-100">
                            <p className="text-xs text-rose-600/70 font-semibold uppercase mb-1">Admin Notes</p>
                            <p className="text-sm text-gray-700 italic">"{booking.refunds[0].admin_notes}"</p>
                          </div>
                        )}
                        <p className="mt-4 text-[10px] text-rose-400 leading-tight italic">
                          * Refunds are typically processed within 7-10 business days after approval.
                        </p>
                      </div>
                    )}

                    {/* Transaction history */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Transaction history ({booking.payments.length})</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {booking.payments.map((payment, idx) => (
                          <div key={payment.id} className="flex items-start justify-between bg-gray-50 rounded-xl p-3.5">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-gray-500">#{idx + 1}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${payment.dr_amount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                  {payment.dr_amount > 0 ? 'DR' : 'CR'}
                                </span>
                                {payment.payment_reference && (
                                  <span className="text-xs font-mono text-blue-600">{payment.payment_reference}</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 capitalize">
                                {payment.transaction_type?.replace(/_/g, ' ') || payment.payment_type}
                              </p>
                              {payment.notes && <p className="text-xs text-gray-400 mt-0.5">{payment.notes}</p>}
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(payment.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              {payment.dr_amount > 0 && <p className="text-sm font-bold text-red-600">DR: BDT {formatPrice(payment.dr_amount)}</p>}
                              {payment.cr_amount > 0 && <p className="text-sm font-bold text-green-600">CR: BDT {formatPrice(payment.cr_amount)}</p>}
                              <p className="text-xs text-gray-500 mt-0.5">Bal: <span className={`font-semibold ${payment.running_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>BDT {formatPrice(payment.running_balance || 0)}</span></p>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${payment.status === 'completed' ? 'bg-green-100 text-green-700' : payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Section: Rewards Points */}
              {booking.reward_points?.length > 0 && (
                <div className="border-b border-gray-200 pb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
                    <FiStar className="w-5 h-5 text-yellow-500 fill-current" /> Rewards Points
                  </h3>
                  <div className="space-y-3">
                    {booking.reward_points.map((rp, idx) => (
                      <div key={idx} className={`p-4 rounded-xl flex items-center justify-between ${rp.transaction_type === 'earned' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize text-sm">{rp.transaction_type} Points</p>
                          <p className="text-xs text-gray-500 mt-0.5">{rp.description || 'Booking reward'}</p>
                        </div>
                        <div className={`text-lg font-bold ${rp.transaction_type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                          {rp.transaction_type === 'earned' ? '+' : '-'}{rp.points}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="no-print flex flex-wrap gap-3 pt-2">
                {canExtend && (
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setShowExtendModal(true)} 
                      disabled={!nextDayAvailable || checkingAvailability}
                      className={`px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors ${nextDayAvailable && !checkingAvailability ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}>
                      {checkingAvailability ? 'Checking...' : 'Extend Booking'}
                    </button>
                    {!checkingAvailability && !nextDayAvailable && (
                      <p className="text-xs text-orange-600 flex items-center gap-1">
                        <span>⚠️</span>
                        Extension unavailable — property is already booked after your checkout.
                      </p>
                    )}
                  </div>
                )}
                {canCancel && (
                  <button onClick={() => setShowCancelModal(true)} className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors">
                    Cancel booking
                  </button>
                )}
                {needsPayment && (
                  <button onClick={() => navigate(`/payment/${booking.id}`)} className="px-5 py-2.5 bg-gradient-to-r from-[#E41D57] to-[#ff5c8a] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-md">
                    Make Payment →
                  </button>
                )}
                <button onClick={() => window.print()} className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <FiPrinter className="w-4 h-4" /> Print
                </button>
              </div>

              {/* Print footer */}
              <div className="print-show mt-8 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">Thank you for choosing Keyhost Homes. Contact us at support@keyhosthomes.com</p>
                <p className="text-xs text-gray-400 mt-1">Printed on {new Date().toLocaleString()}</p>
              </div>
            </div>

            {/* ─── RIGHT: Sticky summary card ─── */}
            <div className="hidden lg:block print:block">
              <div className="sticky top-24 space-y-4 print:static">

                {/* Price summary card */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">BDT {formatPrice(booking.total_amount || 0)}</p>
                        <p className="text-sm text-gray-400">Total amount</p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getPayStatusColor(booking.payment_status)}`}>
                        {booking.payment_status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Trip summary */}
                  <div className="p-6 space-y-3 text-sm border-b border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-in</span>
                      <span className="font-semibold text-gray-900">{fmtDateShort(booking.check_in_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Check-out</span>
                      <span className="font-semibold text-gray-900">{fmtDateShort(booking.check_out_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration</span>
                      <span className="font-semibold text-gray-900">{nights} night{nights > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guests</span>
                      <span className="font-semibold text-gray-900">{booking.number_of_guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Booking ref</span>
                      <span className="font-mono text-xs text-gray-700">{booking.booking_reference || `#${booking.id}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                        {booking.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>

                    {/* Reward Points Quick Summary */}
                    {booking.reward_points?.length > 0 && (
                      <div className="flex justify-between items-start pt-3 border-t border-gray-100 mt-3">
                        <span className="text-gray-500 flex items-center gap-1.5"><FiStar className="w-3.5 h-3.5 text-yellow-500 fill-current" /> Points</span>
                        <div className="text-right">
                          {booking.reward_points.map((rp, idx) => (
                            <div key={idx} className={`text-xs font-bold ${rp.transaction_type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                              {rp.transaction_type === 'earned' ? '+' : '-'}{rp.points} {rp.transaction_type}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Balance summary */}
                  {booking.payments?.length > 0 && (
                    <div className="p-6 space-y-2 text-sm border-b border-gray-100">
                      <div className="flex justify-between text-gray-600">
                        <span>Total amount</span><span className="font-semibold text-gray-600">BDT {formatPrice(booking.total_amount || 0)}</span>
                      </div>
                      {booking.points_discount > 0 && (
                        <div className="flex justify-between text-yellow-600 font-semibold">
                          <span>Points discount</span><span>- BDT {formatPrice(booking.points_discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600 border-t border-gray-100 pt-2">
                        <span>Net receivable</span><span className="font-semibold text-red-600">BDT {formatPrice(totalDR)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Paid</span><span className="font-semibold text-green-600">BDT {formatPrice(totalCR)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                        <span>Remaining</span>
                        <span className={remaining > 0 ? 'text-orange-600' : 'text-green-600'}>BDT {formatPrice(remaining)}</span>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="p-6 space-y-3">
                    {canExtend && (
                      <div className="space-y-1">
                        <button 
                          onClick={() => setShowExtendModal(true)} 
                          disabled={!nextDayAvailable || checkingAvailability}
                          className={`w-full py-3.5 rounded-xl font-bold transition-colors shadow-sm text-sm border ${nextDayAvailable && !checkingAvailability ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200" : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"}`}>
                          {checkingAvailability ? 'Checking Availability...' : 'Extend Booking'}
                        </button>
                        {!checkingAvailability && !nextDayAvailable && (
                          <div className="flex items-start gap-1.5 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                            <span className="text-orange-500 text-xs mt-0.5">⚠️</span>
                            <p className="text-xs text-orange-700 leading-snug">
                              Extension unavailable — the property is already booked by another guest right after your checkout date.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {needsPayment && (
                      <button onClick={() => navigate(`/payment/${booking.id}`)} className="w-full py-3.5 rounded-xl text-white font-bold bg-gradient-to-r from-[#E41D57] to-[#ff5c8a] hover:opacity-90 transition-opacity shadow-md text-sm">
                        Make Payment →
                      </button>
                    )}
                    {canCancel && (
                      <button onClick={() => setShowCancelModal(true)} className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors">
                        Cancel booking
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button onClick={() => navigate(`/property/${booking.property_slug || booking.property_id}`)} className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">
                        View property
                      </button>
                    )}
                  </div>
                </div>

                {/* Guest card */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Guest</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E41D57] to-[#ff5c8a] flex items-center justify-center text-white font-bold text-sm">
                      {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Extend Booking Modal ── */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => !extending && setShowExtendModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 pt-6 pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiCalendar className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-semibold text-gray-900" id="modal-title">
                      Extend Your Stay
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        Current Check-out: <span className="font-semibold text-gray-900">{fmtDate(booking.check_out_date)}</span>
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex flex-col items-center">
                          <label className="block text-sm font-medium text-gray-700 mb-3 w-full text-left">Select New Check-out Date</label>
                          <style>{`
                            .custom-calendar, .react-datepicker {
                                border: none !important;
                                font-family: inherit !important;
                                display: flex !important;
                                justify-content: center;
                                box-shadow: none !important;
                                background-color: transparent !important;
                            }
                            .custom-calendar .react-datepicker__month-container {
                                padding: 0 10px;
                            }
                            .custom-calendar .react-datepicker__header {
                                background: white;
                                border: none;
                                padding-top: 4px;
                            }
                            .custom-calendar .react-datepicker__day-name {
                                color: #717171;
                                font-size: 0.75rem;
                                width: 38px;
                                line-height: 38px;
                                margin: 0;
                            }
                            .custom-calendar .react-datepicker__day {
                                width: 38px;
                                height: 38px;
                                line-height: 38px;
                                margin: 0;
                                font-size: 0.85rem;
                                font-weight: 500;
                                border-radius: 50%;
                            }
                            .custom-calendar .react-datepicker__day:hover {
                                background-color: #f7f7f7;
                                border: 1.5px solid black;
                                color: black;
                                border-radius: 50%;
                            }
                            .custom-calendar .react-datepicker__day--selected,
                            .custom-calendar .react-datepicker__day--range-end,
                            .custom-calendar .react-datepicker__day--range-start {
                                background-color: #222222 !important;
                                color: white !important;
                                border-radius: 50%;
                            }
                            .custom-calendar .react-datepicker__day--in-selecting-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end),
                            .custom-calendar .react-datepicker__day--in-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end) {
                                background-color: #f7f7f7 !important;
                                color: #222222 !important;
                                border-radius: 50%;
                            }
                            .custom-calendar .react-datepicker__current-month {
                                font-size: 0.95rem;
                                font-weight: 600;
                                margin-bottom: 8px;
                                color: #222222;
                            }
                            .custom-calendar .react-datepicker__navigation {
                                top: 4px;
                            }
                        `}</style>
                          <div className="p-4 border border-gray-200 rounded-2xl shadow-sm bg-white overflow-hidden w-full flex justify-center">
                            <DatePicker
                              selected={extendDate ? new Date(extendDate) : null}
                              onChange={(date) => {
                                if (date) {
                                  // Fix timezone issues by zeroing hours safely
                                  const localDate = new Date(date);
                                  localDate.setHours(12, 0, 0, 0); 
                                  const formattedDate = localDate.toISOString().split('T')[0];
                                  handleCalculateExtension(formattedDate);
                                } else {
                                  handleCalculateExtension('');
                                }
                              }}
                              minDate={new Date(new Date(booking.check_out_date).getTime() + 86400000)}
                              maxDate={getMaxExtendDate()}
                              inline
                              calendarClassName="custom-calendar"
                              disabled={calculatingExtension || extending}
                            />
                          </div>
                        </div>

                        {calculatingExtension && (
                          <div className="py-8"><LoadingSpinner /></div>
                        )}

                        {extendCalculation && !calculatingExtension && (
                          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-4 space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 text-center">Price Breakdown</h4>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Additional Nights</span>
                              <span className="font-medium text-gray-900">{extendCalculation.extra_nights}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Base Price (x{extendCalculation.extra_nights})</span>
                              <span className="font-medium text-gray-900">৳{extendCalculation.extra_base_price.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Service Fee & Taxes</span>
                              <span className="font-medium text-gray-900">৳{extendCalculation.extra_service_fee.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-blue-200 mt-2">
                              <span>Total Extra Cost</span>
                              <span className="text-blue-600">৳{extendCalculation.additional_total_amount.toFixed(0)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleConfirmExtension}
                  disabled={!extendCalculation || calculatingExtension || extending}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {extending ? 'Processing...' : 'Confirm & Pay'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowExtendModal(false)}
                  disabled={extending}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancellation Modal ── */}
      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        bookingId={id}
        onConfirm={handleCancelBooking}
      />
    </>
  );
};

export default GuestBookingDetail;
