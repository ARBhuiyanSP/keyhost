import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FiDollarSign, FiUser, FiHome, FiCalendar, FiDownload, FiCheck, 
  FiX, FiEye, FiPlus, FiRefreshCw, FiAlertCircle, FiCheckCircle 
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminAccountingNew = () => {
  const [activeTab, setActiveTab] = useState('transactions'); // transactions, earnings, payouts, balances
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showCollectCommission, setShowCollectCommission] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [collectForm, setCollectForm] = useState({
    amount: '',
    payment_method: 'bank_transfer',
    payment_reference: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery(
    ['admin-accounting', selectedEntity, dateRange],
    () => {
      const params = new URLSearchParams({
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

  // Fetch admin earnings
  const { data: earningsData, isLoading: earningsLoading } = useQuery(
    ['admin-earnings', dateRange],
    () => {
      const params = new URLSearchParams({
        ...(dateRange.start && { start_date: dateRange.start }),
        ...(dateRange.end && { end_date: dateRange.end })
      });
      return api.get(`/admin/earnings/earnings?${params}`);
    },
    {
      select: (response) => response.data?.data || { earnings: [], pagination: {} },
    }
  );

  // Fetch owner balances
  const { data: balancesData, isLoading: balancesLoading } = useQuery(
    ['owner-balances'],
    () => api.get('/admin/owner-payouts/balances'),
    {
      select: (response) => response.data?.data || { balances: [] },
    }
  );

  // Fetch owner payouts
  const { data: payoutsData, isLoading: payoutsLoading } = useQuery(
    ['owner-payouts', dateRange],
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

  // Collect commission mutation
  const collectCommissionMutation = useMutation(
    (data) => api.post(`/admin/earnings/${selectedBooking}/collect-commission`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-earnings']);
        queryClient.invalidateQueries(['owner-balances']);
        setShowCollectCommission(false);
        setSelectedBooking(null);
        setCollectForm({
          amount: '',
          payment_method: 'bank_transfer',
          payment_reference: '',
          notes: ''
        });
      }
    }
  );

  const handleCollectCommission = (bookingId, commissionAmount) => {
    setSelectedBooking(bookingId);
    setCollectForm(prev => ({
      ...prev,
      amount: commissionAmount.toString()
    }));
    setShowCollectCommission(true);
  };

  const handleSubmitCollectCommission = (e) => {
    e.preventDefault();
    collectCommissionMutation.mutate(collectForm);
  };

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
      case 'commission_remit_to_admin':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCommissionStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
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

  const tabs = [
    { id: 'transactions', label: 'Transactions', icon: FiDollarSign },
    { id: 'earnings', label: 'Commission Earnings', icon: FiCheckCircle },
    { id: 'payouts', label: 'Owner Payouts', icon: FiUser },
    { id: 'balances', label: 'Owner Balances', icon: FiHome }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Accounting & Finance</h1>
          <p className="mt-2 text-gray-600">Manage transactions, commissions, and payouts</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entity Filter
              </label>
              <select
                value={selectedEntity || ''}
                onChange={(e) => setSelectedEntity(e.target.value || null)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Entities</option>
                <option value="owner">Property Owners</option>
                <option value="guest">Guests</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateRange({ start: '', end: '' });
                  setSelectedEntity(null);
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">All Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionsData?.transactions?.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.payment_reference}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.guest_name} - {transaction.property_title}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            BDT {transaction.amount}
                          </div>
                          {transaction.dr_amount > 0 && (
                            <div className="text-xs text-red-600">
                              DR: BDT {transaction.dr_amount}
                            </div>
                          )}
                          {transaction.cr_amount > 0 && (
                            <div className="text-xs text-green-600">
                              CR: BDT {transaction.cr_amount}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                            {transaction.transaction_type?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Commission Earnings</h3>
              <div className="text-sm text-gray-500">
                {earningsData?.pagination?.total || 0} total earnings
              </div>
            </div>
            <div className="overflow-x-auto">
              {earningsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commission
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {earningsData?.earnings?.map((earning) => (
                      <tr key={earning.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {earning.booking_reference}
                            </div>
                            <div className="text-sm text-gray-500">
                              {earning.property_title}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {earning.owner_business_name || `${earning.owner_first_name} ${earning.owner_last_name}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            BDT {earning.net_commission}
                          </div>
                          <div className="text-xs text-gray-500">
                            Rate: {earning.commission_rate}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCommissionStatusColor(earning.payment_status)}`}>
                            {earning.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {earning.payment_status === 'pending' && (
                            <button
                              onClick={() => handleCollectCommission(earning.booking_id, earning.net_commission)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Collect Commission
                            </button>
                          )}
                          <button className="text-gray-600 hover:text-gray-900">
                            <FiEye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payouts' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Owner Payouts</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                <FiPlus className="h-4 w-4 inline mr-2" />
                Create Payout
              </button>
            </div>
            <div className="overflow-x-auto">
              {payoutsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
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
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payoutsData?.payouts?.map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payout.payout_reference}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {payout.business_name || `${payout.first_name} ${payout.last_name}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            BDT {payout.net_payout}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payout.items_count} items
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payout.payment_status)}`}>
                            {payout.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'balances' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Owner Balances</h3>
            </div>
            <div className="overflow-x-auto">
              {balancesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Earnings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Payouts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commission Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {balancesData?.balances?.map((balance) => (
                      <tr key={balance.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {balance.business_name || `${balance.first_name} ${balance.last_name}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {balance.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          BDT {balance.total_earnings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          BDT {balance.total_payouts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            BDT {balance.current_balance}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500">
                            <div>Paid: BDT {balance.commission_paid_to_admin}</div>
                            <div>Pending: BDT {balance.commission_pending}</div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Collect Commission Modal */}
        {showCollectCommission && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Collect Commission from Owner
                </h3>
                <form onSubmit={handleSubmitCollectCommission}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={collectForm.amount}
                      onChange={(e) => setCollectForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={collectForm.payment_method}
                      onChange={(e) => setCollectForm(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="bkash">bKash</option>
                      <option value="nagad">Nagad</option>
                      <option value="rocket">Rocket</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Reference
                    </label>
                    <input
                      type="text"
                      value={collectForm.payment_reference}
                      onChange={(e) => setCollectForm(prev => ({ ...prev, payment_reference: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder="Transaction ID or reference"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={collectForm.notes}
                      onChange={(e) => setCollectForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      rows="3"
                      placeholder="Additional notes..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCollectCommission(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={collectCommissionMutation.isLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {collectCommissionMutation.isLoading ? 'Processing...' : 'Collect Commission'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccountingNew;

