import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  FiStar, FiMapPin, FiUsers, FiWifi, FiTruck, FiCoffee, FiHeart, FiShare2,
  FiCalendar, FiCheck, FiX, FiShield, FiTv, FiHome, FiChevronLeft, FiChevronRight,
  FiClock, FiKey, FiWind, FiMonitor, FiSun, FiMoon, FiThermometer, FiLock,
  FiEye, FiEyeOff, FiMinus, FiPlus, FiDroplet, FiPackage, FiArrowUp, FiZap,
  FiRadio, FiMusic, FiVideo, FiBriefcase, FiTag, FiMessageSquare, FiSearch, FiFlag, FiChevronDown
} from 'react-icons/fi';
import ReportListingModal from '../components/property/ReportListingModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAuthStore from '../store/authStore';
import StickySearchHeader from '../components/layout/StickySearchHeader';
import PropertyImageSlider from '../components/property/PropertyImageSlider';
import PropertyMap from '../components/property/PropertyMap';
import { addToRecentlyViewed } from '../utils/recentlyViewed';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const mobileReserveDateContainerRef = useRef(null);
  const desktopReserveDatePickerRef = useRef(null);
  const reserveSectionRef = useRef(null);
  const reserveSubmitBtnRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showMobileReserveForm, setShowMobileReserveForm] = useState(false);
  const [isMobileReserveDatePickerOpen, setIsMobileReserveDatePickerOpen] = useState(false);
  const [showStickySearchHeader, setShowStickySearchHeader] = useState(true); // Show on first load
  const [reviewsPage, setReviewsPage] = useState(1);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showStickyTabs, setShowStickyTabs] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isReserveButtonInView, setIsReserveButtonInView] = useState(true);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const datePickerRef = useRef(null);
  const datePickerTriggerRef = useRef(null);
  const guestPickerRef = useRef(null);
  const guestPickerTriggerRef = useRef(null);

  // Get search params from URL (for when coming from search/properties pages)
  const searchParams = new URLSearchParams(location.search);
  const urlCheckIn = searchParams.get('check_in_date');
  const urlCheckOut = searchParams.get('check_out_date');
  const urlGuests = searchParams.get('guests');

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
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
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
      return <IconComponent className="w-5 h-5" />;
    }

    for (const [key, Icon] of Object.entries(iconMap)) {
      if (name.includes(key) || key.includes(name)) {
        return <Icon className="w-5 h-5" />;
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
    return <IconComponent className="w-5 h-5" />;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      basic: FiWifi,
      safety: FiShield,
      entertainment: FiTv,
      kitchen: FiCoffee,
      bathroom: FiDroplet,
      outdoor: FiSun,
      accessibility: FiEye,
      parking: FiPackage,
      heating: FiThermometer,
      air_conditioning: FiWind,
      tv: FiMonitor,
      wifi: FiWifi,
      security: FiLock,
      check_in: FiKey,
      check_out: FiClock
    };
    const IconComponent = icons[category] || FiWifi;
    return <IconComponent className="w-5 h-5" />;
  };

  const [bookingData, setBookingData] = useState({
    check_in_date: urlCheckIn || null,
    check_out_date: urlCheckOut || null,
    number_of_guests: urlGuests ? parseInt(urlGuests) : 1,
    number_of_children: 0,
    number_of_infants: 0,
    special_requests: ''
  });



  // Fetch property details
  const { data: property, isLoading, error } = useQuery(
    ['property', id],
    () => api.get(`/properties/${id}`),
    {
      select: (response) => response.data?.data?.property,
      enabled: !!id,
    }
  );

  // Fetch blocked dates for calendar
  const { data: blockedDatesData } = useQuery(
    ['blockedDates', id],
    () => api.get(`/properties/${id}/blocked-dates`),
    {
      select: (response) => response.data?.data?.blockedDates || [],
      enabled: !!id,
    }
  );

  // Fetch all reviews for the property
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    ['propertyReviews', id, reviewsPage],
    () => api.get(`/reviews/property/${id}?page=${reviewsPage}&limit=10`),
    {
      select: (response) => response.data?.data || { reviews: [], pagination: {} },
      enabled: !!id,
    }
  );

  const blockedDates = blockedDatesData || [];

  // Function to check if a date is blocked (includes past dates and booked dates)
  const isDateBlocked = (date) => {
    if (!date) return false;

    // Check if date is in the past (before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < today) {
      return true; // Past dates are blocked
    }

    // Check if date is in blocked dates list
    const dateString = formatDateLocal(date);
    return blockedDates.includes(dateString);
  };

  // Function to get day className for styling
  const getDayClassName = (date) => {
    if (!date) return '';
    if (isDateBlocked(date)) {
      return 'react-datepicker__day--blocked';
    }
    return 'react-datepicker__day--available';
  };

  // Check availability
  const { data: availability } = useQuery(
    ['availability', id, bookingData.check_in_date, bookingData.check_out_date],
    () => api.get(`/properties/${id}/availability?check_in_date=${bookingData.check_in_date}&check_out_date=${bookingData.check_out_date}`),
    {
      select: (response) => response.data?.data,
      enabled: !!bookingData.check_in_date && !!bookingData.check_out_date,
    }
  );

  // Check if property is in favorites
  const checkFavoriteStatus = async () => {
    if (isAuthenticated && property) {
      try {
        const response = await api.get('/users/favorites');
        const favorites = response.data?.data?.favorites || [];
        setIsFavorite(favorites.some(fav => fav.property_id === property.id));
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    }
  };

  useEffect(() => {
    checkFavoriteStatus();
  }, [isAuthenticated, property]);

  useEffect(() => {
    if (!showMobileReserveForm) {
      setIsMobileReserveDatePickerOpen(false);
    }
  }, [showMobileReserveForm]);

  useEffect(() => {
    if (!showMobileReserveForm || !isMobileReserveDatePickerOpen) return;

    const handleOutside = (event) => {
      if (mobileReserveDateContainerRef.current && !mobileReserveDateContainerRef.current.contains(event.target)) {
        setIsMobileReserveDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [showMobileReserveForm, isMobileReserveDatePickerOpen]);

  // Scroll to top when property ID changes or component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  // Track property view
  useEffect(() => {
    if (property) {
      addToRecentlyViewed(property);
    }
  }, [property]);

  useEffect(() => {
    if (!property) return;
    if (!reserveSubmitBtnRef.current) return;
    if (window.innerWidth < 768) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsReserveButtonInView(Boolean(entry && entry.isIntersecting));
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-140px 0px 0px 0px',
      }
    );

    observer.observe(reserveSubmitBtnRef.current);
    return () => observer.disconnect();
  }, [property]);

  // Keyboard navigation for modals (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showImageModal) {
          e.preventDefault();
          setShowImageModal(false);
        } else if (showDescriptionModal) {
          e.preventDefault();
          setShowDescriptionModal(false);
        }
      }
    };

    if (showImageModal || showDescriptionModal) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
    if (showImageModal || showDescriptionModal) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showImageModal, showDescriptionModal]);

  // Handle click outside for new pickers
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

  // Wrapper for format compatibility
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // If it's already a date object or string that works with Date constructor
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      // Store booking data in localStorage before redirecting to login
      // Only store essential property fields to avoid serialization issues
      const propertyData = property ? {
        id: property.id,
        title: property.title,
        base_price: property.base_price,
        max_guests: property.max_guests,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        city: property.city,
        state: property.state,
        address: property.address,
        main_image: property.main_image || property.images?.[0] || null
      } : null;

      const pendingBookingData = {
        property_id: id,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        number_of_guests: bookingData.number_of_guests,
        number_of_children: bookingData.number_of_children || 0,
        number_of_infants: bookingData.number_of_infants || 0,
        special_requests: bookingData.special_requests || '',
        property: propertyData
      };

      console.log('Storing pending booking data:', pendingBookingData);
      localStorage.setItem('pendingBooking', JSON.stringify(pendingBookingData));
      navigate('/login', { state: { from: `/property/${id}`, bookingIntent: true } });
      return;
    }

    // Navigate to new booking page with property and booking data, also pass URL params
    const params = new URLSearchParams();
    if (bookingData.check_in_date) params.set('check_in_date', bookingData.check_in_date);
    if (bookingData.check_out_date) params.set('check_out_date', bookingData.check_out_date);
    if (bookingData.number_of_guests) params.set('guests', bookingData.number_of_guests.toString());
    const queryString = params.toString();
    navigate(`/guest/booking/new/${id}${queryString ? `?${queryString}` : ''}`, { state: { bookingData, property } });
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/users/favorites/${id}`);
      } else {
        await api.post(`/users/favorites/${id}`);
      }
      // Refresh favorite status from server to ensure consistency
      await checkFavoriteStatus();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const calculateNights = () => {
    if (bookingData.check_in_date && bookingData.check_out_date) {
      const checkIn = parseDateLocal(bookingData.check_in_date);
      const checkOut = parseDateLocal(bookingData.check_out_date);
      return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const calculateTotal = () => {
    if (!property || !bookingData.check_in_date || !bookingData.check_out_date) {
      return 0;
    }

    const nights = calculateNights();
    if (nights === 0) return 0;

    const basePricePerNight = parseFloat(property.base_price) || 0;
    const basePrice = basePricePerNight * nights;
    const cleaningFee = parseFloat(property.cleaning_fee) || 0;
    const securityDeposit = parseFloat(property.security_deposit) || 0;
    const extraGuestFee = bookingData.number_of_guests > 1 ? (bookingData.number_of_guests - 1) * (parseFloat(property.extra_guest_fee) || 0) : 0;
    const serviceFee = basePrice * 0.1; // 10% service fee
    const taxAmount = basePrice * 0.15; // 15% tax

    const total = basePrice + cleaningFee + securityDeposit + extraGuestFee + serviceFee + taxAmount;
    return isNaN(total) ? 0 : total;
  };

  const formatStickyDateRange = () => {
    if (!bookingData.check_in_date || !bookingData.check_out_date) return '';
    const checkIn = parseDateLocal(bookingData.check_in_date);
    const checkOut = parseDateLocal(bookingData.check_out_date);
    const start = checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start}–${end}`;
  };

  // Show sticky search header on scroll (desktop only) with hysteresis to reduce jitter
  // On property detail page, show on first load, then maintain on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      const showThreshold = 140;
      const hideThreshold = 90;
      setShowStickySearchHeader((prev) => {
        // Always show if at top (first load) or if scrolled past threshold
        if (scrolled <= hideThreshold) {
          return true; // Show on first load and when scrolled back to top
        }
        if (prev) {
          return scrolled > hideThreshold;
        }
        return scrolled > showThreshold;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle sticky tabs visibility and active section detection
  useEffect(() => {
    if (!property) return;

    const handleScroll = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;

      // Get image section height (hero gallery)
      const imageSection = document.querySelector('.property-hero-gallery');
      let imageSectionHeight = 0;

      if (imageSection) {
        imageSectionHeight = imageSection.offsetHeight || imageSection.getBoundingClientRect().height;
      }

      // If image section not found, use viewport height as fallback (70vh on desktop)
      if (imageSectionHeight === 0 && window.innerWidth >= 768) {
        imageSectionHeight = window.innerHeight * 0.7; // 70vh
      }

      // Show sticky tabs after scrolling past image section (desktop only)
      if (window.innerWidth >= 768) {
        // Show tabs when scrolled past image section (with threshold)
        const threshold = imageSectionHeight - 150;
        setShowStickyTabs(scrolled > threshold);
      } else {
        setShowStickyTabs(false);
      }

      // Detect active section
      const sections = ['photos', 'description', 'amenities', 'rules', 'reviews'];
      const scrollPosition = scrolled + 200; // Offset for better UX

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(`section-${sections[i]}`);
        if (section) {
          const sectionTop = section.offsetTop;
          if (scrollPosition >= sectionTop) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }

      // Set default section if at top
      if (scrolled < 100) {
        setActiveSection('photos');
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      handleScroll();
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Also check on resize
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [property]);

  // Scroll to section
  const scrollToSection = (sectionId) => {
    // Special handling for photos - scroll to top of hero gallery
    if (sectionId === 'photos') {
      const heroGallery = document.querySelector('.property-hero-gallery');
      if (heroGallery) {
        const offset = 64; // Header height
        const elementPosition = heroGallery.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
        return;
      }
      // Fallback: scroll to top
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }

    // For other sections, scroll to the section element
    const section = document.getElementById(`section-${sectionId}`);
    if (section) {
      const offset = 120; // Offset for sticky header + tabs
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleStickyBookingAction = () => {
    const hasDates = Boolean(bookingData.check_in_date && bookingData.check_out_date);
    if (hasDates) {
      handleBookingSubmit({ preventDefault: () => { } });
      return;
    }

    scrollToSection('reserve');
    window.setTimeout(() => {
      const ref = desktopReserveDatePickerRef.current;
      if (ref && typeof ref.setOpen === 'function') {
        ref.setOpen(true);
      }
    }, 350);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h2>
          <button onClick={() => navigate('/properties')} className="btn-primary">
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white mobile-footer-spacing">
      {/* Sticky header appears after scroll (desktop only) */}
      {showStickySearchHeader && (
        <div className="hidden md:block">
          <StickySearchHeader
            alwaysSticky={true}
            initialLocation={property?.city || ''}
            initialCheckInDate={urlCheckIn || null}
            initialCheckOutDate={urlCheckOut || null}
            initialGuests={urlGuests ? parseInt(urlGuests) : 1}
          />
        </div>
      )}
      {/* Modern Hero Gallery - Responsive 2 Column Layout */}
      <div className="relative property-hero-gallery">
        {property.images && property.images.length > 0 ? (
          <div className="h-[50vh] md:h-[70vh] relative overflow-hidden">
            {/* Back Button - Mobile */}
            <button
              onClick={() => navigate(-1)}
              className="md:hidden absolute top-4 left-4 z-10 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
              aria-label="Go back"
            >
              <FiChevronLeft className="w-5 h-5 text-gray-900" />
            </button>
            {/* Mobile: Image Slider */}
            <div className="md:hidden h-full mt-[3px]">
              <div
                className="relative cursor-pointer group overflow-hidden h-full"
                onClick={() => {
                  setSelectedImage(0);
                  setShowImageModal(true);
                }}
              >
                <PropertyImageSlider
                  property={property}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {/* View More Photos Button for Mobile */}
                {property.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(0);
                        setShowImageModal(true);
                      }}
                      className="px-4 py-2 bg-white text-gray-900 font-medium rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 text-sm"
                    >
                      View all {property.images.length} photos
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop/Tablet: 2 Column Layout */}
            <div className="hidden md:grid h-full grid-cols-2 gap-2">
              {/* Left Column - Single Large Photo */}
              <div
                className="relative cursor-pointer group overflow-hidden"
                onClick={() => {
                  setSelectedImage(0);
                  setShowImageModal(true);
                }}
              >
                <img
                  src={property.images[0]?.image_url}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = property.images[0]?.image_url || '';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Right Column - 4 Photos Grid (2x2) */}
              <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
                {[1, 2, 3, 4].map((position) => {
                  // Get photo at position (1-4), or cycle through available photos
                  let imageIndex = position;
                  let image;
                  let actualImageIndex;

                  if (imageIndex < property.images.length) {
                    image = property.images[imageIndex];
                    actualImageIndex = imageIndex;
                  } else {
                    // If we don't have enough images, cycle through available ones
                    const cycleIndex = (imageIndex - 1) % property.images.length;
                    image = property.images[cycleIndex];
                    actualImageIndex = cycleIndex;
                  }

                  const gridIndex = position - 1; // 0, 1, 2, 3 for array index

                  return (
                    <div
                      key={`right-photo-${position}`}
                      className="relative cursor-pointer group overflow-hidden"
                      style={{ minHeight: 0 }}
                      onClick={() => {
                        setSelectedImage(actualImageIndex);
                        setShowImageModal(true);
                      }}
                    >
                      {image && image.image_url && (
                        <>
                          <img
                            src={image.image_url}
                            alt={`${property.title} photo ${position + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              if (property.images[0] && property.images[0].image_url) {
                                e.target.src = property.images[0].image_url;
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      )}

                      {/* View More Photos Button - Only on bottom right photo (4th photo) */}
                      {gridIndex === 3 && property.images.length > 5 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-all duration-300 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Start from 5th photo (index 4) when opening modal
                              setSelectedImage(4);
                              setShowImageModal(true);
                            }}
                            className="px-4 py-2 bg-white text-gray-900 font-medium rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-200 text-sm"
                          >
                            View more photos
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[50vh] md:h-[70vh] bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FiHome className="w-24 h-24 mx-auto mb-4" />
              <p className="text-xl">No images available</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2 z-10">
          <button
            onClick={toggleFavorite}
            className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
          >
            <FiHeart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>
          <button
            className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: property.title,
                  text: property.description,
                  url: window.location.href
                });
              }
            }}
          >
            <FiShare2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* View All Photos Section */}
      {showAllPhotos && property.images && property.images.length > 5 && (
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">All Photos</h3>
              <button
                onClick={() => setShowAllPhotos(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {property.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  onClick={() => {
                    setSelectedImage(index);
                    setShowImageModal(true);
                  }}
                >
                  <img
                    src={image.image_url}
                    alt={`${property.title} ${index + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Description Modal */}
      {showDescriptionModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] flex items-end md:items-center justify-center backdrop-blur-sm p-0 md:p-4 animate-fadeIn"
          onClick={() => setShowDescriptionModal(false)}
        >
          <div
            className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">About this place</h2>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Close modal"
              >
                <FiX className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Description Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal - All Photos Grid */}
      {showImageModal && property.images && property.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex flex-col backdrop-blur-sm overflow-hidden"
          onClick={() => setShowImageModal(false)}
        >
          {/* Header with Close Button */}
          <div className="flex items-center justify-between p-6 z-[101] relative">
            <h2 className="text-white text-xl font-semibold">All Photos ({property.images.length})</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowImageModal(false);
              }}
              className="p-3 bg-white hover:bg-gray-100 rounded-full text-gray-900 transition-all duration-200 shadow-lg"
              aria-label="Close modal"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Grid of All Photos */}
          <div
            className="flex-1 overflow-y-auto px-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {property.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer aspect-square bg-gray-900 rounded-lg overflow-hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Optionally open full screen view of single image
                      setSelectedImage(index);
                    }}
                  >
                    <img
                      src={image.image_url}
                      alt={`${property.title} photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {index + 1} / {property.images.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Tab Navigation - Desktop Only */}
      {showStickyTabs && (
        <div className="hidden md:block fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-8 overflow-x-auto">
                <button
                  onClick={() => scrollToSection('photos')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeSection === 'photos'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => scrollToSection('description')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeSection === 'description'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection('amenities')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeSection === 'amenities'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Amenities
                </button>
                {property.rules && property.rules.length > 0 && (
                  <button
                    onClick={() => scrollToSection('rules')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeSection === 'rules'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    House Rules
                  </button>
                )}
                <button
                  onClick={() => scrollToSection('reviews')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${activeSection === 'reviews'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Reviews
                </button>
              </div>

              {!isReserveButtonInView && (
                <div className="flex items-center gap-4">
                  {bookingData.check_in_date && bookingData.check_out_date ? (
                    <div className="text-sm text-gray-900 whitespace-nowrap flex flex-col items-end">
                      <div className="font-bold text-red-600">
                        BDT {(calculateTotal() || 0).toFixed(0)}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {formatStickyDateRange()} · {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 whitespace-nowrap">
                      Add dates for prices
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleStickyBookingAction}
                    disabled={Boolean(bookingData.check_in_date && bookingData.check_out_date && availability && !availability.isAvailable)}
                    className="bg-[#E41D57] hover:bg-[#C01A4A] disabled:bg-[#E41D57] disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2 rounded-full shadow-sm whitespace-nowrap"
                  >
                    {bookingData.check_in_date && bookingData.check_out_date ? 'Reserve' : 'Check availability'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${showStickyTabs ? 'md:pt-20' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8 md:col-span-1">
            {/* Property Header - Airbnb Style */}
            <div className="space-y-4" id="section-photos">
              {/* Title */}
              <h1 className="text-base font-semibold text-gray-900 leading-tight">
                {property.title}
              </h1>

              {/* Location and Review - Same Line */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <FiMapPin className="mr-2 text-gray-400" />
                  <span className="text-sm">{property.address}, {property.city}, {property.state}</span>
                </div>
                <div className="flex items-center">
                  <FiStar className="text-yellow-400 mr-1" />
                  <span className="font-medium">{property.average_rating || 'New'}</span>
                  <span className="text-gray-500 ml-1">({property.total_reviews} reviews)</span>
                </div>
              </div>

              {/* Property Entities - Guest, Bedroom, Bathroom */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center">
                  <FiUsers className="mr-1 text-gray-400" />
                  <span>Up to {property.max_guests} guests</span>
                </div>
                <div className="flex items-center">
                  <FiHome className="mr-1 text-gray-400" />
                  <span>{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center">
                  <FiDroplet className="mr-1 text-gray-400" />
                  <span>{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Host Summary (Clickable) */}
            <div
              className="py-6 border-y border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors -mx-4 px-4 sm:mx-0 sm:px-0 sm:rounded-lg sm:hover:bg-transparent"
              onClick={() => scrollToSection('host')}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {property.owner_profile_image ? (
                    <img
                      src={property.owner_profile_image}
                      alt={`${property.owner_first_name} ${property.owner_last_name}`}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-[#222222] rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {property.owner_first_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {property.owner_is_superhost && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                      <div className="bg-[#E41D57] rounded-full p-1">
                        <FiShield className="w-3 h-3 text-white fill-current" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[#222222] text-base">
                    Hosted by {property.owner_first_name}
                  </h3>
                  <div className="text-gray-500 text-sm">
                    {property.owner_is_superhost ? 'Superhost · ' : ''}
                    {property.owner_joined_at
                      ? `${Math.floor((new Date() - new Date(property.owner_joined_at)) / (1000 * 60 * 60 * 24 * 30))} months hosting`
                      : 'New Host'}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-8" id="section-description">
              <h3 className="text-xl font-semibold mb-4">About this place</h3>
              <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                {property.description && property.description.length > 300
                  ? `${property.description.substring(0, 300)}...`
                  : property.description}
              </p>
              {property.description && property.description.length > 300 && (
                <button
                  onClick={() => setShowDescriptionModal(true)}
                  className="mt-4 text-gray-900 hover:text-gray-700 font-medium underline"
                >
                  Show more
                </button>
              )}
            </div>

            {/* Amenities */}
            <div className="border-t pt-4 md:pt-8" id="section-amenities">
              <h3 className="text-xl font-semibold mb-4 md:mb-6">What this place offers</h3>
              <div className="grid grid-cols-3 md:grid-cols-2 gap-3">
                {property.amenities?.slice(0, showAllAmenities ? property.amenities.length : 10).map((amenity) => {
                  const IconElement = getAmenityIcon(amenity.name, amenity.category);
                  return (
                    <div key={amenity.id} className="flex items-center py-1">
                      <div className="text-gray-600 mr-2 flex-shrink-0 text-sm">
                        {React.cloneElement(IconElement, { className: 'w-4 h-4' })}
                      </div>
                      <span className="text-gray-700 text-[0.7rem]">{amenity.name}</span>
                    </div>
                  );
                })}
              </div>
              {property.amenities?.length > 10 && (
                <button
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="mt-4 text-gray-900 hover:text-gray-700 font-medium underline"
                >
                  {showAllAmenities ? 'Show less' : `Show all ${property.amenities.length} amenities`}
                </button>
              )}
            </div>

            {/* Property Rules */}
            {property.rules && property.rules.length > 0 && (
              <div className="border-t pt-8" id="section-rules">
                <h3 className="text-xl font-semibold mb-6">House rules</h3>
                <div className="space-y-4">
                  {property.rules.map((rule, index) => (
                    <div key={index} className="flex items-start">
                      <div className="text-gray-600 mr-3 mt-1">
                        {rule.is_mandatory ? <FiCheck className="text-green-600" /> : <FiX className="text-red-500" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{rule.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Booking Sidebar - Contact Host Style */}
          <div className="hidden md:block lg:col-span-1" id="section-reserve" ref={reserveSectionRef}>
            <div className="sticky" style={{ top: showStickyTabs ? 150 : 32 }}>
              <div className="bg-white border text-center border-gray-200 rounded-xl shadow-xl p-6 property-detail-booking-form">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 text-left">
                    <div className="text-2xl font-bold text-[#222222] mb-1">
                      {calculateNights() > 0 ? `BDT ${calculateTotal()}` : `BDT ${property.base_price}`}
                      <span className="text-base font-normal text-gray-500"> {calculateNights() > 0 ? `for ${calculateNights()} nights` : ' per night'}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Widget Inputs */}
                <div className="relative">
                  <div className="border border-gray-400 rounded-lg overflow-hidden mb-4">
                    <div ref={datePickerTriggerRef} className="grid grid-cols-2 border-b border-gray-400" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
                      <div className="p-3 border-r border-gray-400 hover:bg-gray-50 cursor-pointer text-left">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">Check-in</div>
                        <div className="text-sm text-gray-700 truncate">{formatDate(bookingData.check_in_date) || 'Add date'}</div>
                      </div>
                      <div className="p-3 hover:bg-gray-50 cursor-pointer text-left">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">Checkout</div>
                        <div className="text-sm text-gray-700 truncate">{formatDate(bookingData.check_out_date) || 'Add date'}</div>
                      </div>
                    </div>
                    <div ref={guestPickerTriggerRef} className="p-3 hover:bg-gray-50 cursor-pointer relative text-left" onClick={() => setIsGuestPickerOpen(!isGuestPickerOpen)}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-800">Guests</div>
                          <div className="text-sm text-gray-700">
                            {bookingData.number_of_guests} guest{bookingData.number_of_guests !== 1 ? 's' : ''}
                            {bookingData.number_of_infants > 0 ? `, ${bookingData.number_of_infants} infant${bookingData.number_of_infants !== 1 ? 's' : ''}` : ''}
                          </div>
                        </div>
                        <FiChevronDown className={`w-5 h-5 text-gray-700 transition-transform ${isGuestPickerOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {isDatePickerOpen && (
                    <div ref={datePickerRef} className="absolute right-0 top-[-20px] z-50 p-4 bg-white rounded-2xl border border-gray-200 max-w-[90vw] animate-fadeIn cursor-default text-left origin-top-right shadow-2xl">
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
                                  .custom-calendar .react-datepicker__day--blocked {
                                      color: #dddddd !important;
                                      text-decoration: line-through;
                                      pointer-events: none;
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
                          selected={bookingData.check_in_date ? parseDateLocal(bookingData.check_in_date) : null}
                          onChange={(dates) => {
                            const [start, end] = dates;
                            setBookingData({
                              ...bookingData,
                              check_in_date: formatDateLocal(start) || null,
                              check_out_date: formatDateLocal(end) || null
                            });
                            if (end) setIsDatePickerOpen(false);
                          }}
                          startDate={bookingData.check_in_date ? parseDateLocal(bookingData.check_in_date) : null}
                          endDate={bookingData.check_out_date ? parseDateLocal(bookingData.check_out_date) : null}
                          selectsRange
                          minDate={new Date()}
                          filterDate={(date) => !isDateBlocked(date)}
                          dayClassName={getDayClassName}
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
                            <path fillRule="evenodd" d="M19 6H5a3 3 0 00-3 3v8a3 3 0 003 3h14a3 3 0 003-3V9a3 3 0 00-3-3zm-1.5 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm13.5-5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm-4 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => {
                              setBookingData({ ...bookingData, check_in_date: null, check_out_date: null });
                            }}
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

                  {/* Guest Picker Dropdown */}
                  {isGuestPickerOpen && (
                    <div ref={guestPickerRef} className="mb-4 bg-white border border-gray-200 rounded-lg p-6 shadow-xl absolute w-full left-0 z-20 cursor-default top-[100%] -mt-[85px]">
                      <div className="space-y-6">
                        {/* Adults (mapped to total guests for simplicity in this flat structure) */}
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-[#222222]">Guests</div>
                            <div className="text-sm text-gray-500">Age 13+</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              className={`w-8 h-8 rounded-full border flex items-center justify-center ${bookingData.number_of_guests <= 1 ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'}`}
                              disabled={bookingData.number_of_guests <= 1}
                              onClick={() => setBookingData({ ...bookingData, number_of_guests: bookingData.number_of_guests - 1 })}
                            >-</button>
                            <span className="w-4 text-center text-[#222222]">{bookingData.number_of_guests}</span>
                            <button
                              className={`w-8 h-8 rounded-full border flex items-center justify-center ${bookingData.number_of_guests >= property.max_guests ? 'border-gray-200 text-gray-200 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'}`}
                              disabled={bookingData.number_of_guests >= property.max_guests}
                              onClick={() => setBookingData({ ...bookingData, number_of_guests: bookingData.number_of_guests + 1 })}
                            >+</button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                          This place has a maximum of {property.max_guests || 4} guests.
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    ref={reserveSubmitBtnRef}
                    onClick={handleBookingSubmit}
                    disabled={!bookingData.check_in_date || !bookingData.check_out_date}
                    className={`w-full font-bold py-3.5 rounded-lg transition-colors mb-4 bg-[#E41D57] text-white ${(!bookingData.check_in_date || !bookingData.check_out_date)
                      ? 'cursor-not-allowed opacity-100'
                      : 'hover:bg-[#D90B45]'
                      }`}
                  >
                    Reserve
                  </button>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium underline"
                  >
                    <FiFlag className="w-4 h-4" />
                    Report this listing
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border-t" id="section-reviews">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Review Summary Header - Airbnb Horizontal Design */}
          <div className="mb-12 border-b border-gray-200 pb-12">
            <h3 className="flex items-center text-[2rem] font-extrabold text-[#222222] mb-10 tracking-tight">
              <FiStar className="text-[#222222] w-8 h-8 fill-current mr-3" />
              <span className="mr-3">{property.average_rating ? parseFloat(property.average_rating).toFixed(2) : 'New'}</span>
              <span className="mx-3 text-4xl leading-none" style={{ marginTop: '-4px' }}>·</span>
              <span className="text-[2rem]">{property.total_reviews} {property.total_reviews === 1 ? 'review' : 'reviews'}</span>
            </h3>

            <div className="flex flex-col lg:flex-row lg:items-center gap-10 overflow-x-auto pb-4">
              {/* Overall Rating Distribution */}
              <div className="w-full lg:w-[320px] flex-shrink-0 lg:border-r border-gray-200 lg:pr-10">
                <div className="text-sm font-semibold text-[#222222] mb-6">Overall rating</div>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = property.review_distribution?.[rating] || 0;
                    const total = property.total_reviews || 1;
                    const percentage = (count / total) * 100;
                    return (
                      <div key={rating} className="flex items-center gap-4 group">
                        <span className="text-xs text-[#222222] font-semibold w-1.5">{rating}</span>
                        <div className="flex-1 h-1.5 bg-[#DDDDDD] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#222222] rounded-full transition-all duration-700 ease-out group-hover:bg-black"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Scores - Horizontal Strip */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8 lg:gap-0 lg:ml-2">
                {[
                  { label: 'Cleanliness', score: property.review_scores?.cleanliness, icon: FiDroplet },
                  { label: 'Accuracy', score: property.review_scores?.accuracy, icon: FiCheck },
                  { label: 'Check-in', score: property.review_scores?.check_in, icon: FiKey },
                  { label: 'Communication', score: property.review_scores?.communication, icon: FiMessageSquare },
                  { label: 'Location', score: property.review_scores?.location, icon: FiMapPin },
                  { label: 'Value', score: property.review_scores?.value, icon: FiTag },
                ].map((category, index, array) => (
                  <div key={category.label} className={`flex flex-col h-full ${index !== array.length - 1 ? 'lg:border-r border-gray-200' : ''} px-2 lg:px-6 first:pl-0 pt-2`}>
                    <div className="text-sm font-semibold text-[#222222] mb-1">{category.label}</div>
                    <div className="text-lg font-bold text-[#222222] mb-auto">
                      {category.score ? parseFloat(category.score).toFixed(1) : parseFloat(property.average_rating || 0).toFixed(1)}
                    </div>
                    <div className="mt-8 text-[#222222]">
                      <category.icon className="w-8 h-8 stroke-[2px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                {reviewsData.reviews.slice(0, 4).map((review) => (
                  <div key={review.id} className="flex flex-col gap-4">
                    {/* Reviewer Info */}
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {review.profile_image ? (
                          <img
                            src={review.profile_image}
                            alt={`${review.first_name} ${review.last_name}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#222222] rounded-full flex items-center justify-center text-white text-lg font-semibold">
                            {review.first_name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#222222] text-base">
                          {review.first_name}
                        </h4>
                        <div className="text-sm text-gray-500">
                          {review.guest_location || 'Guest'}
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className={`w-3 h-3 ${i < review.rating ? 'text-[#222222] fill-current' : 'text-[#222222]'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-[#222222]">·</span>
                        <span className="text-sm font-semibold text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                        {review.stay_duration && (
                          <>
                            <span className="text-sm font-semibold text-[#222222]">·</span>
                            <span className="text-sm text-gray-500">Stayed {review.stay_duration}</span>
                          </>
                        )}
                      </div>

                      <p className="text-[#222222] leading-6 text-base line-clamp-4">
                        {review.comment}
                      </p>
                      {review.comment && review.comment.length > 180 && (
                        <button className="mt-2 font-semibold underline text-[#222222] flex items-center gap-1">
                          Show more <FiChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Show All Reviews Button */}
              {reviewsData.reviews.length > 4 && (
                <div className="mt-12">
                  <button
                    onClick={() => setShowReviewsModal(true)}
                    className="px-8 py-3.5 rounded-lg border border-black text-black text-base font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Show all {reviewsData.reviews.length} reviews
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No reviews (yet)</p>
            </div>
          )}
        </div>
      </div>



      {/* Location Section */}
      <div className="w-full border-t border-gray-200" id="section-location">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <h2 className="text-xl lg:text-2xl font-bold text-[#222222] mb-6">Where you'll be</h2>
          <div className="h-[240px] md:h-[320px] lg:h-[480px] w-full rounded-xl overflow-hidden shadow-sm border border-gray-200 relative z-0">
            <PropertyMap properties={[property]} detailView={true} />
          </div>
          <div className="mt-6">
            <h3 className="font-semibold text-[#222222] text-lg">{property.city}, {property.state}</h3>
            <p className="mt-2 text-gray-600 max-w-3xl">
              Very dynamic and appreciated area. We will send you the exact location once your booking is confirmed.
            </p>
          </div>
        </div>
      </div>

      {/* Host Profile Section - Below Reviews */}
      <div className="w-full border-t border-gray-200 bg-[#F0EFE9]/30" id="section-host">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-[#222222] mb-8">Meet your host</h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Card */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-8 shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-[#DDDDDD] flex flex-row items-center justify-between gap-4 lg:flex-col lg:items-center lg:text-center">
                {/* Avatar & Badge */}
                <div className="relative">
                  {property.owner_profile_image ? (
                    <img
                      src={property.owner_profile_image}
                      alt={property.owner_first_name}
                      className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-[#222222] rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {property.owner_first_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  {property.owner_is_superhost && (
                    <div className="absolute bottom-0 right-0 lg:bottom-2 lg:right-2 bg-[#E41D57] text-white rounded-full p-2 border-4 border-white">
                      <FiShield className="w-4 h-4 lg:w-6 lg:h-6 fill-current" />
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-[#222222] mb-1">
                    {property.owner_first_name}
                  </h3>
                  {property.owner_is_superhost && (
                    <div className="flex items-center justify-start lg:justify-center gap-2 text-[#222222] font-semibold text-sm">
                      <FiShield className="w-3 h-3 fill-current" />
                      Superhost
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="hidden lg:flex w-full items-center justify-center gap-12 mt-4 border-t border-gray-100 pt-6">
                  <div>
                    <div className="text-2xl font-bold text-[#222222]">
                      {property.total_reviews || 0}
                    </div>
                    <div className="text-xs font-semibold text-[#222222] mt-1">Reviews</div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-[#222222] flex items-center gap-1">
                      {parseFloat(property.average_rating || 0).toFixed(1)} <FiStar className="w-3 h-3 fill-current" />
                    </div>
                    <div className="text-xs font-semibold text-[#222222] mt-1">Rating</div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-[#222222]">
                      {property.owner_joined_at
                        ? Math.ceil((new Date() - new Date(property.owner_joined_at)) / (1000 * 60 * 60 * 24 * 30))
                        : 1}
                    </div>
                    <div className="text-xs font-semibold text-[#222222] mt-1">Months hosting</div>
                  </div>
                </div>
              </div>

              {/* Mobile Only Stats Row */}
              <div className="lg:hidden mt-6 flex items-center gap-6">
                <div className="flex-1">
                  <div className="text-xl font-bold text-[#222222]">
                    {property.total_reviews || 0}
                  </div>
                  <div className="text-xs text-gray-500">Reviews</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-[#222222] flex items-center gap-1">
                    {parseFloat(property.average_rating || 0).toFixed(1)} <FiStar className="w-3 h-3 fill-current" />
                  </div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
                <div className="w-px h-8 bg-gray-200"></div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-[#222222]">
                    {property.owner_joined_at
                      ? Math.ceil((new Date() - new Date(property.owner_joined_at)) / (1000 * 60 * 60 * 24 * 30))
                      : 1}
                  </div>
                  <div className="text-xs text-gray-500">Months hosting</div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {property.owner_school && (
                  <div className="flex items-start gap-3 text-[#222222]">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '24px', width: '24px', fill: 'currentcolor' }}><path d="M26 2v10h-2V4H8v24h8v2H6V2h20zM14 24h-4v-4h4v4zm16 2v4H18v-4h12zM28 28H20v-2h8v2zm-14-6h-4v-4h4v4zm6-2V8H12V6h8v14zm-2-8h-4V8h4v4z"></path></svg>
                    <span>Where I went to school: {property.owner_school}</span>
                  </div>
                )}
                {property.owner_work && (
                  <div className="flex items-start gap-3 text-[#222222]">
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '24px', width: '24px', fill: 'currentcolor' }}><path d="M24 2a2 2 0 0 1 1.995 1.85L26 4v22a2 2 0 0 1-1.85 1.995L24 28H8a2 2 0 0 1-1.995-1.85L6 26V4a2 2 0 0 1 1.85-1.995L8 2h16zM13 18H9v2h4v-2zm-4 4v2h4v-2H9zm8-4h-4v2h4v-2zm0 4h-4v2h4v-2zm8-4h-4v2h4v-2zm0 4h-4v2h4v-2zM24 4H8v22h16V4z"></path></svg>
                    <span>My work: {property.owner_work}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Details */}
            <div className="lg:col-span-7 lg:col-start-6">
              <h3 className="text-xl font-bold text-[#222222] mb-4">
                {property.owner_is_superhost ? `${property.owner_first_name} is a Superhost` : `About ${property.owner_first_name}`}
              </h3>

              {property.owner_is_superhost && (
                <div className="mb-6 text-[#222222] font-light">
                  Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                </div>
              )}

              <div className="space-y-6">
                <div className="text-[#222222] leading-relaxed whitespace-pre-line font-light">
                  {property.owner_bio || `Hi! I'm ${property.owner_first_name}. I love hosting guests from around the world and sharing my local knowledge.`}
                </div>

                {property.owner_languages && (
                  <div className="pt-2">
                    <span className="font-semibold text-[#222222]">Languages:</span>
                    <span className="ml-2 font-light">{JSON.parse(property.owner_languages).join(', ')}</span>
                  </div>
                )}

                <div className="pt-4">
                  <h4 className="font-semibold text-[#222222] mb-1">Host details</h4>
                  <div className="text-[#222222] font-light">Response rate: 100%</div>
                  <div className="text-[#222222] font-light">Responds within an hour</div>
                </div>

                <button
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (bookingData.check_in_date) params.append('check_in_date', bookingData.check_in_date);
                    if (bookingData.check_out_date) params.append('check_out_date', bookingData.check_out_date);
                    if (bookingData.number_of_guests) params.append('guests', bookingData.number_of_guests);
                    navigate(`/properties/${property.id}/contact-host?${params.toString()}`);
                  }}
                  className="bg-[#222222] hover:bg-black text-white px-6 py-3 rounded-lg font-semibold transition-colors mt-4"
                >
                  Message host
                </button>

                <div className="pt-8 border-t border-gray-200 flex gap-3 items-center">
                  <FiShield className="w-5 h-5 text-gray-400 fill-transparent stroke-[1.5px]" />
                  <span className="text-xs text-gray-500">
                    To help protect your payment, always use Airbnb to send money and communicate with hosts.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Reserve Button - Fixed at Bottom */}
      {
        !showMobileReserveForm && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xl font-bold text-red-600">BDT {property.base_price || 0}</span>
                <span className="text-gray-600 ml-1 text-sm">/ night</span>
              </div>
              <button
                onClick={() => setShowMobileReserveForm(true)}
                className="bg-[#E41D57] hover:bg-[#E41D57] text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex-shrink-0"
              >
                Reserve
              </button>
            </div>
          </div>
        )
      }

      {/* Mobile Booking Form - Fixed at Bottom (Animated) */}
      {/* Mobile Booking Form - Fixed Full Screen with Sticky Footer */}
      {
        showMobileReserveForm && (
          <div className="md:hidden fixed inset-0 z-[100] bg-white shadow-lg animate-slideUp flex flex-col property-detail-booking-form">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
              <div>
                <span className="text-xl font-bold text-red-600">BDT {property.base_price || 0}</span>
                <span className="text-gray-600 ml-1 text-sm">/ night</span>
              </div>
              <button
                onClick={() => setShowMobileReserveForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Close form"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <form id="mobile-reserve-form" onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">
                    Check-in & Check-out
                  </label>
                  <div className="relative" ref={mobileReserveDateContainerRef}>
                    <button
                      type="button"
                      onClick={() => setIsMobileReserveDatePickerOpen(true)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    >
                      {bookingData.check_in_date && bookingData.check_out_date
                        ? `${parseDateLocal(bookingData.check_in_date).toLocaleDateString()} - ${parseDateLocal(bookingData.check_out_date).toLocaleDateString()}`
                        : 'Add dates'}
                    </button>

                    {isMobileReserveDatePickerOpen && (
                      <div className="mt-3">
                        <DatePicker
                          selected={bookingData.check_in_date ? parseDateLocal(bookingData.check_in_date) : null}
                          onChange={(dates) => {
                            const [start, end] = dates;
                            setBookingData({
                              ...bookingData,
                              check_in_date: formatDateLocal(start) || null,
                              check_out_date: formatDateLocal(end) || null
                            });
                            if (end) {
                              setIsMobileReserveDatePickerOpen(false);
                            }
                          }}
                          startDate={bookingData.check_in_date ? parseDateLocal(bookingData.check_in_date) : null}
                          endDate={bookingData.check_out_date ? parseDateLocal(bookingData.check_out_date) : null}
                          selectsRange
                          minDate={new Date()}
                          filterDate={(date) => !isDateBlocked(date)}
                          dayClassName={getDayClassName}
                          inline
                          calendarClassName="mobile-date-picker-calendar"
                          shouldCloseOnSelect={false}
                          monthsShown={1}
                          dateFormat="MMM dd, yyyy"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Guests</label>
                  <select
                    value={bookingData.number_of_guests}
                    onChange={(e) => setBookingData({ ...bookingData, number_of_guests: parseInt(e.target.value) })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {[...Array(property.max_guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </div>

                {availability && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${availability.isAvailable
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {availability.isAvailable ? '✓ Available for selected dates' : '✗ Not available for selected dates'}
                  </div>
                )}

                {/* Extra spacing for better scrolling experience */}
                <div className="h-20"></div>
              </form>
            </div>

            {/* Footer - Fixed Bottom */}
            <div className="border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
              <div className="flex items-center justify-between gap-4">
                {bookingData.check_in_date && bookingData.check_out_date && calculateNights() > 0 ? (
                  <>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-red-600">BDT {(calculateTotal() || 0).toFixed(0)}</span>
                      <span className="text-xs text-gray-500 underline">Total for {calculateNights()} nights</span>
                    </div>
                    <button
                      type="submit"
                      form="mobile-reserve-form"
                      disabled={!bookingData.check_in_date || !bookingData.check_out_date || (availability && !availability.isAvailable)}
                      className="bg-[#E41D57] hover:bg-[#E41D57] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex-shrink-0"
                    >
                      Reserve
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    form="mobile-reserve-form"
                    disabled={!bookingData.check_in_date || !bookingData.check_out_date || (availability && !availability.isAvailable)}
                    className="w-full bg-[#E41D57] hover:bg-[#E41D57] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    Check availability
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      }

      <ReportListingModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        propertyTitle={property.title}
        propertyId={property.id}
      />

      {/* Reviews Modal */}
      {
        showReviewsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowReviewsModal(false)}
            />
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-fadeIn relative">
              <button
                onClick={() => setShowReviewsModal(false)}
                className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
              >
                <FiX className="w-5 h-5 text-gray-900" />
              </button>

              <div className="flex h-full">
                {/* Left Sidebar (Stats) - Hidden on mobile */}
                <div className="hidden md:flex flex-col w-[360px] p-8 pt-16 border-r border-gray-200 overflow-y-auto">
                  <div className="flex items-center gap-3 mb-8">
                    <FiStar className="w-8 h-8 text-[#222222] fill-current" />
                    <span className="text-[2rem] font-extrabold text-[#222222]">{parseFloat(property.average_rating || 0).toFixed(2)}</span>
                  </div>

                  {/* Distribution */}
                  <div className="space-y-3 mb-8">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = property.review_distribution?.[rating] || 0;
                      const total = property.total_reviews || 1;
                      const percentage = (count / total) * 100;
                      return (
                        <div key={rating} className="flex items-center gap-4">
                          <span className="text-xs text-[#222222] font-semibold w-2">{rating}</span>
                          <div className="flex-1 h-1.5 bg-[#DDDDDD] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#222222] rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Categories */}
                  <div className="space-y-4">
                    {[
                      { label: 'Cleanliness', score: property.review_scores?.cleanliness, icon: FiDroplet },
                      { label: 'Accuracy', score: property.review_scores?.accuracy, icon: FiCheck },
                      { label: 'Check-in', score: property.review_scores?.check_in, icon: FiKey },
                      { label: 'Communication', score: property.review_scores?.communication, icon: FiMessageSquare },
                      { label: 'Location', score: property.review_scores?.location, icon: FiMapPin },
                      { label: 'Value', score: property.review_scores?.value, icon: FiTag },
                    ].map((category) => (
                      <div key={category.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[#222222]">
                          <category.icon className="w-6 h-6 stroke-[1.5px]" />
                          <span className="text-sm font-medium">{category.label}</span>
                        </div>
                        <span className="text-sm font-bold text-[#222222]">
                          {category.score ? parseFloat(category.score).toFixed(1) : parseFloat(property.average_rating || 0).toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Content (Review List) */}
                <div className="flex-1 flex flex-col h-full bg-white relative">
                  {/* Header */}
                  <div className="p-6 pb-2 pt-16 md:pt-6">
                    <h3 className="text-2xl font-bold text-[#222222] mb-6">
                      {property.total_reviews} reviews
                    </h3>
                    <div className="relative">
                      <FiSearch className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search reviews"
                        className="w-full bg-gray-100 rounded-full py-3 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black border-none"
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto p-6 pt-0">
                    <div className="space-y-8 mt-4">
                      {(reviewsData.reviews || []).map((review) => (
                        <div key={review.id} className="border-b border-gray-100 pb-8 last:border-b-0">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-shrink-0">
                              {review.profile_image ? (
                                <img src={review.profile_image} className="w-12 h-12 rounded-full object-cover" alt="" />
                              ) : (
                                <div className="w-12 h-12 bg-[#222222] rounded-full flex items-center justify-center text-white font-bold">
                                  {review.first_name?.[0]}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#222222]">{review.first_name}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{review.guest_location || 'Guest'}</span>
                                <span>·</span>
                                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mb-2 flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} className={`w-3 h-3 ${i < review.rating ? 'text-[#222222] fill-current' : 'text-[#222222]'}`} />
                            ))}
                          </div>
                          <p className="text-[#222222] leading-relaxed whitespace-pre-line">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default PropertyDetail;
