import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import { FiCreditCard, FiSmartphone, FiCheck, FiX } from 'react-icons/fi';
import api from '../../utils/api';

const BkashPayment = ({ bookingId, amount, onSuccess, onCancel, pointsToRedeem = 0 }) => {
  const [step, setStep] = useState('initiate'); // initiate, processing, success, failed
  const [paymentData, setPaymentData] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    phone: '',
    name: ''
  });

  // Create payment mutation
  const createPaymentMutation = useMutation(
    (data) => api.post('/bkash/create', data),
    {
      onSuccess: (response) => {
        setPaymentData(response.data.data);
        setStep('processing');
        // Simulate payment processing
        setTimeout(() => {
          executePayment(response.data.data.payment_id);
        }, 2000);
      },
      onError: (error) => {
        console.error('Payment creation failed:', error);
        setStep('failed');
      }
    }
  );

  // Execute payment mutation
  const executePaymentMutation = useMutation(
    (paymentId) => api.post('/bkash/execute', { 
      payment_id: paymentId,
      points_to_redeem: pointsToRedeem || undefined
    }),
    {
      onSuccess: (response) => {
        setStep('success');
        if (onSuccess) {
          onSuccess(response.data.data);
        }
      },
      onError: (error) => {
        console.error('Payment execution failed:', error);
        setStep('failed');
      }
    }
  );

  const handleCreatePayment = () => {
    createPaymentMutation.mutate({
      booking_id: bookingId,
      amount: amount,
      customer_info: customerInfo
    });
  };

  const executePayment = (paymentId) => {
    executePaymentMutation.mutate(paymentId);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <FiSmartphone className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">bKash Payment</h3>
        <p className="text-sm text-gray-500 mt-1">Pay securely with bKash</p>
      </div>

      {step === 'initiate' && (
        <div>
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <FiCreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800 font-medium">Demo Mode</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                This is a demo bKash payment. No real money will be charged.
              </p>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-red-600">BDT {amount}</div>
              <div className="text-sm text-gray-500">
                {pointsToRedeem > 0 ? `After ${pointsToRedeem.toLocaleString()} points discount` : 'Total Amount'}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="01700000000"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePayment}
              disabled={createPaymentMutation.isLoading}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {createPaymentMutation.isLoading ? 'Processing...' : 'Pay with bKash'}
            </button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Processing Payment</h4>
          <p className="text-sm text-gray-500 mb-4">
            Please wait while we process your bKash payment...
          </p>
          {paymentData && (
            <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-600">
              <div>Payment ID: {paymentData.payment_id}</div>
              <div>Amount: BDT {paymentData.amount}</div>
              <div>Status: {paymentData.is_demo ? 'Demo Mode' : 'Live Mode'}</div>
            </div>
          )}
        </div>
      )}

      {step === 'success' && (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <FiCheck className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h4>
          <p className="text-sm text-gray-500 mb-4">
            Your bKash payment has been processed successfully.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-800">
            <div className="font-medium">Transaction Details:</div>
            <div>Amount: BDT {amount}</div>
            <div>Status: Completed</div>
            <div>Method: bKash (Demo)</div>
          </div>
          <button
            onClick={() => onSuccess && onSuccess()}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 mt-4"
          >
            Continue
          </button>
        </div>
      )}

      {step === 'failed' && (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FiX className="h-6 w-6 text-red-600" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Payment Failed</h4>
          <p className="text-sm text-gray-500 mb-4">
            There was an error processing your bKash payment.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep('initiate')}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BkashPayment;





