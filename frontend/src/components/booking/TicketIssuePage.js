import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import flightApi from '../../utils/flightApi';

const TicketIssuePage = () => {
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPassengers, setSelectedPassengers] = useState({});
    const [totalCost, setTotalCost] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const bookingId = params.get('booking_id');
        const folderPath = params.get('folder_path');

        if (bookingId) {
            fetchBookingDetails(bookingId, folderPath);
        } else {
            setError('No Booking ID found.');
            setLoading(false);
        }
    }, []);

    const fetchBookingDetails = async (bookingId, folderPath) => {
        try {
            // Include folder_path in the request if available
            let url = `/flight-booking-details?booking_id=${bookingId}`;
            if (folderPath) {
                url += `&folder_path=${folderPath}`;
            }

            const res = await flightApi.get(url);

            if (res.data.success) {
                setBooking(res.data.data);
            } else {
                setError(res.data.message || 'Failed to load booking.');
            }
        } catch (err) {
            console.error(err);
            const apiMsg = err.response?.data?.message;
            setError(apiMsg || 'Error fetching booking details.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (travelerIndex, travelerData, fare, isChecked) => {
        const newSelected = { ...selectedPassengers };

        if (isChecked) {
            newSelected[travelerIndex] = {
                NameNumber: `${travelerData.nameAssociationId}.1`,
                PassengerType: travelerData.passengerCode,
                fare: fare
            };
        } else {
            delete newSelected[travelerIndex];
        }

        setSelectedPassengers(newSelected);

        const newTotal = Object.values(newSelected).reduce((sum, item) => {
            const amount = parseFloat(item.fare) || 0;
            return sum + amount;
        }, 0);
        setTotalCost(newTotal);
    };

    const handleIssueTicket = async () => {
        if (Object.keys(selectedPassengers).length === 0) {
            alert("Please select at least one passenger.");
            return;
        }

        if (!window.confirm(`Are you sure you want to issue tickets for ${Object.keys(selectedPassengers).length} passengers? Total Cost: ${booking.currency} ${totalCost}`)) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const payload = {
                bookingId: booking.bookingId,
                selected_passengers: Object.values(selectedPassengers)
            };

            const res = await flightApi.post('/ticket-issue-submit', payload);

            if (res.data.success) {
                setSuccessMessage("Tickets Issued Successfully!");
                setSelectedPassengers({});
                setTotalCost(0);
                // Refresh details
                const params = new URLSearchParams(window.location.search);
                fetchBookingDetails(booking.bookingId, params.get('folder_path'));
            } else {
                setError(res.data.message || "Failed to issue tickets.");
            }
        } catch (err) {
            console.error(err);
            const apiMsg = err.response?.data?.message;
            const apiErrors = err.response?.data?.errors; // If the API returns an array of specific errors

            if (apiErrors && Array.isArray(apiErrors) && apiErrors.length > 0) {
                // Join array errors if they exist
                setError(apiMsg + ' ' + apiErrors.join(' | ') || "Error processing request.");
            } else {
                setError(apiMsg || "Error processing request.");
            }
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error && !booking) return <div className="p-8 text-center text-red-600 font-bold bg-white rounded shadow m-4">{error}</div>;

    const {
        bookingId,
        airlineName,
        routeSummary,
        firstFlightDateTime,
        ticketingLimit,
        travelers,
        flightTickets,
        agencyBalance,
        currency
    } = booking;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans text-gray-800">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header / Flash Messages */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {successMessage}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Issue Ticket</h1>
                        <p className="text-sm text-gray-500">Booking Ref: <span className="font-mono font-bold text-green-600">{bookingId}</span></p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Ticketing Time Limit</div>
                        <div className="font-medium text-red-600">{ticketingLimit || 'N/A'}</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Passenger Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-800">Select Passengers</h3>
                                <div className="text-sm">
                                    <span className="text-gray-500 mr-2">Agency Balance:</span>
                                    {/* Handle potentially null/undefined agencyBalance */}
                                    <span className={(agencyBalance === undefined || agencyBalance < totalCost) ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                                        {currency} {agencyBalance !== undefined ? parseFloat(agencyBalance).toLocaleString() : 'Loading...'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {travelers && travelers.map((pax, idx) => {
                                    const paxTicket = flightTickets?.find(t => t.travelerIndex === pax.nameAssociationId);
                                    const isTicketed = !!paxTicket;
                                    const fareAmount = parseFloat(pax.fare) || 0;

                                    return (
                                        <div key={idx} className={`border rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors ${isTicketed ? 'bg-green-50 border-green-200' : 'bg-white hover:border-blue-300'}`}>
                                            <div className="flex items-center gap-4">
                                                {!isTicketed && (
                                                    <input
                                                        type="checkbox"
                                                        className="h-5 w-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                                                        onChange={(e) => handleCheckboxChange(idx, pax, fareAmount, e.target.checked)}
                                                        checked={!!selectedPassengers[idx]}
                                                    />
                                                )}
                                                {isTicketed && (
                                                    <div className="h-5 w-5 flex items-center justify-center bg-green-200 rounded-full text-green-700">
                                                        <i className="fa fa-check text-xs"></i>
                                                        {/* Ensure FontAwesome is loaded or replace with SVG */}
                                                        <span>✓</span>
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="font-semibold text-gray-900">{pax.givenName} {pax.surname}</div>
                                                    <div className="text-xs text-gray-500">{pax.passengerCode}</div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                {isTicketed ? (
                                                    <div className="text-green-700 font-medium text-sm">
                                                        Ticketed: <span className="font-mono">{paxTicket.number}</span>
                                                    </div>
                                                ) : (
                                                    <div className="font-bold text-gray-800">
                                                        {currency} {fareAmount.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary & Action */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Payment Summary</h3>

                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600">Selected Passengers</span>
                                <span className="font-medium">{Object.keys(selectedPassengers).length}</span>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t mt-4">
                                <span className="text-gray-800 font-bold">Total Cost</span>
                                <span className="text-2xl font-bold text-blue-600">{currency} {totalCost.toLocaleString()}</span>
                            </div>

                            {/* Balance Warning */}
                            {booking.agencyBalance !== undefined && totalCost > booking.agencyBalance && (
                                <div className="mt-4 bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                                    Insufficient Balance
                                </div>
                            )}

                            <button
                                onClick={handleIssueTicket}
                                disabled={processing || totalCost === 0}
                                className={`w-full mt-6 py-3 px-4 rounded-lg font-bold text-white shadow-md transition-all 
                                    ${processing || totalCost === 0
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'}`}
                            >
                                {processing ? 'Processing...' : 'Confirm & Issue Ticket'}
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between w-full">
                                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded mb-4" onClick={() => navigate('/')}>Return Home</button>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2 text-sm">Flight Summary</h4>
                            <div className="text-sm space-y-2 text-gray-600">
                                <div className="flex justify-between"><span>Airline</span> <span className="font-medium text-gray-900">{airlineName}</span></div>
                                <div className="flex justify-between"><span>Route</span> <span className="font-medium text-gray-900">{routeSummary}</span></div>
                                <div className="flex justify-between"><span>Departs</span> <span className="font-medium text-gray-900">{firstFlightDateTime}</span></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TicketIssuePage;
