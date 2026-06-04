import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiSearch, FiMapPin, FiFilter, FiGrid, FiList, FiStar, FiHeart, FiHome, FiBriefcase, FiArrowLeft, FiX, FiMinus, FiPlus, FiChevronDown } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StickySearchHeader from '../components/layout/StickySearchHeader';
import PropertyImageSlider from '../components/property/PropertyImageSlider';
import PropertyMap from '../components/property/PropertyMap';
import FlightSearchResults from '../components/search/FlightSearchResults';
import MobileSearchModal from '../components/search/MobileSearchModal';
import { sanitizeText, formatPrice } from '../utils/textUtils';

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [showStickySearchHeader, setShowStickySearchHeader] = useState(true); // Show on first load

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    check_in_date: searchParams.get('check_in_date') || '',
    check_out_date: searchParams.get('check_out_date') || '',
    min_guests: searchParams.get('min_guests') || '',
    property_type: searchParams.get('property_type') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    min_rating: searchParams.get('min_rating') || '',
    free_cancellation: searchParams.get('free_cancellation') === 'true',
    amenities: searchParams.get('amenities') || '',
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'DESC',
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '12',
    // Flight specific
    trip_type: searchParams.get('trip_type') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || '',
    depart: searchParams.get('depart') || '',
    return: searchParams.get('return') || '',
    travelers: searchParams.get('travelers') || '',
    class: searchParams.get('class') || ''
  });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSortLabel, setSelectedSortLabel] = useState('Recommended');

  // Sort option definitions
  const SORT_OPTIONS = [
    { label: 'Recommended',          sort_by: 'created_at',     sort_order: 'DESC' },
    { label: 'Price (low to high)',  sort_by: 'base_price',     sort_order: 'ASC'  },
    { label: 'Price (high to low)',  sort_by: 'base_price',     sort_order: 'DESC' },
    { label: 'Highest Rated',        sort_by: 'average_rating', sort_order: 'DESC' },
    { label: 'Newest',               sort_by: 'created_at',     sort_order: 'DESC' },
  ];

  // Update both sort params atomically in one setState + setSearchParams call
  const handleSortChange = (option) => {
    const newFilters = {
      ...filters,
      sort_by: option.sort_by,
      sort_order: option.sort_order,
      page: '1',
    };
    setFilters(newFilters);
    const cleanedFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );
    setSearchParams(cleanedFilters);
    setSelectedSortLabel(option.label);
    setShowSortDropdown(false);
  };
  const [activePropertyType, setActivePropertyType] = useState('');

  // Update filters when URL search params change (e.g. from header search)
  useEffect(() => {
    setFilters({
      city: searchParams.get('city') || '',
      check_in_date: searchParams.get('check_in_date') || '',
      check_out_date: searchParams.get('check_out_date') || '',
      min_guests: searchParams.get('min_guests') || '',
      property_type: searchParams.get('property_type') || '',
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      min_rating: searchParams.get('min_rating') || '',
      free_cancellation: searchParams.get('free_cancellation') === 'true',
      amenities: searchParams.get('amenities') || '',
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: searchParams.get('sort_order') || 'DESC',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
      // Flight specific
      trip_type: searchParams.get('trip_type') || '',
      from: searchParams.get('from') || '',
      to: searchParams.get('to') || '',
      depart: searchParams.get('depart') || '',
      return: searchParams.get('return') || '',
      travelers: searchParams.get('travelers') || '',
      class: searchParams.get('class') || ''
    });
  }, [searchParams]);

  // Fetch search results
  const { data: searchData, isLoading, refetch } = useQuery(
    ['search-results', filters],
    () => api.get(`/guest/properties?${new URLSearchParams(filters).toString()}`),
    {
      select: (response) => response.data?.data || { properties: [], pagination: {} },
    }
  );

  // Fetch amenities
  const { data: amenitiesData } = useQuery(
    'amenities',
    () => api.get('/guest/properties/amenities/list'),
    {
      select: (response) => response.data?.data?.amenities || [],
    }
  );

  // Fetch property types
  const { data: propertyTypesData } = useQuery(
    'property-types',
    () => api.get('/properties/property-types/list'),
    {
      select: (response) => (response.data?.data?.propertyTypes || []).filter(pt => pt.is_active !== false),
    }
  );

  // Sync activePropertyType with filters.property_type
  useEffect(() => {
    if (filters.property_type) {
      setActivePropertyType(filters.property_type.toLowerCase());
    } else {
      // Clear active type if no filter is set
      setActivePropertyType('');
    }
  }, [filters.property_type]);

  // Listen for navbar tab clicks and sync active property type
  useEffect(() => {
    const handleSetType = (e) => {
      if (typeof e.detail === 'string') {
        const normalizedType = e.detail.toLowerCase();
        setActivePropertyType(normalizedType);
        handleFilterChange('property_type', normalizedType);
      }
    };
    window.addEventListener('setActivePropertyType', handleSetType);
    return () => window.removeEventListener('setActivePropertyType', handleSetType);
  }, []);

  // Notify navbar about active type changes
  useEffect(() => {
    if (typeof activePropertyType === 'string') {
      window.dispatchEvent(new CustomEvent('activePropertyTypeChanged', { detail: activePropertyType }));
    }
  }, [activePropertyType]);

  // Handle property type tab click
  const handlePropertyTypeClick = (typeName) => {
    const normalizedType = (typeName || '').toLowerCase();
    setActivePropertyType(normalizedType);
    handleFilterChange('property_type', normalizedType);
  };

  // Get icon for property type
  const getTypeIcon = (typeName, isActive = false) => {
    const name = (typeName || '').toLowerCase();
    const colorClass = isActive ? 'text-white' : 'text-gray-700';
    if (name.includes('room')) return <FiHome className={`w-5 h-5 ${colorClass}`} />;
    if (name.includes('apartment')) return <FiGrid className={`w-5 h-5 ${colorClass}`} />;
    if (name.includes('hotel')) return <FiBriefcase className={`w-5 h-5 ${colorClass}`} />;
    if (name.includes('villa')) return <FiHome className={`w-5 h-5 ${colorClass}`} />;
    if (name.includes('house')) return <FiHome className={`w-5 h-5 ${colorClass}`} />;
    return <FiHome className={`w-5 h-5 ${colorClass}`} />;
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key !== 'page') {
      newFilters.page = '1';
    }
    setFilters(newFilters);
    
    // Clean filters for URL
    const cleanedFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([k, v]) => v !== '' && v !== null && v !== undefined)
    );
    setSearchParams(cleanedFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  const toggleFavorite = async (propertyId) => {
    const newFavorites = new Set(favorites);
    if (favorites.has(propertyId)) {
      newFavorites.delete(propertyId);
      await api.delete(`/guest/favorites/${propertyId}`);
    } else {
      newFavorites.add(propertyId);
      await api.post(`/guest/favorites/${propertyId}`);
    }
    setFavorites(newFavorites);
  };

  const clearFilters = () => {
    const clearedFilters = {
      city: '',
      check_in_date: '',
      check_out_date: '',
      min_guests: '',
      property_type: '',
      min_price: '',
      max_price: '',
      bedrooms: '',
      min_rating: '',
      free_cancellation: false,
      amenities: '',
      sort_by: 'created_at',
      sort_order: 'DESC',
      page: '1',
      limit: '12'
    };
    setFilters(clearedFilters);
    setSearchParams(clearedFilters);
  };

  const formatDisplayDates = () => {
    if (filters.check_in_date && filters.check_out_date) {
      return `${new Date(filters.check_in_date).toLocaleDateString()} • ${new Date(filters.check_out_date).toLocaleDateString()}`;
    }
    return 'Dates';
  };

  const formatDateLocal = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const applyModalSearch = (newParams) => {
    // newParams comes from MobileSearchModal
    const updated = {
      ...filters,
      city: newParams.city || '',
      check_in_date: newParams.check_in_date || '',
      check_out_date: newParams.check_out_date || '',
      min_guests: newParams.min_guests ? String(newParams.min_guests) : '',
      property_type: newParams.property_type || '',
      page: '1'
    };
    setFilters(updated);
    setSearchParams(updated);
    refetch();
  };

  // Show sticky search header on scroll (desktop only) with hysteresis to reduce jitter
  // On search results page, show on first load, then maintain on scroll
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

  // Helper function to get property type display name
  const getPropertyTypeTitle = (type) => {
    const normalized = (type || '').toLowerCase();
    if (normalized === 'flight') return 'Flight Search';
    if (normalized === 'room') return 'Room Search';
    if (normalized === 'apartment') return 'Apartments Search';
    if (normalized === 'hotel') return 'Hotels Search';
    return 'Property Search';
  };

  // Helper function to check if a tab is active
  const isTabActive = (tabType) => {
    return (filters.property_type || '').toLowerCase() === tabType.toLowerCase();
  };

  const currentPropertyType = (filters.property_type || '').toLowerCase();
  // Special layout for Flight
  if (currentPropertyType === 'flight') {
    return (
      <div className="min-h-screen bg-[#F4F6F9]">
        {/* Mobile Header with Back Button */}
        <div className="bg-white pt-4 pb-2 px-4 md:hidden sticky top-0 z-50 shadow-sm border-b border-gray-100">
          {/* Top Row: Back Button + Title */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0"
              aria-label="Back to home"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              disabled
              className="flex-1 flex items-center justify-center bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm text-center opacity-100"
            >
              <div className="flex flex-col items-center leading-tight overflow-hidden w-full">
                <span className="text-sm font-semibold text-gray-900 truncate w-full">
                  Flight
                </span>
                <span className="text-xs text-gray-500 truncate w-full">
                  Any week • Add Travelers
                </span>
              </div>
            </button>
          </div>

          {/* Bottom Row: Property Type Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            {/* All Property Tab */}
            <button
              onClick={() => {
                setActivePropertyType('');
                handleFilterChange('property_type', '');
              }}
              className={`flex flex-col items-center justify-center py-1.5 transition-colors ${!filters.property_type ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <div className="flex flex-col items-center px-2">
                <FiGrid className={`w-5 h-5 transition-all duration-300 ${!filters.property_type ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
                <span className="text-base font-medium whitespace-nowrap mt-1.5">All</span>
                <span className={`mt-1.5 h-[2px] w-full ${!filters.property_type ? 'bg-black' : 'bg-transparent'}`} />
              </div>
            </button>

            {propertyTypesData && propertyTypesData.map((type) => {
            const normalizedName = (type.name || '').toLowerCase();
            let imgSrc = type.icon_url || '/images/nav-icon-room.png';
            if (!type.icon_url) {
              if (normalizedName.includes('apartment') || normalizedName.includes('villa') || normalizedName.includes('house')) imgSrc = '/images/nav-icon-apartment.png';
              else if (normalizedName.includes('hotel')) imgSrc = '/images/nav-icon-hotel.png';
              else if (normalizedName.includes('flight')) imgSrc = '/images/flight.png';
            }
            return (
              <button
                key={type.id}
                onClick={() => navigate(`/search?property_type=${normalizedName}`)}
                className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isTabActive(normalizedName) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
              >
                <div className="flex flex-col items-center px-2">
                  <img src={imgSrc} alt={type.name} className={`w-5 h-5 object-contain transition-all duration-300 ${isTabActive(normalizedName) ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} onError={(e) => { e.target.src = '/images/nav-icon-room.png'; }} />
                  <span className="text-base font-medium whitespace-nowrap mt-1.5">{type.name}</span>
                  <span className={`mt-1.5 h-[2px] w-full ${isTabActive(normalizedName) ? 'bg-black' : 'bg-transparent'}`} />
                </div>
              </button>
            );
          })}
          </div>
        </div>
        <FlightSearchResults searchParams={filters} />
      </div>
    );
  }

  // Regular rendering for Room, Apartment, Hotel, and default
  return (
    <div className="min-h-screen bg-white mobile-footer-spacing">
      {/* Mobile Header with Tabs - Visible only on mobile */}
      <div className="bg-white pt-4 pb-2 px-4 md:hidden sticky top-0 z-50 shadow-sm border-b border-gray-100">
        {/* Top Row: Back Button + Search Pill */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0"
            aria-label="Back to home"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-700" />
          </button>

          {/* Search Pill */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex-1 flex items-center justify-center bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm text-center hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            <div className="flex flex-col items-center leading-tight overflow-hidden w-full">
              <span className="text-sm font-semibold text-gray-900 truncate w-full">
                {sanitizeText(filters.city) || 'Anywhere'}
              </span>
              <span className="text-xs text-gray-500 truncate w-full">
                {filters.check_in_date ? formatDisplayDates() : 'Any week'} • {filters.min_guests ? `${filters.min_guests} guest${parseInt(filters.min_guests) > 1 ? 's' : ''}` : 'Add guests'}
              </span>
            </div>
          </button>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilters(true)}
            className="p-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0"
            aria-label="Filters"
          >
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{display: 'block', height: '16px', width: '16px', fill: 'currentcolor'}}><path d="M5 8a3 3 0 0 1 2.83 2H14v2H7.83A3 3 0 1 1 5 8zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6-8a3 3 0 1 1-2.83 4H2V4h6.17A3 3 0 0 1 11 2zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path></svg>
          </button>
        </div>

        {/* Bottom Row: Property Type Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          {/* All Property Tab */}
          <button
            onClick={() => {
              setActivePropertyType('');
              handleFilterChange('property_type', '');
            }}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors ${!filters.property_type ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <div className="flex flex-col items-center px-2">
              <FiGrid className={`w-5 h-5 transition-all duration-300 ${!filters.property_type ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
              <span className="text-base font-medium whitespace-nowrap mt-1.5">All</span>
              <span className={`mt-1.5 h-[2px] w-full ${!filters.property_type ? 'bg-black' : 'bg-transparent'}`} />
            </div>
          </button>

          {propertyTypesData && propertyTypesData.map((type) => {
            const normalizedName = (type.name || '').toLowerCase();
            let imgSrc = type.icon_url || '/images/nav-icon-room.png';
            if (!type.icon_url) {
              if (normalizedName.includes('apartment') || normalizedName.includes('villa') || normalizedName.includes('house')) imgSrc = '/images/nav-icon-apartment.png';
              else if (normalizedName.includes('hotel')) imgSrc = '/images/nav-icon-hotel.png';
              else if (normalizedName.includes('flight')) imgSrc = '/images/flight.png';
            }
            return (
              <button
                key={type.id}
                onClick={() => navigate(`/search?property_type=${normalizedName}`)}
                className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isTabActive(normalizedName) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
              >
                <div className="flex flex-col items-center px-2">
                  <img src={imgSrc} alt={type.name} className={`w-5 h-5 object-contain transition-all duration-300 ${isTabActive(normalizedName) ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} onError={(e) => { e.target.src = '/images/nav-icon-room.png'; }} />
                  <span className="text-base font-medium whitespace-nowrap mt-1.5">{type.name}</span>
                  <span className={`mt-1.5 h-[2px] w-full ${isTabActive(normalizedName) ? 'bg-black' : 'bg-transparent'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky header appears after scroll (desktop only) */}
      {showStickySearchHeader && (
        <div className="hidden md:block">
          <StickySearchHeader
            alwaysSticky={true}
            initialLocation={filters.city}
            initialCheckInDate={filters.check_in_date}
            initialCheckOutDate={filters.check_out_date}
            initialGuests={filters.min_guests || 1}
            initialPropertyType={filters.property_type}
            onShowFilters={() => setShowFilters(true)}
          />
        </div>
      )}



      <div className={`max-w-[1440px] mx-auto pt-4 ${showMap ? 'flex flex-col lg:flex-row h-[calc(100vh-130px)] overflow-hidden' : 'py-6 px-4 sm:px-6 lg:px-8'}`}>
        <div className={`flex flex-col lg:flex-row gap-6 ${showMap ? 'w-full lg:w-1/2 h-full overflow-y-auto px-4 pb-20 scrollbar-hide' : 'w-full'}`}>
          {/* Filters Sidebar Removed - Now a Modal */}
          {/* Results */}
          <div className="flex-1">
            {/* Property List Header with Sort */}
            <div className="flex items-center justify-between mb-4 mt-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Over {searchData?.pagination?.totalItems > 1000 ? '1,000' : searchData?.pagination?.totalItems || 0} homes
                </h2>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  id="sort-dropdown-btn"
                  onClick={() => setShowSortDropdown(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-gray-900 hover:shadow-sm transition-all duration-150 focus:outline-none"
                >
                  <span>Sort: <span className="font-semibold text-gray-900">{selectedSortLabel}</span></span>
                  <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSortDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-[100]"
                      onClick={() => setShowSortDropdown(false)}
                    />
                    {/* Dropdown panel */}
                    <div
                      id="sort-dropdown-panel"
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-[101] overflow-hidden"
                      style={{ animation: 'fadeInDown 0.15s ease' }}
                    >
                      {SORT_OPTIONS.map((option) => {
                        const isActive = selectedSortLabel === option.label;
                        return (
                          <button
                            key={option.label}
                            id={`sort-option-${option.label.replace(/\s+/g, '-').toLowerCase()}`}
                            onClick={() => handleSortChange(option)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                              isActive
                                ? 'bg-gray-50 font-semibold text-gray-900'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{option.label}</span>
                            {isActive && (
                              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Properties */}
            {isLoading ? (
              <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid' ? (showMap ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5') : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card h-full">
                    <div className="loading-skeleton aspect-[20/19] rounded-xl mb-3"></div>
                    <div className="loading-skeleton h-4 mb-2"></div>
                    <div className="loading-skeleton h-4 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : searchData?.properties?.length > 0 ? (
              <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid' ? (showMap ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5') : 'grid-cols-1'}`}>
                {searchData.properties.map((property) => (
                  <div
                    key={property.id}
                    id={`property-${property.id}`}
                    onMouseEnter={() => setHoveredPropertyId(property.id)}
                    onMouseLeave={() => setHoveredPropertyId(null)}
                    className={`group cursor-pointer ${hoveredPropertyId === property.id ? '' : ''}`}
                    onClick={() => {
                      // Pass search params to property detail page
                      const params = new URLSearchParams();
                      if (filters.check_in_date) params.set('check_in_date', filters.check_in_date);
                      if (filters.check_out_date) params.set('check_out_date', filters.check_out_date);
                      if (filters.min_guests) params.set('guests', filters.min_guests);
                      const queryString = params.toString();
                      navigate(`/property/${property.slug || property.id}${queryString ? `?${queryString}` : ''}`);
                    }}
                  >
                    <div className="relative aspect-[20/19] rounded-xl overflow-hidden mb-3 bg-gray-200">
                      <PropertyImageSlider
                        property={property}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {property.is_non_refundable && (
                        <div className="absolute bottom-3 left-3 bg-rose-600 text-white px-2 py-0.5 rounded-md text-[8px] font-bold z-20 shadow-sm uppercase tracking-wider">
                          Non-Refundable
                        </div>
                      )}
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 z-10">
                        {property.is_superhost && (
                          <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs font-bold text-gray-900 border border-black/5">
                            Superhost
                          </div>
                        ) || property.average_rating >= 4.8 && (
                          <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm text-xs font-bold text-gray-900 border border-black/5">
                            Guest favorite
                          </div>
                        )}
                      </div>

                      {/* Heart Icon */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(property.id);
                        }}
                        className="absolute top-3 right-3 p-2 z-10 transition-transform active:scale-90 opacity-70 hover:opacity-100 hover:scale-110"
                      >
                        <svg
                          viewBox="0 0 32 32"
                          className={`w-6 h-6 stroke-white stroke-[2px] ${favorites.has(property.id) ? 'fill-[#FF385C] stroke-[#FF385C]' : 'fill-black/50'}`}
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"></path>
                        </svg>
                      </button>

                      {/* Owner Avatar (Optional, visually appealing) */}
                      {property.owner_image && (
                        <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-md z-10">
                          <img src={property.owner_image} alt="Owner" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 text-[15px] truncate pr-2 capitalize">
                          {property.city ? `${property.property_type || 'Property'} in ${sanitizeText(property.city)}` : sanitizeText(property.title)}
                        </h3>
                        <div className="flex items-center gap-1 text-[14px]">
                          {property.total_reviews > 0 ? (
                            <>
                              <FiStar className="w-3 h-3 fill-current text-black" />
                              <span className="font-semibold">{parseFloat(property.average_rating).toFixed(1)}</span>
                              <span className="text-gray-500 text-xs">({property.total_reviews})</span>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">No reviews</span>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-500 text-[15px] line-clamp-1 capitalize">{sanitizeText(property.title)}</p>
                      <p className="text-gray-500 text-[15px]">
                        {property.bedrooms} bedrooms · {property.max_guests} guests
                      </p>
                      <p className="text-gray-500 text-[15px] mt-1">
                        {filters.check_in_date ? formatDisplayDates() : 'Availability varies'}
                      </p>

                      <div className="flex items-baseline gap-1 mt-1.5 pt-0.5">
                        {property.discounted_price ? (
                          <>
                            <span className="text-gray-500 line-through text-[15px]">BDT {formatPrice(property.original_price)}</span>
                            <span className="font-semibold text-gray-900 text-[15px]">BDT {formatPrice(property.base_price)}</span>
                          </>
                        ) : (
                          <span className="font-semibold text-gray-900 text-[15px]">BDT {formatPrice(property.base_price)}</span>
                        )}
                        <span className="text-gray-900 text-[15px]">total</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {searchData?.pagination && searchData.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', searchData.pagination.prevPage)}
                    disabled={!searchData.pagination.hasPrevPage}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {searchData.pagination.currentPage} of {searchData.pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handleFilterChange('page', searchData.pagination.nextPage)}
                    disabled={!searchData.pagination.hasNextPage}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map Column */}
        {showMap && (
          <div className="hidden lg:block lg:w-1/2 h-full relative z-0 rounded-xl overflow-hidden">
            <PropertyMap
              properties={searchData?.properties || []}
              hoveredPropertyId={hoveredPropertyId}
              onMarkerHover={setHoveredPropertyId}
              onMarkerClick={(id) => {
                const element = document.getElementById(`property-${id}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setHoveredPropertyId(id);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Search modal (mobile + desktop) */}
      <MobileSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        filters={filters}
        onApply={applyModalSearch}
      />

      {/* Airbnb Style Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-[6000] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 transition-opacity">
          <div className="bg-white w-full sm:w-[600px] h-[90vh] sm:h-[80vh] sm:max-h-[800px] sm:rounded-2xl flex flex-col shadow-2xl animate-slideUp sm:animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <button onClick={() => setShowFilters(false)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                <FiX className="w-5 h-5 text-gray-800" />
              </button>
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <div className="w-9"></div> {/* Spacer for centering */}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              
              {/* Type of place */}
              <div className="py-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Type of place</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-black transition-colors">
                    <input
                      type="radio"
                      name="property_type"
                      checked={!filters.property_type}
                      onChange={() => handleFilterChange('property_type', '')}
                      className="w-5 h-5 accent-black border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="block font-semibold text-gray-900">Any type</span>
                    </div>
                  </label>
                  {propertyTypesData && propertyTypesData.filter(t => t.name.toLowerCase() !== 'flight').map((type) => (
                    <label key={type.id} className="flex items-center p-4 border border-gray-300 rounded-xl cursor-pointer hover:border-black transition-colors">
                      <input
                        type="radio"
                        name="property_type"
                        checked={filters.property_type === type.name.toLowerCase()}
                        onChange={() => handleFilterChange('property_type', type.name.toLowerCase())}
                        className="w-5 h-5 accent-black border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="block font-semibold text-gray-900">{type.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="py-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Price range</h3>
                <p className="text-gray-500 mb-6">Nightly prices before fees and taxes</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                      <input
                        type="number"
                        value={filters.min_price}
                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                        className="w-full pl-7 pr-3 py-3 border border-gray-400 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="text-gray-400 mt-5">-</div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                      <input
                        type="number"
                        value={filters.max_price}
                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                        className="w-full pl-7 pr-3 py-3 border border-gray-400 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none"
                        placeholder="100000+"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rooms and Beds */}
              <div className="py-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">Rooms and beds</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg text-gray-800">Bedrooms</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        const current = parseInt(filters.bedrooms) || 0;
                        if (current > 0) handleFilterChange('bedrooms', current === 1 ? '' : String(current - 1));
                      }}
                      className={`w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center transition-colors ${!filters.bedrooms ? 'opacity-30 cursor-not-allowed' : 'hover:border-black hover:text-black'}`}
                      disabled={!filters.bedrooms}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center font-medium">{filters.bedrooms ? filters.bedrooms : 'Any'}</span>
                    <button 
                      onClick={() => {
                        const current = parseInt(filters.bedrooms) || 0;
                        handleFilterChange('bedrooms', String(current + 1));
                      }}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-black hover:text-black transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-800">Guests</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        const current = parseInt(filters.min_guests) || 0;
                        if (current > 0) handleFilterChange('min_guests', current === 1 ? '' : String(current - 1));
                      }}
                      className={`w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center transition-colors ${!filters.min_guests ? 'opacity-30 cursor-not-allowed' : 'hover:border-black hover:text-black'}`}
                      disabled={!filters.min_guests}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center font-medium">{filters.min_guests ? filters.min_guests : 'Any'}</span>
                    <button 
                      onClick={() => {
                        const current = parseInt(filters.min_guests) || 0;
                        handleFilterChange('min_guests', String(current + 1));
                      }}
                      className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center hover:border-black hover:text-black transition-colors"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>










                     
                       








              




                  <div>


                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                     
                       
                      


                    
                    
                  </div>



              {/* Amenities */}
              <div className="py-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">Amenities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                  {amenitiesData?.map((amenity) => (
                    <label key={amenity.id} className="flex items-center cursor-pointer group">
                      <div className="relative flex items-center justify-center w-6 h-6 border-2 border-gray-400 rounded group-hover:border-black transition-colors">
                        <input
                          type="checkbox"
                          className="opacity-0 absolute w-full h-full cursor-pointer"
                          checked={filters.amenities.split(',').includes(String(amenity.id))}
                          onChange={(e) => {
                            const amenityIds = filters.amenities.split(',').filter(id => id);
                            if (e.target.checked) {
                              const currentId = String(amenity.id);
                              amenityIds.push(currentId);
                            } else {
                              const currentId = String(amenity.id);
                              const index = amenityIds.indexOf(currentId);
                              if (index > -1) amenityIds.splice(index, 1);
                            }
                            handleFilterChange('amenities', amenityIds.join(','));
                          }}
                        />
                        {filters.amenities.split(',').includes(String(amenity.id)) && (
                          <div className="absolute inset-0 bg-black rounded flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                        )}
                      </div>
                      <span className="ml-3 text-lg text-gray-700 group-hover:text-black transition-colors">{amenity.name}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 sm:py-4 border-t border-gray-200 flex items-center justify-between bg-white rounded-b-2xl">
              <button 
                onClick={clearFilters}
                className="text-base font-semibold underline text-gray-900 hover:text-gray-600 transition-colors"
              >
                Clear all
              </button>
              <button 
                onClick={() => {
                  refetch();
                  setShowFilters(false);
                }}
                className="px-8 py-3 bg-black hover:bg-gray-900 text-white font-bold rounded-lg transition-colors"
              >
                Show {searchData?.pagination?.totalItems > 0 ? (searchData.pagination.totalItems > 1000 ? '1,000+' : searchData.pagination.totalItems) : ''} places
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
