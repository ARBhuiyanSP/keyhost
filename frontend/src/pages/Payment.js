import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useToast from '../hooks/useToast';
import { formatPrice } from '../utils/textUtils';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();

  // Extension state from navigation (passed by GuestBookingDetail)
  const navState = location.state || {};
  const isExtensionNav = navState.isExtension === true;
  const navExtraAmount = navState.extra_amount_due ? parseFloat(navState.extra_amount_due) : null;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [pointsData, setPointsData] = useState(null);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
      fetchPointsData();
    }
  }, [bookingId]);

  useEffect(() => {
    if (booking) {
      if (usePoints && pointsData) {
        calculatePointsDiscount(pointsData, booking.total_amount);
      } else {
        setPointsToRedeem(0);
        setPointsDiscount(0);
        setFinalAmount(booking.total_amount);
      }
    }
  }, [booking, pointsData, usePoints]);

  const fetchPointsData = async () => {
    try {
      const response = await api.get('/rewards-points/my-points');
      const data = response.data.data;
      setPointsData(data);
    } catch (err) {
      console.error('Failed to fetch points data:', err);
    }
  };

  const calculatePointsDiscount = (pointsInfo, bookingAmount) => {
    if (!pointsInfo || !pointsInfo.settings) {
      setPointsToRedeem(0);
      setPointsDiscount(0);
      setFinalAmount(bookingAmount);
      return;
    }

    const settings = pointsInfo.settings;
    const availablePoints = pointsInfo.points?.current_balance || 0;

    // Calculate max redeemable points
    const maxFromBalance = availablePoints;
    const maxFromBooking = Math.floor(bookingAmount * settings.points_per_taka);
    const maxFromLimit = settings.max_points_per_booking || Infinity;

    const maxRedeemable = Math.min(maxFromBalance, maxFromBooking, maxFromLimit);

    if (maxRedeemable < (settings.min_points_to_redeem || 0)) {
      setPointsToRedeem(0);
      setPointsDiscount(0);
      setFinalAmount(bookingAmount);
      return;
    }

    // Auto-calculate max usable points
    const discount = maxRedeemable / settings.points_per_taka;
    if (discount <= bookingAmount) {
      setPointsToRedeem(maxRedeemable);
      setPointsDiscount(discount);
      setFinalAmount(Math.max(0, bookingAmount - discount));
    } else {
      const usablePoints = Math.floor(bookingAmount * settings.points_per_taka);
      setPointsToRedeem(usablePoints);
      setPointsDiscount(bookingAmount);
      setFinalAmount(0);
    }
  };

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/guest/bookings/${bookingId}`);
      const bookingData = response.data.data.booking;
      setBooking(bookingData);

      // Calculate final amount after points discount
      if (pointsData) {
        calculatePointsDiscount(pointsData, bookingData.total_amount);
      } else {
        setFinalAmount(bookingData.total_amount);
      }

      const isExtensionPayment = bookingData.payment_status === 'pending_extra';

      if (isExtensionPayment) {
        // Extension payment: allowed if booking is confirmed or checked_in
        if (!['confirmed', 'checked_in'].includes(bookingData.status)) {
          showError('Invalid booking status for extension payment');
          navigate(`/guest/bookings/${bookingId}`);
          return;
        }
        // OK — let through
        return;
      }

      // Original booking payment flow
      if (bookingData.status !== 'request_accepted') {
        if (bookingData.status === 'confirmed') {
          if (bookingData.payment_status !== 'paid') {
            showError('Booking is already confirmed. Please check booking details.');
          } else {
            showError('Payment has already been completed');
          }
          navigate(`/guest/bookings/${bookingId}`);
          return;
        }
        showError('Invalid booking status for payment');
        navigate(`/guest/bookings/${bookingId}`);
        return;
      }

      // Check if owner has accepted the booking request
      if (!bookingData.confirmed_at) {
        showError('Property owner has not accepted this booking request yet. Please wait for owner approval.');
        navigate(`/guest/bookings/${bookingId}`);
        return;
      }

      // Check if payment already completed
      if (bookingData.payment_status === 'paid') {
        showError('Payment has already been completed');
        navigate(`/guest/bookings/${bookingId}`);
        return;
      }
    } catch (err) {
      showError('Failed to fetch booking details');
      navigate('/guest/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (paymentMethod) => {
    try {
      setProcessing(true);



      // Handle SSLCommerz payment separately
      if (paymentMethod === 'SSLCommerz') {
        const { data: sslSettings } = await api.get('/sslcommerz/settings');
        if (sslSettings) {
          // For extensions: charge only the extra amount, not the full total
          const amountToCharge = isExtensionPayment && payableAmount
            ? (usePoints ? Math.max(0, payableAmount - pointsDiscount) : payableAmount)
            : (usePoints ? (finalAmount || booking.total_amount) : booking.total_amount);

          const sslRes = await api.post('/sslcommerz/ssl-request', {
            booking_id: bookingId,
            amount: amountToCharge,
            customer_name: user?.name,
            customer_email: user?.email,
            customer_phone: user?.phone
          });
          if (sslRes.data.success) {
            window.location.replace(sslRes.data.data.url);
            return;
          } else {
            showError('Failed to initialize SSLCommerz gateway');
            setProcessing(false);
            return;
          }
        }
      }

      // For other payment methods, use existing logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Map display names to database ENUM values
      const paymentMethodMap = {
        'bKash': 'bkash',
        'Nagad': 'nagad',
        'Rocket': 'rocket',
        'Bank Transfer': 'bank_transfer',
        'Credit Card': 'credit_card',
        'SSLCommerz': 'sslcommerz'
      };

      const dbPaymentMethod = paymentMethodMap[paymentMethod] || paymentMethod.toLowerCase();

      console.log('=== PAYMENT DEBUG ===');
      console.log('1. Payment Method (Display):', paymentMethod);
      console.log('2. Payment Method (DB):', dbPaymentMethod);
      console.log('3. Payment Status:', 'paid');

      const requestPayload = {
        payment_method: dbPaymentMethod,
        payment_status: 'paid',
        // For extension payments: record the extra amount paid, not the full total
        amount_paid: isExtensionNav && navExtraAmount ? navExtraAmount : undefined,
        points_to_redeem: (usePoints && pointsToRedeem > 0) ? pointsToRedeem : undefined
      };

      console.log('4. Request Payload:', JSON.stringify(requestPayload));

      // Update booking payment method and status (booking already confirmed by owner)
      const response = await api.patch(`/guest/bookings/${bookingId}/payment`, requestPayload);

      console.log('5. Response:', response.data);
      console.log('===================');

      showSuccess('Payment completed successfully!');
      // Refetch points data to show updated balance and new points earned
      await fetchPointsData();
      const isExt = booking?.payment_status === 'pending_extra';
      navigate(`/booking-confirmation/${bookingId}${isExt ? '?type=extension' : ''}`);
    } catch (err) {
      console.error('Payment error:', err);
      showError(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };



  if (loading) return <LoadingSpinner />;
  if (!booking) return <div className="text-center p-8">Booking not found</div>;

  const isExtensionPayment = booking.payment_status === 'pending_extra' || isExtensionNav;
  // payableAmount: for extensions use the extra amount only, for original use total
  const payableAmount = isExtensionPayment && navExtraAmount ? navExtraAmount : parseFloat(booking.total_amount);
  const alreadyPaid = isExtensionPayment ? parseFloat(booking.total_amount) - payableAmount : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {isExtensionPayment ? '🗓️ Pay for Extension' : 'Complete Your Payment'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isExtensionPayment
                ? 'Complete payment for your booking extension'
                : `Booking ID: ${booking.id}`}
            </p>
            {isExtensionPayment && (
              <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                <span className="text-blue-600 text-xs font-semibold">Extension Payment</span>
                <span className="text-blue-400 text-xs">Booking #{booking.id}</span>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Booking Summary */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property:</span>
                    <span className="font-medium">{booking.property_title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">{new Date(booking.check_in_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{isExtensionPayment ? 'New Check-out:' : 'Check-out:'}</span>
                    <span className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{booking.number_of_guests}</span>
                  </div>

                  {isExtensionPayment && navExtraAmount ? (
                    <>
                      <div className="border-t pt-2 mt-1 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Original booking (already paid):</span>
                          <span className="text-gray-500 line-through">BDT {formatPrice(alreadyPaid)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Extension extra charge:</span>
                          <span className="font-semibold text-orange-600">BDT {formatPrice(payableAmount)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-800 font-bold">Amount Due Now:</span>
                          <span className="font-bold text-lg text-red-600">BDT {formatPrice(payableAmount)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-lg text-red-600">BDT {formatPrice(booking.total_amount)}</span>
                    </div>
                  )}
                </div>

                {/* Rewards Points Redemption */}
                {pointsData && pointsData.points?.current_balance > 0 && pointsData.settings && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                        <span className="mr-2">🎁</span>
                        Use Rewards Points
                      </h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={usePoints}
                          onChange={(e) => setUsePoints(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Available Points:</span>
                        <span className="font-semibold text-primary-600">
                          {pointsData.points.current_balance.toLocaleString()} points
                        </span>
                      </div>
                      {usePoints && pointsToRedeem > 0 && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Points to Use:</span>
                            <span className="font-semibold text-red-600">-{pointsToRedeem.toLocaleString()} points</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Remaining After Use:</span>
                            <span className="font-semibold text-primary-600">
                              {(pointsData.points.current_balance - pointsToRedeem).toLocaleString()} points
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Discount:</span>
                            <span className="font-semibold text-green-600">-BDT {formatPrice(pointsDiscount)}</span>
                          </div>
                          <div className="border-t border-yellow-300 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Amount to Pay:</span>
                              <span className="font-bold text-lg text-red-600">BDT {formatPrice(finalAmount)}</span>
                            </div>
                          </div>
                        </>
                      )}
                      {usePoints && pointsToRedeem === 0 && pointsData.settings.min_points_to_redeem && (
                        <p className="text-xs text-gray-500">
                          Minimum {pointsData.settings.min_points_to_redeem} points required to redeem
                        </p>
                      )}
                      {!usePoints && (
                        <div className="border-t border-yellow-300 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-gray-700 font-medium">Amount to Pay:</span>
                            <span className="font-bold text-lg text-red-600">BDT {formatPrice(booking.total_amount)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>

                {/* Terms and Policies Checkbox */}
                <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="flex items-start cursor-pointer">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 text-[#E41D57] bg-white border-gray-300 rounded focus:ring-[#E41D57] focus:ring-2"
                      />
                    </div>
                    <div className="ml-3 text-sm flex-1">
                      <span className="text-gray-700">
                        I have read and agree to the{' '}
                        <a href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Terms & Conditions</a> and{' '}
                        <a href="/refund-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Refund/Cancellation Policy</a>.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Refund Policy Summary Box */}
                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                   <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <h3 className="font-bold text-blue-900 text-sm">Refund Policy Summary</h3>
                   </div>
                   <ul className="text-xs text-blue-800 space-y-1 ml-7 list-disc">
                      <li>Free cancellation up to 48 hours before check-in.</li>
                      <li>100% refund of advance payment if cancelled on time.</li>
                      <li>Cancellations within 48 hours of check-in are non-refundable.</li>
                       <li>No refund for unused nights after early check-out.</li>
                   </ul>
                </div>

                <div className="space-y-4">
                  {/* Trust Signals */}
                  <div className="flex items-center justify-center gap-6 py-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                      </div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Secure SSL</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      </div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Encrypted</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">Verified</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <button
                      onClick={() => handlePayment('SSLCommerz')}
                      disabled={processing || !agreedToTerms}
                      className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg ${
                        !agreedToTerms 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                          : 'bg-[#E41D57] text-white hover:bg-[#C31A4A] hover:shadow-[#E41D57]/20 hover:-translate-y-1 active:scale-95'
                      }`}
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                          Pay BDT {formatPrice(usePoints ? finalAmount : payableAmount)} Now
                        </>
                      )}
                    </button>
                    
                    <div className="mt-4 flex items-center justify-center gap-4 grayscale opacity-70">
                      <img src="/images/ssl.png" alt="SSLCommerz" className="h-8 object-contain" />
                      <div className="h-4 w-[1px] bg-gray-300"></div>
                      <div className="text-[10px] text-gray-500 font-medium leading-tight">
                        Supported: Visa, Mastercard, bKash, Nagad, Net Banking
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] text-gray-400 font-medium">
                      Your payment is processed securely via SSLCommerz. We do not store your card details.
                    </p>
                  </div>
                </div>

                {processing && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Processing payment...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Payment;
