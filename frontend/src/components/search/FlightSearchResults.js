import React, { useState } from 'react';
import { FiChevronDown, FiClock, FiMinus, FiPlus, FiSun, FiMoon, FiX } from 'react-icons/fi';

const FlightSearchResults = ({ searchParams }) => {
    // Mock Data based on the image provided
    const flightResults = [
        // ... (data remains the same, omitted for brevity if unchanged)
        {
            id: 1,
            airline: 'NOVOAIR',
            airlineLogo: 'https://cdn.worldvectorlogo.com/logos/novoair-logo.svg', // Placeholder
            flightNumber: 'VQ-931',
            departure: { time: '15:00', code: 'DAC', date: '12 Feb' },
            arrival: { time: '16:05', code: 'CXB', date: '12 Feb' },
            duration: '1H 5M',
            stops: 'Non Stop',
            price: 4999,
            currency: 'BDT',
            features: ['Get Points', 'Up to 15% discount with bKash'],
        },
        {
            id: 2,
            airline: 'NOVOAIR',
            airlineLogo: 'https://cdn.worldvectorlogo.com/logos/novoair-logo.svg',
            flightNumber: 'VQ-933',
            departure: { time: '19:15', code: 'DAC', date: '12 Feb' },
            arrival: { time: '20:20', code: 'CXB', date: '12 Feb' },
            duration: '1H 5M',
            stops: 'Non Stop',
            price: 4999,
            currency: 'BDT',
            features: ['Get Points', 'Up to 15% discount with bKash'],
        },
        {
            id: 3,
            airline: 'NOVOAIR',
            airlineLogo: 'https://cdn.worldvectorlogo.com/logos/novoair-logo.svg',
            flightNumber: 'VQ-935',
            departure: { time: '11:30', code: 'DAC', date: '12 Feb' },
            arrival: { time: '12:35', code: 'CXB', date: '12 Feb' },
            duration: '1H 5M',
            stops: 'Non Stop',
            price: 4999,
            currency: 'BDT',
            features: ['Get Points', 'Up to 15% discount with bKash'],
        },
        {
            id: 4,
            airline: 'NOVOAIR',
            airlineLogo: 'https://cdn.worldvectorlogo.com/logos/novoair-logo.svg',
            flightNumber: 'VQ-937',
            departure: { time: '07:10', code: 'DAC', date: '12 Feb' },
            arrival: { time: '08:15', code: 'CXB', date: '12 Feb' },
            duration: '1H 5M',
            stops: 'Non Stop',
            price: 4999,
            currency: 'BDT',
            features: ['Get Points', 'Up to 15% discount with bKash'],
        }
    ];

    const [priceRange, setPriceRange] = useState([4999, 5049]);
    const [selectedFlight, setSelectedFlight] = useState(null);

    const FilterSection = ({ title, children, defaultOpen = true }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);
        return (
            <div className="border-b border-gray-100 py-4 last:border-0">
                <div
                    className="flex items-center justify-between mb-3 cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                    <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                {isOpen && <div>{children}</div>}
            </div>
        );
    };

    return (
        <div className="bg-[#F4F6F9] min-h-screen pb-12 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                {/* Top Promo Cards (Optional, based on 'On Domestic Flight Booking' cards in image) */}
                {/* <div className="grid grid-cols-4 gap-4 mb-6">
                    {['On Domestic Flight', 'On International', 'For Mobile App', 'On Cards'].map((t, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex items-start gap-3">
                            <div className="w-10 h-10 rounded bg-blue-900 flex-shrink-0"></div>
                            <div>
                                <div className="text-xs font-bold text-gray-800 line-clamp-2">{t} Booking</div>
                                <div className="text-[10px] text-blue-600 mt-1 cursor-pointer">Learn More ↗</div>
                            </div>
                        </div>
                    ))}
                </div> */}

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-fit flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                        </div>

                        {/* Airlines */}
                        <FilterSection title="Airlines">
                            <div className="space-y-2">
                                {['Biman Bangladesh Airlines', 'Air Astra', 'NOVOAIR', 'US Bangla'].map((airline, idx) => (
                                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${idx === 2 ? 'bg-[#E41D57] border-[#E41D57] text-white' : 'border-gray-300 bg-white'}`}>
                                            {idx === 2 && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{airline}</span>
                                    </label>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Stops */}
                        <FilterSection title="Stops">
                            <div className="space-y-2">
                                {['Non-Stop', '1 Stop', '2 Stops or more'].map((stop, idx) => (
                                    <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded border border-gray-300 bg-white flex items-center justify-center ${idx === 0 ? 'bg-[#E41D57] border-[#E41D57] text-white' : ''}`}>
                                            {idx === 0 && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{stop}</span>
                                    </label>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Price Range */}
                        <FilterSection title="Price Range">
                            <div className="px-2 mb-4">
                                <div className="h-1 bg-gray-200 rounded-full relative">
                                    <div className="absolute left-0 right-0 h-full bg-[#E41D57] rounded-full"></div>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#E41D57] rounded-full shadow cursor-pointer"></div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#E41D57] rounded-full shadow cursor-pointer"></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs font-bold text-gray-900">
                                <span>BDT {priceRange[0]}</span>
                                <span>BDT {priceRange[1]}</span>
                            </div>
                        </FilterSection>

                        {/* Departure Time */}
                        <FilterSection title="Departure Time">
                            <div className="grid grid-cols-2 gap-2">
                                <button className="p-2 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#1e2049] hover:bg-blue-50 transition-colors">
                                    <FiSun className="w-4 h-4 text-gray-400" />
                                    <span className="text-[10px] text-gray-600">00-06</span>
                                </button>
                                <button className="p-2 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#1e2049] hover:bg-blue-50 transition-colors">
                                    <FiSun className="w-4 h-4 text-orange-400" />
                                    <span className="text-[10px] text-gray-600">06-12</span>
                                </button>
                                <button className="p-2 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#1e2049] hover:bg-blue-50 transition-colors">
                                    <FiSun className="w-4 h-4 text-yellow-500" />
                                    <span className="text-[10px] text-gray-600">12-18</span>
                                </button>
                                <button className="p-2 border border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#1e2049] hover:bg-blue-50 transition-colors">
                                    <FiMoon className="w-4 h-4 text-purple-600" />
                                    <span className="text-[10px] text-gray-600">18-00</span>
                                </button>
                            </div>
                        </FilterSection>

                        {/* Layover Time */}
                        <FilterSection title="Layover Time">
                            <div className="flex flex-wrap gap-2">
                                {['0h-5h', '5h-10h', '10h-15h', '15h+'].map((time, idx) => (
                                    <button key={idx} className="px-3 py-1 text-xs border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600">{time}</button>
                                ))}
                            </div>
                        </FilterSection>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Header Banner */}
                        <div className="bg-[#E41D57] text-white p-4 rounded-xl flex items-center justify-between mb-6 shadow-md">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <span>DAC</span>
                                    <span className="text-white/70">→</span>
                                    <span>CXB</span>
                                    <span className="ml-4 font-normal text-sm opacity-90">Select Flight</span>
                                </h2>
                            </div>
                        </div>

                        {/* Sort Tabs */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-xl border-2 border-[#1e2049] shadow-sm flex items-center gap-4 cursor-pointer relative overflow-hidden">
                                <div className="w-10 h-10 rounded-full bg-[#1e2049] flex items-center justify-center text-white text-xl font-bold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <div className="font-bold text-[#1e2049]">Cheapest</div>
                                    <div className="text-sm text-gray-500">From BDT 4,999</div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-gray-300 transition-colors opacity-60 hover:opacity-100">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xl font-bold">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Fastest</div>
                                    <div className="text-sm text-gray-500">From BDT 4,999</div>
                                </div>
                            </div>
                        </div>

                        {/* Search Results List */}
                        <div className="space-y-4">
                            {flightResults.map((flight) => (
                                <div key={flight.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                                        {/* Airline Info */}
                                        <div className="flex items-center gap-4 md:w-1/4">
                                            <div className="w-12 h-12 flex items-center justify-center">
                                                <img src="https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Novoair_logo.svg/1200px-Novoair_logo.svg.png" alt="Novoair" className="w-full object-contain" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{flight.airline}</div>
                                                <div className="text-xs text-gray-400">{flight.flightNumber}</div>
                                            </div>
                                        </div>

                                        {/* Flight Time & Duration */}
                                        <div className="flex-1 flex items-center justify-center gap-6 w-full md:w-auto">
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-gray-900">{flight.departure.time}</div>
                                                <div className="text-xs text-gray-500">{flight.departure.code}</div>
                                            </div>
                                            <div className="flex flex-col items-center w-32">
                                                <div className="text-[10px] text-gray-400 mb-1">{flight.duration}</div>
                                                <div className="w-full h-px bg-gray-300 relative flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full border border-gray-300 bg-white absolute left-0"></div>
                                                    <div className="bg-white px-1 z-10">
                                                        <span className="text-[9px] text-gray-400 uppercase">{flight.stops}</span>
                                                    </div>
                                                    <div className="w-2 h-2 rounded-full border border-blue-500 bg-white absolute right-0"></div>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xl font-bold text-gray-900">{flight.arrival.time}</div>
                                                <div className="text-xs text-gray-500">{flight.arrival.code}</div>
                                            </div>
                                        </div>

                                        {/* Price & Action */}
                                        <div className="flex flex-col items-end md:w-1/4 gap-2 w-full">
                                            <div className="text-xs text-gray-500">Starting from</div>
                                            <div className="text-xl font-bold text-[#1e2049]">{flight.currency} {flight.price.toLocaleString()}</div>
                                            <button className="bg-[#E41D57] hover:bg-[#c01b4b] text-white font-bold py-2 px-6 rounded-full text-sm transition-colors w-full md:w-auto">
                                                View Fares
                                            </button>
                                        </div>
                                    </div>

                                    {/* Footer / Badges */}
                                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex gap-4">
                                            {flight.features.map((feature, i) => (
                                                <div key={i} className="flex items-center gap-1">
                                                    <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-[10px]">P</div>
                                                    <span className="text-xs text-gray-600">{feature}</span>
                                                </div>
                                            ))}
                                            <div className="text-xs text-green-600 font-medium">Up to 15% discount with bKash</div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFlight(flight)}
                                            className="text-xs font-bold text-blue-600 hover:underline"
                                        >
                                            Flight Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Flight Details Side Modal */}
            {/* Flight Details Side Modal */}
            {selectedFlight && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <style>{`
                        @keyframes slideInRight {
                            from { transform: translateX(100%); }
                            to { transform: translateX(0); }
                        }
                    `}</style>
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setSelectedFlight(null)}
                    />

                    {/* Drawer */}
                    <div
                        className="relative w-full max-w-xl bg-[#F8F9FA] h-full shadow-2xl overflow-y-auto flex flex-col"
                        style={{ animation: 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                    >
                        {/* Header */}
                        <div className="bg-[#E41D57] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                            <h2 className="text-lg font-bold">Flight Details</h2>
                            <button
                                onClick={() => setSelectedFlight(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-[#1e2049] font-bold text-lg mb-4">Departure Flight</h3>

                                <div className="flex items-center gap-3 mb-4">
                                    <img src="https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Novoair_logo.svg/1200px-Novoair_logo.svg.png" alt={selectedFlight.airline} className="w-8 h-8 object-contain" />
                                    <span className="text-gray-700 font-medium">{selectedFlight.airline}</span>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-xl font-bold text-[#1e2049] mb-1">
                                        {selectedFlight.departure.code} ({selectedFlight.departure.code}) - {selectedFlight.arrival.code} ({selectedFlight.arrival.code})
                                    </h4>
                                    <div className="text-gray-500 text-sm">
                                        {selectedFlight.departure.date}, 2026 | {selectedFlight.departure.time} - {selectedFlight.arrival.time} ({selectedFlight.duration}, {selectedFlight.stops})
                                    </div>
                                </div>

                                <hr className="border-gray-100 mb-8" />

                                {/* Timeline */}
                                <div className="relative pl-4">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[83px] top-3 bottom-0 w-[2px] bg-gray-200"></div>

                                    {/* Departure Node */}
                                    <div className="flex gap-8 mb-12 relative">
                                        <div className="text-right w-16 flex-shrink-0">
                                            <div className="font-bold text-[#1e2049] text-lg">{selectedFlight.departure.time}</div>
                                            <div className="text-xs text-gray-500">{selectedFlight.departure.date}, 2026</div>
                                        </div>

                                        <div className="relative z-10 pt-1.5 px-0.5">
                                            <div className="w-3 h-3 rounded-full border-2 border-[#1e2049] bg-white"></div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-bold text-[#1e2049] text-base mb-1">Dhaka ({selectedFlight.departure.code})</div>
                                            <div className="text-sm text-gray-500">Hazrat Shahjalal International Airport, Dhaka</div>
                                        </div>
                                    </div>

                                    {/* Flight Info Segment */}
                                    <div className="flex gap-8 mb-12 relative">
                                        <div className="text-right w-16 flex-shrink-0 flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <FiClock className="w-3 h-3" />
                                                {selectedFlight.duration}
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center my-auto shadow-sm">
                                                <img src="https://cdn.worldvectorlogo.com/logos/novoair-logo.svg" className="w-5 h-5 object-contain" alt="plane" />
                                            </div>
                                        </div>

                                        <div className="flex-1 py-1">
                                            <div className="font-bold text-[#1e2049] text-sm mb-0.5">{selectedFlight.airline}</div>
                                            <div className="text-xs text-gray-500">{selectedFlight.flightNumber} | ATR725</div>
                                        </div>
                                    </div>

                                    {/* Arrival Node */}
                                    <div className="flex gap-8 relative">
                                        <div className="text-right w-16 flex-shrink-0">
                                            <div className="font-bold text-[#1e2049] text-lg">{selectedFlight.arrival.time}</div>
                                            <div className="text-xs text-gray-500">{selectedFlight.arrival.date}, 2026</div>
                                        </div>

                                        <div className="relative z-10 pt-1.5 px-0.5">
                                            <div className="w-3 h-3 rounded-full border-2 border-[#1e2049] bg-white"></div>
                                        </div>

                                        <div className="flex-1">
                                            <div className="font-bold text-[#1e2049] text-base mb-1">Cox's Bazar ({selectedFlight.arrival.code})</div>
                                            <div className="text-sm text-gray-500">Cox's Bazar Airport, Cox's Bazar</div>
                                        </div>
                                    </div>
                                </div>


                            </div>

                            {/* Baggage Info (Bonus, commonly needed) */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-4">
                                <h3 className="text-[#1e2049] font-bold text-sm mb-4 uppercase tracking-wide">Baggage</h3>
                                <div className="flex items-center gap-8 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-700">Adult</span>
                                        <span className="text-gray-500">20 KG</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-700">Child</span>
                                        <span className="text-gray-500">20 KG</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-700">Infant</span>
                                        <span className="text-gray-500">0 KG</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightSearchResults;
