import React, { useState, useEffect } from 'react';
import { FiX, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const CancellationModal = ({ isOpen, onClose, bookingId, onConfirm }) => {
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchPreview();
    }
  }, [isOpen, bookingId]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/guest/bookings/${bookingId}/cancel-preview`);
      setPreview(response.data.data);
    } catch (err) {
      console.error('Failed to fetch cancel preview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(bookingId, reason);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Confirm Cancellation</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {preview?.policyWarning ? (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
                  <div className="flex gap-3">
                    <FiAlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Are you sure?</p>
                      <p className="text-xs text-amber-700 mt-1">{preview.policyWarning}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 mb-6 rounded-r-lg">
                   <div className="flex gap-3">
                    <FiInfo className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-rose-800">Cancellation Info</p>
                      <p className="text-xs text-rose-700 mt-1 text-justify">
                         According to policy 2.a, cancellations made more than 48 hours before check-in are eligible for a 100% refund.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                 <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider border-b border-gray-200 pb-2">Refund Summary</h4>
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Total Paid</span>
                   <span className="font-semibold text-gray-900">BDT {preview?.totalPaid}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Service Charge</span>
                   <span className="font-semibold text-gray-900">BDT {preview?.serviceCharge || 0}</span>
                 </div>
                 <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                   <span>Refundable Amount</span>
                   <span className="text-rose-600 font-extrabold">BDT {preview?.refundableAmount}</span>
                 </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please provide a reason for cancellation *
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all resize-none h-24 text-sm"
                  placeholder="Why are you cancelling this booking?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={submitting || !reason.trim()}
                  style={{
                    backgroundColor: (submitting || !reason.trim()) ? '#E5E7EB' : '#E41D57',
                    color: (submitting || !reason.trim()) ? '#9CA3AF' : 'white'
                  }}
                  className="flex-1 px-4 py-3 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
