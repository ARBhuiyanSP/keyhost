import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCountries, bookFlight, revalidateFlight } from '../../utils/flightApi';
import LoadingSkeleton from '../common/LoadingSkeleton';


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
    const [submissionError, setSubmissionError] = useState(null);
    const [activeTab, setActiveTab] = useState('flight_details'); // flight_details | fare_summary
    const [validationErrors, setValidationErrors] = useState({});
    const [openPassengerIndices, setOpenPassengerIndices] = useState([0]);
    const [ageValidation, setAgeValidation] = useState({});
    const [timer, setTimer] = useState(1200);
    const [showDetails, setShowDetails] = useState(false);

    // Timer
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
                const flightData = localStorage.getItem('bookingFlight');
                if (!flightData) {
                    setError("No flight data found. Please search again.");
                    setLoading(false);
                    return;
                }
                const parsedFlight = JSON.parse(flightData);
                setFlight(parsedFlight);

                const initialPassengers = [];
                const summary = parsedFlight.passengerFareSummary;
                if (summary) {
                    Object.keys(summary).forEach(key => {
                        if (key === 'totalPassenger') return;
                        const item = summary[key];
                        for (let i = 0; i < item.passengerNumberByType; i++) {
                            initialPassengers.push({
                                type: item.passengerType,
                                code: item.code || (item.passengerType === 'Adult' ? 'ADT' : item.passengerType === 'Children' ? 'C07' : 'INF'),
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
                    initialPassengers.push({ type: 'Adult', code: 'ADT', title: 'Mr' });
                }
                setPassengers(initialPassengers);

                const countryList = await fetchCountries();
                if (Array.isArray(countryList)) {
                    setCountries(countryList);
                }

                // Revalidate Flight
                revalidateFlight(parsedFlight)
                    .then(res => {
                        console.log("Revalidation successful:", res);
                        // Optionally update flight data if response contains updated info
                        // setFlight(prev => ({ ...prev, ...res })); 
                    })
                    .catch(err => console.error("Revalidation failed:", err));

            } catch (err) {
                console.error("Failed to load booking data", err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const validatePassengerAge = (index, pax, currentFlight) => {
        if (!pax.dob || !currentFlight) return;

        let departureDateStr = null;
        if (currentFlight.legs) {
            const firstLegKey = Object.keys(currentFlight.legs)[0];
            departureDateStr = currentFlight.legs[firstLegKey].departure.date;
        }

        const birthDate = new Date(pax.dob);
        const flightDate = departureDateStr ? new Date(departureDateStr) : new Date();
        const dep = calculateExactAge(birthDate, flightDate);

        let departureError = '';
        const pType = (pax.type || '').toLowerCase();

        // Exact match or prefix match logic consistent with handleSubmit
        if ((pType === 'adult' || pType === 'adt') && dep.totalYears < 12) departureError = 'Adult must be 12 years or above at departure';
        else if ((pType === 'kid' || pType === 'c03') && !(dep.totalYears >= 2 && dep.totalYears < 5)) departureError = `Kid must be 2 to below 5 years at departure`;
        else if ((pType === 'children' || pType.startsWith('c')) && !(dep.totalYears >= 5 && dep.totalYears < 12) && pType !== 'c03' && pType !== 'kid') departureError = `Child must be 5 to below 12 years at departure`;
        else if ((pType === 'infant' || pType.startsWith('i')) && dep.totalYears >= 2) departureError = `Infant must be below 24 months at departure`;

        setAgeValidation(prev => ({
            ...prev,
            [index]: { ...prev[index], departureError, departureAge: `${dep.years}y ${dep.months}m ${dep.days}d` }
        }));
    };

    const handlePassengerChange = (index, field, value) => {
        const updated = [...passengers];
        updated[index][field] = value;
        setPassengers(updated);
        if (field === 'dob') validatePassengerAge(index, updated[index], flight);
        if (validationErrors[`passengers.${index}.${field}`]) {
            setValidationErrors(prev => { const n = { ...prev }; delete n[`passengers.${index}.${field}`]; return n; });
        }
    };

    const handleContactChange = (field, value) => {
        setContact(prev => ({ ...prev, [field]: value }));
        const key = field === 'mobile' || field === 'email' ? `contact.${field}` : null;
        if (key && validationErrors[key]) setValidationErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    };

    const handleLeadPassengerChange = (field, value) => {
        setLeadPassenger(prev => ({ ...prev, [field]: value }));
        const key = `lead_passenger_${field}`;
        if (validationErrors[key]) setValidationErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
    };

    const getError = (key) => validationErrors[key] ? <p className="text-[#E41D57] text-xs mt-1 font-medium">{validationErrors[key][0]}</p> : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setValidationErrors({});
        setSubmissionError(null);

        const errors = {};
        const errorIndices = new Set(); // Track indices to auto-expand

        if (!contact.mobile) {
            errors['contact.mobile'] = ['Mobile is required'];
        } else if (!/^[0-9]{7,15}$/.test(contact.mobile)) {
            errors['contact.mobile'] = ['Mobile must be a valid number (7-15 digits)'];
        }

        if (!contact.email) {
            errors['contact.email'] = ['Email is required'];
        } else if (!/\S+@\S+\.\S+/.test(contact.email)) {
            errors['contact.email'] = ['Email must be valid'];
        }

        passengers.forEach((pax, index) => {
            if (!pax.first_name) errors[`passengers.${index}.first_name`] = ['First Name is required.'];
            if (!pax.last_name) errors[`passengers.${index}.last_name`] = ['Last Name is required.'];
            if (!pax.gender) errors[`passengers.${index}.gender`] = ['Gender is required.'];
            if (!pax.dob) errors[`passengers.${index}.dob`] = ['Date of Birth is required.'];
            if (!pax.nationality) errors[`passengers.${index}.nationality`] = ['Nationality is required.'];
            if (!pax.passport_number) errors[`passengers.${index}.passport_number`] = ['Passport Number is required.'];
            if (!pax.passport_country) errors[`passengers.${index}.passport_country`] = ['Passport Country is required.'];

            // Passport Expiry Validation
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

            // --- Age Validation (Strictly Block Submit) ---
            const pType = pax.type ? pax.type.toLowerCase() : '';
            if (pax.dob && pType) {
                const birthDate = new Date(pax.dob);
                const now = new Date();

                let departureDateStr = null;
                if (flight && flight.legs) {
                    const firstLegKey = Object.keys(flight.legs)[0];
                    departureDateStr = flight.legs[firstLegKey].departure.date;
                }
                const flightDate = departureDateStr ? new Date(departureDateStr) : new Date();

                const cur = calculateExactAge(birthDate, now);
                const dep = calculateExactAge(birthDate, flightDate);

                // Validate based on CURRENT age (or Departure age as per business rule - assume Check both or just Departure?)
                // Legacy / PnrShow matches:
                // Adult: 12+
                // Kid: 2-5
                // Child: 5-12
                // Infant: < 2 (24 months)

                // Using Cur Age for consistency with PnrShowPage logic ported earlier
                if ((pType === 'adult' || pType === 'adt') && cur.totalYears < 12) {
                    errors[`passengers.${index}.dob`] = ['Adult must be 12 years or above'];
                    errorIndices.add(index);
                } else if ((pType === 'kid' || pType === 'c03') && !(cur.totalYears > 2 && cur.totalYears < 5)) {
                    errors[`passengers.${index}.dob`] = ['Kid must be 2 to below 5 years'];
                    errorIndices.add(index);
                } else if ((pType === 'children' || pType.startsWith('c')) && !(cur.totalYears > 5 && cur.totalYears < 12) && pType !== 'c03' && pType !== 'kid') {
                    errors[`passengers.${index}.dob`] = ['Child must be 5 to below 12 years'];
                    errorIndices.add(index);
                } else if ((pType === 'infant' || pType.startsWith('i')) && cur.totalYears >= 2) {
                    errors[`passengers.${index}.dob`] = ['Infant must be below 24 months'];
                    errorIndices.add(index);
                }

                // Also check Departure Age to be safe? (Optional but recommended)
                if ((pType === 'infant' || pType.startsWith('i')) && dep.totalYears >= 2) {
                    errors[`passengers.${index}.dob`] = ['Infant must be below 24 months at departure'];
                    errorIndices.add(index);
                }
            }
        });

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setSubmitting(false);

            // Auto-expand sections with errors
            Object.keys(errors).forEach(key => {
                if (key.startsWith('passengers.')) {
                    const parts = key.split('.');
                    if (parts.length >= 2) {
                        const idx = parseInt(parts[1], 10);
                        if (!isNaN(idx)) errorIndices.add(idx);
                    }
                }
            });

            if (errorIndices.size > 0) {
                setOpenPassengerIndices(prev => {
                    const next = new Set([...prev, ...errorIndices]);
                    return Array.from(next);
                });
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
            return; // STOP SUBMISSION
        }

        // --- CONSTRUCT PAYLOAD (Dynamic Calculation) ---
        // Identify Source (Sabre vs Amadeus) check
        const isAmadeus = flight.source === 'Amadeus';
        if (isAmadeus) {
            setSubmissionError("Amadeus booking not implemented in this demo.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setSubmitting(false);
            return;
        }

        const calculatedPassengers = passengers.map((p, i) => {
            const birthDate = new Date(p.dob);
            const now = new Date(); // Use current date for age calculation for Type? Or Flight Date?
            // Legacy blade uses current age for Type code generation mostly.
            const cur = calculateExactAge(birthDate, now);

            let calculatedType = p.code || p.type;
            let calculatedAge = Math.floor(cur.totalYears);
            const pType = p.type ? p.type.toLowerCase() : '';

            if (pType === 'adult' || pType === 'adt') {
                calculatedType = 'ADT';
                calculatedAge = Math.floor(cur.totalYears);
            } else if (pType === 'children' || pType === 'kid' || pType.startsWith('c')) {
                // C + two digit age
                calculatedType = 'C' + Math.floor(cur.totalYears).toString().padStart(2, '0');
                calculatedAge = Math.floor(cur.totalYears);
            } else if (pType === 'infant' || pType === 'inf' || pType.startsWith('i')) {
                // I + two digit MONTHS
                const totalMonths = Math.floor(cur.totalYears * 12);
                calculatedType = 'I' + totalMonths.toString().padStart(2, '0');
                calculatedAge = totalMonths;
            }

            return {
                ...p,
                type: calculatedType, // Send the calculated Sabre Code (e.g. C07, I08)
                NameNumber: `${i + 1}.1`,
                age: calculatedAge.toString()
            };
        });

        // Merge Contact and Lead Passenger Logic to avoid Validation Errors
        let finalContact = { ...contact };
        let finalLead = { ...leadPassenger };

        // 1. If Contact is empty, use Lead Passenger
        if (!finalContact.mobile && finalLead.mobile) {
            finalContact.mobile = finalLead.mobile;
            finalContact.country_code = finalLead.country_code;
        }
        if (!finalContact.email && finalLead.email) {
            finalContact.email = finalLead.email;
        }

        // 2. If Lead Passenger is empty, use Contact
        if (!finalLead.mobile && finalContact.mobile) {
            finalLead.mobile = finalContact.mobile;
            finalLead.country_code = finalContact.country_code;
        }
        if (!finalLead.email && finalContact.email) {
            finalLead.email = finalContact.email;
        }

        const payload = {
            flightData: flight,
            passengers: calculatedPassengers,
            contact: finalContact,
            lead_passenger_country_code: finalLead.country_code,
            lead_passenger_mobile: finalLead.mobile,
            lead_passenger_email: finalLead.email,
        };

        try {
            const response = await bookFlight(payload);
            if (response.success || response.booking_id) {
                navigate('/booking-success', { state: { booking: response } });
            } else {
                setSubmissionError("Booking Status Unknown: " + JSON.stringify(response));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error("Booking Error:", err);
            if (err.response && err.response.status === 422) {
                setValidationErrors(err.response.data.errors);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                let errorMessage = err.response?.data?.message || err.message || "Unknown Error";

                // Extract detailed Sabre error if available
                const details = err.response?.data?.details;
                if (details && details.Error) {
                    try {
                        const sabreErrors = details.Error.flatMap(e =>
                            e.SystemSpecificResults?.flatMap(s =>
                                s.Message?.map(m => `${m.code}: ${m.content}`)
                            )
                        ).filter(Boolean);

                        if (sabreErrors.length > 0) {
                            errorMessage += ": " + sabreErrors.join(' | ');
                        }
                    } catch (e) {
                        console.error("Failed to parse Sabre error details", e);
                    }
                }

                setSubmissionError("Booking Failed: " + errorMessage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } finally {
            setSubmitting(false);
        }
    };



    // Use LoadingSkeleton for initial loading
    if (loading) return (
        <div className="container mx-auto px-4 max-w-7xl py-8 bg-white">
            <LoadingSkeleton type="form" count={3} />
        </div>
    );
    if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

    const firstLeg = flight.legs ? Object.values(flight.legs)[0] : null;
    const lastLeg = flight.legs ? Object.values(flight.legs)[Object.values(flight.legs).length - 1] : null;

    return (
        <div className="bg-white min-h-screen py-8 font-sans text-gray-800 relative">
            {/* Show LoadingSkeleton overlay when submitting */}
            {submitting && (
                <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                    <div className="w-full max-w-md space-y-4 p-6">
                        <LoadingSkeleton type="card" />
                        <p className="text-center text-[#E41D57] font-bold animate-pulse">Processing Booking...</p>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 max-w-7xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mb-6 text-gray-600 hover:text-[#E41D57] transition-colors group"
                >
                    <svg
                        className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-semibold">Back</span>
                </button>

                {/* Submission Error Alert */}
                {submissionError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 animate-fadeIn">
                        <i className="fa fa-exclamation-circle mt-0.5"></i>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm">Booking Failed</h4>
                            <p className="text-sm">{submissionError}</p>
                        </div>
                        <button onClick={() => setSubmissionError(null)} className="text-red-400 hover:text-red-600">
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                )}


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-9 space-y-6">

                        {/* *** FLIGHT HEADER CARD (Updated) *** */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Card Top: Summary */}
                            <div className="p-6 pb-2">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    {/* Airline */}
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="w-16 h-12 flex items-center justify-center">
                                            <img src={flight.airlineLogo} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-[#1E2049]">{flight.airlineName}</h2>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 text-xs">({flight.carrierCode})</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${flight.refundStatus === 'Non-Refundable' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                    {flight.refundStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Route Visual */}
                                    <div className="flex-1 flex items-center justify-center gap-6 w-full md:w-auto">
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-[#1E2049]">{firstLeg?.departure.time.substring(0, 5)}</div>
                                            <div className="text-xs text-gray-500">{firstLeg?.departure.formattedDate}</div>
                                            <div className="text-xs text-gray-500">{firstLeg?.departure.airport}</div>
                                        </div>
                                        <div className="flex flex-col items-center w-32">
                                            <div className="text-[10px] text-red-500 mb-1">{firstLeg?.formattedElapsedTime}</div>
                                            <div className="w-full h-px bg-red-200 relative mb-1">
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                            </div>
                                            <div className="text-[10px] text-red-500 uppercase">
                                                {(firstLeg?.stopovers?.length > 0) ? `${firstLeg.stopovers.length} Stop` : 'Non Stop'}
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xl font-bold text-[#1E2049]">{lastLeg?.arrival.time.substring(0, 5)}</div>
                                            <div className="text-xs text-gray-500">{lastLeg?.arrival.formattedDate}</div>
                                            <div className="text-xs text-gray-500">{lastLeg?.arrival.airport}</div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right w-full md:w-auto">
                                        <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                                        <div className="text-2xl font-bold text-[#1E2049]">BDT {Number(flight.fare.totalPrice).toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-400">Taxes & Fees included</div>
                                    </div>
                                </div>
                            </div>

                            {/* Toggle Details Button */}
                            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-center">
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-sm font-bold text-[#E41D57] hover:text-[#c01b4b] flex items-center gap-2 transition-colors focus:outline-none"
                                >
                                    <span>{showDetails ? 'Hide Flight Details' : 'View Flight Details'}</span>
                                    <i className={`fa fa-chevron-${showDetails ? 'up' : 'down'} transition-transform duration-300`}></i>
                                </button>
                            </div>

                            {/* Tabs & Content (Collapsible) */}
                            {showDetails && (
                                <div className="border-t border-gray-200 animate-fadeIn">
                                    {/* Tabs */}
                                    <div className="flex px-6 border-b border-gray-100 mt-4">
                                        <button
                                            onClick={() => setActiveTab('flight_details')}
                                            className={`mr-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'flight_details' ? 'border-[#E41D57] text-[#E41D57]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Flight Details
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('fare_summary')}
                                            className={`py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'fare_summary' ? 'border-[#E41D57] text-[#E41D57]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Fare Summary
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-6 bg-gray-50/50">
                                        {activeTab === 'flight_details' && (
                                            <div className="space-y-6 animate-fadeIn">
                                                {/* 1. Routes Header */}
                                                <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                                                    <span className="font-bold text-gray-700">{firstLeg?.departure.airportShortName}</span>
                                                    <i className="fa fa-arrow-right text-gray-400 text-xs"></i>
                                                    <span className="font-bold text-gray-700">{lastLeg?.arrival.airportShortName}</span>
                                                    <span className="text-gray-500 text-sm">({firstLeg?.departure.formattedDate})</span>
                                                </div>

                                                {/* 2. Segments */}
                                                {flight.legs && Object.values(flight.legs).map((leg, i) => (
                                                    <div key={i} className="space-y-6">
                                                        {leg.schedules.map((sch, idx) => (
                                                            <div key={idx} className="relative pl-6 border-l-2 border-dashed border-gray-300">
                                                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-400"></div>

                                                                {/* Airline & Aircraft Line */}
                                                                <div className="flex flex-wrap items-center gap-4 mb-3">
                                                                    <img src={sch.carrier.operatingLogo} alt="Logo" className="w-6 h-6 object-contain" onError={(e) => { e.target.src = flight.airlineLogo }} />
                                                                    <div>
                                                                        <span className="font-bold text-sm text-[#1E2049] block">{sch.carrier.operatingName}</span>
                                                                        <span className="text-xs text-gray-500">Operated by: {sch.carrier.operatingName}</span>
                                                                    </div>
                                                                    <div className="h-4 w-px bg-gray-300 mx-2"></div>
                                                                    <div className="text-xs text-gray-500">
                                                                        Aircraft: <span className="text-[#1E2049] font-semibold">{sch.carrier?.equipment?.code || '738'}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Timing Line */}
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div>
                                                                        <div className="text-xs text-gray-500 mb-0.5">Depart</div>
                                                                        <div className="text-lg font-bold text-[#1E2049]">{sch.departure.time.substring(0, 5)}</div>
                                                                        <div className="text-xs text-gray-500">{sch.departure.formattedDate}</div>
                                                                        <div className="text-xs text-gray-400">{sch.departure.airport}</div>
                                                                    </div>

                                                                    <div className="text-center pt-2">
                                                                        <span className="px-2 py-1 bg-white border rounded text-[10px] text-gray-500 shadow-sm">{sch.formattedElapsedTime}</span>
                                                                    </div>

                                                                    <div className="text-right">
                                                                        <div className="text-xs text-gray-500 mb-0.5">Arrive</div>
                                                                        <div className="text-lg font-bold text-[#1E2049]">{sch.arrival.time.substring(0, 5)}</div>
                                                                        <div className="text-xs text-gray-500">{sch.arrival.formattedDate}</div>
                                                                        <div className="text-xs text-gray-400">{sch.arrival.airport}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}

                                                {/* 3. Baggage & Cabin Table */}
                                                <div className="mt-4 border rounded-lg overflow-hidden bg-white shadow-sm">
                                                    <table className="w-full text-sm text-left">
                                                        <thead className="bg-[#f8f9fa] text-xs uppercase text-gray-500 border-b">
                                                            <tr>
                                                                <th className="px-4 py-3 font-semibold">Passenger</th>
                                                                <th className="px-4 py-3 font-semibold">Segment</th>
                                                                <th className="px-4 py-3 font-semibold">Baggage Allowance</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {['Adult', 'Child', 'Infant'].map(type => {
                                                                const paxData = flight.passengerFareSummary && Object.values(flight.passengerFareSummary).find(p => p && p.passengerType && p.passengerType.includes(type));
                                                                if (!paxData) return null;

                                                                // Mocking segment info as per image (Cabin Y, Booking E) - ideally get from API
                                                                const segmentInfo = firstLeg?.schedules[0];
                                                                const bookingCode = segmentInfo?.cabin?.name ? segmentInfo.cabin.name.charAt(0) : 'Y';

                                                                // Fallback baggage logic
                                                                let baggage = '20 KG';
                                                                try {
                                                                    const bagInfo = segmentInfo?.baggageInfo?.[0]; // Simplified
                                                                    if (bagInfo?.weight) baggage = `${bagInfo.weight} ${bagInfo.unit}`;
                                                                    else if (bagInfo?.pieceCount) baggage = `${bagInfo.pieceCount} PC`;
                                                                } catch (e) { }

                                                                return (
                                                                    <tr key={type}>
                                                                        <td className="px-4 py-3 text-gray-700 font-medium">{type}</td>
                                                                        <td className="px-4 py-3 text-xs text-gray-500 space-y-0.5">
                                                                            <div className="flex items-center gap-2">
                                                                                <span>Cabin: <span className="font-bold text-gray-700">{bookingCode}</span></span>
                                                                            </div>
                                                                            <div>Booking: <span className="font-bold text-gray-700">E</span></div>
                                                                            <div>Seats: <span className="font-bold text-gray-700">{paxData.passengerNumberByType}</span></div>
                                                                        </td>
                                                                        <td className="px-4 py-3 font-bold text-[#E41D57]">{baggage}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                    <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 border-t">
                                                        Total Passengers: {Object.values(flight.passengerFareSummary || {}).reduce((acc, curr) => typeof curr === 'object' ? acc + curr.passengerNumberByType : acc, 0)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'fare_summary' && (
                                            <div className="animate-fadeIn">
                                                <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                                                    <div className="p-4 border-b bg-gray-50">
                                                        <h3 className="font-bold text-[#1E2049]">Fare Summary</h3>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm text-left">
                                                            <thead className="bg-[#f8f9fa] text-xs uppercase text-gray-500 border-b">
                                                                <tr>
                                                                    <th className="px-4 py-3 font-semibold">Passenger Type</th>
                                                                    <th className="px-4 py-3 font-semibold text-right">Base Fare</th>
                                                                    <th className="px-4 py-3 font-semibold text-right">Tax</th>
                                                                    <th className="px-4 py-3 font-semibold text-right">Total Fare</th>
                                                                    <th className="px-4 py-3 font-semibold text-center">Quantity</th>
                                                                    <th className="px-4 py-3 font-semibold">Penalty</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {flight.passengerFareSummary && Object.entries(flight.passengerFareSummary).map(([key, fare]) => {
                                                                    if (key === 'totalPassenger') return null;
                                                                    return (
                                                                        <tr key={key} className="hover:bg-gray-50 transition-colors">
                                                                            <td className="px-4 py-3 text-gray-700 font-medium">{fare.passengerType}</td>
                                                                            <td className="px-4 py-3 text-right text-gray-600">{Number(fare.passengerBaseFare).toLocaleString()}</td>
                                                                            <td className="px-4 py-3 text-right text-gray-600">{Number(fare.passengerTax).toLocaleString()}</td>
                                                                            <td className="px-4 py-3 text-right font-bold text-[#1E2049]">{Number(fare.passengerTotalFare).toLocaleString()}</td>
                                                                            <td className="px-4 py-3 text-center text-gray-600">{fare.passengerNumberByType}</td>
                                                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                                                <div className="space-y-1">
                                                                                    <div className="flex justify-between gap-4">
                                                                                        <span>Exchange Before:</span>
                                                                                        <span className="font-mono text-gray-700">BDT {Math.round(fare.passengerBaseFare * 0.1).toLocaleString()}</span>
                                                                                    </div>
                                                                                    <div className="flex justify-between gap-4">
                                                                                        <span>Refund Before:</span>
                                                                                        <span className="font-mono text-gray-700">BDT {Math.round(fare.passengerBaseFare * 0.2).toLocaleString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                                {/* Total Row */}
                                                                <tr className="bg-gray-50 font-bold border-t border-gray-200">
                                                                    <td className="px-4 py-3 text-[#1E2049]">Total</td>
                                                                    <td className="px-4 py-3 text-right"></td>
                                                                    <td className="px-4 py-3 text-right text-gray-500">{Number(flight.fare.totalTaxAmount).toLocaleString()}</td>
                                                                    <td className="px-4 py-3 text-right text-[#E41D57] text-lg">{Number(flight.fare.totalPrice).toLocaleString()}</td>
                                                                    <td className="px-4 py-3 text-center">{Object.values(flight.passengerFareSummary || {}).reduce((acc, curr) => typeof curr === 'object' ? acc + curr.passengerNumberByType : acc, 0)}</td>
                                                                    <td className="px-4 py-3"></td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Guidelines (Preserved) */}
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex gap-4 text-sm text-gray-700 shadow-sm">
                            <div className="text-orange-500 text-xl"><i className="fa fa-info-circle"></i></div>
                            <div>
                                <h4 className="font-bold text-[#1E2049] mb-1">Important Travel Guidelines</h4>
                                <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                                    <li>Please ensure your passport is valid for at least 6 months from the date of travel.</li>
                                    <li>Check visa requirements for all destinations and transit points.</li>
                                </ul>
                            </div>
                        </div>

                        {/* *** FORM (Previous Implementation) *** */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Contact Details (Existing) */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-[#E41D57]/10 flex items-center justify-center text-[#E41D57]"><i className="fa fa-address-book"></i></div>
                                    <h3 className="text-lg font-bold text-[#1E2049]">Contact Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Mobile Number</label>
                                        <div className="flex shadow-sm">
                                            <select value={contact.country_code} onChange={(e) => handleContactChange('country_code', e.target.value)} className="w-28 border border-gray-300 rounded-l-lg px-2 py-3 text-sm bg-gray-50 focus:ring-0 focus:border-[#E41D57]">
                                                {countries.map(c => <option key={c.id} value={c.phone_code}>{c.emoji} {c.phone_code}</option>)}
                                            </select>
                                            <input type="text" placeholder="123 456 7890" value={contact.mobile} onChange={(e) => handleContactChange('mobile', e.target.value)} className={`border-t border-b border-r rounded-r-lg px-4 py-3 w-full text-sm outline-none transition-colors ${validationErrors['contact.mobile'] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} required />
                                        </div>
                                        {getError('contact.mobile')}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Email Address</label>
                                        <input type="email" placeholder="example@email.com" value={contact.email} onChange={(e) => handleContactChange('email', e.target.value)} className={`border rounded-lg px-4 py-3 w-full text-sm outline-none shadow-sm transition-colors ${validationErrors['contact.email'] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} required />
                                        {getError('contact.email')}
                                    </div>
                                </div>
                            </div>

                            {/* Passenger Details (Existing) */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-8 h-8 rounded-full bg-[#E41D57]/10 flex items-center justify-center text-[#E41D57]"><i className="fa fa-users"></i></div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1E2049]">Passenger Details</h3>
                                        <p className="text-xs text-gray-500">Enter details exactly as they appear on the passport</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {passengers.map((pax, idx) => {
                                        const isOpen = openPassengerIndices.includes(idx);
                                        const validation = ageValidation[idx] || {};

                                        // Determine display label with age range
                                        let typeLabel = pax.type;
                                        if (pax.type === 'Adult') typeLabel = 'ADULT (12+ yrs)';
                                        else if (pax.type === 'Children') typeLabel = 'CHILDREN (5-11 yrs)';
                                        else if (pax.type === 'Kid') typeLabel = 'KID (2-5 yrs)';
                                        else if (pax.type === 'Infant') typeLabel = 'INFANT (< 2 yrs)';

                                        const toggleAccordion = () => {
                                            setOpenPassengerIndices(prev => {
                                                if (prev.includes(idx)) {
                                                    return prev.filter(i => i !== idx);
                                                } else {
                                                    return [...prev, idx];
                                                }
                                            });
                                        };

                                        const hasError = Object.keys(validationErrors).some(key => key.startsWith(`passengers.${idx}.`));

                                        return (
                                            <div key={idx} className={`border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#1E2049] shadow-md' : (hasError ? 'border-red-500 bg-red-50' : 'border-gray-200')}`}>
                                                <button type="button" onClick={toggleAccordion} className={`w-full px-5 py-4 flex justify-between items-center text-left transition-colors ${isOpen ? 'bg-[#1E2049] text-white' : (hasError ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-50 text-gray-700 hover:bg-white')}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isOpen ? 'bg-white text-[#1E2049]' : (hasError ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600')}`}>{idx + 1}</div>
                                                        <span className="font-bold text-sm tracking-wide uppercase">{typeLabel}</span>
                                                        {hasError && !isOpen && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold ml-2">ERROR</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3"><svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                                                </button>
                                                {isOpen && (
                                                    <div className="p-6 bg-white space-y-5 animate-fadeIn">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">First Name / Given Name</label><input type="text" placeholder="e.g. JOHN" className={`border rounded-lg w-full px-4 py-3 text-sm outline-none transition-colors ${validationErrors[`passengers.${idx}.first_name`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} value={pax.first_name} onChange={(e) => handlePassengerChange(idx, 'first_name', e.target.value)} required />{getError(`passengers.${idx}.first_name`)}</div>
                                                            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Last Name / Surname</label><input type="text" placeholder="e.g. DOE" className={`border rounded-lg w-full px-4 py-3 text-sm outline-none transition-colors ${validationErrors[`passengers.${idx}.last_name`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} value={pax.last_name} onChange={(e) => handlePassengerChange(idx, 'last_name', e.target.value)} required />{getError(`passengers.${idx}.last_name`)}</div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Nationality</label>
                                                                <div className="relative">
                                                                    <select className={`border rounded-lg w-full px-4 py-3 text-sm outline-none appearance-none bg-white transition-colors ${validationErrors[`passengers.${idx}.nationality`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} value={pax.nationality} onChange={(e) => handlePassengerChange(idx, 'nationality', e.target.value)} required>
                                                                        <option value="">Select Country</option>{countries.map(c => <option key={c.id} value={c.iso2}>{c.name}</option>)}
                                                                    </select>
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                                                </div>
                                                                {getError(`passengers.${idx}.nationality`)}
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Gender</label>
                                                                <div className="relative">
                                                                    <select className={`border rounded-lg w-full px-4 py-3 text-sm outline-none appearance-none bg-white transition-colors ${validationErrors[`passengers.${idx}.gender`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} value={pax.gender} onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)} required>
                                                                        <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option>
                                                                    </select>
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                                                </div>
                                                                {getError(`passengers.${idx}.gender`)}
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Date of Birth</label>
                                                                <input type="date" className={`border rounded-lg w-full px-4 py-3 text-sm outline-none transition-colors ${validationErrors[`passengers.${idx}.dob`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} value={pax.dob} onChange={(e) => handlePassengerChange(idx, 'dob', e.target.value)} required />
                                                                <div className="text-xs mt-2 space-y-1">{validation.departureError && (<div className="flex items-start gap-1 text-red-600 bg-red-50 p-2 rounded border border-red-100"><span>⚠️</span><p>{validation.departureError}</p></div>)}{!validation.departureError && validation.departureAge && (<p className="text-gray-500 text-[11px] ml-1">Age at travel: <span className="font-bold text-[#1E2049]">{validation.departureAge}</span></p>)}{getError(`passengers.${idx}.dob`)}</div>
                                                            </div>
                                                            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Passport Number</label><input type="text" className={`border rounded-lg w-full px-4 py-3 text-sm outline-none transition-colors ${validationErrors[`passengers.${idx}.passport_number`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} value={pax.passport_number} onChange={(e) => handlePassengerChange(idx, 'passport_number', e.target.value)} required />{getError(`passengers.${idx}.passport_number`)}</div>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                            <div>
                                                                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Passport Country</label>
                                                                <div className="relative">
                                                                    <select className={`border rounded-lg w-full px-4 py-3 text-sm outline-none appearance-none bg-white transition-colors ${validationErrors[`passengers.${idx}.passport_country`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} value={pax.passport_country} onChange={(e) => handlePassengerChange(idx, 'passport_country', e.target.value)} required>
                                                                        <option value="">Select Country</option>{countries.map(c => <option key={c.id} value={c.iso2}>{c.name}</option>)}
                                                                    </select>
                                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                                                </div>
                                                                {getError(`passengers.${idx}.passport_country`)}
                                                            </div>
                                                            <div><label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Passport Expiry Date</label><input type="date" className={`border rounded-lg w-full px-4 py-3 text-sm outline-none transition-colors ${validationErrors[`passengers.${idx}.passport_expiry`] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} value={pax.passport_expiry} onChange={(e) => handlePassengerChange(idx, 'passport_expiry', e.target.value)} required />{getError(`passengers.${idx}.passport_expiry`)}</div>
                                                        </div>
                                                        {idx === 0 && (
                                                            <div className="mt-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                                                                <div className="flex items-center gap-2 mb-3"><span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">⭐</span><h5 className="font-bold text-sm text-[#1E2049] uppercase tracking-wide">Primary Passenger Contact</h5></div><p className="text-xs text-gray-500 mb-4">Required by airlines for updates</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div>
                                                                        <div className="flex shadow-sm">
                                                                            <select value={leadPassenger.country_code} onChange={(e) => handleLeadPassengerChange('country_code', e.target.value)} className="w-24 border border-gray-300 rounded-l-lg px-2 py-2 text-xs bg-white focus:ring-0 focus:border-[#E41D57]">{countries.map(c => <option key={c.id} value={c.phone_code}>{c.emoji} {c.phone_code}</option>)}</select>
                                                                            <input type="text" placeholder="Mobile" value={leadPassenger.mobile} onChange={(e) => handleLeadPassengerChange('mobile', e.target.value)} className={`border-t border-b border-r rounded-r-lg px-3 py-2 w-full text-xs outline-none transition-colors ${validationErrors['lead_passenger_mobile'] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} required />
                                                                        </div>
                                                                        {getError('lead_passenger_mobile')}
                                                                    </div>
                                                                    <div><input type="email" placeholder="Email" value={leadPassenger.email} onChange={(e) => handleLeadPassengerChange('email', e.target.value)} className={`border rounded-lg px-4 py-2 w-full text-xs outline-none shadow-sm transition-colors ${validationErrors['lead_passenger_email'] ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-[#E41D57]'}`} required />{getError('lead_passenger_email')}</div>
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

                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={submitting} className="bg-[#E41D57] text-white px-12 py-5 rounded-full font-bold shadow-xl shadow-[#E41D57]/30 hover:bg-[#c01b4b] transition-all transform hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none uppercase tracking-widest text-sm flex items-center gap-3">
                                    {submitting ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Processing Booking...</span></>) : (<><span>Confirm Booking</span><i className="fa fa-arrow-right"></i></>)}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Sidebar (Existing) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            <div className="flex justify-between items-center border border-blue-100 rounded-xl px-4 py-4 bg-white shadow-sm">
                                <div className="flex items-center space-x-3 text-[#E41D57]">
                                    <div className="w-8 h-8 rounded-full bg-[#E41D57]/10 flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                                    <span className="text-xs font-bold uppercase tracking-wide">Time Remaining</span>
                                </div>
                                <span className="font-mono font-bold text-xl text-[#1E2049]">{formatTime(timer)}</span>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg shadow-gray-100 border border-gray-100">
                                <h3 className="text-lg font-bold text-[#1E2049] mb-5 pb-3 border-b flex items-center justify-between"><span>Fare Summary</span><span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded font-normal uppercase">Best Price</span></h3>

                                <details className="group mb-3 border-b border-dashed border-gray-100 pb-3" open>
                                    <summary className="cursor-pointer flex items-center justify-between text-sm font-bold text-gray-700 hover:text-[#E41D57] transition-colors">
                                        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gray-50 rounded flex items-center justify-center group-open:rotate-90 transition-transform"><svg className="w-2 h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div><span>Base Fare</span></div>
                                        <span className="text-gray-900">BDT {Number(flight?.fare?.equivalentAmount || 0).toLocaleString()}</span>
                                    </summary>
                                    <div className="mt-3 text-xs text-gray-500 pl-6 space-y-2 animate-fadeIn">{flight?.passengerFareSummary && Object.entries(flight.passengerFareSummary).map(([key, fare]) => { if (key === 'totalPassenger') return null; return (<div key={key} className="flex justify-between"><span>{fare.passengerType} (x{fare.passengerNumberByType})</span><span className="font-medium text-gray-700">BDT {(fare.passengerBaseFare * fare.passengerNumberByType).toLocaleString()}</span></div>) })}</div>
                                </details>

                                <details className="group mb-3 border-b border-dashed border-gray-100 pb-3" open>
                                    <summary className="cursor-pointer flex items-center justify-between text-sm font-bold text-gray-700 hover:text-[#E41D57] transition-colors">
                                        <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gray-50 rounded flex items-center justify-center group-open:rotate-90 transition-transform"><svg className="w-2 h-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div><span>Taxes & Fees</span></div>
                                        <span className="text-gray-900">BDT {Number(flight?.fare?.totalTaxAmount || 0).toLocaleString()}</span>
                                    </summary>
                                    <div className="mt-3 text-xs text-gray-500 pl-6 space-y-2 animate-fadeIn">{flight?.passengerFareSummary && Object.entries(flight.passengerFareSummary).map(([key, fare]) => { if (key === 'totalPassenger') return null; return (<div key={key} className="flex justify-between"><span>{fare.passengerType} (x{fare.passengerNumberByType})</span><span className="font-medium text-gray-700">BDT {(fare.passengerTax * fare.passengerNumberByType).toLocaleString()}</span></div>) })}</div>
                                </details>

                                <div className="flex justify-between items-end pt-4 mt-2 font-bold text-[#1E2049] border-t-2 border-gray-100"><span className="text-sm uppercase text-gray-500">Grand Total</span><div className="text-right"><span className="block text-2xl text-[#E41D57]">BDT {Number(flight?.fare?.totalPrice || 0).toLocaleString()}</span><span className="text-[10px] font-normal text-gray-400">All taxes included</span></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlightBooking;
