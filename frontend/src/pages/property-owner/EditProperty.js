import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import {
  FiHome, FiMapPin, FiDollarSign, FiUsers, FiImage, FiSave, FiX, FiWifi, FiDroplet, FiCoffee,
  FiTv, FiShield, FiSun, FiEye, FiBriefcase, FiTruck, FiWind, FiThermometer, FiMonitor,
  FiLock, FiKey, FiClock, FiPackage, FiArrowUp, FiZap, FiRadio, FiMusic, FiVideo, FiHeart, FiChevronLeft, FiChevronRight, FiCheck
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ImageUpload from '../../components/common/ImageUpload';
import LocationPicker from '../../components/common/LocationPicker';
import { sanitizeText } from '../../utils/textUtils';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';
import { getStatesForCountry, getCitiesForState } from '../../utils/locationUtils';
import useSettingsStore from '../../store/settingsStore';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries = ['places'];

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
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

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const { settings } = useSettingsStore();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: settings?.google_maps_api_key || '',
    libraries: libraries,
  });

  const {
    ready,
    value: addressValue,
    suggestions: { status, data: addressData },
    setValue: setAddressValue,
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here if needed */
    },
    debounce: 300,
    initOnMount: false,
  });

  React.useEffect(() => {
    if (isLoaded) {
      init();
    }
  }, [isLoaded, init]);

  // Handle address selection from Autocomplete
  const handleAddressSelect = async (address) => {
    setAddressValue(address, false);
    clearSuggestions();

    setFormData(prev => ({ ...prev, address }));

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);

      let foundCountry = 'Bangladesh';
      let foundState = '';
      let foundCity = '';
      let foundPostalCode = '';

      // Parse Google Maps address components to find Country, State, City, Postal Code
      const addressComponents = results[0].address_components;
      addressComponents.forEach(component => {
        const types = component.types;
        if (types.includes('country')) {
          foundCountry = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          foundState = component.long_name;
        }
        if (types.includes('locality') || types.includes('administrative_area_level_2')) {
          foundCity = component.long_name;
        }
        if (types.includes('postal_code')) {
          foundPostalCode = component.long_name;
        }
      });

      // Set form data directly mapped from Geocode
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        country: foundCountry,
        state: foundState,
        city: foundCity,
        postal_code: foundPostalCode,
      }));

      // Try dynamically setting React Select dropdowns based on matched geocoding data
      const countryMatch = Country.getAllCountries().find(c => c.name === foundCountry || c.isoCode === foundCountry);
      if (countryMatch) {
        setSelectedCountry({ value: countryMatch.isoCode, label: countryMatch.name });

        const statesList = getStatesForCountry(countryMatch.isoCode);
        // Relaxed match for state as google often returns different administrative string than country-state-city lib
        const stateMatch = statesList.find(s => s.label.includes(foundState) || foundState.includes(s.label));

        if (stateMatch) {
          setSelectedState(stateMatch);

          const citiesList = getCitiesForState(countryMatch.isoCode, stateMatch.value);
          const cityMatch = citiesList.find(c => c.label.includes(foundCity) || foundCity.includes(c.label));

          if (cityMatch) {
            setSelectedCity(cityMatch);
          } else if (foundCity) {
            setSelectedCity({ value: foundCity, label: foundCity });
          }
        } else if (foundState) {
          setSelectedState({ value: foundState, label: foundState });
        }
      }

    } catch (error) {
      console.error("Error fetching geocode from address: ", error);
      showError("Failed to pinpoint address location on map.");
    }
  };

  // Create update mutation first
  const updatePropertyMutation = useMutation(
    (propertyData) => api.put(`/property-owner/properties/${id}`, propertyData),
    {
      onSuccess: () => {
        showSuccess('Property updated successfully!');
        navigate('/property-owner/properties');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update property');
      }
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

  // Fetch property details
  const { isLoading } = useQuery(
    ['property', id],
    () => api.get(`/property-owner/properties/${id}`),
    {
      enabled: !!id,
      onSuccess: (response) => {
        console.log('Property loaded:', response.data);
        const property = response.data?.data || {};
        setFormData({
          title: property.title || '',
          description: property.description || '',
          property_type: property.property_type || 'room',
          property_category: property.property_category || 'standard',
          address: property.address || '',
          city: property.city || '',
          state: property.state || '',
          country: property.country || 'Bangladesh',
          postal_code: property.postal_code || '',
          latitude: property.latitude || null,
          longitude: property.longitude || null,
          bedrooms: property.bedrooms || 1,
          bathrooms: property.bathrooms || 1,
          max_guests: property.max_guests || 2,
          size_sqft: property.size_sqft || '',
          base_price: property.base_price || '',
          cleaning_fee: property.cleaning_fee || 0,
          security_deposit: property.security_deposit || 0,
          extra_guest_fee: property.extra_guest_fee || 0,
          minimum_stay: property.minimum_stay || 1,
          maximum_stay: property.maximum_stay || '',
          check_in_time: property.check_in_time || '15:00',
          check_out_time: property.check_out_time || '11:00'
        });

        // Setup dropdown state from fetched property
        if (property.country) {
          const countryMatch = Country.getAllCountries().find(c => c.name === property.country);
          if (countryMatch) {
            setSelectedCountry({ value: countryMatch.isoCode, label: countryMatch.name });

            if (property.state) {
              const statesList = getStatesForCountry(countryMatch.isoCode);
              const stateMatch = statesList.find(s => s.label === property.state);
              if (stateMatch) {
                setSelectedState(stateMatch);

                if (property.city) {
                  setSelectedCity({ value: property.city, label: property.city });
                }
              } else {
                setSelectedState({ value: property.state, label: property.state });
                if (property.city) {
                  setSelectedCity({ value: property.city, label: property.city });
                }
              }
            }
          }
        }

        // Populate the address input text seamlessly
        if (property.address) {
          setAddressValue(property.address, false);
        }

        // Load existing images if any
        if (property.images && property.images.length > 0) {
          const existingImages = property.images.map((img, index) => ({
            id: img.id || `existing-${index}`,
            preview: img.image_url,
            name: img.alt_text || `Image ${index + 1}`,
            size: 0,
            existing: true // Mark as existing
          }));
          setImages(existingImages);
          console.log('Loaded existing images:', existingImages.length);
        }

        // Load existing amenities if any
        if (property.amenities && property.amenities.length > 0) {
          setSelectedAmenities(property.amenities.map(amenity => amenity.id));
          console.log('Loaded existing amenities:', property.amenities.length);
        }
      },
      onError: (error) => {
        console.error('Error loading property:', error);
        showError(error.response?.data?.message || 'Failed to load property details');
        navigate('/property-owner/properties');
      }
    }
  );

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

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    let sanitizedValue = value;

    if (type !== 'number' && typeof value === 'string' && name !== 'property_type' && name !== 'property_category') {
      sanitizedValue = sanitizeText(value);
      // extra check for time fields if needed, but our regex allows :
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : sanitizedValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.base_price) {
      showError('Please fill in all required fields');
      return;
    }

    // Prepare data - convert undefined to null
    // Ensure property_type is always sent (required field)
    if (!formData.property_type || formData.property_type.trim() === '') {
      showError('Please select a property type');
      return;
    }

    const propertyData = {
      title: formData.title,
      description: formData.description,
      // store lowercase to match existing column/enum values
      property_type: (formData.property_type || '').toLowerCase(),
      property_category: formData.property_category || 'standard',
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country || 'Bangladesh',
      postal_code: formData.postal_code || null,
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      bedrooms: parseInt(formData.bedrooms) || 1,
      bathrooms: parseInt(formData.bathrooms) || 1,
      max_guests: parseInt(formData.max_guests) || 2,
      size_sqft: formData.size_sqft ? parseInt(formData.size_sqft) : null,
      base_price: parseFloat(formData.base_price),
      cleaning_fee: parseFloat(formData.cleaning_fee) || 0,
      security_deposit: parseFloat(formData.security_deposit) || 0,
      extra_guest_fee: parseFloat(formData.extra_guest_fee) || 0,
      check_in_time: formData.check_in_time || '15:00:00',
      check_out_time: formData.check_out_time || '11:00:00',
      minimum_stay: parseInt(formData.minimum_stay) || 1,
      maximum_stay: formData.maximum_stay ? parseInt(formData.maximum_stay) : null,
      amenities: selectedAmenities,
      images: images.map(img => img.preview) // Base64 strings
    };

    console.log('Update Data', propertyData);
    updatePropertyMutation.mutate(propertyData);
  };

  const currentSearchAddress = [formData.address, formData.city, formData.state, formData.country].filter(Boolean).join(', ');

  if (isLoading) return <LoadingSpinner />;


  const totalSteps = 6;

  const steps = [
    { id: 1, name: 'Basic Info' },
    { id: 2, name: 'Location' },
    { id: 3, name: 'Details' },
    { id: 4, name: 'Amenities' },
    { id: 5, name: 'Images' },
    { id: 6, name: 'Pricing' }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.description || !formData.property_type) {
        showError('Please fill in all required basic info fields'); return;
      }
    } else if (currentStep === 2) {
      if (!formData.address || !formData.city || !formData.state) {
        showError('Please fill in location details'); return;
      }
    }
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p className="mt-2 text-gray-600">Update your property details</p>
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

          {/* Progress Bar */}
          <div className="mb-8 relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center relative z-10 w-full">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${currentStep === step.id
                      ? 'bg-primary-600 text-white shadow-lg scale-110'
                      : currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                      }`}
                  >
                    {currentStep > step.id ? <FiCheck className="w-5 h-5" /> : step.id}
                  </div>
                  <span className={`text-xs mt-3 font-medium transition-colors ${currentStep === step.id ? 'text-primary-600' : currentStep > step.id ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.name}
                  </span>
                </div>
              ))}
              {/* Connector Lines */}
              <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-gray-200 -z-10 rounded-full">
                <div
                  className="h-full bg-green-500 transition-all duration-500 rounded-full"
                  style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>


          {currentStep === 1 && (
            <>
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

            </>
          )}

          {currentStep === 2 && (
            <>
              {/* Location */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiMapPin className="mr-2" />
                  Location
                </h2>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={addressValue}
                      onChange={(e) => {
                        setAddressValue(e.target.value);
                        handleInputChange(e); // Sync manual typing
                      }}
                      className="input-field"
                      placeholder="Start typing to search address..."
                      required
                      autoComplete="off"
                    />
                    {status === 'OK' && (
                      <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {addressData.map(({ place_id, description }) => (
                          <li
                            key={place_id}
                            onClick={() => handleAddressSelect(description)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-0"
                          >
                            {description}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                      </label>
                      <Select
                        options={Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }))}
                        value={selectedCountry}
                        onChange={(option) => {
                          setSelectedCountry(option);
                          setSelectedState(null);
                          setSelectedCity(null);
                          setFormData(prev => ({
                            ...prev,
                            country: option ? option.label : '',
                            state: '',
                            city: ''
                          }));
                        }}
                        placeholder="Search Country"
                        isClearable
                        required
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            padding: '0.3rem',
                            borderRadius: '0.75rem',
                            borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
                            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : '2px 2px 0px rgba(0,0,0,0.04)',
                            backgroundColor: '#f9fafb',
                          }),
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Division *
                      </label>
                      <Select
                        options={selectedCountry ? getStatesForCountry(selectedCountry.value) : []}
                        value={selectedState}
                        onChange={(option) => {
                          setSelectedState(option);
                          setSelectedCity(null);
                          setFormData(prev => ({
                            ...prev,
                            state: option ? option.label : '',
                            city: ''
                          }));
                        }}
                        placeholder={selectedCountry ? "Search State/Division" : "Select Country First"}
                        isDisabled={!selectedCountry}
                        isClearable
                        required
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            padding: '0.3rem',
                            borderRadius: '0.75rem',
                            borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
                            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : '2px 2px 0px rgba(0,0,0,0.04)',
                            backgroundColor: '#f9fafb',
                          }),
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <Select
                        options={selectedState ? getCitiesForState(selectedCountry.value, selectedState.value) : []}
                        value={selectedCity}
                        onChange={(option) => {
                          setSelectedCity(option);
                          setFormData(prev => ({
                            ...prev,
                            city: option ? option.label : ''
                          }));
                        }}
                        placeholder={selectedState ? "Search City" : "Select State First"}
                        isDisabled={!selectedState}
                        isClearable
                        required
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            padding: '0.3rem',
                            borderRadius: '0.75rem',
                            borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
                            boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : '2px 2px 0px rgba(0,0,0,0.04)',
                            backgroundColor: '#f9fafb',
                          }),
                        }}
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
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pin Location on Map
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Adjust the pin to the exact location of your property if needed.
                    </p>
                    <LocationPicker
                      initialLat={formData.latitude}
                      initialLng={formData.longitude}
                      searchAddress={currentSearchAddress}
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

            </>
          )}

          {currentStep === 3 && (
            <>
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
                </div>
              </div>

            </>
          )}

          {currentStep === 4 && (
            <>
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
                    />
                  </div>
                </div>
              </div>


              {/* Check-in/Check-out Times */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiClock className="mr-2" />
                  Check-in/Check-out
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-in Time
                    </label>
                    <input
                      type="time"
                      name="check_in_time"
                      value={formData.check_in_time || '15:00'}
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
                      value={formData.check_out_time || '11:00'}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

            </>
          )}

          {currentStep === 5 && (
            <>
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
                              onClick={(e) => {
                                e.preventDefault();
                                if (selectedAmenities.includes(amenity.id)) {
                                  setSelectedAmenities(selectedAmenities.filter(id => id !== amenity.id));
                                } else {
                                  setSelectedAmenities([...selectedAmenities, amenity.id]);
                                }
                              }}
                              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${selectedAmenities.includes(amenity.id)
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedAmenities.includes(amenity.id)}
                                readOnly
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

            </>
          )}

          {currentStep === 6 && (
            <>
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

            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-4 mt-8 border-t border-gray-100">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`px-6 py-2.5 rounded-lg flex items-center font-medium transition-colors ${currentStep === 1 ? 'opacity-50 cursor-not-allowed bg-gray-50 text-gray-400 border border-gray-200' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            >
              <FiChevronLeft className="mr-2" />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center px-6 py-2.5"
              >
                Next
                <FiChevronRight className="ml-2" />
              </button>
            ) : (
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/property-owner/properties')}
                  className="btn-outline px-6 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatePropertyMutation.isLoading}
                  className="btn-primary flex items-center px-6 py-2.5 shadow-lg shadow-primary-500/30"
                >
                  <FiSave className="mr-2" />
                  {updatePropertyMutation.isLoading ? 'Saving...' : 'Update Property'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;

