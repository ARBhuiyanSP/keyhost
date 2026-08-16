import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiDollarSign, FiUser, FiHome, FiCalendar, FiDownload, FiCheckCircle, FiX, FiEye, FiClock, FiCopy, FiCheck, FiXCircle, FiPlus, FiCreditCard } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminAccounting = () => {
  const [view, setView] = useState('all'); // all, owner, guest
  const [activeTab, setActiveTab] = useState('transactions'); // transactions, payouts
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Create Payout Statement Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    owner_id: '',
    payment_method: 'bank_transfer',
    start_date: '',
    end_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Custom modal states
  const [disburseModal, setDisburseModal] = useState(null); // { payout, gatewayMethod, closeModal }
  const [disburseStep, setDisburseStep] = useState('input'); // 'input' | 'confirm'
  const [disburseNumber, setDisburseNumber] = useState('');
  const [disburseNumberError, setDisburseNumberError] = useState('');

  const [completeModal, setCompleteModal] = useState(null); // { payout }
  const [completeRef, setCompleteRef] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');

  const [toast, setToast] = useState(null); // { type: 'success'|'error', title, message }
  const [copiedTxnId, setCopiedTxnId] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 5000);
  };

  const [verifyingBooking, setVerifyingBooking] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [verificationError, setVerificationError] = useState(null);

  const handleVerifyGateway = async (item, e) => {
    if (e) e.stopPropagation();
    setVerifyingBooking(item);
    setIsVerifying(true);
    setVerificationError(null);
    setVerificationData(null);
    try {
      const res = await api.get(`/admin/bookings/${item.booking_id}/verify-gateway`);
      if (res.data?.success) {
        setVerificationData(res.data.data);
      } else {
        setVerificationError(res.data?.message || 'Verification query failed');
      }
    } catch (err) {
      console.error('Verify gateway error:', err);
      setVerificationError(err.response?.data?.message || err.message || 'Verification query failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyTxnId = (text, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedTxnId(text);
    setTimeout(() => setCopiedTxnId(null), 2000);
  };
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const queryClient = useQueryClient();

  const createPayoutMutation = useMutation(
    (data) => api.post('/admin/owner-payouts/payouts', data),
    {
      onSuccess: () => {
        showToast('success', 'Payout Statement Created', 'Owner payout statement generated successfully.');
        queryClient.invalidateQueries('admin-owner-payouts');
        queryClient.invalidateQueries('admin-owner-balances');
        setShowCreateModal(false);
        setCreateForm({
          owner_id: '',
          payment_method: 'bank_transfer',
          start_date: '',
          end_date: new Date().toISOString().split('T')[0],
          notes: ''
        });
      },
      onError: (error) => {
        showToast('error', 'Failed to Create Payout', error.response?.data?.message || 'Could not generate payout statement.');
      }
    }
  );

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

  // Fetch owners list for filter dropdown & payout creation modal
  const { data: ownersListData = [] } = useQuery(
    'accounting-owners-list',
    () => api.get('/admin/accounting/owners'),
    {
      select: (response) => response.data?.data?.owners || []
    }
  );

  // Fetch guests list for filter dropdown
  const { data: guestsListData } = useQuery(
    'accounting-guests-list',
    () => api.get('/admin/accounting/guests'),
    {
      enabled: view === 'guest',
      select: (response) => response.data?.data?.guests || []
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

  // Fetch owner balances (unrequested payable balances per host)
  const { data: balancesData = [], isLoading: balancesLoading } = useQuery(
    ['admin-owner-balances'],
    () => api.get('/admin/owner-payouts/balances'),
    {
      select: (response) => response.data?.data?.balances || [],
    }
  );

  const transactions = transactionsData?.transactions || [];
  const totalDR = transactions.reduce((sum, txn) => sum + (parseFloat(txn.dr_amount) || 0), 0);
  const totalCR = transactions.reduce((sum, txn) => sum + (parseFloat(txn.cr_amount) || 0), 0);
  const finalBalance = totalDR - totalCR;

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return 'BDT ' + num.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  // Disburse payout via gateway mutation
  const disburseGatewayMutation = useMutation(
    ({ payoutId, payment_method, mobile_number }) => 
      api.post(`/admin/owner-payouts/payouts/${payoutId}/disburse-gateway`, {
        payment_method,
        mobile_number
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-owner-payouts');
        queryClient.invalidateQueries('payout-details');
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

  const handleRemovePayoutItem = async (payoutId, itemId, bookingRef) => {
    if (!window.confirm(`Are you sure you want to exclude booking '${bookingRef}' from this payout request?`)) {
      return;
    }
    try {
      const response = await api.delete(`/admin/owner-payouts/payouts/${payoutId}/items/${itemId}`);
      if (response.data?.success) {
        showToast('success', 'Booking Excluded', `Booking ${bookingRef} removed from payout.`);
        queryClient.invalidateQueries('payout-details');
        queryClient.invalidateQueries('admin-owner-payouts');
        queryClient.invalidateQueries('admin-owner-balances');
        if (response.data?.data?.deletedPayout) {
          setShowDetailsModal(false);
        }
      } else {
        showToast('error', 'Failed', response.data?.message || 'Could not exclude booking.');
      }
    } catch (error) {
      showToast('error', 'Error', error.response?.data?.message || 'Failed to exclude booking.');
    }
  };

  const handleProcessPayout = async (payout) => {
    try {
      await updatePayoutStatusMutation.mutateAsync({
        payoutId: payout.id,
        status: 'processing',
        notes: 'Payout being processed by admin'
      });
      showToast('success', 'Status Updated', 'Payout is now marked as Processing.');
    } catch (error) {
      console.error('Error processing payout:', error);
      showToast('error', 'Failed', 'Could not update payout status.');
    }
  };

  const handleCompletePayout = (payout) => {
    setCompleteRef('');
    setCompleteNotes('');
    setCompleteModal({ payout });
  };

  const submitCompletePayout = async () => {
    if (!completeRef.trim()) return;
    try {
      await updatePayoutStatusMutation.mutateAsync({
        payoutId: completeModal.payout.id,
        status: 'completed',
        payment_reference: completeRef.trim(),
        notes: completeNotes.trim() || 'Payout completed successfully'
      });
      setCompleteModal(null);
      showToast('success', 'Payout Completed', `Reference: ${completeRef.trim()}`);
    } catch (error) {
      showToast('error', 'Failed', 'Could not complete payout.');
    }
  };

  const handleDisburseGateway = (payout, gatewayMethod, closeModal) => {
    // Pre-fill with host's saved MFS wallet number if provider matches
    const hostMfsProvider = payout.mfs_provider || '';
    const hostWalletNumber = payout.mfs_wallet_number || '';
    const prefillNumber = hostMfsProvider === gatewayMethod ? hostWalletNumber : '';
    setDisburseNumber(prefillNumber);
    setDisburseNumberError('');
    setDisburseStep('input');
    setDisburseModal({ payout, gatewayMethod, closeModal });
  };

  const submitDisburseGateway = async () => {
    if (disburseStep === 'input') {
      if (!disburseNumber.trim()) {
        setDisburseNumberError('Mobile number is required.');
        return;
      }
      if (!/^01\d{9}$/.test(disburseNumber.trim())) {
        setDisburseNumberError('Invalid format — must be 11 digits starting with 01.');
        return;
      }
      setDisburseNumberError('');
      setDisburseStep('confirm');
      return;
    }
    // confirm step — execute
    const { payout, gatewayMethod, closeModal } = disburseModal;
    const gatewayLabel = gatewayMethod === 'bkash' ? 'bKash' : 'Nagad';
    try {
      const res = await disburseGatewayMutation.mutateAsync({
        payoutId: payout.id,
        payment_method: gatewayMethod,
        mobile_number: disburseNumber.trim()
      });
      const data = res?.data?.data;
      const isDemo = data?.isDemo;
      setDisburseModal(null);
      showToast(
        'success',
        `${gatewayLabel} Disbursement ${isDemo ? '(Demo) ' : ''}Successful!`,
        `Txn: ${data?.transactionID} • BDT ${data?.amount} → ${data?.receiver}`
      );
      if (closeModal) closeModal();
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || 'Disbursement failed';
      setDisburseModal(null);
      showToast('error', 'Disbursement Failed', msg);
    }
  };

  const handlePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { background: white !important; color: black !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        aside, header, nav, .no-print, button, select, input, .navbar, .sidebar { display: none !important; }
        .min-h-screen, .max-w-7xl, main, #root, .flex, .flex-1, #print-ledger-area { 
          min-height: auto !important; 
          height: auto !important;
          background: transparent !important; 
          padding: 0 !important; 
          margin: 0 !important; 
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
          overflow: visible !important;
          position: static !important;
        }
        .bg-white { background-color: white !important; }
        .print-header { 
          display: block !important; 
          margin-bottom: 20px !important;
          border-bottom: 2px solid #334155 !important;
          padding-bottom: 10px !important;
        }
        .print-header h1 {
          font-size: 24px !important;
          font-weight: bold !important;
          color: #0f172a !important;
          margin: 0 !important;
        }
        .print-header p {
          font-size: 11px !important;
          color: #64748b !important;
          margin: 4px 0 0 0 !important;
        }
        .print-summary { 
          display: grid !important; 
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 15px !important;
          margin-bottom: 25px !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 6px !important;
          padding: 12px !important;
          background-color: #f8fafc !important;
        }
        .print-summary span {
          display: block !important;
        }
        .print-summary span:first-child {
          font-size: 9px !important;
          text-transform: uppercase !important;
          color: #64748b !important;
          font-weight: bold !important;
        }
        .print-summary span:last-child {
          font-size: 13px !important;
          font-weight: bold !important;
          color: #0f172a !important;
          margin-top: 4px !important;
        }
        table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; margin-top: 10px !important; }
        th { 
          background-color: #f1f5f9 !important; 
          color: #1e293b !important; 
          font-weight: bold !important;
          text-transform: uppercase !important;
          border: 1px solid #cbd5e1 !important;
          padding: 8px 10px !important; 
          font-size: 10px !important; 
        }
        td { 
          border: 1px solid #cbd5e1 !important; 
          padding: 8px 10px !important; 
          font-size: 10px !important; 
          white-space: normal !important; 
          word-wrap: break-word !important;
          max-width: none !important;
          text-align: left !important;
          color: #334155 !important;
        }
        tr:nth-child(even) {
          background-color: #f8fafc !important;
        }
        th:nth-child(6), td:nth-child(6),
        th:nth-child(7), td:nth-child(7),
        th:nth-child(8), td:nth-child(8) {
          text-align: right !important;
        }
        .truncate { white-space: normal !important; overflow: visible !important; text-overflow: clip !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  const handleExportCSV = () => {
    if (!transactionsData?.transactions?.length) {
      showToast('error', 'Export Failed', 'No data available to export');
      return;
    }

    const headers = ['Date', 'Reference', 'Booking Ref', 'Guest', 'Property', 'Transaction Type', 'Notes', 'DR (Receivable)', 'CR (Paid)', 'Balance'];
    const rows = transactionsData.transactions.map(txn => [
      new Date(txn.created_at).toLocaleDateString(),
      txn.payment_reference || '',
      txn.booking_reference || '',
      txn.guest_name || '',
      txn.property_title || '',
      txn.transaction_type || '',
      txn.notes || '',
      txn.dr_amount || '0.00',
      txn.cr_amount || '0.00',
      txn.running_balance || '0.00'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transaction_ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 no-print">
          <h1 className="text-3xl font-bold text-gray-900">Accounting & Ledger</h1>
          <p className="text-gray-600 mt-2">Complete transaction history with DR/CR entries</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 no-print">
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
        {activeTab === 'transactions' && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 no-print">
              <div className={`grid grid-cols-1 ${view !== 'all' ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                  <select
                    value={view}
                    onChange={(e) => {
                      setView(e.target.value);
                      setSelectedEntity(null);
                    }}
                    className="input-field"
                  >
                    <option value="all">All Transactions</option>
                    <option value="owner">By Property Owner</option>
                    <option value="guest">By Guest</option>
                  </select>
                </div>

                {view === 'owner' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Owner</label>
                    <select
                      value={selectedEntity || ''}
                      onChange={(e) => setSelectedEntity(e.target.value || null)}
                      className="input-field"
                    >
                      <option value="">All Owners</option>
                      {ownersListData?.map(owner => (
                        <option key={owner.id} value={owner.id}>
                          {owner.owner_name} ({owner.business_name || 'No Business'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {view === 'guest' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Guest</label>
                    <select
                      value={selectedEntity || ''}
                      onChange={(e) => setSelectedEntity(e.target.value || null)}
                      className="input-field"
                    >
                      <option value="">All Guests</option>
                      {guestsListData?.map(guest => (
                        <option key={guest.id} value={guest.id}>
                          {guest.guest_name} ({guest.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 no-print">
                {/* Total Received from Guests */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Received</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(transactionsData.summary.total_guest_payments)}</p>
                      <p className="text-xs text-gray-500 mt-1">Received from guests</p>
                    </div>
                    <FiDollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                {/* Admin Commission Earned */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Admin Commission</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(transactionsData.summary.total_commission_earned)}</p>
                      <p className="text-xs text-gray-500 mt-1">Total commission earned</p>
                    </div>
                    <FiCheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                {/* Owner Share (Total owed to owners) */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Owner Share (Total)</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(transactionsData.summary.total_owner_earnings)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Total owed to all owners</p>
                    </div>
                    <FiUser className="w-8 h-8 text-purple-600" />
                  </div>
                </div>

                {/* Gateway Fees */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Gateway Fees</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(transactionsData.summary.total_gateway_fees || 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Payment gateway charges</p>
                    </div>
                    <FiCreditCard className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                {/* Paid to Owners */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Paid to Owners</p>
                      <p className="text-2xl font-bold text-indigo-600">{formatCurrency(transactionsData.summary.total_payouts_to_owners)}</p>
                      <p className="text-xs text-gray-500 mt-1">Completed payouts</p>
                    </div>
                    <FiCheckCircle className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>

                {/* Pending Payouts */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                      <p className="text-2xl font-bold text-yellow-600">{formatCurrency(transactionsData.summary.pending_payouts_to_owners)}</p>
                      <p className="text-xs text-gray-500 mt-1">Payout requests in progress</p>
                    </div>
                    <FiClock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>

                {/* Outstanding Balance (owed but not yet requested) */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Owner Outstanding</p>
                      <p className="text-2xl font-bold text-orange-600">{formatCurrency(transactionsData.summary.total_owner_outstanding)}</p>
                      <p className="text-xs text-gray-500 mt-1">Owed, not yet paid/requested</p>
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
                      <p className="text-xs text-gray-500 mt-1">Paid bookings in ledger</p>
                    </div>
                    <FiHome className="w-8 h-8 text-pink-600" />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Ledger Table */}
        {activeTab === 'transactions' && (
          <div id="print-ledger-area" className="bg-white rounded-lg shadow-sm overflow-hidden p-6 md:p-0">
          
          {/* Print Header (Visible ONLY on print) */}
          <div className="print-header hidden mb-6 border-b border-gray-300 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">KEYHOST HOMES</h1>
                <p className="text-xs text-gray-500 mt-1">Transaction Ledger & Financial Report</p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p><strong>Report Date:</strong> {new Date().toLocaleDateString('en-GB')}</p>
                <p><strong>Generated By:</strong> KeyHost Admin System</p>
              </div>
            </div>
          </div>

          {/* Print Financial Summary Grid (Visible ONLY on print) */}
          {transactionsData?.summary && (
            <div className="print-summary hidden grid grid-cols-4 gap-4 mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Total Received</span>
                <span className="text-sm font-bold text-blue-700">{formatCurrency(transactionsData.summary.total_guest_payments)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Admin Commission</span>
                <span className="text-sm font-bold text-green-700">{formatCurrency(transactionsData.summary.total_commission_earned)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Owed to Owners</span>
                <span className="text-sm font-bold text-purple-700">{formatCurrency(transactionsData.summary.total_owner_earnings)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Outstanding Balance</span>
                <span className="text-sm font-bold text-orange-600">{formatCurrency(transactionsData.summary.total_owner_outstanding)}</span>
              </div>
            </div>
          )}

          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center no-print">
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction Ledger
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="btn-secondary flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <FiEye className="w-4 h-4" />
                Print
              </button>
              <button 
                onClick={handleExportCSV}
                className="btn-secondary flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : transactionsData?.transactions?.length > 0 ? (
            <>
              {/* Desktop Table view (hidden on mobile) */}
              <div className="hidden md:block print:block overflow-x-auto">
                <table className="min-w-full table-fixed divide-y divide-gray-200">
                  <colgroup>
                    <col className="w-[10%]" />
                    <col className="w-[18%]" />
                    <col className="w-[12%]" />
                    <col className="w-[20%]" />
                    <col className="w-[15%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[9%]" />
                  </colgroup>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                      <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction</th>
                      <th className="px-2 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">DR (BDT)</th>
                      <th className="px-2 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">CR (BDT)</th>
                      <th className="px-2 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Bal (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionsData.transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-2 py-3 text-xs text-gray-900 whitespace-nowrap">
                          {new Date(txn.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-2 py-3 text-xs">
                          <div className="font-mono font-medium text-blue-600 truncate" title={txn.payment_reference}>{txn.payment_reference}</div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">{txn.booking_reference}</div>
                        </td>
                        <td className="px-2 py-3 text-xs text-gray-900 truncate" title={txn.guest_name}>
                          {txn.guest_name}
                        </td>
                        <td className="px-2 py-3 text-xs text-gray-900 whitespace-normal leading-snug break-words">
                          {txn.property_title}
                        </td>
                        <td className="px-2 py-3 text-xs whitespace-normal leading-tight break-words">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize ${getTransactionTypeColor(txn.transaction_type)}`}>
                            {txn.transaction_type?.replace('_', ' ')}
                          </span>
                          {txn.notes && <div className="text-[10px] text-gray-500 mt-1">{txn.notes}</div>}
                        </td>
                        <td className="px-2 py-3 text-xs text-right font-bold text-red-650 whitespace-nowrap">
                          {txn.dr_amount > 0 ? parseFloat(txn.dr_amount).toFixed(2) : '-'}
                        </td>
                        <td className="px-2 py-3 text-xs text-right font-bold text-green-700 whitespace-nowrap">
                          {txn.cr_amount > 0 ? parseFloat(txn.cr_amount).toFixed(2) : '-'}
                        </td>
                        <td className="px-2 py-3 text-xs text-right font-bold whitespace-nowrap">
                          <span className={txn.running_balance > 0 ? 'text-orange-600' : 'text-green-750'}>
                            {parseFloat(txn.running_balance || 0).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Totals row placed inside tbody so it prints only at the end of the last page, not on every page */}
                    <tr className="bg-gray-150 font-bold border-t-2 border-gray-300">
                      <td colSpan="5" className="px-2 py-3 text-sm text-right text-gray-700">Total</td>
                      <td className="px-2 py-3 text-xs text-right text-red-650 whitespace-nowrap">
                        {totalDR.toFixed(2)}
                      </td>
                      <td className="px-2 py-3 text-xs text-right text-green-700 whitespace-nowrap">
                        {totalCR.toFixed(2)}
                      </td>
                      <td className="px-2 py-3 text-xs text-right whitespace-nowrap">
                        <span className={finalBalance > 0 ? 'text-orange-600' : 'text-green-750'}>
                          {finalBalance.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile card view (hidden on desktop) */}
              <div className="grid grid-cols-1 gap-4 md:hidden print:hidden p-4">
                {transactionsData.transactions.map((txn) => (
                  <div key={txn.id} className="bg-white border border-gray-150 rounded-xl p-4 shadow-sm space-y-3 hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-semibold">
                        {new Date(txn.created_at).toLocaleDateString()}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${getTransactionTypeColor(txn.transaction_type)}`}>
                        {txn.transaction_type?.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Property</span>
                      <h4 className="text-sm font-semibold text-gray-900 leading-snug">
                        {txn.property_title}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-b border-gray-100 py-2.5 text-xs">
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Reference</span>
                        <span className="font-semibold text-blue-600 block truncate max-w-[120px]" title={txn.payment_reference}>{txn.payment_reference}</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">{txn.booking_reference}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Guest</span>
                        <span className="font-semibold text-gray-850 block truncate max-w-[120px]">{txn.guest_name}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end text-xs pt-1">
                      <div className="space-y-1">
                        {txn.dr_amount > 0 && (
                          <div>
                            <span className="text-[10px] text-gray-400 block">DR (Receivable)</span>
                            <span className="text-sm font-bold text-red-600">BDT {parseFloat(txn.dr_amount).toFixed(2)}</span>
                          </div>
                        )}
                        {txn.cr_amount > 0 && (
                          <div>
                            <span className="text-[10px] text-gray-400 block">CR (Paid)</span>
                            <span className="text-sm font-bold text-green-700">BDT {parseFloat(txn.cr_amount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Running Balance</span>
                        <span className={`text-sm font-extrabold ${txn.running_balance > 0 ? 'text-orange-600' : 'text-green-750'}`}>
                          BDT {parseFloat(txn.running_balance || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {txn.notes && (
                      <div className="bg-gray-50 border border-gray-100 rounded p-2.5 text-xs text-gray-500 italic mt-1 leading-relaxed">
                        {txn.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile total summary card */}
              <div className="md:hidden p-4 bg-gray-50 border-t border-gray-250 no-print">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-2">
                  <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Ledger Summary Total</h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Total DR (Receivable):</span>
                    <span className="font-bold text-red-600">BDT {totalDR.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">Total CR (Paid):</span>
                    <span className="font-bold text-green-700">BDT {totalCR.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-gray-100">
                    <span className="text-gray-950 font-bold">Final Balance:</span>
                    <span className={`font-extrabold ${finalBalance > 0 ? 'text-orange-600' : 'text-green-750'}`}>BDT {finalBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FiDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          )}
        </div>
        )}

        {/* Owner Payouts & Balances */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            {/* Host Balances / Available Dues Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-150 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <span>Host Payable Balances</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Unrequested & Available
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Live platform balances owed to hosts for completed online bookings before payout request</p>
                </div>
              </div>

              {balancesLoading ? (
                <div className="p-6 text-center"><LoadingSpinner /></div>
              ) : balancesData.filter(bal => parseFloat(bal.current_balance || 0) > 0).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-gray-100">
                    <thead className="bg-gray-50/80 text-gray-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Host / Business</th>
                        <th className="px-6 py-3">Total Earnings</th>
                        <th className="px-6 py-3">Total Paid</th>
                        <th className="px-6 py-3 text-right">Unrequested Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {balancesData
                        .filter(bal => parseFloat(bal.current_balance || 0) > 0)
                        .map((bal) => (
                        <tr key={bal.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-3">
                            <div className="font-bold text-gray-900">{bal.first_name} {bal.last_name}</div>
                            <div className="text-[11px] text-gray-500 font-medium">{bal.business_name || bal.email}</div>
                          </td>
                          <td className="px-6 py-3 font-semibold text-gray-700">
                            BDT {parseFloat(bal.total_earnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-3 font-semibold text-gray-500">
                            BDT {parseFloat(bal.total_payouts || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                              BDT {parseFloat(bal.current_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-gray-500 font-semibold">
                  ✓ No hosts currently have pending unrequested balances. All payouts are up to date!
                </div>
              )}
            </div>

            {/* Owner Payout Requests Table */}
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
              <>
                {/* Desktop view: Compact no-scroll table */}
                <div className="hidden md:block">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">
                          Owner / Reference
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[20%]">
                          Amount / Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-[35%]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {payoutsData.payouts.map((payout) => (
                        <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                          {/* Col 1: Owner + Reference */}
                          <td className="px-4 py-3">
                            <div className="font-semibold text-sm text-gray-900 truncate max-w-[180px]">
                              {`${payout.first_name} ${payout.last_name}`}
                              {payout.business_name && payout.business_name.trim() !== `${payout.first_name} ${payout.last_name}`.trim() && (
                                <span className="block text-[11px] text-gray-500 font-normal truncate">{payout.business_name}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500" title={payout.payout_reference}>
                                {payout.payout_reference.replace('OWNER-PAYOUT-REQ-', '#')}
                              </span>
                              <span className="text-[10px] text-gray-400">{payout.items_count} bookings</span>
                            </div>
                          </td>

                          {/* Col 2: Amount + Date */}
                          <td className="px-4 py-3">
                            <div className="text-sm font-bold text-gray-900">BDT {parseFloat(payout.net_payout).toLocaleString()}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5 capitalize">
                              {payout.payment_method?.replace(/_/g, ' ')} • {new Date(payout.created_at).toLocaleDateString('en-BD', { day:'2-digit', month:'short' })}
                            </div>
                          </td>

                          {/* Col 3: Status badge */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getPaymentStatusColor(payout.payment_status)}`}>
                              {payout.payment_status}
                            </span>
                          </td>

                          {/* Col 4: Actions — compact, right-aligned */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* View Details */}
                              <button
                                onClick={() => handleViewDetails(payout)}
                                title="View Details"
                                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-md border border-blue-200 transition-colors"
                              >
                                <FiEye className="h-3.5 w-3.5" />
                                View
                              </button>

                              {/* Pay bKash */}
                              {['pending', 'processing', 'failed'].includes(payout.payment_status) && (
                                <>
                                  <button
                                    onClick={() => handleDisburseGateway(payout, 'bkash', null)}
                                    disabled={disburseGatewayMutation.isLoading}
                                    title="Disburse via bKash"
                                    className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-md text-white bg-[#D12053] hover:bg-[#a8173f] disabled:opacity-50 transition-colors shadow-sm"
                                  >
                                    💸 bKash
                                  </button>
                                  <button
                                    onClick={() => handleDisburseGateway(payout, 'nagad', null)}
                                    disabled={disburseGatewayMutation.isLoading}
                                    title="Disburse via Nagad"
                                    className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-md text-white bg-[#F57C20] hover:bg-[#c96010] disabled:opacity-50 transition-colors shadow-sm"
                                  >
                                    💸 Nagad
                                  </button>
                                </>
                              )}

                              {/* Manual status actions */}
                              {payout.payment_status === 'pending' && (
                                <button
                                  onClick={() => handleProcessPayout(payout)}
                                  disabled={updatePayoutStatusMutation.isLoading}
                                  className="inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                  {updatePayoutStatusMutation.isLoading ? '...' : 'Processing'}
                                </button>
                              )}
                              {payout.payment_status === 'processing' && (
                                <button
                                  onClick={() => handleCompletePayout(payout)}
                                  disabled={updatePayoutStatusMutation.isLoading}
                                  className="inline-flex items-center text-xs font-medium px-2.5 py-1.5 rounded-md border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                                >
                                  {updatePayoutStatusMutation.isLoading ? '...' : '✓ Complete'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>


                {/* Mobile view: Card list */}
                <div className="md:hidden divide-y divide-gray-150">
                  {payoutsData.payouts.map((payout) => (
                    <div key={payout.id} className="p-4 space-y-3 bg-white">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600" title={payout.payout_reference}>
                          {payout.payout_reference.replace('OWNER-PAYOUT-REQ-', 'REQ-')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getPaymentStatusColor(payout.payment_status)}`}>
                          {payout.payment_status}
                        </span>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">
                            {payout.business_name || `${payout.first_name} ${payout.last_name}`}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {payout.items_count} bookings • {new Date(payout.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-gray-900 block">BDT {payout.net_payout}</span>
                          <span className="text-[10px] text-gray-400 block">Total: BDT {payout.total_earnings}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-100">
                        <span className="text-gray-500">
                          Method: <strong className="capitalize text-gray-700">{payout.payment_method?.replace('_', ' ')}</strong>
                        </span>
                        <button 
                          onClick={() => handleViewDetails(payout)}
                          className="text-blue-600 hover:text-blue-800 font-bold px-2 py-1 rounded bg-blue-50 flex items-center"
                        >
                          <FiEye className="mr-1 h-3.5 w-3.5" />
                          Details
                        </button>
                      </div>

                      {/* Mobile disbursement buttons */}
                      {['pending', 'processing', 'failed'].includes(payout.payment_status) && (
                        <div className="grid grid-cols-2 gap-2 pt-1.5">
                          <button
                            onClick={() => handleDisburseGateway(payout, 'bkash', null)}
                            disabled={disburseGatewayMutation.isLoading}
                            className="w-full text-xs font-bold py-2 rounded-lg text-white bg-[#D12053] hover:bg-[#a8173f] disabled:opacity-50 shadow-sm"
                          >
                            {disburseGatewayMutation.isLoading ? '⏳ Sending...' : '💸 Pay bKash'}
                          </button>
                          <button
                            onClick={() => handleDisburseGateway(payout, 'nagad', null)}
                            disabled={disburseGatewayMutation.isLoading}
                            className="w-full text-xs font-bold py-2 rounded-lg text-white bg-[#F57C20] hover:bg-[#c96010] disabled:opacity-50 shadow-sm"
                          >
                            {disburseGatewayMutation.isLoading ? '⏳ Sending...' : '💸 Pay Nagad'}
                          </button>
                        </div>
                      )}

                      {/* Manual Action buttons on mobile */}
                      {payout.payment_status === 'pending' && (
                        <button 
                          onClick={() => handleProcessPayout(payout)}
                          disabled={updatePayoutStatusMutation.isLoading}
                          className="w-full text-xs font-bold py-2 border border-gray-300 rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
                        >
                          {updatePayoutStatusMutation.isLoading ? 'Processing...' : 'Mark as Processing'}
                        </button>
                      )}
                      {payout.payment_status === 'processing' && (
                        <button 
                          onClick={() => handleCompletePayout(payout)}
                          disabled={updatePayoutStatusMutation.isLoading}
                          className="w-full text-xs font-bold py-2 border border-green-300 rounded-lg text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                        >
                          {updatePayoutStatusMutation.isLoading ? 'Completing...' : 'Mark as Completed'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FiDollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No payouts found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            )}
          </div>
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
                      <div className="mt-1 text-sm text-gray-900 font-semibold">
                        {`${payoutDetails.payout.first_name} ${payoutDetails.payout.last_name}`}
                        {payoutDetails.payout.business_name && payoutDetails.payout.business_name.trim() !== `${payoutDetails.payout.first_name} ${payoutDetails.payout.last_name}`.trim() && (
                          <span className="block text-xs text-gray-500 font-normal mt-0.5">{payoutDetails.payout.business_name}</span>
                        )}
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

                  {payoutDetails.payout.payment_reference && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Transaction ID / Reference</label>
                        <div className="mt-1 text-sm font-mono font-bold text-slate-800 bg-white border border-slate-200 rounded px-2.5 py-1 max-w-max select-all" title="Click to select all">
                          {payoutDetails.payout.payment_reference}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Payment Date</label>
                        <div className="mt-1 text-sm text-slate-700">
                          {payoutDetails.payout.payment_date 
                            ? new Date(payoutDetails.payout.payment_date).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' })
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

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
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Booking Reference</th>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Property</th>
                              <th className="px-3 py-2.5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Booking Total (BDT)</th>
                              <th className="px-3 py-2.5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Commission (BDT)</th>
                              <th className="px-3 py-2.5 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">Owner Earnings (BDT)</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {payoutDetails.items.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">
                                  {item.booking_date 
                                    ? new Date(item.booking_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
                                    : 'N/A'}
                                </td>
                                <td className="px-3 py-2 text-xs">
                                  <span className="font-mono font-bold text-gray-900 block">{item.booking_reference}</span>
                                  {item.transaction_id && item.transaction_id !== 'N/A' && (
                                    <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px] text-gray-400">
                                      <span className="select-all truncate max-w-[140px]" title={`Transaction ID: ${item.transaction_id}`}>
                                        {item.transaction_id}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => handleCopyTxnId(item.transaction_id, e)}
                                        className="text-gray-400 hover:text-[#004e59] transition-colors p-0.5 flex items-center justify-center shrink-0"
                                        title="Copy Transaction ID"
                                      >
                                        {copiedTxnId === item.transaction_id ? (
                                          <FiCheck size={11} className="text-emerald-500 animate-scale-up" />
                                        ) : (
                                          <FiCopy size={10} />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleVerifyGateway(item, e)}
                                        className="text-gray-400 hover:text-emerald-600 transition-colors p-0.5 flex items-center justify-center shrink-0"
                                        title="Verify Live with Gateway API"
                                      >
                                        <FiCheckCircle size={11} className="hover:scale-110 transition-transform" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-700 max-w-[120px] truncate" title={item.guest_name}>{item.guest_name || 'N/A'}</td>
                                <td className="px-3 py-2 text-xs text-gray-600 max-w-[150px] truncate" title={item.property_title}>{item.property_title || 'N/A'}</td>
                                <td className="px-3 py-2 text-xs font-medium text-right text-gray-900">{parseFloat(item.booking_total).toFixed(2)}</td>
                                <td className="px-3 py-2 text-xs font-medium text-right text-red-600">-{parseFloat(item.admin_commission).toFixed(2)}</td>
                                <td className="px-3 py-2 text-xs font-semibold text-right text-green-600">{parseFloat(item.owner_earnings).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                            <tr className="font-bold text-gray-950">
                              <td colSpan="4" className="px-3 py-2.5 text-left text-xs uppercase tracking-wider">Total</td>
                              <td className="px-3 py-2.5 text-xs text-right">
                                {payoutDetails.items.reduce((sum, item) => sum + (parseFloat(item.booking_total) || 0), 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5 text-xs text-right text-red-700">
                                -{payoutDetails.items.reduce((sum, item) => sum + (parseFloat(item.admin_commission) || 0), 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5 text-xs text-right text-green-700">
                                {payoutDetails.items.reduce((sum, item) => sum + (parseFloat(item.owner_earnings) || 0), 0).toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t flex-wrap gap-y-2">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Close
                    </button>
                    {/* Gateway Disburse Buttons in Modal */}
                    {['pending', 'processing', 'failed'].includes(payoutDetails.payout.payment_status) && (
                      <>
                        <button
                          onClick={() => handleDisburseGateway(payoutDetails.payout, 'bkash', () => setShowDetailsModal(false))}
                          disabled={disburseGatewayMutation.isLoading}
                          className="px-4 py-2 text-sm font-semibold text-white rounded-md bg-[#D12053] hover:bg-[#a8173f] disabled:opacity-50"
                        >
                          {disburseGatewayMutation.isLoading ? '⏳ Processing...' : '💸 Disburse via bKash'}
                        </button>
                        <button
                          onClick={() => handleDisburseGateway(payoutDetails.payout, 'nagad', () => setShowDetailsModal(false))}
                          disabled={disburseGatewayMutation.isLoading}
                          className="px-4 py-2 text-sm font-semibold text-white rounded-md bg-[#F57C20] hover:bg-[#c96010] disabled:opacity-50"
                        >
                          {disburseGatewayMutation.isLoading ? '⏳ Processing...' : '💸 Disburse via Nagad'}
                        </button>
                      </>
                    )}
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
        {/* Disburse Modal */}
        {disburseModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-65 flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 border border-gray-150">
              {/* Header */}
              <div 
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{ borderTop: `4px solid ${disburseModal.gatewayMethod === 'bkash' ? '#D12053' : '#F57C20'}` }}
              >
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span>💸</span>
                  Disburse via {disburseModal.gatewayMethod === 'bkash' ? 'bKash' : 'Nagad'}
                </h3>
                <button 
                  onClick={() => setDisburseModal(null)} 
                  className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500 font-semibold uppercase">Payout Amount</div>
                    <div className="text-xl font-black text-gray-900">BDT {parseFloat(disburseModal.payout.net_payout).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 font-semibold uppercase">Reference</div>
                    <div className="text-sm font-mono font-bold text-gray-600">
                      {disburseModal.payout.payout_reference.replace('OWNER-PAYOUT-REQ-', '#')}
                    </div>
                  </div>
                </div>

                {disburseStep === 'input' ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Receiver {disburseModal.gatewayMethod === 'bkash' ? 'bKash' : 'Nagad'} Wallet Number
                    </label>
                    {/* Host saved MFS info badge */}
                    {disburseModal.payout.mfs_provider === disburseModal.gatewayMethod && disburseModal.payout.mfs_wallet_number ? (
                      <div className="flex items-start gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs">
                        <span className="mt-0.5 text-green-600 font-black">✓</span>
                        <div>
                          <span className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5">From Profile</span>
                          <span className="font-mono font-bold text-green-900">{disburseModal.payout.mfs_wallet_number}</span>
                          {disburseModal.payout.mfs_account_name && (
                            <span className="ml-1.5 text-green-700">({disburseModal.payout.mfs_account_name})</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                        <span>⚠️</span>
                        <span>No {disburseModal.gatewayMethod === 'bkash' ? 'bKash' : 'Nagad'} number saved in host profile. Enter manually.</span>
                      </div>
                    )}
                    <input
                      type="text"
                      value={disburseNumber}
                      onChange={(e) => setDisburseNumber(e.target.value)}
                      placeholder="e.g. 01712345678"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                        disburseNumberError 
                          ? 'border-red-500 focus:ring-red-400' 
                          : 'border-gray-300 focus:ring-blue-400'
                      }`}
                    />
                    {disburseNumberError && (
                      <p className="text-xs font-semibold text-red-600 flex items-center gap-1">
                        <span>⚠️</span> {disburseNumberError}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Please verify that the host's wallet allows receiving this disbursement limit.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-sm text-amber-800 space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        <span>⚠️</span> Double Check Wallet Number!
                      </p>
                      <p>
                        Are you sure you want to send BDT <strong>{parseFloat(disburseModal.payout.net_payout).toLocaleString()}</strong> to the mobile wallet:
                      </p>
                      <p className="text-lg font-mono font-black text-center py-1.5 bg-white border border-amber-300 rounded mt-1.5 tracking-wider text-amber-900">
                        {disburseNumber}
                      </p>
                      <p className="text-xs text-amber-600 mt-1 italic">
                        This is an automatic transaction. It cannot be undone or refunded.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                <button
                  onClick={() => disburseStep === 'confirm' ? setDisburseStep('input') : setDisburseModal(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-150 rounded-lg transition-colors"
                >
                  {disburseStep === 'confirm' ? 'Back' : 'Cancel'}
                </button>
                <button
                  onClick={submitDisburseGateway}
                  disabled={disburseGatewayMutation.isLoading}
                  className="px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  style={{ backgroundColor: disburseModal.gatewayMethod === 'bkash' ? '#D12053' : '#F57C20' }}
                >
                  {disburseGatewayMutation.isLoading ? (
                    <>⏳ Processing...</>
                  ) : disburseStep === 'input' ? (
                    <>Next Step ➔</>
                  ) : (
                    <>Confirm & Pay BDT {parseFloat(disburseModal.payout.net_payout).toLocaleString()}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Payout Modal */}
        {completeModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-65 flex items-center justify-center z-[100] animate-fade-in p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-150">
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-150 bg-green-50">
                <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                  <span>✓</span>
                  Mark Payout Completed
                </h3>
                <button 
                  onClick={() => setCompleteModal(null)} 
                  className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-green-100"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Payment Reference / Txn ID *
                  </label>
                  <input
                    type="text"
                    value={completeRef}
                    onChange={(e) => setCompleteRef(e.target.value)}
                    placeholder="Enter transaction reference ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Internal Notes (Optional)
                  </label>
                  <textarea
                    value={completeNotes}
                    onChange={(e) => setCompleteNotes(e.target.value)}
                    placeholder="Add manual payout description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-sm"
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                <button
                  onClick={() => setCompleteModal(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-150 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCompletePayout}
                  disabled={!completeRef.trim() || updatePayoutStatusMutation.isLoading}
                  className="px-5 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors shadow-md"
                >
                  {updatePayoutStatusMutation.isLoading ? 'Processing...' : 'Complete Payout'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gateway Verification Modal */}
        {verifyingBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setVerifyingBooking(null)}>
            <div 
              className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 capitalize flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#004e59] animate-pulse"></span>
                    Gateway Live Query
                  </h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Booking Ref: {verifyingBooking.booking_reference}</p>
                </div>
                <button 
                  onClick={() => setVerifyingBooking(null)}
                  className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {isVerifying && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <LoadingSpinner />
                    <span className="text-xs font-semibold text-gray-500 animate-pulse">Contacting gateway secure server...</span>
                  </div>
                )}

                {verificationError && (
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3 border border-rose-100">
                      <FiXCircle size={24} />
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 mb-1">Gateway Connection Failed</h4>
                    <p className="text-xxs text-gray-400 font-semibold max-w-xs leading-relaxed mb-4">{verificationError}</p>
                    <button 
                      onClick={(e) => handleVerifyGateway(verifyingBooking, e)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xxs font-bold transition-colors"
                    >
                      Retry Check
                    </button>
                  </div>
                )}

                {verificationData && (
                  <div className="space-y-4">
                    {/* Status Header Badge */}
                    <div className="flex flex-col items-center text-center pb-4 border-b border-gray-100">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2.5 border border-emerald-100">
                        <FiCheckCircle size={26} />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {verificationData.status || 'Verified'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold mt-1">Live Payment Verified</span>
                    </div>

                    {/* Verification Info Grid */}
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-left bg-gray-50/50 rounded-2xl p-4 border border-gray-150">
                      <div>
                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Gateway Txn ID</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] font-mono font-bold text-gray-800 select-all">{verificationData.transactionId}</span>
                          <button 
                            onClick={(e) => handleCopyTxnId(verificationData.transactionId, e)}
                            className="text-gray-400 hover:text-gray-700 p-0.5"
                          >
                            {copiedTxnId === verificationData.transactionId ? <FiCheck size={10} className="text-emerald-600 animate-scale-up" /> : <FiCopy size={9} />}
                          </button>
                        </div>
                      </div>

                      {verificationData.bankTranId && (
                        <div>
                          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Bank Tran ID</span>
                          <span className="block text-[10px] font-mono font-bold text-gray-800 mt-0.5 select-all">{verificationData.bankTranId}</span>
                        </div>
                      )}

                      <div>
                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Gateway Amount</span>
                        <span className="block text-[11px] font-bold text-emerald-700 mt-0.5">
                          BDT {verificationData.amount} {verificationData.currency || 'BDT'}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Booking Total</span>
                        <span className="block text-[11px] font-bold text-gray-750 mt-0.5">
                          BDT {verifyingBooking.booking_total}
                        </span>
                      </div>

                      <div className="col-span-2 border-t border-gray-150 pt-2.5">
                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Payer Details</span>
                        <span className="block text-[10px] font-bold text-gray-800 mt-0.5 truncate" title={verificationData.payerDetails}>
                          {verificationData.payerDetails || '—'}
                        </span>
                      </div>

                      {verificationData.paymentTime && (
                        <div className="col-span-2">
                          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Payment Timestamp</span>
                          <span className="block text-[10px] font-bold text-gray-600 mt-0.5 font-mono">
                            {verificationData.paymentTime}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[10px] text-gray-400 font-semibold text-center italic leading-normal">
                      Reconciliation check completes successfully if amounts and Transaction IDs match.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button 
                  onClick={() => setVerifyingBooking(null)}
                  className="px-4 py-2 bg-[#004e59] hover:bg-[#004e59]/90 text-white rounded-lg text-xxs font-bold transition-all shadow-sm hover:shadow"
                >
                  Dismiss Check
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-[200] max-w-sm w-full bg-white rounded-xl shadow-2xl border border-gray-100 p-4 animate-slide-up flex gap-3 items-start">
            <div className={`text-xl p-1 rounded-lg ${toast.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {toast.type === 'success' ? '✓' : '✗'}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm text-gray-900">{toast.title}</div>
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{toast.message}</div>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600">
              <FiX className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccounting;


