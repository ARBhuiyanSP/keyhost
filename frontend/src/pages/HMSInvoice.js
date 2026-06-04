import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiPrinter, FiDownload, FiMapPin, FiPhone, FiMail, FiGlobe } from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';
import useSettingsStore from '../store/settingsStore';

const HMSInvoice = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const { settings } = useSettingsStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // If ID is a long token (non-numeric), use public endpoint
                const isToken = isNaN(id);
                const endpoint = isToken 
                    ? `/sslcommerz/hms/invoice-info/${id}` 
                    : `/property-owner/hms/reservations/${id}/invoice-data`;
                
                const response = await api.get(endpoint);
                setData(response.data?.data?.invoice);
            } catch (err) {
                console.error('Failed to fetch invoice data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <LoadingSpinner />;
    if (!data) return <div className="p-10 text-center">Invoice not found</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0 print:px-0">
            {/* Print styles to hide global layout elements */}
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
                }
            `}} />
            {/* Toolbar - Hidden when printing */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <button 
                    onClick={() => window.history.back()}
                    className="text-gray-600 hover:text-gray-900 font-bold flex items-center gap-2"
                >
                    &larr; Back to Dashboard
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#004e59] text-white rounded-lg font-bold shadow-lg hover:bg-[#003d46] transition-all"
                    >
                        <FiPrinter /> Print Invoice
                    </button>
                </div>
            </div>

            {/* Invoice Paper */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl p-8 md:p-16 rounded-sm print:shadow-none print:p-0 min-h-[29.7cm]">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-100 pb-10 mb-10">
                    <div>
                        <img src={settings?.site_logo || "/logo.png"} alt="Logo" className="h-12 mb-6 object-contain" />
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Invoice</h1>
                        <p className="text-gray-500 font-bold mt-1">Ref: {data.booking_reference}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-black text-[#004e59] uppercase">{data.company_name || 'Keyhost Property'}</h2>
                        <div className="text-sm text-gray-500 mt-2 space-y-1">
                            <p className="flex items-center justify-end gap-2"><FiMapPin size={12}/> {data.business_address || data.property_address}</p>
                            <p className="flex items-center justify-end gap-2"><FiMail size={12}/> support@keyhost.com</p>
                            <p className="flex items-center justify-end gap-2"><FiGlobe size={12}/> www.keyhost.com</p>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-20 mb-16">
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Bill To</h3>
                        <div className="space-y-1">
                            <p className="text-xl font-bold text-gray-900">{data.guest_name}</p>
                            <p className="text-gray-600">{data.guest_phone}</p>
                            <p className="text-gray-600">{data.guest_email}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Invoice Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-end gap-4">
                                <span className="text-gray-500 text-sm">Issue Date:</span>
                                <span className="font-bold text-gray-900">{format(new Date(), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex justify-end gap-4">
                                <span className="text-gray-500 text-sm">Check-in:</span>
                                <span className="font-bold text-gray-900">{format(new Date(data.check_in_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex justify-end gap-4">
                                <span className="text-gray-500 text-sm">Check-out:</span>
                                <span className="font-bold text-gray-900">{format(new Date(data.check_out_date), 'MMM dd, yyyy')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-16">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="py-4 text-left text-sm font-black uppercase tracking-widest text-gray-900">Description</th>
                            <th className="py-4 text-center text-sm font-black uppercase tracking-widest text-gray-900">Qty</th>
                            <th className="py-4 text-right text-sm font-black uppercase tracking-widest text-gray-900">Price</th>
                            <th className="py-4 text-right text-sm font-black uppercase tracking-widest text-gray-900">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr className="border-b border-gray-100">
                            <td className="py-8">
                                <p className="font-bold text-gray-900 text-lg">Accommodation: Room {data.room_number}</p>
                                <p className="text-sm text-gray-500">{data.room_type} at {data.property_title}</p>
                                <p className="text-xs text-gray-400 mt-1 italic">Stay Duration: {format(new Date(data.check_in_date), 'MMM dd')} - {format(new Date(data.check_out_date), 'MMM dd')}</p>
                            </td>
                            <td className="py-8 text-center font-bold text-gray-700">{data.nights} Nights</td>
                            <td className="py-8 text-right font-bold text-gray-700">৳{(data.total_amount / data.nights).toLocaleString()}</td>
                            <td className="py-8 text-right font-black text-gray-900 text-lg">৳{data.total_amount.toLocaleString()}</td>
                        </tr>
                        
                        {/* Render Extra Bills */}
                        {data.extra_bills?.map((bill) => (
                            <tr key={bill.id} className="border-b border-gray-50">
                                <td className="py-6">
                                    <p className="font-bold text-gray-800">{bill.service_name}</p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Service / Extra Charge</p>
                                </td>
                                <td className="py-6 text-center font-bold text-gray-700">1</td>
                                <td className="py-6 text-right font-bold text-gray-700">৳{parseFloat(bill.amount).toLocaleString()}</td>
                                <td className="py-6 text-right font-bold text-gray-800">৳{parseFloat(bill.amount).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary */}
                <div className="flex justify-end mb-20">
                    <div className="w-full max-w-xs space-y-3">
                        <div className="flex justify-between text-gray-500">
                            <span>Room Subtotal</span>
                            <span className="font-bold text-gray-900">৳{data.total_amount.toLocaleString()}</span>
                        </div>
                        {data.extra_total > 0 && (
                            <div className="flex justify-between text-gray-500">
                                <span>Service Subtotal</span>
                                <span className="font-bold text-gray-900">৳{data.extra_total.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-500">
                            <span>Tax (0%)</span>
                            <span className="font-bold text-gray-900">৳0.00</span>
                        </div>
                        <div className="pt-4 border-t-2 border-gray-900 flex justify-between items-center">
                            <span className="text-xl font-black text-gray-900 uppercase">Grand Total</span>
                            <span className="text-2xl font-black text-[#004e59]">৳{(parseFloat(data.total_amount) + parseFloat(data.extra_total || 0)).toLocaleString()}</span>
                        </div>
                        <div className="pt-2 text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                data.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                            }`}>
                                {data.payment_status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 pt-10">
                    <div className="grid grid-cols-2 gap-10">
                        <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase mb-2">Terms & Conditions</h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Please keep this invoice for your records. Check-in time is 2:00 PM and check-out time is 11:00 AM. 
                                Cancellations must be made 24 hours prior to arrival for a full refund.
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="inline-block border-b border-gray-400 w-48 mb-2"></div>
                            <p className="text-xs font-black text-gray-900 uppercase">Authorized Signature</p>
                        </div>
                    </div>
                    <div className="mt-16 text-center">
                        <p className="text-sm font-bold text-gray-900">Thank you for choosing Keyhost Homes!</p>
                        <p className="text-xs text-gray-400 mt-1 italic">Generated automatically by Keyhost HMS on {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HMSInvoice;
