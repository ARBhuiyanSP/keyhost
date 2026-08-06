import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiCheckCircle, FiClock, FiDollarSign, FiInfo, FiEye, FiShield, FiAlertTriangle, FiArrowRight, FiXCircle } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminSecurityDeposits = () => {
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState([]);
  const [stats, setStats] = useState({
    total_held: 0,
    pending_claims: 0,
    total_claimed: 0,
    total_released: 0
  });
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

  const [searchTerm, setSearchTerm] = useState('');

  const { showSuccess, showError } = useToast();

  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [actionData, setActionData] = useState({ deduction_amount: '', reason: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search filter input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    fetchDeposits();
  }, [filters]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        page: filters.page.toString(),
        limit: filters.limit.toString()
      });
      const response = await api.get(`/admin/security-deposits?${params}`);
      setDeposits(response.data.data.deposits);
      setStats(response.data.data.stats || { total_held: 0, pending_claims: 0, total_claimed: 0, total_released: 0 });
      setPagination(response.data.data.pagination);
    } catch (err) {
      showError('Failed to fetch security deposits');
    } finally {
      setLoading(false);
    }
  };

  const openDetailsModal = (deposit) => {
    setSelectedDeposit(deposit);
    setActionData({
      deduction_amount: deposit.security_deposit_status === 'claim_requested' ? deposit.security_deposit_claim_amount : '',
      reason: deposit.security_deposit_status === 'claim_requested' ? deposit.security_deposit_claim_reason : '',
      notes: ''
    });
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedDeposit(null);
    setIsDetailsModalOpen(false);
  };

  const handleFullRelease = async () => {
    if (!selectedDeposit) return;
    setIsSubmitting(true);
    try {
      await api.post(`/admin/bookings/${selectedDeposit.id}/security-deposit-deduction`, {
        deduction_amount: 0,
        reason: 'Full Release',
        notes: actionData.notes || 'Full release by Admin'
      });
      showSuccess('Security deposit fully released successfully');
      closeDetailsModal();
      fetchDeposits();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to release security deposit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeduction = async () => {
    if (!selectedDeposit) return;
    const amount = parseFloat(actionData.deduction_amount || 0);
    
    if (isNaN(amount) || amount < 0) {
      showError('Please enter a valid deduction amount');
      return;
    }

    if (amount > parseFloat(selectedDeposit.security_deposit)) {
      showError('Deduction amount cannot exceed security deposit');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/admin/bookings/${selectedDeposit.id}/security-deposit-deduction`, {
        deduction_amount: amount,
        reason: actionData.reason || 'Deduction for claims/damages',
        notes: actionData.notes || ''
      });
      showSuccess(`Processed deduction of BDT ${amount} successfully`);
      closeDetailsModal();
      fetchDeposits();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to process deduction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase().trim();
    if (s === 'claim_requested') {
      return (
        <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 w-fit">
          <FiAlertTriangle className="animate-pulse" /> Claim Requested
        </span>
      );
    } else if (s === 'processed') {
      return (
        <span className="bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 w-fit">
          <FiCheckCircle /> Processed
        </span>
      );
    }
    return (
      <span className="bg-yellow-50 text-yellow-700 border border-yellow-100 px-2.5 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5 w-fit">
        <FiClock /> Pending Release
      </span>
    );
  };

  const formatCurrency = (amount) => {
    const value = parseFloat(amount || 0);
    const hasDecimals = value % 1 !== 0;
    return '৳' + value.toLocaleString('en-IN', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: 2
    });
  };

  const activeTab = filters.status;

  const handleTabChange = (status) => {
    setFilters({ ...filters, status, page: 1 });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FiShield className="text-primary-600 shrink-0" />
              Security Deposits
            </h1>
            <p className="text-gray-500 mt-1">Manage guest security deposit releases and host claim resolutions</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Held</span>
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg shrink-0">
                <FiClock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-800 mt-4">{formatCurrency(stats.total_held)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Claims</span>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg shrink-0">
                <FiAlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-800 mt-4">{stats.pending_claims} Bookings</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Claimed</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                <FiDollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-800 mt-4">{formatCurrency(stats.total_claimed)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Released</span>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg shrink-0">
                <FiCheckCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-800 mt-4">{formatCurrency(stats.total_released)}</p>
          </div>
        </div>

        {/* Filters Bar & Tab View */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 mb-6 space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
            <button
              onClick={() => handleTabChange('')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === '' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              All Deposits
            </button>
            <button
              onClick={() => handleTabChange('pending')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Pending Release
            </button>
            <button
              onClick={() => handleTabChange('claim_requested')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'claim_requested' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Claims Requested
            </button>
            <button
              onClick={() => handleTabChange('processed')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'processed' ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Processed
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[240px] relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Booking Ref, Guest, Property..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          {/* Subtle top loading bar indicator */}
          {loading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary-100 overflow-hidden z-10">
              <div className="h-full bg-primary-600 animate-pulse w-full"></div>
            </div>
          )}

          {loading && deposits.length === 0 ? (
            <div className="p-12"><LoadingSpinner /></div>
          ) : deposits.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
               <FiInfo className="text-4xl opacity-20" />
               <p className="text-sm font-medium">No security deposits found.</p>
            </div>
          ) : (
            <div className={`overflow-x-auto transition-opacity duration-200 ${loading ? 'opacity-60' : 'opacity-100'}`}>
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Booking Ref</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest & Property</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Host</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Checkout Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Deposit Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Claim Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deposits.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-gray-900">{deposit.booking_reference}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-bold text-gray-900">{deposit.guest_first_name} {deposit.guest_last_name}</p>
                          <p className="text-gray-500 truncate max-w-[200px]" title={deposit.property_title}>{deposit.property_title}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-bold text-gray-800">{deposit.owner_first_name} {deposit.owner_last_name}</p>
                          <p className="text-gray-500 text-xs">{deposit.owner_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-700">
                          {deposit.check_out_date ? new Date(deposit.check_out_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {formatCurrency(deposit.security_deposit)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(deposit.security_deposit_status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetailsModal(deposit)}
                          className="px-3.5 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 border border-gray-100 transition-colors text-xs font-bold flex items-center gap-1.5 ml-auto"
                        >
                          <FiEye /> Process
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
           <div className="flex justify-center items-center mt-6 gap-3">
             <button 
               disabled={pagination.currentPage === 1}
               onClick={() => setFilters({...filters, page: filters.page - 1})}
               className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors"
             >
               Prev
             </button>
             <span className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">
               {pagination.currentPage} / {pagination.totalPages}
             </span>
             <button 
               disabled={pagination.currentPage === pagination.totalPages}
               onClick={() => setFilters({...filters, page: filters.page + 1})}
               className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-semibold disabled:opacity-50 hover:bg-gray-50 transition-colors"
             >
               Next
             </button>
           </div>
        )}
      </div>

      {/* Details & Processing Drawer Modal */}
      {isDetailsModalOpen && selectedDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 animate-slideUp">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FiShield className="text-primary-600" />
                Process Security Deposit
              </h3>
              <button 
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 transition-colors hover:bg-gray-100"
              >
                <FiXCircle className="text-2xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full space-y-6">
              
              <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <span className="text-sm font-bold text-gray-700">Current Status:</span>
                {getStatusBadge(selectedDeposit.security_deposit_status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stay Metadata */}
                <div>
                  <h4 className="font-bold text-gray-700 mb-2.5 uppercase text-xs tracking-wider">Stay Information</h4>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2.5 text-sm border border-gray-100">
                    <p className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Ref Code:</span>
                      <span className="font-mono font-bold text-gray-900">{selectedDeposit.booking_reference}</span>
                    </p>
                    <p className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Property:</span>
                      <span className="text-gray-900 text-right w-2/3 truncate font-medium" title={selectedDeposit.property_title}>{selectedDeposit.property_title}</span>
                    </p>
                    <p className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Guest:</span>
                      <span className="text-gray-900 font-medium">{selectedDeposit.guest_first_name} {selectedDeposit.guest_last_name}</span>
                    </p>
                    <p className="flex justify-between border-b border-gray-200/50 pb-1.5">
                      <span className="text-gray-500">Guest Phone:</span>
                      <span className="text-gray-900 font-medium">{selectedDeposit.guest_phone || 'N/A'}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Stay Dates:</span>
                      <span className="text-gray-900 font-medium text-xs">
                        {selectedDeposit.check_in_date} <FiArrowRight className="inline mx-1" /> {selectedDeposit.check_out_date}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Deposit Metadata */}
                <div>
                  <h4 className="font-bold text-gray-700 mb-2.5 uppercase text-xs tracking-wider">Financial Snapshot</h4>
                  <div className="bg-primary-50/30 p-4 rounded-xl space-y-2.5 text-sm border border-primary-50">
                    <p className="flex justify-between border-b border-primary-100/30 pb-1.5">
                      <span className="text-gray-600">Total Security Deposit:</span>
                      <span className="font-bold text-gray-900 text-base">{formatCurrency(selectedDeposit.security_deposit)}</span>
                    </p>
                    <p className="flex justify-between border-b border-primary-100/30 pb-1.5">
                      <span className="text-gray-600">Host Claims Requested:</span>
                      <span className="font-bold text-red-600">{formatCurrency(selectedDeposit.security_deposit_claim_amount)}</span>
                    </p>
                    <p className="flex justify-between border-b border-primary-100/30 pb-1.5">
                      <span className="text-gray-600">Deduction Processed:</span>
                      <span className="font-bold text-rose-600">{formatCurrency(selectedDeposit.security_deposit_deduction_amount)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-600">Total Booking Bill:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(selectedDeposit.total_amount)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Host Claims Information */}
              {selectedDeposit.security_deposit_status === 'claim_requested' && (
                <div className="bg-red-50/50 p-4.5 rounded-xl border border-red-100/50 space-y-2.5">
                  <h4 className="font-bold text-red-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <FiAlertTriangle /> Host Claim Details
                  </h4>
                  <div className="text-sm space-y-2">
                    <p className="text-gray-700">
                      <span className="font-bold">Claim Amount: </span> 
                      <span className="text-red-700 font-bold">{formatCurrency(selectedDeposit.security_deposit_claim_amount)}</span>
                    </p>
                    {selectedDeposit.security_deposit_claim_at && (
                      <p className="text-gray-500 text-xs">
                        Requested: {new Date(selectedDeposit.security_deposit_claim_at).toLocaleString()}
                      </p>
                    )}
                    <div className="bg-white p-3 rounded-lg border border-red-100/80 text-gray-700">
                      <span className="text-xs text-gray-400 block mb-1">Reason provided by Host:</span>
                      <p className="italic font-medium text-sm">"{selectedDeposit.security_deposit_claim_reason || 'No reason provided'}"</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Controls Section */}
              {selectedDeposit.security_deposit_status !== 'processed' ? (
                <div className="border-t border-gray-100 pt-6 space-y-6">
                  <h4 className="font-black text-gray-900 text-sm">Resolve Action</h4>
                  
                  {/* Action Forms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Release */}
                    <div className="bg-green-50/30 p-5 rounded-2xl border border-green-100 flex flex-col justify-between space-y-4">
                      <div>
                        <h5 className="font-bold text-green-800 text-sm mb-1">Release Full Deposit</h5>
                        <p className="text-xs text-gray-500">Refund the complete deposit of {formatCurrency(selectedDeposit.security_deposit)} back to the guest. No owner deductions will be applied.</p>
                      </div>
                      <button
                        onClick={handleFullRelease}
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md shadow-green-100 transition-all text-xs disabled:opacity-50"
                      >
                        {isSubmitting ? 'Processing...' : `Confirm Full Release (${formatCurrency(selectedDeposit.security_deposit)})`}
                      </button>
                    </div>

                    {/* Claim / Deduct */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                      <h5 className="font-bold text-gray-800 text-sm">Apply Custom Deduction</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">Deduction Amount (BDT)</label>
                          <input
                            type="number"
                            value={actionData.deduction_amount}
                            onChange={(e) => setActionData({ ...actionData, deduction_amount: e.target.value })}
                            placeholder="e.g. 50"
                            className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">Claim Reason</label>
                          <input
                            type="text"
                            value={actionData.reason}
                            onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                            placeholder="e.g. Damage to furniture"
                            className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">Internal Notes (Optional)</label>
                          <textarea
                            value={actionData.notes}
                            onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                            placeholder="Add brief details here..."
                            className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[60px]"
                          />
                        </div>
                        <button
                          onClick={handleDeduction}
                          disabled={isSubmitting}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-100 transition-all text-xs disabled:opacity-50"
                        >
                          {isSubmitting ? 'Processing...' : 'Confirm Deduction & Claim'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-2 text-sm text-green-800">
                  <FiCheckCircle className="shrink-0 text-green-600 w-5 h-5" />
                  <div>
                    <p className="font-bold">Resolution Complete</p>
                    <p className="text-xs text-green-700 mt-0.5">This security deposit was resolved and processed on the booking ledger.</p>
                  </div>
                </div>
              )}

            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSecurityDeposits;
