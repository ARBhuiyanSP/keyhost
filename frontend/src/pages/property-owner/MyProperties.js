import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiHome, FiPlus, FiEdit, FiEye, FiTrash2, FiMapPin, FiStar, FiDollarSign, FiCalendar, FiUsers } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyProperties = () => {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch property owner's properties
  const { data: propertiesData, isLoading, refetch } = useQuery(
    ['owner-properties', selectedStatus],
    () => api.get(`/property-owner/properties${selectedStatus ? `?status=${selectedStatus}` : ''}`),
    {
      select: (response) => response.data?.data || { properties: [], pagination: {} },
    }
  );

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/property-owner/properties/${propertyId}`);
        console.log('Delete response:', response);
        
        if (response.data?.success) {
          alert('Property deleted successfully!');
          refetch();
        } else {
          alert(response.data?.message || 'Failed to delete property');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert(error.response?.data?.message || 'Failed to delete property. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyTypeColor = (type) => {
    switch (type) {
      case 'room':
        return 'bg-blue-100 text-blue-800';
      case 'villa':
        return 'bg-green-100 text-green-800';
      case 'apartment':
        return 'bg-purple-100 text-purple-800';
      case 'house':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
              <p className="text-gray-600 mt-2">Manage your property listings</p>
            </div>
            <button
              onClick={() => navigate('/property-owner/properties/new')}
              className="btn-primary flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Property
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field w-auto"
              >
                <option value="">All Properties</option>
                <option value="active">Active</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="loading-skeleton h-48"></div>
                <div className="p-6">
                  <div className="loading-skeleton h-4 mb-2"></div>
                  <div className="loading-skeleton h-4 w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : propertiesData?.properties?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesData.properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Property Image */}
                <div className="relative">
                  <img
                    src={property.main_image?.image_url || '/images/placeholder.svg'}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPropertyTypeColor(property.property_type)}`}>
                      {property.property_type}
                    </span>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  
                  <p className="text-gray-600 flex items-center mb-3">
                    <FiMapPin className="mr-1" />
                    {property.city}, {property.state}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FiDollarSign className="mr-1" />
                      <span className="font-bold text-red-600">BDT {property.base_price}/night</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiUsers className="mr-1" />
                      <span>Max {property.max_guests}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiStar className="mr-1" />
                      <span>{property.average_rating || 'New'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiCalendar className="mr-1" />
                      <span>{property.total_reviews || 0} reviews</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/property/${property.id}`)}
                      className="flex-1 btn-outline flex items-center justify-center"
                    >
                      <FiEye className="mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/property-owner/properties/${property.id}/edit`)}
                      className="flex-1 btn-primary flex items-center justify-center"
                    >
                      <FiEdit className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(property.id)}
                      className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiHome className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus 
                ? `No properties with status "${selectedStatus}" found.`
                : "You haven't added any properties yet."
              }
            </p>
            <button
              onClick={() => navigate('/property-owner/properties/new')}
              className="btn-primary"
            >
              <FiPlus className="inline mr-2" />
              Add Your First Property
            </button>
          </div>
        )}

        {/* Pagination */}
        {propertiesData?.pagination && propertiesData.pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  // Handle pagination
                }}
                disabled={!propertiesData.pagination.hasPrevPage}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {propertiesData.pagination.currentPage} of {propertiesData.pagination.totalPages}
              </span>
              
              <button
                onClick={() => {
                  // Handle pagination
                }}
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
  );
};

export default MyProperties;
