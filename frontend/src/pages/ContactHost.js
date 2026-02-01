import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiChevronLeft, FiStar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../utils/api';
import useToast from '../hooks/useToast';
import useAuthStore from '../store/authStore';
import StickySearchHeader from '../components/layout/StickySearchHeader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ContactHost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const { isAuthenticated } = useAuthStore();
    const [property, setProperty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [showStickySearchHeader, setShowStickySearchHeader] = useState(true); // Always show for consistency

    // Ref for date picker container
    const datePickerRef = useRef(null);
    const datePickerTriggerRef = useRef(null); // Ref for the input that opens it, to avoid immediate closing on toggle

    // Ref for guest picker container
    const guestPickerRef = useRef(null);
    const guestPickerTriggerRef = useRef(null); // Ref for the input that opens it

    // Handle click outside to close date picker
    useEffect(() => {
        function handleClickOutside(event) {
            if (isDatePickerOpen &&
                datePickerRef.current &&
                !datePickerRef.current.contains(event.target) &&
                datePickerTriggerRef.current &&
                !datePickerTriggerRef.current.contains(event.target)) {
                setIsDatePickerOpen(false);
            }

            if (isGuestPickerOpen &&
                guestPickerRef.current &&
                !guestPickerRef.current.contains(event.target) &&
                guestPickerTriggerRef.current &&
                !guestPickerTriggerRef.current.contains(event.target)) {
                setIsGuestPickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDatePickerOpen, isGuestPickerOpen]);

    // Booking state (simplified for this view)
    // Booking state (simplified for this view)
    const [searchParams] = useSearchParams();

    const [bookingData, setBookingData] = useState({
        check_in_date: searchParams.get('check_in') || null,
        check_out_date: searchParams.get('check_out') || null,
        guests: {
            adults: parseInt(searchParams.get('adults')) || 1,
            children: parseInt(searchParams.get('children')) || 0,
            infants: parseInt(searchParams.get('infants')) || 0,
            pets: parseInt(searchParams.get('pets')) || 0
        }
    });

    // Update booking data when search params change
    useEffect(() => {
        const checkIn = searchParams.get('check_in') || searchParams.get('checkin') || searchParams.get('check_in_date');
        const checkOut = searchParams.get('check_out') || searchParams.get('checkout') || searchParams.get('check_out_date');
        const adults = searchParams.get('adults');
        const children = searchParams.get('children');
        const infants = searchParams.get('infants');
        const pets = searchParams.get('pets');
        const guestsParam = searchParams.get('guests');

        if (checkIn || checkOut || adults || guestsParam) {
            setBookingData(prev => ({
                ...prev,
                check_in_date: checkIn || prev.check_in_date,
                check_out_date: checkOut || prev.check_out_date,
                guests: {
                    adults: parseInt(adults) || (guestsParam ? parseInt(guestsParam) : prev.guests.adults),
                    children: parseInt(children) || prev.guests.children,
                    infants: parseInt(infants) || prev.guests.infants,
                    pets: parseInt(pets) || prev.guests.pets
                }
            }));
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await api.get(`/properties/${id}`);
                if (response.data.success) {
                    setProperty(response.data.data.property);
                    // Pre-fill generic message
                    setMessage(`Hi ${response.data.data.property.owner_first_name}! I'll be visiting...`);
                }
            } catch (error) {
                console.error('Error fetching property:', error);
                showError('Failed to load property details');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchProperty();
        }
    }, [id]);

    const handleSendMessage = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/properties/${id}/contact-host` } });
            return;
        }

        if (!message.trim()) {
            showError('Please enter a message');
            return;
        }

        try {
            const response = await api.post('/messages/start', {
                property_id: id,
                message
            });

            if (response.data.success) {
                showSuccess('Message sent successfully!');
                // Navigate to messages inbox or conversation detail
                navigate(`/messages/${response.data.data.conversationId}`);
            }
        } catch (error) {
            console.error('Send message error:', error);
            showError(error.response?.data?.message || 'Failed to send message');
        }
    };

    const handleReserve = () => {
        if (!property) return;

        // Calculate total guests
        const totalGuests = bookingData.guests.adults + bookingData.guests.children;

        const bookingPayload = {
            check_in_date: bookingData.check_in_date,
            check_out_date: bookingData.check_out_date,
            number_of_guests: totalGuests,
            number_of_children: bookingData.guests.children || 0,
            number_of_infants: bookingData.guests.infants || 0,
            // special_requests: '', // Add if needed
        };

        if (!isAuthenticated) {
            // Store booking data in localStorage before redirecting to login
            const propertyData = {
                id: property.id,
                title: property.title,
                base_price: property.base_price,
                max_guests: property.max_guests,
                // Add other necessary fields similar to PropertyDetail
                main_image: property.main_image || property.images?.[0] || null
            };

            const pendingBookingData = {
                property_id: id,
                ...bookingPayload,
                property: propertyData
            };

            localStorage.setItem('pendingBooking', JSON.stringify(pendingBookingData));
            navigate('/login', { state: { from: `/properties/${id}/contact-host`, bookingIntent: true } });
            return;
        }

        // Navigate to new booking page
        const params = new URLSearchParams();
        if (bookingData.check_in_date) params.set('check_in_date', bookingData.check_in_date);
        if (bookingData.check_out_date) params.set('check_out_date', bookingData.check_out_date);
        if (totalGuests) params.set('guests', totalGuests.toString());

        const queryString = params.toString();
        // Passing bookingData structure that matches what PropertyDetail uses
        navigate(`/guest/booking/new/${id}${queryString ? `?${queryString}` : ''}`, { state: { bookingData: bookingPayload, property } });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    // Calculate nights for price display
    const calculateNights = () => {
        if (!bookingData.check_in_date || !bookingData.check_out_date) return 0;
        const start = new Date(bookingData.check_in_date);
        const end = new Date(bookingData.check_out_date);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const nights = calculateNights();
    const totalPrice = nights > 0 ? (parseFloat(property?.base_price || 0) * nights) : 0;

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!property) {
        return <div className="min-h-screen flex items-center justify-center">Property not found</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            {showStickySearchHeader ? (
                <StickySearchHeader
                    alwaysSticky={true}
                    initialLocation={property?.city || ''}
                    initialCheckInDate={bookingData.check_in_date}
                    initialCheckOutDate={bookingData.check_out_date}
                    initialGuests={bookingData.guests.adults + bookingData.guests.children}
                />
            ) : (
                <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (bookingData.check_in_date) params.append('check_in_date', bookingData.check_in_date);
                                if (bookingData.check_out_date) params.append('check_out_date', bookingData.check_out_date);
                                const totalGuests = bookingData.guests.adults + bookingData.guests.children;
                                params.append('guests', totalGuests);
                                // Also append detailed breakdown if needed, but standard is usually flat guests for detail page
                                // params.append('adults', bookingData.guests.adults);
                                // params.append('children', bookingData.guests.children);
                                navigate(`/property/${id}?${params.toString()}`);
                            }}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Back"
                        >
                            <FiChevronLeft className="w-5 h-5 text-gray-900" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Left Column - Contact Info & Form */}
                    <div className="space-y-8">
                        {/* Back Button */}
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (bookingData.check_in_date) params.append('check_in_date', bookingData.check_in_date);
                                if (bookingData.check_out_date) params.append('check_out_date', bookingData.check_out_date);
                                const totalGuests = bookingData.guests.adults + bookingData.guests.children;
                                params.append('guests', totalGuests);
                                navigate(`/property/${id}?${params.toString()}`);
                            }}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors inline-flex items-center"
                            aria-label="Back"
                        >
                            <FiChevronLeft className="w-5 h-5 text-gray-900" />
                        </button>

                        {/* Host Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-[#222222] mb-2">
                                    Contact {property.owner_first_name}
                                </h1>
                                <p className="text-gray-500">Typically responds within an hour</p>
                            </div>
                            <div className="flex-shrink-0">
                                {property.owner_profile_image ? (
                                    <img
                                        src={property.owner_profile_image}
                                        alt={property.owner_first_name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-[#222222] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                        {property.owner_first_name?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        {/* Most travelers ask about */}
                        <div>
                            <h2 className="text-xl font-bold text-[#222222] mb-6">Most travelers ask about</h2>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-[#222222] mb-2">Getting there</h3>
                                    <ul className="space-y-2 text-[#222222] list-disc list-inside bg-transparent">
                                        <li>Free parking on the premises.</li>
                                        <li>Check-in time for this home starts at {property.check_in_time ? formatTime(property.check_in_time) : '3:00 PM'} and checkout is at {property.check_out_time ? formatTime(property.check_out_time) : '11:00 AM'}.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-[#222222] mb-2">House details and rules</h3>
                                    <ul className="space-y-2 text-[#222222] list-disc list-inside">
                                        <li>No parties or events. No pets.</li>
                                        {property.rules && property.rules.slice(0, 1).map((rule, idx) => (
                                            <li key={idx}>{rule.title || rule.description}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-[#222222] mb-2">Price and availability</h3>
                                    <ul className="space-y-2 text-[#222222] list-disc list-inside">
                                        <li>Get a 14% discount on stays longer than a week.</li>
                                        <li>{property.owner_first_name}'s home is available. Book soon.</li>
                                        <li>Cancel up to 24 hours before check-in and get a full refund.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200"></div>

                        {/* Message Form */}
                        <div>
                            <h2 className="text-xl font-bold text-[#222222] mb-6">Still have questions? Message the host</h2>
                            <div className="relative">
                                <textarea
                                    className="w-full border border-gray-400 rounded-lg p-4 min-h-[160px] focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-y text-[#222222]"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                            </div>
                            <button
                                onClick={handleSendMessage}
                                className="mt-4 bg-[#222222] hover:bg-black text-white px-6 py-3.5 rounded-lg font-semibold transition-colors"
                            >
                                Send message
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Booking Card (Hidden on mobile maybe? Or kept as context) */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-24 border border-gray-200 rounded-xl p-6 shadow-xl max-w-sm ml-auto">
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="text-2xl font-bold text-[#222222] mb-1">
                                        {nights > 0 ? `BDT ${totalPrice}` : `BDT ${property.base_price}`}
                                        <span className="text-base font-normal text-gray-500"> {nights > 0 ? `for ${nights} nights` : ' per night'}</span>
                                    </div>
                                    <div className="text-sm font-light text-[#222222] line-clamp-1">{property.title}</div>
                                    <div className="text-xs text-gray-500 mt-1">Entire rental unit</div>
                                </div>
                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                    {property.main_image || property.images?.[0] ? (
                                        <img
                                            src={property.main_image?.image_url || property.images?.[0]?.image_url}
                                            alt={property.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200" />
                                    )}
                                </div>
                            </div>

                            {/* Booking Widget Inputs (Simplified imitation) */}
                            <div className="relative">
                                <div className="border border-gray-400 rounded-lg overflow-hidden mb-4">
                                    <div ref={datePickerTriggerRef} className="grid grid-cols-2 border-b border-gray-400" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
                                        <div className="p-3 border-r border-gray-400 hover:bg-gray-50 cursor-pointer">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">Check-in</div>
                                            <div className="text-sm text-gray-700 truncate">{formatDate(bookingData.check_in_date) || 'Add date'}</div>
                                        </div>
                                        <div className="p-3 hover:bg-gray-50 cursor-pointer">
                                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">Checkout</div>
                                            <div className="text-sm text-gray-700 truncate">{formatDate(bookingData.check_out_date) || 'Add date'}</div>
                                        </div>
                                    </div>
                                    <div ref={guestPickerTriggerRef} className="p-3 hover:bg-gray-50 cursor-pointer relative" onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">Guests</div>
                                                <div className="text-sm text-gray-700">
                                                    {bookingData.guests.adults + bookingData.guests.children} guest{(bookingData.guests.adults + bookingData.guests.children) !== 1 ? 's' : ''}
                                                    {bookingData.guests.infants > 0 ? `, ${bookingData.guests.infants} infant${bookingData.guests.infants !== 1 ? 's' : ''}` : ''}
                                                    {bookingData.guests.pets > 0 ? `, ${bookingData.guests.pets} pet${bookingData.guests.pets !== 1 ? 's' : ''}` : ''}
                                                </div>
                                            </div>
                                            <FiChevronDown className={`w-5 h-5 text-gray-700 transition-transform ${isGuestPickerOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {isDatePickerOpen && (
                                    <div ref={datePickerRef} className="absolute right-0 top-[-30px] z-50 p-4 bg-white rounded-2xl border border-gray-200 max-w-[90vw] animate-fadeIn cursor-default text-left origin-top-right shadow-2xl">
                                        <style>{`
                                    .custom-calendar, .react-datepicker {
                                        border: none !important;
                                        font-family: inherit !important;
                                        display: flex !important;
                                        justify-content: center;
                                        box-shadow: none !important;
                                        background-color: transparent !important;
                                    }
                                    .custom-calendar .react-datepicker__month-container {
                                        padding: 0 10px;
                                    }
                                    .custom-calendar .react-datepicker__header {
                                        background: white;
                                        border: none;
                                        padding-top: 4px;
                                    }
                                    .custom-calendar .react-datepicker__day-name {
                                        color: #717171;
                                        font-size: 0.75rem;
                                        width: 38px;
                                        line-height: 38px;
                                        margin: 0;
                                    }
                                    .custom-calendar .react-datepicker__day {
                                        width: 38px;
                                        height: 38px;
                                        line-height: 38px;
                                        margin: 0;
                                        font-size: 0.85rem;
                                        font-weight: 500;
                                        border-radius: 50%;
                                    }
                                    .custom-calendar .react-datepicker__day:hover {
                                        background-color: #f7f7f7;
                                        border: 1.5px solid black;
                                        color: black;
                                        border-radius: 50%;
                                    }
                                    .custom-calendar .react-datepicker__day--selected,
                                    .custom-calendar .react-datepicker__day--range-end,
                                    .custom-calendar .react-datepicker__day--range-start {
                                        background-color: #222222 !important;
                                        color: white !important;
                                        border-radius: 50%;
                                    }
                                    .custom-calendar .react-datepicker__day--in-selecting-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end),
                                    .custom-calendar .react-datepicker__day--in-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end) {
                                        background-color: #f7f7f7 !important;
                                        color: #222222 !important;
                                        border-radius: 50%;
                                    }
                                    .custom-calendar .react-datepicker__current-month {
                                        font-size: 0.95rem;
                                        font-weight: 600;
                                        margin-bottom: 8px;
                                        color: #222222;
                                    }
                                    .custom-calendar .react-datepicker__navigation {
                                        top: 4px;
                                    }
                                `}</style>

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-[20px] font-bold text-[#222222] mb-1">Select dates</h2>
                                                <p className="text-[#717171] text-xs">Add your travel dates for exact pricing</p>
                                            </div>
                                            <div className="flex border-2 border-black rounded-xl overflow-hidden shadow-sm">
                                                <div className="px-3 py-2 bg-white border-r border-gray-300 min-w-[120px]">
                                                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#222222] mb-0.5">Check-in</div>
                                                    <div className="text-xs text-gray-700">{bookingData.check_in_date ? formatDate(bookingData.check_in_date) : 'MM/DD/YYYY'}</div>
                                                </div>
                                                <div className="px-3 py-2 bg-white min-w-[120px]">
                                                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#222222] mb-0.5">Checkout</div>
                                                    <div className="text-xs text-gray-700">{bookingData.check_out_date ? formatDate(bookingData.check_out_date) : 'MM/DD/YYYY'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center -mx-4">
                                            <DatePicker
                                                selected={bookingData.check_in_date ? new Date(bookingData.check_in_date) : null}
                                                onChange={(dates) => {
                                                    const [start, end] = dates;
                                                    setBookingData({
                                                        ...bookingData,
                                                        check_in_date: start ? start.toISOString() : null,
                                                        check_out_date: end ? end.toISOString() : null
                                                    });
                                                    if (end) setIsDatePickerOpen(false);
                                                }}
                                                startDate={bookingData.check_in_date ? new Date(bookingData.check_in_date) : null}
                                                endDate={bookingData.check_out_date ? new Date(bookingData.check_out_date) : null}
                                                selectsRange
                                                minDate={new Date()}
                                                inline
                                                monthsShown={2}
                                                calendarClassName="custom-calendar"
                                            />
                                        </div>

                                        <div className="flex justify-between items-center mt-4 pt-2">
                                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#222222]">
                                                    <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" transform="rotate(180 12 12)" />
                                                    <path d="M7 2a2 2 0 00-2 2v2H3v2h2v14h14v-2h2V6h-2V4a2 2 0 00-2-2H7zm0 2h10v2H7V4z" opacity="0.5" />
                                                    {/* Keyboard icon imitation */}
                                                    <path fillRule="evenodd" d="M19 6H5a3 3 0 00-3 3v8a3 3 0 003 3h14a3 3 0 003-3V9a3 3 0 00-3-3zm-1.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm13.5-5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setBookingData({ ...bookingData, check_in_date: null, check_out_date: null })}
                                                    className="px-4 py-2 text-sm font-semibold underline text-[#222222] hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    onClick={() => setIsDatePickerOpen(false)}
                                                    className="px-6 py-2 text-[14px] font-semibold bg-[#222222] text-white rounded-lg hover:bg-black transition-colors"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Simple Guest Picker Dropdown (visual only for this context) */}
                                {isGuestPickerOpen && (
                                    <div ref={guestPickerRef} className="mb-4 bg-white border border-gray-200 rounded-lg p-6 shadow-xl absolute w-full left-0 z-20 cursor-default top-[100%] -mt-[85px]">
                                        <div className="space-y-6">
                                            {/* Adults */}
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold text-[#222222]">Adults</div>
                                                    <div className="text-sm text-gray-500">Age 13+</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className={`w-8 h-8 rounded-full border flex items-center justify-center ${bookingData.guests.adults <= 1 ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'}`}
                                                        disabled={bookingData.guests.adults <= 1}
                                                        onClick={() => setBookingData({ ...bookingData, guests: { ...bookingData.guests, adults: bookingData.guests.adults - 1 } })}
                                                    >-</button>
                                                    <span className="w-4 text-center text-[#222222]">{bookingData.guests.adults}</span>
                                                    <button
                                                        className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center hover:border-black hover:text-black"
                                                        onClick={() => setBookingData({ ...bookingData, guests: { ...bookingData.guests, adults: bookingData.guests.adults + 1 } })}
                                                    >+</button>
                                                </div>
                                            </div>

                                            {/* Children */}
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold text-[#222222]">Children</div>
                                                    <div className="text-sm text-gray-500">Ages 2–12</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className={`w-8 h-8 rounded-full border flex items-center justify-center ${bookingData.guests.children <= 0 ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'}`}
                                                        disabled={bookingData.guests.children <= 0}
                                                        onClick={() => setBookingData({ ...bookingData, guests: { ...bookingData.guests, children: bookingData.guests.children - 1 } })}
                                                    >-</button>
                                                    <span className="w-4 text-center text-[#222222]">{bookingData.guests.children}</span>
                                                    <button
                                                        className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center hover:border-black hover:text-black"
                                                        onClick={() => setBookingData({ ...bookingData, guests: { ...bookingData.guests, children: bookingData.guests.children + 1 } })}
                                                    >+</button>
                                                </div>
                                            </div>

                                            {/* Infants */}
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold text-[#222222]">Infants</div>
                                                    <div className="text-sm text-gray-500">Under 2</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className={`w-8 h-8 rounded-full border flex items-center justify-center ${bookingData.guests.infants <= 0 ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'}`}
                                                        disabled={bookingData.guests.infants <= 0}
                                                        onClick={() => setBookingData({ ...bookingData, guests: { ...bookingData.guests, infants: bookingData.guests.infants - 1 } })}
                                                    >-</button>
                                                    <span className="w-4 text-center text-[#222222]">{bookingData.guests.infants}</span>
                                                    <button
                                                        className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center hover:border-black hover:text-black"
                                                        onClick={() => setBookingData({ ...bookingData, guests: { ...bookingData.guests, infants: bookingData.guests.infants + 1 } })}
                                                    >+</button>
                                                </div>
                                            </div>

                                            {/* Pets */}
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold text-[#222222]">Pets</div>
                                                    <div className="text-sm text-gray-500 underline font-semibold cursor-pointer">Bringing a service animal?</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className={`w-8 h-8 rounded-full border flex items-center justify-center ${bookingData.guests.pets <= 0 ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'}`}
                                                        disabled={bookingData.guests.pets <= 0}
                                                        onClick={() => setBookingData({ ...bookingData, guests: { ...bookingData.guests, pets: bookingData.guests.pets - 1 } })}
                                                    >-</button>
                                                    <span className="w-4 text-center text-[#222222]">{bookingData.guests.pets}</span>
                                                    <button
                                                        className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center hover:border-black hover:text-black"
                                                        onClick={() => setBookingData({ ...bookingData, guests: { ...bookingData.guests, pets: bookingData.guests.pets + 1 } })}
                                                    >+</button>
                                                </div>
                                            </div>

                                            <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                                                This place has a maximum of {property.max_guests || 4} guests, not including infants. Pets aren't allowed.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleReserve}
                                    disabled={!bookingData.check_in_date || !bookingData.check_out_date}
                                    className={`w-full font-bold py-3.5 rounded-lg transition-colors mb-4 bg-[#E41D57] text-white ${(!bookingData.check_in_date || !bookingData.check_out_date)
                                        ? 'cursor-not-allowed opacity-100'
                                        : 'hover:bg-[#D90B45]'
                                        }`}
                                >
                                    Reserve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactHost;
