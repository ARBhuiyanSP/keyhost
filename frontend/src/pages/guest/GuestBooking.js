import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FiWifi, FiTruck, FiCoffee, FiTv, FiShield, FiHome, FiDroplet, FiSun, FiEye,
  FiWind, FiThermometer, FiMonitor, FiLock, FiKey, FiClock, FiPackage, FiArrowUp,
  FiZap, FiRadio, FiMusic, FiVideo, FiBriefcase, FiHeart, FiX
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const GuestBooking = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  console.log('🔵 GuestBooking component mounted');
  console.log('Property ID from URL:', propertyId);

  // Helper function to format date in local timezone (YYYY-MM-DD) without timezone conversion
  const formatDateLocal = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to parse date string (YYYY-MM-DD) as local date, not UTC
  const parseDateLocal = (dateString) => {
    if (!dateString) return null;
    // Check if it's already a Date object
    if (dateString instanceof Date) return dateString;
    // Handle YYYY-MM-DD format manually to avoid timezone issues
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateString);
  };

  // Get icon for amenity based on its name
  const getAmenityIcon = (amenityName, category) => {
    const name = amenityName.toLowerCase().trim();

    const iconMap = {
      'wifi': FiWifi, 'internet': FiWifi, 'wireless': FiWifi, 'wi-fi': FiWifi, 'wi fi': FiWifi,
      'parking': FiTruck, 'car parking': FiTruck, 'garage': FiTruck, 'valet parking': FiTruck,
      'pool': FiDroplet, 'swimming pool': FiDroplet, 'hot tub': FiDroplet, 'jacuzzi': FiDroplet,
      'bath': FiDroplet, 'bathtub': FiDroplet, 'shower': FiDroplet, 'bathroom': FiDroplet,
      'air conditioning': FiWind, 'ac': FiWind, 'air conditioner': FiWind, 'cooling': FiWind,
      'heating': FiThermometer, 'heater': FiThermometer, 'fireplace': FiThermometer,
      'tv': FiTv, 'television': FiTv, 'cable tv': FiTv, 'smart tv': FiMonitor,
      'radio': FiRadio, 'sound system': FiMusic, 'speakers': FiMusic,
      'game console': FiVideo, 'gaming': FiVideo, 'playstation': FiVideo, 'xbox': FiVideo,
      'kitchen': FiCoffee, 'coffee maker': FiCoffee, 'coffee': FiCoffee, 'microwave': FiCoffee,
      'refrigerator': FiPackage, 'fridge': FiPackage, 'washer': FiPackage, 'washing machine': FiPackage,
      'dryer': FiPackage, 'dishwasher': FiPackage, 'oven': FiCoffee, 'stove': FiCoffee,
      'security': FiShield, 'security system': FiShield, 'safe': FiLock, 'lock': FiLock,
      'smoke detector': FiShield, 'fire extinguisher': FiShield, 'first aid': FiShield,
      'cctv': FiShield, 'alarm': FiShield,
      'elevator': FiArrowUp, 'lift': FiArrowUp, 'wheelchair accessible': FiEye,
      'accessible': FiEye, 'ramp': FiEye,
      'power backup': FiZap, 'generator': FiZap, 'ups': FiZap, 'electricity': FiZap,
      'balcony': FiSun, 'terrace': FiSun, 'garden': FiSun, 'patio': FiSun,
      'outdoor': FiSun, 'beach access': FiSun, 'mountain view': FiSun, 'sea view': FiSun,
      'gym': FiBriefcase, 'fitness': FiBriefcase, 'fitness center': FiBriefcase,
      'laundry': FiPackage, 'iron': FiPackage, 'hair dryer': FiPackage,
      'towels': FiPackage, 'linens': FiPackage, 'bedding': FiPackage,
      'pet friendly': FiHeart, 'pets allowed': FiHeart, 'smoking': FiX, 'smoking allowed': FiX,
      'check in': FiKey, 'check-in': FiKey, 'check out': FiClock, 'check-out': FiClock,
      'breakfast': FiCoffee, 'room service': FiCoffee, 'housekeeping': FiHome,
      'concierge': FiHome, 'luggage storage': FiPackage, 'storage': FiPackage,
    };

    if (iconMap[name]) {
      const IconComponent = iconMap[name];
      return <IconComponent className="w-4 h-4" />;
    }

    for (const [key, Icon] of Object.entries(iconMap)) {
      if (name.includes(key) || key.includes(name)) {
        return <Icon className="w-4 h-4" />;
      }
    }

    const categoryIcons = {
      basic: FiWifi,
      safety: FiShield,
      entertainment: FiTv,
      kitchen: FiCoffee,
      bathroom: FiDroplet,
      outdoor: FiSun,
      accessibility: FiEye
    };
    const IconComponent = categoryIcons[category] || FiWifi;
    return <IconComponent className="w-4 h-4" />;
  };

  // Get data passed from PropertyDetail page or URL search params
  const passedBookingData = location.state?.bookingData;
  const passedProperty = location.state?.property;

  // Get search params from URL
  const searchParams = new URLSearchParams(location.search);
  const urlCheckIn = searchParams.get('check_in_date');
  const urlCheckOut = searchParams.get('check_out_date');
  const urlGuests = searchParams.get('min_guests') || searchParams.get('guests');

  // Check localStorage for pending booking data
  const getPendingBookingData = () => {
    try {
      const pendingBooking = localStorage.getItem('pendingBooking');
      if (pendingBooking) {
        const data = JSON.parse(pendingBooking);
        // Only use if it matches current property
        if (data.property_id && parseInt(data.property_id) === parseInt(propertyId)) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error reading pending booking from localStorage:', error);
    }
    return null;
  };

  const pendingBookingData = getPendingBookingData();

  // Determine initial form data
  const getInitialFormData = () => {
    // Priority 1: Data passed via navigation state
    if (passedBookingData) {
      return {
        check_in_date: passedBookingData.check_in_date || '',
        check_out_date: passedBookingData.check_out_date || '',
        check_in_time: '15:00',
        check_out_time: '11:00',
        number_of_guests: passedBookingData.number_of_guests || 1,
        number_of_children: passedBookingData.number_of_children || 0,
        number_of_infants: passedBookingData.number_of_infants || 0,
        special_requests: passedBookingData.special_requests || '',
        coupon_code: ''
      };
    }

    // Priority 2: Data from localStorage (pending booking)
    if (pendingBookingData) {
      return {
        check_in_date: pendingBookingData.check_in_date || '',
        check_out_date: pendingBookingData.check_out_date || '',
        check_in_time: '15:00',
        check_out_time: '11:00',
        number_of_guests: pendingBookingData.number_of_guests || 1,
        number_of_children: pendingBookingData.number_of_children || 0,
        number_of_infants: pendingBookingData.number_of_infants || 0,
        special_requests: pendingBookingData.special_requests || '',
        coupon_code: ''
      };
    }

    // Priority 3: Data from URL params
    return {
      check_in_date: urlCheckIn || '',
      check_out_date: urlCheckOut || '',
      check_in_time: '15:00',
      check_out_time: '11:00',
      number_of_guests: urlGuests ? parseInt(urlGuests) : 1,
      number_of_children: 0,
      number_of_infants: 0,
      special_requests: '',
      coupon_code: ''
    };
  };

  const initialFormData = getInitialFormData();

  const [property, setProperty] = useState(passedProperty || pendingBookingData?.property || null);
  const [loading, setLoading] = useState(!passedProperty && !pendingBookingData?.property);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Update form data if navigation state changes
  useEffect(() => {
    if (passedBookingData) {
      setFormData(prev => ({
        ...prev,
        check_in_date: passedBookingData.check_in_date || prev.check_in_date,
        check_out_date: passedBookingData.check_out_date || prev.check_out_date,
        number_of_guests: passedBookingData.number_of_guests || prev.number_of_guests,
        number_of_children: passedBookingData.number_of_children || 0,
        number_of_infants: passedBookingData.number_of_infants || 0,
        special_requests: passedBookingData.special_requests || ''
      }));
    } else if (pendingBookingData) {
      setFormData(prev => ({
        ...prev,
        check_in_date: pendingBookingData.check_in_date || prev.check_in_date,
        check_out_date: pendingBookingData.check_out_date || prev.check_out_date,
        number_of_guests: pendingBookingData.number_of_guests || prev.number_of_guests,
        number_of_children: pendingBookingData.number_of_children || 0,
        number_of_infants: pendingBookingData.number_of_infants || 0,
        special_requests: pendingBookingData.special_requests || ''
      }));
    }
  }, [passedBookingData, pendingBookingData]);

  // Clear pending booking from localStorage once we've successfully loaded the form
  useEffect(() => {
    if (pendingBookingData && formData.check_in_date && formData.check_out_date) {
      setTimeout(() => {
        localStorage.removeItem('pendingBooking');
      }, 1000);
    }
  }, [pendingBookingData, formData.check_in_date, formData.check_out_date]);

  const [pricing, setPricing] = useState(null);
  const [availability, setAvailability] = useState(true);

  useEffect(() => {
    if (propertyId && !passedProperty && !property) {
      fetchProperty();
    }
  }, [propertyId, passedProperty, property]);

  useEffect(() => {
    if (formData.check_in_date && formData.check_out_date && property) {
      checkAvailability();
      calculatePricing();
    }
  }, [formData.check_in_date, formData.check_out_date, formData.number_of_guests, property]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/guest/properties/${propertyId}`);
      setProperty(response.data.data.property);
    } catch (err) {
      showError('Failed to fetch property details');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await api.get(`/guest/properties/${propertyId}/availability`, {
        params: {
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date
        }
      });
      setAvailability(response.data.data.isAvailable);
    } catch (err) {
      setAvailability(false);
    }
  };

  const calculatePricing = async () => {
    if (!formData.check_in_date || !formData.check_out_date || !property) return;

    const checkIn = parseDateLocal(formData.check_in_date);
    const checkOut = parseDateLocal(formData.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return;

    const basePrice = Number(property.base_price || 0) * nights;
    const cleaningFee = Number(property.cleaning_fee || 0);
    const securityDeposit = Number(property.security_deposit || 0);
    const extraGuestFee = formData.number_of_guests > 1 ? (formData.number_of_guests - 1) * Number(property.extra_guest_fee || 0) : 0;
    const serviceFee = basePrice * 0.1; // 10% service fee
    const taxAmount = basePrice * 0.15; // 15% tax

    const total = basePrice + cleaningFee + securityDeposit + extraGuestFee + serviceFee + taxAmount;

    setPricing({
      basePrice: Number(basePrice) || 0,
      cleaningFee: Number(cleaningFee) || 0,
      securityDeposit: Number(securityDeposit) || 0,
      extraGuestFee: Number(extraGuestFee) || 0,
      serviceFee: Number(serviceFee) || 0,
      taxAmount: Number(taxAmount) || 0,
      total: Number(total) || 0,
      nights: Number(nights) || 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!availability) {
      showError('Property is not available for the selected dates');
      return;
    }

    if (formData.number_of_guests > property.max_guests) {
      showError(`Maximum ${property.max_guests} guests allowed`);
      return;
    }

    if (!user) {
      showError('You must be logged in to make a booking');
      return;
    }

    try {
      setSubmitting(true);

      if (!formData.check_in_date || !formData.check_out_date) {
        showError('Please select check-in and check-out dates');
        setSubmitting(false);
        return;
      }

      const bookingPayload = {
        property_id: parseInt(propertyId),
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        check_in_time: formData.check_in_time || '15:00',
        check_out_time: formData.check_out_time || '11:00',
        number_of_guests: parseInt(formData.number_of_guests) || 1,
        number_of_children: parseInt(formData.number_of_children) || 0,
        number_of_infants: parseInt(formData.number_of_infants) || 0,
        special_requests: formData.special_requests || '',
        coupon_code: formData.coupon_code || ''
      };

      const response = await api.post('/guest/bookings', bookingPayload);
      showSuccess('Booking request submitted successfully! Waiting for owner confirmation.');
      navigate(`/guest/bookings/${response.data.data.booking.id}`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!property) return <div className="text-center p-8">Property not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Property
          </button>
          <h1 className="text-[0.7rem] md:text-3xl font-bold text-gray-900">Book {property.title}</h1>
          <p className="mt-2 text-gray-600">{property.city}, {property.state}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Property Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>

            {property.main_image && (
              <img
                src={property.main_image.image_url}
                alt={property.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Property Type:</span>
                <span className="font-medium">{property.property_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Guests:</span>
                <span className="font-medium">{property.max_guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bedrooms:</span>
                <span className="font-medium">{property.bedrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bathrooms:</span>
                <span className="font-medium">{property.bathrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in Time:</span>
                <span className="font-medium">{property.check_in_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out Time:</span>
                <span className="font-medium">{property.check_out_time}</span>
              </div>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {property.amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">{getAmenityIcon(amenity.name, amenity.category)}</span>
                      {amenity.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow p-6 overflow-visible relative z-10 property-detail-booking-form">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Range Field - Airbnb Style */}
              <div className="relative z-[50]">
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                  Check-in & Check-out
                </label>
                <div className="relative">
                  <DatePicker
                    selected={formData.check_in_date ? parseDateLocal(formData.check_in_date) : null}
                    onChange={(dates) => {
                      const [start, end] = dates;
                      setFormData(prev => ({
                        ...prev,
                        check_in_date: formatDateLocal(start) || '',
                        check_out_date: formatDateLocal(end) || ''
                      }));
                    }}
                    startDate={formData.check_in_date ? parseDateLocal(formData.check_in_date) : null}
                    endDate={formData.check_out_date ? parseDateLocal(formData.check_out_date) : null}
                    selectsRange
                    minDate={new Date()}
                    placeholderText="Select dates"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer text-gray-900 font-medium"
                    dateFormat="MMM dd, yyyy"
                    monthsShown={windowWidth < 768 ? 1 : 2}
                    showPopperArrow={false}
                    popperClassName="reserve-date-popper"
                    calendarClassName="header-date-calendar"
                    popperPlacement="bottom-end"
                    popperModifiers={[
                      {
                        name: 'preventOverflow',
                        options: {
                          boundary: 'viewport',
                          padding: 8,
                        },
                      },
                      {
                        name: 'offset',
                        options: {
                          offset: [0, 8],
                        },
                      },
                    ]}
                    withPortal={false}
                    shouldCloseOnSelect={false}
                    value={
                      formData.check_in_date && formData.check_out_date
                        ? `${parseDateLocal(formData.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${parseDateLocal(formData.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : formData.check_in_date
                          ? `${parseDateLocal(formData.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                          : ''
                    }
                  />
                  {!formData.check_in_date && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FiClock className="text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Guest Count */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                  Guests
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Adults
                    </label>
                    <input
                      type="number"
                      name="number_of_guests"
                      value={formData.number_of_guests}
                      onChange={handleInputChange}
                      min="1"
                      max={property.max_guests}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Children
                    </label>
                    <input
                      type="number"
                      name="number_of_children"
                      value={formData.number_of_children}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Infants
                    </label>
                    <input
                      type="number"
                      name="number_of_infants"
                      value={formData.number_of_infants}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special requests or notes..."
                />
              </div>

              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code (Optional)
                </label>
                <input
                  type="text"
                  name="coupon_code"
                  value={formData.coupon_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter coupon code"
                />
              </div>

              {/* Availability Warning */}
              {!availability && formData.check_in_date && formData.check_out_date && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <FiX className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-800">
                      This property is not available for the selected dates. Please choose different dates.
                    </p>
                  </div>
                </div>
              )}

              {/* Pricing Summary */}
              {pricing && pricing.total !== undefined && pricing.nights > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Pricing Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>BDT {property.base_price || 0} × {pricing.nights || 0} nights</span>
                      <span className="font-bold text-red-600">BDT {Number(pricing.basePrice || 0).toFixed(0)}</span>
                    </div>
                    {pricing.cleaningFee > 0 && (
                      <div className="flex justify-between">
                        <span>Cleaning fee</span>
                        <span className="font-bold text-red-600">BDT {Number(pricing.cleaningFee || 0).toFixed(0)}</span>
                      </div>
                    )}
                    {pricing.securityDeposit > 0 && (
                      <div className="flex justify-between">
                        <span>Security deposit</span>
                        <span className="font-bold text-red-600">BDT {Number(pricing.securityDeposit || 0).toFixed(0)}</span>
                      </div>
                    )}
                    {pricing.extraGuestFee > 0 && (
                      <div className="flex justify-between">
                        <span>Extra guest fee</span>
                        <span className="font-bold text-red-600">BDT {Number(pricing.extraGuestFee || 0).toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Service fee (10%)</span>
                      <span className="font-bold text-red-600">BDT {Number(pricing.serviceFee || 0).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (15%)</span>
                      <span className="font-bold text-red-600">BDT {Number(pricing.taxAmount || 0).toFixed(0)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="font-bold text-red-600">BDT {Number(pricing.total || 0).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !availability || !formData.check_in_date || !formData.check_out_date}
                className="w-full px-6 py-3 bg-[#E41D57] text-white font-medium rounded-lg hover:bg-[#E41D57] focus:ring-2 focus:ring-[#E41D57] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting Request...' : 'Request Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestBooking;
