import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  FiTruck, FiSearch, FiMapPin, FiCalendar, FiUsers, FiStar, FiWifi, FiCoffee, FiShield,
  FiTv, FiHome, FiDroplet, FiSun, FiEye, FiUser, FiLogOut, FiSettings, FiHeart, FiBookOpen,
  FiChevronDown, FiDollarSign, FiChevronLeft, FiChevronRight, FiWind, FiThermometer,
  FiMonitor, FiLock, FiKey, FiClock, FiPackage, FiArrowUp, FiZap, FiRadio, FiMusic,
  FiVideo, FiX, FiBriefcase, FiGrid, FiCheck, FiMinus, FiPlus, FiSend
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import useSettingsStore from '../store/settingsStore';
import useAuthStore from '../store/authStore';
import StickySearchHeader from '../components/layout/StickySearchHeader';
import PropertyImageSlider from '../components/property/PropertyImageSlider';
import { getRecentlyViewed } from '../utils/recentlyViewed';

// Category Section Component
const CategorySection = ({ category, checkCarouselScroll, activePropertyType }) => {
  const navigate = useNavigate();
  const categoryCarouselRef = useRef(null);
  const [canScrollPrevCat, setCanScrollPrevCat] = useState(false);
  const [canScrollNextCat, setCanScrollNextCat] = useState(false);

  const { data: categoryProperties, isLoading: isLoadingCategoryProperties } = useQuery(
    [`category-properties`, category.id],
    () => api.get(`/guest/display-categories/${category.id}/properties?limit=10`),
    {
      select: (response) => {
        const properties = response.data?.data?.properties || [];
        console.log(`Category ${category.name} properties:`, properties);
        return properties;
      },
      enabled: !!category.id && category.property_count > 0,
    }
  );

  const filteredCategoryProperties = useMemo(() => {
    const type = (activePropertyType || '').toLowerCase();
    if (!type) return categoryProperties || [];
    return (categoryProperties || []).filter((p) => {
      const pt = (p?.property_type || p?.propertyType || '').toString().toLowerCase();
      return pt === type || pt.includes(type) || type.includes(pt);
    });
  }, [categoryProperties, activePropertyType]);

  const scrollCategoryCarousel = (direction) => {
    if (categoryCarouselRef.current) {
      const isMobile = window.innerWidth < 640;
      const containerWidth = categoryCarouselRef.current.clientWidth;
      const gap = 16;

      let scrollAmount;
      if (isMobile) {
        scrollAmount = containerWidth;
      } else {
        const firstCard = categoryCarouselRef.current.querySelector('[data-carousel-card]');
        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 260;
        scrollAmount = cardWidth + gap;
      }

      const currentScroll = categoryCarouselRef.current.scrollLeft;
      const maxScroll = categoryCarouselRef.current.scrollWidth - categoryCarouselRef.current.clientWidth;

      let newScroll;
      if (direction === 'next') {
        newScroll = Math.min(currentScroll + scrollAmount, maxScroll);
      } else {
        newScroll = Math.max(currentScroll - scrollAmount, 0);
      }

      categoryCarouselRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });

      setTimeout(() => {
        checkCarouselScroll(categoryCarouselRef.current, setCanScrollPrevCat, setCanScrollNextCat);
      }, 300);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      checkCarouselScroll(categoryCarouselRef.current, setCanScrollPrevCat, setCanScrollNextCat);
    };

    const handleResize = () => {
      setTimeout(() => {
        checkCarouselScroll(categoryCarouselRef.current, setCanScrollPrevCat, setCanScrollNextCat);
      }, 100);
    };

    const carousel = categoryCarouselRef.current;
    if (carousel && filteredCategoryProperties && filteredCategoryProperties.length > 0) {
      carousel.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      // Initial check after a small delay to ensure DOM is ready
      setTimeout(() => {
        checkCarouselScroll(carousel, setCanScrollPrevCat, setCanScrollNextCat);
      }, 100);
    }

    return () => {
      if (carousel) carousel.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [filteredCategoryProperties, checkCarouselScroll]);

  if (isLoadingCategoryProperties) {
    return (
      <section className="pt-0 pb-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[260px]">
                <div className="card">
                  <div className="loading-skeleton h-48 mb-4 rounded-lg"></div>
                  <div className="loading-skeleton h-4 mb-2"></div>
                  <div className="loading-skeleton h-4 w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!filteredCategoryProperties || filteredCategoryProperties.length === 0) {
    console.log(`No properties found for category: ${category.name}`);
    return null;
  }

  return (
    <section className="pt-0 pb-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <div className="text-left flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {category.name}
            </h2>
            {category.description && (
              <p className="text-gray-600 mt-1">{category.description}</p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => scrollCategoryCarousel('prev')}
              disabled={!canScrollPrevCat}
              className={`w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center transition-all shadow-sm active:scale-95 ${canScrollPrevCat
                ? 'hover:bg-gray-50 cursor-pointer text-gray-700'
                : 'opacity-50 cursor-not-allowed text-gray-400'
                }`}
              aria-label="Previous"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCategoryCarousel('next')}
              disabled={!canScrollNextCat}
              className={`w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center transition-all shadow-sm active:scale-95 ${canScrollNextCat
                ? 'hover:bg-gray-50 cursor-pointer text-gray-700'
                : 'opacity-50 cursor-not-allowed text-gray-400'
                }`}
              aria-label="Next"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={categoryCarouselRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredCategoryProperties.map((property) => (
            <div
              key={property.id}
              data-carousel-card
              className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[260px] lg:w-[calc((100%-80px)/6)] cursor-pointer snap-start"
              onClick={() => navigate(`/property/${property.id}`)}
            >
              <div className="card-hover h-full">
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <PropertyImageSlider
                    property={property}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full text-sm font-medium z-20 shadow-md">
                    <span className="text-red-600 font-bold">৳{property.base_price}</span>
                    <span className="text-gray-600"> / night</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 flex items-center text-sm">
                    <FiMapPin className="mr-1 flex-shrink-0" />
                    <span className="truncate">{property.city}, {property.state}</span>
                  </p>
                  <div className="flex items-center">
                    {property.average_rating ? (
                      <>
                        <FiStar className="text-pink mr-1 fill-yellow-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{property.average_rating}</span>
                      </>
                    ) : (
                      <>
                        <FiStar className="text-pink mr-1 fill-yellow-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900">New</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const searchFormRef = useRef(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDateContainerRef = useRef(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const carouselRef = useRef(null);
  const recentlyViewedCarouselRef = useRef(null);
  const displayCategoryCarouselRefs = useRef({});
  const locationDropdownRef = useRef(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [canScrollPrevRecent, setCanScrollPrevRecent] = useState(false);
  const [canScrollNextRecent, setCanScrollNextRecent] = useState(false);
  const [categoryScrollStates, setCategoryScrollStates] = useState({});
  const [showStickySearchHeader, setShowStickySearchHeader] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileSearchStep, setMobileSearchStep] = useState('location');
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isMobileDatePickerOpen, setIsMobileDatePickerOpen] = useState(false);
  const [showGuestSelection, setShowGuestSelection] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const locationInputRef = useRef(null);
  const guestsSelectRef = useRef(null);

  // Auto-focus location input when mobile search opens
  useEffect(() => {
    if (showMobileSearch && locationInputRef.current) {
      setTimeout(() => {
        locationInputRef.current.focus();
        setShowLocationSuggestions(true);
      }, 100);
    }
  }, [showMobileSearch]);

  const { settings } = useSettingsStore();
  const { user, isAuthenticated, isAdmin, isPropertyOwner, logout } = useAuthStore();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const handleMediaQueryChange = (e) => {
      setIsMobileViewport(e.matches);
    };

    setIsMobileViewport(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQueryChange);
      return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
    }

    mediaQuery.addListener(handleMediaQueryChange);
    return () => mediaQuery.removeListener(handleMediaQueryChange);
  }, []);

  useEffect(() => {
    if (!showMobileSearch) {
      setIsMobileDatePickerOpen(false);
    }
  }, [showMobileSearch]);

  useEffect(() => {
    if (!isMobileViewport || !isMobileDatePickerOpen) return;

    const handleOutside = (event) => {
      if (mobileDateContainerRef.current && !mobileDateContainerRef.current.contains(event.target)) {
        setIsMobileDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [isMobileViewport, isMobileDatePickerOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBasedMenu = () => {
    if (isAdmin()) {
      return [
        { name: 'Admin Dashboard', path: '/admin', icon: FiSettings },
        { name: 'Users', path: '/admin/users', icon: FiUser },
        { name: 'Properties', path: '/admin/properties', icon: FiBookOpen },
        { name: 'Amenities', path: '/admin/amenities', icon: FiSettings },
        { name: 'Display Categories', path: '/admin/display-categories', icon: FiGrid },
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
      return <IconComponent className="w-8 h-8" />;
    }

    for (const [key, Icon] of Object.entries(iconMap)) {
      if (name.includes(key) || key.includes(name)) {
        return <Icon className="w-8 h-8" />;
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
    return <IconComponent className="w-8 h-8" />;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      basic: FiWifi,
      safety: FiShield,
      entertainment: FiTv,
      kitchen: FiCoffee,
      bathroom: FiDroplet,
      outdoor: FiSun,
      accessibility: FiEye
    };
    const IconComponent = icons[category] || FiWifi;
    return <IconComponent className="w-8 h-8" />;
  };

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
          propertyType: ''
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
  const [activePropertyType, setActivePropertyType] = useState('');
  const [airportList, setAirportList] = useState([]);

  // Fetch airport list for mobile flight search
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

  // Fetch featured properties
  const { data: featuredProperties, isLoading } = useQuery(
    'featured-properties',
    () => api.get('/guest/properties?is_featured=true&limit=10'),
    {
      select: (response) => response.data?.data?.properties || [],
    }
  );

  const filteredFeaturedProperties = useMemo(() => {
    const type = (activePropertyType || '').toLowerCase();
    if (!type) return featuredProperties || [];
    return (featuredProperties || []).filter((p) => {
      const pt = (p?.property_type || p?.propertyType || '').toString().toLowerCase();
      return pt === type || pt.includes(type) || type.includes(pt);
    });
  }, [featuredProperties, activePropertyType]);

  // Fetch amenities
  const { data: amenities } = useQuery(
    'amenities',
    () => api.get('/guest/properties/amenities/list'),
    {
      select: (response) => response.data?.data?.amenities || [],
    }
  );

  // Fetch property types for tabs
  const { data: propertyTypes } = useQuery(
    'home-property-types',
    () => api.get('/properties/property-types/list'),
    {
      select: (response) => (response.data?.data?.propertyTypes || []).filter(pt => pt.is_active !== false),
    }
  );

  // Fetch distinct property locations for suggestions
  const { data: locationSuggestionsData } = useQuery(
    'property-locations',
    () => api.get('/properties/locations/list'),
    {
      select: (response) => response.data?.data?.locations || [],
    }
  );

  useEffect(() => {
    if (propertyTypes && propertyTypes.length > 0 && !activePropertyType) {
      setActivePropertyType((propertyTypes[0].name || '').toLowerCase());
    }
  }, [propertyTypes, activePropertyType]);

  // Listen for navbar tab clicks and sync active property type
  useEffect(() => {
    const handleSetType = (e) => {
      if (e.detail) setActivePropertyType(e.detail);
    };
    window.addEventListener('setActivePropertyType', handleSetType);
    return () => window.removeEventListener('setActivePropertyType', handleSetType);
  }, []);

  // Notify navbar about active type changes
  useEffect(() => {
    if (activePropertyType) {
      window.dispatchEvent(new CustomEvent('activePropertyTypeChanged', { detail: activePropertyType }));
    }
  }, [activePropertyType]);

  // Show sticky search header on scroll (desktop only) with hysteresis to reduce jitter
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      const showThreshold = 140;
      const hideThreshold = 90;
      setShowStickySearchHeader((prev) => {
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

  const formatDateLocal = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleHomeSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (activePropertyType === 'flight') {
      if (searchData.tripType) params.append('trip_type', searchData.tripType);
      if (searchData.from) params.append('from', searchData.fromCode || searchData.from);
      if (searchData.to) params.append('to', searchData.toCode || searchData.to);
      if (searchData.departDate) params.append('depart', formatDateLocal(searchData.departDate));
      if (searchData.returnDate) params.append('return', formatDateLocal(searchData.returnDate));
      params.append('travelers', searchData.guests || 1);
      if (searchData.flightClass) params.append('class', searchData.flightClass);
    } else {
      if (searchData.location) params.append('city', searchData.location);
      if (searchData.checkIn) params.append('check_in_date', formatDateLocal(searchData.checkIn));
      if (searchData.checkOut) params.append('check_out_date', formatDateLocal(searchData.checkOut));
      if (searchData.guests) params.append('min_guests', searchData.guests);
    }

    if (activePropertyType) params.append('property_type', activePropertyType);

    // Save search state to localStorage for persistence
    const searchState = {
      ...searchData,
      location: searchData.location,
      checkIn: searchData.checkIn ? formatDateLocal(searchData.checkIn) : null,
      checkOut: searchData.checkOut ? formatDateLocal(searchData.checkOut) : null,
      guests: searchData.guests,
      propertyType: activePropertyType,
      tripType: searchData.tripType
    };
    localStorage.setItem('searchState', JSON.stringify(searchState));

    navigate(`${activePropertyType === 'flight' ? '/flight/results' : '/search'}?${params.toString()}`);
  };

  const getTypeIcon = (typeName, isActive = false) => {
    const normalized = (typeName || '').toLowerCase();

    let imgSrc = '/images/nav-icon-room.png'; // Default fallback

    if (normalized.includes('apartment') || normalized.includes('villa') || normalized.includes('house') || normalized.includes('home')) {
      imgSrc = '/images/nav-icon-apartment.png';
    } else if (normalized.includes('hotel')) {
      imgSrc = '/images/nav-icon-hotel.png';
    } else if (normalized.includes('flight')) {
      imgSrc = '/images/flight.png';
    }

    return (
      <img
        src={imgSrc}
        alt={typeName}
        className={`w-5 h-5 object-contain transition-all duration-300 ${isActive
          ? 'opacity-100 grayscale-0'
          : 'opacity-70 grayscale'
          }`}
      />
    );
  };

  // Fetch display categories (public endpoint)
  const { data: displayCategories, isLoading: isLoadingCategories } = useQuery(
    'display-categories',
    () => api.get('/guest/display-categories'),
    {
      select: (response) => {
        const categories = response.data?.data?.categories || [];
        console.log('Display Categories:', categories);
        return categories;
      },
    }
  );

  const handleInputChange = (field, value) => {
    setSearchData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      // Save to localStorage when search data changes
      const searchState = {
        location: updated.location,
        checkIn: updated.checkIn ? formatDateLocal(updated.checkIn) : null,
        checkOut: updated.checkOut ? formatDateLocal(updated.checkOut) : null,
        guests: updated.guests
      };
      localStorage.setItem('searchState', JSON.stringify(searchState));
      return updated;
    });
  };

  const getDateRangeDisplay = () => {
    if (searchData.checkIn && searchData.checkOut) {
      const start = searchData.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = searchData.checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}`;
    } else if (searchData.checkIn) {
      return searchData.checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return null;
  };

  const getGuestsDisplay = () => {
    const totalGuests = searchData.guests || 1;
    return totalGuests > 1 ? `${totalGuests} guests` : 'Add guests';
  };

  // Check scroll position for carousel buttons
  const checkCarouselScroll = (carouselElement, setPrev, setNext) => {
    if (!carouselElement) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselElement;
    setPrev(scrollLeft > 0);
    setNext(scrollLeft < scrollWidth - clientWidth - 10); // 10px threshold
  };

  // Carousel navigation functions
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const isMobile = window.innerWidth < 640;
      const containerWidth = carouselRef.current.clientWidth;
      const gap = 16; // gap-4 = 16px

      // On mobile: scroll by 2 cards (50% of container width each, minus gap)
      // On desktop: scroll by 1 card (260px)
      let scrollAmount;
      if (isMobile) {
        // Mobile: scroll by 2 cards = container width (accounting for padding)
        scrollAmount = containerWidth;
      } else {
        // Desktop: scroll by 1 card
        const firstCard = carouselRef.current.querySelector('[data-carousel-card]');
        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 260;
        scrollAmount = cardWidth + gap;
      }

      const currentScroll = carouselRef.current.scrollLeft;
      const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;

      let newScroll;
      if (direction === 'next') {
        newScroll = Math.min(currentScroll + scrollAmount, maxScroll);
      } else {
        newScroll = Math.max(currentScroll - scrollAmount, 0);
      }

      carouselRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });

      // Update button states after scroll
      setTimeout(() => {
        checkCarouselScroll(carouselRef.current, setCanScrollPrev, setCanScrollNext);
      }, 300);
    }
  };

  // Recently Viewed carousel navigation
  const scrollRecentlyViewedCarousel = (direction) => {
    if (recentlyViewedCarouselRef.current) {
      const isMobile = window.innerWidth < 640;
      const containerWidth = recentlyViewedCarouselRef.current.clientWidth;
      const gap = 16; // gap-4 = 16px

      // On mobile: scroll by 2 cards (50% of container width each, minus gap)
      // On desktop: scroll by 1 card (260px)
      let scrollAmount;
      if (isMobile) {
        // Mobile: scroll by 2 cards = container width (accounting for padding)
        scrollAmount = containerWidth;
      } else {
        // Desktop: scroll by 1 card
        const firstCard = recentlyViewedCarouselRef.current.querySelector('[data-carousel-card]');
        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 260;
        scrollAmount = cardWidth + gap;
      }

      const currentScroll = recentlyViewedCarouselRef.current.scrollLeft;
      const maxScroll = recentlyViewedCarouselRef.current.scrollWidth - recentlyViewedCarouselRef.current.clientWidth;

      let newScroll;
      if (direction === 'next') {
        newScroll = Math.min(currentScroll + scrollAmount, maxScroll);
      } else {
        newScroll = Math.max(currentScroll - scrollAmount, 0);
      }

      recentlyViewedCarouselRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });

      setTimeout(() => {
        checkCarouselScroll(recentlyViewedCarouselRef.current, setCanScrollPrevRecent, setCanScrollNextRecent);
      }, 300);
    }
  };

  // Update button states on scroll and resize
  useEffect(() => {
    const handleCarouselScroll = () => {
      checkCarouselScroll(carouselRef.current, setCanScrollPrev, setCanScrollNext);
    };

    const handleRecentCarouselScroll = () => {
      checkCarouselScroll(recentlyViewedCarouselRef.current, setCanScrollPrevRecent, setCanScrollNextRecent);
    };

    const handleResize = () => {
      setTimeout(() => {
        checkCarouselScroll(carouselRef.current, setCanScrollPrev, setCanScrollNext);
        checkCarouselScroll(recentlyViewedCarouselRef.current, setCanScrollPrevRecent, setCanScrollNextRecent);
      }, 100);
    };

    const carousel = carouselRef.current;
    const recentCarousel = recentlyViewedCarouselRef.current;

    if (carousel) {
      carousel.addEventListener('scroll', handleCarouselScroll);
      checkCarouselScroll(carousel, setCanScrollPrev, setCanScrollNext);
    }

    if (recentCarousel) {
      recentCarousel.addEventListener('scroll', handleRecentCarouselScroll);
      checkCarouselScroll(recentCarousel, setCanScrollPrevRecent, setCanScrollNextRecent);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      if (carousel) carousel.removeEventListener('scroll', handleCarouselScroll);
      if (recentCarousel) recentCarousel.removeEventListener('scroll', handleRecentCarouselScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [filteredFeaturedProperties, recentlyViewedIds, activePropertyType]);

  // Get recently viewed property IDs on mount and refresh periodically
  useEffect(() => {
    const updateRecentlyViewed = () => {
      const recent = getRecentlyViewed(10);
      setRecentlyViewedIds(recent.map(p => p.id));
    };

    // Update on mount
    updateRecentlyViewed();

    // Listen for storage changes (when user views a property in another tab/window)
    const handleStorageChange = (e) => {
      if (e.key === 'recently_viewed_properties' || !e.key) {
        updateRecentlyViewed();
      }
    };

    // Listen for custom event (when user views a property in same tab)
    const handleRecentlyViewedUpdate = () => {
      updateRecentlyViewed();
    };

    // Also refresh when component becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateRecentlyViewed();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('recentlyViewedUpdated', handleRecentlyViewedUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('recentlyViewedUpdated', handleRecentlyViewedUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Fetch recently viewed properties
  const { data: recentlyViewedProperties } = useQuery(
    ['recently-viewed-properties', recentlyViewedIds],
    async () => {
      if (recentlyViewedIds.length === 0) return [];

      // Fetch each property by ID
      const promises = recentlyViewedIds.map(id =>
        api.get(`/properties/${id}`).catch(() => null)
      );
      const results = await Promise.all(promises);

      // Filter out failed requests and extract property data
      return results
        .filter(result => result && result.data?.data?.property)
        .map(result => result.data.data.property);
    },
    {
      enabled: recentlyViewedIds.length > 0,
      select: (properties) => properties || [],
    }
  );

  const filteredRecentlyViewedProperties = useMemo(() => {
    const type = (activePropertyType || '').toLowerCase();
    if (!type) return recentlyViewedProperties || [];
    return (recentlyViewedProperties || []).filter((p) => {
      const pt = (p?.property_type || p?.propertyType || '').toString().toLowerCase();
      return pt === type || pt.includes(type) || type.includes(pt);
    });
  }, [recentlyViewedProperties, activePropertyType]);

  // Update button states when recently viewed properties change
  useEffect(() => {
    if (filteredRecentlyViewedProperties && filteredRecentlyViewedProperties.length > 0) {
      setTimeout(() => {
        checkCarouselScroll(recentlyViewedCarouselRef.current, setCanScrollPrevRecent, setCanScrollNextRecent);
      }, 100);
    }
  }, [filteredRecentlyViewedProperties]);



  return (
    <div className="min-h-screen mobile-footer-spacing">
      {/* Sticky header appears after scroll (desktop only) */}
      {/* Sticky header appears after scroll (desktop only) */}
      <div className="hidden md:block">
        <StickySearchHeader alwaysSticky={true} isVisible={showStickySearchHeader} />
      </div>

      {/* Mobile: sticky search + tabs at top */}
      {propertyTypes && propertyTypes.length > 0 && (
        <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="px-4 pt-3 pb-2">
            <button
              onClick={() => setShowMobileSearch(true)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-full shadow-md px-4 py-3 text-gray-700 font-medium"
            >
              <FiSearch className="w-5 h-5 text-gray-500" />
              <span className="text-sm">Start your search</span>
            </button>
          </div>
          <div className="px-4 pb-2 flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide">
            {propertyTypes.map((type) => {
              const isActive = activePropertyType === (type.name || '').toLowerCase();
              return (
                <button
                  key={type.id}
                  onClick={() => setActivePropertyType((type.name || '').toLowerCase())}
                  className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isActive
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                  <div className="flex flex-col items-center px-2">
                    {getTypeIcon(type.name, isActive)}
                    <span className="text-base font-medium whitespace-nowrap mt-1.5">{type.name}</span>
                    <span
                      className={`mt-1.5 h-[2px] w-full ${isActive ? 'bg-black' : 'bg-transparent'
                        }`}
                    />
                  </div>
                </button>
              );
            })}

            {/* Manual Flight Tab - Moved to End */}
            <button
              onClick={() => navigate('/search?property_type=flight')}
              className="flex flex-col items-center justify-center py-1.5 transition-colors text-gray-500 hover:text-gray-800"
            >
              <div className="flex flex-col items-center px-2">
                <img src="/images/flight.png" alt="Flight" className="w-5 h-5 object-contain transition-all duration-300 opacity-70 grayscale" />
                <span className="text-base font-medium whitespace-nowrap mt-1.5">Flight</span>
                <span className="mt-1.5 h-[2px] w-full bg-transparent" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Desktop hero search removed; search is now in main header */}

      {showMobileSearch && (
        <div className="md:hidden fixed inset-0 bg-[#F7F7F7] z-[5000] flex flex-col">
          {/* Header */}
          {/* Header */}
          <div className="bg-white relative px-4 py-2 border-b border-gray-200 sticky top-0 z-20">
            <button
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 -mr-2 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors z-10"
            >
              <FiX className="w-4 h-4 text-black" />
            </button>

            {/* Property Type Tabs */}
            <div className="flex items-center justify-center gap-6 overflow-x-auto scrollbar-hide px-10 w-full">
              {propertyTypes.map((type) => {
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

              {/* Manual Flight Tab inside Modal - Moved to End */}
              <button
                onClick={() => {
                  setShowMobileSearch(false);
                  navigate('/search?property_type=flight');
                }}
                className="flex flex-col items-center gap-2 min-w-[64px] flex-shrink-0 group cursor-pointer"
              >
                <div className="transition-opacity duration-200 opacity-60 group-hover:opacity-100">
                  <img src="/images/flight.png" alt="Flight" className="w-5 h-5 object-contain transition-all duration-300 opacity-70 grayscale" />
                </div>
                <span className="text-xs font-semibold whitespace-nowrap pb-2 border-b-2 transition-all duration-200 text-gray-500 border-transparent group-hover:text-gray-900 group-hover:border-gray-300">
                  Flight
                </span>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 space-y-4">
            {/* Where / From-To Card */}
            <div
              className={`bg-white rounded-2xl transition-all duration-300 overflow-hidden ${mobileSearchStep === 'location' ? 'p-6 shadow-xl border-transparent' : 'p-4 shadow-sm'}`}
              onClick={() => setMobileSearchStep('location')}
            >
              {activePropertyType === 'flight' ? (
                // Flight Mobile Autocomplete
                mobileSearchStep === 'location' ? (
                  <div className="animate-fadeIn">
                    <h3 className="text-2xl font-bold text-black mb-4">Fly from?</h3>
                    <div className="bg-white border rounded-xl p-3 flex items-center gap-3 shadow-sm mb-4">
                      <FiSearch className="text-black w-5 h-5 font-bold" />
                      <input
                        autoFocus
                        className="flex-1 outline-none text-base placeholder-gray-500 font-semibold bg-transparent text-black"
                        placeholder="Departure City or Airport"
                        value={searchData.from || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchData(prev => ({ ...prev, from: val }));
                        }}
                      />
                      {searchData.from && (
                        <button onClick={(e) => { e.stopPropagation(); setSearchData(prev => ({ ...prev, from: '' })); }} className="p-1 bg-gray-200 rounded-full"><FiX className="w-3 h-3 block" /></button>
                      )}
                    </div>
                    {/* From Suggestions */}
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {getAirportSuggestions(searchData.from).map((a, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchData(prev => ({ ...prev, from: `${a.shortName} (${a.code})`, fromCode: a.code }));
                            // Change step to destination
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
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-semibold">From</span>
                    <span className="text-black font-bold">{searchData.from || 'Select origin'}</span>
                  </div>
                )
              ) : (
                // Standard Stay Search
                mobileSearchStep === 'location' ? (
                  <div className="animate-fadeIn">
                    <h3 className="text-2xl font-bold text-black mb-4">Where to?</h3>
                    {/* ... (Existing Where card content) ... */}
                    <div className="bg-white border rounded-xl p-3 flex items-center gap-3 shadow-sm mb-4">
                      <FiSearch className="text-black w-5 h-5 font-bold" />
                      <input
                        autoFocus
                        className="flex-1 outline-none text-base placeholder-gray-500 font-semibold bg-transparent text-black"
                        placeholder="Search destinations"
                        value={searchData.location || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchData(prev => ({ ...prev, location: val }));
                          setShowLocationSuggestions(val.length > 0);
                        }}
                      />
                      {(searchData.location) && (
                        <button onClick={(e) => { e.stopPropagation(); setSearchData(prev => ({ ...prev, location: '' })); }} className="p-1 bg-gray-200 rounded-full"><FiX className="w-3 h-3 block" /></button>
                      )}
                    </div>

                    {/* Suggestions */}
                    {locationSuggestionsData && locationSuggestionsData.length > 0 && (
                      <div className="mt-2 pl-2">
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Suggested destinations</div>
                        <div className="space-y-4">
                          <button className="flex items-center gap-4 w-full text-left" onClick={(e) => { e.stopPropagation(); setSearchData(prev => ({ ...prev, location: 'Nearby' })); setMobileSearchStep('dates'); }}>
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><FiMapPin className="w-5 h-5" /></div>
                            <div className="font-semibold text-gray-700">Nearby</div>
                          </button>
                          {locationSuggestionsData.slice(0, 5).map((loc, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchData(prev => ({ ...prev, location: loc.city }));
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
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-semibold">Where</span>
                    <span className="text-black font-bold">{searchData.location || 'I\'m flexible'}</span>
                  </div>
                )
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
                        value={searchData.to || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSearchData(prev => ({ ...prev, to: val }));
                        }}
                      />
                      {searchData.to && (
                        <button onClick={(e) => { e.stopPropagation(); setSearchData(prev => ({ ...prev, to: '' })); }} className="p-1 bg-gray-200 rounded-full"><FiX className="w-3 h-3 block" /></button>
                      )}
                    </div>
                    {/* To Suggestions */}
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {getAirportSuggestions(searchData.to).map((a, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchData(prev => ({ ...prev, to: `${a.shortName} (${a.code})`, toCode: a.code }));
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
                    <span className="text-black font-bold">{searchData.to || 'Select destination'}</span>
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

                  <div onClick={(e) => e.stopPropagation()}>
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
                      calendarClassName="mobile-date-picker-calendar w-full"
                      wrapperClassName="w-full"
                    />
                  </div>
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
                      const currentValue = item.key === 'adults' ? Math.max(1, searchData.guests || 1) : 0;
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
              onClick={() => handleInputChange('reset', null) || setSearchData(prev => ({ ...prev, location: '', checkIn: null, checkOut: null, guests: 1 }))}
              className="text-base underline font-semibold text-gray-900"
            >
              Clear all
            </button>
            <button
              onClick={(e) => {
                handleHomeSearch(e);
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

      {/* Recently Viewed Properties */}
      {filteredRecentlyViewedProperties && filteredRecentlyViewedProperties.length > 0 && (
        <section className="pt-8 md:pt-10 pb-6 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div className="text-left flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Recently Viewed
                </h2>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => scrollRecentlyViewedCarousel('prev')}
                  disabled={!canScrollPrevRecent}
                  className={`w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center transition-all shadow-sm active:scale-95 ${canScrollPrevRecent
                    ? 'hover:bg-gray-50 cursor-pointer text-gray-700'
                    : 'opacity-50 cursor-not-allowed text-gray-400'
                    }`}
                  aria-label="Previous"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollRecentlyViewedCarousel('next')}
                  disabled={!canScrollNextRecent}
                  className={`w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center transition-all shadow-sm active:scale-95 ${canScrollNextRecent
                    ? 'hover:bg-gray-50 cursor-pointer text-gray-700'
                    : 'opacity-50 cursor-not-allowed text-gray-400'
                    }`}
                  aria-label="Next"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={recentlyViewedCarouselRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredRecentlyViewedProperties.slice(0, 10).map((property) => (
                <div
                  key={property.id}
                  data-carousel-card
                  className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[260px] lg:w-[calc((100%-80px)/6)] cursor-pointer snap-start"
                  onClick={() => navigate(`/property/${property.id}`)}
                >
                  <div className="card-hover h-full">
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                      <PropertyImageSlider
                        property={property}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full text-sm font-medium z-20 shadow-md">
                        <span className="text-red-600 font-bold">৳{property.base_price}</span>
                        <span className="text-gray-600"> per day</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 flex items-center text-sm">
                        <FiMapPin className="mr-1 flex-shrink-0" />
                        <span className="truncate">{property.city}, {property.state}</span>
                      </p>
                      <div className="flex items-center">
                        {property.average_rating ? (
                          <>
                            <FiStar className="text-yellow-400 mr-1 fill-yellow-400 flex-shrink-0" />
                            <span className="font-medium text-gray-900">{property.average_rating}</span>
                          </>
                        ) : (
                          <>
                            <FiStar className="text-yellow-400 mr-1 fill-yellow-400 flex-shrink-0" />
                            <span className="font-medium text-gray-900">New</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Properties */}
      {filteredFeaturedProperties && filteredFeaturedProperties.length > 0 && (
        <section className="pt-8 md:pt-10 pb-6 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div className="text-left flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  Featured Properties
                </h2>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => scrollCarousel('prev')}
                  disabled={!canScrollPrev}
                  className={`w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center transition-all shadow-sm active:scale-95 ${canScrollPrev
                    ? 'hover:bg-gray-50 cursor-pointer text-gray-700'
                    : 'opacity-50 cursor-not-allowed text-gray-400'
                    }`}
                  aria-label="Previous"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollCarousel('next')}
                  disabled={!canScrollNext}
                  className={`w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center transition-all shadow-sm active:scale-95 ${canScrollNext
                    ? 'hover:bg-gray-50 cursor-pointer text-gray-700'
                    : 'opacity-50 cursor-not-allowed text-gray-400'
                    }`}
                  aria-label="Next"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth" ref={carouselRef}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} data-carousel-card className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[260px] lg:w-[calc((100%-80px)/6)] snap-start">
                    <div className="card">
                      <div className="loading-skeleton h-48 mb-4 rounded-lg"></div>
                      <div className="loading-skeleton h-4 mb-2"></div>
                      <div className="loading-skeleton h-4 w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredFeaturedProperties?.slice(0, 10).map((property) => (
                  <div
                    key={property.id}
                    data-carousel-card
                    className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[260px] lg:w-[calc((100%-80px)/6)] cursor-pointer snap-start"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    <div className="card-hover h-full">
                      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                        <PropertyImageSlider
                          property={property}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full text-sm font-medium z-20 shadow-md">
                          <span className="text-red-600 font-bold">৳{property.base_price}</span>
                          <span className="text-gray-600"> per day</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 flex items-center text-sm">
                          <FiMapPin className="mr-1 flex-shrink-0" />
                          <span className="truncate">{property.city}, {property.state}</span>
                        </p>
                        <div className="flex items-center">
                          {property.average_rating ? (
                            <>
                              <FiStar className="text-yellow-400 mr-1 fill-yellow-400 flex-shrink-0" />
                              <span className="font-medium text-gray-900">{property.average_rating}</span>
                            </>
                          ) : (
                            <>
                              <FiStar className="text-yellow-400 mr-1 fill-yellow-400 flex-shrink-0" />
                              <span className="font-medium text-gray-900">New</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Display Categories Sections */}
      {!isLoadingCategories && displayCategories && displayCategories.length > 0 && displayCategories
        .filter(category => {
          const shouldShow = category.is_active && category.property_count > 0;
          if (!shouldShow) {
            console.log('Category filtered out:', category.name, { is_active: category.is_active, property_count: category.property_count });
          }
          return shouldShow;
        })
        .map((category) => (
          <CategorySection key={category.id} category={category} checkCarouselScroll={checkCarouselScroll} activePropertyType={activePropertyType} />
        ))}

      {/* Amenities Section */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Popular Amenities
            </h2>
            <p className="text-xl text-gray-600">
              Find properties with the amenities you love
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {amenities?.slice(0, 12).map((amenity) => {
              const IconElement = getAmenityIcon(amenity.name, amenity.category);
              return (
                <div
                  key={amenity.id}
                  className="bg-white rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/search?amenities=${amenity.id}`)}
                >
                  <div className="flex items-center py-1">
                    <div className="text-gray-600 mr-2 flex-shrink-0 text-sm">
                      {React.cloneElement(IconElement, { className: 'w-4 h-4' })}
                    </div>
                    <span className="text-gray-700 text-[0.7rem]">{amenity.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-10 pb-6 md:py-10 bg-white text-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Ready to Book Your Stay?
          </h2>
          <p className="text-xl mb-6 text-gray-600">
            Join thousands of satisfied guests who have found their perfect accommodation with us
          </p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-[#E41D57] text-white hover:bg-[#C01A4A] font-medium py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Browse All Properties
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
