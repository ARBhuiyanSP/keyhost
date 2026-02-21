import React from "react";
import LegAccordion from "./LegAccordion";
import FareSummaryTab from "./FareSummaryTab";

const FlightDetailsTabs = ({ flight, fare, tab, setTab }) => {
    const legsArray = Object.values(flight.legs || []);

    // Determine which tabs to show based on context
    const tabs = fare
        ? [
            { id: "details", label: "Flight Details" },
            { id: "baggage", label: "Baggage" },
            { id: "policies", label: "Policies" },
            { id: "fare", label: "Fare Breakdown" },
        ]
        : [];

    // Calculate airline name from the first leg or flight object
    // Assuming flight.airlineName exists, or falling back to leg carrier
    const firstLeg = legsArray[0];
    const airlineName = flight.airlineName || firstLeg?.carrier?.operatingName || "Flight";

    // Determine active fare for Policies and Fare Breakdown
    // If we're coming from BookingSuccessPage, `flight` is `originalFlightData`, and `fare` is `booking` wrapper.
    // So the best source of fare summary is `flight` itself (or `flight.fare` if nested).
    const activeFare = flight;

    // useEffect removed - no longer needed as 'details' is a valid tab now

    const [airportList, setAirportList] = React.useState(null);

    React.useEffect(() => {
        fetch("/data/airportlist.json")
            .then((res) => res.json())
            .then((data) => setAirportList(data))
            .catch((err) => console.error("Failed to load airport list", err));
    }, []);

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header with Flight Name */}
            <div className="bg-white border-b border-gray-100 px-6 py-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{airlineName}</h3>
                        <p className="text-xs text-gray-500">Flight Details & Fares</p>
                    </div>
                    {flight.brandedFare && (
                        <div className="text-right">
                            <span className="block text-sm font-bold text-[#E41D57]">
                                {flight.brandedFare.name || "Standard Fare"}
                            </span>
                            <span className="text-xs text-gray-500">
                                {flight.brandedFare.cabin || "Economy"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tabs Navigation (Only shown if fare context exists) */}
            {tabs.length > 0 && (
                <div className="flex border-b border-gray-100 bg-white sticky top-0 z-10 px-4 overflow-x-auto">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${tab === t.id
                                ? "border-[#E41D57] text-[#E41D57]"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Tab Content Area */}
            <div className="p-4 md:p-6 overflow-y-auto">
                {tab === "details" && (
                    <div className="space-y-6">
                        {legsArray.map((leg, legIndex) => (
                            <div key={legIndex} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#E41D57]"></div>
                                    {legIndex === 0 ? "Departure Flight" : "Return Flight"}
                                </h4>
                                <LegAccordion leg={leg} defaultOpen={true} flight={flight} airportList={airportList} />
                            </div>
                        ))}
                    </div>
                )}

                {tab === "baggage" && (
                    <div className="space-y-6">
                        {legsArray.map((leg, legIndex) => {
                            const segBaggage = fare?.baggage?.[legIndex]?.[0] || flight.baggage?.[legIndex]?.[0] || {};
                            return (
                                <div key={legIndex} className="space-y-4">
                                    <h4 className="text-sm font-bold text-[#1e2049] uppercase tracking-tight px-1">
                                        {leg.departure?.airport} → {leg.arrival?.airport}
                                    </h4>
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase border-b">
                                                <tr>
                                                    <th className="px-4 py-3">Passenger</th>
                                                    <th className="px-4 py-3">Carry-on</th>
                                                    <th className="px-4 py-3">Checked</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {Object.values(flight.passengerFareSummary || {}).filter(p => p.passengerType).map((pass, pIdx) => {
                                                    const pBaggage = fare?.baggage?.[legIndex]?.[pIdx] || flight.baggage?.[legIndex]?.[pIdx] || {};
                                                    return (
                                                        <tr key={pIdx}>
                                                            <td className="px-4 py-4 font-bold text-gray-700">{pass.passengerType}</td>
                                                            <td className="px-4 py-4 text-gray-600">
                                                                {pBaggage.carryOn?.[0] ? `${pBaggage.carryOn[0].weight} ${pBaggage.carryOn[0].unit}` : "7 KG"}
                                                            </td>
                                                            <td className="px-4 py-4 text-gray-600">
                                                                {pBaggage.checked?.[0] ? `${pBaggage.checked[0].weight} ${pBaggage.checked[0].unit}` : "30 KG"}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {tab === "policies" && (
                    <div className="space-y-6">
                        {/* Cancellation Fees */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-[#1e2049] bg-[#E41D57]/5 p-2 rounded-lg">
                                <span className="p-1 px-2 bg-[#E41D57] text-white text-[10px] rounded">CANCEL</span>
                                Cancellation Charge <span className="text-[10px] text-[#E41D57]/60 ml-auto">Per Traveler</span>
                            </h4>
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase border-b">
                                        <tr>
                                            <th className="px-4 py-3">Flight</th>
                                            <th className="px-4 py-3">Request Time</th>
                                            <th className="px-4 py-3">Adult Ticket</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {legsArray.map((leg, idx) => (
                                            <React.Fragment key={idx}>
                                                <tr>
                                                    <td rowSpan="2" className="px-4 py-4 font-bold text-xs">{leg.departure?.airport}-{leg.arrival?.airport}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-500">Before Departure</td>
                                                    <td className="px-4 py-3 text-xs font-bold text-red-500">{activeFare.refundStatus}</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-xs text-gray-500">No Show</td>
                                                    <td className="px-4 py-3 text-xs font-bold text-red-500">Non-Refundable</td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Change Fees */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-[#1e2049] bg-[#E41D57]/5 p-2 rounded-lg">
                                <span className="p-1 px-2 bg-[#E41D57] text-white text-[10px] rounded">CHANGE</span>
                                Change Charge <span className="text-[10px] text-[#E41D57]/60 ml-auto">Per Traveler</span>
                            </h4>
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase border-b">
                                        <tr>
                                            <th className="px-4 py-3">Flight</th>
                                            <th className="px-4 py-3">Request Time</th>
                                            <th className="px-4 py-3">Adult Ticket</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-xs">
                                        {legsArray.map((leg, idx) => (
                                            <React.Fragment key={idx}>
                                                <tr>
                                                    <td rowSpan="2" className="px-4 py-4 font-bold">{leg.departure?.airport}-{leg.arrival?.airport}</td>
                                                    <td className="px-4 py-3 text-gray-500">Before Departure</td>
                                                    <td className="px-4 py-3 font-bold text-green-600">Changeable</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-3 text-gray-500">No Show</td>
                                                    <td className="px-4 py-3 font-bold text-red-500">Non-Changeable</td>
                                                </tr>
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg flex gap-3 text-xs text-green-800">
                            <svg className="w-5 h-5 flex-shrink-0 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                            <p>Mentioned charges and policies are indicative. Actual charges and policies may differ during cancellation/change in accordance with airline policies.</p>
                        </div>
                    </div>
                )}

                {tab === "fare" && <FareSummaryTab flight={activeFare} />}
            </div>
        </div>
    );
};

export default FlightDetailsTabs;
