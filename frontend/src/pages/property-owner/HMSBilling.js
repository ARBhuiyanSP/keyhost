import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { 
    FiFileText, FiPlus, FiTrash2, FiSearch, FiDollarSign, 
    FiPrinter, FiUser, FiHome, FiCheckCircle, FiClock, FiX, FiCalendar
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
            refetchReservations();
        } catch (error) {
            showError('Failed to settle bill');
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
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <FiFileText className="text-blue-600" />
                        Guest Billing & Invoicing
                    </h1>
                    <p className="text-gray-500 font-medium">Manage extra charges and generate guest invoices.</p>
                </div>
                <select
                    value={selectedPropertyId}
                    onChange={(e) => { setSelectedPropertyId(e.target.value); setSelectedBooking(null); }}
                    className="bg-white border-2 border-gray-100 rounded-2xl px-6 py-3 font-bold text-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {propertiesData?.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Reservation List */}
                <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
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
                <div className="lg:col-span-8 space-y-6">
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
                            {/* Guest Header */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                        <FiUser className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">{selectedBooking.guest_name}</h2>
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <span className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                                <FiHome className="text-blue-500" /> Room {selectedBooking.room_number}
                                            </span>
                                            <span className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                                <FiCalendar className="text-blue-500" /> {new Date(selectedBooking.check_in_date).toLocaleDateString()} - {new Date(selectedBooking.check_out_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 h-fit">
                                    <button 
                                        onClick={() => setShowChargeForm(true)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-blue-100"
                                    >
                                        <FiPlus /> Add Charge
                                    </button>
                                    <button 
                                        onClick={handlePrint}
                                        className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-gray-200"
                                    >
                                        <FiPrinter /> Print
                                    </button>
                                    <button 
                                        onClick={handleSettleBill}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black transition-all shadow-lg shadow-emerald-100"
                                    >
                                        <FiCheckCircle size={20} className="text-white" /> Settle & Checkout
                                    </button>
                                </div>
                            </div>

                            {/* Payment Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-gray-400">Total Folio Amount</p>
                                    <h3 className="text-2xl font-black text-gray-900">{calculateTotal().toLocaleString()} <span className="text-xs">BDT</span></h3>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 text-emerald-600">Total Paid</p>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-black text-emerald-600">{parseFloat(selectedBooking.paid_amount || 0).toLocaleString()} <span className="text-xs text-emerald-600">BDT</span></h3>
                                        {selectedBooking.payment_method === 'sslcommerz' && (
                                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg border border-emerald-100">via SSL</span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 border-l-4 border-l-rose-500">
                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1 text-rose-600">Balance Due</p>
                                    <h3 className="text-2xl font-black text-rose-600">{(calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)).toLocaleString()} <span className="text-xs text-rose-600">BDT</span></h3>
                                </div>
                            </div>

                            {/* Bill Table */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Current Folio / Bill Details</h3>
                                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${
                                        selectedBooking.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        {selectedBooking.payment_status}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                                                <th className="px-8 py-4">Date</th>
                                                <th className="px-8 py-4">Description</th>
                                                <th className="px-8 py-4 text-right">Amount</th>
                                                <th className="px-8 py-4 text-center w-20"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {/* Room Charge */}
                                            <tr className="bg-blue-50/30">
                                                <td className="px-8 py-6 text-sm text-gray-500 font-bold">
                                                    {new Date(selectedBooking.check_in_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-gray-900">Room Rent & Reservation</div>
                                                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Base Booking Charge</div>
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-gray-900">
                                                    {parseFloat(selectedBooking.total_amount).toLocaleString()} BDT
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <FiCheckCircle className="text-emerald-500 mx-auto w-5 h-5" />
                                                </td>
                                            </tr>

                                            {/* Extra Bills */}
                                            {loadingBills ? (
                                                <tr><td colSpan="4" className="p-8 text-center"><LoadingSpinner /></td></tr>
                                            ) : billsData?.map(bill => (
                                                <tr key={bill.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-8 py-6 text-sm text-gray-500 font-bold">
                                                        {new Date(bill.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="font-black text-gray-800">{bill.service_name}</div>
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Service Charge</div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right font-black text-gray-800">
                                                        {parseFloat(bill.amount).toLocaleString()} BDT
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <button 
                                                            onClick={() => handleDeleteBill(bill.id)}
                                                            className="p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-900 text-white">
                                            <tr>
                                                <td colSpan="2" className="px-8 py-6 text-lg font-black uppercase tracking-widest">Grand Total</td>
                                                <td className="px-8 py-6 text-right text-2xl font-black">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
                        <div className="px-10 py-8 bg-blue-600 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-wider">Add Service Charge</h2>
                                <p className="text-blue-100 text-sm font-bold mt-1">Guest: {selectedBooking.guest_name}</p>
                            </div>
                            <button onClick={() => setShowChargeForm(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                <FiX className="w-8 h-8" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddCharge} className="p-10 space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Service Name / Item</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Laundry, Extra Bed, Food Service..."
                                    value={chargeForm.service_name}
                                    onChange={(e) => setChargeForm({...chargeForm, service_name: e.target.value})}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Amount (BDT)</label>
                                <div className="relative">
                                    <FiDollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        type="number"
                                        placeholder="0.00"
                                        value={chargeForm.amount}
                                        onChange={(e) => setChargeForm({...chargeForm, amount: e.target.value})}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-black text-xl"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-100 uppercase tracking-widest"
                            >
                                Add to Bill
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Settlement Preview Modal */}
            {showSettlementPreview && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
                        <div className="px-10 py-8 bg-emerald-600 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-wider text-white">Final Bill Preview</h2>
                                <p className="text-emerald-100 text-sm font-bold mt-1">Review guest folio before final checkout</p>
                            </div>
                            <button onClick={() => setShowSettlementPreview(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                <FiX className="w-8 h-8 text-white" />
                            </button>
                        </div>
                        
                        <div className="p-10 overflow-y-auto space-y-8">
                            <div className="flex justify-between items-start border-b pb-6 border-gray-100">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900">{selectedBooking.guest_name}</h3>
                                    <p className="text-sm font-bold text-gray-500">Room: {selectedBooking.room_number}</p>
                                    <p className="text-xs font-bold text-blue-600 mt-1">Ref: {selectedBooking.booking_reference}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Billing Date</p>
                                    <p className="text-sm font-bold text-gray-900">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Charges Breakdown</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                                <FiHome />
                                            </div>
                                            <span className="font-bold text-gray-700 text-sm">Room Rent & Reservation</span>
                                        </div>
                                        <span className="font-black text-gray-900">{parseFloat(selectedBooking.total_amount).toLocaleString()} BDT</span>
                                    </div>

                                    {(billsData || []).map(bill => (
                                        <div key={bill.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                                    <FiPlus />
                                                </div>
                                                <span className="font-bold text-gray-700 text-sm">{bill.service_name}</span>
                                            </div>
                                            <span className="font-black text-gray-900">{parseFloat(bill.amount).toLocaleString()} BDT</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-[30px] p-8 text-white space-y-6 shadow-xl shadow-gray-200">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Bill</span>
                                    <span className="text-xl font-black">{calculateTotal().toLocaleString()} BDT</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/10 pb-4 text-emerald-400">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-80">Already Paid</span>
                                    <span className="text-xl font-black">-{parseFloat(selectedBooking.paid_amount || 0).toLocaleString()} BDT</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <div>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Due to Settle</p>
                                        <h3 className="text-3xl font-black text-white">{(calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)).toLocaleString()} <span className="text-lg">BDT</span></h3>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            (calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)) <= 0 
                                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                            : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                                        }`}>
                                            Status: {(calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)) <= 0 ? 'Fully Paid' : 'Balance Due'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setShowSettlementPreview(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-5 rounded-2xl font-black text-lg transition-all uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSettleBill}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest flex items-center justify-center gap-3"
                                >
                                    <FiCheckCircle size={24} className="text-white" /> Confirm & Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Print Preview Modal */}
            {showPrintPreview && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh]">
                        <div className="px-10 py-6 bg-gray-900 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-wider text-white">Invoice Preview</h2>
                                <p className="text-gray-400 text-xs font-bold mt-1">Review the layout before printing</p>
                            </div>
                            <button onClick={() => setShowPrintPreview(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                <FiX className="w-8 h-8 text-white" />
                            </button>
                        </div>
                        
                        <div className="p-10 overflow-y-auto bg-gray-50 flex justify-center">
                            {/* Paper Layout */}
                            <div className="bg-white w-full max-w-[800px] shadow-lg p-12 text-[#333]" style={{ fontFamily: 'sans-serif' }}>
                                <div className="flex justify-between border-b-2 border-gray-100 pb-8 mb-8">
                                    <div>
                                        <h1 className="text-2xl font-black text-[#004e59] m-0">{propertiesData.find(p => p.id == selectedPropertyId)?.title || 'Property Invoice'}</h1>
                                        <p className="text-sm text-gray-500 mt-1">{propertiesData.find(p => p.id == selectedPropertyId)?.address || ''}</p>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-2xl font-black text-gray-300">INVOICE</h2>
                                        <p className="text-sm"><strong>Ref:</strong> {selectedBooking.booking_reference}</p>
                                        <p className="text-sm"><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                                
                                <div className="mb-10">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Guest Details</h3>
                                    <p className="text-sm font-bold">Name: {selectedBooking.guest_name}</p>
                                    <p className="text-sm font-bold">Room: {selectedBooking.room_number || 'N/A'}</p>
                                    <p className="text-sm font-bold">Period: {new Date(selectedBooking.check_in_date).toLocaleDateString()} to {new Date(selectedBooking.check_out_date).toLocaleDateString()}</p>
                                </div>

                                <table className="w-full mb-10 border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 text-left border-b-2 border-gray-100 text-xs font-black uppercase tracking-widest">
                                            <th className="p-4">Description</th>
                                            <th className="p-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        <tr>
                                            <td className="p-4 text-sm font-bold">Room Rent & Reservation</td>
                                            <td className="p-4 text-sm font-bold text-right">{parseFloat(selectedBooking.total_amount).toLocaleString()} BDT</td>
                                        </tr>
                                        {(billsData || []).map(bill => (
                                            <tr key={bill.id}>
                                                <td className="p-4 text-sm font-bold">{bill.service_name}</td>
                                                <td className="p-4 text-sm font-bold text-right">{parseFloat(bill.amount).toLocaleString()} BDT</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="ml-auto w-72 space-y-2">
                                    <div className="flex justify-between text-sm py-1">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold">{calculateTotal().toLocaleString()} BDT</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-1 text-emerald-600">
                                        <span className="font-bold">Already Paid</span>
                                        <span className="font-bold">-{parseFloat(selectedBooking.paid_amount || 0).toLocaleString()} BDT</span>
                                    </div>
                                    <div className="flex justify-between py-4 border-t-2 border-[#004e59] text-lg font-black text-[#004e59]">
                                        <span>Balance Due</span>
                                        <span>{(calculateTotal() - parseFloat(selectedBooking.paid_amount || 0)).toLocaleString()} BDT</span>
                                    </div>
                                </div>

                                <div className="mt-20 text-center text-xs text-gray-400 border-t border-gray-100 pt-8">
                                    <p>Thank you for staying with us!</p>
                                    <p className="mt-1 italic">This is a computer-generated invoice.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white border-t flex gap-4 shrink-0">
                            <button
                                onClick={() => setShowPrintPreview(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                            >
                                Back to Billing
                            </button>
                            <button
                                onClick={executePrint}
                                className="flex-1 bg-gray-900 hover:bg-black text-white py-4 px-12 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200"
                            >
                                <FiPrinter size={20} className="text-white" /> Confirm & Print Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HMSBilling;
