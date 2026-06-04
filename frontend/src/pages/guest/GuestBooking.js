import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FiWifi, FiTruck, FiCoffee, FiTv, FiShield, FiHome, FiDroplet, FiSun, FiEye,
  FiWind, FiThermometer, FiMonitor, FiLock, FiKey, FiClock, FiPackage, FiArrowUp,
  FiZap, FiRadio, FiMusic, FiVideo, FiBriefcase, FiHeart, FiX, FiChevronLeft,
  FiStar, FiMapPin, FiUsers, FiCalendar, FiCheck, FiAlertCircle, FiChevronDown
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const GuestBooking = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const { showSuccess, showError } = useToast();

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const datePickerRef = useRef(null);
  const datePickerTriggerRef = useRef(null);
  const guestPickerRef = useRef(null);
  const guestPickerTriggerRef = useRef(null);

  const [isMobileDatePickerOpen, setIsMobileDatePickerOpen] = useState(false);
  const mobileDatePickerRef = useRef(null);
  const mobileDatePickerTriggerRef = useRef(null);

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

      if (isMobileDatePickerOpen &&
        mobileDatePickerRef.current &&
        !mobileDatePickerRef.current.contains(event.target) &&
        mobileDatePickerTriggerRef.current &&
        !mobileDatePickerTriggerRef.current.contains(event.target)) {
        setIsMobileDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDatePickerOpen, isGuestPickerOpen, isMobileDatePickerOpen]);

  // Date helpers
  const formatDateLocal = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateLocal = (dateString) => {
    if (!dateString) return null;
    if (dateString instanceof Date) return dateString;
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateString);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = parseDateLocal(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Amenity icon helper
  const getAmenityIcon = (amenityName, category) => {
    const name = amenityName.toLowerCase().trim();
    const iconMap = {
      'wifi': FiWifi, 'internet': FiWifi, 'wi-fi': FiWifi,
      'parking': FiTruck, 'car parking': FiTruck, 'garage': FiTruck,
      'pool': FiDroplet, 'swimming pool': FiDroplet, 'bath': FiDroplet,
      'air conditioning': FiWind, 'ac': FiWind,
      'heating': FiThermometer, 'heater': FiThermometer,
      'tv': FiTv, 'television': FiTv, 'smart tv': FiMonitor,
      'kitchen': FiCoffee, 'coffee': FiCoffee, 'microwave': FiCoffee,
      'security': FiShield, 'safe': FiLock,
      'elevator': FiArrowUp, 'accessible': FiEye,
      'power backup': FiZap, 'generator': FiZap,
      'balcony': FiSun, 'garden': FiSun,
      'gym': FiBriefcase,
      'laundry': FiPackage,
      'check in': FiKey, 'breakfast': FiCoffee,
    };
    for (const [key, Icon] of Object.entries(iconMap)) {
      if (name.includes(key)) return <Icon className="w-4 h-4" />;
    }
    const categoryIcons = { basic: FiWifi, safety: FiShield, entertainment: FiTv, kitchen: FiCoffee, bathroom: FiDroplet, outdoor: FiSun };
    const IconComponent = categoryIcons[category] || FiWifi;
    return <IconComponent className="w-4 h-4" />;
  };

  // Data initialization
  const passedBookingData = location.state?.bookingData;
  const passedProperty = location.state?.property;
  const searchParams = new URLSearchParams(location.search);
  const urlCheckIn = searchParams.get('check_in_date');
  const urlCheckOut = searchParams.get('check_out_date');
  const urlGuests = searchParams.get('min_guests') || searchParams.get('guests');
  const urlHmsRoomId = searchParams.get('hms_room_id');

  const getPendingBookingData = () => {
    try {
      const pendingBooking = localStorage.getItem('pendingBooking');
      if (pendingBooking) {
        const data = JSON.parse(pendingBooking);
        if (data.property_id && parseInt(data.property_id) === parseInt(propertyId)) return data;
      }
    } catch (e) { }
    return null;
  };
  const pendingBookingData = getPendingBookingData();

  const hmsRoomId = passedBookingData?.hms_room_id || pendingBookingData?.hms_room_id || urlHmsRoomId;

  const getInitialFormData = () => {
    const src = passedBookingData || pendingBookingData;
    if (src) return {
      check_in_date: src.check_in_date || '', check_out_date: src.check_out_date || '',
      check_in_time: '15:00', check_out_time: '11:00',
      number_of_guests: src.number_of_guests || 1, number_of_children: src.number_of_children || 0,
      number_of_infants: src.number_of_infants || 0, special_requests: src.special_requests || '', coupon_code: ''
    };
    return {
      check_in_date: urlCheckIn || '', check_out_date: urlCheckOut || '',
      check_in_time: '15:00', check_out_time: '11:00',
      number_of_guests: urlGuests ? parseInt(urlGuests) : 1, number_of_children: 0,
      number_of_infants: 0, special_requests: '', coupon_code: ''
    };
  };

  const [property, setProperty] = useState(passedProperty || pendingBookingData?.property || null);
  const [loading, setLoading] = useState(!passedProperty && !pendingBookingData?.property);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData);
  const [pricing, setPricing] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availability, setAvailability] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [blockedDatesData, setBlockedDatesData] = useState({ blockedDates: [], checkInDates: [] });

  useEffect(() => {
    if (pendingBookingData && formData.check_in_date && formData.check_out_date) {
      setTimeout(() => localStorage.removeItem('pendingBooking'), 1000);
    }
  }, [pendingBookingData, formData.check_in_date, formData.check_out_date]);

  useEffect(() => {
    if (propertyId) {
      if (!property) fetchProperty();
      fetchBlockedDates();
    }
  }, [propertyId]);

  const fetchBlockedDates = async () => {
    try {
      const response = await api.get(`/properties/${propertyId}/blocked-dates`);
      setBlockedDatesData(response.data?.data || { blockedDates: [], checkInDates: [] });
    } catch (err) {
      console.error('Failed to fetch blocked dates:', err);
    }
  };

  const isDateBlocked = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate < today) return true;

    const dateString = formatDateLocal(date);
    const isSelectingCheckout = formData.check_in_date && !formData.check_out_date;
    if (isSelectingCheckout && blockedDatesData.checkInDates.includes(dateString)) {
      return false;
    }
    return blockedDatesData.blockedDates.includes(dateString);
  };

  useEffect(() => {
    if (formData.check_in_date && formData.check_out_date && property) {
      checkAvailability();
      calculatePricing();
    }
  }, [formData.check_in_date, formData.check_out_date, formData.number_of_guests, property, selectedRoom, appliedCoupon]);

  useEffect(() => {
    if (property && hmsRoomId) {
      const room = property.hms_rooms?.find(r => r.id === parseInt(hmsRoomId));
      if (room) setSelectedRoom(room);
    }
  }, [property, hmsRoomId]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/guest/properties/${propertyId}`);
      setProperty(response.data.data.property);
    } catch {
      showError('Failed to fetch property details');
      navigate('/properties');
    } finally { setLoading(false); }
  };

  const checkAvailability = async () => {
    try {
      const response = await api.get(`/guest/properties/${propertyId}/availability`, {
        params: {
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date,
          hms_room_id: hmsRoomId
        }
      });
      setAvailability(response.data.data.isAvailable);
    } catch { setAvailability(false); }
  };

  const calculatePricing = () => {
    if (!formData.check_in_date || !formData.check_out_date || !property) return;
    const checkIn = parseDateLocal(formData.check_in_date);
    const checkOut = parseDateLocal(formData.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return;

    // Use room price if selectedRoom is present
    const pricePerNight = selectedRoom ? parseFloat(selectedRoom.price) : Number(property.base_price || 0);
    const basePrice = pricePerNight * nights;
    const cleaningFee = Number(property.cleaning_fee || 0);
    const securityDeposit = Number(property.security_deposit || 0);
    const extraGuestFee = formData.number_of_guests > 1 ? (formData.number_of_guests - 1) * Number(property.extra_guest_fee || 0) : 0;

    const serviceFeePercent = parseFloat(settings?.service_fee_percentage || 0) / 100;
    const taxPercent = parseFloat(settings?.tax_percentage || 0) / 100;

    const serviceFee = basePrice * serviceFeePercent;
    const taxAmount = basePrice * taxPercent;
    const totalBeforeDiscount = basePrice + cleaningFee + securityDeposit + extraGuestFee + serviceFee + taxAmount;

    // Parse custom price from search params or pending booking data
    const customPrice = parseFloat(searchParams.get('customPrice')) || pendingBookingData?.customPrice || null;

    let hostDiscount = 0;
    if (customPrice && customPrice > 0 && customPrice <= totalBeforeDiscount) {
      hostDiscount = totalBeforeDiscount - customPrice;
    }

    let discountAmount = 0;

    if (appliedCoupon) {
      const remainingTotal = totalBeforeDiscount - hostDiscount;
      if (remainingTotal >= appliedCoupon.minimum_amount) {
        if (appliedCoupon.discount_type === 'percentage') {
          discountAmount = (remainingTotal * appliedCoupon.discount_value) / 100;
          if (appliedCoupon.maximum_discount) {
            discountAmount = Math.min(discountAmount, appliedCoupon.maximum_discount);
          }
        } else {
          discountAmount = appliedCoupon.discount_value;
        }
      } else {
        setAppliedCoupon(null);
        showError(`Coupon removed: Minimum amount is ${appliedCoupon.minimum_amount}`);
      }
    }

    const total = totalBeforeDiscount - hostDiscount - discountAmount;
    setPricing({ basePrice, cleaningFee, securityDeposit, extraGuestFee, serviceFee, taxAmount, total, nights, serviceFeePercent, taxPercent, discountAmount, hostDiscount });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!formData.coupon_code) {
      showError('Please enter a coupon code');
      return;
    }
    try {
      const response = await api.post('/guest/validate-coupon', {
        coupon_code: formData.coupon_code,
        total_amount: pricing.basePrice + pricing.cleaningFee + pricing.securityDeposit + pricing.extraGuestFee + pricing.serviceFee + pricing.taxAmount
      });
      const { discount_amount, code, discount_type, discount_value, minimum_amount, maximum_discount } = response.data.data;

      setAppliedCoupon({
        code,
        discount_type,
        discount_value,
        minimum_amount,
        maximum_discount
      });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setFormData(prev => ({ ...prev, coupon_code: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!availability) { showError('Property is not available for the selected dates'); return; }
    if (formData.number_of_guests > property.max_guests) { showError(`Maximum ${property.max_guests} guests allowed`); return; }
    if (!user) { showError('You must be logged in to make a booking'); return; }
    try {
      setSubmitting(true);
      if (!formData.check_in_date || !formData.check_out_date) { showError('Please select check-in and check-out dates'); setSubmitting(false); return; }

      // Parse custom price from search params or pending booking data
      const customPrice = parseFloat(searchParams.get('customPrice')) || pendingBookingData?.customPrice || null;

      const bookingPayload = {
        property_id: parseInt(propertyId),
        hms_room_id: hmsRoomId ? parseInt(hmsRoomId) : null,
        check_in_date: formData.check_in_date, check_out_date: formData.check_out_date,
        check_in_time: formData.check_in_time || '15:00', check_out_time: formData.check_out_time || '11:00',
        number_of_guests: parseInt(formData.number_of_guests) || 1,
        number_of_children: parseInt(formData.number_of_children) || 0,
        number_of_infants: parseInt(formData.number_of_infants) || 0,
        special_requests: formData.special_requests || '', coupon_code: formData.coupon_code || '',
        custom_price: customPrice
      };
      const response = await api.post('/guest/bookings', bookingPayload);
      const { booking, auto_accepted } = response.data.data;
      if (auto_accepted) {
        showSuccess('Booking confirmed! Redirecting to payment...');
        navigate(`/payment/${booking.id}`);
      } else {
        showSuccess('Booking request submitted! Waiting for owner confirmation.');
        navigate(`/guest/bookings/${booking.id}`);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create booking');
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!property) return <div className="text-center p-8">Property not found</div>;

  const mainImage = property.images?.[0]?.image_url || property.main_image?.image_url || null;
  const nights = pricing?.nights || 0;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero image (matches PropertyDetail top gallery) ── */}
      <div className="w-full h-[40vh] md:h-[55vh] bg-gray-100 relative overflow-hidden">
        {mainImage ? (
          <img src={mainImage} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <FiHome className="w-20 h-20 text-gray-400" />
          </div>
        )}
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all text-gray-900 font-medium text-sm"
        >
          <FiChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* Property title overlay at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-6 text-white">
          <p className="text-sm font-medium text-white/80 mb-1 flex items-center gap-1">
            <FiMapPin className="w-3.5 h-3.5" /> {property.city}{property.state ? `, ${property.state}` : ''}
          </p>
          <h1 className="text-2xl md:text-4xl font-bold leading-tight">{property.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-white/90">
            {property.average_rating > 0 && (
              <span className="flex items-center gap-1"><FiStar className="w-3.5 h-3.5 fill-white" /> {Number(property.average_rating).toFixed(1)}</span>
            )}
            {property.max_guests && <span className="flex items-center gap-1"><FiUsers className="w-3.5 h-3.5" /> Up to {property.max_guests} guests</span>}
            {property.bedrooms && <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>}
            {property.bathrooms && <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>}
          </div>
        </div>
      </div>

      {/* ── Content: 2-column layout (matches PropertyDetail) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-16 items-start">

          {/* ─── LEFT COLUMN: Booking form ─── */}
          <div className="contents lg:block">

            {/* Section: Confirm booking */}
            <div className="order-1 lg:order-none w-full border-b border-gray-200 pb-5 lg:pb-8 mb-6 lg:mb-8 mt-2 lg:mt-0">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Confirm your booking</h2>
              <p className="text-gray-500 text-sm">You won't be charged yet — your request will be sent to the host for confirmation.</p>
            </div>

            {/* Section: Trip dates (Hidden on mobile as pickers are moved up) */}
            <div className="hidden lg:block lg:order-none w-full border-b border-gray-200 pb-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-[#E41D57]" /> Your trip
              </h3>

              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-[#222222] text-base mb-1">Dates</div>
                    <div className="text-[#222222] text-base">
                      {formData.check_in_date && formData.check_out_date
                        ? `${formatDisplayDate(formData.check_in_date)} - ${formatDisplayDate(formData.check_out_date)}`
                        : 'No dates selected'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-[#222222] text-base mb-1">Guests</div>
                    <div className="text-[#222222] text-base">
                      {formData.number_of_guests} guest{formData.number_of_guests > 1 ? 's' : ''}
                      {formData.number_of_children > 0 ? `, ${formData.number_of_children} child${formData.number_of_children > 1 ? 'ren' : ''}` : ''}
                      {formData.number_of_infants > 0 ? `, ${formData.number_of_infants} infant${formData.number_of_infants !== 1 ? 's' : ''}` : ''}
                      {formData.number_of_pets > 0 ? `, ${formData.number_of_pets} pet${formData.number_of_pets !== 1 ? 's' : ''}` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Special Requests */}
            <div className="order-3 lg:order-none w-full border-b border-gray-200 pb-6 lg:pb-8 mb-6 lg:mb-8 mt-6 lg:mt-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Special requests</h3>
              <textarea
                name="special_requests"
                value={formData.special_requests}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E41D57] focus:border-[#E41D57] resize-none bg-gray-50 placeholder-gray-400"
                placeholder="Any special requests or notes for the host..."
              />
            </div>



            {/* Section: Property amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="order-5 lg:order-none w-full border-b border-gray-200 pb-6 lg:pb-8 mb-6 lg:mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What this place offers</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.slice(0, 9).map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-gray-500">{getAmenityIcon(amenity.name, amenity.category)}</span>
                      {amenity.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability warning */}
            {!availability && formData.check_in_date && formData.check_out_date && (
              <div className="order-5 lg:order-none w-full mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">This property is not available for the selected dates. Please choose different dates.</p>
              </div>
            )}

            {/* Mobile Submit Button (Placed at absolute bottom) */}
            <div className="order-6 block lg:hidden w-full mt-2 mb-8">
              {formData.check_in_date && formData.check_out_date && (
                <p className="text-xs text-gray-500 text-center mb-3">
                  By confirming this booking, you agree to our{' '}
                  <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="font-bold underline text-gray-750 hover:text-black">
                    Refund & Cancellation Policy
                  </a>{' '}
                  and{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold underline text-gray-750 hover:text-black">
                    Terms of Service
                  </a>.
                </p>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !availability || !formData.check_in_date || !formData.check_out_date}
                className="w-full py-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r from-[#E41D57] to-[#ff5c8a] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {submitting ? 'Processing...' : (formData.check_in_date && formData.check_out_date ? (property.owner_auto_accept ? 'Confirm Booking' : 'Request to Book') : 'Check availability')}
              </button>
              {formData.check_in_date && formData.check_out_date && (
                <p className="text-center text-xs text-gray-500 mt-2 font-medium">You won't be charged yet</p>
              )}
              {/* Help/Support link near booking CTA */}
              <div className="text-center mt-3">
                <p className="text-xs text-gray-500">
                  Need help with booking?{' '}
                  <a 
                    href="/contact" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-bold text-gray-800 hover:text-black underline underline-offset-2"
                  >
                    Ask Help & Support
                  </a>
                </p>
              </div>
            </div>

          </div>

          {/* ─── RIGHT COLUMN: Sticky Price Card (matches PropertyDetail reserve form) ─── */}
          <div className="order-2 lg:order-none w-full mt-2 lg:mt-0">
            <div className="sticky top-24">
              <form onSubmit={handleSubmit} className="bg-white lg:border lg:border-gray-200 lg:rounded-2xl lg:shadow-xl pb-4 lg:pb-0">

                {/* Price header */}
                <div className="p-0 pb-4 lg:p-6 lg:pb-4">
                  <div className="flex justify-between items-center gap-2 mb-1 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">BDT {Number(selectedRoom ? selectedRoom.price : (property.base_price || 0)).toLocaleString()}</span>
                      <span className="text-gray-500 text-sm font-normal">/ night</span>
                    </div>
                    {pricing && pricing.nights > 0 && (
                      <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200">
                        {pricing.nights} night{pricing.nights > 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>
                  {selectedRoom && (
                    <div className="mb-2">
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-[10px] font-bold uppercase tracking-wider">
                        Room {selectedRoom.room_number} ({selectedRoom.room_type})
                      </span>
                    </div>
                  )}
                  {property.average_rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FiStar className="w-3.5 h-3.5 text-[#E41D57] fill-[#E41D57]" />
                      <span className="font-semibold">{Number(property.average_rating).toFixed(1)}</span>
                      {property.total_reviews > 0 && <span className="text-gray-400">· {property.total_reviews} review{property.total_reviews !== 1 ? 's' : ''}</span>}
                    </div>
                  )}
                </div>

                {/* Date + Guest fields (compact, Airbnb-style) */}
                <div className="px-0 pb-4 lg:px-6 lg:pb-4">
                  <div className="relative">
                    <div className="border border-gray-400 rounded-lg mb-4 relative z-10">
                      <div ref={datePickerTriggerRef} className="grid grid-cols-2 border-b border-gray-400 overflow-hidden rounded-t-lg" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
                        <div className="p-3 border-r border-gray-400 hover:bg-gray-50 cursor-pointer text-left">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">Check-in</div>
                          <div className="text-sm text-gray-700 truncate">{formatDisplayDate(formData.check_in_date) || 'Add date'}</div>
                        </div>
                        <div className="p-3 hover:bg-gray-50 cursor-pointer text-left">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">Checkout</div>
                          <div className="text-sm text-gray-700 truncate">{formatDisplayDate(formData.check_out_date) || 'Add date'}</div>
                        </div>
                      </div>

                      <div ref={guestPickerTriggerRef} className="p-3 hover:bg-gray-50 cursor-pointer relative text-left bg-white rounded-b-lg" onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">Guests</div>
                            <div className="text-sm text-gray-700">
                              {formData.number_of_guests} guest{formData.number_of_guests !== 1 ? 's' : ''}
                              {formData.number_of_infants > 0 ? `, ${formData.number_of_infants} infant${formData.number_of_infants !== 1 ? 's' : ''}` : ''}
                            </div>
                          </div>
                          <FiChevronDown className={`w-5 h-5 text-gray-700 transition-transform ${isGuestPickerOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {isDatePickerOpen && (
                      <div ref={datePickerRef} className="absolute right-0 top-[-20px] z-[60] p-4 bg-white rounded-2xl border border-gray-200 max-w-[90vw] animate-fadeIn cursor-default text-left origin-top-right shadow-2xl">
                        <style>{`
                                    .custom-calendar, .react-datepicker { border: none !important; font-family: inherit !important; display: flex !important; justify-content: center; box-shadow: none !important; background-color: transparent !important; }
                                    .custom-calendar .react-datepicker__month-container { padding: 0 10px; }
                                    .custom-calendar .react-datepicker__header { background: white; border: none; padding-top: 4px; }
                                    .custom-calendar .react-datepicker__day-name { color: #717171; font-size: 0.75rem; width: 38px; line-height: 38px; margin: 0; }
                                    .custom-calendar .react-datepicker__day { width: 38px; height: 38px; line-height: 38px; margin: 0; font-size: 0.85rem; font-weight: 500; border-radius: 50%; }
                                    .custom-calendar .react-datepicker__day:hover { background-color: #f7f7f7; border: 1.5px solid black; color: black; border-radius: 50%; }
                                    .custom-calendar .react-datepicker__day--selected, .custom-calendar .react-datepicker__day--range-end, .custom-calendar .react-datepicker__day--range-start { background-color: #222222 !important; color: white !important; border-radius: 50%; }
                                    .custom-calendar .react-datepicker__day--in-selecting-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end), .custom-calendar .react-datepicker__day--in-range:not(.react-datepicker__day--range-start):not(.react-datepicker__day--range-end) { background-color: #f7f7f7 !important; color: #222222 !important; border-radius: 50%; }
                                    .custom-calendar .react-datepicker__current-month { font-size: 0.95rem; font-weight: 600; margin-bottom: 8px; color: #222222; }
                                    .custom-calendar .react-datepicker__navigation { top: 4px; }
                                `}</style>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-[20px] font-bold text-[#222222] mb-1">Select dates</h2>
                            <p className="text-[#717171] text-xs">Add your travel dates for exact pricing</p>
                          </div>
                          <div className="flex border-2 border-black rounded-xl overflow-hidden shadow-sm">
                            <div className="px-3 py-2 bg-white border-r border-gray-300 min-w-[120px] w-full md:w-auto">
                              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#222222] mb-0.5">Check-in</div>
                              <div className="text-xs text-gray-700">{formData.check_in_date ? formatDisplayDate(formData.check_in_date) : 'MM/DD/YYYY'}</div>
                            </div>
                            <div className="px-3 py-2 bg-white min-w-[120px] hidden md:block">
                              <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#222222] mb-0.5">Checkout</div>
                              <div className="text-xs text-gray-700">{formData.check_out_date ? formatDisplayDate(formData.check_out_date) : 'MM/DD/YYYY'}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-center -mx-4">
                          <DatePicker
                            selected={formData.check_in_date ? parseDateLocal(formData.check_in_date) : null}
                            onChange={(dates) => {
                              const [start, end] = dates;
                              setFormData(prev => ({
                                ...prev,
                                check_in_date: formatDateLocal(start) || '',
                                check_out_date: formatDateLocal(end) || ''
                              }));
                              if (end) setIsDatePickerOpen(false);
                            }}
                            startDate={formData.check_in_date ? parseDateLocal(formData.check_in_date) : null}
                            endDate={formData.check_out_date ? parseDateLocal(formData.check_out_date) : null}
                            selectsRange
                            minDate={new Date()}
                            filterDate={(date) => !isDateBlocked(date)}
                            inline
                            monthsShown={windowWidth < 768 ? 1 : 2}
                            calendarClassName="custom-calendar"
                          />
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-2">
                          <button type="button" onClick={() => setFormData(p => ({ ...p, check_in_date: '', check_out_date: '' }))} className="px-4 py-2 text-sm font-semibold underline text-[#222222] hover:bg-gray-100 rounded-lg transition-colors">Clear</button>
                          <button type="button" onClick={() => setIsDatePickerOpen(false)} className="px-6 py-2 text-[14px] font-semibold bg-[#222222] text-white rounded-lg hover:bg-black transition-colors">Save</button>
                        </div>
                      </div>
                    )}

                    {/* Guest Picker Dropdown */}
                    {isGuestPickerOpen && (
                      <div ref={guestPickerRef} className="mb-4 bg-white border border-gray-200 rounded-lg p-6 shadow-xl absolute w-full left-0 z-[60] cursor-default top-[100%]">
                        <div className="space-y-6">
                          {[
                            { key: 'adults', label: 'Adults', subtitle: 'Ages 13 or above', min: 1 },
                            { key: 'children', label: 'Children', subtitle: 'Ages 2 – 12', min: 0 },
                            { key: 'infants', label: 'Infants', subtitle: 'Under 2', min: 0 },
                            { key: 'pets', label: 'Pets', subtitle: 'Bringing a service animal?', min: 0 },
                          ].map((item) => {
                            let currentValue = 0;
                            const totalGuests = formData.number_of_guests || 1;
                            const children = formData.number_of_children || 0;

                            if (item.key === 'adults') currentValue = totalGuests - children;
                            else if (item.key === 'children') currentValue = children;
                            else if (item.key === 'infants') currentValue = formData.number_of_infants || 0;
                            else if (item.key === 'pets') currentValue = formData.number_of_pets || 0;

                            const isMinusDisabled = currentValue <= item.min;
                            let isPlusDisabled = false;

                            if (item.key === 'adults' || item.key === 'children') {
                              isPlusDisabled = totalGuests >= property.max_guests;
                            } else if (item.key === 'infants') {
                              isPlusDisabled = (formData.number_of_infants || 0) >= 2;
                            } else if (item.key === 'pets') {
                              isPlusDisabled = (formData.number_of_pets || 0) >= 3;
                            }

                            return (
                              <div key={item.key} className="flex justify-between items-center w-full">
                                <div className="flex-1 text-left">
                                  <div className="font-semibold text-[#222222]">{item.label}</div>
                                  <div className="text-sm text-gray-500">{item.subtitle}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center ${isMinusDisabled ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'}`}
                                    disabled={isMinusDisabled}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item.key === 'adults') {
                                        setFormData(prev => ({ ...prev, number_of_guests: Math.max(1, (prev.number_of_guests || 1) - 1) }));
                                      } else if (item.key === 'children') {
                                        setFormData(prev => ({
                                          ...prev,
                                          number_of_children: Math.max(0, (prev.number_of_children || 0) - 1),
                                          number_of_guests: Math.max(1, (prev.number_of_guests || 1) - 1)
                                        }));
                                      } else if (item.key === 'infants') {
                                        setFormData(prev => ({ ...prev, number_of_infants: Math.max(0, (prev.number_of_infants || 0) - 1) }));
                                      } else if (item.key === 'pets') {
                                        setFormData(prev => ({ ...prev, number_of_pets: Math.max(0, (prev.number_of_pets || 0) - 1) }));
                                      }
                                    }}
                                  >
                                    −
                                  </button>
                                  <span className="w-4 text-center text-[#222222]">{currentValue}</span>
                                  <button
                                    type="button"
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center ${isPlusDisabled ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'}`}
                                    disabled={isPlusDisabled}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item.key === 'adults') {
                                        setFormData(prev => ({ ...prev, number_of_guests: Math.min(property.max_guests, (prev.number_of_guests || 1) + 1) }));
                                      } else if (item.key === 'children') {
                                        setFormData(prev => ({
                                          ...prev,
                                          number_of_children: (prev.number_of_children || 0) + 1,
                                          number_of_guests: Math.min(property.max_guests, (prev.number_of_guests || 1) + 1)
                                        }));
                                      } else if (item.key === 'infants') {
                                        setFormData(prev => ({ ...prev, number_of_infants: (prev.number_of_infants || 0) + 1 }));
                                      } else if (item.key === 'pets') {
                                        setFormData(prev => ({ ...prev, number_of_pets: (prev.number_of_pets || 0) + 1 }));
                                      }
                                    }}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                            This place has a maximum of {property.max_guests || 4} guests.
                          </div>
                          <div className="flex justify-end pt-2">
                            <button type="button" onClick={() => setIsGuestPickerOpen(false)} className="text-sm font-semibold underline text-black hover:text-gray-700">Close</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Reserve Button */}
                <div className="hidden lg:block px-6 pb-4">
                  {formData.check_in_date && formData.check_out_date && (
                    <p className="text-xs text-gray-500 text-center mb-3">
                      By confirming this booking, you agree to our{' '}
                      <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="font-bold underline text-gray-750 hover:text-black">
                        Refund & Cancellation Policy
                      </a>{' '}
                      and{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-bold underline text-gray-750 hover:text-black">
                        Terms of Service
                      </a>.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !availability || !formData.check_in_date || !formData.check_out_date}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-base bg-gradient-to-r from-[#E41D57] to-[#ff5c8a] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                  >
                    {submitting ? 'Processing...' : (formData.check_in_date && formData.check_out_date ? (property.owner_auto_accept ? 'Confirm Booking' : 'Request to Book') : 'Check availability')}
                  </button>
                  {formData.check_in_date && formData.check_out_date && (
                    <p className="text-center text-xs text-gray-400 mt-2">You won't be charged yet</p>
                  )}
                  {/* Help/Support link near booking CTA */}
                  <div className="text-center mt-3">
                    <p className="text-xs text-gray-500">
                      Need help with booking?{' '}
                      <a 
                        href="/contact" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-bold text-gray-800 hover:text-black underline underline-offset-2"
                      >
                        Ask Help & Support
                      </a>
                    </p>
                  </div>
                </div>

                {/* Pricing breakdown */}
                {pricing && pricing.nights > 0 && (
                  <div className="px-0 pb-0 lg:px-6 lg:pb-6 space-y-2 text-sm mt-4 lg:mt-0">
                    <div className="flex justify-between text-gray-700">
                      <span className="underline">BDT {Number(selectedRoom ? selectedRoom.price : (property.base_price || 0)).toLocaleString()} × {pricing.nights} night{pricing.nights > 1 ? 's' : ''}</span>
                      <span>BDT {Number(pricing.basePrice).toLocaleString()}</span>
                    </div>
                    {pricing.cleaningFee > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span className="underline">Cleaning fee</span>
                        <span>BDT {Number(pricing.cleaningFee).toLocaleString()}</span>
                      </div>
                    )}
                    {pricing.securityDeposit > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span className="underline">Security deposit</span>
                        <span>BDT {Number(pricing.securityDeposit).toLocaleString()}</span>
                      </div>
                    )}
                    {pricing.extraGuestFee > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span className="underline">Extra guest fee</span>
                        <span>BDT {Number(pricing.extraGuestFee).toLocaleString()}</span>
                      </div>
                    )}
                    {pricing.serviceFee > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span className="underline">Service fee ({pricing.serviceFeePercent * 100}%)</span>
                        <span>BDT {Number(pricing.serviceFee).toLocaleString()}</span>
                      </div>
                    )}
                    {pricing.taxAmount > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span className="underline">Tax ({pricing.taxPercent * 100}%)</span>
                        <span>BDT {Number(pricing.taxAmount).toLocaleString()}</span>
                      </div>
                    )}
                    {pricing.hostDiscount > 0 && (
                      <div className="bg-green-50 p-2 rounded-lg flex justify-between text-green-700 font-medium my-2">
                        <span>Host Discount</span>
                        <span>- BDT {Number(pricing.hostDiscount).toLocaleString()}</span>
                      </div>
                    )}
                    {pricing.discountAmount > 0 && (
                      <div className="bg-green-50 p-2 rounded-lg flex justify-between text-green-700 font-medium my-2">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span>- BDT {Number(pricing.discountAmount).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                      <span>Total</span>
                      <span>BDT {Number(pricing.total).toLocaleString()}</span>
                    </div>

                    {/* Section: Coupon */}
                    <div className="pt-4 pb-2 border-t border-gray-100 border-dashed mt-2">
                      {appliedCoupon ? (
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                          <div>
                            <span className="text-sm font-medium text-gray-900">Code: {appliedCoupon.code}</span>
                            <span className="text-xs text-green-600 block">Applied successfully</span>
                          </div>
                          <button type="button" onClick={handleRemoveCoupon} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">Remove</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="coupon_code"
                            value={formData.coupon_code}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E41D57] focus:border-[#E41D57] placeholder-gray-400"
                            placeholder="Coupon code"
                          />
                          <button type="button" onClick={handleApplyCoupon} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Apply</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Availability warning */}
                {!availability && formData.check_in_date && formData.check_out_date && (
                  <div className="mx-6 mb-6 bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
                    <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">Not available for selected dates.</p>
                  </div>
                )}
              </form>

              {/* Property quick facts */}
              <div className="mt-6 bg-gray-50 rounded-2xl p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Property details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Type</span><span className="font-medium text-gray-900">{property.property_type || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max guests</span><span className="font-medium text-gray-900">{property.max_guests}</span>
                  </div>
                  {property.bedrooms && <div className="flex justify-between"><span>Bedrooms</span><span className="font-medium text-gray-900">{property.bedrooms}</span></div>}
                  {property.bathrooms && <div className="flex justify-between"><span>Bathrooms</span><span className="font-medium text-gray-900">{property.bathrooms}</span></div>}
                  {property.check_in_time && <div className="flex justify-between"><span>Check-in</span><span className="font-medium text-gray-900">{property.check_in_time}</span></div>}
                  {property.check_out_time && <div className="flex justify-between"><span>Check-out</span><span className="font-medium text-gray-900">{property.check_out_time}</span></div>}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GuestBooking;
