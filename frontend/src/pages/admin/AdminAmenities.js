import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiWifi, FiDroplet, FiCoffee, 
  FiTv, FiShield, FiSun, FiBriefcase, FiTruck, FiWind, FiThermometer, FiMonitor, FiLock, 
  FiKey, FiClock, FiPackage, FiHeart, FiHome, FiArrowUp, FiZap, FiRadio, FiMusic, 
  FiVideo, FiBook, FiUmbrella, FiMoon, FiCloud, FiActivity, FiAward, FiCheckCircle
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminAmenities = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    category: 'basic',
    is_active: true
  });

  // Fetch amenities
  const { data: amenitiesData, isLoading } = useQuery(
    'admin-amenities',
    () => api.get('/admin/amenities'),
    {
      select: (response) => response.data?.data?.amenities || [],
    }
  );

  // Create amenity mutation
  const createAmenityMutation = useMutation(
    (amenityData) => api.post('/admin/amenities', amenityData),
    {
      onSuccess: () => {
        showSuccess('Amenity created successfully!');
        queryClient.invalidateQueries('admin-amenities');
        setShowAddModal(false);
        resetForm();
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to create amenity');
      }
    }
  );

  // Update amenity mutation
  const updateAmenityMutation = useMutation(
    ({ id, ...amenityData }) => api.put(`/admin/amenities/${id}`, amenityData),
    {
      onSuccess: () => {
        showSuccess('Amenity updated successfully!');
        queryClient.invalidateQueries('admin-amenities');
        setShowEditModal(false);
        resetForm();
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update amenity');
      }
    }
  );

  // Delete amenity mutation
  const deleteAmenityMutation = useMutation(
    (id) => api.delete(`/admin/amenities/${id}`),
    {
      onSuccess: () => {
        showSuccess('Amenity deleted successfully!');
        queryClient.invalidateQueries('admin-amenities');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to delete amenity');
      }
    }
  );

  // Toggle amenity status mutation
  const toggleAmenityMutation = useMutation(
    ({ id, is_active }) => api.patch(`/admin/amenities/${id}/toggle`, { is_active }),
    {
      onSuccess: () => {
        showSuccess('Amenity status updated successfully!');
        queryClient.invalidateQueries('admin-amenities');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update amenity status');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '',
      category: 'basic',
      is_active: true
    });
    setSelectedAmenity(null);
  };

  const handleAddAmenity = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleEditAmenity = (amenity) => {
    setSelectedAmenity(amenity);
    setFormData({
      name: amenity.name,
      icon: amenity.icon || '',
      category: amenity.category,
      is_active: amenity.is_active
    });
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (showAddModal) {
      createAmenityMutation.mutate(formData);
    } else if (showEditModal) {
      updateAmenityMutation.mutate({
        id: selectedAmenity.id,
        ...formData
      });
    }
  };

  const handleDelete = (amenity) => {
    if (window.confirm(`Are you sure you want to delete "${amenity.name}"?`)) {
      deleteAmenityMutation.mutate(amenity.id);
    }
  };

  const handleToggleStatus = (amenity) => {
    toggleAmenityMutation.mutate({
      id: amenity.id,
      is_active: !amenity.is_active
    });
  };

  // Get icon for amenity based on its name
  const getAmenityIcon = (amenityName, category) => {
    const name = amenityName.toLowerCase().trim();
    
    // Comprehensive icon mapping based on amenity name
    const iconMap = {
      // Internet & Connectivity
      'wifi': FiWifi, 'internet': FiWifi, 'wireless': FiWifi, 'wi-fi': FiWifi, 'wi fi': FiWifi,
      
      // Parking & Transportation
      'parking': FiTruck, 'car parking': FiTruck, 'garage': FiTruck, 'valet parking': FiTruck,
      
      // Water & Pool
      'pool': FiDroplet, 'swimming pool': FiDroplet, 'hot tub': FiDroplet, 'jacuzzi': FiDroplet,
      'bath': FiDroplet, 'bathtub': FiDroplet, 'shower': FiDroplet, 'bathroom': FiDroplet,
      
      // Air & Temperature
      'air conditioning': FiWind, 'ac': FiWind, 'air conditioner': FiWind, 'cooling': FiWind,
      'heating': FiThermometer, 'heater': FiThermometer, 'fireplace': FiThermometer,
      
      // Entertainment
      'tv': FiTv, 'television': FiTv, 'cable tv': FiTv, 'smart tv': FiMonitor,
      'radio': FiRadio, 'sound system': FiMusic, 'speakers': FiMusic,
      'game console': FiVideo, 'gaming': FiVideo, 'playstation': FiVideo, 'xbox': FiVideo,
      
      // Kitchen & Appliances
      'kitchen': FiCoffee, 'coffee maker': FiCoffee, 'coffee': FiCoffee, 'microwave': FiCoffee,
      'refrigerator': FiPackage, 'fridge': FiPackage, 'washer': FiPackage, 'washing machine': FiPackage,
      'dryer': FiPackage, 'dishwasher': FiPackage, 'oven': FiCoffee, 'stove': FiCoffee,
      
      // Safety & Security
      'security': FiShield, 'security system': FiShield, 'safe': FiLock, 'lock': FiLock,
      'smoke detector': FiShield, 'fire extinguisher': FiShield, 'first aid': FiShield,
      'cctv': FiShield, 'alarm': FiShield,
      
      // Access & Entry
      'elevator': FiArrowUp, 'lift': FiArrowUp, 'wheelchair accessible': FiEye,
      'accessible': FiEye, 'ramp': FiEye,
      
      // Power & Utilities
      'power backup': FiZap, 'generator': FiZap, 'ups': FiZap, 'electricity': FiZap,
      
      // Outdoor & Nature
      'balcony': FiSun, 'terrace': FiSun, 'garden': FiSun, 'patio': FiSun,
      'outdoor': FiSun, 'beach access': FiSun, 'mountain view': FiSun, 'sea view': FiSun,
      
      // Services & Features
      'gym': FiBriefcase, 'fitness': FiBriefcase, 'fitness center': FiBriefcase,
      'laundry': FiPackage, 'iron': FiPackage, 'hair dryer': FiPackage,
      'towels': FiPackage, 'linens': FiPackage, 'bedding': FiPackage,
      
      // Pet & Policies
      'pet friendly': FiHeart, 'pets allowed': FiHeart, 'smoking': FiX, 'smoking allowed': FiX,
      
      // Check-in/Check-out
      'check in': FiKey, 'check-in': FiKey, 'check out': FiClock, 'check-out': FiClock,
      
      // Other
      'breakfast': FiCoffee, 'room service': FiCoffee, 'housekeeping': FiHome,
      'concierge': FiHome, 'luggage storage': FiPackage, 'storage': FiPackage,
    };
    
    // Try to find exact match first
    if (iconMap[name]) {
      const IconComponent = iconMap[name];
      return <IconComponent className="w-4 h-4" />;
    }
    
    // Try partial matches
    for (const [key, Icon] of Object.entries(iconMap)) {
      if (name.includes(key) || key.includes(name)) {
        return <Icon className="w-4 h-4" />;
      }
    }
    
    // Fallback to category-based icon
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
    return <IconComponent className="w-4 h-4" />;
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
    return <IconComponent className="w-4 h-4" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      safety: 'bg-red-100 text-red-800',
      entertainment: 'bg-purple-100 text-purple-800',
      kitchen: 'bg-green-100 text-green-800',
      bathroom: 'bg-yellow-100 text-yellow-800',
      outdoor: 'bg-cyan-100 text-cyan-800',
      accessibility: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const categories = [
    { value: 'basic', label: 'Basic' },
    { value: 'safety', label: 'Safety' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'accessibility', label: 'Accessibility' }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Amenities Management</h1>
          <p className="text-gray-600 mt-2">Manage property amenities and categories</p>
        </div>

        {/* Add Amenity Button */}
        <div className="mb-6">
          <button
            onClick={handleAddAmenity}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add New Amenity
          </button>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenitiesData?.map((amenity) => (
            <div key={amenity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    {getAmenityIcon(amenity.name, amenity.category)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{amenity.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(amenity.category)}`}>
                      {amenity.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleStatus(amenity);
                    }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      amenity.is_active 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={amenity.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {amenity.is_active ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditAmenity(amenity);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(amenity);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Status: <span className={amenity.is_active ? 'text-green-600' : 'text-gray-400'}>
                  {amenity.is_active ? 'Active' : 'Inactive'}
                </span></p>
                <p>Created: {new Date(amenity.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {showAddModal ? 'Add New Amenity' : 'Edit Amenity'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amenity Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., WiFi, Parking, Pool"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon Class (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="input-field"
                    placeholder="e.g., fas fa-wifi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {showEditModal && (
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createAmenityMutation.isLoading || updateAmenityMutation.isLoading}
                    className="btn-primary"
                  >
                    {createAmenityMutation.isLoading || updateAmenityMutation.isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <FiSave className="w-4 h-4 mr-2" />
                        {showAddModal ? 'Create' : 'Update'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAmenities;
