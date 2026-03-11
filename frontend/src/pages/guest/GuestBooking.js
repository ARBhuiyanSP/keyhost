import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  FiWifi, FiTruck, FiCoffee, FiTv, FiShield, FiHome, FiDroplet, FiSun, FiEye,
  FiWind, FiThermometer, FiMonitor, FiLock, FiKey, FiClock, FiPackage, FiArrowUp,
  FiZap, FiRadio, FiMusic, FiVideo, FiBriefcase, FiHeart, FiX, FiChevronLeft,
  FiStar, FiMapPin, FiUsers, FiCalendar, FiCheck, FiAlertCircle
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
  const [availability, setAvailability] = useState(true);

  useEffect(() => {
    if (pendingBookingData && formData.check_in_date && formData.check_out_date) {
      setTimeout(() => localStorage.removeItem('pendingBooking'), 1000);
    }
  }, [pendingBookingData, formData.check_in_date, formData.check_out_date]);

  useEffect(() => {
    if (propertyId && !property) fetchProperty();
  }, [propertyId]);

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
    } catch {
      showError('Failed to fetch property details');
      navigate('/properties');
    } finally { setLoading(false); }
  };

  const checkAvailability = async () => {
    try {
      const response = await api.get(`/guest/properties/${propertyId}/availability`, {
        params: { check_in_date: formData.check_in_date, check_out_date: formData.check_out_date }
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
    const basePrice = Number(property.base_price || 0) * nights;
    const cleaningFee = Number(property.cleaning_fee || 0);
    const securityDeposit = Number(property.security_deposit || 0);
    const extraGuestFee = formData.number_of_guests > 1 ? (formData.number_of_guests - 1) * Number(property.extra_guest_fee || 0) : 0;
    const serviceFee = basePrice * 0.1;
    const taxAmount = basePrice * 0.15;
    const total = basePrice + cleaningFee + securityDeposit + extraGuestFee + serviceFee + taxAmount;
    setPricing({ basePrice, cleaningFee, securityDeposit, extraGuestFee, serviceFee, taxAmount, total, nights });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!availability) { showError('Property is not available for the selected dates'); return; }
    if (formData.number_of_guests > property.max_guests) { showError(`Maximum ${property.max_guests} guests allowed`); return; }
    if (!user) { showError('You must be logged in to make a booking'); return; }
    try {
      setSubmitting(true);
      if (!formData.check_in_date || !formData.check_out_date) { showError('Please select check-in and check-out dates'); setSubmitting(false); return; }
      const bookingPayload = {
        property_id: parseInt(propertyId),
        check_in_date: formData.check_in_date, check_out_date: formData.check_out_date,
        check_in_time: formData.check_in_time || '15:00', check_out_time: formData.check_out_time || '11:00',
        number_of_guests: parseInt(formData.number_of_guests) || 1,
        number_of_children: parseInt(formData.number_of_children) || 0,
        number_of_infants: parseInt(formData.number_of_infants) || 0,
        special_requests: formData.special_requests || '', coupon_code: formData.coupon_code || ''
      };
      const response = await api.post('/guest/bookings', bookingPayload);
      showSuccess('Booking request submitted successfully! Waiting for owner confirmation.');
      navigate(`/guest/bookings/${response.data.data.booking.id}`);
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">

          {/* ─── LEFT COLUMN: Booking form ─── */}
          <div>

            {/* Section: Confirm booking */}
            <div className="border-b border-gray-200 pb-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Confirm your booking</h2>
              <p className="text-gray-500 text-sm">You won't be charged yet — your request will be sent to the host for confirmation.</p>
            </div>

            {/* Section: Trip dates */}
            <div className="border-b border-gray-200 pb-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-[#E41D57]" /> Your trip
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Check-in / Check-out date picker */}
                <div className="sm:col-span-2 relative z-[50]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dates</label>
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
                    placeholderText="Select check-in → check-out"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E41D57] focus:border-[#E41D57] cursor-pointer text-gray-900 font-medium bg-gray-50"
                    dateFormat="MMM dd, yyyy"
                    monthsShown={windowWidth < 768 ? 1 : 2}
                    showPopperArrow={false}
                    popperPlacement="bottom-start"
                    shouldCloseOnSelect={false}
                  />
                  {formData.check_in_date && formData.check_out_date && (
                    <div className="mt-2 flex gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1 bg-pink-50 text-[#E41D57] px-3 py-1 rounded-full font-medium">
                        Check-in: {formatDisplayDate(formData.check_in_date)}
                      </span>
                      <span className="flex items-center gap-1 bg-pink-50 text-[#E41D57] px-3 py-1 rounded-full font-medium">
                        Check-out: {formatDisplayDate(formData.check_out_date)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Adults</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => setFormData(p => ({ ...p, number_of_guests: Math.max(1, p.number_of_guests - 1) }))}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors">−</button>
                    <span className="flex-1 text-center font-semibold text-gray-900">{formData.number_of_guests}</span>
                    <button type="button" onClick={() => setFormData(p => ({ ...p, number_of_guests: Math.min(property.max_guests, p.number_of_guests + 1) }))}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Children</label>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button type="button" onClick={() => setFormData(p => ({ ...p, number_of_children: Math.max(0, p.number_of_children - 1) }))}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors">−</button>
                    <span className="flex-1 text-center font-semibold text-gray-900">{formData.number_of_children}</span>
                    <button type="button" onClick={() => setFormData(p => ({ ...p, number_of_children: p.number_of_children + 1 }))}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-50 font-bold text-lg transition-colors">+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Special Requests */}
            <div className="border-b border-gray-200 pb-8 mb-8">
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

            {/* Section: Coupon */}
            <div className="border-b border-gray-200 pb-8 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupon code</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="coupon_code"
                  value={formData.coupon_code}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E41D57] focus:border-[#E41D57] bg-gray-50"
                  placeholder="Enter coupon code (optional)"
                />
                <button type="button" className="px-5 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Apply</button>
              </div>
            </div>

            {/* Section: Property amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="border-b border-gray-200 pb-8 mb-8">
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
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">This property is not available for the selected dates. Please choose different dates.</p>
              </div>
            )}

            {/* Mobile-only: Confirm button */}
            <div className="lg:hidden">
              <button
                onClick={handleSubmit}
                disabled={submitting || !availability || !formData.check_in_date || !formData.check_out_date}
                className="w-full py-4 rounded-xl text-white font-bold text-base bg-gradient-to-r from-[#E41D57] to-[#ff5c8a] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {submitting ? 'Submitting...' : `Request to Book${nights > 0 ? ` · ${nights} night${nights > 1 ? 's' : ''}` : ''}`}
              </button>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: Sticky Price Card (matches PropertyDetail reserve form) ─── */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">

                {/* Price header */}
                <div className="p-6 pb-4">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-gray-900">BDT {Number(property.base_price || 0).toLocaleString()}</span>
                    <span className="text-gray-500 text-sm font-normal">/ night</span>
                  </div>
                  {property.average_rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <FiStar className="w-3.5 h-3.5 text-[#E41D57] fill-[#E41D57]" />
                      <span className="font-semibold">{Number(property.average_rating).toFixed(1)}</span>
                      {property.total_reviews > 0 && <span className="text-gray-400">· {property.total_reviews} review{property.total_reviews !== 1 ? 's' : ''}</span>}
                    </div>
                  )}
                </div>

                {/* Date + Guest fields (compact, Airbnb-style) */}
                <div className="px-6 pb-4">
                  <div className="border border-gray-300 rounded-xl overflow-hidden text-sm">
                    {/* Dates */}
                    <div className="px-4 py-3 border-b border-gray-200 relative z-10">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Dates</div>
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
                        placeholderText="Add dates"
                        className="w-full text-sm text-gray-900 font-medium focus:outline-none cursor-pointer bg-transparent"
                        dateFormat="MMM d, yyyy"
                        monthsShown={2}
                        showPopperArrow={false}
                        popperPlacement="bottom-end"
                        shouldCloseOnSelect={false}
                      />
                    </div>
                    {/* Guests */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Guests</div>
                        <span className="text-sm font-medium text-gray-900">{formData.number_of_guests} guest{formData.number_of_guests > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setFormData(p => ({ ...p, number_of_guests: Math.max(1, p.number_of_guests - 1) }))}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 transition-colors font-bold">−</button>
                        <span className="w-5 text-center font-semibold text-gray-900">{formData.number_of_guests}</span>
                        <button type="button" onClick={() => setFormData(p => ({ ...p, number_of_guests: Math.min(property.max_guests, p.number_of_guests + 1) }))}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-500 transition-colors font-bold">+</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reserve Button */}
                <div className="px-6 pb-4">
                  <button
                    type="submit"
                    disabled={submitting || !availability || !formData.check_in_date || !formData.check_out_date}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-base bg-gradient-to-r from-[#E41D57] to-[#ff5c8a] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                  >
                    {submitting ? 'Submitting...' : (formData.check_in_date && formData.check_out_date ? 'Request to Book' : 'Check availability')}
                  </button>
                  {formData.check_in_date && formData.check_out_date && (
                    <p className="text-center text-xs text-gray-400 mt-2">You won't be charged yet</p>
                  )}
                </div>

                {/* Pricing breakdown */}
                {pricing && pricing.nights > 0 && (
                  <div className="px-6 pb-6 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span className="underline">BDT {Number(property.base_price || 0).toLocaleString()} × {pricing.nights} night{pricing.nights > 1 ? 's' : ''}</span>
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
                    <div className="flex justify-between text-gray-700">
                      <span className="underline">Service fee (10%)</span>
                      <span>BDT {Number(pricing.serviceFee).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="underline">Tax (15%)</span>
                      <span>BDT {Number(pricing.taxAmount).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                      <span>Total</span>
                      <span>BDT {Number(pricing.total).toLocaleString()}</span>
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
