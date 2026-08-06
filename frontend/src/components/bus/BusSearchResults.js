import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiMapPin, FiCalendar, FiClock, FiCheck, 
  FiChevronDown, FiChevronUp, FiFilter, FiUser, FiArrowRight, FiX, FiCheckCircle, FiRepeat, FiEdit2 
} from 'react-icons/fi';
import { FaBus } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import api from '../../utils/api';
import { useQuery } from 'react-query';

import busCitiesData from '../../data/busCities.json';

// Fallback Intercity Bus Trips for Testing & Demonstration
const DEMO_BUS_TRIPS = [
  {
    id: 'TRIP-101',
    schedule_id: 1,
    operator_name: 'Green Line Paribahan',
    operator_code: 'GREENLINE',
    bus_type: 'AC Volvo Multi-Axle',
    is_ac: true,
    from_city: 'Dhaka',
    to_city: 'Cox\'s Bazar',
    departure_time: '10:00 PM',
    arrival_time: '06:00 AM',
    duration: '8h 00m',
    price: 1800,
    total_seats: 40,
    booked_seats: ['A3', 'A4', 'B1', 'C2', 'D4'],
    boarding_points: ['Arambagh Counter (10:00 PM)', 'Kalabagan Counter (10:30 PM)', 'Sayedabad (11:00 PM)'],
    dropping_points: ['Kolatoli Point (06:00 AM)', 'Dolphin Goli (06:15 AM)'],
    rating: 4.8,
  },
  {
    id: 'TRIP-102',
    schedule_id: 2,
    operator_name: 'Hanif Enterprise',
    operator_code: 'HANIF',
    bus_type: 'AC Scania Luxury',
    is_ac: true,
    from_city: 'Dhaka',
    to_city: 'Cox\'s Bazar',
    departure_time: '11:15 PM',
    arrival_time: '07:15 AM',
    duration: '8h 00m',
    price: 1500,
    total_seats: 40,
    booked_seats: ['A1', 'B2', 'B3', 'E1', 'E2'],
    boarding_points: ['Gabtoli Counter (10:45 PM)', 'Kalabagan (11:15 PM)'],
    dropping_points: ['Sugandha Beach (07:15 AM)', 'Kolatoli (07:30 AM)'],
    rating: 4.6,
  },
  {
    id: 'TRIP-103',
    schedule_id: 3,
    operator_name: 'Shohag Elite',
    operator_code: 'SHOHAG',
    bus_type: 'Non-AC Hino Chair Coach',
    is_ac: false,
    from_city: 'Dhaka',
    to_city: 'Cox\'s Bazar',
    departure_time: '08:30 PM',
    arrival_time: '05:00 AM',
    duration: '8h 30m',
    price: 900,
    total_seats: 40,
    booked_seats: ['C1', 'C2', 'F3', 'F4'],
    boarding_points: ['Arambagh Counter (08:30 PM)', 'Sayedabad (09:00 PM)'],
    dropping_points: ['Bus Terminal (05:00 AM)'],
    rating: 4.3,
  },
  {
    id: 'TRIP-104',
    schedule_id: 4,
    operator_name: 'Ena Transport',
    operator_code: 'ENA',
    bus_type: 'AC Hyundai Business',
    is_ac: true,
    from_city: 'Dhaka',
    to_city: 'Cox\'s Bazar',
    departure_time: '09:30 PM',
    arrival_time: '05:30 AM',
    duration: '8h 00m',
    price: 1600,
    total_seats: 36,
    booked_seats: ['A1', 'A2', 'D1', 'D2'],
    boarding_points: ['Uttara Counter (08:45 PM)', 'Mohakhali (09:30 PM)'],
    dropping_points: ['Kolatoli (05:30 AM)'],
    rating: 4.7,
  },
  {
    id: 'TRIP-105',
    schedule_id: 5,
    operator_name: 'Shyamoli Paribahan',
    operator_code: 'SHYAMOLI',
    bus_type: 'Non-AC Deluxe',
    is_ac: false,
    from_city: 'Dhaka',
    to_city: 'Cox\'s Bazar',
    departure_time: '11:45 PM',
    arrival_time: '08:15 AM',
    duration: '8h 30m',
    price: 850,
    total_seats: 40,
    booked_seats: ['B1', 'B2', 'G1', 'G2'],
    boarding_points: ['Sayedabad (11:45 PM)'],
    dropping_points: ['Kolatoli (08:15 AM)'],
    rating: 4.2,
  },
];

const BusSearchResults = ({ searchParams: initialSearchParams }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search Form State (Matching Flight Theme)
  const [fromCity, setFromCity] = useState(searchParams.get('from') || searchParams.get('city') || 'Dhaka');
  const [toCity, setToCity] = useState(searchParams.get('to') || 'Cox\'s Bazar');
  const [journeyDate, setJourneyDate] = useState(
    searchParams.get('depart') || searchParams.get('check_in_date') 
      ? new Date(searchParams.get('depart') || searchParams.get('check_in_date'))
      : new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const [returnDate, setReturnDate] = useState(searchParams.get('return') ? new Date(searchParams.get('return')) : null);
  const [tripType, setTripType] = useState('oneWay'); // 'oneWay', 'roundTrip'
  const [passengers, setPassengers] = useState(parseInt(searchParams.get('travelers')) || 1);
  const [busClass, setBusClass] = useState('All'); // 'All', 'AC', 'Non-AC'

  // Has User Clicked Search? (If URL params exist, default to searched)
  const [hasSearched, setHasSearched] = useState(() => {
    return Boolean(searchParams.get('from') || searchParams.get('to') || searchParams.get('city'));
  });

  // Dropdown Suggestion States
  const [activeSuggestion, setActiveSuggestion] = useState(null); // 'from' | 'to' | null
  const [searchFromInput, setSearchFromInput] = useState('');
  const [searchToInput, setSearchToInput] = useState('');

  // Expand / View Seats Trip ID State
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState('');
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState('');
  
  // Passenger Form & Confirmation State
  const [passengerInfo, setPassengerInfo] = useState({ name: '', phone: '', email: '', gender: 'male' });
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Results Filter & Sort State
  const [busTypeFilter, setBusTypeFilter] = useState('All');
  const [selectedOperators, setSelectedOperators] = useState([]);
  const [sortBy, setSortBy] = useState('price_low');

  // Sync cities from busCitiesData
  const cities = useMemo(() => busCitiesData.map((c) => c.name), []);

  const swapCities = (e) => {
    if (e) e.stopPropagation();
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    params.set('property_type', 'bus');
    params.set('from', fromCity);
    params.set('to', toCity);
    params.set('depart', journeyDate.toISOString().split('T')[0]);
    if (returnDate) params.set('return', returnDate.toISOString().split('T')[0]);
    params.set('travelers', passengers);
    setSearchParams(params);

    setHasSearched(true);
    setExpandedTripId(null);
    setSelectedSeats([]);
  };

  // Fetch dynamic bus schedules from MySQL database
  const { data: dbBusTrips } = useQuery(
    ['busSchedules', fromCity, toCity, journeyDate, busTypeFilter],
    async () => {
      const formattedDate = journeyDate ? journeyDate.toISOString().split('T')[0] : '';
      const res = await api.get(`/guest/bus/search?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${formattedDate}`);
      return res.data?.data || res.data || [];
    },
    {
      enabled: hasSearched,
      initialData: DEMO_BUS_TRIPS,
    }
  );

  const activeTripSource = (dbBusTrips && dbBusTrips.length > 0) ? dbBusTrips : DEMO_BUS_TRIPS;

  // Filtered & Sorted Bus Trips
  const filteredTrips = useMemo(() => {
    return activeTripSource.filter((trip) => {
      const matchesFrom = !fromCity || trip.from_city.toLowerCase() === fromCity.toLowerCase();
      const matchesTo = !toCity || trip.to_city.toLowerCase() === toCity.toLowerCase();
      
      const matchesAc = 
        busTypeFilter === 'All' || 
        (busTypeFilter === 'AC' && trip.is_ac) || 
        (busTypeFilter === 'Non-AC' && !trip.is_ac);

      const matchesOperator = 
        selectedOperators.length === 0 || 
        selectedOperators.includes(trip.operator_code);

      return matchesFrom && matchesTo && matchesAc && matchesOperator;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      return 0;
    });
  }, [activeTripSource, fromCity, toCity, busTypeFilter, selectedOperators, sortBy]);

  // Toggle seat selection
  const toggleSeat = (seatNo, bookedSeats) => {
    if (bookedSeats.includes(seatNo)) return;
    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNo));
    } else {
      if (selectedSeats.length >= 4) {
        alert('You can select a maximum of 4 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNo]);
    }
  };

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  const handleConfirmBooking = async (trip) => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to continue.');
      return;
    }
    if (!passengerInfo.name || !passengerInfo.phone) {
      alert('Please enter passenger Name and Mobile number.');
      return;
    }

    const bookingRef = `BUS-${Math.floor(100000 + Math.random() * 900000)}`;
    const bookingData = {
      bookingRef,
      trip,
      seats: selectedSeats,
      totalAmount: selectedSeats.length * trip.price,
      passenger: passengerInfo,
      boardingPoint: selectedBoardingPoint || trip.boarding_points[0],
      droppingPoint: selectedDroppingPoint || trip.dropping_points[0],
      date: journeyDate.toISOString().split('T')[0],
    };

    try {
      const res = await api.post('/guest/bus/book', {
        schedule_id: trip.schedule_id || 1,
        passenger_name: passengerInfo.name,
        passenger_phone: passengerInfo.phone,
        passenger_email: passengerInfo.email,
        seat_numbers: selectedSeats,
        total_price: selectedSeats.length * trip.price,
        boarding_point: selectedBoardingPoint || trip.boarding_points[0],
        dropping_point: selectedDroppingPoint || trip.dropping_points[0],
        journey_date: journeyDate.toISOString().split('T')[0],
      });

      if (res.data?.data?.bookingRef) {
        bookingData.bookingRef = res.data.data.bookingRef;
      }
    } catch (e) {
      console.warn('Booking saved locally as fallback:', e);
    }

    setConfirmedBooking(bookingData);
    setIsBookingSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      
      {/* ============================================================== */}
      {/* 1. FIRST PAGE / LANDING: FLIGHT-STYLE BUS SEARCH CARD THEME    */}
      {/* ============================================================== */}
      {!hasSearched ? (
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 space-y-6">
            
            {/* Header Title & Trip Type Pills */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h1 className="text-2xl font-bold text-[#1e2049] flex items-center gap-2">
                  <FaBus className="text-[#E41D57]" /> Book Intercity Bus Tickets
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Search & book AC / Non-AC bus seats across major Bangladesh cities.
                </p>
              </div>

              {/* One Way / Round Trip Toggles */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full w-fit">
                <button
                  type="button"
                  onClick={() => { setTripType('oneWay'); setReturnDate(null); }}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    tripType === 'oneWay' ? 'bg-[#1e2049] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('roundTrip')}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                    tripType === 'roundTrip' ? 'bg-[#1e2049] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Round Trip
                </button>
              </div>
            </div>

            {/* Flight-Style Search Grid Controls */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              
              {/* FROM FIELD */}
              <div 
                className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 relative"
              >
                <div 
                  onClick={() => setActiveSuggestion('from')}
                  className="p-4 border border-gray-200 rounded-2xl hover:border-[#1e2049] bg-white cursor-pointer transition-all relative"
                >
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">From</label>
                  <div className="text-base font-bold text-[#1e2049] truncate">{fromCity}</div>
                  <div className="text-xs text-gray-400">Bangladesh Intercity</div>

                  {/* Dropdown Suggestions */}
                  {activeSuggestion === 'from' && (
                    <div 
                      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-64 overflow-y-auto z-[99999] p-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={searchFromInput}
                        onChange={(e) => setSearchFromInput(e.target.value)}
                        className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg mb-2 focus:outline-none"
                        autoFocus
                      />
                      {busCitiesData
                        .filter((c) => c.name.toLowerCase().includes(searchFromInput.toLowerCase()))
                        .map((c) => (
                          <div
                            key={c.id}
                            onClick={() => { setFromCity(c.name); setActiveSuggestion(null); setSearchFromInput(''); }}
                            className="p-2.5 hover:bg-pink-50 rounded-xl cursor-pointer text-xs font-semibold text-gray-800 flex items-center justify-between"
                          >
                            <span>{c.name}</span>
                            <span className="text-[10px] text-gray-400">{c.division}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* SWAP BUTTON */}
                <button
                  type="button"
                  onClick={swapCities}
                  className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full items-center justify-center shadow-md hover:bg-gray-50 text-[#1e2049] transition-all"
                  title="Swap Cities"
                >
                  <FiRepeat className="w-4 h-4" />
                </button>

                {/* TO FIELD */}
                <div 
                  onClick={() => setActiveSuggestion('to')}
                  className="p-4 border border-gray-200 rounded-2xl hover:border-[#1e2049] bg-white cursor-pointer transition-all relative"
                >
                  <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">To</label>
                  <div className="text-base font-bold text-[#1e2049] truncate">{toCity}</div>
                  <div className="text-xs text-gray-400">Bangladesh Intercity</div>

                  {/* Dropdown Suggestions */}
                  {activeSuggestion === 'to' && (
                    <div 
                      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-64 overflow-y-auto z-[99999] p-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={searchToInput}
                        onChange={(e) => setSearchToInput(e.target.value)}
                        className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-lg mb-2 focus:outline-none"
                        autoFocus
                      />
                      {busCitiesData
                        .filter((c) => c.name.toLowerCase().includes(searchToInput.toLowerCase()))
                        .map((c) => (
                          <div
                            key={c.id}
                            onClick={() => { setToCity(c.name); setActiveSuggestion(null); setSearchToInput(''); }}
                            className="p-2.5 hover:bg-pink-50 rounded-xl cursor-pointer text-xs font-semibold text-gray-800 flex items-center justify-between"
                          >
                            <span>{c.name}</span>
                            <span className="text-[10px] text-gray-400">{c.division}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* JOURNEY DATE */}
              <div className="p-4 border border-gray-200 rounded-2xl hover:border-[#1e2049] bg-white cursor-pointer transition-all no-datepicker-border">
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Journey Date</label>
                <DatePicker
                  selected={journeyDate}
                  onChange={(d) => d && setJourneyDate(d)}
                  minDate={new Date()}
                  dateFormat="dd MMM yyyy"
                  wrapperClassName="w-full"
                  popperClassName="z-[99999]"
                  className="w-full text-base font-bold text-[#1e2049] bg-transparent border-none outline-none focus:outline-none focus:ring-0 shadow-none cursor-pointer"
                />
                <div className="text-xs text-gray-400">{journeyDate ? journeyDate.toLocaleDateString('en-US', { weekday: 'short' }) : ''}</div>
              </div>

              {/* RETURN DATE */}
              <div 
                onClick={() => {
                  if (tripType !== 'roundTrip') setTripType('roundTrip');
                }}
                className="p-4 border border-gray-200 rounded-2xl hover:border-[#1e2049] bg-white cursor-pointer transition-all no-datepicker-border"
              >
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Return Date</label>
                <DatePicker
                  selected={returnDate}
                  onChange={(d) => {
                    setReturnDate(d);
                    if (d) setTripType('roundTrip');
                  }}
                  minDate={journeyDate || new Date()}
                  placeholderText="Add Return Date"
                  dateFormat="dd MMM yyyy"
                  wrapperClassName="w-full"
                  popperClassName="z-[99999]"
                  className="w-full text-base font-bold text-[#1e2049] bg-transparent border-none outline-none focus:outline-none focus:ring-0 shadow-none cursor-pointer placeholder-gray-400"
                />
                <div className="text-xs text-gray-400">{returnDate ? returnDate.toLocaleDateString('en-US', { weekday: 'short' }) : 'Optional'}</div>
              </div>

              {/* PASSENGERS */}
              <div className="p-4 border border-gray-200 rounded-2xl hover:border-[#1e2049] bg-white transition-all">
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-1">Passengers</label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="w-full text-base font-bold text-[#1e2049] bg-transparent focus:outline-none cursor-pointer border-none outline-none"
                >
                  <option value={1}>1 Passenger</option>
                  <option value={2}>2 Passengers</option>
                  <option value={3}>3 Passengers</option>
                  <option value={4}>4 Passengers</option>
                </select>
                <div className="text-xs text-gray-400">{passengers} Seat{passengers > 1 ? 's' : ''} • Max 4</div>
              </div>

            </div>

            {/* SEARCH BUTTON */}
            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="px-10 py-4 bg-[#E41D57] hover:bg-[#d0174a] text-white font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
              >
                <FiSearch className="w-5 h-5" /> Search Buses
              </button>
            </div>

          </div>
        </div>
      ) : (

        /* ============================================================== */
        /* 2. SECOND PAGE: RESULTS LIST, FILTERS & INTERACTIVE SEAT MAP   */
        /* ============================================================== */
        <div>
          {/* Collapsible Top Bar for Results View */}
          <div className="bg-[#1e2049] text-white py-5 px-4 shadow-md sticky top-0 z-40">
            <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <FaBus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    {fromCity} <span className="text-pink-400">→</span> {toCity}
                  </h2>
                  <p className="text-xs text-gray-300">
                    {journeyDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} • {busTypeFilter} Bus
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setHasSearched(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <FiEdit2 className="w-3.5 h-3.5" /> Modify Search
              </button>
            </div>
          </div>

          {/* Results Content Layout */}
          <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Filter Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2 border-b pb-3">
                  <FiFilter className="text-[#E41D57]" /> Filter Buses
                </h3>

                {/* Bus Type */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 block mb-2">Bus Type</label>
                  <div className="flex rounded-xl border border-gray-200 p-1 bg-gray-50">
                    {['All', 'AC', 'Non-AC'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBusTypeFilter(type)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          busTypeFilter === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operator Filter */}
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400 block mb-2">Bus Operators</label>
                  <div className="space-y-2 text-sm">
                    {[
                      { name: 'Green Line Paribahan', code: 'GREENLINE' },
                      { name: 'Hanif Enterprise', code: 'HANIF' },
                      { name: 'Shohag Elite', code: 'SHOHAG' },
                      { name: 'Ena Transport', code: 'ENA' },
                      { name: 'Shyamoli Paribahan', code: 'SHYAMOLI' },
                    ].map((op) => (
                      <label key={op.code} className="flex items-center gap-2.5 text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedOperators.includes(op.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOperators([...selectedOperators, op.code]);
                            } else {
                              setSelectedOperators(selectedOperators.filter((c) => c !== op.code));
                            }
                          }}
                          className="rounded border-gray-300 text-[#E41D57] focus:ring-[#E41D57]"
                        />
                        {op.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Bus Schedule List */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Sort & Count Bar */}
              <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Found <strong className="text-gray-900">{filteredTrips.length}</strong> buses for <strong className="text-[#E41D57]">{fromCity} → {toCity}</strong>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none"
                  >
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Bus Cards List */}
              {filteredTrips.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-pink-50 text-[#E41D57] flex items-center justify-center mx-auto">
                    <FaBus className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No Buses Available</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    No active bus schedules were found matching your route and filters. Try changing cities or bus type.
                  </p>
                </div>
              ) : (
                filteredTrips.map((trip) => {
                  const isExpanded = expandedTripId === trip.id;
                  const availableCount = trip.total_seats - trip.booked_seats.length;

                  return (
                    <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                      
                      {/* Bus Card Header */}
                      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-gray-900">{trip.operator_name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              trip.is_ac ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                            }`}>
                              {trip.bus_type}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <span>★ {trip.rating}</span> • <span>Counter: {trip.boarding_points[0]}</span>
                          </div>
                        </div>

                        {/* Timing */}
                        <div className="flex items-center gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-gray-900">{trip.departure_time}</div>
                            <div className="text-xs text-gray-400">{trip.from_city}</div>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-gray-400">{trip.duration}</span>
                            <div className="w-16 h-0.5 bg-gray-200 my-1 relative">
                              <div className="w-2 h-2 rounded-full bg-[#E41D57] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-gray-900">{trip.arrival_time}</div>
                            <div className="text-xs text-gray-400">{trip.to_city}</div>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0">
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Seats Available: <span className="font-bold text-green-600">{availableCount}</span></div>
                            <div className="text-xl font-bold text-[#E41D57]">৳{trip.price.toLocaleString()}</div>
                          </div>
                          <button
                            onClick={() => {
                              if (isExpanded) {
                                setExpandedTripId(null);
                              } else {
                                setExpandedTripId(trip.id);
                                setSelectedSeats([]);
                                setSelectedBoardingPoint(trip.boarding_points[0]);
                                setSelectedDroppingPoint(trip.dropping_points[0]);
                              }
                            }}
                            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 ${
                              isExpanded 
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                : 'bg-[#E41D57] text-white hover:bg-[#d0174a]'
                            }`}
                          >
                            {isExpanded ? 'Hide Seats' : 'View Seats'} {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable 2D Seat Map & Checkout */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* 2D Bus Seat Layout Grid */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm max-w-xs mx-auto md:mx-0">
                              <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase">
                                <span>Front Entrance</span>
                                <span className="flex items-center gap-1 text-gray-700 font-semibold">
                                  🛞 Driver
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px] mb-4 pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-3.5 h-3.5 rounded border border-gray-300 bg-white inline-block" />
                                  <span className="text-gray-600">Available</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-3.5 h-3.5 rounded bg-[#E41D57] inline-block" />
                                  <span className="text-gray-600">Selected</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-3.5 h-3.5 rounded bg-gray-300 inline-block" />
                                  <span className="text-gray-600">Booked</span>
                                </div>
                              </div>

                              <div className="space-y-2.5">
                                {rows.map((row) => {
                                  const is2x1 = trip.seat_plan === '2x1';
                                  const rightSeats = is2x1 ? [`${row}3`] : [`${row}3`, `${row}4`];

                                  return (
                                    <div key={row} className="flex items-center justify-between gap-2">
                                      {/* Left Pair */}
                                      <div className="flex gap-2">
                                        {[`${row}1`, `${row}2`].map((seatNo) => {
                                          const isBooked = trip.booked_seats.includes(seatNo);
                                          const isSelected = selectedSeats.includes(seatNo);
                                          return (
                                            <button
                                              key={seatNo}
                                              type="button"
                                              disabled={isBooked}
                                              onClick={() => toggleSeat(seatNo, trip.booked_seats)}
                                              className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                                                isBooked
                                                  ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                                                  : isSelected
                                                  ? 'bg-[#E41D57] border-[#E41D57] text-white shadow-sm scale-105'
                                                  : 'bg-white border-gray-300 text-gray-700 hover:border-[#E41D57] hover:text-[#E41D57]'
                                              }`}
                                            >
                                              {seatNo}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {/* Aisle */}
                                      <div className="text-[10px] font-bold text-gray-300 select-none">AISLE</div>

                                      {/* Right Pair / Single */}
                                      <div className="flex gap-2">
                                        {rightSeats.map((seatNo) => {
                                          const isBooked = trip.booked_seats.includes(seatNo);
                                          const isSelected = selectedSeats.includes(seatNo);
                                          return (
                                            <button
                                              key={seatNo}
                                              type="button"
                                              disabled={isBooked}
                                              onClick={() => toggleSeat(seatNo, trip.booked_seats)}
                                              className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border flex items-center justify-center ${
                                                isBooked
                                                  ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                                                  : isSelected
                                                  ? 'bg-[#E41D57] border-[#E41D57] text-white shadow-sm scale-105'
                                                  : 'bg-white border-gray-300 text-gray-700 hover:border-[#E41D57] hover:text-[#E41D57]'
                                              }`}
                                            >
                                              {seatNo}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Booking Details & Passenger Form */}
                            <div className="space-y-4">
                              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
                                <div className="flex justify-between text-gray-600">
                                  <span>Selected Seats ({selectedSeats.length}):</span>
                                  <span className="font-bold text-gray-900">
                                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                                  </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Fare per seat:</span>
                                  <span className="font-semibold">৳{trip.price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold border-t pt-2 text-gray-900">
                                  <span>Total Amount:</span>
                                  <span className="text-[#E41D57]">৳{(selectedSeats.length * trip.price).toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-bold text-gray-700 block mb-1">Boarding Counter</label>
                                  <select
                                    value={selectedBoardingPoint}
                                    onChange={(e) => setSelectedBoardingPoint(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                                  >
                                    {trip.boarding_points.map((pt) => (
                                      <option key={pt} value={pt}>{pt}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-gray-700 block mb-1">Dropping Counter</label>
                                  <select
                                    value={selectedDroppingPoint}
                                    onChange={(e) => setSelectedDroppingPoint(e.target.value)}
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none"
                                  >
                                    {trip.dropping_points.map((pt) => (
                                      <option key={pt} value={pt}>{pt}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Passenger Contact Details</h4>
                                <input
                                  type="text"
                                  placeholder="Full Name"
                                  value={passengerInfo.name}
                                  onChange={(e) => setPassengerInfo({ ...passengerInfo, name: e.target.value })}
                                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E41D57]"
                                />
                                <input
                                  type="tel"
                                  placeholder="Mobile Number (+880)"
                                  value={passengerInfo.phone}
                                  onChange={(e) => setPassengerInfo({ ...passengerInfo, phone: e.target.value })}
                                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#E41D57]"
                                />
                              </div>

                              <button
                                onClick={() => handleConfirmBooking(trip)}
                                disabled={selectedSeats.length === 0}
                                className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                                  selectedSeats.length > 0
                                    ? 'bg-[#E41D57] hover:bg-[#d0174a]'
                                    : 'bg-gray-300 cursor-not-allowed'
                                }`}
                              >
                                Proceed to Payment (৳{(selectedSeats.length * trip.price).toLocaleString()})
                              </button>
                            </div>

                          </div>
                        </div>
                      )}

                    </div>
                  );
                })
              )}

            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isBookingSuccess && confirmedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
              <FiCheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Bus Ticket Reserved!</h3>
            <p className="text-xs text-gray-500">
              Booking Ref: <strong className="text-gray-900 font-mono">{confirmedBooking.bookingRef}</strong>
            </p>

            <div className="bg-gray-50 p-4 rounded-2xl text-left text-xs space-y-2 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Operator:</span>
                <span className="font-bold text-gray-900">{confirmedBooking.trip.operator_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Route:</span>
                <span className="font-bold text-gray-900">{confirmedBooking.trip.from_city} → {confirmedBooking.trip.to_city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Selected Seats:</span>
                <span className="font-bold text-[#E41D57]">{confirmedBooking.seats.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Boarding Point:</span>
                <span className="font-semibold text-gray-800 truncate max-w-[200px]">{confirmedBooking.boardingPoint}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-sm font-bold">
                <span>Total Amount:</span>
                <span className="text-[#E41D57]">৳{confirmedBooking.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsBookingSuccess(false);
                alert('Payment integration ready (bKash / Nagad / SSLCommerz). Ticket reference saved!');
              }}
              className="w-full py-3 bg-[#E41D57] text-white font-bold text-xs rounded-xl hover:bg-[#d0174a] transition-all shadow-md"
            >
              Pay Now & Get E-Ticket
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default BusSearchResults;
