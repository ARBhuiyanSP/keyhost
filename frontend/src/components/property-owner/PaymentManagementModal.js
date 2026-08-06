import React, { useState } from 'react';
import { 
    FiX, FiDollarSign, FiLink, FiSmartphone, FiCreditCard, 
    FiCheckCircle, FiCopy, FiShare2, FiPrinter, FiMail 
} from 'react-icons/fi';
import { useMutation, useQueryClient } from 'react-query';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';

const PaymentManagementModal = ({ isOpen, onClose, reservation, propertyId }) => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useToast();
    const [activeTab, setActiveTab] = useState('manual'); // 'manual', 'link', 'qr'
    const [manualData, setManualData] = useState({
        method: 'cash',
        amount: '',
        notes: ''
    });

    React.useEffect(() => {
        if (reservation) {
            const roomAmount = parseFloat(reservation.total_amount || 0);
            const extraBills = parseFloat(reservation.extra_billing_amount || 0);
            const totalBilled = roomAmount + extraBills;
            const paidAmount = parseFloat(reservation.paid_amount || 0);
            const dueAmount = Math.max(0, totalBilled - paidAmount);

            setManualData({
                method: 'cash',
                amount: dueAmount > 0 ? dueAmount : totalBilled,
                notes: ''
            });
        }
    }, [reservation]);
    const [paymentLink, setPaymentLink] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);

    const manualMutation = useMutation(
        (data) => api.patch(`/property-owner/hms/reservations/${reservation.id}/manual-payment`, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-reservations', propertyId]);
                showSuccess('Payment recorded successfully');
                onClose();
            },
            onError: (err) => showError(err.response?.data?.message || 'Failed to record payment')
        }
    );

    const generateLink = async () => {
        setIsGeneratingLink(true);
        try {
            const response = await api.get(`/property-owner/hms/reservations/${reservation.id}/payment-link`);
            setPaymentLink(response.data?.data?.paymentLink);
        } catch (err) {
            showError('Failed to generate payment link');
        } finally {
            setIsGeneratingLink(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showSuccess('Copied to clipboard!');
    };

    if (!isOpen || !reservation) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-lg my-auto relative animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[95vh]">
                {/* Header - Fixed at top of modal */}
                <div className="bg-[#004e59] p-4 md:p-6 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold">Manage Payment</h2>
                        <p className="text-white/70 text-xs md:text-sm mt-0.5">Ref: {reservation.booking_reference}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <FiX className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Tabs - Fixed below header */}
                <div className="flex border-b border-gray-100 shrink-0 bg-white">
                    {[
                        { id: 'manual', label: 'Manual Pay', icon: FiDollarSign },
                        { id: 'link', label: 'Payment Link', icon: FiLink },
                        { id: 'qr', label: 'Desk QR', icon: FiSmartphone }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${
                                activeTab === tab.id 
                                ? 'border-[#004e59] text-[#004e59] bg-[#004e59]/5' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-4 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                    {/* Manual Payment Section */}
                    {activeTab === 'manual' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Select Payment Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'cash', label: 'Cash', icon: FiDollarSign },
                                        { id: 'card', label: 'POS / Card', icon: FiCreditCard },
                                        { id: 'bkash', label: 'bKash', icon: FiSmartphone },
                                        { id: 'bank', label: 'Bank Transfer', icon: FiCheckCircle }
                                    ].map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => setManualData({ ...manualData, method: method.id })}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                                                manualData.method === method.id 
                                                ? 'border-[#004e59] bg-[#004e59]/5 text-[#004e59]' 
                                                : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                            }`}
                                        >
                                            <method.icon className="w-5 h-5" />
                                            <span className="font-bold text-sm">{method.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Amount Paid (BDT)</label>
                                <input 
                                    type="number"
                                    value={manualData.amount}
                                    onChange={(e) => setManualData({ ...manualData, amount: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] font-bold text-lg text-[#004e59]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Internal Notes</label>
                                <textarea 
                                    value={manualData.notes}
                                    onChange={(e) => setManualData({ ...manualData, notes: e.target.value })}
                                    placeholder="e.g. Received by manager, POS receipt #1234"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] h-24 resize-none"
                                />
                            </div>

                            <button 
                                onClick={() => manualMutation.mutate({
                                    payment_method: manualData.method,
                                    payment_notes: manualData.notes,
                                    amount: manualData.amount
                                })}
                                disabled={manualMutation.isLoading}
                                className="w-full py-4 bg-[#004e59] text-white rounded-2xl font-bold text-lg hover:bg-[#003d46] transition-all shadow-lg shadow-[#004e59]/20 flex items-center justify-center gap-2"
                            >
                                {manualMutation.isLoading ? 'Recording...' : 'Record Payment Now'}
                            </button>
                        </div>
                    )}

                    {/* Payment Link Section */}
                    {activeTab === 'link' && (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 bg-[#004e59]/10 rounded-full flex items-center justify-center mx-auto">
                                <FiLink className="w-10 h-10 text-[#004e59]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Generate Online Payment Link</h3>
                                <p className="text-gray-500 mt-2">Send this link to the guest. They can pay securely using bKash, Card, or Net Banking.</p>
                            </div>

                            {!paymentLink ? (
                                <button 
                                    onClick={generateLink}
                                    disabled={isGeneratingLink}
                                    className="w-full py-4 bg-[#004e59] text-white rounded-2xl font-bold hover:bg-[#003d46] transition-all"
                                >
                                    {isGeneratingLink ? 'Generating...' : 'Generate Link Now'}
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-4">
                                        <span className="text-sm text-gray-600 truncate flex-1">{paymentLink}</span>
                                        <button 
                                            onClick={() => copyToClipboard(paymentLink)}
                                            className="p-2 hover:bg-[#004e59]/10 rounded-lg text-[#004e59]"
                                        >
                                            <FiCopy className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600">
                                            <FiShare2 /> WhatsApp
                                        </button>
                                        <button className="flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600">
                                            <FiMail /> Email Link
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* QR Code Section */}
                    {activeTab === 'qr' && (
                        <div className="text-center space-y-6">
                            <div className="bg-gray-100 p-8 rounded-3xl inline-block border-2 border-dashed border-gray-300">
                                {/* Placeholder for QR */}
                                <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm relative">
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://keyhost.com/pay" alt="QR Code" className="w-40 h-40" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 hover:opacity-100 transition-opacity">
                                        <p className="text-[10px] font-bold text-gray-500">Scan to Pay</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Front Desk QR Code</h3>
                                <p className="text-gray-500 mt-2">Guests can scan this QR code to pay instantly via bKash or Nagad.</p>
                            </div>
                            <div className="flex justify-center gap-4">
                                <img src="https://download.logo.wine/logo/BKash/BKash-Logo.wine.png" className="h-8 grayscale hover:grayscale-0 transition-all" alt="bKash" />
                                <img src="https://nagad.com.bd/wp-content/uploads/2021/01/Nagad-Logo.png" className="h-6 mt-1 grayscale hover:grayscale-0 transition-all" alt="Nagad" />
                            </div>
                            <button className="w-full py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                <FiPrinter /> Print QR for Desk
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button 
                        onClick={() => window.open(`/hms/invoice/${reservation.id}`, '_blank')}
                        className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FiPrinter /> Print Invoice
                    </button>
                    <div className="text-right">
                        {(() => {
                            const roomAmt = parseFloat(reservation.total_amount || 0);
                            const extraAmt = parseFloat(reservation.extra_billing_amount || 0);
                            const totalBilled = roomAmt + extraAmt;
                            const paidAmt = parseFloat(reservation.paid_amount || 0);
                            const netDue = Math.max(0, totalBilled - paidAmt);

                            return (
                                <>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                        Billed: BDT {totalBilled.toLocaleString()} (Room: {roomAmt.toLocaleString()} + Services: {extraAmt.toLocaleString()}) | Paid: BDT {paidAmt.toLocaleString()}
                                    </div>
                                    <p className="text-sm font-black text-[#004e59]">Net Due: BDT {netDue.toLocaleString()}</p>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentManagementModal;
