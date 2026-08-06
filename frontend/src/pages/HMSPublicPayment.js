import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FiLock, FiHome, FiCheckCircle, FiShield, FiAlertCircle, FiCreditCard, FiXCircle, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useSettingsStore from '../store/settingsStore';

const HMSPublicPayment = () => {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const paymentResult = searchParams.get('payment'); // 'success' | 'fail' | 'cancel' | null

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const { settings } = useSettingsStore();
    const [selectedGateway, setSelectedGateway] = useState('');

    const isSslEnabled = settings?.enable_sslcommerz !== false && settings?.enable_sslcommerz !== 'false';
    const isBkashEnabled = settings?.enable_bkash === true || settings?.enable_bkash === 'true';
    const isNagadEnabled = settings?.enable_nagad === true || settings?.enable_nagad === 'true';

    useEffect(() => {
        if (settings) {
            const isBkash = settings.enable_bkash === true || settings.enable_bkash === 'true';
            const isSsl = settings.enable_sslcommerz !== false && settings.enable_sslcommerz !== 'false';
            const isNagad = settings.enable_nagad === true || settings.enable_nagad === 'true';

            if (isBkash) {
                setSelectedGateway('bkash');
            } else if (isSsl) {
                setSelectedGateway('sslcommerz');
            } else if (isNagad) {
                setSelectedGateway('nagad');
            }
        }
    }, [settings]);

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const response = await api.get(`/sslcommerz/hms/payment-info/${token}`);
                setBooking(response.data?.data?.booking);
            } catch (err) {
                setError(err.response?.data?.message || 'Invalid or expired payment link');
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, [token]);

    const handlePayment = async () => {
        setIsPaying(true);
        try {
            if (selectedGateway === 'sslcommerz') {
                const response = await api.post('/sslcommerz/hms/public-request', { token });
                if (response.data?.data?.url) {
                    window.location.href = response.data.data.url;
                    return;
                }
            } else if (selectedGateway === 'bkash') {
                const response = await api.post('/bkash/hms/public-request', { token });
                if (response.data?.data?.bkash_url) {
                    if (response.data?.data?.bkash_token) {
                        console.log('bkash new token ' + response.data.data.bkash_token);
                    }
                    window.location.href = response.data.data.bkash_url;
                    return;
                }
            } else if (selectedGateway === 'nagad') {
                const response = await api.post('/nagad/hms/public-request', { token });
                if (response.data?.data?.nagad_url) {
                    window.location.href = response.data.data.nagad_url;
                    return;
                }
            }
            alert('Failed to initiate payment. Please try again.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to initiate payment. Please try again.');
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Oops!</h1>
                    <p className="text-gray-500 mt-2">{error}</p>
                    <button onClick={() => window.location.href = '/'} className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold">
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    // ── Payment Success Screen ──────────────────────────────────────────────
    if (paymentResult === 'success') {
        const remainingDue = booking?.total_amount || 0;
        const isFullyPaid = remainingDue <= 0 || booking?.alreadyPaid;
        return (
            <div className="min-h-screen bg-[#F3F7F9] flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-6">
                        <img src={settings?.site_logo || '/logo.png'} alt="Logo" className="h-10 mx-auto mb-4 object-contain" />
                    </div>
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className={`p-8 text-center ${isFullyPaid ? 'bg-emerald-500' : 'bg-[#004e59]'}`}>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCheckCircle className="w-9 h-9 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Payment Received!</h1>
                            <p className="text-white/70 text-sm mt-1">
                                {isFullyPaid ? 'Your reservation is fully paid.' : 'Partial payment recorded successfully.'}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Booking Info */}
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2 text-sm">
                                {booking?.guest_name && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 font-medium">Guest</span>
                                        <span className="font-bold text-gray-800">{booking.guest_name}</span>
                                    </div>
                                )}
                                {booking?.property_title && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 font-medium">Property</span>
                                        <span className="font-bold text-gray-800">{booking.property_title}</span>
                                    </div>
                                )}
                                {booking?.room_number && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 font-medium">Room</span>
                                        <span className="font-bold text-gray-800">Room {booking.room_number} ({booking.room_type})</span>
                                    </div>
                                )}
                            </div>

                            {/* Remaining Balance Alert */}
                            {!isFullyPaid && remainingDue > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                                    <FiAlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-800">Outstanding Balance</p>
                                        <p className="text-xs text-amber-700 mt-0.5">
                                            Remaining due: <span className="font-black">BDT {remainingDue.toLocaleString()}</span>
                                        </p>
                                        <p className="text-xs text-amber-600 mt-1">Please settle the remaining amount before checkout.</p>
                                    </div>
                                </div>
                            )}

                            {/* Fully Paid Confirmation */}
                            {isFullyPaid && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3">
                                    <FiCheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800">All Settled!</p>
                                        <p className="text-xs text-emerald-700 mt-0.5">No outstanding balance. Enjoy your stay!</p>
                                    </div>
                                </div>
                            )}

                            {/* Pay Remaining Button */}
                            {!isFullyPaid && remainingDue > 0 && (
                                <button
                                    onClick={() => window.location.href = `/hms/pay/${token}`}
                                    className="w-full py-3 bg-[#004e59] text-white rounded-xl font-bold hover:bg-[#003d46] transition-all"
                                >
                                    Pay Remaining BDT {remainingDue.toLocaleString()}
                                </button>
                            )}

                            <p className="text-center text-gray-400 text-xs">
                                Thank you for choosing {settings?.site_name || 'Keyhost Homes'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Payment Failed / Cancelled Screen ───────────────────────────────────
    if (paymentResult === 'fail' || paymentResult === 'cancel') {
        const isCancelled = paymentResult === 'cancel';
        return (
            <div className="min-h-screen bg-[#F3F7F9] flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="text-center mb-6">
                        <img src={settings?.site_logo || '/logo.png'} alt="Logo" className="h-10 mx-auto mb-4 object-contain" />
                    </div>
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className={`p-8 text-center ${isCancelled ? 'bg-gray-600' : 'bg-rose-500'}`}>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                {isCancelled
                                    ? <FiXCircle className="w-9 h-9 text-white" />
                                    : <FiAlertCircle className="w-9 h-9 text-white" />
                                }
                            </div>
                            <h1 className="text-2xl font-bold text-white">
                                {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
                            </h1>
                            <p className="text-white/70 text-sm mt-1">
                                {isCancelled
                                    ? 'You cancelled the payment process.'
                                    : 'Something went wrong with your payment. Please try again.'}
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 text-sm text-center">
                                Your reservation is still active. Click below to try again.
                            </p>
                            <button
                                onClick={() => window.location.href = `/hms/pay/${token}`}
                                className="w-full py-3 bg-[#004e59] text-white rounded-xl font-bold hover:bg-[#003d46] transition-all flex items-center justify-center gap-2"
                            >
                                <FiRefreshCw className="w-4 h-4" /> Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Already Paid Screen ─────────────────────────────────────────────────
    if (booking?.alreadyPaid) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCheckCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Already Paid</h1>
                    <p className="text-gray-500 mt-2">This reservation has already been paid for. Thank you!</p>
                    <button onClick={() => window.location.href = '/'} className="mt-6 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">
                        Continue to Website
                    </button>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">No Booking Found</h1>
                    <p className="text-gray-500 mt-2">Could not retrieve booking details. Please verify your payment link.</p>
                    <button onClick={() => window.location.href = '/'} className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold">
                        Return to Homepage
                    </button>
                </div>
            </div>
        );
    }

    // ── Main Payment Screen ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F3F7F9] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Branding */}
                <div className="text-center mb-8">
                    <img src={settings?.site_logo || "/logo.png"} alt="Keyhost" className="h-12 mx-auto mb-4 object-contain" />
                    <h1 className="text-2xl font-bold text-gray-900">Secure Reservation Payment</h1>
                    <p className="text-gray-500">Pay securely using your preferred payment method</p>
                </div>

                <div className="grid md:grid-cols-1 gap-8">
                    {/* Booking Details Card */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="bg-[#004e59] p-6 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <FiHome className="w-5 h-5 text-white/70" />
                                <span className="font-medium">{booking.property_title}</span>
                            </div>
                            <h2 className="text-3xl font-bold">BDT {booking.total_amount?.toLocaleString()}</h2>
                            <p className="text-white/60 text-sm mt-1">Total Amount Due</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Guest Name</p>
                                    <p className="font-bold text-gray-800">{booking.guest_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Room Details</p>
                                    <p className="font-bold text-gray-800">Room {booking.room_number} ({booking.room_type})</p>
                                </div>
                            </div>

                            {/* Payment Methods Selector */}
                            <div className="space-y-3 pt-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Select Payment Method</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {isBkashEnabled && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedGateway('bkash')}
                                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                                                selectedGateway === 'bkash'
                                                ? 'border-pink-500 bg-pink-50/30 text-pink-700'
                                                : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                            }`}
                                        >
                                            <img src="https://download.logo.wine/logo/BKash/BKash-Logo.wine.png" className="h-6 object-contain" alt="bKash" />
                                            <span className="font-bold text-xs">bKash</span>
                                        </button>
                                    )}

                                    {isNagadEnabled && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedGateway('nagad')}
                                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                                                selectedGateway === 'nagad'
                                                ? 'border-orange-500 bg-orange-50/30 text-orange-700'
                                                : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                            }`}
                                        >
                                            <span className="font-black text-orange-600 text-base leading-none">Nagad</span>
                                            <span className="font-bold text-xs">Nagad Wallet</span>
                                        </button>
                                    )}

                                    {isSslEnabled && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedGateway('sslcommerz')}
                                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                                                selectedGateway === 'sslcommerz'
                                                ? 'border-blue-600 bg-blue-50/30 text-blue-700'
                                                : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                            }`}
                                        >
                                            <div className="flex gap-1 items-center justify-center">
                                                <FiCreditCard className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <span className="font-bold text-xs">Cards / Net Banking</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
                                <FiShield className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm font-bold text-blue-900">Secure Online Payment</p>
                                    <p className="text-xs text-blue-700 leading-relaxed">Your transaction is protected with secure encryption. We support bKash, Nagad, Cards, and Net Banking.</p>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isPaying}
                                className="w-full py-5 bg-[#004e59] text-white rounded-2xl font-bold text-xl hover:bg-[#003d46] transition-all shadow-lg shadow-[#004e59]/20 flex items-center justify-center gap-3"
                            >
                                {isPaying ? (
                                    <>
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FiLock /> Pay Now
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-6 opacity-40 grayscale">
                                <img src="https://download.logo.wine/logo/BKash/BKash-Logo.wine.png" className="h-8" alt="bKash" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-4" alt="Visa" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-6" alt="Mastercard" />
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-xs mt-8">
                    &copy; {new Date().getFullYear()} Keyhost Homes. All Rights Reserved.
                </p>
            </div>
        </div>
    );
};

export default HMSPublicPayment;
