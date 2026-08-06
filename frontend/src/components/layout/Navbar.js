import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiHeart, FiBookOpen, FiDollarSign, FiChevronDown, FiGrid, FiAward, FiHome, FiSearch, FiMinus, FiPlus, FiMapPin, FiMessageSquare, FiGlobe, FiCalendar } from 'react-icons/fi';
import { useQuery } from 'react-query';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';
import api from '../../utils/api';
import AuthModal from '../auth/AuthModal';
import { getLocationSubtitle } from '../../utils/textUtils';
import useLocationAutocomplete from '../../hooks/useLocationAutocomplete';

// Lazy load FlightSearchForm — only loaded when Flight tab is active
const FlightSearchForm = lazy(() => import('../search/FlightSearchForm'));

const PropertyTypeIcon = ({ name = '', active = false, iconUrl = '' }) => {
  const normalized = (name || '').toLowerCase();

  // Use admin-set icon first
  let imgSrc = iconUrl || '/images/nav-icon-room.png';

  if (!iconUrl) {
    if (normalized.includes('apartment') || normalized.includes('villa') || normalized.includes('house') || normalized.includes('home')) {
      imgSrc = '/images/nav-icon-apartment.png';
    } else if (normalized.includes('hotel')) {
      imgSrc = '/images/nav-icon-hotel.png';
    } else if (normalized.includes('flight')) {
      imgSrc = '/images/flight.png';
    } else if (normalized.includes('bus')) {
      imgSrc = '/images/bus.png';
    } else if (normalized.includes('monthly') || normalized.includes('rent')) {
      imgSrc = '/images/nav-icon-monthly.png';
    }
  }

  const isBus = normalized.includes('bus');

  return (
    <img
      src={imgSrc}
      alt={name}
      className={`object-contain transition-all duration-300 group-hover:scale-110 ${isBus ? 'w-9 h-9 scale-110' : 'w-7 h-7'} ${active
        ? 'opacity-100 grayscale-0 scale-110 animate-shake-active'
        : 'opacity-100 grayscale-0 hover:opacity-80'
        }`}
      onError={(e) => { e.target.src = '/images/nav-icon-room.png'; }}
    />
  );
};

const TakaIcon = ({ className = "w-4 h-4" }) => (
  <span className={`${className} font-bold font-sans flex items-center justify-center select-none leading-none`} style={{ fontSize: '1.2em' }}>
    ৳
  </span>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin, isPropertyOwner, becomeHost } = useAuthStore();
  const { settings, loadPublicSettings } = useSettingsStore();

  // Fetch menu notification counts reactively via React Query for logged-in users
  const { data: notificationCounts } = useQuery(
    'menu-notifications-navbar',
    async () => {
      const response = await api.get('/users/menu-notifications');
      return response.data?.data || {};
    },
    {
      enabled: isAuthenticated && !!user,
      refetchInterval: 30000, // Poll every 30 seconds
      refetchOnWindowFocus: true,
      staleTime: 10000
    }
  );

  const getNotificationCount = (menuName) => {
    if (!notificationCounts) return 0;
    const name = menuName.toLowerCase();
    
    if (name === 'my bookings') {
      return notificationCounts.guestPendingBookings || 0;
    }
    if (name === 'bookings' || name === 'all bookings' || name === 'bookings [owner ]' || name === 'hms reservations' || name === 'pms reservations') {
      return notificationCounts.pendingBookings || 0;
    }
    if (name === 'messages') {
      return notificationCounts.unreadMessages || 0;
    }
    if (name === 'support') {
      return notificationCounts.supportTickets || 0;
    }
    if (name === 'users') {
      return notificationCounts.pendingVerifications || 0;
    }
    if (name === 'contact messages') {
      return notificationCounts.unreadContacts || 0;
    }
    if (name === 'refunds') {
      return notificationCounts.pendingRefunds || 0;
    }
    return 0;
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const handleBecomeHost = async (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      if (isAdmin() || isPropertyOwner()) {
        navigate('/property-owner');
      } else {
        navigate('/become-host');
      }
    } else {
      setAuthModalMode('register');
      setAuthModalOpen(true);
    }
    setIsProfileOpen(false);
  };

  // Load search state from localStorage on mount
  const loadSearchState = () => {
    try {
      const saved = localStorage.getItem('searchState');
      const isHomePage = window.location.pathname === '/';
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          location: isHomePage ? '' : (parsed.location || ''),
          checkIn: (!isHomePage && parsed.checkIn) ? new Date(parsed.checkIn) : null,
          checkOut: (!isHomePage && parsed.checkOut) ? new Date(parsed.checkOut) : null,
          guests: parsed.guests || 1,
          propertyType: parsed.propertyType || '',
          flightClass: parsed.flightClass || 'Economy' // Added for Flight Class
        };
      }
    } catch (error) {
      console.error('Error loading search state:', error);
    }
    return {
      location: '',
      locationTo: '', // Added for 'To' field
      checkIn: null,
      checkOut: null,
      guests: 1,
      propertyType: '',
      flightClass: 'Economy' // Added for Flight Class
    };
  };

  const [searchData, setSearchData] = useState(loadSearchState);
  const [headerActiveType, setHeaderActiveType] = useState(searchData?.propertyType || '');
  const [headerDateOpen, setHeaderDateOpen] = useState(false);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);
  // Determine initial search active state: default false for property/contact pages
  const isDetailOrContact = location.pathname.startsWith('/property/') || location.pathname.startsWith('/properties') || location.pathname.includes('/contact-host');
  const [isHeaderSearchActive, setIsHeaderSearchActive] = useState(false);
  const [headerHoverSection, setHeaderHoverSection] = useState(null);
  const [headerActivePillStyle, setHeaderActivePillStyle] = useState({ x: 0, w: 0, visible: false });

  // Google Places Autocomplete search hook integration
  const { placePredictions, handlePlaceSelect } = useLocationAutocomplete(
    searchData.location,
    headerActiveType,
    ({ location, latitude, longitude }) => {
      setSearchData(prev => {
        const updated = {
          ...prev,
          location,
          latitude,
          longitude
        };
        persistSearchState({
          ...updated,
          checkIn: prev.checkIn ? formatDateLocal(prev.checkIn) : null,
          checkOut: prev.checkOut ? formatDateLocal(prev.checkOut) : null,
          propertyType: headerActiveType
        });
        return updated;
      });

      if (latitude && longitude) {
        setShowHeaderLocationSuggestions(false);
        setTimeout(() => {
          setHeaderDateOpen(true);
          setShowGuestsDropdown(false);
        }, 100);
      }
    }
  );

  // Flight Search State
  const [flightSearchData, setFlightSearchData] = useState({
    from: 'Dhaka', fromCode: 'DAC', fromFull: 'DAC, Hazrat Shahjalal International Airport',
    to: "Cox's Bazar", toCode: 'CXB', toFull: "CXB, Cox's Bazar Airport",
    departDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    returnDate: null,
    travelers: 1,
    flightClass: 'Economy',
    tripType: 'oneWay'
  });
  const [flightActiveSection, setFlightActiveSection] = useState(null);
  const [guestCounts, setGuestCounts] = useState({
    adults: searchData.guests || 1, // Initialize from searchData.guests
    children: 0,
    kids: 0,
    infants: 0,
    pets: 0,
  });
  const [airportList, setAirportList] = useState([]);

  const getAirportSuggestions = (input) => {
    if (!input || typeof input !== 'string' || input.length < 2) return [];
    const lower = input.toLowerCase();
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

  const dropdownRef = useRef(null);
  const headerSearchRef = useRef(null);
  const headerPillSegmentsRef = useRef(null);
  const headerWhereRef = useRef(null);
  const headerLocationInputRef = useRef(null);
  const headerToRef = useRef(null); // New Ref for 'To' field container
  const headerToInputRef = useRef(null); // New Ref for 'To' input
  const headerDateRef = useRef(null);
  const guestDropdownRef = useRef(null);
  const headerLocationSuggestionsRef = useRef(null);
  const headerToSuggestionsRef = useRef(null); // New Ref for 'To' suggestions dropdown
  const searchFormRef = useRef(null);
  const [showHeaderLocationSuggestions, setShowHeaderLocationSuggestions] = useState(false);
  const [showHeaderToSuggestions, setShowHeaderToSuggestions] = useState(false); // New State for 'To' suggestions visibility
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState('');
  const [currentLangCode, setCurrentLangCode] = useState('EN');

  useEffect(() => {
    // Check googtrans cookie on mount
    const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/i);
    if (match) {
      setCurrentLangCode(match[1].toUpperCase());
    }
  }, []);
  const propertyTypesRef = useRef(null); // Ref for property types container

  // Define pathname checks early
  const isHome = location.pathname === '/';
  const isSearchPage = location.pathname === '/search';
  const isPropertyDetail = location.pathname.startsWith('/property/') || location.pathname.startsWith('/properties');
  const isContactHost = location.pathname.includes('/contact-host');



  /* 🔥 END */

  // Ensure settings are loaded
  useEffect(() => {
    if (!settings?.site_logo && !settings?.site_name) {
      console.log('🔄 Loading settings in Navbar...');
      loadPublicSettings();
    }
  }, []);

  // Fetch property types for header tabs — fully DB-driven, admin controls Flight on/off too
  const { data: propertyTypes } = useQuery(
    'nav-property-types',
    () => api.get('/properties/property-types/list'),
    {
      staleTime: 600000, // 10 minutes
      cacheTime: 900000, // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      select: (response) =>
        (response.data?.data?.propertyTypes || []).filter(pt => pt.is_active !== false),
    }
  );

  // Fetch property locations for suggestions - cached aggressively since locations change rarely
  const { data: locationSuggestionsData } = useQuery(
    'nav-property-locations',
    () => api.get('/properties/locations/list'),
    {
      staleTime: 600000, // 10 minutes
      cacheTime: 900000, // 15 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      select: (response) => response.data?.data?.locations || [],
    }
  );

  // Derived AFTER propertyTypes loads: is Flight tab enabled by admin?
  const isFlightEnabled = Array.isArray(propertyTypes) &&
    propertyTypes.some(t => (t.name || '').toLowerCase() === 'flight');

  // Load airport list ONLY when Flight is enabled — skip entirely if off (saves ~200KB JSON)
  useEffect(() => {
    if (!isFlightEnabled) {
      setAirportList([]);
      return;
    }
    fetch('/data/airportlist.json')
      .then(res => res.json())
      .then(data => setAirportList(Object.values(data)))
      .catch(err => console.error('Failed to load airports:', err));
  }, [isFlightEnabled]);

  // Sync active type from Home/SearchResults via custom event
  useEffect(() => {
    const handleActiveTypeChanged = (e) => {
      if (typeof e.detail === 'string') setHeaderActiveType(e.detail);
    };
    window.addEventListener('activePropertyTypeChanged', handleActiveTypeChanged);
    return () => window.removeEventListener('activePropertyTypeChanged', handleActiveTypeChanged);
  }, []);

  // Sync headerActiveType with URL params when on search page
  useEffect(() => {
    if (isSearchPage) {
      const params = new URLSearchParams(window.location.search);
      const propertyType = params.get('property_type');
      if (propertyType) {
        setHeaderActiveType(propertyType.toLowerCase());
      }
    }
  }, [isSearchPage, location.search]);
  // Reset search form state on route change
  useEffect(() => {
    // On search page or properties list, we always want the compact sticky header by default
    if (isSearchPage) {
      setIsHeaderSearchActive(false);
    }
    // Only close search if navigating away from main booking pages (Home, Search, Details)
    else if (!isHome && !isPropertyDetail && !isContactHost) {
      setIsHeaderSearchActive(false);
    }
  }, [location.pathname, isHome, isSearchPage, isPropertyDetail, isContactHost]);

  // Clear search dates and location when returning to the homepage
  useEffect(() => {
    if (isHome) {
      setSearchData(prev => {
        if (prev.checkIn !== null || prev.checkOut !== null || prev.location !== '') {
          return {
            ...prev,
            location: '',
            checkIn: null,
            checkOut: null
          };
        }
        return prev;
      });
    }
  }, [location.pathname, isHome]);

  // Listen for sticky search request to open main header search sections
  useEffect(() => {
    const openMainHeaderSearch = (e) => {
      const section = e.detail || 'location';

      setIsHeaderSearchActive(true);
      if (section === 'location') {
        setShowHeaderLocationSuggestions(true);
        setShowHeaderToSuggestions(false); // Close 'To' suggestions
        setHeaderDateOpen(false);
        setShowGuestsDropdown(false);
        if (headerLocationInputRef.current) {
          headerLocationInputRef.current.focus({ preventScroll: true });
        }
      } else if (section === 'dates') {
        setHeaderDateOpen(true);
        setShowHeaderLocationSuggestions(false);
        setShowHeaderToSuggestions(false); // Close 'To' suggestions
        setShowGuestsDropdown(false);
      } else if (section === 'guests') {
        setShowGuestsDropdown(true);
        setShowHeaderLocationSuggestions(false);
        setShowHeaderToSuggestions(false); // Close 'To' suggestions
        setHeaderDateOpen(false);
      }
    };
    window.addEventListener('openMainHeaderSearch', openMainHeaderSearch);
    return () => window.removeEventListener('openMainHeaderSearch', openMainHeaderSearch);
  }, []);

  // Force-show header search when any popover is active (location suggestions, date, guests)
  useEffect(() => {
    const body = document.body;
    const shouldShow = isHeaderSearchActive || showHeaderLocationSuggestions || showHeaderToSuggestions || headerDateOpen || showGuestsDropdown;
    if (shouldShow) {
      body.classList.add('force-show-home-search');
    } else {
      body.classList.remove('force-show-home-search');
    }
    return () => body.classList.remove('force-show-home-search');
  }, [isHeaderSearchActive, showHeaderLocationSuggestions, showHeaderToSuggestions, headerDateOpen, showGuestsDropdown]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const totalGuests = guestCounts.adults + guestCounts.children + guestCounts.kids + guestCounts.infants;

  const updateGuests = (key, delta) => {
    setGuestCounts((prev) => {
      const next = { ...prev, [key]: Math.max(0, prev[key] + delta) };
      if (key === 'adults' && next.adults < 1) next.adults = 1;

      // Save to localStorage when guests change
      const totalGuests = next.adults + next.children + next.kids + next.infants;
      const searchState = {
        location: searchData.location,
        locationTo: searchData.locationTo, // Added for 'To' field
        checkIn: searchData.checkIn ? formatDateLocal(searchData.checkIn) : null,
        checkOut: searchData.checkOut ? formatDateLocal(searchData.checkOut) : null,
        guests: totalGuests < 1 ? 1 : totalGuests,
        flightClass: searchData.flightClass // Added for Flight Class
      };
      localStorage.setItem('searchState', JSON.stringify(searchState));
      window.dispatchEvent(new CustomEvent('searchStateUpdated', { detail: searchState }));

      return next;
    });
  };

  // Sync searchData.guests with guestCounts (adults + children)
  useEffect(() => {
    setSearchData((prev) => ({
      ...prev,
      guests: totalGuests < 1 ? 1 : totalGuests,
    }));
  }, [guestCounts]);

  const formatDateLocal = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (date) => {
    if (!date) return null;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(date);
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const persistSearchState = (state) => {
    try {
      localStorage.setItem('searchState', JSON.stringify(state));
      window.dispatchEvent(new CustomEvent('searchStateUpdated', { detail: state }));
    } catch (error) {
      console.error('Error saving search state:', error);
    }
  };

  const effectiveHeaderSection =
    (showHeaderLocationSuggestions ? 'location' : showHeaderToSuggestions ? 'to' : headerDateOpen ? 'dates' : showGuestsDropdown ? 'guests' : null) ||
    headerHoverSection;
  const hideHeaderSep1 = effectiveHeaderSection === 'location' || effectiveHeaderSection === 'to' || effectiveHeaderSection === 'dates';
  const hideHeaderSep2 = effectiveHeaderSection === 'dates' || effectiveHeaderSection === 'guests';

  const isActivePill =
    (effectiveHeaderSection === 'location' && showHeaderLocationSuggestions) ||
    (effectiveHeaderSection === 'to' && showHeaderToSuggestions) || // Added for 'To' field
    (effectiveHeaderSection === 'dates' && headerDateOpen) ||
    (effectiveHeaderSection === 'guests' && showGuestsDropdown);

  const hasLocation = (searchData.location || '').trim() !== '';
  const hasLocationTo = (searchData.locationTo || '').trim() !== ''; // Added for 'To' field
  const hasDates = Boolean(searchData.checkIn || searchData.checkOut);
  const hasGuests = totalGuests > 1 || guestCounts.pets > 0;

  useEffect(() => {
    const updatePill = () => {
      const section = effectiveHeaderSection;
      const container = headerPillSegmentsRef.current;
      const target =
        section === 'location'
          ? headerWhereRef.current
          : section === 'to' // Added for 'To' field
            ? headerToRef.current // Added for 'To' field
            : section === 'dates'
              ? headerDateRef.current
              : section === 'guests'
                ? guestDropdownRef.current
                : null;

      if (!section || !container || !target) {
        setHeaderActivePillStyle((prev) => ({ ...prev, visible: false }));
        return;
      }

      // Use offsetLeft/offsetWidth to avoid issues with CSS transforms (scale) during animation
      // getBoundingClientRect() returns scaled values, which causes double-scaling when applied back as styles
      const x = target.offsetLeft;
      // Add 8px to width for guests section to cover search button
      const w = target.offsetWidth + (section === 'guests' ? 8 : 0);

      setHeaderActivePillStyle({ x, w, visible: true });
    };

    updatePill();
    // Add listeners for layout changes
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [effectiveHeaderSection, isHeaderSearchActive]);

  const getDateRangeDisplay = () => {
    if (searchData.checkIn && searchData.checkOut) {
      return `${formatDateDisplay(searchData.checkIn)} - ${formatDateDisplay(searchData.checkOut)}`;
    } else if (searchData.checkIn) {
      return formatDateDisplay(searchData.checkIn);
    }
    return null;
  };

  const handleNearbyClick = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (navigator.geolocation) {
      setSearchData(prev => ({ ...prev, location: 'Locating...' }));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = 'Nearby';
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSearchData(prev => ({
            ...prev,
            location: newLocation,
            latitude: lat,
            longitude: lng
          }));
          
          // Save to localStorage for persistence
          const searchState = {
            ...searchData,
            location: newLocation,
            latitude: lat,
            longitude: lng,
            locationTo: searchData.locationTo,
            checkIn: searchData.checkIn ? formatDateLocal(searchData.checkIn) : null,
            checkOut: searchData.checkOut ? formatDateLocal(searchData.checkOut) : null,
            guests: searchData.guests,
            flightClass: searchData.flightClass
          };
          localStorage.setItem('searchState', JSON.stringify(searchState));
          window.dispatchEvent(new CustomEvent('searchStateUpdated', { detail: searchState }));
          setShowHeaderLocationSuggestions(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setSearchData(prev => ({ ...prev, location: 'Nearby' }));
          setShowHeaderLocationSuggestions(false);
        }
      );
    } else {
      setSearchData(prev => ({ ...prev, location: 'Nearby' }));
      setShowHeaderLocationSuggestions(false);
    }
  };



  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    const extractCode = (val) => {
      if (!val) return '';
      const match = val.match(/\((.*?)\)/);
      return match ? match[1] : val;
    };

    if (headerActiveType === 'flight') {
      if (flightSearchData.tripType) params.append('trip_type', flightSearchData.tripType);
      if (searchData.location) params.append('from', extractCode(searchData.location));
      if (searchData.locationTo) params.append('to', extractCode(searchData.locationTo));
      if (searchData.checkIn) params.append('depart', formatDateLocal(searchData.checkIn));
      if (searchData.checkOut) params.append('return', formatDateLocal(searchData.checkOut));
      params.append('adults', guestCounts.adults || 1);
      params.append('children', guestCounts.children || 0);
      params.append('kids', guestCounts.kids || 0);
      params.append('infants', guestCounts.infants || 0);
      params.append('travelers', totalGuests || 1); // Keep for backward compatibility
      if (searchData.flightClass) params.append('class', searchData.flightClass);
    } else {
      if (searchData.latitude && searchData.longitude) {
        params.append('city', searchData.location || '');
        params.append('latitude', searchData.latitude);
        params.append('longitude', searchData.longitude);
      } else if (searchData.location) {
        params.append('city', searchData.location);
      }
      if (searchData.checkIn) params.append('check_in_date', formatDateLocal(searchData.checkIn));
      if (searchData.checkOut) params.append('check_out_date', formatDateLocal(searchData.checkOut));
      if (searchData.guests) params.append('min_guests', searchData.guests);
    }

    if (headerActiveType) params.append('property_type', headerActiveType);

    // Save search state to localStorage for persistence
    const searchState = {
      ...searchData,
      location: searchData.location,
      latitude: searchData.latitude || null,
      longitude: searchData.longitude || null,
      locationTo: searchData.locationTo,
      checkIn: searchData.checkIn ? formatDateLocal(searchData.checkIn) : null,
      checkOut: searchData.checkOut ? formatDateLocal(searchData.checkOut) : null,
      guests: searchData.guests,
      propertyType: headerActiveType,
      flightClass: searchData.flightClass,
      tripType: flightSearchData.tripType
    };
    localStorage.setItem('searchState', JSON.stringify(searchState));
    window.dispatchEvent(new CustomEvent('searchStateUpdated', { detail: searchState }));

    // Close all dropdowns and search active state
    setShowHeaderLocationSuggestions(false);
    setShowHeaderToSuggestions(false);
    setHeaderDateOpen(false);
    setShowGuestsDropdown(false);
    setIsHeaderSearchActive(false);

    navigate(`${headerActiveType === 'flight' ? '/flight/results' : '/search'}?${params.toString()}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }

      const popper = document.querySelector('.header-date-popper');
      const clickedInsideDatePopper = popper && popper.contains(event.target);
      const clickedInsideSearchForm = searchFormRef.current && searchFormRef.current.contains(event.target);

      const clickedInsideHeader = headerSearchRef.current && headerSearchRef.current.contains(event.target);

      // Close if clicking outside the search form (pill) AND outside the header
      // Keep open if clicking on the form itself, its children, or anywhere in the header
      if (!clickedInsideSearchForm && !clickedInsideDatePopper && !clickedInsideHeader) {
        setIsHeaderSearchActive(false);
        setShowHeaderLocationSuggestions(false);
        setShowHeaderToSuggestions(false); // Added for 'To' field
        setShowGuestsDropdown(false);
        setHeaderDateOpen(false);
      } else if (clickedInsideSearchForm || clickedInsideDatePopper) {
        // Inside search form or date popper: ensure form is visible
        setIsHeaderSearchActive(true);
      }

      // Check if clicked inside property types (tabs)
      const clickedInsidePropertyTypes = propertyTypesRef.current && propertyTypesRef.current.contains(event.target);

      // Inside header but outside a specific field => close only that field's popover
      // BUT skip this if we clicked a Property Type tab (user wants to keep context open)
      if (!clickedInsidePropertyTypes) {
        if (
          showHeaderLocationSuggestions &&
          headerLocationSuggestionsRef.current &&
          !headerLocationSuggestionsRef.current.contains(event.target) &&
          headerLocationInputRef.current &&
          !headerLocationInputRef.current.contains(event.target)
        ) {
          setShowHeaderLocationSuggestions(false);
        }

        if (showGuestsDropdown && guestDropdownRef.current && !guestDropdownRef.current.contains(event.target)) {
          setShowGuestsDropdown(false);
        }

        if (
          headerDateOpen &&
          headerDateRef.current &&
          !headerDateRef.current.contains(event.target) &&
          !clickedInsideDatePopper
        ) {
          setHeaderDateOpen(false);
        }
      }

    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHeaderLocationSuggestions, showGuestsDropdown, headerDateOpen, showHeaderToSuggestions]); // Added showHeaderToSuggestions

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleTypeClick = (typeName = '') => {
    const normalized = (typeName || '').toLowerCase();

    // Redirect to separate search page for flights and bus
    if (normalized === 'flight' || normalized === 'bus') {
      navigate(`/search?property_type=${normalized}`);
      return;
    }

    setHeaderActiveType(normalized);
    window.dispatchEvent(new CustomEvent('setActivePropertyType', { detail: normalized }));

    // If on search page, update the URL with property_type filter
    // EXCEPT for 'flight', which has its own form
    if (isSearchPage && normalized !== 'flight') {
      const params = new URLSearchParams(window.location.search);
      if (normalized) {
        params.set('property_type', normalized);
      } else {
        params.delete('property_type');
      }
      navigate(`/search?${params.toString()}`, { replace: true });
    } else if (!isHome) {
      // If NOT on Home and NOT on Search (e.g. BookingSuccess, PropertyDetail), navigate to search
      navigate(`/search?property_type=${normalized}`);
    }
  };

  const navLinks = [];



  // Role-based menu items
  const getRoleBasedMenu = () => {
    if (isAdmin()) {
      return [
        { name: 'Admin Dashboard', path: '/admin', icon: FiSettings },
        { name: 'Users', path: '/admin/users', icon: FiUser },
        { name: 'Properties', path: '/admin/properties', icon: FiBookOpen },
        { name: 'Amenities', path: '/admin/amenities', icon: FiSettings },
        { name: 'Property Types', path: '/admin/property-types', icon: FiHome },
        { name: 'Display Categories', path: '/admin/display-categories', icon: FiGrid },
        { name: 'Bookings', path: '/admin/bookings', icon: FiBookOpen },
        { name: 'Reviews', path: '/admin/reviews', icon: FiHeart },
        { name: 'Rewards Points', path: '/admin/rewards-points', icon: FiAward },
        { name: 'Analytics', path: '/admin/analytics', icon: FiSettings },
        { name: 'Accounting', path: '/admin/accounting', icon: TakaIcon },
        { name: 'Earnings', path: '/admin/earnings', icon: TakaIcon },
        { name: 'Settings', path: '/admin/settings', icon: FiSettings },
      ];
    } else if (isPropertyOwner()) {
      return [
        { name: 'Owner Dashboard', path: '/property-owner', icon: FiSettings },
        { name: 'My Properties', path: '/property-owner/properties', icon: FiBookOpen },
        { name: 'My Bookings', path: '/guest/bookings', icon: FiBookOpen },
        { name: 'Bookings [Owner ]', path: '/property-owner/bookings', icon: FiBookOpen },
        { name: 'Calendar Sync', path: '/property-owner/calendar', icon: FiCalendar },
        { name: 'Analytics', path: '/property-owner/analytics', icon: FiSettings },
        { name: 'Earnings', path: '/property-owner/earnings', icon: TakaIcon },
        { name: 'Messages', path: '/messages', icon: FiMessageSquare },
        { name: 'Profile', path: '/property-owner/profile', icon: FiUser },
      ];
    } else if (isAuthenticated) {
      return [
        { name: 'My Dashboard', path: '/guest', icon: FiSettings },
        { name: 'My Bookings', path: '/guest/bookings', icon: FiBookOpen },
        { name: 'Rewards Points', path: '/guest/rewards-points', icon: FiAward },
        { name: 'Favorites', path: '/guest/favorites', icon: FiHeart },
        { name: 'Messages', path: '/messages', icon: FiMessageSquare },
        { name: 'Profile', path: '/guest/profile', icon: FiUser },
      ];
    }
    return [];
  };

  return (
    <nav
      ref={headerSearchRef}
      className={`hidden md:block bg-gradient-to-b from-[#FFFFFF] to-[#F5F5F5] sticky top-0 overflow-visible ${isHeaderSearchActive ? 'z-[200]' : 'z-[100]'}`}
      onClick={(e) => {
        if (searchFormRef.current?.contains(e.target) || e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('.react-datepicker')) return;
        e.stopPropagation();
        setIsHeaderSearchActive(false);
        setShowHeaderLocationSuggestions(false);
        setShowHeaderToSuggestions(false);
        setHeaderDateOpen(false);
        setShowGuestsDropdown(false);
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex justify-between items-center h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            {settings?.site_logo ? (
              <img
                src={settings.site_logo}
                alt={settings?.site_name || 'Logo'}
                className="h-12 w-auto max-w-[250px] object-contain hover:opacity-90 transition-opacity"
                onError={(e) => {
                  console.error('Logo failed to load, showing fallback');
                  e.target.style.display = 'none';
                  // Show fallback
                  const fallback = document.createElement('div');
                  fallback.className = 'w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center';
                  fallback.innerHTML = `<span class="text-white font-bold text-xl">${(settings?.site_name || 'K').charAt(0)}</span>`;
                  e.target.parentElement.insertBefore(fallback, e.target);
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {(settings?.site_name || 'Keyhost Homes').charAt(0)}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation / Home tabs */}
          <div className="hidden md:flex items-center flex-1 justify-center overflow-hidden">
            {(isHome || isSearchPage || isPropertyDetail || location.pathname.startsWith('/flight') || location.pathname === '/booking' || location.pathname.startsWith('/booking-success') || location.pathname.startsWith('/ticket-issue') || location.pathname.startsWith('/react/ticket-issue')) && propertyTypes && propertyTypes.length > 0 ? (
              <div ref={propertyTypesRef} className="flex items-center gap-3 md:gap-4 overflow-x-auto scrollbar-hide flex-nowrap max-w-full justify-start md:justify-center py-1">
                {/* All Property Tab */}
                <button
                  type="button"
                  onClick={() => handleTypeClick('')}
                  className={`flex flex-col items-center justify-center py-1.5 transition-colors group flex-shrink-0 min-w-max ${headerActiveType === ''
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                  <div className="flex flex-col items-center px-2">
                    <div className="flex items-center gap-2">
                      <FiGrid className={`w-7 h-7 transition-all duration-300 ${headerActiveType === '' ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
                      <span className="text-sm font-bold">All</span>
                    </div>
                    <span
                      className={`mt-2 h-[3px] w-full ${headerActiveType === '' ? 'bg-black' : 'bg-transparent'
                        }`}
                    />
                  </div>
                </button>

                {propertyTypes.map((type) => {
                  const isActiveTab = headerActiveType === (type.name || '').toLowerCase();
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleTypeClick(type.name)}
                      className={`flex flex-col items-center justify-center py-1.5 transition-colors group flex-shrink-0 min-w-max ${isActiveTab
                        ? 'text-gray-900'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      <div className="flex flex-col items-center px-2">
                        <div className="flex items-center gap-2">
                          <PropertyTypeIcon name={type.name} active={isActiveTab} iconUrl={type.icon_url} />
                          <span className="text-sm font-bold">{type.name}</span>
                        </div>
                        <span
                          className={`mt-2 h-[3px] w-full ${isActiveTab ? 'bg-black' : 'bg-transparent'
                            }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium transition-colors duration-200 ${isActive(link.path)
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Airbnb-style Auth Section */}
          <div className="hidden md:flex items-center gap-2">
            {/* Become a host / Switch to dashboard button */}
            {isAuthenticated ? (
              (!isAdmin() && !isPropertyOwner() && user?.user_type !== 'staff') ? (
                <button
                  onClick={handleBecomeHost}
                  className="text-sm font-semibold text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors whitespace-nowrap"
                >
                  Become a host
                </button>
              ) : (isAdmin() || isPropertyOwner()) ? (
                <Link
                  to={isAdmin() ? '/admin' : '/property-owner'}
                  className="text-sm font-semibold text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors whitespace-nowrap"
                >
                  {isPropertyOwner() ? 'Switch to host' : 'Switch to dashboard'}
                </Link>
              ) : null
            ) : (
              <button
                onClick={handleBecomeHost}
                className="text-sm font-semibold text-gray-800 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors whitespace-nowrap"
              >
                Become a host
              </button>
            )}

            {/* Globe icon and Custom Language Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLangMenu(!showLangMenu);
                  if (!showLangMenu) setLangSearchQuery('');
                }}
                className="p-0 bg-transparent border-none appearance-none cursor-pointer"
                aria-label="Choose language"
              >
                <div className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-full transition-all duration-200">
                  <FiGlobe className="w-[18px] h-[18px] text-gray-700" />
                  <span className="text-sm font-semibold text-gray-800">{currentLangCode}</span>
                  <FiChevronDown className="w-4 h-4 text-gray-600" />
                </div>
              </button>

              {showLangMenu && (
                <>
                  <div
                    className="fixed inset-0 z-[999998]"
                    onClick={() => setShowLangMenu(false)}
                  ></div>
                  <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[999999] py-2 flex flex-col">
                    <div className="px-3 pb-2 mb-2 border-b border-gray-100">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search language..."
                          value={langSearchQuery}
                          onChange={(e) => setLangSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {[
                        { code: 'en', name: 'English', flag: '🇬🇧' },
                        { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
                        { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
                        { code: 'fr', name: 'French', flag: '🇫🇷' },
                        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
                      ]
                        .filter((lang) => lang.name.toLowerCase().includes(langSearchQuery.toLowerCase()))
                        .map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              const langCode = lang.code;
                              const select = document.querySelector('.goog-te-combo');
                              if (select) {
                                select.value = langCode;
                                select.dispatchEvent(new Event('change', { bubbles: true }));
                              }
                              // Robust fallback: Force translation via cookie if event fails, and softly reload
                              document.cookie = `googtrans=/en/${langCode}; path=/;`;
                              document.cookie = `googtrans=/en/${langCode}; domain=.${window.location.hostname}; path=/;`;

                              // Optional: force reload so it picks up the cookie translation immediately
                              // window.location.reload();
                              // But wait, let's try just cookie + reload if it's the safest.
                              setTimeout(() => {
                                window.location.reload();
                              }, 100);

                              setShowLangMenu(false);
                            }}
                            className="w-full text-left px-5 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <span className="text-xl leading-none">{lang.flag}</span>
                            <span className="font-medium text-gray-700 text-sm">{lang.name}</span>
                          </button>
                        ))}

                      {[
                        { code: 'en', name: 'English', flag: '🇬🇧' },
                        { code: 'bn', name: 'Bengali', flag: '🇧🇩' },
                        { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
                        { code: 'fr', name: 'French', flag: '🇫🇷' },
                        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
                      ].filter((lang) => lang.name.toLowerCase().includes(langSearchQuery.toLowerCase())).length === 0 && (
                          <div className="px-5 py-3 text-sm text-gray-500 text-center">
                            No languages found
                          </div>
                        )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Menu button with 3 bars and profile icon - wrapped in relative container */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 border border-gray-300 rounded-full py-1.5 px-2 pr-1.5 hover:shadow-md transition-shadow relative"
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

                {/* Profile icon — shows avatar/initials when logged in */}
                <div className="relative w-7 h-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {isAuthenticated && user ? (
                    user.profile_picture || user.avatar ? (
                      <img
                        src={user.profile_picture || user.avatar}
                        alt={user.first_name}
                        className="w-full h-full object-cover rounded-full"
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold select-none"
                        style={{ background: 'linear-gradient(135deg, #E73367 0%, #ff6b9d 100%)' }}
                      >
                        {(user.first_name?.[0] || '').toUpperCase()}{(user.last_name?.[0] || '').toUpperCase()}
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full bg-gray-500 rounded-full flex items-center justify-center">
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
                  )}

                </div>
                {isAuthenticated && Object.values(notificationCounts || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center border border-white">
                    {Object.values(notificationCounts || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)}
                  </span>
                )}
              </button>

              {/* Dropdown Modal */}
              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 max-h-[70vh] overflow-y-auto bg-white rounded-2xl shadow-xl py-2 z-[90001] border border-gray-200">
                  {isAuthenticated ? (
                    <>
                      {/* Authenticated user info */}
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {user?.email}
                        </p>
                        <p className="text-xs text-primary-600 mt-1 font-medium">
                          {isAdmin() ? 'Administrator' : isPropertyOwner() ? 'Property Owner' : user?.user_type === 'staff' ? 'Staff' : 'Guest'}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/help"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Help Center
                        </Link>
                        <Link
                          to={isAdmin() ? '/admin' : isPropertyOwner() ? '/property-owner' : user?.user_type === 'staff' ? '/staff/attendance' : '/guest'}
                          onClick={() => setIsProfileOpen(false)}
                          className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
                        >
                          <span>Dashboard</span>
                          {Object.values(notificationCounts || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {Object.values(notificationCounts || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)}
                            </span>
                          )}
                        </Link>
                        {user?.user_type !== 'admin' && (
                          <Link
                            to="/messages"
                            onClick={() => setIsProfileOpen(false)}
                            className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
                          >
                            <span>Messages</span>
                            {(notificationCounts?.unreadMessages || 0) > 0 && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {notificationCounts.unreadMessages}
                              </span>
                            )}
                          </Link>
                        )}
                        <Link
                          to={isAdmin() ? '/admin/settings' : isPropertyOwner() ? '/property-owner/profile' : '/guest/profile'}
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Profile
                        </Link>
                      </div>

                      <div className="border-t border-gray-200 pt-1">
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
                        <Link
                          to="/help"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
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
                        </Link>

                        <button
                          onClick={handleBecomeHost}
                          className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
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
                        </button>

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
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            setAuthModalMode('login');
                            setAuthModalOpen(true);
                          }}
                          className="block w-full text-left px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          Log in
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            setAuthModalMode('register');
                            setAuthModalOpen(true);
                          }}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Sign up
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu and CTA button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              (!isAdmin() && !isPropertyOwner() && user?.user_type !== 'staff') ? (
                <button onClick={handleBecomeHost} className="text-[11px] sm:text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full whitespace-nowrap">
                  Become host
                </button>
              ) : (isAdmin() || isPropertyOwner()) ? (
                <Link to={isAdmin() ? '/admin' : '/property-owner'} className="text-[11px] sm:text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full whitespace-nowrap">
                  {isPropertyOwner() ? 'Switch to host' : 'Dashboard'}
                </Link>
              ) : null
            ) : (
              <button onClick={handleBecomeHost} className="text-[11px] sm:text-xs font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full whitespace-nowrap hidden sm:block">
                Become host
              </button>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 px-1"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Home page, Search page, and Property Detail page desktop search bar inside header */}
        {/* Home page, Search page, and Property Detail page desktop search bar inside header */}
        {(isHome || isSearchPage || isPropertyDetail || isContactHost) && headerActiveType !== 'flight' && (
          <div className={`hidden md:block home-nav-search static z-[90000] overflow-visible ${isHeaderSearchActive || (!isDetailOrContact && !isSearchPage) ? 'py-3' : 'py-0'}`}>
            {/* Flight / Bus Trip Type Toggles */}
            {(headerActiveType === 'flight' || headerActiveType === 'bus') && (
              <div className={`flex items-center gap-6 mb-4 pl-6 ${headerActiveType === 'flight' || headerActiveType === 'bus' ? 'max-w-6xl' : 'max-w-4xl'} mx-auto transition-all duration-300 ${!isHeaderSearchActive && (isDetailOrContact || isSearchPage) ? 'opacity-0 h-0 overflow-hidden -mt-4' : 'opacity-100'}`}>
                <label
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => {
                    setFlightSearchData(prev => ({ ...prev, tripType: 'oneWay' }));
                    setSearchData(prev => ({ ...prev, checkOut: null }));
                  }}
                >
                  <div className={`w-5 h-5 rounded-full border-[5px] transition-all bg-white ${flightSearchData.tripType === 'oneWay' ? 'border-[#1e2049]' : 'border-gray-300'}`}></div>
                  <span className={`text-sm font-bold transition-colors ${flightSearchData.tripType === 'oneWay' ? 'text-[#1e2049]' : 'text-gray-400 group-hover:text-gray-600'}`}>One Way</span>
                </label>
                <label
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => setFlightSearchData(prev => ({ ...prev, tripType: 'roundTrip' }))}
                >
                  <div className={`w-5 h-5 rounded-full border-[5px] transition-all bg-white ${flightSearchData.tripType === 'roundTrip' || !flightSearchData.tripType ? 'border-[#1e2049]' : 'border-gray-300'}`}></div>
                  <span className={`text-sm font-bold transition-colors ${flightSearchData.tripType === 'roundTrip' || !flightSearchData.tripType ? 'text-[#1e2049]' : 'text-gray-400 group-hover:text-gray-600'}`}>Round Way</span>
                </label>
                <label
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => {
                    setFlightSearchData(prev => ({ ...prev, tripType: 'multiCity' }));
                    setSearchData(prev => ({ ...prev, checkOut: null }));
                  }}
                >
                  <div className={`w-5 h-5 rounded-full border-[5px] transition-all bg-white ${flightSearchData.tripType === 'multiCity' ? 'border-[#1e2049]' : 'border-gray-300'}`}></div>
                  <span className={`text-sm font-semibold transition-colors ${flightSearchData.tripType === 'multiCity' ? 'text-[#1e2049] font-bold' : 'text-gray-400 group-hover:text-gray-600'}`}>Multi City</span>
                </label>
              </div>
            )}
            <form
              ref={searchFormRef}
              onSubmit={handleSearch}
              className={`pr-2 static rounded-full border transition-all duration-300 ease-out flex items-center ${headerActiveType === 'flight' || headerActiveType === 'bus' ? 'max-w-6xl' : 'max-w-4xl'} mx-auto z-[90] overflow-visible relative 
                ${isHeaderSearchActive ? 'bg-[#EBEBEB] border-transparent scale-100 opacity-100' : 'bg-white shadow-md border-gray-200'} 
                ${!isHeaderSearchActive && (isDetailOrContact || isSearchPage) ? 'scale-0 opacity-0 pointer-events-none h-0 p-0 overflow-hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}
              `}
            >  <div ref={headerPillSegmentsRef} className="relative flex items-center flex-1 min-w-0">
                <div
                  className={`pointer-events-none absolute top-0 bottom-0 left-0 rounded-full transition-all duration-300 ease-out ${headerActivePillStyle.visible ? 'opacity-100' : 'opacity-0'} ${isActivePill ? 'bg-white shadow-md' : 'bg-gray-50'}`}
                  style={{ transform: `translateX(${headerActivePillStyle.x}px)`, width: headerActivePillStyle.w }}
                />

                <div
                  ref={headerWhereRef}
                  className="flex items-center flex-1 min-w-0 h-full px-7 py-3 transition-colors duration-300 ease-out relative rounded-full cursor-pointer z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHeaderSearchActive(true);
                    setShowHeaderLocationSuggestions(true);
                    setShowHeaderToSuggestions(false);
                    setHeaderDateOpen(false);
                    setShowGuestsDropdown(false);
                  }}
                  onMouseEnter={() => setHeaderHoverSection('location')}
                  onMouseLeave={() => setHeaderHoverSection(null)}
                >
                  <div className="w-full">
                    <div className="text-xs font-semibold text-gray-900">
                      {headerActiveType === 'flight' || headerActiveType === 'bus' ? 'From' : 'Where'}
                    </div>
                    <input
                      type="text"
                      value={searchData.location}
                      onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Search destinations"
                      ref={headerLocationInputRef}
                      onFocus={() => {
                        setIsHeaderSearchActive(true);
                        setShowHeaderLocationSuggestions(true);
                        setHeaderDateOpen(false);
                        setShowGuestsDropdown(false);
                      }}
                      className={`w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none cursor-pointer ${effectiveHeaderSection === 'location' && hasLocation ? 'pr-8' : ''}`}
                    />
                    {showHeaderLocationSuggestions && (
                      <div
                        ref={headerLocationSuggestionsRef}
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-[9999]"
                      >
                        <div className="px-5 pt-4 pb-2 border-b border-gray-50">
                          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Suggested destinations</h3>
                        </div>
                        {headerActiveType === 'flight' ? (
                          // Airport Suggestions for 'From'
                          getAirportSuggestions(searchData.location).map((a, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newLocation = `${a.shortName} (${a.code})`;
                                setSearchData(prev => ({
                                  ...prev,
                                  location: newLocation,
                                  fromCode: a.code // Added extra codes if needed by backend
                                }));

                                // Save to localStorage for persistence
                                const searchState = {
                                  ...searchData,
                                  location: newLocation,
                                  fromCode: a.code,
                                  propertyType: headerActiveType
                                };
                                localStorage.setItem('searchState', JSON.stringify(searchState));
                                window.dispatchEvent(new CustomEvent('searchStateUpdated', { detail: searchState }));

                                setShowHeaderLocationSuggestions(false);
                                setShowHeaderToSuggestions(true);
                                setTimeout(() => {
                                  headerToInputRef.current?.focus();
                                }, 100);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-pink-50 active:bg-pink-50 transition-colors flex items-start gap-3"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden flex-shrink-0">
                                <FiMapPin className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">{a.shortName}</div>
                                <div className="text-xs text-gray-500 truncate">{a.name}</div>
                              </div>
                              <div className="text-xs font-bold text-[#E41D57]">{a.code}</div>
                            </button>
                          ))
                        ) : (
                          // Standard Property Suggestions
                          searchData.location && searchData.location.trim().length >= 2 && placePredictions.length > 0 ? (
                            <>
                              {placePredictions.map((pred, idx) => (
                                <button
                                  key={pred.place_id || idx}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlaceSelect(pred);
                                  }}
                                  className="w-full text-left px-5 py-3 hover:bg-gray-50 active:bg-gray-100 transition-all flex items-center gap-3.5 group border-b border-gray-50/50"
                                >
                                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-500 group-hover:bg-pink-100 group-hover:text-[#E41D57] transition-all duration-300">
                                    <FiMapPin className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors truncate">
                                      {pred.structured_formatting?.main_text || pred.description}
                                    </div>
                                    <div className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors truncate mt-0.5">
                                      {pred.structured_formatting?.secondary_text || ''}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </>
                          ) : locationSuggestionsData && locationSuggestionsData.length > 0 ? (
                            <>
                              {headerActiveType !== 'flight' && (!searchData.location || 'nearby'.includes(searchData.location.toLowerCase())) && (
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={handleNearbyClick}
                                  className="w-full text-left px-5 py-3 hover:bg-gray-50 flex items-center gap-3.5 group transition-colors"
                                >
                                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-500 group-hover:bg-pink-100 group-hover:text-[#E41D57] transition-all duration-300">
                                    <FiMapPin className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors">Nearby</div>
                                    <div className="text-[10px] text-gray-400 group-hover:text-gray-500 transition-colors italic font-normal mt-0.5">Find what's around you using GPS</div>
                                  </div>
                                </button>
                              )}
                              {locationSuggestionsData
                                .filter(loc => {
                                  const query = (searchData.location || '').toLowerCase();
                                  const label = [loc.city, loc.state, loc.country].filter(Boolean).join(', ').toLowerCase();
                                  return !query || label.includes(query);
                                })
                                .slice(0, 8)
                                .map((loc, idx) => {
                                  const label = [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
                                  return (
                                    <button
                                      key={`${label}-${idx}`}
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newLocation = loc.city || label;
                                        setSearchData(prev => ({
                                          ...prev,
                                          location: newLocation,
                                          latitude: null,
                                          longitude: null
                                        }));
                                        // Save to localStorage for persistence
                                        const searchState = {
                                          ...searchData,
                                          location: newLocation,
                                          latitude: null,
                                          longitude: null,
                                          locationTo: searchData.locationTo, // Added for 'To' field
                                          checkIn: searchData.checkIn ? formatDateLocal(searchData.checkIn) : null,
                                          checkOut: searchData.checkOut ? formatDateLocal(searchData.checkOut) : null,
                                          guests: searchData.guests,
                                          flightClass: searchData.flightClass // Added for Flight Class
                                        };
                                        localStorage.setItem('searchState', JSON.stringify(searchState));
                                        window.dispatchEvent(new CustomEvent('searchStateUpdated', { detail: searchState }));

                                        setShowHeaderLocationSuggestions(false);

                                        if (headerActiveType === 'flight') {
                                          // Flight mode: Auto-open 'Where to' suggestions
                                          setShowHeaderToSuggestions(true);
                                          setTimeout(() => {
                                            headerToInputRef.current?.focus();
                                          }, 100);
                                        } else {
                                          // Standard mode: Auto-open calendar
                                          setTimeout(() => {
                                            setHeaderDateOpen(true);
                                            setShowGuestsDropdown(false);
                                          }, 100);
                                        }
                                      }}
                                      className="w-full text-left px-5 py-3 hover:bg-gray-50 active:bg-gray-100 transition-all flex items-center gap-3.5 group border-b border-gray-50/50"
                                    >
                                      <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-500 group-hover:bg-pink-100 group-hover:text-[#E41D57] transition-all duration-300">
                                        <FiMapPin className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors truncate">{loc.city}</div>
                                        <div className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors truncate mt-0.5">{[loc.state, loc.country].filter(Boolean).join(', ')}</div>
                                        <div className="text-[10px] text-gray-400 group-hover:text-gray-500 transition-colors italic font-normal mt-0.5 truncate">{getLocationSubtitle(loc.city)}</div>
                                      </div>
                                    </button>
                                  );
                                })}
                            </>
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">No locations found</div>
                          )
                        )}
                        {headerActiveType === 'flight' && searchData.location && searchData.location.length >= 2 && getAirportSuggestions(searchData.location).length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 italic text-center">No airports found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {effectiveHeaderSection === 'location' && hasLocation && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsHeaderSearchActive(true);
                        setSearchData((prev) => ({ ...prev, location: '' }));
                        persistSearchState({
                          location: '',
                          locationTo: searchData.locationTo, // Added for 'To' field
                          checkIn: searchData.checkIn ? formatDateLocal(searchData.checkIn) : null,
                          checkOut: searchData.checkOut ? formatDateLocal(searchData.checkOut) : null,
                          guests: searchData.guests || 1,
                          flightClass: searchData.flightClass // Added for Flight Class
                        });
                        setShowHeaderLocationSuggestions(true);
                        setHeaderDateOpen(false);
                        setShowGuestsDropdown(false);
                        if (headerLocationInputRef.current) {
                          headerLocationInputRef.current.focus({ preventScroll: true });
                        }
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                      aria-label="Clear location"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}

                </div>

                {/* TO Field (Flight & Bus) */}
                {(headerActiveType === 'flight' || headerActiveType === 'bus') && (
                  <>
                    <div className={`h-8 w-px bg-gray-200 transition-opacity duration-300 ease-out`} />
                    <div
                      ref={headerToRef}
                      className="flex items-center flex-1 min-w-0 h-full px-7 py-3 transition-colors duration-300 ease-out relative rounded-full cursor-pointer z-10"
                      onClick={() => {
                        setIsHeaderSearchActive(true);
                        setShowHeaderToSuggestions(true);
                        setShowHeaderLocationSuggestions(false);
                        setHeaderDateOpen(false);
                        setShowGuestsDropdown(false);
                      }}
                      onMouseEnter={() => setHeaderHoverSection('to')}
                      onMouseLeave={() => setHeaderHoverSection(null)}
                    >
                      <div className="w-full">
                        <div className="text-xs font-semibold text-gray-900">To</div>
                        <input
                          type="text"
                          value={searchData.locationTo || ''}
                          onChange={(e) => setSearchData(prev => ({ ...prev, locationTo: e.target.value }))}
                          placeholder="Search destinations"
                          ref={headerToInputRef}
                          onFocus={() => {
                            setIsHeaderSearchActive(true);
                            setShowHeaderToSuggestions(true);
                            setShowHeaderLocationSuggestions(false);
                            setHeaderDateOpen(false);
                            setShowGuestsDropdown(false);
                          }}
                          className={`w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none cursor-pointer`}
                        />
                        {showHeaderToSuggestions && (
                          <div
                            ref={headerToSuggestionsRef}
                            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 max-h-96 overflow-y-auto z-[9999]"
                          >
                            <div className="px-4 pt-4 pb-2">
                              <h3 className="text-sm font-semibold text-gray-900">Suggested</h3>
                            </div>
                            {headerActiveType === 'flight' ? (
                              // Airport Suggestions for 'To'
                              getAirportSuggestions(searchData.locationTo).map((a, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newLocation = `${a.shortName} (${a.code})`;
                                    setSearchData(prev => ({
                                      ...prev,
                                      locationTo: newLocation,
                                      toCode: a.code
                                    }));
                                    setShowHeaderToSuggestions(false);
                                    setTimeout(() => setHeaderDateOpen(true), 100);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-pink-50 active:bg-pink-50 transition-colors flex items-start gap-3"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden flex-shrink-0">
                                    <FiMapPin className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 truncate">{a.shortName}</div>
                                    <div className="text-xs text-gray-500 truncate">{a.name}</div>
                                  </div>
                                  <div className="text-xs font-bold text-[#E41D57]">{a.code}</div>
                                </button>
                              ))
                            ) : (
                              locationSuggestionsData?.filter(loc => {
                                const query = (searchData.locationTo || '').toLowerCase();
                                const label = [loc.city, loc.state, loc.country].filter(Boolean).join(', ').toLowerCase();
                                return !query || label.includes(query);
                              }).slice(0, 8).map((loc, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newLocation = loc.city || [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
                                    setSearchData(prev => ({ ...prev, locationTo: newLocation }));
                                    setShowHeaderToSuggestions(false);
                                    setTimeout(() => setHeaderDateOpen(true), 100);
                                  }}
                                  className="w-full text-left px-5 py-3 hover:bg-gray-50 active:bg-gray-100 transition-all flex items-center gap-3.5 group border-b border-gray-50/50"
                                >
                                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 text-gray-500 group-hover:bg-pink-100 group-hover:text-[#E41D57] transition-all duration-300">
                                    <FiMapPin className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors truncate">{loc.city}</div>
                                    <div className="text-xs text-gray-400 group-hover:text-gray-500 transition-colors truncate mt-0.5">{[loc.state, loc.country].filter(Boolean).join(', ')}</div>
                                    <div className="text-[10px] text-gray-400 group-hover:text-gray-500 transition-colors italic font-normal mt-0.5 truncate">{getLocationSubtitle(loc.city)}</div>
                                  </div>
                                </button>
                              )) || <div className="px-4 py-3 text-sm text-gray-500">No locations found</div>
                            )}

                            {headerActiveType === 'flight' && searchData.locationTo && searchData.locationTo.length >= 2 && getAirportSuggestions(searchData.locationTo).length === 0 && (
                              <div className="px-4 py-3 text-sm text-gray-500 italic text-center">No airports found</div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Clear Button */}
                      {searchData.locationTo && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchData(prev => ({ ...prev, locationTo: '' }));
                            headerToInputRef.current?.focus();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}

                <div className={`h-8 w-px bg-gray-200 transition-opacity duration-300 ease-out`} />

                <div
                  ref={headerDateRef}
                  className="flex items-center flex-1 min-w-0 h-full px-5 py-3 transition-colors duration-300 ease-out rounded-full cursor-pointer relative z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHeaderSearchActive(true);
                    setHeaderDateOpen(true);
                    setShowHeaderLocationSuggestions(false);
                    setShowHeaderToSuggestions(false);
                    setShowGuestsDropdown(false);
                  }}
                  onMouseEnter={() => setHeaderHoverSection('dates')}
                  onMouseLeave={() => setHeaderHoverSection(null)}
                >
                  <div className="w-full relative">
                    <div className="text-xs font-semibold text-gray-900">
                      {headerActiveType === 'flight'
                        ? (['oneWay', 'multiCity'].includes(flightSearchData.tripType) ? 'Departure Date' : 'Departure & Return Date')
                        : 'When'}
                    </div>
                    <div className={`header-date-display text-sm text-gray-900 pointer-events-none ${effectiveHeaderSection === 'dates' && hasDates ? 'pr-8' : ''}`}>
                      {getDateRangeDisplay() || <span className="text-gray-400">Add dates</span>}
                    </div>
                    <DatePicker
                      selected={searchData.checkIn}
                      onChange={(update) => {
                        const isOneWay = headerActiveType === 'flight' && ['oneWay', 'multiCity'].includes(flightSearchData.tripType);

                        if (isOneWay) {
                          // Single date selection
                          const date = update;
                          setSearchData(prev => ({ ...prev, checkIn: date, checkOut: null }));

                          // Persist
                          const searchState = {
                            location: searchData.location,
                            locationTo: searchData.locationTo,
                            checkIn: date ? formatDateLocal(date) : null,
                            checkOut: null,
                            guests: searchData.guests,
                            flightClass: searchData.flightClass
                          };
                          localStorage.setItem('searchState', JSON.stringify(searchState));
                          window.dispatchEvent(new CustomEvent('searchStateUpdated', { detail: searchState }));

                          // Auto advance
                          if (date) {
                            setTimeout(() => {
                              setHeaderDateOpen(false);
                              setShowGuestsDropdown(true);
                              setShowHeaderLocationSuggestions(false);
                            }, 100);
                          }
                        } else {
                          // Range selection
                          const [start, end] = update;
                          setSearchData(prev => ({ ...prev, checkIn: start, checkOut: end }));
                          // Save to localStorage for persistence
                          const searchState = {
                            location: searchData.location,
                            locationTo: searchData.locationTo, // Added for 'To' field
                            checkIn: start ? formatDateLocal(start) : null,
                            checkOut: end ? formatDateLocal(end) : null,
                            guests: searchData.guests,
                            flightClass: searchData.flightClass // Added for Flight Class
                          };
                          localStorage.setItem('searchState', JSON.stringify(searchState));
                          window.dispatchEvent(new CustomEvent('searchStateUpdated', { detail: searchState }));

                          if (end) {
                            // Both dates selected - close calendar and open guests
                            setTimeout(() => {
                              setHeaderDateOpen(false);
                              setShowGuestsDropdown(true);
                              setShowHeaderLocationSuggestions(false);
                            }, 100);
                          } else if (start) {
                            // Only check-in selected - keep calendar open
                            setHeaderDateOpen(true);
                            setShowHeaderLocationSuggestions(false);
                            setShowGuestsDropdown(false);
                          }
                        }
                      }}
                      startDate={searchData.checkIn}
                      endDate={headerActiveType === 'flight' && ['oneWay', 'multiCity'].includes(flightSearchData.tripType) ? null : searchData.checkOut}
                      selectsRange={!(headerActiveType === 'flight' && ['oneWay', 'multiCity'].includes(flightSearchData.tripType))}
                      monthsShown={2}
                      minDate={new Date()}
                      placeholderText="Add dates"
                      className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none border-none p-0 cursor-pointer header-date-input-readonly"
                      popperClassName="header-date-popper"
                      calendarClassName="header-date-calendar"
                      open={headerDateOpen}
                      onCalendarOpen={() => {
                        setIsHeaderSearchActive(true);
                        setHeaderDateOpen(true);
                        setShowHeaderLocationSuggestions(false);
                        setShowGuestsDropdown(false);
                      }}
                      onCalendarClose={() => setHeaderDateOpen(false)}
                      dateFormat="MMM dd"
                      onKeyDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.key === 'Tab' || e.key === 'Escape') {
                          return;
                        }
                        setHeaderDateOpen(true);
                      }}
                      onKeyPress={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onInputClick={() => setHeaderDateOpen(true)}
                      readOnly
                    />
                  </div>

                  {effectiveHeaderSection === 'dates' && hasDates && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsHeaderSearchActive(true);
                        setSearchData((prev) => ({ ...prev, checkIn: null, checkOut: null }));
                        persistSearchState({
                          location: searchData.location,
                          locationTo: searchData.locationTo, // Added for 'To' field
                          checkIn: null,
                          checkOut: null,
                          guests: searchData.guests || 1,
                          flightClass: searchData.flightClass // Added for Flight Class
                        });
                        setHeaderDateOpen(true);
                        setShowHeaderLocationSuggestions(false);
                        setShowGuestsDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                      aria-label="Clear dates"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className={`h-8 w-px bg-gray-200 transition-opacity duration-300 ease-out ${hideHeaderSep2 ? 'opacity-0' : 'opacity-100'}`} />

                <div
                  className="flex items-center flex-1 min-w-0 h-full px-4 py-3 transition-colors duration-300 ease-out relative rounded-full cursor-pointer z-10"
                  ref={guestDropdownRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHeaderSearchActive(true);
                    setShowGuestsDropdown(true);
                    setShowHeaderLocationSuggestions(false);
                    setShowHeaderToSuggestions(false); // Close 'To' suggestions
                    setHeaderDateOpen(false);
                  }}
                  onMouseEnter={() => setHeaderHoverSection('guests')}
                  onMouseLeave={() => setHeaderHoverSection(null)}
                >
                  <div
                    className="text-left flex-1 min-w-0 px-3"
                  >
                    <div className="text-xs font-semibold text-gray-900">
                      {headerActiveType === 'flight' ? 'Traveller & Class' : 'Who'}
                    </div>
                    <div className={`text-[10px] text-gray-900 ${effectiveHeaderSection === 'guests' && hasGuests ? 'pr-8' : ''}`}>
                      {headerActiveType === 'flight'
                        ? `${guestCounts.adults + guestCounts.children + guestCounts.kids + guestCounts.infants} Travelers`
                        : `${totalGuests} guest${totalGuests > 1 ? 's' : ''}` + (guestCounts.pets ? `, ${guestCounts.pets} pet${guestCounts.pets > 1 ? 's' : ''}` : '')
                      }
                    </div>
                  </div>

                  {effectiveHeaderSection === 'guests' && hasGuests && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsHeaderSearchActive(true);
                        setGuestCounts({ adults: 1, children: 0, kids: 0, infants: 0, pets: 0 });
                        setSearchData((prev) => ({ ...prev, guests: 1, flightClass: 'Economy' }));
                        persistSearchState({
                          location: searchData.location,
                          locationTo: searchData.locationTo, // Added for 'To' field
                          checkIn: searchData.checkIn ? formatDateLocal(searchData.checkIn) : null,
                          checkOut: searchData.checkOut ? formatDateLocal(searchData.checkOut) : null,
                          guests: 1,
                          flightClass: 'Economy' // Added for Flight Class
                        });
                        setShowGuestsDropdown(true);
                        setShowHeaderLocationSuggestions(false);
                        setHeaderDateOpen(false);
                      }}
                      className="absolute right-[120px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center z-20"
                      aria-label="Clear guests"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="submit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearch(e);
                    }}
                    className={`flex items-center justify-center h-10 rounded-full bg-[#E41D57] text-white shadow-md hover:bg-[#C01A4A] transition-all duration-300 ease-out flex-shrink-0 overflow-hidden ${isHeaderSearchActive ? 'w-[100px] px-4' : 'w-10 px-0'}`}
                  >
                    <FiSearch className={`w-4 h-4 flex-shrink-0 ${isHeaderSearchActive ? 'mr-2' : ''}`} />
                    <span className={`whitespace-nowrap font-bold text-sm transition-all duration-300 ease-out ${isHeaderSearchActive ? 'max-w-[100px] opacity-100' : 'max-w-0 opacity-0 overflow-hidden'}`}>
                      Search
                    </span>
                  </button>

                  {showGuestsDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-[400px] bg-white rounded-2xl shadow-xl border border-gray-100 z-[200] p-6 space-y-6 text-left">
                      {headerActiveType === 'flight' ? (
                        <>
                          {/* Flight specific travelers */}
                          {[
                            { key: 'adults', label: 'Adults', subtitle: '12 years & above' },
                            { key: 'children', label: 'Children', subtitle: '5 to 11 years' },
                            { key: 'kids', label: 'Kids', subtitle: '2 to 4 years' },
                            { key: 'infants', label: 'Infants', subtitle: 'Below 2 years' }
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between">
                              <div>
                                <div className="text-base font-semibold text-gray-900">{item.label}</div>
                                <div className="text-sm text-gray-500">{item.subtitle}</div>
                              </div>
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => updateGuests(item.key, -1)}
                                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${guestCounts[item.key] > (item.key === 'adults' ? 1 : 0) ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                  disabled={guestCounts[item.key] <= (item.key === 'adults' ? 1 : 0)}
                                >
                                  <FiMinus className="w-4 h-4" />
                                </button>
                                <span className="min-w-[24px] text-center text-base font-medium text-gray-900">{guestCounts[item.key]}</span>
                                <button
                                  type="button"
                                  onClick={() => updateGuests(item.key, 1)}
                                  className="w-9 h-9 rounded-full bg-[#10B981] text-white hover:bg-[#059669] flex items-center justify-center transition-all"
                                >
                                  <FiPlus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}

                          <div className="border-t border-gray-200 my-4 pt-4">
                            <div className="text-base font-semibold text-gray-900 mb-3">Cabin Class</div>
                            <div className="grid grid-cols-2 gap-3">
                              {['Economy', 'Business', 'First Class'].map(cls => (
                                <button
                                  key={cls}
                                  type="button"
                                  onClick={() => setSearchData(prev => ({ ...prev, flightClass: cls }))}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${searchData.flightClass === cls ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-900'}`}
                                >
                                  {cls}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Standard Guests */
                        [
                          { key: 'adults', label: 'Adults', subtitle: 'Ages 13 or above' },
                          { key: 'children', label: 'Children', subtitle: 'Ages 2 – 12' },
                          { key: 'infants', label: 'Infants', subtitle: 'Under 2' },
                          { key: 'pets', label: 'Pets', subtitle: 'Bringing a service animal?' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div>
                              <div className="text-base font-semibold text-gray-900">{item.label}</div>
                              <div className="text-sm text-gray-500">{item.subtitle}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => updateGuests(item.key, -1)}
                                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${guestCounts[item.key] > (item.key === 'adults' ? 1 : 0) ? 'text-gray-700 border-gray-300 bg-white hover:bg-gray-100' : 'text-gray-300 border-gray-200 bg-gray-50 cursor-not-allowed'}`}
                                disabled={guestCounts[item.key] <= (item.key === 'adults' ? 1 : 0)}
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <span className="min-w-[24px] text-center text-base font-medium text-gray-900">{guestCounts[item.key]}</span>
                              <button
                                type="button"
                                onClick={() => updateGuests(item.key, 1)}
                                className="w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

              </div>
            </form>
          </div>
        )
        }

        {/* Mobile Navigation */}
        {
          isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                {/* Public Navigation */}
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${isActive(link.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* User Role-based menu for mobile */}
                {isAuthenticated && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {isAdmin() ? 'Admin Panel' : isPropertyOwner() ? 'Property Owner' : 'My Account'}
                    </div>
                    {getRoleBasedMenu().map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center justify-between px-3 py-2 text-base font-medium transition-colors duration-200 ${isActive(item.path)
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>{item.name}</span>
                        {getNotificationCount(item.name) > 0 && (
                          <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {getNotificationCount(item.name)}
                          </span>
                        )}
                      </Link>
                    ))}
                  </>
                )}

                {/* Mobile Host/Dashboard CTA */}
                <div className="border-t border-gray-200 my-2"></div>
                {isAuthenticated ? (
                  (!isAdmin() && !isPropertyOwner()) ? (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleBecomeHost();
                      }}
                      className="block w-full text-left px-3 py-3 text-base font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg mb-2"
                    >
                      Become a host
                    </button>
                  ) : (
                    <Link
                      to={isAdmin() ? '/admin' : '/property-owner'}
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-left px-3 py-3 text-base font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg mb-2"
                    >
                      {isPropertyOwner() ? 'Switch to host' : 'Switch to dashboard'}
                    </Link>
                  )
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleBecomeHost();
                    }}
                    className="block w-full text-left px-3 py-3 text-base font-bold text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg mb-2"
                  >
                    Become a host
                  </button>
                )}

                {/* Mobile Auth Section */}
                <div className="pt-4 border-t border-gray-200">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2 text-sm text-gray-500">
                        {user?.email}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      >
                        <FiLogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setAuthModalMode('login');
                          setAuthModalOpen(true);
                        }}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                      >
                        Login
                      </button>
                      {settings?.registration_enabled !== false && (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            setAuthModalMode('register');
                            setAuthModalOpen(true);
                          }}
                          className="block w-full text-left mt-1 px-3 py-2 text-base font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Sign Up
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }
      </div >
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authModalMode} />
    </nav >
  );
};

export default Navbar;