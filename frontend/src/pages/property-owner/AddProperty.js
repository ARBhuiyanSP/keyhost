import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import {
  FiHome, FiMapPin, FiDollarSign, FiUsers, FiImage, FiSave, FiX, FiWifi, FiDroplet, FiCoffee,
  FiTv, FiShield, FiSun, FiEye, FiBriefcase, FiTruck, FiWind, FiThermometer, FiMonitor,
  FiLock, FiKey, FiClock, FiPackage, FiArrowUp, FiZap, FiRadio, FiMusic, FiVideo, FiHeart
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import ImageUpload from '../../components/common/ImageUpload';
import LocationPicker from '../../components/common/LocationPicker';

const AddProperty = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [images, setImages] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'room',
    property_category: 'standard',
    address: '',
    city: '',
    state: '',
    country: 'Bangladesh',
    postal_code: '',
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    size_sqft: '',
    base_price: '',
    cleaning_fee: 0,
    security_deposit: 0,
    extra_guest_fee: 0,
    minimum_stay: 1,
    maximum_stay: '',
    check_in_time: '15:00',
    check_out_time: '11:00'
  });

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

  const addPropertyMutation = useMutation(
    (propertyData) => api.post('/property-owner/properties', propertyData),
    {
      onSuccess: (response) => {
        showSuccess('Property added successfully! Pending admin approval.');
        navigate('/property-owner/properties');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to add property');
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
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
      return <IconComponent className="w-4 h-4 text-gray-600" />;
    }

    for (const [key, Icon] of Object.entries(iconMap)) {
      if (name.includes(key) || key.includes(name)) {
        return <Icon className="w-4 h-4 text-gray-600" />;
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
    return <IconComponent className="w-4 h-4 text-gray-600" />;
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
    return <IconComponent className="w-4 h-4 text-gray-600" />;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title || !formData.description || !formData.base_price) {
      showError('Please fill in all required fields');
      return;
    }

    if (!formData.address || !formData.city || !formData.state) {
      showError('Please fill in location details');
      return;
    }

    // Prepare data - convert undefined to null for optional fields
    const propertyData = {
      title: formData.title,
      description: formData.description,
      // store lowercase to match existing column/enum values
      property_type: (formData.property_type || 'room').toLowerCase(),
      property_category: formData.property_category || 'standard',
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country || 'Bangladesh',
      postal_code: formData.postal_code || null,
      postal_code: formData.postal_code || null,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      bedrooms: parseInt(formData.bedrooms) || 1,
      bathrooms: parseInt(formData.bathrooms) || 1,
      max_guests: parseInt(formData.max_guests) || 2,
      size_sqft: formData.size_sqft ? parseInt(formData.size_sqft) : null,
      floor_number: null,
      base_price: parseFloat(formData.base_price),
      cleaning_fee: parseFloat(formData.cleaning_fee) || 0,
      security_deposit: parseFloat(formData.security_deposit) || 0,
      extra_guest_fee: parseFloat(formData.extra_guest_fee) || 0,
      check_in_time: formData.check_in_time || '15:00:00',
      check_out_time: formData.check_out_time || '11:00:00',
      minimum_stay: parseInt(formData.minimum_stay) || 1,
      maximum_stay: formData.maximum_stay ? parseInt(formData.maximum_stay) : null,
      is_instant_book: false,
      amenities: selectedAmenities,
      images: images.map(img => img.preview) // Array of base64 strings
    };

    console.log('Submitting property with', images.length, 'images');
    console.log('First image preview:', images[0]?.preview?.substring(0, 50));
    addPropertyMutation.mutate(propertyData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
            <p className="mt-2 text-gray-600">List your property for rent</p>
          </div>
          <button
            onClick={() => navigate('/property-owner/properties')}
            className="btn-outline flex items-center"
          >
            <FiX className="mr-2" />
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiHome className="mr-2" />
              Basic Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g. Cozy 2BR Apartment in Gulshan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  className="input-field"
                  placeholder="Describe your property, amenities, nearby attractions..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="property_type"
                    value={(formData.property_type || '').toLowerCase()}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Property Type</option>
                    {propertyTypesData && propertyTypesData.length > 0 ? (
                      propertyTypesData.map((type) => (
                        <option key={type.id} value={type.name.toLowerCase()}>
                          {type.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="room">Room</option>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="house">House</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="property_category"
                    value={formData.property_category}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="budget">Budget</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiMapPin className="mr-2" />
              Location
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Full address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g. Dhaka"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Division *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g. Dhaka Division"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="1212"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pin Location on Map
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Click on the map to set the exact location of your property.
                </p>
                <LocationPicker
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  onLocationSelect={(lat, lng) => {
                    setFormData(prev => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng
                    }));
                  }}
                />
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Latitude: {formData.latitude || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Longitude: {formData.longitude || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiUsers className="mr-2" />
              Property Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Guests *
                </label>
                <input
                  type="number"
                  name="max_guests"
                  value={formData.max_guests}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size (sqft)
                </label>
                <input
                  type="number"
                  name="size_sqft"
                  value={formData.size_sqft}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stay (nights)
                </label>
                <input
                  type="number"
                  name="minimum_stay"
                  value={formData.minimum_stay}
                  onChange={handleInputChange}
                  className="input-field"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Stay (nights)
                </label>
                <input
                  type="number"
                  name="maximum_stay"
                  value={formData.maximum_stay}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiDollarSign className="mr-2" />
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price per Night (BDT) *
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 3000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cleaning Fee (BDT)
                </label>
                <input
                  type="number"
                  name="cleaning_fee"
                  value={formData.cleaning_fee}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Deposit (BDT)
                </label>
                <input
                  type="number"
                  name="security_deposit"
                  value={formData.security_deposit}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extra Guest Fee (BDT)
                </label>
                <input
                  type="number"
                  name="extra_guest_fee"
                  value={formData.extra_guest_fee}
                  onChange={handleInputChange}
                  className="input-field"
                  min="0"
                  step="0.01"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Check-in/Check-out Times */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Check-in/Check-out</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Time
                </label>
                <input
                  type="time"
                  name="check_in_time"
                  value={formData.check_in_time}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Time
                </label>
                <input
                  type="time"
                  name="check_out_time"
                  value={formData.check_out_time}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiHome className="mr-2" />
              Amenities
            </h2>

            {amenitiesData && (
              <div className="space-y-4">
                {Object.entries(
                  amenitiesData.reduce((acc, amenity) => {
                    if (!acc[amenity.category]) acc[amenity.category] = [];
                    acc[amenity.category].push(amenity);
                    return acc;
                  }, {})
                ).map(([category, amenities]) => (
                  <div key={category}>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                      {category} Amenities
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {amenities.map((amenity) => (
                        <label
                          key={amenity.id}
                          className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedAmenities.includes(amenity.id)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedAmenities.includes(amenity.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAmenities([...selectedAmenities, amenity.id]);
                              } else {
                                setSelectedAmenities(selectedAmenities.filter(id => id !== amenity.id));
                              }
                            }}
                            className="sr-only"
                          />
                          <div className="flex items-center w-full">
                            <div className="w-6 h-6 flex items-center justify-center mr-3">
                              {getAmenityIcon(amenity.name, amenity.category)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {amenity.name}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FiImage className="mr-2" />
              Property Images
            </h2>

            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={10}
              maxSize={5 * 1024 * 1024}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/property-owner/properties')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addPropertyMutation.isLoading}
              className="btn-primary flex items-center"
            >
              <FiSave className="mr-2" />
              {addPropertyMutation.isLoading ? 'Saving...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;

