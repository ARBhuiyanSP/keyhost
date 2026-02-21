import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FlightDetailsTabs from "../flight/FlightDetailsTabs";
import PlaneLoader from "../common/PlaneLoader";
import { revalidateFlight } from "../../utils/flightApi";

const FlightCard = ({ flight, index, loadingIndex, setLoadingIndex, onShowDetails }) => {
    const navigate = useNavigate();
    const [showFares, setShowFares] = useState(false);
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };
    const [tab, setTab] = useState("details");
    const [selectedFareContext, setSelectedFareContext] = useState(null);
    const [isSeen, setIsSeen] = useState(false);

    console.log('flight card', flight);

    const markAsSeen = () => {
        if (!isSeen) setIsSeen(true);
    };

    const [revalidationErrors, setRevalidationErrors] = useState({});

    const handleBookNow = async (selectedFare = null, fareIndex = null) => {
        setLoadingIndex(index);
        setRevalidationErrors(prev => ({ ...prev, [fareIndex]: null }));

        const originalPrice = selectedFare?.fare?.totalPrice || flight.fare?.totalPrice;

        let bookingPayload = flight;
        if (selectedFare) {
            bookingPayload = {
                ...flight,
                ...selectedFare,
                legs: selectedFare.legs || flight.legs,
                brandID: selectedFare.brandedFare?.brandID || selectedFare.brandedFare?.id,
                programID: selectedFare.brandedFare?.programID || selectedFare.brandedFare?.code
            };
        }

        try {
            const response = await revalidateFlight(bookingPayload);
            setLoadingIndex(null);

            if (response.success) {
                localStorage.setItem('bookingFlight', JSON.stringify(bookingPayload));
                localStorage.setItem('revalidatedData', JSON.stringify(response.revalidatedData));
                navigate("/booking");
            } else {
                // Revalidation returned failure — show price comparison if available
                setRevalidationErrors(prev => ({
                    ...prev,
                    [fareIndex]: {
                        type: response.validatedFare ? 'price_mismatch' : 'error',
                        message: response.message || "Fare unavailable",
                        originalFare: response.originalFare || originalPrice,
                        validatedFare: response.validatedFare || null,
                    }
                }));
            }
        } catch (err) {
            console.error(err);
            setLoadingIndex(null);
            // Try to extract price info from the API error response body
            const errData = err.response?.data || {};
            setRevalidationErrors(prev => ({
                ...prev,
                [fareIndex]: {
                    type: errData.validatedFare ? 'price_mismatch' : 'error',
                    message: errData.message || "Fare unavailable. Please try another.",
                    originalFare: errData.originalFare || originalPrice,
                    validatedFare: errData.validatedFare || null,
                }
            }));
        }
    };

    const legsArray = Object.values(flight.legs || []);
    const hasMultipleFares = flight.fares && flight.fares.length > 1;

    // Trigger modal for general flight details
    const handleShowFlightDetails = () => {
        if (onShowDetails) {
            onShowDetails(null);
        }
    };

    // Trigger modal for specific fare details
    const handleShowFareDetails = (fare) => {
        setSelectedFareContext(fare);
        setTab("baggage");
        if (onShowDetails) {
            onShowDetails(fare);
        }
    };

    return (
        <div className={`relative border rounded-xl shadow-sm bg-white mb-4 overflow-hidden transition-colors duration-300 ${isSeen ? 'border-green-500' : 'border-red-500'}`}>
            {/* Top Section: Flight Segments and Price */}
            <div className="p-4 flex flex-col lg:flex-row items-center justify-between gap-2 flex-wrap lg:flex-nowrap">

                {/* 1. Airline Logo & Name */}
                <div className="flex flex-row items-center gap-2 w-full lg:w-40 justify-start shrink-0">
                    <img src={flight.airlineLogo} alt="Airline Logo" className="w-10 h-10 object-contain" />
                    <div className="flex flex-col text-left overflow-hidden">
                        <div className="text-sm font-bold text-gray-800 leading-tight break-words">{flight.airlineName}</div>
                        <div className="text-xs text-gray-400 font-medium my-0.5">({flight.carrierCode})</div>
                        <div className={`text-[10px] font-bold ${flight.refundStatus === 'Non-Refundable' ? 'text-red-500' : 'text-green-600'}`}>
                            {flight.refundStatus}
                        </div>
                    </div>
                </div>

                {/* 2. Segments Timeline (Centered) */}
                <div className="flex-1 flex flex-col justify-center px-0 min-w-[200px]">
                    {legsArray.map((leg, idx) => (
                        <div key={idx} className="flex items-start justify-between w-full max-w-[400px] mx-auto gap-1">

                            {/* Departure Info */}
                            <div className="flex flex-col text-left min-w-[60px]">
                                <span className="text-[10px] text-gray-400 font-bold mb-1">Depart</span>
                                <div className="text-lg font-bold text-gray-800 leading-none mb-1">
                                    {leg.departure?.airport} {leg.departure?.time?.slice(0, 5)}
                                </div>
                                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{leg.departure?.formattedDate}</span>
                                <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{leg.departure?.city}</span>
                                <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">Flight: {leg.carrier?.departFlight}</span>
                            </div>

                            {/* Visual Timeline (Arrow) */}
                            <div className="flex-1 flex flex-col items-center pt-2 min-w-[60px]">
                                {/* Duration */}
                                <span className="text-[10px] text-red-500 font-medium mb-1 whitespace-nowrap">{leg.formattedElapsedTime}</span>

                                {/* Arrow Line */}
                                <div className="relative w-full flex items-center justify-center px-1">
                                    <div className="w-full border-t border-dashed border-red-300"></div>
                                    <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-red-300 -mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="text-[10px] text-gray-500 font-bold mt-1 text-center whitespace-nowrap">
                                    {leg.stopovers?.length > 0 ? (
                                        <span className="text-red-500">
                                            {leg.transits?.map(t => t.stopoverShortName).join(", ") || `${leg.stopovers.length} Stop(s)`}
                                        </span>
                                    ) : (
                                        <span className="text-green-500">Non Stop</span>
                                    )}
                                </div>
                                {leg.stopovers?.length > 0 && (
                                    <span className="text-[10px] text-red-400 mt-0.5 whitespace-nowrap">{leg.stopovers.length} Stop via {leg.transits?.[0]?.stopoverShortName || leg.transits?.[0]?.stopoverAirport}</span>
                                )}
                            </div>

                            {/* Arrival Info */}
                            <div className="flex flex-col text-right min-w-[60px]">
                                <span className="text-[10px] text-gray-400 font-bold mb-1">Arrive</span>
                                <div className="text-lg font-bold text-gray-800 leading-none mb-1">
                                    {leg.arrival?.airport} {leg.arrival?.time?.slice(0, 5)}
                                </div>
                                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{leg.arrival?.formattedDate}</span>
                                <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{leg.arrival?.city}</span>
                            </div>

                        </div>
                    ))}
                </div>

                {/* 3. Price and Action (Right Side) */}
                <div className="w-full lg:w-auto lg:min-w-[180px] flex flex-col items-center lg:items-end lg:pl-4 space-y-1 mt-4 lg:mt-0">

                    {/* Price Breakdown */}
                    <div className="text-right mb-2 flex flex-col items-end">
                        <span className="text-[10px] text-gray-400 mb-0.5">Starting From</span>
                        <div className="border border-green-500 bg-green-50 rounded-full px-4 py-1 inline-block">
                            <span className="text-sm font-bold text-gray-800">BDT {Number(flight.fare?.totalPrice).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 mt-2">
                        <button
                            onClick={() => { setShowFares(!showFares); markAsSeen(); }}
                            className="bg-[#E41D57] hover:bg-[#c01b4b] text-white font-bold py-1.5 px-6 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                        >
                            {showFares ? "Hide Fares" : "View Fares"}
                            <svg className={`w-3.5 h-3.5 transition-transform ${showFares ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer / GDS Info */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-xs">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Get Points
                    </div>
                    <div className="text-gray-400 text-xs">|</div>
                    <div className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        {flight.gds || "GDS"}
                    </div>
                    <div className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded">
                        {flight.fares?.length} Fares Available
                    </div>
                </div>

                <button
                    onClick={() => { handleShowFlightDetails(); markAsSeen(); }}
                    className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase tracking-wide underline decoration-blue-300 underline-offset-2 hover:decoration-blue-600 transition-all"
                >
                    FLIGHT DETAILS
                </button>
            </div>

            {/* Branded Fares Expanded Section */}
            {showFares && flight.fares && (
                <div className="bg-white px-4 py-5 md:px-6 md:py-8 animate-fadeIn border-t overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Select Your Fare</h3>
                        <span className="text-sm font-bold text-[#E41D57] bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                            {flight.fares.length} Options Found
                        </span>
                    </div>

                    {/* Scroll Container with floating arrows */}
                    <div className="relative px-6 min-w-0">
                        {/* Left Arrow */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow-md hover:border-[#E41D57] hover:text-[#E41D57] transition-all"
                            title="Scroll Left"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        {/* Fare Cards */}
                        <div
                            ref={scrollRef}
                            className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar min-w-0"
                        >
                            {flight.fares.sort((a, b) => a.fare.totalPrice - b.fare.totalPrice).map((fareOption, fIdx) => (
                                <div key={fIdx} className="min-w-[300px] md:min-w-[340px] bg-white rounded-xl shadow-sm border border-gray-200 hover:border-[#E41D57]/40 transition-all p-6 flex flex-col snap-start">
                                    {/* Brand Title */}
                                    <div className="text-sm font-medium text-gray-500 mb-2">
                                        {fareOption.brandedFare?.cabin || "Economy Class"} | {fareOption.brandedFare?.name || "Economy"}
                                    </div>

                                    {/* Price and Select Section */}
                                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                        <div>
                                            <div className="text-2xl font-black text-[#1e2049]">
                                                <span className="text-sm font-bold mr-1">BDT</span>
                                                {Number(fareOption.fare?.totalPrice).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium">
                                                {fareOption.passengerFareSummary?.totalPassenger || 1} Travelers
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <button
                                                onClick={() => handleBookNow(fareOption, fIdx)}
                                                disabled={!!revalidationErrors[fIdx]}
                                                className={`${revalidationErrors[fIdx] ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#E41D57] hover:bg-[#c01b4b]'} text-white font-bold py-2.5 px-8 rounded-lg shadow-sm transition-all`}
                                            >
                                                {revalidationErrors[fIdx] ? 'Unavailable' : 'Select'}
                                            </button>
                                            {revalidationErrors[fIdx] && (
                                                <div className="animate-fadeIn mt-2 w-full">
                                                    <div className="text-[11px] font-bold text-red-500 mb-1.5">
                                                        ⚠ {revalidationErrors[fIdx].message}
                                                    </div>
                                                    <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-[10px] text-gray-600 space-y-1">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Current Fare:</span>
                                                            <span className="font-bold text-gray-700">BDT {Number(revalidationErrors[fIdx].originalFare).toLocaleString()}</span>
                                                        </div>
                                                        {revalidationErrors[fIdx].validatedFare && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">New Fare:</span>
                                                                <span className="font-bold text-red-600">BDT {Number(revalidationErrors[fIdx].validatedFare).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Baggage Section */}
                                    <div className="space-y-3 mb-6">
                                        <div className="text-sm font-bold text-gray-700">Baggage</div>
                                        <div className="space-y-2">
                                            {(() => {
                                                const firstSegBaggage = Object.values(fareOption.baggage || {})?.[0]?.[0] || {};
                                                const carryOn = firstSegBaggage.carryOn?.[0] || { weight: "7", unit: "KG" };
                                                const checked = firstSegBaggage.checked?.[0] || { weight: "30", unit: "KG" };
                                                return (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-[#E41D57]">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13V6a2 2 0 00-2-2H5a2 2 0 00-2 2v7m18 0v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5m18 0h-2M3 13h2m0 0h14" /></svg>
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                <span className="font-semibold text-gray-800">Carry-on Baggage:</span> {carryOn.weight} {carryOn.unit === 'Piece' ? 'Pc' : (carryOn.unit || 'KG')}/Adult
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-[#E41D57]">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                                            </div>
                                                            <div className="text-xs text-gray-600">
                                                                <span className="font-semibold text-gray-800">Checked Baggage:</span> {checked.weight} {checked.unit === 'Piece' ? 'Pc' : (checked.unit || 'KG')}/Adult
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Policies Section */}
                                    <div className="space-y-3 mb-6">
                                        <div className="text-sm font-bold text-gray-700">Policies</div>
                                        <div className="space-y-2">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-[#1e2049]">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium whitespace-nowrap">
                                                        {fareOption.refundStatus || "Non-Refundable"}
                                                    </div>
                                                </div>
                                                {fareOption.penalties && (
                                                    <div className="ml-8 space-y-1">
                                                        {Object.entries(fareOption.penalties).map(([type, pen]) => {
                                                            const isPartial = fareOption.refundStatus === 'Partially-Refundable';
                                                            return pen.refund?.before > 0 ? (
                                                                <div key={type} className="text-[10px] text-gray-500">
                                                                    <span className="font-bold">{type}:</span>
                                                                    <span className="ml-1 text-[#f44336]">BDT {Number(pen.refund.before).toLocaleString()} /Pax</span>
                                                                </div>
                                                            ) : (
                                                                <div key={type} className={`text-[10px] font-bold italic ${isPartial ? 'text-[#1e2049]' : 'text-green-600'}`}>
                                                                    {type}: {isPartial ? 'Fees Apply' : 'Free Refund'}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-[#1e2049]">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium whitespace-nowrap">
                                                        Changeable with Charges
                                                    </div>
                                                </div>
                                                {fareOption.penalties && (
                                                    <div className="ml-8 space-y-1">
                                                        {Object.entries(fareOption.penalties).map(([type, pen]) => (
                                                            pen.change?.before > 0 ? (
                                                                <div key={type} className="text-[10px] text-gray-500">
                                                                    <span className="font-bold">{type}:</span>
                                                                    <span className="ml-1 text-[#1e2049]">BDT {Number(pen.change.before).toLocaleString()} /Pax</span>
                                                                </div>
                                                            ) : (
                                                                <div key={type} className="text-[10px] text-[#1e2049] font-bold italic">
                                                                    {type}: Fees Apply
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brand Features */}
                                    {fareOption.brandedFare?.features && fareOption.brandedFare.features.length > 0 && (
                                        <div className="space-y-3 mb-4">
                                            <div className="text-sm font-bold text-gray-700">Benefits</div>
                                            <div className="space-y-2">
                                                {fareOption.brandedFare.features
                                                    .sort((a, b) => {
                                                        const premiumTags = ['LOUNGE', 'PRIORITY', 'UPGRADE', 'FREE SEAT'];
                                                        const aIsPremium = premiumTags.some(tag => a.toUpperCase().includes(tag));
                                                        const bIsPremium = premiumTags.some(tag => b.toUpperCase().includes(tag));
                                                        if (aIsPremium && !bIsPremium) return -1;
                                                        if (!aIsPremium && bIsPremium) return 1;
                                                        return 0;
                                                    })
                                                    .slice(0, 5).map((feat, bIdx) => (
                                                        <div key={bIdx} className="flex items-center gap-3">
                                                            <div className="text-green-500">
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                            </div>
                                                            <div className="text-xs text-gray-600 font-medium">{feat}</div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* View More (opens flight details modal for this fare) */}
                                    <div className="mt-auto pt-4 flex justify-start">
                                        <button
                                            onClick={() => handleShowFareDetails(fareOption)}
                                            className="text-sm font-bold text-[#E41D57] hover:text-[#c01b4b] underline underline-offset-4"
                                        >
                                            View More
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right Arrow */}
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 shadow-md hover:border-[#E41D57] hover:text-[#E41D57] transition-all"
                            title="Scroll Right"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    {/* Bottom Promo Ribbon */}
                    <div className="mt-8 pt-4 border-t border-[#E41D57]/20 flex items-center justify-center">
                        <div className="text-[11px] font-bold text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-100 flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" /><path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" /></svg>
                            Up to 18% off with City Bank AMEX credit cards during payment
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightCard;
