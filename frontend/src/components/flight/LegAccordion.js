import React from "react";
import ScheduleAccordion from "./ScheduleAccordion";

const LegAccordion = ({ leg, defaultOpen, flight, airportList }) => {
    return (
        <div className="w-full">
            <div className="mb-4">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                    {leg.departure?.airport} → {leg.arrival?.airport}
                </div>
                <div className="text-sm font-bold text-[#1e2049] flex items-center gap-2">
                    <span>{leg.departure?.formattedDate}</span>
                    <span className="text-gray-300">|</span>
                    <span>{leg.departure?.time?.slice(0, 5)} - {leg.arrival?.time?.slice(0, 5)}</span>
                    <span className="text-gray-400 font-normal ml-auto">({leg.formattedElapsedTime})</span>
                </div>
            </div>

            <div className="w-full relative">
                {/* Vertical Line Connector */}
                {/* Vertical Line Connector Removed - Moving to ScheduleAccordion 3-col layout */}

                <div className="space-y-4 relative z-10">
                    {leg.schedules.map((schedule, schKey) => (
                        <div key={schKey} className="space-y-4">
                            <ScheduleAccordion
                                schedule={schedule}
                                schKey={schKey}
                                leg={leg}
                                flight={flight}
                                airportList={airportList}
                            />

                            {/* Transit Info Box (if not last schedule) */}
                            {schKey < leg.schedules.length - 1 && leg.transits?.[schKey] && (
                                <div className="ml-10 bg-[#fffbeb] border border-[#fef3c7] rounded-lg p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-white rounded shadow-sm">
                                            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-yellow-700 font-bold uppercase">Layover</div>
                                            <div className="text-xs font-bold text-gray-800">{leg.transits[schKey].transitTime} at {leg.transits[schKey].stopoverShortName} ({leg.transits[schKey].stopoverAirport})</div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold text-[#E41D57] uppercase cursor-pointer hover:underline">Change Aircraft</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default LegAccordion;
