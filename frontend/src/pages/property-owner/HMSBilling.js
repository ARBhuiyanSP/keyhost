import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { 
    FiFileText, FiPlus, FiTrash2, FiSearch, FiDollarSign, 
    FiPrinter, FiUser, FiHome, FiCheckCircle, FiClock, FiX, FiCalendar,
    FiLink, FiCopy, FiExternalLink, FiRefreshCw, FiArrowLeft
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice } from '../../utils/textUtils';

const HMSBilling = () => {
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const urlBookingId = queryParams.get('bookingId');
    const urlPropertyId = queryParams.get('propertyId');

    const { showSuccess, showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showChargeForm, setShowChargeForm] = useState(false);
    const [showSettlementPreview, setShowSettlementPreview] = useState(false);
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [settleMethod, setSettleMethod] = useState('desk'); // 'desk', 'link'
    const [paymentLink, setPaymentLink] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    
    const [chargeForm, setChargeForm] = useState({
        service_name: '',
        amount: ''
    });

    // Fetch user's properties
    const { data: propertiesData, isLoading: loadingProperties } = useQuery(
        'owner-properties-list',
        () => api.get('/property-owner/properties?limit=100'),
        {
            select: (res) => res.data?.data?.properties?.filter(p => p.is_hms_enabled) || []
        }
    );

    // Fetch active reservations
    const { data: reservationsData, isLoading: loadingReservations, refetch: refetchReservations } = useQuery(
        ['hms-active-reservations', selectedPropertyId],
        () => api.get(`/property-owner/hms/reservations/${selectedPropertyId}`),
        {
            enabled: !!selectedPropertyId,
            select: (res) => res.data?.data?.reservations?.filter(b => b.status === 'confirmed' || b.status === 'checked_in') || []
        }
    );

    // Fetch bills for selected reservation
    const { data: billsData, isLoading: loadingBills, refetch: refetchBills } = useQuery(
        ['hms-booking-bills', selectedBooking?.id],
        () => api.get(`/property-owner/hms-mgmt/bills/${selectedBooking?.id}`),
        {
            enabled: !!selectedBooking?.id,
            select: (res) => res.data?.data?.bills || []
        }
    );

    useEffect(() => {
        if (urlPropertyId && !selectedPropertyId) {
            setSelectedPropertyId(urlPropertyId);
        } else if (propertiesData?.length > 0 && !selectedPropertyId) {
            setSelectedPropertyId(propertiesData[0].id);
        }
    }, [propertiesData, urlPropertyId]);

    // Keep selectedBooking in sync with reservationsData and handle URL param
    useEffect(() => {
        if (reservationsData?.length > 0) {
            if (urlBookingId && !selectedBooking) {
                const found = reservationsData.find(r => r.id == urlBookingId);
                if (found) setSelectedBooking(found);
            } else if (selectedBooking) {
                const updated = reservationsData.find(r => r.id === selectedBooking.id);
                if (updated) setSelectedBooking(updated);
            }
        }
    }, [reservationsData, urlBookingId]);

    const handleAddCharge = async (e) => {
        e.preventDefault();
        try {
            await api.post('/property-owner/hms-mgmt/bills', {
                ...chargeForm,
                booking_id: selectedBooking.id,
                guest_name: selectedBooking.guest_name
            });
            showSuccess('Charge added successfully');
            setShowChargeForm(false);
            setChargeForm({ service_name: '', amount: '' });
            refetchBills();
        } catch (error) {
            showError('Failed to add charge');
        }
    };

    const handleDeleteBill = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await api.delete(`/property-owner/hms-mgmt/bills/${id}`);
            showSuccess('Item removed');
            refetchBills();
        } catch (error) {
            showError('Failed to delete item');
        }
    };

    const handlePrint = () => {
        if (!selectedBooking) return;
        setShowPrintPreview(true);
    };

    const executePrint = () => {
        const total = calculateTotal();
        const paid = parseFloat(selectedBooking.paid_amount || 0);
        const due = total - paid;
        
        const printWindow = window.open('', '_blank');
        const content = `
            <html>
                <head>
                    <title>Invoice - ${selectedBooking.booking_reference}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
                        .company-info h1 { margin: 0; color: #004e59; font-size: 24px; }
                        .invoice-details { text-align: right; }
                        .guest-info { margin-bottom: 30px; }
                        .guest-info h3 { margin-bottom: 5px; color: #666; font-size: 14px; text-transform: uppercase; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { background: #f8f9fa; text-align: left; padding: 12px; border-bottom: 2px solid #eee; font-size: 13px; text-transform: uppercase; }
                        td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
                        .total-section { margin-left: auto; width: 300px; }
                        .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                        .grand-total { border-top: 2px solid #004e59; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 18px; color: #004e59; }
                        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="company-info">
                            <h1>${propertiesData.find(p => p.id == selectedPropertyId)?.title || 'Property Invoice'}</h1>
                            <p>${propertiesData.find(p => p.id == selectedPropertyId)?.address || ''}</p>
                        </div>
                        <div class="invoice-details">
                            <h2>INVOICE</h2>
                            <p><strong>Ref:</strong> ${selectedBooking.booking_reference}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div class="guest-info">
                        <h3>Guest Details</h3>
                        <p><strong>Name:</strong> ${selectedBooking.guest_name}</p>
                        <p><strong>Room:</strong> ${selectedBooking.room_number || 'N/A'}</p>
                        <p><strong>Period:</strong> ${new Date(selectedBooking.check_in_date).toLocaleDateString()} to ${new Date(selectedBooking.check_out_date).toLocaleDateString()}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Room Rent & Reservation (${selectedBooking.booking_reference})</td>
                                <td style="text-align: right;">${parseFloat(selectedBooking.total_amount).toLocaleString()} BDT</td>
                            </tr>
                            ${(billsData || []).map(bill => `
                                <tr>
                                    <td>${bill.service_name}</td>
                                    <td style="text-align: right;">${parseFloat(bill.amount).toLocaleString()} BDT</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row">
                            <span>Subtotal</span>
                            <span>${total.toLocaleString()} BDT</span>
                        </div>
                        <div class="total-row" style="color: #10b981;">
                            <span>Paid Amount</span>
                            <span>-${paid.toLocaleString()} BDT</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>Balance Due</span>
                            <span>${due.toLocaleString()} BDT</span>
                        </div>
                    </div>

                    <div class="footer">
                        <p>Thank you for staying with us!</p>
                        <p>This is a computer-generated invoice.</p>
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        
        // Use timeout to ensure content is rendered before printing
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 250);
        
        setShowPrintPreview(false);
    };

    const handleSettleBill = () => {
        if (!selectedBooking) return;
        setShowSettlementPreview(true);
    };

    const confirmSettleBill = async () => {
        const total = calculateTotal();
        try {
            await api.put(`/property-owner/hms-mgmt/settle-bill/${selectedBooking.id}`, {
                total_amount: total
            });
            showSuccess('Bill settled and guest checked out successfully');
            setShowSettlementPreview(false);
            setSelectedBooking(null);
            setSettleMethod('desk');
            setPaymentLink('');
            refetchReservations();
        } catch (error) {
            showError('Failed to settle bill');
        }
    };

    const handleGenerateLink = async () => {
        if (!selectedBooking) return;
        setIsGeneratingLink(true);
        try {
            const response = await api.get(`/property-owner/hms/reservations/${selectedBooking.id}/payment-link`);
            setPaymentLink(response.data?.data?.paymentLink);
            showSuccess('Payment link generated!');
        } catch (err) {
            showError('Failed to generate payment link');
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const calculateTotal = () => {
        if (!selectedBooking) return 0;
        const roomTotal = parseFloat(selectedBooking.total_amount) || 0;
        const extraTotal = (billsData || []).reduce((sum, b) => sum + parseFloat(b.amount), 0);
        return roomTotal + extraTotal;
    };

    if (loadingProperties) return <LoadingSpinner />;

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                selectedBooking ? 'hidden lg:flex' : 'flex'
            }`}>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                        <FiFileText className="text-blue-600" />
                        Guest Folio Billing
                    </h1>
                    <p className="text-gray-500 font-medium text-xs md:text-sm">Manage extra charges and settle guest invoices.</p>
                </div>
                <select
                    value={selectedPropertyId}
                    onChange={(e) => { setSelectedPropertyId(e.target.value); setSelectedBooking(null); }}
                    className="bg-white border-2 border-gray-100 rounded-2xl px-6 py-3 font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-auto text-sm"
                >
                    {propertiesData?.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Reservation List */}
                <div className={`lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px] ${
                    selectedBooking ? 'hidden lg:flex' : 'flex'
                }`}>
                    <div className="p-6 border-b bg-gray-50/50">
                        <h2 className="font-black text-gray-800 mb-4 uppercase tracking-wider text-sm">Active Guests</h2>
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search guest name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loadingReservations ? <LoadingSpinner /> : 
                         reservationsData?.filter(r => r.guest_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                            <button
                                key={r.id}
                                onClick={() => setSelectedBooking(r)}
                                className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${
                                    selectedBooking?.id === r.id 
                                    ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100' 
                                    : 'border-transparent hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-black text-gray-900 line-clamp-1">{r.guest_name}</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                        r.status === 'checked_in' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {r.status === 'checked_in' ? 'In House' : 'Confirmed'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                                    <FiHome className="shrink-0" />
                                    <span>Room: {r.room_number || 'N/A'}</span>
                                </div>
                                <div className="mt-2 text-xs font-black text-blue-600">
                                    Ref: {r.booking_reference}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Billing Details */}
                <div className={`lg:col-span-8 space-y-6 ${
                    !selectedBooking ? 'hidden lg:block' : 'block'
                }`}>
                    {!selectedBooking ? (
                        <div className="bg-white rounded-3xl border-4 border-dashed border-gray-100 h-full flex flex-col items-center justify-center text-center p-12">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <FiUser className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-black text-gray-400">Select a Guest to view Billing</h3>
                            <p className="text-gray-400 mt-2 max-w-xs">All active and checked-in guests will appear in the sidebar.</p>
                        </div>
                    ) : (
                        <>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="lg:hidden inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-black text-sm uppercase tracking-wider mb-2 bg-white px-4 py-2.5 rounded-xl border border-gray-150 shadow-sm"
                                >
                                    <FiArrowLeft size={16} /> Back to Guest List
                                </button>

                                {/* Guest Header */}
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-5">
                                    {/* Top Section: Guest Details & Metadata */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 shrink-0">
                                                <FiUser className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">{selectedBooking.guest_name}</h2>
                                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                                                        selectedBooking.status === 'checked_in' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {selectedBooking.status === 'checked_in' ? 'In House' : 'Confirmed'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 font-bold mt-0.5">HMS Booking Folio</p>
                                            </div>
                                        </div>
                                        
                                        {/* Metadata Tags */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="bg-gray-50 border border-gray-150 text-gray-600 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                                                <FiHome size={14} className="text-gray-400" /> Room {selectedBooking.room_number}
                                            </span>
                                            <span className="bg-gray-50 border border-gray-150 text-gray-600 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
                                                <FiCalendar size={14} className="text-gray-400" /> {new Date(selectedBooking.check_in_date).toLocaleDateString()} - {new Date(selectedBooking.check_out_date).toLocaleDateString()}
                                            </span>
                                            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-xl text-xs font-mono font-bold shrink-0">
                                                Ref: {selectedBooking.booking_reference}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Divider */}
                                    <div className="border-t border-gray-100"></div>

                                    {/* Bottom Section: Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
                                        <button 
                                            onClick={() => setShowChargeForm(true)}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-blue-100 text-sm"
                                        >
                                            <FiPlus size={16} /> Add Charge
                                        </button>
                                        <button 
                                            onClick={handlePrint}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-gray-200 text-sm"
                                        >
                                            <FiPrinter size={16} /> Print Invoice
                                        </button>
                                        <button 
                                            onClick={handleSettleBill}
                                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-2xl font-black transition-all shadow-lg shadow-emerald-100 text-sm"
                                        >
                                            <FiCheckCircle size={18} className="text-white" /> Settle & Checkout
                                        </button>
                                    </div>
                                </div>
 
                                {/* Payment Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Total Folio Amount</p>
                                            <h3 className="text-2xl font-black text-gray-900">{calculateTotal().toLocaleString()} <span className="text-xs text-gray-400 font-bold">BDT</span></h3>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                            <FiFileText size={20} />
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Total Paid</p>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-2xl font-black text-emerald-600">{parseFloat(selectedBooking.paid_amount || 0).toLocaleString()} <span className="text-xs font-bold text-emerald-500">BDT</span></h3>
                                                {selectedBooking.payment_method === 'sslcommerz' && (
                                                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wider">via SSL</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                                            <FiCheckCircle size={20} />
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-rose-500 flex items-center justify-between group hover:shadow-md transition-all">
                                        <div>
                                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1.5">Balance Due</p>
                                            <h3 className="text-2xl font-black text-rose-600">{(calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)).toLocaleString()} <span className="text-xs font-bold text-rose-500">BDT</span></h3>
                                        </div>
                                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                                            <FiClock size={20} />
                                        </div>
                                    </div>
                                </div>

                            {/* Bill Table */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 md:px-8 py-5 border-b flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-black text-gray-800 uppercase tracking-widest text-[10px] md:text-xs">Current Folio / Bill Details</h3>
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${
                                        selectedBooking.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        {selectedBooking.payment_status}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[500px]">
                                        <thead>
                                            <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                                                <th className="px-6 md:px-8 py-4">Date</th>
                                                <th className="px-6 md:px-8 py-4">Description</th>
                                                <th className="px-6 md:px-8 py-4 text-right">Amount</th>
                                                <th className="px-6 md:px-8 py-4 text-center w-20"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {/* Room Charge */}
                                            <tr className="bg-blue-50/30">
                                                <td className="px-6 md:px-8 py-4 md:py-6 text-xs md:text-sm text-gray-500 font-bold">
                                                    {new Date(selectedBooking.check_in_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 md:px-8 py-4 md:py-6">
                                                    <div className="font-black text-gray-900 text-xs md:text-sm">Room Rent & Reservation</div>
                                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Base Booking Charge</div>
                                                </td>
                                                <td className="px-6 md:px-8 py-4 md:py-6 text-right font-black text-gray-900 text-xs md:text-sm">
                                                    {parseFloat(selectedBooking.total_amount).toLocaleString()} BDT
                                                </td>
                                                <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                                                    <FiCheckCircle className="text-emerald-500 mx-auto w-5 h-5" />
                                                </td>
                                            </tr>
 
                                            {/* Extra Bills */}
                                            {loadingBills ? (
                                                <tr><td colSpan="4" className="p-8 text-center"><LoadingSpinner /></td></tr>
                                            ) : billsData?.map(bill => (
                                                <tr key={bill.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 md:px-8 py-4 md:py-6 text-xs md:text-sm text-gray-500 font-bold">
                                                        {new Date(bill.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 md:px-8 py-4 md:py-6">
                                                        <div className="font-black text-gray-800 text-xs md:text-sm">{bill.service_name}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Service Charge</div>
                                                    </td>
                                                    <td className="px-6 md:px-8 py-4 md:py-6 text-right font-black text-gray-800 text-xs md:text-sm">
                                                        {parseFloat(bill.amount).toLocaleString()} BDT
                                                    </td>
                                                    <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                                                        <button 
                                                            onClick={() => handleDeleteBill(bill.id)}
                                                            className="p-2 text-gray-300 hover:text-rose-500 transition-colors md:opacity-0 group-hover:opacity-100"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-900 text-white">
                                            <tr>
                                                <td colSpan="2" className="px-6 md:px-8 py-5 md:py-6 text-sm md:text-lg font-black uppercase tracking-widest">Grand Total</td>
                                                <td className="px-6 md:px-8 py-5 md:py-6 text-right text-base md:text-2xl font-black">
                                                    {calculateTotal().toLocaleString()} BDT
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add Charge Modal */}
            {showChargeForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200/80 transform transition-all">
                        {/* Clean SaaS Header */}
                        <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Add Service Charge</h2>
                                <p className="text-gray-400 text-[11px] font-semibold mt-0.5">Guest: {selectedBooking.guest_name}</p>
                            </div>
                            <button onClick={() => setShowChargeForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-650 transition-colors">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddCharge}>
                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Service Name / Item</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Laundry, Extra Bed, Food Service..."
                                        value={chargeForm.service_name}
                                        onChange={(e) => setChargeForm({...chargeForm, service_name: e.target.value})}
                                        className="w-full px-3.5 py-2.5 bg-white border border-gray-250 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Amount (BDT)</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">৳</span>
                                        <input
                                            required
                                            type="number"
                                            placeholder="0.00"
                                            value={chargeForm.amount}
                                            onChange={(e) => setChargeForm({...chargeForm, amount: e.target.value})}
                                            className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-gray-250 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Clean SaaS Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setShowChargeForm(false)}
                                    className="px-4 py-2 border border-gray-250 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-xs uppercase tracking-wider transition-colors shadow-sm"
                                >
                                    Add Charge
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Settlement Preview Modal */}
            {showSettlementPreview && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200/80 flex flex-col max-h-[90vh] transform transition-all">
                        {/* Clean SaaS Header */}
                        <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-white shrink-0">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Settle Bill & Checkout</h2>
                                <p className="text-gray-400 text-[11px] font-semibold mt-0.5">Verify folio details and process final checkout</p>
                            </div>
                            <button 
                                onClick={() => { setShowSettlementPreview(false); setSettleMethod('desk'); setPaymentLink(''); }} 
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-650 transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto space-y-5">
                            {/* Guest Details Panel */}
                            <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4 flex justify-between items-center flex-wrap gap-3">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">{selectedBooking.guest_name}</h3>
                                    <p className="text-xs text-gray-500 font-semibold mt-0.5">Room {selectedBooking.room_number}</p>
                                </div>
                                <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shrink-0">
                                    Ref: {selectedBooking.booking_reference}
                                </span>
                            </div>

                            {/* Charges Table */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Charges Breakdown</h4>
                                <div className="border border-gray-200/70 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-150 text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item Description</th>
                                                <th className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-150 bg-white">
                                            <tr>
                                                <td className="px-4 py-3 text-xs font-semibold text-gray-700">Room Rent & Reservation</td>
                                                <td className="px-4 py-3 text-xs font-bold text-gray-900 text-right">{parseFloat(selectedBooking.total_amount).toLocaleString()} BDT</td>
                                            </tr>
                                            {(billsData || []).map(bill => (
                                                <tr key={bill.id}>
                                                    <td className="px-4 py-3 text-xs font-semibold text-gray-700">{bill.service_name}</td>
                                                    <td className="px-4 py-3 text-xs font-bold text-gray-900 text-right">{parseFloat(bill.amount).toLocaleString()} BDT</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Clean Receipt Summary Box */}
                            <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4 space-y-2.5">
                                <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                                    <span>Total Folio Amount</span>
                                    <span className="text-gray-800 font-bold">{calculateTotal().toLocaleString()} BDT</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-semibold text-emerald-600">
                                    <span>Already Paid</span>
                                    <span>-{parseFloat(selectedBooking.paid_amount || 0).toLocaleString()} BDT</span>
                                </div>
                                <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between items-center">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount Due to Settle</span>
                                        <h3 className="text-lg font-black text-gray-900 mt-0.5">{(calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)).toLocaleString()} BDT</h3>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                        (calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)) <= 0 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                        : 'bg-rose-50 border-rose-200 text-rose-700'
                                    }`}>
                                        {(calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)) <= 0 ? 'Fully Paid' : 'Balance Due'}
                                    </span>
                                </div>
                            </div>

                            {/* Settlement Method Selector */}
                            <div className="space-y-2 pt-1">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settle Payment Via</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <button 
                                        type="button"
                                        onClick={() => setSettleMethod('desk')}
                                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all text-left ${
                                            settleMethod === 'desk' 
                                            ? 'border-blue-500 bg-blue-50/15 text-gray-900 ring-1 ring-blue-500/10' 
                                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${settleMethod === 'desk' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <FiDollarSign size={15} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-xs block text-gray-800">Desk Collection</span>
                                            <span className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5 block">Record cash or card payments collected directly.</span>
                                        </div>
                                    </button>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => { setSettleMethod('link'); handleGenerateLink(); }}
                                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all text-left ${
                                            settleMethod === 'link' 
                                            ? 'border-blue-500 bg-blue-50/15 text-gray-900 ring-1 ring-blue-500/10' 
                                            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${settleMethod === 'link' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <FiLink size={15} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-xs block text-gray-800">Digital Payment Link</span>
                                            <span className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5 block">Send online payment link (bKash, Nagad, Card).</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Payment Link Info UI */}
                            {settleMethod === 'link' && (
                                <div className="p-4 bg-blue-50/30 border border-blue-150/50 rounded-xl space-y-2.5 animate-fadeIn">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-black text-blue-700 flex items-center gap-1.5 uppercase tracking-wider">
                                            <FiLink className="text-blue-500" /> Checkout URL
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => { refetchReservations(); refetchBills(); }}
                                            className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider flex items-center gap-1 bg-blue-100/40 px-2 py-0.5 rounded"
                                        >
                                            <FiRefreshCw className="animate-spin-hover" size={9} /> Refresh Status
                                        </button>
                                    </div>
                                    
                                    {isGeneratingLink ? (
                                        <div className="py-1 text-center text-xs text-blue-600 font-semibold flex justify-center items-center gap-2">
                                            <FiRefreshCw className="animate-spin text-blue-500" size={12} /> Generating...
                                        </div>
                                    ) : paymentLink ? (
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <input 
                                                    readOnly 
                                                    type="text" 
                                                    value={paymentLink}
                                                    className="flex-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 select-all outline-none"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => { navigator.clipboard.writeText(paymentLink); showSuccess('Link copied!'); }}
                                                    className="px-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shrink-0"
                                                    title="Copy link"
                                                >
                                                    <FiCopy size={12} />
                                                </button>
                                                <a 
                                                    href={paymentLink} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="px-2.5 bg-gray-905 text-white rounded-lg hover:bg-black transition-colors flex items-center justify-center shrink-0"
                                                    title="Open Payment Page"
                                                >
                                                    <FiExternalLink size={12} />
                                                </a>
                                            </div>
                                            <p className="text-[10px] text-blue-700/80 font-semibold leading-relaxed">
                                                Copy and share this URL with the guest to accept online payment. Click "Refresh Status" once done.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="py-1 text-center text-xs text-red-500 font-semibold">Failed to generate checkout link. Please retry.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Clean SaaS Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex justify-end gap-2.5 shrink-0">
                            <button
                                onClick={() => { setShowSettlementPreview(false); setSettleMethod('desk'); setPaymentLink(''); }}
                                className="px-4 py-2 border border-gray-250 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSettleBill}
                                disabled={settleMethod === 'link' && (calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)) > 0}
                                className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                                    settleMethod === 'link' && (calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)) > 0
                                    ? 'bg-gray-150 text-gray-405 border border-gray-200 cursor-not-allowed shadow-none'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                }`}
                            >
                                <FiCheckCircle size={14} /> 
                                {settleMethod === 'link' && (calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)) > 0 ? 'Awaiting Payment' : 'Complete Checkout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Print Preview Modal */}
            {showPrintPreview && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-gray-200/80 flex flex-col max-h-[95vh] transform transition-all">
                        {/* Clean SaaS Header */}
                        <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-white shrink-0">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Invoice Print Preview</h2>
                                <p className="text-gray-400 text-[11px] font-semibold mt-0.5">Review layout and structure before printing</p>
                            </div>
                            <button onClick={() => setShowPrintPreview(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-650 transition-colors">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 md:p-8 overflow-y-auto bg-gray-50 flex justify-center">
                            {/* Paper Layout */}
                            <div className="bg-white w-full max-w-[800px] shadow-lg border border-gray-200/80 p-8 md:p-12 text-[#333]" style={{ fontFamily: 'Georgia, serif' }}>
                                <div className="flex justify-between border-b-2 border-gray-100 pb-6 mb-6 flex-wrap gap-4">
                                    <div>
                                        <h1 className="text-xl md:text-2xl font-black text-slate-800 m-0 uppercase tracking-wide">{propertiesData.find(p => p.id == selectedPropertyId)?.title || 'Property Invoice'}</h1>
                                        <p className="text-xs text-gray-500 mt-1 font-sans">{propertiesData.find(p => p.id == selectedPropertyId)?.address || ''}</p>
                                    </div>
                                    <div className="text-left md:text-right font-sans">
                                        <h2 className="text-2xl font-black text-gray-300 tracking-wider">INVOICE</h2>
                                        <p className="text-xs mt-1"><strong>Ref:</strong> {selectedBooking.booking_reference}</p>
                                        <p className="text-xs"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div className="mb-8 font-sans">
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Guest Details</h3>
                                    <p className="text-sm font-bold">Name: <span className="font-normal">{selectedBooking.guest_name}</span></p>
                                    <p className="text-sm font-bold">Room: <span className="font-normal">{selectedBooking.room_number || 'N/A'}</span></p>
                                    <p className="text-sm font-bold">Period: <span className="font-normal">{new Date(selectedBooking.check_in_date).toLocaleDateString()} to {new Date(selectedBooking.check_out_date).toLocaleDateString()}</span></p>
                                </div>

                                <table className="w-full mb-8 border-collapse font-sans">
                                    <thead>
                                        <tr className="bg-gray-50 text-left border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <th className="p-3">Description</th>
                                            <th className="p-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-150">
                                        <tr>
                                            <td className="p-3 text-xs font-semibold text-gray-700">Room Rent & Reservation</td>
                                            <td className="p-3 text-xs font-bold text-right text-gray-800">{parseFloat(selectedBooking.total_amount).toLocaleString()} BDT</td>
                                        </tr>
                                        {(billsData || []).map(bill => (
                                            <tr key={bill.id}>
                                                <td className="p-3 text-xs font-semibold text-gray-700">{bill.service_name}</td>
                                                <td className="p-3 text-xs font-bold text-right text-gray-800">{parseFloat(bill.amount).toLocaleString()} BDT</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="ml-auto w-72 space-y-2 font-sans border-t border-gray-100 pt-4">
                                    <div className="flex justify-between text-xs py-0.5">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold text-gray-800">{calculateTotal().toLocaleString()} BDT</span>
                                    </div>
                                    <div className="flex justify-between text-xs py-0.5 text-emerald-600">
                                        <span className="font-bold">Already Paid</span>
                                        <span className="font-bold">-{parseFloat(selectedBooking.paid_amount || 0).toLocaleString()} BDT</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-t border-gray-300 text-base font-black text-slate-800 mt-2">
                                        <span>Balance Due</span>
                                        <span>{(calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)).toLocaleString()} BDT</span>
                                    </div>
                                </div>

                                <div className="mt-16 text-center text-[10px] text-gray-405 border-t border-gray-100 pt-6 font-sans">
                                    <p>Thank you for staying with us!</p>
                                    <p className="mt-0.5 italic">This is a computer-generated invoice.</p>
                                </div>
                            </div>
                        </div>

                        {/* Clean SaaS Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-150 flex justify-end gap-2.5 shrink-0">
                            <button
                                onClick={() => setShowPrintPreview(false)}
                                className="px-4 py-2 border border-gray-250 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
                            >
                                Back to Billing
                            </button>
                            <button
                                onClick={executePrint}
                                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <FiPrinter size={13} className="text-white" /> Print Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HMSBilling;
