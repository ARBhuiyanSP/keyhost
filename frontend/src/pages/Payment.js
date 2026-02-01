import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useToast from '../hooks/useToast';
import BkashPayment from '../components/payment/BkashPayment';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showBkashPayment, setShowBkashPayment] = useState(false);
  const [pointsData, setPointsData] = useState(null);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);

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
      
      // Check if booking is pending and owner has accepted (confirmed_at is set)
      if (bookingData.status !== 'pending') {
        if (bookingData.status === 'confirmed') {
          // Already confirmed, payment might be completed
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
      
      // Handle bKash payment separately
      if (paymentMethod === 'bKash') {
        setShowBkashPayment(true);
        setProcessing(false);
        return;
      }
      
      // For other payment methods, use existing logic
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Map display names to database ENUM values
      const paymentMethodMap = {
        'bKash': 'bkash',
        'Nagad': 'nagad',
        'Rocket': 'rocket',
        'Bank Transfer': 'bank_transfer',
        'Credit Card': 'credit_card'
      };
      
      const dbPaymentMethod = paymentMethodMap[paymentMethod] || paymentMethod.toLowerCase();
      
      console.log('=== PAYMENT DEBUG ===');
      console.log('1. Payment Method (Display):', paymentMethod);
      console.log('2. Payment Method (DB):', dbPaymentMethod);
      console.log('3. Payment Status:', 'paid');
      
      const requestPayload = {
        payment_method: dbPaymentMethod,
        payment_status: 'paid',
        points_to_redeem: (usePoints && pointsToRedeem > 0) ? pointsToRedeem : undefined
      };
      
      console.log('4. Request Payload:', JSON.stringify(requestPayload));
      
      // Update booking payment method and status (booking already confirmed by owner)
      const response = await api.patch(`/guest/bookings/${bookingId}/payment`, requestPayload);
      
      console.log('5. Response:', response.data);
      console.log('===================');
      
      showSuccess('Payment completed successfully! Booking is now confirmed.');
      // Refetch points data to show updated balance and new points earned
      await fetchPointsData();
      navigate(`/guest/bookings/${bookingId}`);
    } catch (err) {
      console.error('Payment error:', err);
      showError(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleBkashSuccess = async (paymentData) => {
    showSuccess('bKash payment completed successfully!');
    setShowBkashPayment(false);
    // Refetch points data to show updated balance and new points earned
    await fetchPointsData();
    navigate('/guest/bookings');
  };

  const handleBkashCancel = () => {
    setShowBkashPayment(false);
  };

  if (loading) return <LoadingSpinner />;
  if (!booking) return <div className="text-center p-8">Booking not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
            <p className="text-gray-600 mt-1">Booking ID: {booking.id}</p>
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
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">{new Date(booking.check_out_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{booking.number_of_guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-lg text-red-600">BDT {booking.total_amount}</span>
                  </div>
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
                            <span className="font-semibold text-green-600">-BDT {pointsDiscount.toFixed(2)}</span>
                          </div>
                          <div className="border-t border-yellow-300 pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium">Amount to Pay:</span>
                              <span className="font-bold text-lg text-red-600">BDT {finalAmount.toFixed(2)}</span>
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
                            <span className="font-bold text-lg text-red-600">BDT {booking.total_amount}</span>
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
                <div className="space-y-3">
                  <button
                    onClick={() => handlePayment('bKash')}
                    disabled={processing}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        B
                      </div>
                      <div>
                        <div className="font-medium">bKash</div>
                        <div className="text-sm text-gray-500">Mobile Banking</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePayment('Nagad')}
                    disabled={processing}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        N
                      </div>
                      <div>
                        <div className="font-medium">Nagad</div>
                        <div className="text-sm text-gray-500">Mobile Banking</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePayment('Rocket')}
                    disabled={processing}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        R
                      </div>
                      <div>
                        <div className="font-medium">Rocket</div>
                        <div className="text-sm text-gray-500">Mobile Banking</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePayment('Bank Transfer')}
                    disabled={processing}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                        B
                      </div>
                      <div>
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-sm text-gray-500">Direct Bank Transfer</div>
                      </div>
                    </div>
                  </button>

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

      {/* bKash Payment Modal */}
      {showBkashPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <BkashPayment
              bookingId={bookingId}
              amount={usePoints ? (finalAmount || booking.total_amount) : booking.total_amount}
              pointsToRedeem={usePoints ? pointsToRedeem : 0}
              onSuccess={handleBkashSuccess}
              onCancel={handleBkashCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
