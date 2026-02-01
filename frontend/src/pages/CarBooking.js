import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiTruck, FiMapPin, FiCalendar, FiClock, FiUsers, FiStar, FiSearch, FiFilter } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CarBooking = () => {
  const [searchData, setSearchData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: null,
    pickupTime: '',
    passengers: 1
  });

  const [filters, setFilters] = useState({
    carType: '',
    priceRange: '',
    transmission: ''
  });

  // Fetch available cars
  const { data: cars, isLoading } = useQuery(
    ['cars', searchData, filters],
    () => {
      const params = new URLSearchParams();
      if (searchData.pickupLocation) params.append('pickup_location', searchData.pickupLocation);
      if (searchData.dropoffLocation) params.append('dropoff_location', searchData.dropoffLocation);
      if (searchData.pickupDate) params.append('pickup_date', searchData.pickupDate.toISOString().split('T')[0]);
      if (filters.carType) params.append('car_type', filters.carType);
      if (filters.priceRange) params.append('price_range', filters.priceRange);
      
      return api.get(`/cars?${params.toString()}`);
    },
    {
      select: (response) => response.data?.data?.cars || [],
      enabled: false // Only fetch when search is triggered
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    // Trigger the query
    window.location.reload(); // Simple way to trigger the query
  };

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 mobile-footer-spacing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Car Booking
          </h1>
          <p className="text-xl text-gray-600">
            Find the perfect car for your journey
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Pickup Location */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="inline mr-2" />
                  Pickup Location
                </label>
                <input
                  type="text"
                  placeholder="Enter pickup location"
                  value={searchData.pickupLocation}
                  onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Dropoff Location */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMapPin className="inline mr-2" />
                  Dropoff Location
                </label>
                <input
                  type="text"
                  placeholder="Enter dropoff location"
                  value={searchData.dropoffLocation}
                  onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Pickup Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiCalendar className="inline mr-2" />
                  Pickup Date
                </label>
                <DatePicker
                  selected={searchData.pickupDate}
                  onChange={(date) => handleInputChange('pickupDate', date)}
                  minDate={new Date()}
                  placeholderText="Select date"
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Pickup Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiClock className="inline mr-2" />
                  Pickup Time
                </label>
                <input
                  type="time"
                  value={searchData.pickupTime}
                  onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUsers className="inline mr-2" />
                  Passengers
                </label>
                <select
                  value={searchData.passengers}
                  onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Passenger' : 'Passengers'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full">
                  <FiSearch className="inline mr-2" />
                  Search Cars
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex items-center mb-4">
            <FiFilter className="mr-2" />
            <h3 className="font-semibold">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Car Type
              </label>
              <select
                value={filters.carType}
                onChange={(e) => handleFilterChange('carType', e.target.value)}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="input-field"
              >
                <option value="">All Prices</option>
                <option value="0-50">BDT 0 - BDT 50/hour</option>
                <option value="50-100">BDT 50 - BDT 100/hour</option>
                <option value="100-200">BDT 100 - BDT 200/hour</option>
                <option value="200+">BDT 200+/hour</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transmission
              </label>
              <select
                value={filters.transmission}
                onChange={(e) => handleFilterChange('transmission', e.target.value)}
                className="input-field"
              >
                <option value="">All</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cars List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card">
                <div className="loading-skeleton h-48 mb-4"></div>
                <div className="loading-skeleton h-4 mb-2"></div>
                <div className="loading-skeleton h-4 w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars?.map((car) => (
              <div key={car.id} className="card-hover">
                <div className="relative">
                  <img
                    src={car.image_url || '/images/car-placeholder.jpg'}
                    alt={car.model}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-sm font-medium">
                    BDT {car.hourly_rate}/hour
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-gray-600 flex items-center">
                    <FiTruck className="mr-1" />
                    {car.car_type} • {car.transmission}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiStar className="text-yellow-400 mr-1" />
                      <span className="font-medium">{car.rating || 'New'}</span>
                      <span className="text-gray-500 ml-1">
                        ({car.reviews_count} reviews)
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {car.seats} seats
                    </span>
                  </div>
                  <button className="btn-primary w-full mt-4">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cars?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FiTruck className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No cars available
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarBooking;
