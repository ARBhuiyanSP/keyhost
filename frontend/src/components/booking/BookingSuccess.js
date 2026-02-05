import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingResponse = location.state?.booking;

    if (!bookingResponse) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f4f6]">
                <div className="bg-white p-8 rounded-xl shadow-sm md:w-96 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">?</div>
                    <h2 className="text-xl font-bold text-[#1E2049] mb-2">No Booking Found</h2>
                    <p className="text-gray-500 mb-6 text-sm">We couldn't find the booking details you were looking for.</p>
                    <button onClick={() => navigate('/')} className="w-full bg-[#1E2049] text-white py-3 rounded-lg font-bold hover:bg-[#151736]">Go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f3f4f6] min-h-screen py-10 flex items-center justify-center">
            <div className="container px-4 max-w-lg">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-green-500 p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
                        <p className="text-green-100">Your trip is all set.</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">

                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                                <span className="text-sm text-gray-500 font-medium">Booking ID</span>
                                <span className="font-mono text-xl font-bold text-[#1E2049]">{bookingResponse.booking_id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 font-medium">Status</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Confirmed</span>
                            </div>
                        </div>

                        <div className="text-center space-y-3">
                            <p className="text-sm text-gray-500">
                                A confirmation email has been sent to your email address.
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Link
                                to="/"
                                className="block w-full bg-[#1E2049] text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-[#151736] transition-transform hover:-translate-y-0.5"
                            >
                                Back to Home
                            </Link>
                        </div>

                    </div>

                    {/* Footer Decoration */}
                    <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                        <p className="text-xs text-gray-400">Need help? Contact support</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;
