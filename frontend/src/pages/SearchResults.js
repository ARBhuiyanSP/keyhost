import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiSearch, FiMapPin, FiFilter, FiGrid, FiList, FiStar, FiHeart, FiHome, FiBriefcase, FiArrowLeft } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StickySearchHeader from '../components/layout/StickySearchHeader';
import PropertyImageSlider from '../components/property/PropertyImageSlider';
import PropertyMap from '../components/property/PropertyMap';
import FlightSearchResults from '../components/search/FlightSearchResults';
import MobileSearchModal from '../components/search/MobileSearchModal';
import { sanitizeText } from '../utils/textUtils';

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
      if (e.detail) {
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
    if (activePropertyType) {
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
    setSearchParams(newFilters);
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
            <button
              onClick={() => navigate('/search?property_type=room')}
              className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isTabActive('room') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <div className="flex flex-col items-center px-2">
                <img src="/images/nav-icon-room.png" alt="Room" className={`w-5 h-5 object-contain transition-all duration-300 ${isTabActive('room') ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
                <span className="text-base font-medium whitespace-nowrap mt-1.5">Room</span>
                <span className={`mt-1.5 h-[2px] w-full ${isTabActive('room') ? 'bg-black' : 'bg-transparent'}`} />
              </div>
            </button>

            <button
              onClick={() => navigate('/search?property_type=apartment')}
              className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isTabActive('apartment') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <div className="flex flex-col items-center px-2">
                <img src="/images/nav-icon-apartment.png" alt="Apartments" className={`w-5 h-5 object-contain transition-all duration-300 ${isTabActive('apartment') ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
                <span className="text-base font-medium whitespace-nowrap mt-1.5">Apartments</span>
                <span className={`mt-1.5 h-[2px] w-full ${isTabActive('apartment') ? 'bg-black' : 'bg-transparent'}`} />
              </div>
            </button>

            <button
              onClick={() => navigate('/search?property_type=hotel')}
              className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isTabActive('hotel') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <div className="flex flex-col items-center px-2">
                <img src="/images/nav-icon-hotel.png" alt="Hotels" className={`w-5 h-5 object-contain transition-all duration-300 ${isTabActive('hotel') ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
                <span className="text-base font-medium whitespace-nowrap mt-1.5">Hotels</span>
                <span className={`mt-1.5 h-[2px] w-full ${isTabActive('hotel') ? 'bg-black' : 'bg-transparent'}`} />
              </div>
            </button>

            <button
              onClick={() => navigate('/search?property_type=flight')}
              className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isTabActive('flight') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <div className="flex flex-col items-center px-2">
                <img src="/images/flight.png" alt="Flight" className={`w-5 h-5 object-contain transition-all duration-300 ${isTabActive('flight') ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
                <span className="text-base font-medium whitespace-nowrap mt-1.5">Flight</span>
                <span className={`mt-1.5 h-[2px] w-full ${isTabActive('flight') ? 'bg-black' : 'bg-transparent'}`} />
              </div>
            </button>
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
        </div>

        {/* Bottom Row: Property Type Tabs */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide pb-2">
          <button
            onClick={() => navigate('/search?property_type=room')}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isTabActive('room') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <div className="flex flex-col items-center px-2">
              <img src="/images/nav-icon-room.png" alt="Room" className={`w-5 h-5 object-contain transition-all duration-300 ${isTabActive('room') ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
              <span className="text-base font-medium whitespace-nowrap mt-1.5">Room</span>
              <span className={`mt-1.5 h-[2px] w-full ${isTabActive('room') ? 'bg-black' : 'bg-transparent'}`} />
            </div>
          </button>

          <button
            onClick={() => navigate('/search?property_type=apartment')}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isTabActive('apartment') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <div className="flex flex-col items-center px-2">
              <img src="/images/nav-icon-apartment.png" alt="Apartments" className={`w-5 h-5 object-contain transition-all duration-300 ${isTabActive('apartment') ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
              <span className="text-base font-medium whitespace-nowrap mt-1.5">Apartments</span>
              <span className={`mt-1.5 h-[2px] w-full ${isTabActive('apartment') ? 'bg-black' : 'bg-transparent'}`} />
            </div>
          </button>

          <button
            onClick={() => navigate('/search?property_type=hotel')}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isTabActive('hotel') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <div className="flex flex-col items-center px-2">
              <img src="/images/nav-icon-hotel.png" alt="Hotels" className={`w-5 h-5 object-contain transition-all duration-300 ${isTabActive('hotel') ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
              <span className="text-base font-medium whitespace-nowrap mt-1.5">Hotels</span>
              <span className={`mt-1.5 h-[2px] w-full ${isTabActive('hotel') ? 'bg-black' : 'bg-transparent'}`} />
            </div>
          </button>

          <button
            onClick={() => navigate('/search?property_type=flight')}
            className={`flex flex-col items-center justify-center py-1.5 transition-colors ${isTabActive('flight') ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <div className="flex flex-col items-center px-2">
              <img src="/images/flight.png" alt="Flight" className={`w-5 h-5 object-contain transition-all duration-300 ${isTabActive('flight') ? 'opacity-100 grayscale-0' : 'opacity-70 grayscale'}`} />
              <span className="text-base font-medium whitespace-nowrap mt-1.5">Flight</span>
              <span className={`mt-1.5 h-[2px] w-full ${isTabActive('flight') ? 'bg-black' : 'bg-transparent'}`} />
            </div>
          </button>
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
          />
        </div>
      )}



      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 ${showMap ? 'flex flex-col lg:flex-row h-[calc(100vh-130px)] overflow-hidden' : 'py-6'}`}>
        <div className={`flex flex-col lg:flex-row gap-6 ${showMap ? 'w-full lg:w-1/2 h-full overflow-y-auto px-4 pb-20 scrollbar-hide' : ''}`}>
          {/* Filters Sidebar */}
          {!showMap && showFilters && (
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                </div>

                <form onSubmit={handleSearch} className="space-y-6">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter city or area"
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Check-in Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Date
                    </label>
                    <DatePicker
                      selected={filters.check_in_date ? new Date(filters.check_in_date) : null}
                      onChange={(date) => handleFilterChange('check_in_date', date?.toISOString().split('T')[0] || '')}
                      minDate={new Date()}
                      placeholderText="Select date"
                      className="input-field"
                    />
                  </div>

                  {/* Check-out Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-out Date
                    </label>
                    <DatePicker
                      selected={filters.check_out_date ? new Date(filters.check_out_date) : null}
                      onChange={(date) => handleFilterChange('check_out_date', date?.toISOString().split('T')[0] || '')}
                      minDate={filters.check_in_date ? new Date(filters.check_in_date) : new Date()}
                      placeholderText="Select date"
                      className="input-field"
                    />
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guests
                    </label>
                    <select
                      value={filters.min_guests}
                      onChange={(e) => handleFilterChange('min_guests', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Any number</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>
                          {num}+ guests
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      value={(filters.property_type || '').toLowerCase()}
                      onChange={(e) => handleFilterChange('property_type', e.target.value.toLowerCase())}
                      className="input-field"
                    >
                      <option value="">All types</option>
                      {propertyTypesData && propertyTypesData.length > 0 ? (
                        propertyTypesData.map((type) => (
                          <option key={type.id} value={type.name.toLowerCase()}>
                            {type.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="room">Room</option>
                          <option value="villa">Villa</option>
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range (BDT)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min price"
                        value={filters.min_price}
                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                        className="input-field"
                      />
                      <input
                        type="number"
                        placeholder="Max price"
                        value={filters.max_price}
                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {amenitiesData?.slice(0, 10).map((amenity) => (
                        <label key={amenity.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.amenities.includes(amenity.id)}
                            onChange={(e) => {
                              const amenityIds = filters.amenities.split(',').filter(id => id);
                              if (e.target.checked) {
                                amenityIds.push(amenity.id);
                              } else {
                                const index = amenityIds.indexOf(amenity.id);
                                if (index > -1) amenityIds.splice(index, 1);
                              }
                              handleFilterChange('amenities', amenityIds.join(','));
                            }}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{amenity.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full">
                    <FiSearch className="inline mr-2" />
                    Apply Filters
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Sort Options */}
            {/* Property List Header */}
            <div className="flex items-center justify-between mb-4 mt-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Over {searchData?.pagination?.totalItems > 1000 ? '1,000' : searchData?.pagination?.totalItems || 0} homes
                </h2>
              </div>

              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-700">
                <span className="text-gray-500 font-medium">Prices include all fees</span>
              </div>
            </div>

            {/* Properties */}
            {isLoading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? (showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4') : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card">
                    <div className="loading-skeleton h-48 mb-4"></div>
                    <div className="loading-skeleton h-4 mb-2"></div>
                    <div className="loading-skeleton h-4 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : searchData?.properties?.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? (showMap ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4') : 'grid-cols-1'}`}>
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
                      navigate(`/property/${property.id}${queryString ? `?${queryString}` : ''}`);
                    }}
                  >
                    <div className="relative aspect-[20/19] rounded-xl overflow-hidden mb-3 bg-gray-200">
                      <PropertyImageSlider
                        property={property}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
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
                        <h3 className="font-semibold text-gray-900 text-[15px] truncate pr-2">
                          {property.city ? `${property.property_type || 'Property'} in ${sanitizeText(property.city)}` : sanitizeText(property.title)}
                        </h3>
                        <div className="flex items-center gap-1 text-[14px]">
                          <FiStar className="w-3 h-3 fill-current text-black" />
                          <span>{property.average_rating || 'New'}</span>
                          {property.total_reviews > 0 && <span className="text-gray-500">({property.total_reviews})</span>}
                        </div>
                      </div>

                      <p className="text-gray-500 text-[15px] line-clamp-1">{sanitizeText(property.title)}</p>
                      <p className="text-gray-500 text-[15px]">
                        {property.bedrooms} bedrooms · {property.max_guests} guests
                      </p>
                      <p className="text-gray-500 text-[15px] mt-1">
                        {filters.check_in_date ? formatDisplayDates() : 'Availability varies'}
                      </p>

                      <div className="flex items-baseline gap-1 mt-1.5 pt-0.5">
                        {property.discounted_price ? (
                          <>
                            <span className="text-gray-500 line-through text-[15px]">BDT {property.original_price}</span>
                            <span className="font-semibold text-gray-900 text-[15px]">BDT {property.base_price}</span>
                          </>
                        ) : (
                          <span className="font-semibold text-gray-900 text-[15px]">BDT {property.base_price}</span>
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
      {/* Search modal (mobile - repurposed for desktop too if needed, but primarily mobile per design) */}
      <MobileSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        filters={filters}
        onSearch={applyModalSearch}
      />
    </div>
  );
};

export default SearchResults;
