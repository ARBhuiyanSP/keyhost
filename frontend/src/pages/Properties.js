import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiSearch, FiMapPin, FiFilter, FiGrid, FiList, FiStar, FiWifi, FiCar, FiUtensils, FiHeart } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAuthStore from '../store/authStore';
import useToast from '../hooks/useToast';
import StickySearchHeader from '../components/layout/StickySearchHeader';
import PropertyImageSlider from '../components/property/PropertyImageSlider';

const Properties = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

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
      amenities: '',
      sort_by: 'created_at',
      sort_order: 'DESC',
      page: '1',
      limit: '12'
    };
    setFilters(clearedFilters);
    setSearchParams(clearedFilters);
  };

  return (
    <div className="min-h-screen bg-white pt-20 md:pt-16">
      <StickySearchHeader alwaysSticky={true} />
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
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card">
                    <div className="loading-skeleton h-48 mb-4"></div>
                    <div className="loading-skeleton h-4 mb-2"></div>
                    <div className="loading-skeleton h-4 w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : propertiesData?.properties?.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6' : 'grid-cols-1'}`}>
                {propertiesData.properties.map((property) => (
                  <div
                    key={property.id}
                    className={`card-hover ${viewMode === 'list' ? 'flex' : ''}`}
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
                    <div className={`relative ${viewMode === 'list' ? 'w-1/3' : ''} ${viewMode === 'list' ? 'h-32' : 'h-48'}`}>
                      <PropertyImageSlider
                        property={property}
                        className="w-full h-full"
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
                      <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-sm font-medium z-20">
                        <span className="text-red-600 font-bold">BDT {property.base_price}</span><span className="text-gray-600">/night</span>
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
                        <FiStar className="text-yellow-400 mr-1 fill-yellow-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{property.average_rating || 'New'}</span>
                        <span className="text-gray-500 ml-1 text-sm">
                          ({property.total_reviews} reviews)
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Max {property.max_guests} guests
                      </div>
                    </div>
                  </div>
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
    </div>
  );
};

export default Properties;
