import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCountries, bookFlight } from '../../utils/flightApi';

// Helper to calculate exact age
function calculateExactAge(birth, ref) {
    const diffMs = ref - birth;
    const totalDays = diffMs / (1000 * 60 * 60 * 24);
    const years = Math.floor(totalDays / 365.25);
    const months = Math.floor((totalDays - years * 365.25) / 30.4375);
    const days = Math.floor(totalDays - years * 365.25 - months * 30.4375);
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) - (years * 365.25 + months * 30.4375 + days) * 24);
    const totalYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return { years, months, days, hours, totalMs: diffMs, totalDays, totalYears };
}

const FlightBooking = () => {
    const navigate = useNavigate();
    const [flight, setFlight] = useState(null);
    const [countries, setCountries] = useState([]);
    const [passengers, setPassengers] = useState([]);
    const [contact, setContact] = useState({ country_code: '880', mobile: '', email: '' });
    const [leadPassenger, setLeadPassenger] = useState({ country_code: '880', mobile: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [flightDetailsOpen, setFlightDetailsOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [openPassengerIndex, setOpenPassengerIndex] = useState(0);
    const [ageValidation, setAgeValidation] = useState({});
    const [timer, setTimer] = useState(1200); // 20 minutes in seconds

    // Timer Countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Load Flight Data
                const flightData = localStorage.getItem('bookingFlight');
                if (!flightData) {
                    setError("No flight data found. Please search again.");
                    setLoading(false);
                    return;
                }
                const parsedFlight = JSON.parse(flightData);
                setFlight(parsedFlight);

                // 2. Initialize Passengers
                const initialPassengers = [];
                const summary = parsedFlight.passengerFareSummary;
                if (summary) {
                    Object.keys(summary).forEach(key => {
                        if (key === 'totalPassenger') return;
                        const item = summary[key];
                        for (let i = 0; i < item.passengerNumberByType; i++) {
                            initialPassengers.push({
                                type: item.passengerType, // e.g., 'Adult', 'Children'
                                code: item.code || (item.passengerType === 'Adult' ? 'ADT' : item.passengerType === 'Children' ? 'C07' : 'INF'), // Fallback codes
                                first_name: '',
                                last_name: '',
                                nationality: '',
                                gender: '',
                                dob: '',
                                passport_number: '',
                                passport_country: '',
                                passport_expiry: '',
                                title: 'Mr',
                            });
                        }
                    });
                } else {
                    // Fallback if summary missing (shouldn't happen with correct API)
                    initialPassengers.push({ type: 'Adult', code: 'ADT', title: 'Mr' });
                }
                setPassengers(initialPassengers);

                // 3. Fetch Countries
                const countryList = await fetchCountries();
                if (Array.isArray(countryList)) {
                    setCountries(countryList);
                }
            } catch (err) {
                console.error("Failed to load booking data", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Validation Logic
    const validatePassengerAge = (index, pax, currentFlight) => {
        if (!pax.dob || !currentFlight) return;

        let departureDateStr = null;
        if (currentFlight.legs) {
            const firstLegKey = Object.keys(currentFlight.legs)[0];
            departureDateStr = currentFlight.legs[firstLegKey].departure.date;
        }

        const birthDate = new Date(pax.dob);
        const now = new Date();
        const flightDate = departureDateStr ? new Date(departureDateStr) : new Date();

        const cur = calculateExactAge(birthDate, now);
        const dep = calculateExactAge(birthDate, flightDate);

        const currentAgeStr = `${cur.years}y ${cur.months}m ${cur.days}d`;
        const departureAgeStr = `${dep.years}y ${dep.months}m ${dep.days}d`;

        let currentError = '';
        let departureError = '';
        const pType = (pax.type || '').toLowerCase();

        // Matching aerotake validation logic
        if (pType.includes('adult') && cur.totalYears < 12) currentError = 'Adult must be 12 years or above (current age)';
        else if (pType.includes('kid') && !(cur.totalYears > 2 && cur.totalYears < 5)) currentError = 'Kid must be 2 to below 5 years (current age)';
        else if (pType.includes('child') && !(cur.totalYears > 5 && cur.totalYears < 12)) currentError = 'Child must be 5 to below 12 years (current age)';
        else if (pType.includes('infant') && cur.totalYears >= 2) currentError = 'Infant must be below 24 months (current age)';

        // Departure date validation is critical
        if (pType.includes('adult') && dep.totalYears < 12) departureError = 'Adult must be 12 years or above at departure';
        else if (pType.includes('kid') && !(dep.totalYears > 2 && dep.totalYears < 5)) departureError = `Kid must be 2 to below 5 years at departure`;
        else if (pType.includes('child') && !(dep.totalYears > 5 && dep.totalYears < 12)) departureError = `Child must be 5 to below 12 years at departure`;
        else if (pType.includes('infant') && dep.totalYears >= 2) departureError = `Infant must be below 24 months at departure`;

        setAgeValidation(prev => ({
            ...prev,
            [index]: {
                currentAge: currentAgeStr,
                departureAge: departureAgeStr,
                currentError,
                departureError
            }
        }));
    };

    const handlePassengerChange = (index, field, value) => {
        const updated = [...passengers];
        updated[index][field] = value;
        setPassengers(updated);

        if (field === 'dob') validatePassengerAge(index, updated[index], flight);

        // Clear errors
        if (validationErrors[`passengers.${index}.${field}`]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`passengers.${index}.${field}`];
                return newErrors;
            });
        }
    };

    const handleContactChange = (field, value) => {
        setContact(prev => ({ ...prev, [field]: value }));
        const key = field === 'mobile' || field === 'email' ? `contact.${field}` : null;
        if (key && validationErrors[key]) {
            setValidationErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
        }
    };

    const handleLeadPassengerChange = (field, value) => {
        setLeadPassenger(prev => ({ ...prev, [field]: value }));
        const key = `lead_passenger_${field}`;
        if (validationErrors[key]) {
            setValidationErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
        }
    };

    const getError = (key) => validationErrors[key] ? <p className="text-[#E41D57] text-xs mt-1 font-medium">{validationErrors[key][0]}</p> : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setValidationErrors({});

        // Basic Frontend Validation
        const errors = {};
        if (!contact.mobile) errors['contact.mobile'] = ['Mobile is required'];
        if (!contact.email) errors['contact.email'] = ['Email is required'];

        passengers.forEach((pax, index) => {
            if (!pax.first_name) errors[`passengers.${index}.first_name`] = ['First Name is required.'];
            if (!pax.last_name) errors[`passengers.${index}.last_name`] = ['Last Name is required.'];
            if (!pax.gender) errors[`passengers.${index}.gender`] = ['Gender is required.'];
            if (!pax.dob) errors[`passengers.${index}.dob`] = ['Date of Birth is required.'];
            if (!pax.nationality) errors[`passengers.${index}.nationality`] = ['Nationality is required.'];
            if (!pax.passport_number) errors[`passengers.${index}.passport_number`] = ['Passport Number is required.'];
            if (!pax.passport_country) errors[`passengers.${index}.passport_country`] = ['Passport Country is required.'];

            if (!pax.passport_expiry) {
                errors[`passengers.${index}.passport_expiry`] = ['Passport Expiry is required.'];
            } else {
                if (flight && flight.legs) {
                    const firstLegKey = Object.keys(flight.legs)[0];
                    const departureDateStr = flight.legs[firstLegKey].departure.date;
                    const departureDate = new Date(departureDateStr);
                    const expiryDate = new Date(pax.passport_expiry);
                    if (expiryDate <= departureDate) {
                        errors[`passengers.${index}.passport_expiry`] = [`Passport expiry must be after flight departure date`];
                    }
                }
            }
        });

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const payload = {
            flightData: flight,
            passengers: passengers,
            contact: contact,
            lead_passenger_country_code: leadPassenger.country_code,
            lead_passenger_mobile: leadPassenger.mobile,
            lead_passenger_email: leadPassenger.email,
        };

        try {
            console.log("Submitting Booking Payload:", payload);
            const response = await bookFlight(payload);
            console.log("Booking Response:", response);

            // Handle various success responses
            if (response.success || (response.status && response.status === 'success') || response.booking_id) {
                navigate('/booking-success', { state: { booking: response } });
            } else {
                alert("Booking Status Unknown: " + JSON.stringify(response));
            }

        } catch (err) {
            console.error("Booking Error:", err);
            if (err.response && err.response.status === 422) {
                setValidationErrors(err.response.data.errors);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("Booking Failed: " + (err.response?.data?.message || err.message || "Unknown Error"));
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f4f6]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E41D57]"></div>
            <p className="mt-4 text-[#1E2049] font-medium">Preparing your booking...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f3f4f6]">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-[#1E2049] mb-2">Something went wrong</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button onClick={() => navigate('/flight/results')} className="text-[#E41D57] font-bold hover:underline">
                    Back to Search Results
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-[#f3f4f6] min-h-screen py-8 font-sans text-gray-800">
            <div className="container mx-auto px-4 max-w-7xl">
                <h1 className="text-2xl font-bold mb-6 text-[#1E2049]">Review & Book Your Flight</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Content (Left) */}
                    <div className="lg:col-span-9 space-y-6">

                        {/* 1. Flight Summary Card */}
                        <div className="bg-white border-t-4 border-[#1E2049] rounded-xl shadow-sm p-6 relative overflow-hidden">
                            {/* Decorative bg circle */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E41D57]/5 rounded-bl-full pointer-events-none"></div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 relative z-10">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-white shadow-sm p-2">
                                        <img src={flight.airlineLogo} alt="Airline" className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-[#1E2049]">{flight.airlineName}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200 font-mono">{flight.carrierCode}</span>
                                            <span className={`px-2 py-0.5 text-xs rounded border font-bold ${flight.refundStatus === 'Non-Refundable' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                {flight.refundStatus || 'Refundable'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right mt-4 md:mt-0">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Total Amount</p>
                                    <p className="text-3xl font-bold text-[#E41D57]">BDT {Number(flight.fare.totalPrice).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Flight Route Visualization */}
                            <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-6 space-y-6">
                                {flight.legs && Object.values(flight.legs).map((leg, i) => (
                                    <div key={i} className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="text-center md:text-left min-w-[100px]">
                                            <p className="text-2xl font-bold text-[#1E2049]">{leg.departure.time.substring(0, 5)}</p>
                                            <p className="text-sm font-bold text-gray-600">{leg.departure.airport}</p>
                                            <p className="text-xs text-gray-400">{leg.departure.formattedDate}</p>
                                        </div>

                                        <div className="flex-1 w-full md:w-auto px-4 flex flex-col items-center">
                                            <p className="text-xs text-gray-400 mb-2">{leg.formattedElapsedTime}</p>
                                            <div className="w-full flex items-center gap-2">
                                                <div className="h-[2px] w-full bg-gray-200 relative">
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#1E2049]"></div>
                                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#E41D57]"></div>
                                                </div>
                                            </div>
                                            <div className="mt-2 px-3 py-1 bg-white border border-gray-200 rounded-full text-[10px] uppercase font-bold text-gray-500 shadow-sm">
                                                {(leg.stopovers && leg.stopovers.length > 0) ? `${leg.stopovers.length} Stop via ${leg.stopovers.join(", ")}` : 'Non Stop'}
                                            </div>
                                        </div>

                                        <div className="text-center md:text-right min-w-[100px]">
                                            <p className="text-2xl font-bold text-[#1E2049]">{leg.arrival.time.substring(0, 5)}</p>
                                            <p className="text-sm font-bold text-gray-600">{leg.arrival.airport}</p>
                                            <p className="text-xs text-gray-400">{leg.arrival.formattedDate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => setFlightDetailsOpen(!flightDetailsOpen)}
                                className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-[#1E2049] font-bold py-2 hover:bg-gray-50 rounded-lg transition-colors border border-dashed border-gray-200"
                            >
                                <span>{flightDetailsOpen ? 'Hide Full Flight Itinerary' : 'View Full Flight Itinerary'}</span>
                                <svg className={`w-4 h-4 transition-transform ${flightDetailsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </button>

                            {/* Collapsible Details */}
                            {flightDetailsOpen && (
                                <div className="mt-4 animate-fadeIn">
                                    <div className="space-y-4">
                                        {flight.legs && Object.values(flight.legs).map((leg, i) => (
                                            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                                                <div className="bg-[#1E2049] px-6 py-3 text-sm font-bold text-white flex justify-between">
                                                    <span>{leg.departure.airportShortName} to {leg.arrival.airportShortName}</span>
                                                    <span className="opacity-80 font-normal">{leg.departure.formattedDate}</span>
                                                </div>
                                                <div className="p-6 space-y-8 bg-white">
                                                    {leg.schedules.map((sch, idx) => (
                                                        <div key={idx} className="relative pl-8 border-l-2 border-dashed border-gray-200">
                                                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                                            <div className="flex flex-col md:flex-row gap-6">
                                                                <div className="flex flex-col items-center min-w-[60px]">
                                                                    <img src={sch.carrier.operatingLogo} alt="Logo" className="w-10 mb-2 object-contain" onError={(e) => { e.target.src = flight.airlineLogo }} />
                                                                    <span className="text-[10px] text-gray-400 font-mono">{sch.carrier.operating}-{sch.carrier.operatingFlightNumber}</span>
                                                                </div>

                                                                <div className="flex-1 space-y-4">
                                                                    <div>
                                                                        <h4 className="font-bold text-[#1E2049] text-sm">{sch.carrier.operatingName}</h4>
                                                                        <p className="text-xs text-gray-500">Aircraft: {sch.carrier?.equipment?.code || 'N/A'} • Class: {sch.cabin?.name || 'Economy'}</p>
                                                                    </div>

                                                                    <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                                        <div>
                                                                            <p className="font-bold text-lg text-[#1E2049]">{sch.departure.time.substring(0, 5)}</p>
                                                                            <p className="text-xs font-semibold text-gray-600">{sch.departure.airportShortName}</p>
                                                                            <p className="text-[10px] text-gray-400">{sch.departure.airport}</p>
                                                                        </div>
                                                                        <div className="text-center px-4 pt-2">
                                                                            <p className="text-[10px] text-gray-400">Duration</p>
                                                                            <p className="text-xs font-bold text-[#E41D57]">{sch.formattedElapsedTime}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="font-bold text-lg text-[#1E2049]">{sch.arrival.time.substring(0, 5)}</p>
                                                                            <p className="text-xs font-semibold text-gray-600">{sch.arrival.airportShortName}</p>
                                                                            <p className="text-[10px] text-gray-400">{sch.arrival.airport}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 2. Guidelines */}
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex gap-4 text-sm text-gray-700 shadow-sm">
                            <div className="text-orange-500 text-xl">
                                <i className="fa fa-info-circle"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-[#1E2049] mb-1">Important Travel Guidelines</h4>
                                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                                    <li>Please ensure your passport is valid for at least 6 months from the date of travel.</li>
                                    <li>Check visa requirements for all destinations and transit points.</li>
                                </ul>
                            </div>
                        </div>

                        {/* 3. Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Contact Details */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-[#E41D57]/10 flex items-center justify-center text-[#E41D57]">
                                        <i className="fa fa-address-book"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#1E2049]">Contact Details</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Mobile Number</label>
                                        <div className="flex shadow-sm">
                                            <select
                                                value={contact.country_code}
                                                onChange={(e) => handleContactChange('country_code', e.target.value)}
                                                className="w-28 border border-gray-300 rounded-l-lg px-2 py-3 text-sm bg-gray-50 focus:ring-0 focus:border-[#E41D57]"
                                            >
                                                {countries.map(c => <option key={c.id} value={c.phone_code}>{c.emoji} {c.phone_code}</option>)}
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="123 456 7890"
                                                value={contact.mobile}
                                                onChange={(e) => handleContactChange('mobile', e.target.value)}
                                                className={`border-t border-b border-r rounded-r-lg px-4 py-3 w-full text-sm outline-none transition-colors ${validationErrors['contact.mobile'] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                required
                                            />
                                        </div>
                                        {getError('contact.mobile')}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="example@email.com"
                                            value={contact.email}
                                            onChange={(e) => handleContactChange('email', e.target.value)}
                                            className={`border rounded-lg px-4 py-3 w-full text-sm outline-none shadow-sm transition-colors ${validationErrors['contact.email'] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                            required
                                        />
                                        {getError('contact.email')}
                                    </div>
                                </div>
                            </div>

                            {/* Passenger Details Accordion */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-[#E41D57]/10 flex items-center justify-center text-[#E41D57]">
                                        <i className="fa fa-users"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1E2049]">Passenger Details</h3>
                                        <p className="text-xs text-gray-500">Enter details exactly as they appear on the passport</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {passengers.map((pax, idx) => {
                                        const isOpen = openPassengerIndex === idx;
                                        const validation = ageValidation[idx] || {};

                                        return (
                                            <div key={idx} className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#1E2049] shadow-md' : 'border-gray-200'}`}>
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenPassengerIndex(isOpen ? -1 : idx)}
                                                    className={`w-full px-5 py-4 flex justify-between items-center text-left transition-colors ${isOpen ? 'bg-[#1E2049] text-white' : 'bg-gray-50 text-gray-700 hover:bg-white'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isOpen ? 'bg-white text-[#1E2049]' : 'bg-gray-200 text-gray-600'}`}>
                                                            {idx + 1}
                                                        </div>
                                                        <span className="font-bold text-sm tracking-wide uppercase">{pax.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {/* Show validation checkmark if filled ? (Optional enhancement) */}
                                                        <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </button>

                                                {isOpen && (
                                                    <div className="p-6 bg-white space-y-5 animate-fadeIn">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">First Name / Given Name</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. JOHN"
                                                                    className={`border rounded-lg w-full px-4 py-3 text-sm outline-none transition-colors ${validationErrors[`passengers.${idx}.first_name`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                                    value={pax.first_name}
                                                                    onChange={(e) => handlePassengerChange(idx, 'first_name', e.target.value)}
                                                                    required
                                                                />
                                                                {getError(`passengers.${idx}.first_name`)}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Last Name / Surname</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. DOE"
                                                                    className={`border rounded-lg w-full px-4 py-3 text-sm outline-none transition-colors ${validationErrors[`passengers.${idx}.last_name`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                                    value={pax.last_name}
                                                                    onChange={(e) => handlePassengerChange(idx, 'last_name', e.target.value)}
                                                                    required
                                                                />
                                                                {getError(`passengers.${idx}.last_name`)}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Nationality</label>
                                                                <div className="relative">
                                                                    <select
                                                                        className={`border rounded-lg w-full px-4 py-3 text-sm outline-none appearance-none bg-white transition-colors ${validationErrors[`passengers.${idx}.nationality`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                                        value={pax.nationality}
                                                                        onChange={(e) => handlePassengerChange(idx, 'nationality', e.target.value)}
                                                                        required
                                                                    >
                                                                        <option value="">Select Country</option>
                                                                        {countries.map(c => <option key={c.id} value={c.iso2}>{c.name}</option>)}
                                                                    </select>
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                                                </div>
                                                                {getError(`passengers.${idx}.nationality`)}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Gender</label>
                                                                <div className="relative">
                                                                    <select
                                                                        className={`border rounded-lg w-full px-4 py-3 text-sm outline-none appearance-none bg-white transition-colors ${validationErrors[`passengers.${idx}.gender`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                                        value={pax.gender}
                                                                        onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                                                                        required
                                                                    >
                                                                        <option value="">Select Gender</option>
                                                                        <option value="Male">Male</option>
                                                                        <option value="Female">Female</option>
                                                                    </select>
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                                                </div>
                                                                {getError(`passengers.${idx}.gender`)}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Date of Birth</label>
                                                                <input
                                                                    type="date"
                                                                    className={`border rounded-lg w-full px-4 py-3 text-sm outline-none transition-colors ${validationErrors[`passengers.${idx}.dob`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                                    value={pax.dob}
                                                                    onChange={(e) => handlePassengerChange(idx, 'dob', e.target.value)}
                                                                    required
                                                                />
                                                                {/* Age Validation Messages */}
                                                                <div className="text-xs mt-2 space-y-1">
                                                                    {validation.departureError && (
                                                                        <div className="flex items-start gap-1 text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                                                            <span>⚠️</span>
                                                                            <p>{validation.departureError}</p>
                                                                        </div>
                                                                    )}
                                                                    {!validation.departureError && validation.departureAge && (
                                                                        <p className="text-gray-500 text-[11px] ml-1">
                                                                            Age at travel: <span className="font-bold text-[#1E2049]">{validation.departureAge}</span>
                                                                        </p>
                                                                    )}
                                                                    {getError(`passengers.${idx}.dob`)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Passport Number</label>
                                                                <input
                                                                    type="text"
                                                                    className={`border rounded-lg w-full px-4 py-3 text-sm outline-none transition-colors ${validationErrors[`passengers.${idx}.passport_number`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                                    value={pax.passport_number}
                                                                    onChange={(e) => handlePassengerChange(idx, 'passport_number', e.target.value)}
                                                                    required
                                                                />
                                                                {getError(`passengers.${idx}.passport_number`)}
                                                            </div>
                                                        </div>

                                                        {/* Passport Country & Expiry */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Passport Country</label>
                                                                <div className="relative">
                                                                    <select
                                                                        className={`border rounded-lg w-full px-4 py-3 text-sm outline-none appearance-none bg-white transition-colors ${validationErrors[`passengers.${idx}.passport_country`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                                        value={pax.passport_country}
                                                                        onChange={(e) => handlePassengerChange(idx, 'passport_country', e.target.value)}
                                                                        required
                                                                    >
                                                                        <option value="">Select Country</option>
                                                                        {countries.map(c => <option key={c.id} value={c.iso2}>{c.name}</option>)}
                                                                    </select>
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                                                </div>
                                                                {getError(`passengers.${idx}.passport_country`)}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Passport Expiry Date</label>
                                                                <input
                                                                    type="date"
                                                                    className={`border rounded-lg w-full px-4 py-3 text-sm outline-none transition-colors ${validationErrors[`passengers.${idx}.passport_expiry`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                                    value={pax.passport_expiry}
                                                                    onChange={(e) => handlePassengerChange(idx, 'passport_expiry', e.target.value)}
                                                                    required
                                                                />
                                                                {getError(`passengers.${idx}.passport_expiry`)}
                                                            </div>
                                                        </div>

                                                        {/* Lead Passenger Extra Inputs (Index 0) */}
                                                        {idx === 0 && (
                                                            <div className="mt-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">⭐</span>
                                                                    <h5 className="font-bold text-sm text-[#1E2049] uppercase tracking-wide">Primary Passenger Contact</h5>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mb-4">Required by airlines for updates</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <div className="flex shadow-sm">
                                                                            <select
                                                                                value={leadPassenger.country_code}
                                                                                onChange={(e) => handleLeadPassengerChange('country_code', e.target.value)}
                                                                                className="w-24 border border-gray-300 rounded-l-lg px-2 py-2 text-xs bg-white focus:ring-0 focus:border-[#E41D57]"
                                                                            >
                                                                                {countries.map(c => <option key={c.id} value={c.phone_code}>{c.emoji} {c.phone_code}</option>)}
                                                                            </select>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Mobile"
                                                                                value={leadPassenger.mobile}
                                                                                onChange={(e) => handleLeadPassengerChange('mobile', e.target.value)}
                                                                                className={`border-t border-b border-r rounded-r-lg px-3 py-2 w-full text-xs outline-none transition-colors ${validationErrors['lead_passenger_mobile'] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                                                required
                                                                            />
                                                                        </div>
                                                                        {getError('lead_passenger_mobile')}
                                                                    </div>
                                                                    <div>
                                                                        <input
                                                                            type="email"
                                                                            placeholder="Email"
                                                                            value={leadPassenger.email}
                                                                            onChange={(e) => handleLeadPassengerChange('email', e.target.value)}
                                                                            className={`border rounded-lg px-4 py-2 w-full text-xs outline-none shadow-sm transition-colors ${validationErrors['lead_passenger_email'] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`}
                                                                            required
                                                                        />
                                                                        {getError('lead_passenger_email')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-[#E41D57] text-white px-12 py-5 rounded-full font-bold shadow-xl shadow-[#E41D57]/30 hover:bg-[#c01b4b] transition-all transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none uppercase tracking-widest text-sm flex items-center gap-3"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Processing Booking...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Confirm Booking</span>
                                            <i className="fa fa-arrow-right"></i>
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* Right Sidebar (Col Span 3) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Timer */}
                        <div className="sticky top-24 space-y-6">
                            <div className="flex justify-between items-center border border-blue-100 rounded-xl px-4 py-4 bg-white shadow-sm">
                                <div className="flex items-center space-x-3 text-[#E41D57]">
                                    <div className="w-8 h-8 rounded-full bg-[#E41D57]/10 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wide">Time Remaining</span>
                                </div>
                                <span className="font-mono font-bold text-xl text-[#1E2049]">{formatTime(timer)}</span>
                            </div>

                            {/* Fare Summary Sidebar */}
                            <div className="bg-white p-6 rounded-xl shadow-lg shadow-gray-100 border border-gray-100">
                                <h3 className="text-lg font-bold text-[#1E2049] mb-5 pb-3 border-b flex items-center justify-between">
                                    <span>Fare Summary</span>
                                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded font-normal uppercase">Best Price</span>
                                </h3>

                                {/* Base Fare */}
                                <details className="group mb-3 border-b border-dashed border-gray-100 pb-3" open>
                                    <summary className="cursor-pointer flex items-center justify-between text-sm font-bold text-gray-700 hover:text-[#E41D57] transition-colors">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 bg-gray-50 rounded flex items-center justify-center group-open:rotate-90 transition-transform">
                                                <svg className="w-2 h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                            <span>Base Fare</span>
                                        </div>
                                        <span className="text-gray-900">
                                            BDT {Number(flight?.fare?.equivalentAmount || 0).toLocaleString()}
                                        </span>
                                    </summary>
                                    <div className="mt-3 text-xs text-gray-500 pl-6 space-y-2 animate-fadeIn">
                                        {flight?.passengerFareSummary && Object.entries(flight.passengerFareSummary).map(([key, fare]) => {
                                            if (key === 'totalPassenger') return null;
                                            return (
                                                <div key={key} className="flex justify-between">
                                                    <span>{fare.passengerType} (x{fare.passengerNumberByType})</span>
                                                    <span className="font-medium text-gray-700">BDT {(fare.passengerBaseFare * fare.passengerNumberByType).toLocaleString()}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </details>

                                {/* Taxes */}
                                <details className="group mb-3 border-b border-dashed border-gray-100 pb-3" open>
                                    <summary className="cursor-pointer flex items-center justify-between text-sm font-bold text-gray-700 hover:text-[#E41D57] transition-colors">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 bg-gray-50 rounded flex items-center justify-center group-open:rotate-90 transition-transform">
                                                <svg className="w-2 h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </div>
                                            <span>Taxes & Fees</span>
                                        </div>
                                        <span className="text-gray-900">
                                            BDT {Number(flight?.fare?.totalTaxAmount || 0).toLocaleString()}
                                        </span>
                                    </summary>
                                    <div className="mt-3 text-xs text-gray-500 pl-6 space-y-2 animate-fadeIn">
                                        {flight?.passengerFareSummary && Object.entries(flight.passengerFareSummary).map(([key, fare]) => {
                                            if (key === 'totalPassenger') return null;
                                            return (
                                                <div key={key} className="flex justify-between">
                                                    <span>{fare.passengerType} (x{fare.passengerNumberByType})</span>
                                                    <span className="font-medium text-gray-700">BDT {(fare.passengerTax * fare.passengerNumberByType).toLocaleString()}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </details>

                                {/* Grand Total */}
                                <div className="flex justify-between items-end pt-4 mt-2 font-bold text-[#1E2049] border-t-2 border-gray-100">
                                    <span className="text-sm uppercase text-gray-500">Grand Total</span>
                                    <div className="text-right">
                                        <span className="block text-2xl text-[#E41D57]">BDT {Number(flight?.fare?.totalPrice || 0).toLocaleString()}</span>
                                        <span className="text-[10px] font-normal text-gray-400">All taxes included</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightBooking;
