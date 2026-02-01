import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiCalendar, FiSearch, FiFilter, FiEye, FiUser, FiHome, FiDollarSign, FiMapPin, FiX, FiPrinter } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminBookings = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch bookings
  const { data: bookingsData, isLoading, refetch } = useQuery(
    ['admin-bookings', filters],
    () => api.get(`/admin/bookings?${new URLSearchParams(filters).toString()}`),
    {
      select: (response) => response.data?.data || { bookings: [], pagination: {} },
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
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

  const handleViewBooking = async (booking) => {
    try {
      // Fetch payment history for the booking
      const response = await api.get(`/admin/bookings/${booking.id}/payments`);
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

  const handleCloseModal = () => {
    setSelectedBooking(null);
    setShowDetailsModal(false);
  };

  const handlePrintBooking = () => {
    if (!selectedBooking) return;

    const printWindow = window.open('', '_blank');
    const nights = Math.ceil((new Date(selectedBooking.check_out_date) - new Date(selectedBooking.check_in_date)) / (1000 * 60 * 60 * 24));
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking Details - ${selectedBooking.booking_reference}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 { 
              color: #2563eb; 
              font-size: 28px;
              margin-bottom: 10px;
            }
            .header p { 
              color: #666; 
              font-size: 14px;
            }
            .booking-ref {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
              text-align: center;
            }
            .booking-ref h2 {
              font-size: 24px;
              color: #1f2937;
              margin-bottom: 5px;
            }
            .booking-ref p {
              color: #6b7280;
              font-size: 14px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e5e7eb;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
            }
            .info-item {
              margin-bottom: 15px;
            }
            .info-label {
              color: #6b7280;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .info-value {
              color: #1f2937;
              font-size: 16px;
              font-weight: 500;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-confirmed { background: #d1fae5; color: #065f46; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .status-checked_in { background: #dbeafe; color: #1e40af; }
            .status-checked_out { background: #f3f4f6; color: #374151; }
            .payment-box {
              background: #f9fafb;
              border: 2px solid #e5e7eb;
              padding: 20px;
              border-radius: 8px;
            }
            .payment-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .payment-total {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              border-top: 2px solid #d1d5db;
              padding-top: 10px;
              margin-top: 10px;
            }
            .special-requests {
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              border-radius: 4px;
              font-size: 14px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Keyhost Homes</h1>
            <p>Booking Confirmation & Details</p>
          </div>

          <div class="booking-ref">
            <h2>${selectedBooking.booking_reference}</h2>
            <p>Created on ${new Date(selectedBooking.created_at).toLocaleString()}</p>
          </div>

          <div class="section">
            <div class="section-title">Guest Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">${selectedBooking.guest_first_name} ${selectedBooking.guest_last_name}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${selectedBooking.guest_email}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${selectedBooking.guest_phone || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Number of Guests</div>
                <div class="info-value">${selectedBooking.number_of_guests} Guest${selectedBooking.number_of_guests > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Property Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Property Name</div>
                <div class="info-value">${selectedBooking.property_title}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Location</div>
                <div class="info-value">${selectedBooking.property_city}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Booking Dates</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Check-in Date</div>
                <div class="info-value">${new Date(selectedBooking.check_in_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Check-out Date</div>
                <div class="info-value">${new Date(selectedBooking.check_out_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Duration</div>
                <div class="info-value">${nights} Night${nights > 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Payment Information</div>
            <div class="payment-box">
              <div class="payment-row">
                <span>Total Amount:</span>
                <span class="payment-total">BDT ${selectedBooking.total_amount}</span>
              </div>
              <div class="payment-row">
                <span>Payment Status:</span>
                <span style="color: ${selectedBooking.payment_status === 'paid' ? '#065f46' : '#92400e'}; font-weight: 600;">
                  ${selectedBooking.payment_status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Booking Status</div>
            <span class="status-badge status-${selectedBooking.status}">
              ${selectedBooking.status?.replace('_', ' ')}
            </span>
          </div>

          ${selectedBooking.special_requests ? `
          <div class="section">
            <div class="section-title">Special Requests</div>
            <div class="special-requests">
              ${selectedBooking.special_requests}
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>This is an official booking confirmation from Keyhost Homes</p>
            <p>For inquiries, please contact us at support@keyhosthomes.com</p>
            <p>Printed on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all bookings</p>
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
                              {booking.guest_first_name?.[0]}{booking.guest_last_name?.[0]}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.guest_first_name} {booking.guest_last_name}
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
                        <div className="text-sm text-gray-500">
                          {booking.payment_status || 'Pending'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md hover:bg-primary-50 transition-colors"
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4 mr-1" />
                          View
                        </button>
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

        {/* Booking Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                aria-hidden="true"
                onClick={handleCloseModal}
              ></div>

              {/* Center modal */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                {/* Header */}
                <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white" id="modal-title">
                    Booking Details
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="bg-white px-6 py-6">
                  <div className="space-y-6">
                    {/* Booking Reference */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Booking Reference</h4>
                      <p className="text-xl font-bold text-gray-900">{selectedBooking.booking_reference}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Created on {new Date(selectedBooking.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Guest Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiUser className="mr-2" />
                        Guest Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedBooking.guest_first_name} {selectedBooking.guest_last_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">{selectedBooking.guest_email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{selectedBooking.guest_phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Number of Guests</p>
                          <p className="text-sm font-medium text-gray-900">{selectedBooking.number_of_guests}</p>
                        </div>
                      </div>
                    </div>

                    {/* Property Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiHome className="mr-2" />
                        Property Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Property Name</p>
                          <p className="text-sm font-medium text-gray-900">{selectedBooking.property_title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            <FiMapPin className="w-3 h-3 mr-1" />
                            {selectedBooking.property_city}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Dates */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiCalendar className="mr-2" />
                        Booking Dates
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Check-in</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(selectedBooking.check_in_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Check-out</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(selectedBooking.check_out_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="text-sm font-medium text-gray-900">
                            {Math.ceil((new Date(selectedBooking.check_out_date) - new Date(selectedBooking.check_in_date)) / (1000 * 60 * 60 * 24))} nights
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <FiDollarSign className="mr-2" />
                        Payment Information
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Total Amount</span>
                          <span className="text-lg font-bold text-gray-900">BDT {selectedBooking.total_amount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Payment Status</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            selectedBooking.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedBooking.payment_status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Status */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Booking Status</h4>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                          {selectedBooking.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Payment History */}
                    {selectedBooking.payments && selectedBooking.payments.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <FiDollarSign className="mr-2" />
                          Payment History & Ledger
                        </h4>
                        
                        {/* Accounting Summary */}
                        <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-lg p-4 border-2 border-gray-200 mb-3">
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
                              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Remaining</div>
                              <div className="text-xl font-bold text-orange-600">
                                BDT {(selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) - 
                                  selectedBooking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0)).toFixed(0)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Due</div>
                            </div>
                          </div>
                        </div>

                        {/* Transaction History */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Transaction History ({selectedBooking.payments.length} entries)</h5>
                          <div className="bg-gray-50 rounded-lg p-2 max-h-48 overflow-y-auto">
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
                      </div>
                    )}

                    {/* Special Requests */}
                    {selectedBooking.special_requests && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          {selectedBooking.special_requests}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <button
                    onClick={handlePrintBooking}
                    className="btn-primary inline-flex items-center"
                  >
                    <FiPrinter className="mr-2" />
                    Print Booking
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
