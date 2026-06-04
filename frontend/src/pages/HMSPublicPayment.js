import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiLock, FiCalendar, FiHome, FiCheckCircle, FiShield, FiAlertCircle } from 'react-icons/fi';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useSettingsStore from '../store/settingsStore';

const HMSPublicPayment = () => {
    const { token } = useParams();
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const { settings } = useSettingsStore();

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
            const response = await api.post('/sslcommerz/hms/public-request', { token });
            if (response.data?.data?.url) {
                window.location.href = response.data.data.url;
            }
        } catch (err) {
            alert('Failed to initiate payment. Please try again.');
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

                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4">
                                <FiShield className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm font-bold text-blue-900">Secure SSL Payment</p>
                                    <p className="text-xs text-blue-700 leading-relaxed">Your transaction is protected with 128-bit encryption. We support bKash, Cards, and Net Banking.</p>
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
