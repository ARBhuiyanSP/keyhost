import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCalendar, FiSearch, FiFilter, FiEye, FiUser, FiHome, FiDollarSign, FiMapPin, FiCheck, FiX, FiCreditCard, FiAlertTriangle, FiLogIn, FiLogOut, FiChevronRight } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { formatPrice } from '../../utils/textUtils';

const ExpandablePropertyTitle = ({ title, maxLength = 25 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!title || title.length <= maxLength) {
    return <div className="text-sm font-medium text-gray-900 leading-tight">{title}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="text-sm font-medium text-gray-900 leading-tight whitespace-normal break-words">
        {isExpanded ? title : `${title.substring(0, maxLength)}...`}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="text-primary-600 font-medium text-[11px] hover:underline focus:outline-none text-left mt-0.5 self-start"
      >
        {isExpanded ? 'View Less' : 'View More'}
      </button>
    </div>
  );
};
const PropertyOwnerBookings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialStatus = searchParams.get('status') || '';

  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: initialStatus,
    search: initialSearch,
    page: 1,
    limit: 10
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [partialAmount, setPartialAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [deductionData, setDeductionData] = useState({ amount: '', reason: '' });
  const [isSubmittingDeduction, setIsSubmittingDeduction] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Fetch property owner's bookings
  const { data: bookingsData, isLoading, refetch } = useQuery(
    ['owner-bookings', filters],
    () => api.get(`/property-owner/bookings?${new URLSearchParams(filters).toString()}`),
    {
      select: (response) => {
        const data = response.data?.data || { bookings: [], pagination: {} };
        // Debug: Log first booking
        if (data.bookings && data.bookings.length > 0) {
          console.log('=== FRONTEND BOOKINGS DEBUG ===');
          console.log('First booking:', data.bookings[0]);
          console.log('Guest name:', data.bookings[0].guest_name);
          console.log('Guest first name:', data.bookings[0].guest_first_name);
          console.log('Guest last name:', data.bookings[0].guest_last_name);
          console.log('===============================');
        }
        return data;
      },
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      [key]: value
    }));
  };

  const handleViewBooking = async (booking) => {
    try {
      // Fetch payment history for the booking
      const response = await api.get(`/property-owner/bookings/${booking.id}/payments`);
      const payments = response.data?.data?.payments || [];

      setSelectedBooking({
        ...booking,
        payments: payments
      });
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Use booking data if API call fails
      setSelectedBooking(booking);
      setShowDetailsModal(true);
    }
  };

  useEffect(() => {
    if (initialSearch && bookingsData?.bookings?.length === 1 && !hasAutoOpened) {
      const booking = bookingsData.bookings[0];
      if (booking.booking_reference === initialSearch) {
        setHasAutoOpened(true);
        handleViewBooking(booking);
      }
    }
  }, [bookingsData, initialSearch, hasAutoOpened]);

  const handleBookingAction = async (bookingId, action) => {
    const actionText = action === 'checkin' ? 'check in' : action === 'checkout' ? 'check out' : action;

    if (!window.confirm(`Are you sure you want to ${actionText} this booking?`)) {
      return;
    }

    try {
      console.log(`Attempting ${action} for booking ${bookingId}`);

      let endpoint = '';
      let data = {};

      switch (action) {
        case 'cancel':
          endpoint = `/property-owner/bookings/${bookingId}/cancel`;
          data = { reason: 'Cancelled by property owner' };
          break;
        case 'confirm':
          endpoint = `/property-owner/bookings/${bookingId}/confirm`;
          break;
        case 'checkin':
          endpoint = `/property-owner/bookings/${bookingId}/checkin`;
          break;
        case 'checkout':
          endpoint = `/property-owner/bookings/${bookingId}/checkout`;
          break;
        default:
          console.error('Invalid action:', action);
          return;
      }

      console.log(`Calling endpoint: ${endpoint}`);
      const response = await api.patch(endpoint, data);
      console.log(`${action} response:`, response.data);

      if (response.data.success) {
        showSuccess(`Booking ${actionText} successful!`);

        const statusMap = {
          confirm: 'request_accepted',
          cancel: 'cancelled',
          checkin: 'checked_in',
          checkout: 'checked_out'
        };

        const updatedStatus = statusMap[action];

        if (updatedStatus) {
          const normalizedBookingId = Number(bookingId);

          queryClient.setQueryData(['owner-bookings', filters], (oldData) => {
            if (!oldData) return oldData;

            const updatedBookings = (oldData.bookings || []).map((booking) => {
              if (Number(booking.id) === normalizedBookingId) {
                return { ...booking, status: updatedStatus };
              }
              return booking;
            });

            return { ...oldData, bookings: updatedBookings };
          });

          setSelectedBooking((prev) =>
            prev && Number(prev.id) === normalizedBookingId ? { ...prev, status: updatedStatus } : prev
          );
        }

        refetch();
      } else {
        showError(response.data.message || `Failed to ${actionText} booking`);
      }
    } catch (error) {
      console.error(`Error ${action} booking:`, error);
      showError(error.response?.data?.message || `Failed to ${actionText} booking`);
    }
  };

  const handleDeductionClaim = (booking) => {
    setSelectedBooking(booking);
    setDeductionData({ amount: '', reason: '' });
    setShowDeductionModal(true);
  };

  const submitDeductionClaim = async () => {
    if (!deductionData.amount || isNaN(deductionData.amount) || parseFloat(deductionData.amount) <= 0) {
      showError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!deductionData.reason.trim()) {
      showError('A reason is required to process a deduction claim.');
      return;
    }

    setIsSubmittingDeduction(true);
    try {
      const response = await api.post(`/property-owner/bookings/${selectedBooking.id}/deduction-claim`, { 
        amount: deductionData.amount, 
        reason: deductionData.reason 
      });
      if (response.data.success) {
        showSuccess('Deduction claim sent to Admin for review');
        // Invalidate queries to refresh data
        queryClient.invalidateQueries('property-owner-earnings-dashboard');
        queryClient.invalidateQueries(['owner-bookings', filters]);
        setShowDeductionModal(false);
        refetch();
      } else {
        showError(response.data.message || 'Failed to submit claim');
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit deduction claim');
    } finally {
      setIsSubmittingDeduction(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'request_accepted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'checked_out':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canCancel = (booking) => {
    return ['pending', 'confirmed'].includes(booking.status);
  };

  const canCheckIn = (booking) => {
    const paymentOK = ['paid', 'completed'].includes(booking.payment_status) || (parseFloat(booking.due_amount) || 0) <= 0;
    return booking.status === 'confirmed' && paymentOK;
  };

  const canCheckOut = (booking) => {
    return booking.status === 'checked_in';
  };

  const canConfirm = (booking) => {
    return booking.status === 'pending';
  };

  const handleOpenPaymentModal = async (booking) => {
    setSelectedBooking(booking);
    setPaymentStatus(booking.payment_status || 'pending');
    setPartialAmount('');
    setDiscountAmount('');
    setDiscountReason('');

    // Fetch payment history for this booking
    try {
      const response = await api.get(`/property-owner/bookings/${booking.id}/payments`);
      const payments = response.data?.data?.payments || [];

      // Use paid_amount from database
      const totalPaid = parseFloat(booking.paid_amount || 0);
      const dueAmount = parseFloat(booking.due_amount || (booking.total_amount - totalPaid));

      // Update booking with payment info
      setSelectedBooking({
        ...booking,
        payments: payments,
        total_paid: totalPaid,
        due_amount: dueAmount
      });
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Use booking data if API call fails
      const totalPaid = parseFloat(booking.paid_amount || 0);
      setSelectedBooking({
        ...booking,
        payments: [],
        total_paid: totalPaid,
        due_amount: booking.total_amount - totalPaid
      });
    }

    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedBooking(null);
    setPaymentStatus('');
    setPartialAmount('');
    setDiscountAmount('');
    setDiscountReason('');
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedBooking || !paymentStatus) return;

    // Calculate remaining amount from DR - CR
    const maxPayment = selectedBooking.payments && selectedBooking.payments.length > 0
      ? Math.max(0,
        selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) -
        selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0)
      )
      : (selectedBooking.due_amount || selectedBooking.total_amount);

    // Validate partial amount if provided
    if (partialAmount) {
      const amount = parseFloat(partialAmount);
      if (isNaN(amount) || amount <= 0 || amount > maxPayment) {
        showError(`Payment amount must be between BDT 0.01 and BDT ${maxPayment.toFixed(2)}`);
        return;
      }
    }

    // Validate discount amount if provided
    if (discountAmount) {
      const discount = parseFloat(discountAmount);
      if (isNaN(discount) || discount <= 0 || discount > selectedBooking.total_amount) {
        showError(`Discount amount must be between BDT 0.01 and BDT ${selectedBooking.total_amount.toFixed(2)}`);
        return;
      }
    }

    try {
      const payload = {
        payment_status: paymentStatus
      };

      // Add partial payment if provided
      if (partialAmount && parseFloat(partialAmount) > 0) {
        payload.partial_amount = parseFloat(partialAmount);
      }

      // Add discount if provided
      if (discountAmount && parseFloat(discountAmount) > 0) {
        payload.discount_amount = parseFloat(discountAmount);
        payload.discount_reason = discountReason || 'Owner discount';
      }

      console.log('Submitting payment update:', payload);
      await api.patch(`/property-owner/bookings/${selectedBooking.id}/payment`, payload);

      showSuccess('Payment updated successfully!');

      const normalizedId = Number(selectedBooking.id);
      const additionalPaid = parseFloat(partialAmount || 0) || 0;
      const discountApplied = parseFloat(discountAmount || 0) || 0;

      queryClient.setQueryData(['owner-bookings', filters], (oldData) => {
        if (!oldData) return oldData;

        const updatedBookings = (oldData.bookings || []).map((booking) => {
          if (Number(booking.id) === normalizedId) {
            const newPaidAmount = (parseFloat(booking.paid_amount) || 0) + additionalPaid;
            const newDueAmount = Math.max(
              0,
              (parseFloat(booking.due_amount) || 0) - additionalPaid - discountApplied
            );
            return {
              ...booking,
              payment_status: paymentStatus,
              paid_amount: newPaidAmount,
              due_amount: newDueAmount
            };
          }
          return booking;
        });

        return { ...oldData, bookings: updatedBookings };
      });

      setSelectedBooking((prev) => {
        if (!prev || Number(prev.id) !== normalizedId) return prev;
        const newPaidAmount = (parseFloat(prev.paid_amount) || 0) + additionalPaid;
        const newDueAmount = Math.max(
          0,
          (parseFloat(prev.due_amount) || 0) - additionalPaid - discountApplied
        );
        return {
          ...prev,
          payment_status: paymentStatus,
          paid_amount: newPaidAmount,
          due_amount: newDueAmount
        };
      });

      handleClosePaymentModal();
      refetch();
    } catch (error) {
      console.error('Update payment error:', error);
      showError(error.response?.data?.message || 'Failed to update payment');
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Premium Page Header */}
        <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-white shadow-lg mb-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight">Bookings</h1>
            <p className="mt-2 text-indigo-200/90 text-sm max-w-xl">
              Track check-in/out schedules, manage guest reservation requests, update booking payment settlements, and process security deposit deductions.
            </p>
          </div>
        </div>

        {/* Tabbed Booking Status Filtering */}
        <div className="flex border-b border-gray-200 mb-6 space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: '', label: 'All Bookings' },
            { id: 'pending', label: 'Pending' },
            { id: 'request_accepted', label: 'Request Accepted' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'checked_in', label: 'Checked In' },
            { id: 'checked_out', label: 'Checked Out' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => {
            const isActive = filters.status === tab.id;
            return (
              <button
                key={tab.label}
                onClick={() => handleFilterChange('status', tab.id)}
                type="button"
                className={`py-3 px-4 text-sm font-bold border-b-2 whitespace-nowrap transition-all duration-150 flex items-center gap-2 rounded-t-lg focus:outline-none ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40'
                    : 'border-transparent text-gray-550 hover:text-gray-700 hover:bg-gray-50/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by reference, guest name, or property..."
                className="w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm"
              />
              <FiSearch className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Page size:</span>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white w-full sm:w-auto"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setFilters({ status: '', search: '', page: 1, limit: 10 })}
                  type="button"
                  className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  Clear
                </button>

                <button
                  onClick={() => refetch()}
                  type="button"
                  className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Bookings Table (hidden on mobile) */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center" style={{background: 'linear-gradient(90deg, #f8faff 0%, #f0f4ff 100%)'}}>
            <div className="flex items-center gap-3">
              <FiCalendar className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-gray-800">
                Bookings
              </h2>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{bookingsData?.pagination?.totalItems || 0} total</span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center bg-white">
              <LoadingSpinner />
            </div>
          ) : bookingsData?.bookings?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr style={{background: '#f8fafc'}}>
                    <th scope="col" className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Ref & Date</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Property</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Guest</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Stay Dates</th>
                    <th scope="col" className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Amount</th>
                    <th scope="col" className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                    <th scope="col" className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsData.bookings.map((booking, idx) => (
                    <tr key={booking.id}
                      className="group border-b border-gray-50 hover:bg-blue-50/30 transition-all duration-100 cursor-default"
                      style={idx % 2 === 1 ? {background: '#fafbff'} : {}}
                    >
                      {/* Ref & Created Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-bold text-[11px] text-blue-700 tracking-wide">{booking.booking_reference}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{new Date(booking.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: '2-digit'})}</div>
                      </td>

                      {/* Property */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <ExpandablePropertyTitle title={booking.property_title} maxLength={32} />
                        {booking.is_hms_enabled && booking.hms_room_number && (
                          <span className="inline-flex items-center mt-0.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded">
                            Rm {booking.hms_room_number}
                          </span>
                        )}
                        <div className="text-[10px] text-gray-400 flex items-center mt-0.5 gap-0.5">
                          <FiMapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate max-w-[140px]">{booking.property_city}</span>
                        </div>
                      </td>

                      {/* Guest */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
                            style={{background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1d4ed8'}}>
                            {booking.guest_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'G'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-800 leading-tight">{booking.guest_name || 'Guest'}</div>
                            <div className="text-[10px] text-gray-400 truncate max-w-[110px]">{booking.guest_email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-[11px] font-semibold text-gray-700">
                          {new Date(booking.check_in_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          → {new Date(booking.check_out_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: '2-digit'})}
                        </div>
                        <div className="text-[9px] text-gray-400 font-medium mt-0.5">{booking.number_of_guests} guest{booking.number_of_guests > 1 ? 's' : ''}</div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-bold text-gray-800">৳{formatPrice(booking.total_amount)}</div>
                        <span className={`inline-flex mt-0.5 items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getPaymentStatusColor(booking.payment_status)}`}>
                          {booking.payment_status || 'pending'}
                        </span>
                        {booking.due_amount <= 0 && booking.paid_amount >= booking.total_amount ? (
                          <div className="text-[9px] text-green-600 font-bold mt-0.5">✓ Fully Paid</div>
                        ) : booking.paid_amount > 0 ? (
                          <div className="text-[9px] text-gray-500 mt-0.5">Due: ৳{formatPrice(booking.due_amount)}</div>
                        ) : null}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                          {booking.status?.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            type="button"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                            title="View Details"
                          >
                            <FiEye className="h-3.5 w-3.5" />
                          </button>

                          {(booking.payment_status === 'pending' || booking.payment_status === 'processing') && (
                            <button
                              onClick={() => handleOpenPaymentModal(booking)}
                              type="button"
                              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors focus:outline-none"
                              title="Update Payment"
                            >
                              <FiCreditCard className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {canConfirm(booking) && (
                            <button
                              onClick={() => handleBookingAction(booking.id, 'confirm')}
                              type="button"
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors focus:outline-none"
                              title="Accept Booking"
                            >
                              <FiCheck className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {canCheckIn(booking) && (
                            <button
                              onClick={() => handleBookingAction(booking.id, 'checkin')}
                              type="button"
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none"
                              title="Check In Guest"
                            >
                              <FiLogIn className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {canCheckOut(booking) && (
                            <button
                              onClick={() => handleBookingAction(booking.id, 'checkout')}
                              type="button"
                              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors focus:outline-none"
                              title="Check Out Guest"
                            >
                              <FiLogOut className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {canCancel(booking) && (
                            <button
                              onClick={() => handleBookingAction(booking.id, 'cancel')}
                              type="button"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                              title="Cancel Booking"
                            >
                              <FiX className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {(booking.status === 'checked_in' || booking.status === 'checked_out') &&
                            parseFloat(booking.security_deposit) > 0 &&
                            (!booking.security_deposit_status || booking.security_deposit_status === 'pending') && (
                            <button
                              onClick={() => handleDeductionClaim(booking)}
                              type="button"
                              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors focus:outline-none"
                              title="Claim Security Deposit"
                            >
                              <FiAlertTriangle className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCalendar className="h-6 w-6 text-gray-300" />
              </div>
              <p className="font-bold text-gray-700 text-sm">No bookings found</p>
              <p className="text-xs text-gray-400 mt-1">Adjust your search filters and try again</p>
            </div>
          )}
        </div>

        {/* Mobile Bookings Cards List (hidden on desktop) */}
        <div className="grid grid-cols-1 gap-3 md:hidden mb-6">
          {isLoading ? (
            <div className="p-12 flex justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <LoadingSpinner />
            </div>
          ) : bookingsData?.bookings?.length > 0 ? (
            bookingsData.bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Card Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                      style={{background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1d4ed8'}}>
                      {booking.guest_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'G'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">{booking.guest_name || 'Guest'}</h4>
                      <p className="text-[10px] text-blue-600 font-bold tracking-wide">{booking.booking_reference}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                    {booking.status?.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Card Body Grid */}
                <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {/* Property */}
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Property</p>
                    <p className="text-xs font-semibold text-gray-800 leading-snug">{booking.property_title}</p>
                    {booking.is_hms_enabled && booking.hms_room_number && (
                      <span className="inline-flex items-center mt-0.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-bold rounded">
                        Rm {booking.hms_room_number} · {booking.hms_room_type}
                      </span>
                    )}
                  </div>

                  {/* Check-in */}
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Check-in</p>
                    <p className="text-xs font-semibold text-gray-700">{new Date(booking.check_in_date).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                  </div>

                  {/* Check-out */}
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Check-out</p>
                    <p className="text-xs font-semibold text-gray-700">{new Date(booking.check_out_date).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                  </div>

                  {/* Total */}
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                    <p className="text-sm font-bold text-gray-900">৳{formatPrice(booking.total_amount)}</p>
                  </div>

                  {/* Payment */}
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Payment</p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getPaymentStatusColor(booking.payment_status)}`}>
                      {booking.payment_status || 'pending'}
                    </span>
                    {booking.due_amount <= 0 && booking.paid_amount >= booking.total_amount ? (
                      <p className="text-[9px] text-green-600 font-bold mt-0.5">✓ Fully Paid</p>
                    ) : booking.paid_amount > 0 ? (
                      <p className="text-[9px] text-gray-500 mt-0.5">Due: ৳{formatPrice(booking.due_amount)}</p>
                    ) : null}
                  </div>

                  {/* Guests */}
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Guests</p>
                    <p className="text-xs font-semibold text-gray-700">{booking.number_of_guests} person{booking.number_of_guests > 1 ? 's' : ''}</p>
                  </div>

                  {/* City */}
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">City</p>
                    <p className="text-xs font-semibold text-gray-700">{booking.property_city || '—'}</p>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-4 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleViewBooking(booking)}
                    type="button"
                    className="flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-600 hover:text-blue-700 rounded-xl font-semibold text-[10px] transition-all focus:outline-none"
                  >
                    <FiEye className="h-3 w-3 shrink-0" /><span>Details</span>
                  </button>

                  {(booking.payment_status === 'pending' || booking.payment_status === 'processing') && (
                    <button
                      onClick={() => handleOpenPaymentModal(booking)}
                      type="button"
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-[10px] transition-all focus:outline-none"
                    >
                      <FiCreditCard className="h-3 w-3 shrink-0" /><span>Pay</span>
                    </button>
                  )}

                  {canConfirm(booking) && (
                    <button
                      onClick={() => handleBookingAction(booking.id, 'confirm')}
                      type="button"
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-xl font-semibold text-[10px] transition-all focus:outline-none"
                    >
                      <FiCheck className="h-3 w-3 shrink-0" /><span>Accept</span>
                    </button>
                  )}

                  {canCheckIn(booking) && (
                    <button
                      onClick={() => handleBookingAction(booking.id, 'checkin')}
                      type="button"
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl font-semibold text-[10px] transition-all focus:outline-none"
                    >
                      <FiLogIn className="h-3 w-3 shrink-0" /><span>Check In</span>
                    </button>
                  )}

                  {canCheckOut(booking) && (
                    <button
                      onClick={() => handleBookingAction(booking.id, 'checkout')}
                      type="button"
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl font-semibold text-[10px] transition-all focus:outline-none"
                    >
                      <FiLogOut className="h-3 w-3 shrink-0" /><span>Check Out</span>
                    </button>
                  )}

                  {canCancel(booking) && (
                    <button
                      onClick={() => handleBookingAction(booking.id, 'cancel')}
                      type="button"
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl font-semibold text-[10px] transition-all focus:outline-none"
                    >
                      <FiX className="h-3 w-3 shrink-0" /><span>Cancel</span>
                    </button>
                  )}

                  {(booking.status === 'checked_in' || booking.status === 'checked_out') &&
                    parseFloat(booking.security_deposit) > 0 &&
                    (!booking.security_deposit_status || booking.security_deposit_status === 'pending') && (
                    <button
                      onClick={() => handleDeductionClaim(booking)}
                      type="button"
                      className="flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl font-semibold text-[10px] transition-all focus:outline-none"
                    >
                      <FiAlertTriangle className="h-3 w-3 shrink-0" /><span>Claim</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCalendar className="h-5 w-5 text-gray-300" />
              </div>
              <p className="font-bold text-gray-700 text-sm">No bookings found</p>
              <p className="text-xs text-gray-400 mt-1">Adjust your search filters</p>
            </div>
          )}
        </div>

        {/* Pagination Card */}
        {bookingsData?.pagination && bookingsData.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border border-gray-200 rounded-xl bg-white flex items-center justify-between shadow-sm">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  Showing <span className="font-bold text-gray-900">{((bookingsData.pagination.currentPage - 1) * bookingsData.pagination.itemsPerPage) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(bookingsData.pagination.currentPage * bookingsData.pagination.itemsPerPage, bookingsData.pagination.totalItems)}</span> of <span className="font-bold text-gray-900">{bookingsData.pagination.totalItems}</span> results
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', bookingsData.pagination.prevPage)}
                  disabled={!bookingsData.pagination.hasPrevPage}
                  type="button"
                  className="relative inline-flex items-center px-4 py-1.5 border border-gray-300 text-xs font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {/* Dynamically render page numbers */}
                {Array.from({ length: bookingsData.pagination.totalPages }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => handleFilterChange('page', num)}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bookingsData.pagination.currentPage === num 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'border border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => handleFilterChange('page', bookingsData.pagination.nextPage)}
                  disabled={!bookingsData.pagination.hasNextPage}
                  type="button"
                  className="relative inline-flex items-center px-4 py-1.5 border border-gray-300 text-xs font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
            
            {/* Mobile Pagination */}
            <div className="flex-1 flex justify-between sm:hidden text-xs">
              <button
                onClick={() => handleFilterChange('page', bookingsData.pagination.prevPage)}
                disabled={!bookingsData.pagination.hasPrevPage}
                type="button"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center font-bold text-gray-550">
                Page {bookingsData.pagination.currentPage} of {bookingsData.pagination.totalPages}
              </span>
              <button
                onClick={() => handleFilterChange('page', bookingsData.pagination.nextPage)}
                disabled={!bookingsData.pagination.hasNextPage}
                type="button"
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {
        showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBooking.booking_reference}
                </p>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  {/* Guest Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Guest Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Total Amount</span>
                        <span className="text-lg font-bold text-gray-900">BDT {formatPrice(selectedBooking.total_amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedBooking.guest_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedBooking.guest_email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedBooking.guest_phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Property Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Property Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Property:</span>
                        <span className="font-medium">{selectedBooking.property_title}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{selectedBooking.property_city}</span>
                      </div>
                      {selectedBooking.is_hms_enabled && selectedBooking.hms_room_number && (
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                          <span className="text-gray-600 font-bold">Room:</span>
                          <span className="font-bold text-primary-600">{selectedBooking.hms_room_number} ({selectedBooking.hms_room_type})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Booking Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">{new Date(selectedBooking.check_in_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">{new Date(selectedBooking.check_out_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Guests:</span>
                        <span className="font-medium">{selectedBooking.number_of_guests}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                          {selectedBooking.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>


                  {/* Security Deposit Information */}
                  {selectedBooking.security_deposit > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-2">Security Deposit</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Deposit Amount:</span>
                          <span className="font-bold text-gray-900">BDT {formatPrice(selectedBooking.security_deposit)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            selectedBooking.security_deposit_status === 'processed' 
                              ? 'bg-green-100 text-green-700' 
                              : selectedBooking.security_deposit_status === 'claim_requested'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {selectedBooking.security_deposit_status?.replace('_', ' ') || 'Pending'}
                          </span>
                        </div>
                        {selectedBooking.security_deposit_status === 'claim_requested' && (
                          <div className="mt-2 p-2 bg-white border border-amber-200 rounded text-xs">
                            <p className="font-bold text-amber-800 mb-1">Your Claim Request:</p>
                            <p className="text-gray-900 font-medium">Amount: ৳{formatPrice(selectedBooking.security_deposit_claim_amount)}</p>
                            <p className="text-gray-600 italic mt-1">"{selectedBooking.security_deposit_claim_reason}"</p>
                          </div>
                        )}
                        {(!selectedBooking.security_deposit_status || selectedBooking.security_deposit_status === 'pending') && 
                          parseFloat(selectedBooking.security_deposit) > 0 && 
                          (selectedBooking.status === 'checked_in' || selectedBooking.status === 'checked_out') && (
                          <button
                            onClick={() => {
                              setDeductionData({ amount: '', reason: '' });
                              setShowDeductionModal(true);
                            }}
                            className="w-full mt-2 bg-amber-600 text-white py-2 rounded text-sm font-medium hover:bg-amber-700 transition-colors flex items-center justify-center"
                          >
                            <FiAlertTriangle className="mr-2" />
                            Request Security Deduction
                          </button>
                        )}
                        {selectedBooking.security_deposit_status === 'processed' && selectedBooking.security_deposit_deduction_amount > 0 && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                            <p className="font-bold text-green-800 mb-1">Claim Processed & Received:</p>
                            <p className="text-gray-900 font-bold text-lg">৳{formatPrice(selectedBooking.security_deposit_deduction_amount)}</p>
                            <p className="text-gray-600 mt-1">This amount has been credited to your earnings.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">Payment Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium text-lg text-primary-600">BDT {formatPrice(selectedBooking.total_amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(selectedBooking.payment_status)}`}>
                          {selectedBooking.payment_status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {selectedBooking.special_requests && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-2">Special Requests</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{selectedBooking.special_requests}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment History */}
                  {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                    <div className="col-span-2">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">Payment History & Ledger</h4>

                      {/* Accounting Summary */}
                      <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-lg p-3 border-2 border-gray-200 mb-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center bg-white rounded-lg p-2 shadow-sm">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Total (DR)</div>
                            <div className="text-lg font-bold text-red-600">
                              BDT {formatPrice(selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0))}
                            </div>
                          </div>
                          <div className="text-center bg-white rounded-lg p-2 shadow-sm">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Paid (CR)</div>
                            <div className="text-lg font-bold text-green-600">
                              BDT {formatPrice(selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0))}
                            </div>
                          </div>
                          <div className="text-center bg-white rounded-lg p-2 shadow-sm">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Due</div>
                            <div className="text-lg font-bold text-orange-600">
                              BDT {formatPrice(selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) -
                                selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Transactions */}
                      <div className="bg-gray-50 rounded-lg p-2 max-h-40 overflow-y-auto">
                        <div className="space-y-1">
                          {selectedBooking.payments.map((payment, index) => (
                            <div key={payment.id} className="bg-white rounded p-2 border border-gray-200 text-xs">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <span className="font-semibold">#{index + 1}</span>
                                    <span className={`px-1.5 py-0.5 rounded ${payment.dr_amount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                      }`}>
                                      {payment.dr_amount > 0 ? 'DR' : 'CR'}
                                    </span>
                                    <span className="text-blue-600">{payment.payment_reference}</span>
                                  </div>
                                  <div className="text-gray-600 capitalize">{payment.transaction_type?.replace('_', ' ')}</div>
                                  <div className="text-gray-500">
                                    {new Date(payment.created_at).toLocaleString('en-US', {
                                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                                <div className="text-right">
                                  {payment.dr_amount > 0 && <div className="font-semibold text-red-600">DR: BDT {formatPrice(payment.dr_amount)}</div>}
                                  {payment.cr_amount > 0 && <div className="font-semibold text-green-600">CR: BDT {formatPrice(payment.cr_amount)}</div>}
                                  <div className="text-gray-600 mt-0.5">
                                    Bal: <span className={`font-semibold ${payment.running_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                      BDT {formatPrice(payment.running_balance || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Payment Update Modal */}
      {
        showPaymentModal && selectedBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[95vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">Update Payment Status</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Booking: {selectedBooking.booking_reference}
                </p>
              </div>

              <div className="px-6 py-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column - Booking Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Booking Details</h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Guest:</span>
                          <span className="font-medium">{selectedBooking.guest_name || 'Guest'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Property:</span>
                          <span className="font-medium">{selectedBooking.property_title}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-2">
                          <p className="text-xs text-red-700 mb-4">
                            Security Deposit Amount: <span className="font-bold">৳{formatPrice(selectedBooking.security_deposit || 0)}</span>
                          </p>
                          <span className="text-gray-600">Payment Status:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(selectedBooking.payment_status)}`}>
                            {selectedBooking.payment_status || 'pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary - DR/CR */}
                    {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Accounting Summary</h4>
                        <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-lg p-4 border-2 border-gray-200">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Amount (DR)</div>
                              <div className="text-xl font-bold text-red-600">
                                BDT {selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0).toFixed(0)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Receivable</div>
                            </div>
                            <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Paid Amount (CR)</div>
                              <div className="text-xl font-bold text-green-600">
                                BDT {selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0).toFixed(0)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Received</div>
                            </div>
                            <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Remaining Amount</div>
                              <div className="text-xl font-bold text-orange-600">
                                BDT {(selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) -
                                  selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0)).toFixed(0)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Due</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Transaction History */}
                    {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Transaction History ({selectedBooking.payments.length} entries)</h4>
                        <div className="bg-gray-50 rounded-lg p-2 max-h-48 overflow-y-auto">
                          <div className="space-y-1">
                            {selectedBooking.payments.map((payment, index) => (
                              <div key={payment.id} className="bg-white rounded p-2 border border-gray-200">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-semibold text-gray-700">#{index + 1}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded ${payment.dr_amount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {payment.dr_amount > 0 ? 'DR' : 'CR'}
                                      </span>
                                      <span className="text-xs font-medium text-blue-600">{payment.payment_reference}</span>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1 capitalize">
                                      {payment.transaction_type?.replace('_', ' ')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(payment.created_at).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {payment.dr_amount > 0 && (
                                      <div className="text-sm font-semibold text-red-600">DR: BDT {parseFloat(payment.dr_amount).toFixed(2)}</div>
                                    )}
                                    {payment.cr_amount > 0 && (
                                      <div className="text-sm font-semibold text-green-600">CR: BDT {parseFloat(payment.cr_amount).toFixed(2)}</div>
                                    )}
                                    <div className="text-xs text-gray-600 mt-1">
                                      Bal: <span className={`font-semibold ${payment.running_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        BDT {parseFloat(payment.running_balance || 0).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Payment Actions */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Update</h4>

                      {/* Payment Status Selector */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Status
                        </label>
                        <select
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="paid">Paid (Fully Paid)</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        <p className="mt-2 text-xs text-gray-500">
                          {paymentStatus === 'paid' && 'Mark as paid when full payment is received'}
                          {paymentStatus === 'completed' && 'Booking and payment both completed'}
                          {paymentStatus === 'pending' && 'Payment is awaiting completion'}
                          {paymentStatus === 'processing' && 'Partial payment received or being processed'}
                          {paymentStatus === 'failed' && 'Payment attempt failed'}
                          {paymentStatus === 'cancelled' && 'Payment was cancelled'}
                          {paymentStatus === 'refunded' && 'Payment has been refunded'}
                        </p>
                      </div>

                      {/* Partial Payment */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {selectedBooking.total_paid > 0 ? 'Additional Payment Amount (Optional)' : 'Partial Payment Amount (Optional)'}
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">BDT </span>
                            <input
                              type="number"
                              min="0.01"
                              max={(() => {
                                if (selectedBooking.payments && selectedBooking.payments.length > 0) {
                                  const totalDR = selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0);
                                  const totalCR = selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0);
                                  return Math.max(0, totalDR - totalCR);
                                }
                                return selectedBooking.due_amount || selectedBooking.total_amount || 0;
                              })()}
                              step="0.01"
                              placeholder={(() => {
                                if (selectedBooking.payments && selectedBooking.payments.length > 0) {
                                  const totalDR = selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0);
                                  const totalCR = selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0);
                                  const remaining = Math.max(0, totalDR - totalCR);
                                  return remaining > 0 ? `Max: BDT ${remaining.toFixed(2)}` : 'Fully Paid';
                                }
                                return 'Enter partial payment';
                              })()}
                              value={partialAmount}
                              onChange={(e) => setPartialAmount(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              disabled={(() => {
                                if (selectedBooking.payments && selectedBooking.payments.length > 0) {
                                  const totalDR = selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0);
                                  const totalCR = selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0);
                                  return (totalDR - totalCR) <= 0;
                                }
                                return false;
                              })()}
                            />
                          </div>
                          {(() => {
                            const remainingAmount = selectedBooking.payments && selectedBooking.payments.length > 0
                              ? Math.max(0, selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) -
                                selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0))
                              : (selectedBooking.due_amount || 0);

                            return remainingAmount > 0 && (
                              <button
                                type="button"
                                onClick={() => setPartialAmount(remainingAmount.toFixed(2))}
                                className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 whitespace-nowrap"
                              >
                                Pay Full Due
                              </button>
                            );
                          })()}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedBooking.payments && selectedBooking.payments.length > 0
                            ? (() => {
                              const remaining = Math.max(0,
                                selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) -
                                selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0)
                              );
                              return remaining > 0
                                ? `Enter amount received (max BDT ${remaining.toFixed(2)})`
                                : 'This booking is already fully paid';
                            })()
                            : 'Leave empty if full payment or not applicable'
                          }
                        </p>
                        {partialAmount && selectedBooking.payments && selectedBooking.payments.length > 0 && (() => {
                          const totalDR = selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0);
                          const totalCR = selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0);
                          const remainingAmount = Math.max(0, totalDR - totalCR); // Ensure non-negative
                          const enteredAmount = parseFloat(partialAmount);

                          // Check if invalid: NaN, <= 0, or > remaining
                          if (remainingAmount <= 0) {
                            return (
                              <div className="mt-2 flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-green-800">Fully Paid!</p>
                                  <p className="text-xs text-green-700 mt-1">
                                    This booking is already fully paid. No additional payment needed.
                                  </p>
                                </div>
                              </div>
                            );
                          }

                          if (isNaN(enteredAmount) || enteredAmount <= 0 || enteredAmount > remainingAmount) {
                            return (
                              <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-red-800">Invalid Payment Amount!</p>
                                  <p className="text-xs text-red-700 mt-1">
                                    Payment amount must be between <strong>BDT 0.01</strong> to <strong>BDT {remainingAmount.toFixed(2)}</strong>
                                  </p>
                                  <p className="text-xs text-red-600 mt-1">
                                    <strong>Remaining Amount</strong> = Total DR (BDT {totalDR.toFixed(2)}) - Total CR (BDT {totalCR.toFixed(2)}) = <strong>BDT {remainingAmount.toFixed(2)}</strong>
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      {/* Discount */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount Amount (Optional)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">BDT </span>
                          <input
                            type="number"
                            min="0"
                            max={selectedBooking.total_amount}
                            step="0.01"
                            placeholder="Enter discount amount"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        {discountAmount && parseFloat(discountAmount) > 0 && (
                          <div className="mt-2">
                            <input
                              type="text"
                              placeholder="Reason for discount"
                              value={discountReason}
                              onChange={(e) => setDiscountReason(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Apply discount to reduce the total amount
                        </p>
                      </div>

                      {/* Payment Summary */}
                      {(partialAmount || discountAmount) && (() => {
                        const currentRemaining = selectedBooking.payments && selectedBooking.payments.length > 0
                          ? (selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) -
                            selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0))
                          : (selectedBooking.due_amount || selectedBooking.total_amount);

                        const totalDR = selectedBooking.payments && selectedBooking.payments.length > 0
                          ? selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0)
                          : selectedBooking.total_amount;

                        const totalCR = selectedBooking.payments && selectedBooking.payments.length > 0
                          ? selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0)
                          : 0;

                        return (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Payment Summary</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-blue-700">Total Amount (DR):</span>
                                <span className="font-medium">BDT {totalDR.toFixed(2)}</span>
                              </div>
                              {totalCR > 0 && (
                                <div className="flex justify-between text-green-700">
                                  <span>Already Paid (CR):</span>
                                  <span className="font-medium">BDT {totalCR.toFixed(2)}</span>
                                </div>
                              )}
                              {discountAmount && parseFloat(discountAmount) > 0 && (
                                <div className="flex justify-between text-purple-700">
                                  <span>New Discount:</span>
                                  <span className="font-medium">- BDT {parseFloat(discountAmount).toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between border-t border-blue-200 pt-1 font-semibold">
                                <span className="text-blue-900">Current Due:</span>
                                <span className="text-blue-900">
                                  BDT {(currentRemaining - (parseFloat(discountAmount) || 0)).toFixed(2)}
                                </span>
                              </div>
                              {partialAmount && parseFloat(partialAmount) > 0 && (
                                <>
                                  <div className="flex justify-between text-blue-700">
                                    <span>Current Payment (CR):</span>
                                    <span className="font-medium">BDT {parseFloat(partialAmount).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between border-t border-blue-200 pt-1 font-semibold text-orange-700">
                                    <span>Will Remain:</span>
                                    <span>
                                      BDT {((currentRemaining - (parseFloat(discountAmount) || 0)) - parseFloat(partialAmount)).toFixed(2)}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0 sticky bottom-0">
                <button
                  onClick={handleClosePaymentModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePaymentStatus}
                  disabled={(() => {
                    if (!paymentStatus) return true;

                    // Check if partial amount is valid (between 0.01 and remaining amount)
                    if (partialAmount && selectedBooking.payments && selectedBooking.payments.length > 0) {
                      const remainingAmount = Math.max(0,
                        selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) -
                        selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0)
                      );
                      const enteredAmount = parseFloat(partialAmount);
                      // Invalid if: NaN, <= 0, > remaining, or remaining is 0
                      if (isNaN(enteredAmount) || enteredAmount <= 0 || enteredAmount > remainingAmount || remainingAmount <= 0) return true;
                    }

                    return false;
                  })()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Update Payment</span>
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* Deduction Claim Modal */}
      {showDeductionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Security Deduction</h3>
                  <p className="text-sm text-gray-500">Booking Ref: #{selectedBooking?.booking_reference}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeductionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-sm">
                  <p className="text-gray-500 font-medium">Security Deposit Held</p>
                  <p className="text-xl font-bold text-gray-900">BDT {parseFloat(selectedBooking?.security_deposit || 0).toFixed(2)}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>Maximum possible</p>
                  <p>deduction amount</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm italic">
                <FiAlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>Are you sure you want to submit a deduction claim for this booking?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deduction Amount (BDT)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">BDT</span>
                    <input 
                      type="number"
                      value={deductionData.amount}
                      onChange={(e) => setDeductionData({ ...deductionData, amount: e.target.value })}
                      className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                      placeholder="Enter amount (e.g. 1000)"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reason (Optional)</label>
                  <textarea 
                    value={deductionData.reason}
                    onChange={(e) => setDeductionData({ ...deductionData, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none min-h-[80px]"
                    placeholder="Describe damages if any..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowDeductionModal(false)}
                className="px-6 py-2.5 font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                disabled={isSubmittingDeduction}
              >
                Cancel
              </button>
              <button 
                onClick={submitDeductionClaim}
                disabled={isSubmittingDeduction || !deductionData.amount || !deductionData.reason}
                className="px-8 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2 disabled:bg-gray-300 disabled:shadow-none"
              >
                {isSubmittingDeduction ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : <FiCheck className="w-5 h-5" />}
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default PropertyOwnerBookings;
