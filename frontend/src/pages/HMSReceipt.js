import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiMail, FiMessageCircle, FiSave, FiEdit2, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import useSettingsStore from '../store/settingsStore';
import useAuthStore from '../store/authStore';
import useToast from '../hooks/useToast';

// helper to convert number to words in BDT currency (South Asian Lakh/Crore format)
const numberToWords = (num) => {
    if (num === null || num === undefined || isNaN(num)) return '';
    const value = parseFloat(num);
    if (value === 0) return 'Zero Only';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertLessThanOneThousand = (n) => {
        if (n === 0) return '';
        let str = '';
        if (n >= 100) {
            str += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            str += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        }
        if (n > 0) {
            str += ones[n] + ' ';
        }
        return str.trim();
    };

    let amount = Math.floor(value);
    const paisa = Math.round((value - amount) * 100);
    
    let words = '';
    
    if (amount >= 10000000) {
        words += convertLessThanOneThousand(Math.floor(amount / 10000000)) + ' Crore ';
        amount %= 10000000;
    }
    if (amount >= 100000) {
        words += convertLessThanOneThousand(Math.floor(amount / 100000)) + ' Lakh ';
        amount %= 100000;
    }
    if (amount >= 1000) {
        words += convertLessThanOneThousand(Math.floor(amount / 1000)) + ' Thousand ';
        amount %= 1000;
    }
    if (amount > 0) {
        words += convertLessThanOneThousand(amount);
    }
    
    words = words.trim() + ' Taka';
    
    if (paisa > 0) {
        words += ' and ' + convertLessThanOneThousand(paisa) + ' Paisa';
    }
    
    return words + ' Only';
};

const fmt = (n) => parseFloat(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => { try { return format(new Date(d), 'dd MMM yyyy'); } catch { return d || '—'; } };

const HMSReceipt = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettingsStore();
    const { user } = useAuthStore();
    const { showSuccess, showError } = useToast();

    const [loading, setLoading] = useState(true);
    const [receipt, setReceipt] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Edit states for host inline updates
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [isEditingReceiver, setIsEditingReceiver] = useState(false);
    const [editAccount, setEditAccount] = useState('');
    const [editReceiver, setEditReceiver] = useState('');

    const isAuthorized = user && (user.role === 'property_owner' || user.role === 'staff' || user.role === 'admin');

    useEffect(() => {
        const fetchReceipt = async () => {
            try {
                // Public endpoint
                const response = await api.get(`/sslcommerz/hms/receipt-info/${id}`);
                const data = response.data?.data?.receipt;
                setReceipt(data);
                if (data) {
                    setEditAccount(data.account_name || '');
                    setEditReceiver(data.received_by || '');
                }
            } catch (err) {
                console.error('Failed to fetch receipt data:', err);
                showError('Receipt not found or could not be loaded.');
            } finally {
                setLoading(false);
            }
        };
        fetchReceipt();
    }, [id]);

    const handleSaveMeta = async () => {
        setIsSaving(true);
        try {
            await api.put(`/property-owner/hms/payments/${receipt.payment_id}/receipt-meta`, {
                account_name: editAccount,
                received_by: editReceiver
            });
            setReceipt(prev => ({
                ...prev,
                account_name: editAccount,
                received_by: editReceiver
            }));
            setIsEditingAccount(false);
            setIsEditingReceiver(false);
            showSuccess('Receipt details updated successfully!');
        } catch (err) {
            console.error('Failed to update receipt metadata:', err);
            showError('Failed to save receipt details.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSendEmail = () => {
        if (!receipt) return;
        const subject = encodeURIComponent(`Money Receipt - ${receipt.payment_reference}`);
        const body = encodeURIComponent(`Dear ${receipt.guest_name},\n\nPlease find your payment receipt here: ${window.location.origin}/hms/receipt/${receipt.payment_id}\n\nThank you,\n${receipt.property_title || 'Key Host Homes'}`);
        window.open(`mailto:${receipt.guest_email || ''}?subject=${subject}&body=${body}`, '_blank');
    };

    const handleSendWhatsApp = () => {
        if (!receipt) return;
        const phone = receipt.guest_phone ? receipt.guest_phone.replace(/[+\s-]/g, '') : '';
        const text = encodeURIComponent(`Hello *${receipt.guest_name}*,\nHere is your payment receipt for booking REF: *${receipt.booking_reference}*.\n\nVerify and view online at: ${window.location.origin}/hms/receipt/${receipt.payment_id}\n\nThank you!`);
        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${text}`, '_blank');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><LoadingSpinner /></div>;
    if (!receipt) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100"><p className="text-gray-600 font-bold mb-4">Money Receipt not found</p><button onClick={() => navigate(-1)} className="px-4 py-2 bg-[#004e59] text-white rounded-lg">Go Back</button></div>;

    const siteLogo = settings?.site_logo || "/logo.png";
    const amountInWordsStr = numberToWords(receipt.cr_amount);

    const hasChanges = editAccount !== (receipt.account_name || '') || editReceiver !== (receipt.received_by || '');

    // Render a single copy of the receipt
    const renderReceiptCopy = (copyType) => (
        <div className="relative border border-gray-300 p-6 md:p-8 bg-white rounded-sm min-h-[12.8cm] flex flex-col justify-between overflow-hidden">
            {/* Watermark */}
            <div className="watermark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-25 text-5xl font-black text-gray-100 uppercase tracking-[0.4em] select-none pointer-events-none z-0 whitespace-nowrap">
                SOFTWARE GENERATED
            </div>

            <div className="z-10 relative space-y-6">
                {/* Brand Header */}
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                        <img src={siteLogo} alt="Logo" className="h-10 w-auto object-contain" />
                    </div>
                    <div className="text-right flex-1">
                        <h2 className="text-base font-black text-gray-900 tracking-tight uppercase">{receipt.property_title || 'KEY HOST HOMES'}</h2>
                        <p className="text-[10px] text-gray-500 mt-0.5">Address: {receipt.property_address || receipt.property_city}</p>
                        <p className="text-[10px] text-gray-500">Mobile: {receipt.host_phone || '—'}</p>
                        <p className="text-[10px] text-gray-500">{receipt.host_email || '—'}</p>
                    </div>
                </div>

                {/* Document Title */}
                <div className="text-center">
                    <h1 className="text-lg font-black text-gray-900 tracking-wider uppercase border-b border-gray-900 inline-block pb-0.5">MONEY RECEIPT</h1>
                    <div className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{copyType}</div>
                </div>

                {/* Receipt Grid */}
                <div className="grid grid-cols-12 gap-y-3 gap-x-6 text-xs text-gray-800">
                    {/* Row 1: Receipt No & Date */}
                    <div className="col-span-7 flex items-center gap-1">
                        <span className="text-gray-500 font-bold shrink-0">Receipt No:</span>
                        <span className="font-mono font-bold text-gray-900">{receipt.payment_reference}</span>
                    </div>
                    <div className="col-span-5 flex items-center gap-1 justify-end">
                        <span className="text-gray-500 font-bold shrink-0">Date:</span>
                        <span className="font-bold text-gray-900">{fmtDate(receipt.payment_created_at)}</span>
                    </div>

                    {/* Row 2: Received From */}
                    <div className="col-span-12 flex items-baseline gap-1 border-b border-dotted border-gray-300 pb-1">
                        <span className="text-gray-500 font-bold shrink-0">Received From:</span>
                        <span className="font-black text-gray-900">{receipt.guest_name}</span>
                    </div>

                    {/* Row 3: Payment Method & Account Name */}
                    <div className="col-span-7 flex items-baseline gap-1 border-b border-dotted border-gray-300 pb-1">
                        <span className="text-gray-500 font-bold shrink-0">Payment Method:</span>
                        <span className="font-black text-gray-900 uppercase">{receipt.payment_method || 'CASH'}</span>
                    </div>
                    <div className="col-span-5 flex items-baseline gap-1 border-b border-dotted border-gray-300 pb-1">
                        <span className="text-gray-500 font-bold shrink-0">Account Name:</span>
                        {isAuthorized && copyType === 'OFFICE COPY' ? (
                            <div className="flex-1 flex items-center gap-1 group">
                                {isEditingAccount ? (
                                    <input
                                        type="text"
                                        value={editAccount}
                                        onChange={(e) => setEditAccount(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-[11px] font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004e59]"
                                    />
                                ) : (
                                    <span className="font-bold text-gray-900 flex-1">{editAccount || '—'}</span>
                                )}
                                <button
                                    onClick={() => setIsEditingAccount(!isEditingAccount)}
                                    className="print:hidden text-gray-400 hover:text-[#004e59] p-0.5"
                                >
                                    <FiEdit2 size={10} />
                                </button>
                            </div>
                        ) : (
                            <span className="font-bold text-gray-900 flex-1">{receipt.account_name || '—'}</span>
                        )}
                    </div>

                    {/* Row 4: Purpose & Received By */}
                    <div className="col-span-7 flex items-baseline gap-1 border-b border-dotted border-gray-300 pb-1">
                        <span className="text-gray-500 font-bold shrink-0">Purpose:</span>
                        <span className="font-bold text-gray-900">{receipt.payment_notes || 'Booking Payment'}</span>
                    </div>
                    <div className="col-span-5 flex items-baseline gap-1 border-b border-dotted border-gray-300 pb-1">
                        <span className="text-gray-500 font-bold shrink-0">Received By:</span>
                        {isAuthorized && copyType === 'OFFICE COPY' ? (
                            <div className="flex-1 flex items-center gap-1 group">
                                {isEditingReceiver ? (
                                    <input
                                        type="text"
                                        value={editReceiver}
                                        onChange={(e) => setEditReceiver(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-[11px] font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#004e59]"
                                    />
                                ) : (
                                    <span className="font-bold text-gray-900 flex-1">{editReceiver || '—'}</span>
                                )}
                                <button
                                    onClick={() => setIsEditingReceiver(!isEditingReceiver)}
                                    className="print:hidden text-gray-400 hover:text-[#004e59] p-0.5"
                                >
                                    <FiEdit2 size={10} />
                                </button>
                            </div>
                        ) : (
                            <span className="font-bold text-gray-900 flex-1">{receipt.received_by || '—'}</span>
                        )}
                    </div>

                    {/* Row 5: Amount in Words */}
                    <div className="col-span-12 flex items-baseline gap-1 border-b border-dotted border-gray-300 pb-1">
                        <span className="text-gray-500 font-bold shrink-0">Amount (in words):</span>
                        <span className="font-black text-gray-900 capitalize italic">{amountInWordsStr}</span>
                    </div>

                    {/* Row 6: BDT Amount, Ref, Room */}
                    <div className="col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
                        <div className="px-4 py-2 border-2 border-gray-900 rounded font-black text-sm text-gray-900 bg-gray-50 select-none">
                            Amount: ৳{fmt(receipt.cr_amount)}
                        </div>
                        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-gray-600">
                            <div>
                                <span className="text-gray-400">Room No:</span> <strong className="text-gray-900">{receipt.room_number || 'N/A'}</strong>
                            </div>
                            <div>
                                <span className="text-gray-400">Booking Ref:</span> <strong className="font-mono text-gray-900">{receipt.booking_reference}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Signature Area */}
            <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-6">
                <div className="text-[10px] text-gray-400 italic">
                    * This is a software generated system receipt. No signature is required.
                </div>
                <div className="text-right">
                    <div className="w-32 border-b border-gray-400 mb-1"></div>
                    <span className="text-[10px] font-bold text-gray-900 uppercase">Received By</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 py-6 px-4 print:bg-white print:py-0 print:px-0">
            {/* Embedded Print CSS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, footer, .PublicLayout-footer, header, 
                    #navbar, #footer, .mobile-footer, .go-to-top,
                    button, .print-hidden {
                        display: none !important;
                    }
                    body, html {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .receipt-paper-container {
                        width: 21cm !important;
                        max-width: 100% !important;
                        box-shadow: none !important;
                        border: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
            `}} />

            {/* Floating Top Nav (Hidden in Print) */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <button
                    onClick={() => window.history.back()}
                    className="text-gray-600 hover:text-gray-900 font-bold flex items-center gap-2 text-xs"
                >
                    <FiArrowLeft size={16} /> Back to Dashboard
                </button>
                <div className="flex flex-wrap gap-2">
                    {/* Share & Print Actions */}
                    <button
                        onClick={handleSendEmail}
                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-xs hover:bg-purple-700 transition shadow"
                    >
                        <FiMail size={14} /> Send Email
                    </button>
                    <button
                        onClick={handleSendWhatsApp}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 transition shadow"
                    >
                        <FiMessageCircle size={14} /> Send WhatsApp
                    </button>
                    {isAuthorized && hasChanges && (
                        <button
                            onClick={handleSaveMeta}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition shadow disabled:opacity-50"
                        >
                            <FiSave size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-5 py-2 bg-[#004e59] text-white rounded-lg font-bold text-xs hover:bg-[#003d46] transition shadow"
                    >
                        <FiPrinter size={14} /> Print Receipt
                    </button>
                </div>
            </div>

            {/* A4 Paper stack */}
            <div className="receipt-paper-container max-w-4xl mx-auto bg-white shadow-xl p-4 md:p-8 rounded-sm space-y-6 print:shadow-none print:p-0">
                {/* Office Copy (Top) */}
                {renderReceiptCopy('OFFICE COPY')}

                {/* Cutting Line Scissor Divider */}
                <div className="flex items-center justify-between text-gray-400 select-none print:my-2">
                    <span className="border-t border-dashed border-gray-400 flex-1"></span>
                    <span className="mx-2 text-sm flex items-center gap-1 font-mono font-bold">
                        <span>✂</span> --------------------------- Cut Here ---------------------------
                    </span>
                    <span className="border-t border-dashed border-gray-400 flex-1"></span>
                </div>

                {/* Customer Copy (Bottom) */}
                {renderReceiptCopy('CUSTOMER COPY')}
            </div>
        </div>
    );
};

export default HMSReceipt;
