
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaPlane, FaFilePdf, FaHome, FaUser, FaInfoCircle } from 'react-icons/fa';
import Footer from '../layout/Footer';
import LoadingSkeleton from '../common/LoadingSkeleton';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        if (location.state && location.state.booking) {
            setBooking(location.state.booking);
        } else {
            // Fallback or redirect if no state
            // navigate('/'); 
        }
    }, [location, navigate]);

    if (!booking) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl space-y-4">
                    <LoadingSkeleton type="card" />
                    <LoadingSkeleton type="form" />
                </div>
            </div>
        );
    }

    const { booking_details, booking_id } = booking;
    // The API now returns `customBookingResponse` as `booking_details`.
    // We can map these fields directly.

    const {
        leadPassenger,
        leadPassengerEmail,
        leadPassengerMobile,
        bookingId: pnr,
        totalAmount,
        currency,
        firstFlightDateTime,
        airlineName,
        routeSummary,
        passengerSummary,
        ticketingLimit
    } = booking_details || {};

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Success Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                            <FaCheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h1>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            Your flight has been successfully booked.
                            {leadPassengerEmail && <span> A confirmation email has been sent to <strong>{leadPassengerEmail}</strong>.</span>}
                        </p>
                        <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-800 font-mono text-sm border border-gray-200">
                            <span className="text-gray-500 mr-2">Booking Ref (PNR):</span>
                            <span className="font-bold tracking-wider text-xl text-[#E41D57]">{pnr || booking_id}</span>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Left Column: Flight Info */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <FaPlane className="text-[#E41D57]" /> Flight Summary
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Airline</span>
                                        <span className="font-medium text-gray-900">{airlineName}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Route</span>
                                        <span className="font-medium text-gray-900">{routeSummary}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Date & Time</span>
                                        <span className="font-medium text-gray-900">{firstFlightDateTime}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-600">Passengers</span>
                                        <span className="font-medium text-gray-900">{passengerSummary}</span>
                                    </div>
                                    {ticketingLimit && (
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-red-600 font-semibold">Ticketing Time Limit</span>
                                            <span className="font-bold text-red-600">{ticketingLimit}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Passenger Details */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <FaUser className="text-[#E41D57]" /> Lead Passenger
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500">Name</label>
                                            <div className="font-medium">{leadPassenger}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500">Email</label>
                                            <div className="font-medium">{leadPassengerEmail}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500">Mobile</label>
                                            <div className="font-medium">{leadPassengerMobile}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Actions & Summary */}
                        <div className="space-y-6">

                            {/* Fare Summary */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-800 mb-4">Total Fare</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">Total Amount</span>
                                    <span className="text-2xl font-bold text-[#E41D57]">{currency} {totalAmount}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                                <h3 className="font-bold text-gray-800 mb-2">Actions</h3>
                                <button
                                    onClick={() => navigate(`/ticket-issue?booking_id=${pnr || booking_id}`)}
                                    className="w-full flex justify-center items-center gap-2 bg-[#E41D57] hover:bg-[#c01b4b] text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md transform hover:-translate-y-0.5"
                                >
                                    <FaFilePdf /> View / Issue Ticket
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full flex justify-center items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors border border-gray-300"
                                >
                                    <FaHome /> Return Home
                                </button>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <div className="flex gap-3">
                                    <FaInfoCircle className="text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-blue-700">
                                        Please issue your ticket before the time limit to avoid cancellation.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;
