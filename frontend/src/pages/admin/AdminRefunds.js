import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiInfo, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminRefunds = () => {
  const [loading, setLoading] = useState(true);
  const [refunds, setRefunds] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });

  const { showSuccess, showError } = useToast();

  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve', 'reject', 'complete'
  const [actionData, setActionData] = useState({ notes: '', transaction_id: '' });
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const openDetailsModal = (refund) => {
    setSelectedRefund(refund);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedRefund(null);
    setIsDetailsModalOpen(false);
  };

  useEffect(() => {
    fetchRefunds();
  }, [filters]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await api.get(`/admin/refunds?${params}`);
      setRefunds(response.data.data.refunds);
      setPagination(response.data.data.pagination);
    } catch (err) {
      showError('Failed to fetch refund requests');
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (refund, type) => {
    setSelectedRefund(refund);
    setActionType(type);
    setActionData({ notes: type === 'approve' ? 'Approved by Admin' : '', transaction_id: '' });
    setShowActionModal(true);
  };

  const submitAction = async () => {
    if (actionType === 'complete' && !actionData.transaction_id.trim()) {
      showError('Transaction ID is required to complete refund');
      return;
    }
    if ((actionType === 'reject') && !actionData.notes.trim()) {
      showError('Notes are required for rejection');
      return;
    }

    setIsSubmittingAction(true);
    try {
      if (actionType === 'complete') {
        await api.patch(`/admin/refunds/${selectedRefund.id}/complete`, { 
          transaction_id: actionData.transaction_id, 
          notes: actionData.notes 
        });
        showSuccess('Refund marked as completed');
      } else {
        await api.patch(`/admin/refunds/${selectedRefund.id}/${actionType}`, { 
          notes: actionData.notes || `${actionType.charAt(0).toUpperCase() + actionType.slice(1)}ed by Admin`
        });
        showSuccess(`Refund ${actionType}ed successfully`);
      }
      setShowActionModal(false);
      setIsDetailsModalOpen(false);
      fetchRefunds();
    } catch (err) {
      showError(`Failed to ${actionType} refund`);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase().trim();
    if (s === 'pending') {
      return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit"><FiClock /> Pending</span>;
    } else if (s === 'approved' || s === 'processing') {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit"><FiCheckCircle /> Approved</span>;
    } else if (s === 'completed' || s === 'refunded' || s === 'success') {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit"><FiCheckCircle /> Completed</span>;
    } else if (s === 'rejected' || s === 'failed' || s === 'cancelled') {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit"><FiXCircle /> Rejected</span>;
    }
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-bold uppercase w-fit">{status || 'Unknown'}</span>;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
            <p className="text-gray-500 mt-1">Manage guest refund requests per KeyHost24 policy</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Booking Ref, Guest, Property..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Refunds Tables */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12"><LoadingSpinner /></div>
          ) : refunds.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-2">
               <FiInfo className="text-4xl opacity-20" />
               <p>No refund requests found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Booking Ref</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest & Property</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Requested At</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {refunds.map((refund) => (
                    <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-900">{refund.booking_reference}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-bold text-gray-900">{refund.guest_first_name} {refund.guest_last_name}</p>
                          <p className="text-gray-500 truncate max-w-[200px]">{refund.property_title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-rose-600">
                        ৳{refund.refund_amount || refund.amount || 0}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(refund.requested_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(refund.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {refund.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openActionModal(refund, 'approve')}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Approve Refund"
                              >
                                <FiCheckCircle />
                              </button>
                              <button
                                onClick={() => openActionModal(refund, 'reject')}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                title="Reject Refund"
                              >
                                <FiXCircle />
                              </button>
                            </>
                          )}
                          {refund.status === 'approved' && (
                            <button
                              onClick={() => openActionModal(refund, 'complete')}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-xs font-bold flex items-center gap-1"
                            >
                              <FiDollarSign /> Mark Paid
                            </button>
                          )}
                          <button
                            onClick={() => openDetailsModal(refund)}
                            className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        {pagination.totalPages > 1 && (
           <div className="flex justify-center mt-6 gap-2">
             <button 
               disabled={pagination.currentPage === 1}
               onClick={() => setFilters({...filters, page: filters.page - 1})}
               className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50"
             >
               Prev
             </button>
             <span className="px-4 py-2 bg-white border rounded-lg">
               {pagination.currentPage} / {pagination.totalPages}
             </span>
             <button 
               disabled={pagination.currentPage === pagination.totalPages}
               onClick={() => setFilters({...filters, page: filters.page + 1})}
               className="px-4 py-2 border rounded-lg bg-white disabled:opacity-50"
             >
               Next
             </button>
           </div>
        )}
      </div>

      {/* Details Validation Modal */}
      {isDetailsModalOpen && selectedRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold border-b-0 pb-0 text-gray-900 flex items-center gap-2">
                <FiEye className="text-primary-600" />
                Verify Refund Request
              </h3>
              <button 
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
              >
                <FiXCircle className="text-2xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full">
              {getStatusBadge(selectedRefund.status)}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Booking Info</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <p className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">Ref:</span>
                      <span className="font-bold text-gray-900">{selectedRefund.booking_reference}</span>
                    </p>
                    <p className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">Property:</span>
                      <span className="text-gray-900 text-right w-2/3 truncate" title={selectedRefund.property_title}>{selectedRefund.property_title}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Guest:</span>
                      <span className="text-gray-900">{selectedRefund.guest_first_name} {selectedRefund.guest_last_name}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Financial Details</h4>
                  <div className="bg-rose-50 p-4 rounded-lg space-y-2 text-sm border border-rose-100">
                    <p className="flex justify-between border-b border-rose-100 pb-1">
                      <span className="text-rose-700">Original Amount Paid:</span>
                      <span className="font-bold text-gray-900">৳{selectedRefund.original_amount}</span>
                    </p>
                    <p className="flex justify-between border-b border-rose-100 pb-1">
                      <span className="text-rose-700">Calculated Refund:</span>
                      <span className="font-bold text-gray-900">৳{selectedRefund.refund_amount}</span>
                    </p>
                    <p className="flex justify-between border-b border-rose-100 pb-1">
                      <span className="text-rose-700">Net Refund (deductions):</span>
                      <span className="font-bold text-gray-900">৳{selectedRefund.net_refund}</span>
                    </p>
                    <p className="flex justify-between border-b border-rose-100 pb-1">
                      <span className="text-rose-700">Type:</span>
                      <span className="text-gray-900 uppercase font-bold text-xs">{selectedRefund.refund_type}</span>
                    </p>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider">Request Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-1">Reason for Refund:</span>
                      <p className="text-gray-900 font-medium bg-white p-2 rounded border border-gray-100">{selectedRefund.refund_reason || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Policy Applied:</span>
                      <p className="text-gray-900 text-xs font-mono bg-white p-2 rounded border border-gray-100">{selectedRefund.cancellation_policy_applied || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              {selectedRefund.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      openActionModal(selectedRefund, 'reject');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-2"
                  >
                    <FiXCircle /> 
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      openActionModal(selectedRefund, 'approve');
                    }}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold shadow-sm transition-all flex items-center gap-2"
                  >
                    <FiCheckCircle /> 
                    Approve & Refund
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Action Confirmation Modal */}
      {showActionModal && selectedRefund && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
            <div className={`p-6 border-b border-gray-100 flex items-center justify-between ${
              actionType === 'reject' ? 'bg-red-50' : actionType === 'approve' ? 'bg-blue-50' : 'bg-green-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                   actionType === 'reject' ? 'bg-red-100 text-red-600' : actionType === 'approve' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  {actionType === 'reject' ? <FiXCircle className="w-6 h-6" /> : actionType === 'approve' ? <FiCheckCircle className="w-6 h-6" /> : <FiDollarSign className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 capitalize">{actionType} Refund</h3>
                  <p className="text-xs text-gray-500">Booking: #{selectedRefund.booking_reference}</p>
                </div>
              </div>
              <button onClick={() => setShowActionModal(false)} className="p-2 hover:bg-white/50 rounded-full transition-colors">
                <FiXCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-center">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Refund Amount</div>
                <div className="text-3xl font-black text-gray-900">BDT {selectedRefund.refund_amount || selectedRefund.amount || 0}</div>
              </div>

              <p className="text-gray-600 font-medium px-4">
                Are you sure you want to <span className="font-bold underline">{actionType}</span> this refund request?
              </p>

              {actionType === 'complete' ? (
                <div className="animate-fadeIn text-left">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Transaction ID <span className="text-red-500">*</span></label>
                  <input 
                    type="text"
                    value={actionData.transaction_id}
                    onChange={(e) => setActionData({...actionData, transaction_id: e.target.value})}
                    placeholder="e.g. SSL-123456789"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-green-500 focus:ring-0 outline-none transition-all font-mono"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="text-left">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Internal Notes (Optional)</label>
                  <textarea 
                    value={actionData.notes}
                    onChange={(e) => setActionData({...actionData, notes: e.target.value})}
                    placeholder="Add brief notes here if needed..."
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:ring-0 outline-none min-h-[80px] text-sm transition-all"
                  ></textarea>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setShowActionModal(false)}
                className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-700"
                disabled={isSubmittingAction}
              >
                Cancel
              </button>
              <button 
                onClick={submitAction}
                disabled={isSubmittingAction}
                className={`flex-[2] py-3 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:bg-gray-300 ${
                  actionType === 'reject' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 
                  actionType === 'approve' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 
                  'bg-green-600 hover:bg-green-700 shadow-green-100'
                }`}
              >
                {isSubmittingAction ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  actionType === 'reject' ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />
                )}
                Confirm {actionType} (BDT {selectedRefund.refund_amount || selectedRefund.amount || 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRefunds;
