import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiSearch, FiFilter, FiEye, FiUser, FiHome, FiDollarSign, FiMapPin, FiCheck, FiX, FiCreditCard } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const PropertyOwnerBookings = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    search: '',
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
      [key]: value,
      page: 1
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
          confirm: 'confirmed',
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Manage bookings for your properties</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Bookings
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by reference, guest name, or property..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', search: '', page: 1, limit: 10 })}
                className="btn-secondary w-full"
              >
                <FiFilter className="inline mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bookings ({bookingsData?.pagination?.totalItems || 0})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : bookingsData?.bookings?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookingsData.bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.booking_reference}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-xs">
                              {booking.guest_name?.split(' ').map(n => n[0]).join('') || 'G'}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.guest_name || 'Guest'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.guest_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.property_title}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiMapPin className="w-3 h-3 mr-1" />
                            {booking.property_city}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.check_in_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {new Date(booking.check_out_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.number_of_guests} guests
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <FiDollarSign className="w-3 h-3 mr-1" />
                          <span className="font-bold text-red-600">BDT {booking.total_amount}</span>
                        </div>
                        {booking.due_amount <= 0 && booking.paid_amount >= booking.total_amount ? (
                          <div className="flex items-center gap-1 text-xs font-semibold text-green-600 mt-0.5">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Fully Paid ✓
                          </div>
                        ) : booking.paid_amount > 0 && booking.paid_amount < booking.total_amount ? (
                          <div className="text-xs text-green-600 mt-0.5">
                            Paid: BDT {parseFloat(booking.paid_amount).toFixed(0)} | Due: BDT {parseFloat(booking.due_amount).toFixed(0)}
                          </div>
                        ) : null}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                            {booking.payment_status || 'pending'}
                          </span>
                          {(booking.payment_status === 'pending' || booking.payment_status === 'processing') && (
                            <button
                              onClick={() => handleOpenPaymentModal(booking)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Update Payment"
                            >
                              <FiCreditCard className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewBooking(booking)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          
                          {canConfirm(booking) && (
                            <button
                              onClick={() => handleBookingAction(booking.id, 'confirm')}
                              className="text-green-600 hover:text-green-900"
                              title="Confirm Booking"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}
                          
                          {canCheckIn(booking) && (
                            <button
                              onClick={() => handleBookingAction(booking.id, 'checkin')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Check In"
                            >
                              <FiUser className="w-4 h-4" />
                            </button>
                          )}
                          
                          {canCheckOut(booking) && (
                            <button
                              onClick={() => handleBookingAction(booking.id, 'checkout')}
                              className="text-purple-600 hover:text-purple-900"
                              title="Check Out"
                            >
                              <FiUser className="w-4 h-4" />
                            </button>
                          )}
                          
                          {canCancel(booking) && (
                            <button
                              onClick={() => handleBookingAction(booking.id, 'cancel')}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel Booking"
                            >
                              <FiX className="w-4 h-4" />
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
            <div className="text-center py-12">
              <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}

          {/* Pagination */}
          {bookingsData?.pagination && bookingsData.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((bookingsData.pagination.currentPage - 1) * bookingsData.pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(bookingsData.pagination.currentPage * bookingsData.pagination.itemsPerPage, bookingsData.pagination.totalItems)} of{' '}
                  {bookingsData.pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', bookingsData.pagination.prevPage)}
                    disabled={!bookingsData.pagination.hasPrevPage}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {bookingsData.pagination.currentPage} of {bookingsData.pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handleFilterChange('page', bookingsData.pagination.nextPage)}
                    disabled={!bookingsData.pagination.hasNextPage}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
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

                {/* Payment Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-2">Payment Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-lg text-primary-600">BDT {selectedBooking.total_amount}</span>
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
                            BDT {selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0).toFixed(0)}
                          </div>
                        </div>
                        <div className="text-center bg-white rounded-lg p-2 shadow-sm">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Paid (CR)</div>
                          <div className="text-lg font-bold text-green-600">
                            BDT {selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0).toFixed(0)}
                          </div>
                        </div>
                        <div className="text-center bg-white rounded-lg p-2 shadow-sm">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Due</div>
                          <div className="text-lg font-bold text-orange-600">
                            BDT {(selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) - 
                              selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0)).toFixed(0)}
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
                                  <span className={`px-1.5 py-0.5 rounded ${
                                    payment.dr_amount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
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
                                {payment.dr_amount > 0 && <div className="font-semibold text-red-600">DR: BDT {parseFloat(payment.dr_amount).toFixed(2)}</div>}
                                {payment.cr_amount > 0 && <div className="font-semibold text-green-600">CR: BDT {parseFloat(payment.cr_amount).toFixed(2)}</div>}
                                <div className="text-gray-600 mt-0.5">
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
      )}

      {/* Payment Update Modal */}
      {showPaymentModal && selectedBooking && (
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
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      payment.dr_amount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
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
      )}
    </div>
  );
};

export default PropertyOwnerBookings;
