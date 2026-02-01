import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const GuestBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      console.log('Fetching booking details for ID:', id);
      const response = await api.get(`/guest/bookings/${id}`);
      console.log('Booking response:', response.data);
      const bookingData = response.data.data?.booking || response.data.booking;
      console.log('Payment data:', bookingData?.payments);
      console.log('Payment status:', bookingData?.payment_status);
      setBooking(bookingData);
    } catch (err) {
      console.error('Fetch booking error:', err);
      showError('Failed to fetch booking details');
      navigate('/guest/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await api.patch(`/guest/bookings/${id}/cancel`, {
        reason: 'Cancelled by guest'
      });
      showSuccess('Booking cancelled successfully');
      
      // Update booking with the response data
      if (response.data?.data?.booking) {
        setBooking(response.data.data.booking);
      } else {
        // Fallback: refresh booking data if response doesn't include updated booking
        fetchBooking();
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
      showError(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!booking) return <div className="text-center p-8">Booking not found</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
        return 'bg-red-100 text-red-800';
      case 'refunded': 
        return 'bg-purple-100 text-purple-800';
      case 'cancelled': 
        return 'bg-gray-100 text-gray-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'failed': return 'Failed';
      case 'refunded': return 'Refunded';
      case 'cancelled': return 'Cancelled';
      default: return status ? status.toUpperCase() : 'Unknown';
    }
  };

  const getPaymentMethodDisplay = (method) => {
    const methodMap = {
      'bkash': 'bKash',
      'nagad': 'Nagad',
      'rocket': 'Rocket',
      'bank_transfer': 'Bank Transfer',
      'credit_card': 'Credit Card',
      'cash': 'Cash on Arrival'
    };
    return methodMap[method?.toLowerCase()] || method;
  };

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-section, #printable-section * {
            visibility: visible;
          }
          #printable-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-show {
            display: block !important;
          }
        }
        .print-show {
          display: none;
        }
      `}</style>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 no-print">
            <button
              onClick={() => navigate('/guest/bookings')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Bookings
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          </div>

        <div id="printable-section" className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Print Header - Only visible during print */}
          <div className="print-show px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmation</h1>
            <p className="text-gray-600">Keyhost Homes - Booking System</p>
          </div>

          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Booking #{booking.id}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Reference: {booking.booking_reference}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Property Name</label>
                    <p className="text-gray-900">{booking.property_title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-gray-900">{booking.property_address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Property Type</label>
                    <p className="text-gray-900">{booking.property_type}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-in Date</label>
                    <p className="text-gray-900">{new Date(booking.check_in_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Check-out Date</label>
                    <p className="text-gray-900">{new Date(booking.check_out_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Number of Guests</label>
                    <p className="text-gray-900">{booking.number_of_guests}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="font-bold text-red-600">BDT {booking.total_amount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500 block mb-2">Payment Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(booking.payment_status)}`}>
                    {getPaymentStatusText(booking.payment_status)}
                  </span>
                </div>
                
                {/* Payment Method - from payments table or fallback to booking data */}
                {(booking.payments && booking.payments.length > 0 && booking.payments[0].payment_method) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Payment Method</label>
                    <p className="text-gray-900 font-medium">{getPaymentMethodDisplay(booking.payments[0].payment_method)}</p>
                  </div>
                )}
                
                {/* Payment Date */}
                {booking.payments && booking.payments.length > 0 && booking.payments[0].payment_date && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Payment Date</label>
                    <p className="text-gray-900 font-medium">
                      {new Date(booking.payments[0].payment_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {/* Payment Reference */}
                {booking.payments && booking.payments.length > 0 && booking.payments[0].payment_reference && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Payment Reference</label>
                    <p className="text-gray-900 font-mono text-sm">{booking.payments[0].payment_reference}</p>
                  </div>
                )}
                
                {/* Owner Accepted - Payment Required Warning */}
                {booking.status === 'pending' && booking.confirmed_at && booking.payment_status !== 'paid' && (
                  <div className="col-span-full bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Owner Accepted Your Request!</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Property owner has accepted your booking request. Please make payment to confirm your booking.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Pending Payment Warning (for confirmed bookings with pending payment) */}
                {booking.payment_status === 'pending' && booking.status === 'confirmed' && (
                  <div className="col-span-full bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Payment Pending</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          {booking.payments && booking.payments.length > 0 && booking.payments[0].payment_method 
                            ? `Please complete your payment using ${getPaymentMethodDisplay(booking.payments[0].payment_method)} as soon as possible.`
                            : 'Please complete your payment promptly to confirm your booking.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Special Requests */}
            {booking.special_requests && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Requests</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{booking.special_requests}</p>
              </div>
            )}

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History & Ledger</h3>
                
                {/* Accounting Summary */}
                <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-green-50 rounded-lg p-4 border-2 border-gray-200 mb-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Amount (DR)</div>
                      <div className="text-xl font-bold text-red-600">
                        BDT {booking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Receivable</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Paid Amount (CR)</div>
                      <div className="text-xl font-bold text-green-600">
                        BDT {booking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Received</div>
                    </div>
                    <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Remaining Amount</div>
                      <div className="text-xl font-bold text-orange-600">
                        BDT {(booking.payments.reduce((sum, p) => sum + parseFloat(p.dr_amount || 0), 0) - 
                          booking.payments.reduce((sum, p) => sum + parseFloat(p.cr_amount || 0), 0)).toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Due</div>
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Transaction History ({booking.payments.length} entries)</h4>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {booking.payments.map((payment, index) => (
                        <div key={payment.id} className="bg-white rounded p-3 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-700">#{index + 1}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  payment.dr_amount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                }`}>
                                  {payment.dr_amount > 0 ? 'DR' : 'CR'}
                                </span>
                                <span className="text-xs font-medium text-blue-600">{payment.payment_reference}</span>
                              </div>
                              <div className="text-xs text-gray-600 capitalize">
                                {payment.transaction_type?.replace('_', ' ') || payment.payment_type}
                              </div>
                              {payment.notes && (
                                <div className="text-xs text-gray-500 mt-1">{payment.notes}</div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(payment.created_at).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <div className="text-right">
                              {payment.dr_amount > 0 && (
                                <div className="text-sm font-semibold text-red-600 mb-1">
                                  DR: BDT {parseFloat(payment.dr_amount).toFixed(2)}
                                </div>
                              )}
                              {payment.cr_amount > 0 && (
                                <div className="text-sm font-semibold text-green-600 mb-1">
                                  CR: BDT {parseFloat(payment.cr_amount).toFixed(2)}
                                </div>
                              )}
                              <div className="text-xs text-gray-600">
                                Balance: <span className={`font-semibold ${payment.running_balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                  BDT {parseFloat(payment.running_balance || 0).toFixed(2)}
                                </span>
                              </div>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${
                                payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {booking.status === 'pending' && !booking.confirmed_at && (
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Waiting for Owner Confirmation</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your booking request has been submitted. Please wait for the property owner to accept your booking request. Once accepted, you'll be able to make payment.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Owner Accepted - Payment Required */}
            {booking.status === 'pending' && booking.confirmed_at && booking.payment_status !== 'paid' && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Owner Accepted Your Request!</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Property owner has accepted your booking request. Please make payment to confirm your booking.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {booking.status === 'confirmed' && booking.payment_status === 'pending' && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800">Booking Confirmed - Payment Required</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your booking has been confirmed. Please complete the payment to finalize your reservation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-4 no-print">
              {(booking.status === 'pending' || 
                (booking.status === 'confirmed' && new Date(booking.check_in_date).setHours(0,0,0,0) > new Date().setHours(0,0,0,0))) && (
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Cancel Booking
                </button>
              )}
              
              {/* Payment Button - Show when owner accepted (confirmed_at set) and payment pending */}
              {booking.status === 'pending' && booking.confirmed_at && booking.payment_status !== 'paid' && (
                <button
                  onClick={() => navigate(`/payment/${booking.id}`)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium"
                >
                  Make Payment to Confirm
                </button>
              )}
              
              {/* Payment Button - Show when confirmed and payment pending */}
              {booking.status === 'confirmed' && booking.payment_status === 'pending' && (
                <button
                  onClick={() => navigate(`/payment/${booking.id}`)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 font-medium"
                >
                  Make Payment
                </button>
              )}
              
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => navigate(`/properties/${booking.property_id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  View Property
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Booking
              </button>
            </div>

            {/* Print Footer - Only visible during print */}
            <div className="print-show mt-8 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Thank you for choosing Keyhost Homes. For any queries, please contact us at support@keyhosthomes.com
              </p>
              <p className="text-xs text-gray-500 text-center mt-2">
                Printed on {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default GuestBookingDetail;
