import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiDollarSign, FiUser, FiHome, FiCalendar, FiDownload, FiCheckCircle, FiX, FiEye } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminAccounting = () => {
  const [view, setView] = useState('all'); // all, owner, guest
  const [activeTab, setActiveTab] = useState('transactions'); // transactions, payouts
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const queryClient = useQueryClient();

  // Fetch all transactions
  const { data: transactionsData, isLoading } = useQuery(
    ['admin-accounting', view, selectedEntity, dateRange],
    () => {
      const params = new URLSearchParams({
        view,
        ...(selectedEntity && { entity_id: selectedEntity }),
        ...(dateRange.start && { start_date: dateRange.start }),
        ...(dateRange.end && { end_date: dateRange.end })
      });
      return api.get(`/admin/accounting/ledger?${params}`);
    },
    {
      select: (response) => response.data?.data || { transactions: [], summary: {} },
    }
  );

  // Fetch owner payouts
  const { data: payoutsData, isLoading: payoutsLoading } = useQuery(
    ['admin-owner-payouts', dateRange],
    () => {
      const params = new URLSearchParams({
        ...(dateRange.start && { start_date: dateRange.start }),
        ...(dateRange.end && { end_date: dateRange.end })
      });
      return api.get(`/admin/owner-payouts/payouts?${params}`);
    },
    {
      select: (response) => response.data?.data || { payouts: [], pagination: {} },
    }
  );

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'booking_created':
        return 'bg-blue-100 text-blue-800';
      case 'payment_received':
        return 'bg-green-100 text-green-800';
      case 'refund':
        return 'bg-red-100 text-red-800';
      case 'discount':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Update payout status mutation
  const updatePayoutStatusMutation = useMutation(
    ({ payoutId, status, payment_reference, notes }) => 
      api.patch(`/admin/owner-payouts/payouts/${payoutId}/status`, {
        payment_status: status,
        payment_reference,
        notes
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-owner-payouts');
      }
    }
  );

  // Fetch payout details
  const { data: payoutDetails, isLoading: payoutDetailsLoading } = useQuery(
    ['payout-details', selectedPayout],
    () => api.get(`/admin/owner-payouts/payouts/${selectedPayout}`),
    {
      enabled: !!selectedPayout,
      select: (response) => response.data?.data || {}
    }
  );

  const handleViewDetails = (payout) => {
    setSelectedPayout(payout.id);
    setShowDetailsModal(true);
  };

  const handleProcessPayout = async (payout) => {
    try {
      await updatePayoutStatusMutation.mutateAsync({
        payoutId: payout.id,
        status: 'processing',
        notes: 'Payout being processed by admin'
      });
      alert('Payout status updated to processing');
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Failed to process payout');
    }
  };

  const handleCompletePayout = async (payout) => {
    const paymentRef = prompt('Enter payment reference:');
    if (!paymentRef) return;

    const notes = prompt('Enter notes (optional):');

    try {
      await updatePayoutStatusMutation.mutateAsync({
        payoutId: payout.id,
        status: 'completed',
        payment_reference: paymentRef,
        notes: notes || 'Payout completed successfully'
      });
      alert('Payout marked as completed');
    } catch (error) {
      console.error('Error completing payout:', error);
      alert('Failed to complete payout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accounting & Ledger</h1>
          <p className="text-gray-600 mt-2">Complete transaction history with DR/CR entries</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiDollarSign className="inline mr-2 h-4 w-4" />
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payouts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUser className="inline mr-2 h-4 w-4" />
                Owner Payouts
              </button>
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
              <select
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="input-field"
              >
                <option value="all">All Transactions</option>
                <option value="owner">By Property Owner</option>
                <option value="guest">By Guest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input-field"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateRange({ start: '', end: '' });
                  setSelectedEntity(null);
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {transactionsData?.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Total Amount (DR) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-600">BDT {(transactionsData.summary.total_dr || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Received from guests</p>
                </div>
                <FiDollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Admin Commission Earned */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commission</p>
                  <p className="text-2xl font-bold text-green-600">BDT {(transactionsData.summary.total_commission_earned || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Admin commission</p>
                </div>
                <FiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Payable Amount (Pending Payout Requests) */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Payable Amount</p>
                  <p className="text-2xl font-bold text-purple-600">
                    BDT {(transactionsData.summary.pending_payouts_to_owners || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">To pay owners</p>
                </div>
                <FiUser className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            {/* Payouts to Owners */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid to Owners</p>
                  <p className="text-2xl font-bold text-indigo-600">BDT {(transactionsData.summary.total_payouts_to_owners || 0).toLocaleString()}</p>
                </div>
                <FiCheckCircle className="w-8 h-8 text-indigo-600" />
              </div>
            </div>

            {/* Outstanding Balance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-orange-600">BDT {(transactionsData.summary.total_owner_outstanding || 0).toLocaleString()}</p>
                </div>
                <FiDollarSign className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            {/* Total Bookings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-pink-600">{transactionsData.summary.total_bookings || 0}</p>
                </div>
                <FiHome className="w-8 h-8 text-pink-600" />
              </div>
            </div>
          </div>
        )}

        {/* Ledger Table */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction Ledger
            </h2>
            <button className="btn-secondary flex items-center gap-2">
              <FiDownload className="w-4 h-4" />
              Export to Excel
            </button>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : transactionsData?.transactions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">DR (BDT )</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">CR (BDT )</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance (BDT )</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactionsData.transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(txn.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-blue-600">{txn.payment_reference}</div>
                        <div className="text-xs text-gray-500">{txn.booking_reference}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{txn.guest_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{txn.property_title}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${getTransactionTypeColor(txn.transaction_type)}`}>
                          {txn.transaction_type?.replace('_', ' ')}
                        </span>
                        {txn.notes && <div className="text-xs text-gray-500 mt-1">{txn.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                        {txn.dr_amount > 0 && `BDT ${parseFloat(txn.dr_amount).toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                        {txn.cr_amount > 0 && `BDT ${parseFloat(txn.cr_amount).toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">
                        <span className={txn.running_balance > 0 ? 'text-orange-600' : 'text-green-600'}>
                          BDT {parseFloat(txn.running_balance || 0).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          )}
        </div>
        )}

        {/* Owner Payouts Table */}
        {activeTab === 'payouts' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Owner Payout Requests
              </h2>
              <div className="text-sm text-gray-500">
                {payoutsData?.pagination?.total || 0} total payouts
              </div>
            </div>

            {payoutsLoading ? (
              <div className="p-6">
                <LoadingSpinner />
              </div>
            ) : payoutsData?.payouts?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payout Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payoutsData.payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payout.payout_reference}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payout.business_name || `${payout.first_name} ${payout.last_name}`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payout.items_count} bookings
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            BDT {payout.net_payout}
                          </div>
                          <div className="text-xs text-gray-500">
                            Total: BDT {payout.total_earnings}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payout.payment_method?.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payout.payment_status)}`}>
                            {payout.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => handleViewDetails(payout)}
                            className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                          >
                            <FiEye className="mr-1 h-4 w-4" />
                            View Details
                          </button>
                          {payout.payment_status === 'pending' && (
                            <button 
                              onClick={() => handleProcessPayout(payout)}
                              disabled={updatePayoutStatusMutation.isLoading}
                              className="text-green-600 hover:text-green-900"
                            >
                              {updatePayoutStatusMutation.isLoading ? 'Processing...' : 'Mark Processing'}
                            </button>
                          )}
                          {payout.payment_status === 'processing' && (
                            <button 
                              onClick={() => handleCompletePayout(payout)}
                              disabled={updatePayoutStatusMutation.isLoading}
                              className="text-green-600 hover:text-green-900"
                            >
                              {updatePayoutStatusMutation.isLoading ? 'Completing...' : 'Mark Completed'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiUser className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No payout requests found</h3>
                <p className="text-gray-600">Owner payout requests will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Payout Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => setShowDetailsModal(false)}>
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Payout Details</h3>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              {payoutDetailsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : payoutDetails?.payout && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reference</label>
                      <div className="mt-1 text-sm text-gray-900">{payoutDetails.payout.payout_reference}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payoutDetails.payout.payment_status)}`}>
                          {payoutDetails.payout.payment_status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Owner</label>
                      <div className="mt-1 text-sm text-gray-900">
                        {payoutDetails.payout.business_name || `${payoutDetails.payout.first_name} ${payoutDetails.payout.last_name}`}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                      <div className="mt-1 text-sm text-gray-900">{payoutDetails.payout.payment_method}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Net Payout</label>
                      <div className="mt-1 text-sm font-bold text-gray-900">BDT {payoutDetails.payout.net_payout}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Earnings</label>
                      <div className="mt-1 text-sm text-gray-900">BDT {payoutDetails.payout.total_earnings}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Commission Paid</label>
                      <div className="mt-1 text-sm text-gray-900">BDT {payoutDetails.payout.total_commission_paid}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <div className="mt-1 text-sm text-gray-900">
                        {new Date(payoutDetails.payout.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {payoutDetails.payout.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <div className="mt-1 text-sm text-gray-900">{payoutDetails.payout.notes}</div>
                    </div>
                  )}

                  {/* Payout Items */}
                  {payoutDetails.items && payoutDetails.items.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payout Items</label>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking Reference</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Booking Total</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Owner Earnings</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {payoutDetails.items.map((item) => (
                              <tr key={item.id}>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.booking_reference}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.guest_name || 'N/A'}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{item.property_title || 'N/A'}</td>
                                <td className="px-4 py-2 text-sm text-right text-gray-900">BDT {item.booking_total}</td>
                                <td className="px-4 py-2 text-sm text-right text-red-600">-BDT {item.admin_commission}</td>
                                <td className="px-4 py-2 text-sm text-right text-green-600">BDT {item.owner_earnings}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Close
                    </button>
                    {payoutDetails.payout.payment_status === 'pending' && (
                      <button
                        onClick={() => {
                          handleProcessPayout(payoutDetails.payout);
                          setShowDetailsModal(false);
                        }}
                        disabled={updatePayoutStatusMutation.isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Start Processing
                      </button>
                    )}
                    {payoutDetails.payout.payment_status === 'processing' && (
                      <button
                        onClick={() => {
                          handleCompletePayout(payoutDetails.payout);
                          setShowDetailsModal(false);
                        }}
                        disabled={updatePayoutStatusMutation.isLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccounting;

