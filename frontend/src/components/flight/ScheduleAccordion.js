import React from "react";

const ScheduleAccordion = ({ schedule, airportList }) => {
    // Helper to get airport details
    const getAirportDetails = (code, fallbackName) => {
        if (airportList && airportList[code]) {
            return airportList[code];
        }
        return { name: fallbackName, code: code, shortName: fallbackName };
    };

    const depDetails = getAirportDetails(schedule.departure?.airport, schedule.departure?.airportName || schedule.departure?.airportShortName);
    const arrDetails = getAirportDetails(schedule.arrival?.airport, schedule.arrival?.airportName || schedule.arrival?.airportShortName);

    return (
        <div className="w-full pl-2 pr-4 py-2">
            {/* Grid Layout: Time | Line | Info */}
            <div className="grid grid-cols-[min-content_16px_1fr] gap-x-6">

                {/* --- Row 1: Departure --- */}
                {/* Col 1: Time & Date (Right Aligned) */}
                <div className="text-right whitespace-nowrap pt-1">
                    <div className="text-xl font-bold text-gray-900 leading-none">{schedule.departure?.time?.slice(0, 5)}</div>
                    <div className="text-xs text-gray-500 mt-1">{schedule.departure?.formattedDate}</div>
                </div>

                {/* Col 2: Top Dot (Centered) */}
                <div className="relative flex justify-center pt-2">
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-[#E41D57] z-10 box-content"></div>
                    {/* Line starts from center of dot downwards */}
                    <div className="absolute top-[14px] bottom-0 w-[2px] bg-[#E41D57]/20"></div>
                </div>

                {/* Col 3: Place Info (Left Aligned) */}
                <div className="pt-1 pb-4">
                    <div className="text-base font-bold text-[#1e2049] leading-none">
                        {depDetails.name?.split(',')[0]} <span className="text-gray-400 font-normal">({schedule.departure?.airport})</span>
                    </div>
                    <div className="text-xs text-gray-500 leading-tight mt-1">{depDetails.name}</div>
                    {schedule.departure?.terminal && (
                        <div className="text-[10px] text-[#E41D57] font-bold uppercase mt-1">Terminal {schedule.departure.terminal}</div>
                    )}
                </div>


                {/* --- Row 2: Duration / Line / Airline --- */}
                {/* Col 1: Duration (Right Aligned, Centered Vertically in this row) */}
                <div className="flex items-center justify-end py-4">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-full">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {schedule.formattedElapsedTime}
                    </div>
                </div>

                {/* Col 2: Continuous Line */}
                <div className="relative flex justify-center w-full">
                    <div className="w-[2px] bg-[#E41D57]/20 h-full absolute top-0 bottom-0"></div>
                </div>

                {/* Col 3: Airline Info (Left Aligned, Centered Vertically) */}
                <div className="flex items-center py-2">
                    <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 rounded p-0.5 bg-gray-50 flex items-center justify-center">
                            <img src={schedule.carrier?.operatingLogo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-900">{schedule.carrier?.operatingName}</div>
                            <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                <span>{schedule.carrier?.marketing}-{schedule.carrier?.marketingFlight || schedule.carrier?.marketingFlightNumber}</span>
                                <span>·</span>
                                <span>{schedule.carrier?.equipment?.typeForFirstLeg || "Aircraft"}</span>
                                <span>·</span>
                                <span className="text-green-600 font-bold">
                                    {schedule.cabinTypeName || "Economy"}
                                    {schedule.bookingCode && <span className="text-gray-500 ml-1">({schedule.bookingCode})</span>}
                                </span>
                            </div>

                            {/* Seat Availability Check */}
                            {(schedule.seatsAvailable || schedule.cabin?.seatsAvailable) && (
                                <div className="text-[10px] text-orange-600 font-bold mt-0.5">
                                    {schedule.seatsAvailable || schedule.cabin?.seatsAvailable} Seats Left
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                {/* --- Row 3: Arrival --- */}
                {/* Col 1: Time & Date */}
                <div className="text-right whitespace-nowrap pb-1 mt-auto">
                    <div className="text-xl font-bold text-gray-900 leading-none">{schedule.arrival?.time?.slice(0, 5)}</div>
                    <div className="text-xs text-gray-500 mt-1">{schedule.arrival?.formattedDate}</div>
                </div>

                {/* Col 2: Bottom Dot */}
                <div className="relative flex justify-center pb-2 mt-auto">
                    {/* Line ends at center of dot */}
                    <div className="absolute top-0 bottom-[14px] w-[2px] bg-[#E41D57]/20"></div>
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-[#E41D57] z-10 box-content mt-auto mb-[5px]"></div>
                </div>

                {/* Col 3: Place Info */}
                <div className="pt-4 pb-1 mt-auto">
                    <div className="text-base font-bold text-[#1e2049] leading-none">
                        {arrDetails.name?.split(',')[0]} <span className="text-gray-400 font-normal">({schedule.arrival?.airport})</span>
                    </div>
                    <div className="text-xs text-gray-500 leading-tight mt-1">{arrDetails.name}</div>
                    {schedule.arrival?.terminal && (
                        <div className="text-[10px] text-[#E41D57] font-bold uppercase mt-1">Terminal {schedule.arrival.terminal}</div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ScheduleAccordion;
