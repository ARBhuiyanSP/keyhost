import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useFbPixel } from '../hooks/useFbPixel';
import { FiSearch, FiMapPin, FiFilter, FiGrid, FiList, FiStar, FiWifi, FiCar, FiUtensils, FiHeart, FiArrowLeft } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAuthStore from '../store/authStore';
import useToast from '../hooks/useToast';
import StickySearchHeader from '../components/layout/StickySearchHeader';
import PropertyImageSlider from '../components/property/PropertyImageSlider';
import LazyPropertyCard from '../components/property/LazyPropertyCard';

import MobileSearchModal from '../components/search/MobileSearchModal';
import { sanitizeText, formatPrice } from '../utils/textUtils';

const Properties = () => {
  const navigate = useNavigate();
  const { trackSearch } = useFbPixel();
  const { isAuthenticated, user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [showSearchModal, setShowSearchModal] = useState(false);

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
    limit: searchParams.get('limit') || '12'
  });

  // Fetch properties
  const { data: propertiesData, isLoading, refetch } = useQuery(
    ['properties', filters],
    () => api.get(`/guest/properties?${new URLSearchParams(filters).toString()}`),
    {
      select: (response) => response.data?.data || { properties: [], pagination: {} },
    }
  );

  // Track Meta Pixel Search event
  useEffect(() => {
    if (propertiesData) {
      const searchString = filters.city || 'all';
      const checkinDate = filters.check_in_date || '';
      const checkoutDate = filters.check_out_date || '';
      const guests = parseInt(filters.min_guests) || 1;
      trackSearch(searchString, checkinDate, checkoutDate, guests);
    }
  }, [propertiesData, filters.city, filters.check_in_date, filters.check_out_date, filters.min_guests, trackSearch]);

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
      select: (response) => response.data?.data?.propertyTypes || [],
    }
  );

  // Load favorites on mount
  useEffect(() => {
    if (isAuthenticated && user?.user_type === 'guest') {
      loadFavorites();
    }
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    try {
      const response = await api.get('/guest/favorites');
      const favoriteIds = new Set(response.data?.data?.favorites?.map(fav => fav.property_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
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
    if (!isAuthenticated) {
      showError('Please login to add favorites');
      navigate('/login');
      return;
    }

    if (user?.user_type !== 'guest') {
      showError('Only guests can add properties to favorites');
      return;
    }

    try {
      const newFavorites = new Set(favorites);

      if (favorites.has(propertyId)) {
        newFavorites.delete(propertyId);
        await api.delete(`/guest/favorites/${propertyId}`);
        showSuccess('Removed from favorites');
      } else {
        newFavorites.add(propertyId);
        await api.post(`/guest/favorites/${propertyId}`);
        showSuccess('Added to favorites');
      }

      setFavorites(newFavorites);
    } catch (error) {
      console.error('Toggle favorite error:', error);
      showError(error.response?.data?.message || 'Failed to update favorites');
    }
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

  const applyModalSearch = (newParams) => {
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

  const isTabActive = (tabType) => {
    return (filters.property_type || '').toLowerCase() === tabType.toLowerCase();
  };

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
            className="flex-1 min-w-0 flex items-center justify-center bg-white rounded-full px-4 py-2 border border-gray-200 shadow-sm text-center hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            <div className="flex flex-col items-center leading-tight overflow-hidden w-full min-w-0">
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
        <div className="flex items-center justify-start md:justify-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-2 px-2 w-full">
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
                className={`flex flex-col items-center justify-center py-1.5 transition-colors flex-shrink-0 ${isTabActive(normalizedName) ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}
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

      <div className="hidden md:block">
        <StickySearchHeader alwaysSticky={true} />
      </div>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
              <p className="text-gray-600 mt-1">
                {propertiesData?.pagination?.totalItems || 0} properties found
              </p>
            </div>

            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center"
              >
                <FiFilter className="mr-2" />
                Filters
              </button>

              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#E41D57] text-white' : 'text-gray-600'}`}
                >
                  <FiGrid />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#E41D57] text-white' : 'text-gray-600'}`}
                >
                  <FiList />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
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

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms
                    </label>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Any number</option>
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>
                          {num}+ bedrooms
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.min_rating}
                      onChange={(e) => handleFilterChange('min_rating', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Any rating</option>
                      {[4.5, 4.0, 3.5, 3.0].map(rating => (
                        <option key={rating} value={rating}>
                          {rating}+ Stars
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cancellation Policy */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.free_cancellation}
                        onChange={(e) => handleFilterChange('free_cancellation', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 font-medium">Free Cancellation</span>
                    </label>
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

          {/* Properties Grid/List */}
          <div className="flex-1">
            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <select
                  value={`${filters.sort_by}-${filters.sort_order}`}
                  onChange={(e) => {
                    const [sort_by, sort_order] = e.target.value.split('-');
                    handleFilterChange('sort_by', sort_by);
                    handleFilterChange('sort_order', sort_order);
                  }}
                  className="input-field w-auto"
                >
                  <option value="created_at-DESC">Newest first</option>
                  <option value="created_at-ASC">Oldest first</option>
                  <option value="base_price-ASC">Price: Low to High</option>
                  <option value="base_price-DESC">Price: High to Low</option>
                  <option value="average_rating-DESC">Highest rated</option>
                </select>
              </div>
            </div>

            {/* Properties */}
            {/* Properties */}
            {isLoading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6' : 'grid-cols-1 gap-4'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card h-full">
                    <div className="loading-skeleton aspect-[4/3] sm:h-48 rounded-xl mb-3"></div>
                    <div className="loading-skeleton h-4 mb-2"></div>
                    <div className="loading-skeleton h-4 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : propertiesData?.properties?.length > 0 ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-6' : 'grid-cols-1 gap-4'}`}>
                {propertiesData.properties.map((property) => (
                  <LazyPropertyCard
                    key={property.id}
                    aspectClass="aspect-[4/3]"
                    heightClass="sm:h-48"
                    viewMode={viewMode}
                  >
                    <div
                      className={`card-hover ${viewMode === 'list' ? 'flex' : 'flex flex-col h-full'}`}
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
                      <div className={`relative rounded-xl overflow-hidden ${viewMode === 'list' ? 'w-1/3 h-32' : 'aspect-[4/3] sm:h-48 mb-3'}`}>
                        <PropertyImageSlider
                          property={property}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(property.id);
                          }}
                          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow z-20"
                        >
                          <FiHeart className={`w-4 h-4 ${favorites.has(property.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                        </button>
                        {property.is_non_refundable && (
                          <div className="absolute bottom-3 left-3 bg-rose-600 text-white px-2 py-0.5 rounded-md text-[8px] font-bold z-20 shadow-sm uppercase tracking-wider">
                            Non-Refundable
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-sm font-medium z-20">
                          <span className="text-red-600 font-bold">BDT {formatPrice(property.base_price)}</span><span className="text-gray-600">/night</span>
                        </div>
                      </div>

                      <div className={`${viewMode === 'list' ? 'flex-1 ml-4 space-y-1' : 'space-y-1'}`}>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 flex items-center text-sm">
                          <FiMapPin className="mr-1 flex-shrink-0" />
                          <span className="truncate">{property.city}, {property.state}</span>
                        </p>
                        <div className="flex items-center">
                          {property.total_reviews > 0 ? (
                            <>
                              <FiStar className="text-yellow-400 mr-1 fill-yellow-400 flex-shrink-0 w-3.5 h-3.5" />
                              <span className="font-semibold text-gray-900 text-sm">{parseFloat(property.average_rating).toFixed(1)}</span>
                              <span className="text-gray-500 text-xs ml-1">({property.total_reviews} verified)</span>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs font-medium">No reviews yet</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Max {property.max_guests} guests
                        </div>
                      </div>
                    </div>
                  </LazyPropertyCard>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {propertiesData?.pagination && propertiesData.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', propertiesData.pagination.prevPage)}
                    disabled={!propertiesData.pagination.hasPrevPage}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {propertiesData.pagination.currentPage} of {propertiesData.pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handleFilterChange('page', propertiesData.pagination.nextPage)}
                    disabled={!propertiesData.pagination.hasNextPage}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={applyModalSearch}
        filters={filters}
      />
    </div>
  );
};

export default Properties;
