import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

import LeaveReviewModal from '../../components/reviews/LeaveReviewModal';

const GuestBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filter, pagination.currentPage]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10
      });

      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await api.get(`/guest/bookings?${params}`);
      setBookings(response.data.data.bookings);
      setPagination(response.data.data.pagination);
    } catch (err) {
      showError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, reason) => {
    try {
      const response = await api.patch(`/guest/bookings/${bookingId}/cancel`, { reason });
      showSuccess('Booking cancelled successfully');

      // Refresh the bookings list
      fetchBookings();
    } catch (err) {
      console.error('Cancel booking error:', err);
      showError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const startReviewSuccess = () => {
    fetchBookings(); // Refresh to update is_reviewed status
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">Manage your property bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="border-b border-gray-200 min-w-max md:min-w-0">
            <nav className="-mb-px flex space-x-4 md:space-x-8 overflow-x-auto">
              {[
                { key: 'all', label: 'All Bookings' },
                { key: 'pending', label: 'Pending' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'checked_in', label: 'Active' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by booking your first property.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow overflow-hidden w-full">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start md:items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                      {booking.property_image && (
                        <img
                          src={booking.property_image}
                          alt={booking.property_title}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-lg font-semibold text-gray-900 line-clamp-2">
                          {booking.property_title}
                        </h3>
                        <p className="text-xs md:text-base text-gray-600 mt-1">{booking.property_city}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Booking #{booking.booking_reference}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:flex-col md:items-end md:text-right gap-2 md:gap-0 flex-shrink-0">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <p className="text-base md:text-lg font-semibold text-gray-900">
                        ${booking.total_amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Check-in</p>
                      <p className="text-sm text-gray-900">{formatDate(booking.check_in_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Check-out</p>
                      <p className="text-sm text-gray-900">{formatDate(booking.check_out_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Guests</p>
                      <p className="text-sm text-gray-900">{booking.number_of_guests} guests</p>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Special Requests</p>
                      <p className="text-sm text-gray-900">{booking.special_requests}</p>
                    </div>
                  )}

                  <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <button
                      onClick={() => navigate(`/guest/bookings/${booking.id}`)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      View Details
                    </button>

                    {booking.status === 'checked_out' && (
                      !booking.is_reviewed ? (
                        <button
                          onClick={() => handleOpenReviewModal(booking)}
                          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Leave Review
                        </button>
                      ) : (
                        <span className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg text-center cursor-default">
                          Reviewed
                        </span>
                      )
                    )}

                    {(() => {
                      const canCancel = (booking.status === 'confirmed' || booking.status === 'pending') &&
                        new Date(booking.check_in_date).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0);
                      return canCancel;
                    })() && (
                        <button
                          onClick={() => {
                            const reason = prompt('Please provide a reason for cancellation:');
                            if (reason) {
                              handleCancelBooking(booking.id, reason);
                            }
                          }}
                          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${page === pagination.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      <LeaveReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        booking={selectedBooking}
        onSuccess={startReviewSuccess}
      />
    </div>
  );
};

export default GuestBookings;
