import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiLogOut, FiSettings, FiHeart, FiBookOpen, FiChevronDown, FiDollarSign, FiChevronLeft, FiMinus, FiPlus, FiMapPin, FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useQuery } from 'react-query';
import useSettingsStore from '../../store/settingsStore';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';
import FlightSearchForm from '../search/FlightSearchForm';

const StickySearchHeader = ({
  alwaysSticky = false,
  initialLocation = '',
  initialCheckInDate = null,
  initialCheckOutDate = null,
  initialGuests = 1,

  isVisible = true,
  showBackButton = false,
  initialPropertyType = ''
}) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showDesktopExpanded, setShowDesktopExpanded] = useState(false);
  const [desktopActiveSection, setDesktopActiveSection] = useState(null);
  const [desktopHoverSection, setDesktopHoverSection] = useState(null);
  const [desktopActivePillStyle, setDesktopActivePillStyle] = useState({ x: 0, w: 0, visible: false });
  const [mobileSearchStep, setMobileSearchStep] = useState('location'); // 'location', 'dates', 'guests'
  const [isMobileDatesPickerOpen, setIsMobileDatesPickerOpen] = useState(false);
  const dropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchPillRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const headerOuterRef = useRef(null);
  const desktopPillSegmentsRef = useRef(null);
  const whereBtnRef = useRef(null);
  const whenBtnRef = useRef(null);
  const whoBtnRef = useRef(null);
  const mobileDatePickerRef = useRef(null);
  const mobileDatesContainerRef = useRef(null);
  const { settings } = useSettingsStore();
  const { user, isAuthenticated, isAdmin, isPropertyOwner, logout } = useAuthStore();
  const location = useLocation();

  // Load search state from localStorage on mount
  const loadSearchState = () => {
    try {
      const saved = localStorage.getItem('searchState');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          location: parsed.location || '',
          checkIn: parsed.checkIn ? new Date(parsed.checkIn) : null,
          checkOut: parsed.checkOut ? new Date(parsed.checkOut) : null,
          guests: parsed.guests || 1,
          propertyType: parsed.propertyType || ''
        };
      }
    } catch (error) {
      console.error('Error loading search state:', error);
    }
    return {
      location: '',
      checkIn: null,
      checkOut: null,
      guests: 1,
      propertyType: ''
    };
  };

  const [searchData, setSearchData] = useState(loadSearchState);
  const [activePropertyType, setActivePropertyType] = useState(initialPropertyType || searchData.propertyType || '');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Flight Search State
  const [flightSearchData, setFlightSearchData] = useState(() => {
    const params = new URLSearchParams(location.search);
    const urlTripType = params.get('tripType');
    return {
      from: 'Dhaka', fromCode: 'DAC', fromFull: 'DAC, Hazrat Shahjalal International Airport',
      to: "Cox's Bazar", toCode: 'CXB', toFull: "CXB, Cox's Bazar Airport",
      departDate: new Date('2026-02-12'),
      returnDate: null,
      travelers: 1,
      adults: 1,
      children: 0,
      kids: 0,
      infants: 0,
      flightClass: 'Economy',
      tripType: urlTripType || 'oneWay',
      legs: [
        { id: 1, from: 'Dhaka', fromCode: 'DAC', fromFull: 'DAC, Hazrat Shahjalal International Airport', to: "Cox's Bazar", toCode: 'CXB', toFull: "CXB, Cox's Bazar Airport", date: null },
        { id: 2, from: "Cox's Bazar", fromCode: 'CXB', fromFull: "CXB, Cox's Bazar Airport", to: 'Dhaka', toCode: 'DAC', toFull: 'DAC, Hazrat Shahjalal International Airport', date: null }
      ]
    };
  });
  const [flightActiveSection, setFlightActiveSection] = useState(null); // 'from', 'to', 'depart', 'return', 'travelers'
  const [airportList, setAirportList] = useState([]);

  // Fetch airport list from public directory
  useEffect(() => {
    fetch('/data/airportlist.json')
      .then(res => res.json())
      .then(data => {
        setAirportList(Object.values(data));
      })
      .catch(err => console.error('Failed to load airports:', err));
  }, []);

  const getAirportSuggestions = (input) => {
    if (!input || typeof input !== 'string' || input.length < 2) return [];
    const lower = input.toLowerCase();

    // Also handle matching the "City (CODE)" format
    return airportList.filter(a => {
      if (!a) return false;
      const combined = `${a.shortName} (${a.code})`.toLowerCase();
      return (
        (a.code && a.code.toLowerCase().includes(lower)) ||
        (a.name && a.name.toLowerCase().includes(lower)) ||
        (a.shortName && a.shortName.toLowerCase().includes(lower)) ||
        combined.includes(lower)
      );
    }).slice(0, 10);
  };

  // Fetch distinct property locations for suggestions (cached globally)
  const { data: locationSuggestionsData } = useQuery(
    'property-locations',
    () => api.get('/properties/locations/list'),
    {
      select: (response) => response.data?.data?.locations || [],
    }
  );

  // Fetch property types
  const { data: propertyTypes } = useQuery(
    'home-property-types',
    () => api.get('/properties/property-types/list'),
    {
      select: (response) => {
        const types = (response.data?.data?.propertyTypes || []).filter(pt => pt.is_active !== false);
        // Manually inject Flight if not present
        if (!types.find(t => t.name.toLowerCase() === 'flight')) {
          types.push({ id: 9999, name: 'Flight', is_active: true });
        }
        return types;
      },
    }
  );

  const getTypeIcon = (typeName, isActive = false) => {
    const normalized = (typeName || '').toLowerCase();

    let imgSrc = '/images/nav-icon-room.png'; // Default fallback

    if (normalized.includes('apartment') || normalized.includes('villa') || normalized.includes('house') || normalized.includes('home')) {
      imgSrc = '/images/nav-icon-apartment.png';
    } else if (normalized.includes('hotel')) {
      imgSrc = '/images/nav-icon-hotel.png';
    } else if (normalized.includes('flight')) {
      return (
        <span className="text-2xl">✈️</span>
      );
    }

    return (
      <img
        src={imgSrc}
        alt={typeName}
        className={`w-8 h-8 object-contain transition-all duration-300 ${isActive
          ? 'opacity-100 grayscale-0'
          : 'opacity-70 grayscale'
          }`}
      />
    );
  };

  // Prevent body scroll when mobile search is open
  useEffect(() => {
    if (showMobileSearch) {
      document.body.classList.add('mobile-search-open');
      // Prevent scroll on background
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('mobile-search-open');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('mobile-search-open');
      document.body.style.overflow = '';
    };
  }, [showMobileSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowMobileSearch(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
      // Close if clicking outside the search pill, even if clicking inside the header background
      if (
        searchPillRef.current &&
        !searchPillRef.current.contains(event.target) &&
        !event.target.closest('.react-datepicker-popper') &&
        !event.target.closest('.react-datepicker') &&
        !(headerOuterRef.current && headerOuterRef.current.contains(event.target))
      ) {
        setDesktopActiveSection(null);
        setDesktopHoverSection(null);
        // Only clear flight active section if not handled by precise check below
        if (!flightActiveSection) {
          setFlightActiveSection(null);
        }
      }

      // Precise click-outside check for active flight section
      if (flightActiveSection) {
        const activeEl = document.querySelector(`[data-section-id="${flightActiveSection}"]`);
        if (activeEl && !activeEl.contains(event.target) && !event.target.closest('.react-datepicker-popper') && !event.target.closest('.react-datepicker')) {
          setFlightActiveSection(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updatePill = () => {
      const section = desktopHoverSection || desktopActiveSection;
      const container = desktopPillSegmentsRef.current;
      const target =
        section === 'location'
          ? whereBtnRef.current
          : section === 'dates'
            ? whenBtnRef.current
            : section === 'guests'
              ? whoBtnRef.current
              : null;

      if (!section || !container || !target) {
        setDesktopActivePillStyle((prev) => ({ ...prev, visible: false }));
        return;
      }

      const c = container.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      const x = Math.max(0, t.left - c.left);
      const w = Math.max(0, t.width);
      setDesktopActivePillStyle({ x, w, visible: true });
    };

    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [desktopHoverSection, desktopActiveSection]);

  const getRoleBasedMenu = () => {
    if (isAdmin()) {
      return [
        { name: 'Admin Dashboard', path: '/admin', icon: FiSettings },
        { name: 'Users', path: '/admin/users', icon: FiUser },
        { name: 'Properties', path: '/admin/properties', icon: FiBookOpen },
        { name: 'Amenities', path: '/admin/amenities', icon: FiSettings },
        { name: 'Bookings', path: '/admin/bookings', icon: FiBookOpen },
        { name: 'Reviews', path: '/admin/reviews', icon: FiHeart },
        { name: 'Analytics', path: '/admin/analytics', icon: FiSettings },
        { name: 'Accounting', path: '/admin/accounting', icon: FiDollarSign },
        { name: 'Earnings', path: '/admin/earnings', icon: FiDollarSign },
        { name: 'Settings', path: '/admin/settings', icon: FiSettings },
      ];
    } else if (isPropertyOwner()) {
      return [
        { name: 'Owner Dashboard', path: '/property-owner', icon: FiSettings },
        { name: 'My Properties', path: '/property-owner/properties', icon: FiBookOpen },
        { name: 'Bookings', path: '/property-owner/bookings', icon: FiBookOpen },
        { name: 'Analytics', path: '/property-owner/analytics', icon: FiSettings },
        { name: 'Earnings', path: '/property-owner/earnings', icon: FiDollarSign },
        { name: 'Profile', path: '/property-owner/profile', icon: FiUser },
      ];
    } else if (isAuthenticated) {
      return [
        { name: 'My Dashboard', path: '/guest', icon: FiSettings },
        { name: 'My Bookings', path: '/guest/bookings', icon: FiBookOpen },
        { name: 'Favorites', path: '/guest/favorites', icon: FiHeart },
        { name: 'Profile', path: '/guest/profile', icon: FiUser },
      ];
    }
    return [];
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  // Helper function to format date in local timezone (YYYY-MM-DD) without timezone conversion
  const formatDateLocal = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    const extractCode = (val) => {
      if (!val) return '';
      const match = val.match(/\((.*?)\)/);
      return match ? match[1] : val;
    };

    if (activePropertyType === 'flight') {
      if (flightSearchData.tripType) params.append('trip_type', flightSearchData.tripType);
      if (flightSearchData.from) params.append('from', extractCode(flightSearchData.from));
      if (flightSearchData.to) params.append('to', extractCode(flightSearchData.to));
      if (searchData.checkIn) params.append('depart', formatDateLocal(searchData.checkIn));
      if (searchData.checkOut) params.append('return', formatDateLocal(searchData.checkOut));
      params.append('travelers', searchData.guests || 1);
      if (flightSearchData.flightClass) params.append('class', flightSearchData.flightClass);
    } else {
      if (searchData.location) params.append('city', searchData.location);
      if (searchData.checkIn) params.append('check_in_date', formatDateLocal(searchData.checkIn));
      if (searchData.checkOut) params.append('check_out_date', formatDateLocal(searchData.checkOut));
      if (searchData.guests) params.append('min_guests', searchData.guests);
    }

    if (activePropertyType) params.append('property_type', activePropertyType);

    // Save search state to localStorage for persistence
    const searchState = {
      location: searchData.location,
      checkIn: searchData.checkIn ? formatDateLocal(searchData.checkIn) : null,
      checkOut: searchData.checkOut ? formatDateLocal(searchData.checkOut) : null,
      guests: searchData.guests,
      propertyType: activePropertyType,
      flightSearchData: flightSearchData,
      tripType: flightSearchData.tripType
    };
    localStorage.setItem('searchState', JSON.stringify(searchState));

    navigate(`${activePropertyType === 'flight' ? '/flight/results' : '/search'}?${params.toString()}`);
  };

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Pre-fill search data if provided (e.g., from search page) or from localStorage
  useEffect(() => {
    // Priority: props > localStorage > defaults
    const saved = localStorage.getItem('searchState');
    let parsedSaved = null;
    if (saved) {
      try {
        parsedSaved = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved search state:', e);
      }
    }

    const parsedCheckIn = initialCheckInDate ? new Date(initialCheckInDate) : (parsedSaved?.checkIn ? new Date(parsedSaved.checkIn) : null);
    const parsedCheckOut = initialCheckOutDate ? new Date(initialCheckOutDate) : (parsedSaved?.checkOut ? new Date(parsedSaved.checkOut) : null);

    setSearchData({
      location: initialLocation || parsedSaved?.location || '',
      checkIn: parsedCheckIn,
      checkOut: parsedCheckOut,
      guests: initialGuests ? parseInt(initialGuests) : (parsedSaved?.guests || 1)
    });

    if (initialPropertyType !== undefined) {
      setActivePropertyType(initialPropertyType);
    }
  }, [initialLocation, initialCheckInDate, initialCheckOutDate, initialGuests, initialPropertyType]);

  // Listen for search state changes from other components (Navbar, Home)
  useEffect(() => {
    const handleStorageChange = (e) => {
      const saved = localStorage.getItem('searchState');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSearchData(prev => {
            // Only update if different to avoid unnecessary re-renders
            const newCheckIn = parsed.checkIn ? new Date(parsed.checkIn) : null;
            const newCheckOut = parsed.checkOut ? new Date(parsed.checkOut) : null;
            const newLocation = parsed.location || '';
            const newGuests = parsed.guests || 1;

            if (prev.location !== newLocation ||
              prev.checkIn?.getTime() !== newCheckIn?.getTime() ||
              prev.checkOut?.getTime() !== newCheckOut?.getTime() ||
              prev.guests !== newGuests) {
              return {
                location: newLocation,
                checkIn: newCheckIn,
                checkOut: newCheckOut,
                guests: newGuests
              };
            }
            return prev;
          });
        } catch (error) {
          console.error('Error parsing search state:', error);
        }
      }
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events (from same tab)
    window.addEventListener('searchStateUpdated', handleStorageChange);

    // Poll for changes (in case localStorage is updated directly)
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('searchStateUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Reset mobile search step when modal opens/closes
  useEffect(() => {
    if (showMobileSearch) {
      // Determine initial step based on what's filled
      if (!searchData.location) {
        setMobileSearchStep('location');
      } else if (!searchData.checkIn || !searchData.checkOut) {
        setMobileSearchStep('dates');
      } else {
        setMobileSearchStep('guests');
      }
    } else {
      setIsMobileDatesPickerOpen(false);
    }
  }, [showMobileSearch, searchData]);

  useEffect(() => {
    if (mobileSearchStep !== 'dates') {
      setIsMobileDatesPickerOpen(false);
    }
  }, [mobileSearchStep]);

  useEffect(() => {
    if (!showMobileSearch || !isMobileDatesPickerOpen) return;

    const handleOutside = (event) => {
      if (mobileDatesContainerRef.current && !mobileDatesContainerRef.current.contains(event.target)) {
        setIsMobileDatesPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [showMobileSearch, isMobileDatesPickerOpen]);

  // Hide navbar when sticky header is shown
  useEffect(() => {
    if (alwaysSticky && isVisible) {
      document.body.setAttribute('data-sticky-search', 'true');
    } else {
      document.body.removeAttribute('data-sticky-search');
    }
    return () => {
      document.body.removeAttribute('data-sticky-search');
    };
  }, [alwaysSticky, isVisible]);

  const summaryTitle = searchData.location && searchData.location.trim() !== ''
    ? searchData.location
    : 'Start your search';

  const summarySubtitle = () => {
    const parts = [];
    if (searchData.checkIn && searchData.checkOut) {
      parts.push('Dates');
    } else {
      parts.push('Dates');
    }
    parts.push(`${searchData.guests || 1} guest${(searchData.guests || 1) > 1 ? 's' : ''}`);
    return parts.join(' • ');
  };

  // Format date for display
  const formatDateDisplay = (date) => {
    if (!date) return null;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(date);
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const getDateRangeDisplay = () => {
    if (searchData.checkIn && searchData.checkOut) {
      return `${formatDateDisplay(searchData.checkIn)} - ${formatDateDisplay(searchData.checkOut)}`;
    } else if (searchData.checkIn) {
      return formatDateDisplay(searchData.checkIn);
    }
    return null;
  };

  const getLocationDisplay = () => {
    return searchData.location && searchData.location.trim() !== ''
      ? searchData.location
      : 'Anywhere';
  };

  const getDateDisplay = () => {
    const dateRange = getDateRangeDisplay();
    return dateRange || 'Anytime';
  };

  const getGuestsDisplay = () => {
    const totalGuests = searchData.guests || 1;
    return totalGuests > 1 ? `${totalGuests} guests` : 'Add guests';
  };

  const handlePropertyTypeClick = (typeName) => {
    const normalized = (typeName || '').toLowerCase();
    const newVal = activePropertyType === normalized ? '' : normalized;
    setActivePropertyType(newVal);

    if (newVal === 'flight') {
      setFlightActiveSection('from');
      return;
    }

    // Immediate search when clicking tab (for other types like stays)
    const params = new URLSearchParams();
    if (searchData.location) params.append('city', searchData.location);
    if (searchData.checkIn) params.append('check_in_date', formatDateLocal(searchData.checkIn));
    if (searchData.checkOut) params.append('check_out_date', formatDateLocal(searchData.checkOut));
    if (searchData.guests) params.append('min_guests', searchData.guests);
    if (newVal) params.append('property_type', newVal);

    // Save to localStorage
    const searchState = {
      location: searchData.location,
      checkIn: searchData.checkIn ? formatDateLocal(searchData.checkIn) : null,
      checkOut: searchData.checkOut ? formatDateLocal(searchData.checkOut) : null,
      guests: searchData.guests,
      propertyType: newVal
    };
    localStorage.setItem('searchState', JSON.stringify(searchState));

    navigate(`${activePropertyType === 'flight' ? '/flight/results' : '/search'}?${params.toString()}`);
  };

  return (
    <>
      <div
        ref={headerOuterRef}
        onClick={(e) => {
          if (searchPillRef.current?.contains(e.target) || e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('.react-datepicker')) return;
          e.stopPropagation();
          setDesktopActiveSection(null);
        }}
        className={`fixed top-0 left-0 right-0 z-[100] bg-[#F9FAFB] border-b border-gray-200 transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
          }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-full flex items-center py-1.5 md:py-0 md:h-16 relative" ref={desktopSearchRef}>
          {/* Mobile: back + search pill */}
          <div className="md:hidden w-full flex items-center justify-center px-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(-1);
                }}
                className="p-2 rounded-full bg-white border border-gray-200 shadow hover:bg-gray-50 transition"
                aria-label="Go back"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              {/* Search button - pill shaped */}
              <button
                onClick={() => setShowMobileSearch(true)}
                className="flex-1 flex items-center justify-start gap-3 bg-white rounded-full px-4 py-2.5 shadow-md text-left hover:bg-gray-50 transition-colors"
              >
                <FiSearch className="w-4 h-4 text-gray-900 flex-shrink-0" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-gray-900">{summaryTitle}</span>
                  <span className="text-xs text-gray-500">{summarySubtitle()}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Modal - Airbnb Style Stacked Cards */}
          {showMobileSearch && (
            <div className="md:hidden fixed inset-0 bg-[#F7F7F7] z-[5000] flex flex-col">
              {/* Header */}
              <div className="bg-white relative px-4 py-2 border-b border-gray-200 sticky top-0 z-20">
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 -mr-2 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors z-10"
                >
                  <FiX className="w-4 h-4 text-black" />
                </button>
                <div className="flex items-center justify-center gap-6 overflow-x-auto scrollbar-hide px-10 w-full">
                  {propertyTypes && propertyTypes.map((type) => {
                    const isActive = activePropertyType === (type.name || '').toLowerCase();
                    return (
                      <button
                        key={type.id}
                        onClick={() => setActivePropertyType((type.name || '').toLowerCase())}
                        className="flex flex-col items-center gap-2 min-w-[64px] flex-shrink-0 group cursor-pointer"
                      >
                        <div className={`transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`}>
                          {getTypeIcon(type.name, isActive)}
                        </div>
                        <span className={`text-xs font-semibold whitespace-nowrap pb-2 border-b-2 transition-all duration-200 ${isActive ? 'text-black border-black' : 'text-gray-500 border-transparent group-hover:text-gray-800'
                          }`}>
                          {type.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 space-y-4">

                {/* Where Card */}
                <div
                  className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden ${mobileSearchStep === 'location' ? 'p-6 shadow-xl border-transparent' : 'p-4 shadow-sm'}`}
                  onClick={() => setMobileSearchStep('location')}
                >
                  {mobileSearchStep === 'location' ? (
                    <div className="animate-fadeIn">
                      <h3 className="text-2xl font-bold text-black mb-4">
                        {activePropertyType === 'flight' ? 'Fly from?' : 'Where to?'}
                      </h3>
                      <div className="bg-white border rounded-xl p-3 flex items-center gap-3 shadow-sm mb-4">
                        <FiSearch className="text-black w-5 h-5 font-bold" />
                        <input
                          autoFocus
                          className="flex-1 outline-none text-base placeholder-gray-500 font-semibold bg-transparent text-black"
                          placeholder={activePropertyType === 'flight' ? 'Departure City or Airport' : 'Search destinations'}
                          value={activePropertyType === 'flight' ? (flightSearchData.from || '') : searchData.location}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (activePropertyType === 'flight') {
                              setFlightSearchData(prev => ({ ...prev, from: val }));
                            } else {
                              handleInputChange('location', val);
                              setShowLocationSuggestions(val.length > 0);
                            }
                          }}
                        />
                        {(activePropertyType === 'flight' ? flightSearchData.from : searchData.location) && (
                          <button onClick={(e) => {
                            e.stopPropagation();
                            if (activePropertyType === 'flight') {
                              setFlightSearchData(prev => ({ ...prev, from: '' }));
                            } else {
                              handleInputChange('location', '');
                            }
                          }} className="p-1 bg-gray-200 rounded-full"><FiX className="w-3 h-3 block" /></button>
                        )}
                      </div>

                      {/* Suggestions */}
                      <div className="mt-2 pl-2">
                        {activePropertyType === 'flight' ? (
                          <div className="space-y-4 max-h-64 overflow-y-auto">
                            {getAirportSuggestions(flightSearchData.from).map((a, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFlightSearchData(prev => ({ ...prev, from: `${a.shortName} (${a.code})`, fromCode: a.code }));
                                  setMobileSearchStep('destination');
                                }}
                                className="flex items-center gap-4 w-full text-left p-2 hover:bg-gray-50 rounded-lg"
                              >
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FiMapPin className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 truncate">{a.shortName}</div>
                                  <div className="text-sm text-gray-500 truncate">{a.name}</div>
                                </div>
                                <div className="text-xs font-bold text-[#E41D57]">{a.code}</div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          locationSuggestionsData && locationSuggestionsData.length > 0 && (
                            <>
                              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Suggested destinations</div>
                              <div className="space-y-4">
                                <button className="flex items-center gap-4 w-full text-left" onClick={() => handleInputChange('location', 'Nearby')}>
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><FiMapPin className="w-5 h-5" /></div>
                                  <div className="font-semibold text-gray-700">Nearby</div>
                                </button>
                                {locationSuggestionsData.slice(0, 5).map((loc, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInputChange('location', loc.city);
                                      setMobileSearchStep('dates');
                                    }}
                                    className="flex items-center gap-4 w-full text-left"
                                  >
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <FiMapPin className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">{loc.city}</div>
                                      <div className="text-sm text-gray-500">{loc.country}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-semibold">{activePropertyType === 'flight' ? 'From' : 'Where'}</span>
                      <span className="text-black font-bold">{(activePropertyType === 'flight' ? flightSearchData.from : searchData.location) || (activePropertyType === 'flight' ? 'Select origin' : "I'm flexible")}</span>
                    </div>
                  )}
                </div>

                {/* Destination Card (Flight Only) */}
                {activePropertyType === 'flight' && (
                  <div
                    className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden ${mobileSearchStep === 'destination' ? 'p-6 shadow-xl border-transparent' : 'p-4 shadow-sm'}`}
                    onClick={() => setMobileSearchStep('destination')}
                  >
                    {mobileSearchStep === 'destination' ? (
                      <div className="animate-fadeIn">
                        <h3 className="text-2xl font-bold text-black mb-4">Fly to?</h3>
                        <div className="bg-white border rounded-xl p-3 flex items-center gap-3 shadow-sm mb-4">
                          <FiSearch className="text-black w-5 h-5 font-bold" />
                          <input
                            autoFocus
                            className="flex-1 outline-none text-base placeholder-gray-500 font-semibold bg-transparent text-black"
                            placeholder="Arrival City or Airport"
                            value={flightSearchData.to || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFlightSearchData(prev => ({ ...prev, to: val }));
                            }}
                          />
                          {flightSearchData.to && (
                            <button onClick={(e) => { e.stopPropagation(); setFlightSearchData(prev => ({ ...prev, to: '' })); }} className="p-1 bg-gray-200 rounded-full"><FiX className="w-3 h-3 block" /></button>
                          )}
                        </div>
                        {/* To Suggestions */}
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          {getAirportSuggestions(flightSearchData.to).map((a, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlightSearchData(prev => ({ ...prev, to: `${a.shortName} (${a.code})`, toCode: a.code }));
                                setMobileSearchStep('dates');
                              }}
                              className="flex items-center gap-4 w-full text-left p-2 hover:bg-gray-50 rounded-lg"
                            >
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FiMapPin className="w-5 h-5 text-gray-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate">{a.shortName}</div>
                                <div className="text-sm text-gray-500 truncate">{a.name}</div>
                              </div>
                              <div className="text-xs font-bold text-[#E41D57]">{a.code}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 font-semibold">To</span>
                        <span className="text-black font-bold">{flightSearchData.to || 'Select destination'}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* When Card */}
                <div
                  className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden ${mobileSearchStep === 'dates' ? 'p-6 shadow-xl border-transparent' : 'p-4 shadow-sm'}`}
                  onClick={() => setMobileSearchStep('dates')}
                >
                  {mobileSearchStep === 'dates' ? (
                    <div className="animate-fadeIn">
                      <h3 className="text-2xl font-bold text-black mb-4">When's your trip?</h3>

                      <DatePicker
                        selected={searchData.checkIn}
                        onChange={(dates) => {
                          const [start, end] = dates;
                          handleInputChange('checkIn', start);
                          handleInputChange('checkOut', end);
                          if (end) {
                            setTimeout(() => setMobileSearchStep('guests'), 300);
                          }
                        }}
                        startDate={searchData.checkIn}
                        endDate={searchData.checkOut}
                        selectsRange
                        minDate={new Date()}
                        inline
                        monthsShown={1}
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-semibold text-sm">When</span>
                      <span className="text-black font-bold text-sm">{getDateRangeDisplay() || 'Add dates'}</span>
                    </div>
                  )}
                </div>

                {/* Who Card */}
                <div
                  className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden ${mobileSearchStep === 'guests' ? 'p-6 shadow-xl border-transparent' : 'p-4 shadow-sm'}`}
                  onClick={() => setMobileSearchStep('guests')}
                >
                  {mobileSearchStep === 'guests' ? (
                    <div className="animate-fadeIn">
                      <h3 className="text-2xl font-bold text-black mb-6">Who's coming?</h3>
                      <div className="space-y-6">
                        {[
                          { key: 'adults', label: 'Adults', subtitle: 'Ages 13 or above', min: 1 },
                          { key: 'children', label: 'Children', subtitle: 'Ages 2 – 12', min: 0 },
                          { key: 'infants', label: 'Infants', subtitle: 'Under 2', min: 0 },
                          { key: 'pets', label: 'Pets', subtitle: 'Bringing a service animal?', min: 0 },
                        ].map((item) => {
                          const currentValue = item.key === 'adults' ? Math.max(1, searchData.guests) : 0; // Simplified for this view, assumes guests field matches adults mostly or handle logic
                          // Note: Original code mapped single 'guests' to adults counter somewhat. I'll stick to 'guests' state for adults.
                          return (
                            <div key={item.key} className="flex items-center justify-between">
                              <div>
                                <div className="text-base font-semibold text-gray-900">{item.label}</div>
                                <div className="text-sm text-gray-500">{item.subtitle}</div>
                              </div>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.key === 'adults') {
                                      handleInputChange('guests', Math.max(1, (searchData.guests || 1) - 1));
                                    }
                                  }}
                                  className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center ${currentValue <= item.min ? 'opacity-50 cursor-not-allowed' : 'hover:border-black'}`}
                                  disabled={currentValue <= item.min}
                                >
                                  <FiMinus className="w-3 h-3" />
                                </button>
                                <span className="font-semibold text-base w-4 text-center">{currentValue}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.key === 'adults') {
                                      handleInputChange('guests', (searchData.guests || 1) + 1);
                                    }
                                  }}
                                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black"
                                >
                                  <FiPlus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-semibold text-sm">Who</span>
                      <span className="text-black font-bold text-sm">{getGuestsDisplay()}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="bg-white border-t border-gray-200 p-4 px-6 fixed bottom-0 left-0 right-0 flex justify-between items-center z-30 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <button
                  onClick={() => setSearchData(prev => ({ ...prev, location: '', checkIn: null, checkOut: null, guests: 1 }))}
                  className="text-base underline font-semibold text-gray-900"
                >
                  Clear all
                </button>
                <button
                  onClick={(e) => {
                    handleSearch(e);
                    setShowMobileSearch(false);
                  }}
                  className="bg-[#E41D57] hover:bg-[#D41C50] text-white px-8 py-3.5 rounded-lg font-bold text-base flex items-center gap-2 shadow-md"
                >
                  <FiSearch className="w-5 h-5 font-bold stroke-[3px]" />
                  Search
                </button>
              </div>
            </div>
          )}

          {/* Desktop: Horizontal layout */}
          <div className="hidden md:flex items-center justify-between gap-4 w-full">
            {/* Optional Back Button (Desktop) */}
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 mr-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Go back"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}

            {/* Logo section */}
            <Link to="/" className="flex items-center flex-shrink-0">
              {settings?.site_logo ? (
                <img
                  src={settings.site_logo}
                  alt={settings?.site_name || 'Logo'}
                  className="h-10 w-auto max-w-[200px] object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {(settings?.site_name || 'K').charAt(0)}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop compact pill + expandable form */}
            <div className="hidden md:flex flex-1 justify-center mx-4 min-w-0">
              {(() => {
                // *** FLIGHT SEARCH FORM ***
                // *** FLIGHT SEARCH FORM ***
                // *** FLIGHT SEARCH FORM ***
                if (activePropertyType === 'flight') {
<<<<<<< HEAD
                  return (
                    <div ref={searchPillRef} className="flex flex-col w-full max-w-[1240px] animate-fadeIn mx-auto relative z-[90]">
                      {/* Trip Type Selection */}
                      <div className="flex items-center gap-6 mb-4 pl-6">
                        <label
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => setFlightSearchData(prev => ({ ...prev, tripType: 'oneWay', returnDate: null }))}
                        >
                          <div className={`w-5 h-5 rounded-full border-[5px] transition-all bg-white ${flightSearchData.tripType === 'oneWay' ? 'border-[#E41D57]' : 'border-gray-300'}`}></div>
                          <span className={`text-sm font-bold transition-colors ${flightSearchData.tripType === 'oneWay' ? 'text-[#E41D57]' : 'text-gray-400 group-hover:text-gray-600'}`}>One Way</span>
                        </label>
                        <label
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => setFlightSearchData(prev => ({ ...prev, tripType: 'roundTrip' }))}
                        >
                          <div className={`w-5 h-5 rounded-full border-[5px] transition-all bg-white ${flightSearchData.tripType === 'roundTrip' ? 'border-[#E41D57]' : 'border-gray-300'}`}></div>
                          <span className={`text-sm font-bold transition-colors ${flightSearchData.tripType === 'roundTrip' ? 'text-[#E41D57]' : 'text-gray-400 group-hover:text-gray-600'}`}>Round Way</span>
                        </label>
                        <label
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => setFlightSearchData(prev => ({ ...prev, tripType: 'multiCity', returnDate: null }))}
                        >
                          <div className={`w-5 h-5 rounded-full border-[5px] transition-all bg-white ${flightSearchData.tripType === 'multiCity' ? 'border-[#E41D57]' : 'border-gray-300'}`}></div>
                          <span className={`text-sm font-semibold transition-colors ${flightSearchData.tripType === 'multiCity' ? 'text-[#E41D57] font-bold' : 'text-gray-400 group-hover:text-gray-600'}`}>Multi City</span>
                        </label>
                      </div>

                      {/* Standard OneWay/RoundTrip View */}
                      {flightSearchData.tripType !== 'multiCity' && (
                        <div className={`flex items-center shadow-md border border-gray-200 rounded-full w-full max-w-6xl mx-auto transition-all duration-300 ease-out relative z-[90] ${flightActiveSection ? 'bg-[#EBEBEB]' : 'bg-white'}`}>

                          {/* FROM Segment */}
                          <div
                            className={`flex-1 relative h-[66px] flex flex-col justify-center px-6 cursor-pointer rounded-full transition-all ${flightActiveSection === 'from' ? 'bg-white shadow-lg z-30' : 'hover:bg-gray-100'}`}
                            onClick={(e) => { e.stopPropagation(); setFlightActiveSection('from'); }}
                          >
                            <div className="text-xs font-bold text-gray-900">From</div>
                            {flightActiveSection === 'from' ? (
                              <input
                                autoFocus
                                className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none truncate placeholder-gray-400"
                                value={flightSearchData.from}
                                onChange={(e) => setFlightSearchData(prev => ({ ...prev, from: e.target.value }))}
                                placeholder="City or Airport"
                              />
                            ) : (
                              <div className="text-sm font-semibold text-gray-900 truncate">{flightSearchData.from || 'Select City'}</div>
                            )}
                            <div className="text-[10px] text-gray-500 truncate">{flightSearchData.fromCode}</div>

                            {/* Swap Icon (Absolute between From/To) */}
                            <div
                              className="absolute -right-3 top-1/2 -translate-y-1/2 z-40 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-gray-50 text-gray-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlightSearchData(prev => ({
                                  ...prev,
                                  from: prev.to, fromCode: prev.toCode, fromFull: prev.toFull,
                                  to: prev.from, toCode: prev.fromCode, toFull: prev.fromFull
                                }));
                              }}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </div>

                            {/* Suggestions Dropdown */}
                            {flightActiveSection === 'from' && (
                              <div className="absolute top-[calc(100%+12px)] left-0 w-[350px] bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suggested Airports</div>
                                {locationSuggestionsData?.filter(l => !flightSearchData.from || (l.city || '').toLowerCase().includes(flightSearchData.from.toLowerCase())).slice(0, 5).map((loc, idx) => (
                                  <div
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFlightSearchData(prev => ({
                                        ...prev,
                                        from: loc.city,
                                        fromCode: (loc.city || '').substring(0, 3).toUpperCase(),
                                        fromFull: `${loc.city}, ${loc.country}`
                                      }));
                                      setFlightActiveSection('to');
                                    }}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><FiMapPin className="w-4 h-4" /></div>
                                    <div>
                                      <div className="font-bold text-sm text-gray-900">{loc.city}</div>
                                      <div className="text-[10px] text-gray-500">{loc.country}</div>
                                    </div>
                                    <div className="ml-auto text-xs font-bold text-gray-400">{(loc.city || '').substring(0, 3).toUpperCase()}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="h-8 w-px bg-gray-200" />

                          {/* TO Segment */}
                          <div
                            className={`flex-1 relative h-[66px] flex flex-col justify-center px-6 cursor-pointer rounded-full transition-all ${flightActiveSection === 'to' ? 'bg-white shadow-lg z-30' : 'hover:bg-gray-100'}`}
                            onClick={(e) => { e.stopPropagation(); setFlightActiveSection('to'); }}
                          >
                            <div className="text-xs font-bold text-gray-900">To</div>
                            {flightActiveSection === 'to' ? (
                              <input
                                autoFocus
                                className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none truncate placeholder-gray-400"
                                value={flightSearchData.to}
                                onChange={(e) => setFlightSearchData(prev => ({ ...prev, to: e.target.value }))}
                                placeholder="City or Airport"
                              />
                            ) : (
                              <div className="text-sm font-semibold text-gray-900 truncate">{flightSearchData.to || 'Select City'}</div>
                            )}
                            <div className="text-[10px] text-gray-500 truncate">{flightSearchData.toCode}</div>

                            {/* Suggestions Dropdown TO */}
                            {flightActiveSection === 'to' && (
                              <div className="absolute top-[calc(100%+12px)] left-0 w-[350px] bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suggested Airports</div>
                                {locationSuggestionsData?.filter(l => !flightSearchData.to || (l.city || '').toLowerCase().includes(flightSearchData.to.toLowerCase())).slice(0, 5).map((loc, idx) => (
                                  <div
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFlightSearchData(prev => ({
                                        ...prev,
                                        to: loc.city,
                                        toCode: (loc.city || '').substring(0, 3).toUpperCase(),
                                        toFull: `${loc.city}, ${loc.country}`
                                      }));
                                      setFlightActiveSection('depart');
                                    }}
                                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><FiMapPin className="w-4 h-4" /></div>
                                    <div>
                                      <div className="font-bold text-sm text-gray-900">{loc.city}</div>
                                      <div className="text-[10px] text-gray-500">{loc.country}</div>
                                    </div>
                                    <div className="ml-auto text-xs font-bold text-gray-400">{(loc.city || '').substring(0, 3).toUpperCase()}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="h-8 w-px bg-gray-200" />

                          {/* Dates Segment */}
                          <div
                            className={`flex-[1.2] relative h-[66px] flex flex-col justify-center px-6 cursor-pointer rounded-full transition-all ${['depart', 'return'].includes(flightActiveSection) ? 'bg-white shadow-lg z-30' : 'hover:bg-gray-100'}`}
                            onClick={(e) => { e.stopPropagation(); setFlightActiveSection('depart'); }}
                          >
                            <div className="text-xs font-bold text-gray-900">
                              {['oneWay', 'multiCity'].includes(flightSearchData.tripType) ? 'Departure Date' : 'Departure & Return Date'}
                            </div>
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {flightSearchData.departDate ? flightSearchData.departDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add'}
                              {flightSearchData.tripType !== 'oneWay' && (
                                <>
                                  {' - '}
                                  {flightSearchData.returnDate ? flightSearchData.returnDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Add'}
                                </>
                              )}
                            </div>

                            {/* DatePopups */}
                            {['depart', 'return'].includes(flightActiveSection) && (
                              <div className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 z-[60] flex gap-4" onClick={(e) => e.stopPropagation()}>
                                <div>
                                  <div className="text-xs font-bold text-gray-500 mb-2 text-center">Departure</div>
                                  <DatePicker
                                    selected={flightSearchData.departDate}
                                    onChange={(date) => {
                                      setFlightSearchData(prev => ({ ...prev, departDate: date }));
                                      if (['oneWay', 'multiCity'].includes(flightSearchData.tripType)) {
                                        setFlightActiveSection('travelers');
                                      } else {
                                        setFlightActiveSection('return');
                                      }
                                    }}
                                    minDate={new Date()}
                                    monthsShown={1}
                                    inline
                                  />
                                </div>
                                {!['oneWay', 'multiCity'].includes(flightSearchData.tripType) && (
                                  <div className="border-l border-gray-100 pl-4">
                                    <div className="text-xs font-bold text-gray-500 mb-2 text-center">Return</div>
                                    <DatePicker
                                      selected={flightSearchData.returnDate}
                                      onChange={(date) => {
                                        setFlightSearchData(prev => ({ ...prev, returnDate: date }));
                                        setFlightActiveSection('travelers');
                                      }}
                                      minDate={flightSearchData.departDate || new Date()}
                                      monthsShown={1}
                                      inline
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="h-8 w-px bg-gray-200" />

                          {/* Travelers Segment */}
                          <div
                            className={`flex-1 relative h-[66px] flex flex-col justify-center px-6 cursor-pointer rounded-full transition-all ${flightActiveSection === 'travelers' ? 'bg-white shadow-lg z-30' : 'hover:bg-gray-100'}`}
                            onClick={(e) => { e.stopPropagation(); setFlightActiveSection('travelers'); }}
                          >
                            <div className="text-xs font-bold text-gray-900">Traveller & Class</div>
                            <div className="text-[10px] text-gray-900 truncate">
                              {flightSearchData.travelers} Traveler, {flightSearchData.flightClass}
                            </div>

                            {/* Travelers Dropdown */}
                            {flightActiveSection === 'travelers' && (
                              <div className="absolute top-[calc(100%+12px)] right-0 w-[350px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-[60] cursor-default" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-6">
                                  <div>
                                    <div className="font-bold text-gray-900">Adults</div>
                                    <div className="text-xs text-gray-500">Age 12+</div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <button
                                      className={`w-8 h-8 rounded-full border flex items-center justify-center ${flightSearchData.travelers <= 1 ? 'border-gray-200 text-gray-300' : 'border-gray-400 text-gray-600 hover:border-black hover:text-black'}`}
                                      onClick={() => setFlightSearchData(prev => ({ ...prev, travelers: Math.max(1, prev.travelers - 1) }))}
                                      disabled={flightSearchData.travelers <= 1}
                                    >
                                      <FiMinus className="w-4 h-4" />
                                    </button>
                                    <span className="font-bold text-base min-w-[20px] text-center">{flightSearchData.travelers}</span>
                                    <button
                                      className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 hover:border-black hover:text-black flex items-center justify-center"
                                      onClick={() => setFlightSearchData(prev => ({ ...prev, travelers: Math.min(9, prev.travelers + 1) }))}
                                    >
                                      <FiPlus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="h-px bg-gray-200 my-4" />
                                <div>
                                  <div className="font-bold text-gray-900 mb-3">Cabin Class</div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {['Economy', 'Business', 'First Class'].map(cls => (
                                      <button
                                        key={cls}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${flightSearchData.flightClass === cls ? 'border-black bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-400 text-gray-700'}`}
                                        onClick={() => setFlightSearchData(prev => ({ ...prev, flightClass: cls }))}
                                      >
                                        {cls}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Search Button */}
                          <button
                            className="w-12 h-12 rounded-full bg-[#E41D57] hover:bg-[#c01b4b] text-white shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 m-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              const params = new URLSearchParams();
                              params.set('property_type', 'flight');
                              params.set('from', flightSearchData.fromCode || 'DAC');
                              params.set('to', flightSearchData.toCode || 'CXB');
                              params.set('depart', flightSearchData.departDate ? flightSearchData.departDate.toISOString() : new Date().toISOString());
                              if (flightSearchData.returnDate) params.set('return', flightSearchData.returnDate.toISOString());
                              params.set('travelers', flightSearchData.travelers);
                              params.set('class', flightSearchData.flightClass);
                              navigate(`/search?${params.toString()}`);
                            }}
                          >
                            <FiSearch className="w-5 h-5 font-bold" />
                          </button>
                        </div>
                      )}

                      {/* Multi City View */}
                      {flightSearchData.tripType === 'multiCity' && (
                        <div className="w-full max-w-6xl mx-auto space-y-3">
                          <style>{`
                            .flight-datepicker .react-datepicker {
                              font-family: 'Inter', sans-serif;
                              border: none !important;
                              box-shadow: none !important;
                              width: 100%;
                            }
                            .flight-datepicker .react-datepicker__header {
                              background-color: white !important;
                              border-bottom: none !important;
                              padding-top: 15px;
                              padding-bottom: 10px;
                            }
                            .flight-datepicker .react-datepicker__current-month {
                              font-size: 16px;
                              font-weight: 700;
                              color: #000;
                              margin-bottom: 20px;
                            }
                            .flight-datepicker .react-datepicker__day-names {
                              margin-bottom: 5px;
                            }
                            .flight-datepicker .react-datepicker__day-name {
                              color: #1f2937;
                              font-weight: 500;
                              width: 2.5rem;
                              margin: 0.1rem;
                            }
                            .flight-datepicker .react-datepicker__month {
                              margin: 0;
                            }
                            .flight-datepicker .react-datepicker__day {
                              width: 2.5rem;
                              line-height: 2.5rem;
                              margin: 0.1rem;
                              border-radius: 50% !important;
                              font-weight: 500;
                              color: #1f2937;
                            }
                            .flight-datepicker .react-datepicker__day--selected,
                            .flight-datepicker .react-datepicker__day--keyboard-selected {
                              background-color: #1e2049 !important;
                              color: white !important;
                            }
                            .flight-datepicker .react-datepicker__day--outside-month {
                              color: #d1d5db !important;
                            }
                            .flight-datepicker .react-datepicker__day:hover:not(.react-datepicker__day--selected) {
                              background-color: #f3f4f6 !important;
                            }
                            .flight-datepicker .react-datepicker__navigation {
                              top: 18px;
                            }
                            .flight-datepicker .react-datepicker__navigation-icon::before {
                              border-color: #374151;
                              border-width: 2px 2px 0 0;
                            }
                          `}</style>
                          {flightSearchData.legs.map((leg, index) => (
                            <div key={leg.id} className={`flex items-center shadow-md border border-gray-200 rounded-full w-full max-w-6xl mx-auto transition-all duration-300 ease-out relative z-[90] mb-2 ${flightActiveSection && flightActiveSection.startsWith(`leg-${index}`) ? 'bg-[#EBEBEB]' : 'bg-white'}`}>
                              {/* FROM Segment */}
                              <div
                                data-section-id={`leg-${index}-from`}
                                className={`flex-1 relative h-[66px] flex flex-col justify-center px-6 rounded-full transition-all ${flightActiveSection === `leg-${index}-from` ? 'bg-white shadow-lg z-30' : 'hover:bg-gray-100'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFlightActiveSection(`leg-${index}-from`);
                                }}
                              >
                                <div className="text-xs font-bold text-gray-900">From</div>
                                {flightActiveSection === `leg-${index}-from` ? (
                                  <input
                                    autoFocus
                                    className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none truncate placeholder-gray-400"
                                    value={leg.from}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const newLegs = [...flightSearchData.legs];
                                      newLegs[index] = { ...newLegs[index], from: val };
                                      setFlightSearchData(prev => ({ ...prev, legs: newLegs }));
                                    }}
                                    placeholder="City or Airport"
                                  />
                                ) : (
                                  <div className="text-sm font-semibold text-gray-900 truncate">{leg.from || 'Select City'}</div>
                                )}
                                <div className="text-[10px] text-gray-500 truncate">{leg.fromCode}</div>

                                {flightActiveSection === `leg-${index}-from` && (
                                  <div className="absolute top-[calc(100%+12px)] left-0 w-[350px] bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                                    <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suggested Airports</div>
                                    {locationSuggestionsData?.map((loc, idx) => (
                                      <div
                                        key={idx}
                                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          const newLegs = [...flightSearchData.legs];
                                          newLegs[index] = { ...newLegs[index], from: loc.city, fromCode: loc.code || (loc.city || '').substring(0, 3).toUpperCase() };
                                          setFlightSearchData(prev => ({ ...prev, legs: newLegs }));
                                          setFlightActiveSection(`leg-${index}-to`);
                                        }}
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><FiMapPin className="w-4 h-4" /></div>
                                        <div>
                                          <div className="font-semibold text-sm text-gray-900">{loc.city}</div>
                                          <div className="text-[10px] text-gray-500">{loc.country}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Divider */}
                              <div className="h-8 w-px bg-gray-200" />

                              {/* TO Segment */}
                              <div
                                data-section-id={`leg-${index}-to`}
                                className={`flex-1 relative h-[66px] flex flex-col justify-center px-6 rounded-full transition-all ${flightActiveSection === `leg-${index}-to` ? 'bg-white shadow-lg z-30' : 'hover:bg-gray-100'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFlightActiveSection(`leg-${index}-to`);
                                }}
                              >
                                <div className="text-xs font-bold text-gray-900">To</div>
                                {flightActiveSection === `leg-${index}-to` ? (
                                  <input
                                    autoFocus
                                    className="w-full text-sm font-semibold text-gray-900 bg-transparent outline-none truncate placeholder-gray-400"
                                    value={leg.to}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const newLegs = [...flightSearchData.legs];
                                      newLegs[index] = { ...newLegs[index], to: val };
                                      setFlightSearchData(prev => ({ ...prev, legs: newLegs }));
                                    }}
                                    placeholder="City or Airport"
                                  />
                                ) : (
                                  <div className="text-sm font-semibold text-gray-900 truncate">{leg.to || 'Select City'}</div>
                                )}
                                <div className="text-[10px] text-gray-500 truncate">{leg.toCode}</div>

                                {flightActiveSection === `leg-${index}-to` && (
                                  <div className="absolute top-[calc(100%+12px)] left-0 w-[350px] bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                                    <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Suggested Airports</div>
                                    {locationSuggestionsData?.map((loc, idx) => (
                                      <div
                                        key={idx}
                                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                                        onMouseDown={(e) => {
                                          e.stopPropagation();
                                          const newLegs = [...flightSearchData.legs];
                                          newLegs[index] = { ...newLegs[index], to: loc.city, toCode: loc.code || (loc.city || '').substring(0, 3).toUpperCase() };
                                          setFlightSearchData(prev => ({ ...prev, legs: newLegs }));
                                          setFlightActiveSection(`leg-${index}-date`);
                                        }}
                                      >
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><FiMapPin className="w-4 h-4" /></div>
                                        <div>
                                          <div className="font-semibold text-sm text-gray-900">{loc.city}</div>
                                          <div className="text-[10px] text-gray-500">{loc.country}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Divider */}
                              <div className="h-8 w-px bg-gray-200" />

                              {/* DATE Segment */}
                              <div
                                data-section-id={`leg-${index}-date`}
                                className={`flex-[0.8] relative h-[66px] flex flex-col justify-center px-6 rounded-full transition-all ${flightActiveSection === `leg-${index}-date` ? 'bg-white shadow-lg z-30' : 'hover:bg-gray-100'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Don't reopen if clicking inside the datepicker
                                  if (e.target.closest('.flight-datepicker')) return;
                                  setFlightActiveSection(`leg-${index}-date`);
                                }}
                              >
                                <div className="text-xs font-bold text-gray-900">Date</div>
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                  {leg.date ? leg.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Select Date'}
                                </div>
                                {flightActiveSection === `leg-${index}-date` && (
                                  <div className="flight-datepicker absolute top-[calc(100%+12px)] left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-[101]">
                                    <DatePicker
                                      selected={leg.date}
                                      onChange={(date) => {
                                        const newLegs = [...flightSearchData.legs];
                                        newLegs[index] = { ...newLegs[index], date: date };
                                        setFlightSearchData(prev => ({ ...prev, legs: newLegs }));
                                        // Delay closing slightly to prevent click event fall-through/bubbling issues
                                        setTimeout(() => setFlightActiveSection(null), 50);
                                      }}
                                      minDate={new Date()}
                                      monthsShown={1}
                                      inline
                                    />
                                  </div>
                                )}
                              </div>

                              {/* TRAVELERS & CLASS - Only on First Row */}
                              {index === 0 && (
                                <>
                                  <div className="h-8 w-px bg-gray-200" />
                                  <div
                                    data-section-id="leg-0-travelers"
                                    className={`flex-[1.2] relative h-[66px] flex flex-col justify-center px-6 rounded-full transition-all ${flightActiveSection === 'leg-0-travelers' ? 'bg-white shadow-lg z-30' : 'hover:bg-gray-100'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFlightActiveSection('leg-0-travelers');
                                    }}
                                  >
                                    <div className="text-xs font-bold text-gray-900">Travelers & Class</div>
                                    <div className="text-sm font-semibold text-gray-900 truncate">
                                      {flightSearchData.travelers} Traveler, {flightSearchData.flightClass}
                                    </div>
                                    {flightActiveSection === 'leg-0-travelers' && (
                                      <div className="absolute top-[calc(100%+12px)] right-0 w-[300px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 z-50 cursor-default" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-between items-center mb-6">
                                          <div>
                                            <div className="font-bold text-gray-900">Travelers</div>
                                            <div className="text-xs text-gray-500">Age 13+</div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <button onClick={() => setFlightSearchData(p => ({ ...p, travelers: Math.max(1, p.travelers - 1) }))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors">-</button>
                                            <span className="w-4 text-center font-bold">{flightSearchData.travelers}</span>
                                            <button onClick={() => setFlightSearchData(p => ({ ...p, travelers: p.travelers + 1 }))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition-colors">+</button>
                                          </div>
                                        </div>
                                        <div className="border-t border-gray-100 pt-6">
                                          <div className="font-bold text-gray-900 mb-3">Cabin Class</div>
                                          <div className="flex flex-wrap gap-2">
                                            {['Economy', 'Business', 'First'].map(c => (
                                              <button
                                                key={c}
                                                onClick={() => setFlightSearchData(p => ({ ...p, flightClass: c }))}
                                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${flightSearchData.flightClass === c ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-700 hover:border-black'}`}
                                              >
                                                {c}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}

                              {/* ACTIONS */}
                              <div className="px-2 flex items-center gap-2">
                                {index === flightSearchData.legs.length - 1 ? (
                                  <>
                                    <button
                                      className="w-10 h-10 rounded-full bg-[#E41D57] hover:bg-[#c01b4b] text-white flex items-center justify-center transition-all shadow-md"
                                      onClick={() => {
                                        setFlightSearchData(prev => ({
                                          ...prev,
                                          legs: [
                                            ...prev.legs,
                                            {
                                              id: prev.legs.length + 1,
                                              from: prev.legs[prev.legs.length - 1].to,
                                              fromCode: prev.legs[prev.legs.length - 1].toCode,
                                              to: '',
                                              toCode: '',
                                              date: new Date()
                                            }
                                          ]
                                        }))
                                      }}
                                    >
                                      <FiPlus className="w-5 h-5" />
                                    </button>
                                    <button
                                      className="w-auto px-6 h-12 rounded-full bg-[#E41D57] hover:bg-[#c01b4b] text-white flex items-center justify-center transition-all shadow-lg gap-2"
                                      onClick={() => {
                                        navigate(`/search?property_type=flight&tripType=multiCity`);
                                      }}
                                    >
                                      <FiSearch className="w-5 h-5" />
                                      <span className="font-bold text-base">Search</span>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all"
                                    onClick={() => {
                                      if (flightSearchData.legs.length > 1) {
                                        const newLegs = flightSearchData.legs.filter((_, i) => i !== index);
                                        setFlightSearchData(prev => ({ ...prev, legs: newLegs }));
                                      }
                                    }}
                                  >
                                    <FiX className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                // *** DEFAULT STAYS SEARCH FORM (Existing) ***
                const effectiveSection = desktopHoverSection || desktopActiveSection;
                const hideSep1 = effectiveSection === 'location' || effectiveSection === 'dates';
                const hideSep2 = effectiveSection === 'dates' || effectiveSection === 'guests';
                return (
                  <div ref={searchPillRef} className={`flex items-center shadow-md border border-gray-200 rounded-full max-w-xl w-full hover:shadow-lg transition-all duration-300 ease-out min-w-0 overflow-hidden ${desktopActiveSection ? 'bg-gray-100' : 'bg-white'}`}>
                    <div ref={desktopPillSegmentsRef} className="flex-1 flex items-center justify-center text-sm text-gray-900 min-w-0 relative">
                      <div
                        className={`absolute top-0 bottom-0 left-0 rounded-full bg-white shadow-sm transition-all duration-300 ease-out ${desktopActivePillStyle.visible ? 'opacity-100' : 'opacity-0'}`}
                        style={{ transform: `translateX(${desktopActivePillStyle.x}px)`, width: desktopActivePillStyle.w }}
                      />
                      <button
                        ref={whereBtnRef}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDesktopExpanded(false);
                          setDesktopActiveSection('location');
                          window.dispatchEvent(new CustomEvent('openMainHeaderSearch', { detail: 'location' }));
                        }}
                        onMouseEnter={() => setDesktopHoverSection('location')}
                        onMouseLeave={() => setDesktopHoverSection(null)}
                        className="flex-1 min-w-0 text-left px-3 py-2 rounded-full transition-all duration-300 ease-out hover:bg-gray-50 relative z-10"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img src="https://img.icons8.com/fluency/48/home.png" alt="home" className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900">Where</div>
                            <div className="text-sm text-gray-700 truncate">{getLocationDisplay()}</div>
                          </div>
                        </div>
                      </button>
                      <span className={`h-8 w-px bg-gray-200 flex-shrink-0 transition-opacity duration-150 ${hideSep1 ? 'opacity-0' : 'opacity-100'}`} />
                      <button
                        ref={whenBtnRef}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDesktopExpanded(false);
                          setDesktopActiveSection('dates');
                          window.dispatchEvent(new CustomEvent('openMainHeaderSearch', { detail: 'dates' }));
                        }}
                        onMouseEnter={() => setDesktopHoverSection('dates')}
                        onMouseLeave={() => setDesktopHoverSection(null)}
                        className="flex-1 min-w-0 text-left px-4 py-2 rounded-full transition-all duration-300 ease-out hover:bg-gray-50 relative z-10"
                      >
                        <div className="text-xs font-semibold text-gray-900">When</div>
                        <div className="text-sm text-gray-700 truncate">{getDateDisplay()}</div>
                      </button>
                      <span className={`h-8 w-px bg-gray-200 flex-shrink-0 transition-opacity duration-150 ${hideSep2 ? 'opacity-0' : 'opacity-100'}`} />
                      <div
                        ref={whoBtnRef}
                        onMouseEnter={() => setDesktopHoverSection('guests')}
                        onMouseLeave={() => setDesktopHoverSection(null)}
                        className="flex-1 min-w-0 px-2 py-2 rounded-full transition-all duration-300 ease-out hover:bg-gray-50 relative z-10 flex items-center gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDesktopExpanded(false);
                          setDesktopActiveSection('guests');
                          window.dispatchEvent(new CustomEvent('openMainHeaderSearch', { detail: 'guests' }));
                        }}
                      >
                        <div
                          className="text-left flex-1 min-w-0 px-2"
                        >
                          <div className="text-xs font-semibold text-gray-900">Who</div>
                          <div className="text-sm text-gray-700 truncate">{getGuestsDisplay()}</div>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSearch(e);
                          }}
                          className={`${desktopActiveSection ? 'w-[110px] px-4 gap-2' : 'w-9'} h-9 rounded-full flex-shrink-0 bg-[#E41D57] text-white flex items-center justify-center shadow-md hover:bg-[#C01A4A] transition-all duration-300 ease-out overflow-hidden cursor-pointer`}
                        >
                          <FiSearch className="w-4 h-4 flex-shrink-0" />
                          <span className={`${desktopActiveSection ? 'max-w-[60px] opacity-100' : 'max-w-0 opacity-0'} text-sm font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 ease-out`}>Search</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Animated dropdown form removed; sticky search now routes to main header */}
            </div>

            {/* Airbnb-style User menu */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {/* Become a host button */}
              <Link
                to="/register"
                className="text-sm font-semibold text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors"
              >
                Become a host
              </Link>

              {/* Globe icon */}
              <button
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Choose language"
              >
                <svg
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="presentation"
                  focusable="false"
                  className="w-4 h-4"
                  style={{ display: 'block', fill: 'none', stroke: 'currentColor', strokeWidth: '2', overflow: 'visible' }}
                >
                  <path d="M8 .25a7.77 7.77 0 0 1 7.75 7.78 7.75 7.75 0 0 1-7.52 7.72h-.25A7.75 7.75 0 0 1 .25 8.24v-.25A7.75 7.75 0 0 1 8 .25zm1.95 8.5h-3.9c.15 2.9 1.17 5.34 1.88 5.5H8c.68 0 1.72-2.37 1.93-5.23zm4.26 0h-2.76c-.09 1.96-.53 3.78-1.18 5.08A6.26 6.26 0 0 0 14.17 9zm-9.67 0H1.8a6.26 6.26 0 0 0 3.94 5.08 12.59 12.59 0 0 1-1.16-4.7l-.03-.38zm1.2-6.58-.12.05a6.26 6.26 0 0 0-3.83 5.03h2.75c.09-1.83.48-3.54 1.06-4.81zm2.25-.42c-.7 0-1.78 2.51-1.94 5.5h3.9c-.15-2.9-1.18-5.34-1.89-5.5h-.07zm2.28.43.03.05a12.95 12.95 0 0 1 1.15 5.02h2.75a6.28 6.28 0 0 0-3.93-5.07z"></path>
                </svg>
              </button>

              {/* Menu button with 3 bars and profile icon - wrapped in relative container */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 border border-gray-300 rounded-full py-1.5 px-2 pr-1.5 hover:shadow-md transition-shadow"
                  aria-label="Main menu"
                >
                  {/* 3 horizontal bars */}
                  <svg
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    role="presentation"
                    focusable="false"
                    className="w-4 h-4"
                    style={{ display: 'block', fill: 'none', stroke: 'currentColor', strokeWidth: '3' }}
                  >
                    <g fill="none" fillRule="nonzero">
                      <path d="M2 4h12M2 8h12M2 12h12"></path>
                    </g>
                  </svg>

                  {/* Profile icon */}
                  <div className="w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center">
                    <svg
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      role="presentation"
                      focusable="false"
                      className="w-5 h-5 fill-white"
                      style={{ display: 'block' }}
                    >
                      <path d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 28c-4.02 0-7.6-1.88-9.93-4.81a12.43 12.43 0 0 1 6.45-4.4A6.5 6.5 0 0 1 9.5 14a6.5 6.5 0 0 1 13 0 6.51 6.51 0 0 1-3.02 5.5 12.42 12.42 0 0 1 6.45 4.4A12.67 12.67 0 0 1 16 28.7z"></path>
                    </svg>
                  </div>
                </button>

                {/* Dropdown Modal */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl py-2 z-[90001] border border-gray-200">
                    {isAuthenticated ? (
                      <>
                        {/* Authenticated user menu */}
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                        </div>
                        <div className="py-2">
                          {getRoleBasedMenu().map((item) => (
                            <Link
                              key={item.name}
                              to={item.path}
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <item.icon className="w-4 h-4 mr-3" />
                              {item.name}
                            </Link>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <FiLogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Guest menu - Airbnb style */}
                        <div className="py-2">
                          <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <svg
                                viewBox="0 0 16 16"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                                role="presentation"
                                focusable="false"
                                className="w-4 h-4"
                                style={{ display: 'block', fill: 'none', stroke: 'currentColor', strokeWidth: '2' }}
                              >
                                <circle cx="8" cy="8" r="6.5"></circle>
                                <path d="M8 11.5V8m0-2.5v.5"></path>
                              </svg>
                              <span>Help Center</span>
                            </div>
                          </button>

                          <Link
                            to="/register"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                                <span className="text-2xl">🏠</span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">Become a host</div>
                                <div className="text-xs text-gray-500 mt-0.5">It's easy to start hosting and earn extra income.</div>
                              </div>
                            </div>
                          </Link>

                          <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Refer a Host
                          </button>

                          <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Find a co-host
                          </button>

                          <button className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            Gift cards
                          </button>
                        </div>

                        <div className="border-t border-gray-200 pt-2">
                          <Link
                            to="/login"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                          >
                            Log in
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Sign up
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Property Types Strip - Visible ONLY when search header is ACTIVE (expanded) */}
            {
              desktopActiveSection && (
                <div className="hidden md:block border-t border-gray-100 bg-white animate-fadeIn">
                  <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center gap-8 py-3 overflow-x-auto scrollbar-hide">
                      {propertyTypes && propertyTypes.map((type) => {
                        const isActive = activePropertyType === (type.name || '').toLowerCase();
                        return (
                          <button
                            key={type.id}
                            onClick={() => handlePropertyTypeClick(type.name)}
                            className={`flex flex-col items-center gap-2 min-w-max group cursor-pointer transition-all duration-200 ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-80'}`}
                          >
                            <div className={`w-6 h-6 object-contain transition-all duration-300 ${isActive ? 'grayscale-0' : 'grayscale'}`}>
                              {getTypeIcon(type.name, isActive)}
                            </div>
                            <span className={`text-xs font-semibold whitespace-nowrap pb-1 border-b-2 transition-all duration-200 ${isActive ? 'text-black border-black' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>
                              {type.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default StickySearchHeader;

