import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiHome, FiSearch, FiFilter, FiEye, FiEdit, FiCheck, FiX, FiMapPin, FiStar, FiDollarSign, FiSave, FiHeart, FiGrid } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminProperties = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    featured: '',
    page: 1,
    limit: 10
  });

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [editFormData, setEditFormData] = useState({
    title: '',
    base_price: '',
    status: '',
    display_category_id: ''
  });

  // Fetch display categories
  const { data: displayCategories } = useQuery(
    'admin-display-categories',
    () => api.get('/admin/display-categories'),
    {
      select: (response) => response.data?.data?.categories || [],
    }
  );

  // Fetch property's assigned categories
  const { data: propertyCategories } = useQuery(
    ['property-categories', selectedProperty?.id],
    () => api.get(`/admin/properties/${selectedProperty?.id}/display-categories`),
    {
      select: (response) => response.data?.data?.categories || [],
      enabled: showCategoryModal && !!selectedProperty?.id,
      onSuccess: (data) => {
        const categoryIds = data.map(cat => cat.id);
        setSelectedCategoryIds(categoryIds);
      }
    }
  );

  // Assign property to categories mutation
  const assignCategoriesMutation = useMutation(
    ({ propertyId, categoryIds }) => api.post(`/admin/properties/${propertyId}/assign-categories`, { category_ids: categoryIds }),
    {
      onSuccess: () => {
        showSuccess('Property assigned to categories successfully!');
        queryClient.invalidateQueries('admin-properties');
        queryClient.invalidateQueries(['property-categories', selectedProperty?.id]);
        setShowCategoryModal(false);
        setSelectedProperty(null);
        setSelectedCategoryIds([]);
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to assign categories');
      }
    }
  );

  // Fetch properties
  const { data: propertiesData, isLoading, refetch } = useQuery(
    ['admin-properties', filters],
    () => api.get(`/admin/properties?${new URLSearchParams(filters).toString()}`),
    {
      select: (response) => {
        const data = response.data?.data || { properties: [], pagination: {} };
        // Ensure display_categories is always an array
        if (data.properties) {
          data.properties = data.properties.map(property => ({
            ...property,
            display_categories: property.display_categories || []
          }));
        }
        return data;
      },
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // Helper function to get display category name
  const getDisplayCategoryName = (categoryId) => {
    if (!categoryId) return 'None';
    const category = displayCategories?.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const handleAssignCategories = (property) => {
    setSelectedProperty(property);
    setShowCategoryModal(true);
  };

  const handleToggleCategory = (categoryId) => {
    setSelectedCategoryIds(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSaveCategoryAssignments = () => {
    if (selectedProperty) {
      assignCategoriesMutation.mutate({
        propertyId: selectedProperty.id,
        categoryIds: selectedCategoryIds
      });
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    try {
      const response = await api.patch(`/admin/properties/${propertyId}/status`, {
        status: newStatus
      });

      if (response.data?.success) {
        showSuccess(response.data?.message || 'Property status updated successfully!');
        await refetch();
      } else {
        showError(response.data?.message || 'Failed to update property status');
      }
    } catch (error) {
      console.error('Error updating property status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update property status. Please try again.';
      showError(errorMessage);
    }
  };

  const handleFeaturedToggle = async (propertyId, isFeatured) => {
    try {
      const response = await api.patch(`/admin/properties/${propertyId}/featured`, {
        is_featured: isFeatured
      });

      if (response.data?.success) {
        showSuccess(response.data?.message || `Property ${isFeatured ? 'featured' : 'unfeatured'} successfully!`);
        await refetch();
      } else {
        showError(response.data?.message || 'Failed to update featured status');
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update featured status. Please try again.';
      showError(errorMessage);
    }
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setEditFormData({
      title: property.title || '',
      base_price: property.base_price || '',
      status: property.status || '',
      display_category_id: property.display_category_id || ''
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setSelectedProperty(null);
    setShowEditModal(false);
    setEditFormData({
      title: '',
      base_price: '',
      status: '',
      display_category_id: ''
    });
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    if (!selectedProperty) return;

    try {
      const response = await api.put(`/admin/properties/${selectedProperty.id}`, editFormData);

      if (response.data?.success) {
        showSuccess('Property updated successfully!');
        await refetch();
        handleCloseModal();
      } else {
        showError(response.data?.message || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update property. Please try again.';
      showError(errorMessage);
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
          <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600 mt-2">Manage and approve property listings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${filters.status === '' ? 'ring-2 ring-primary-600' : ''}`}
            onClick={() => handleFilterChange('status', '')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">All Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {propertiesData?.pagination?.totalItems || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiHome className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${filters.status === 'pending_approval' ? 'ring-2 ring-yellow-600' : ''}`}
            onClick={() => handleFilterChange('status', 'pending_approval')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {propertiesData?.properties?.filter(p => p.status === 'pending_approval').length ||
                    (filters.status === 'pending_approval' ? propertiesData?.pagination?.totalItems : '•')}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiFilter className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-2 font-medium">Click to filter</p>
          </div>

          <div
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${filters.status === 'active' ? 'ring-2 ring-green-600' : ''}`}
            onClick={() => handleFilterChange('status', 'active')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {filters.status === 'active' ? propertiesData?.pagination?.totalItems : '•'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${filters.status === 'suspended' ? 'ring-2 ring-red-600' : ''}`}
            onClick={() => handleFilterChange('status', 'suspended')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-red-600">
                  {filters.status === 'suspended' ? propertiesData?.pagination?.totalItems : '•'}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <FiX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div
            className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow ${filters.featured === 'true' ? 'ring-2 ring-yellow-600' : ''}`}
            onClick={() => handleFilterChange('featured', 'true')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {propertiesData?.properties?.filter(p => p.is_featured).length ||
                    (filters.featured === 'true' ? propertiesData?.pagination?.totalItems : '•')}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FiHeart className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-2 font-medium">Click to filter</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Properties
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title or city..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field"
              >
                <option value="">All Statuses</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured
              </label>
              <select
                value={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.value)}
                className="input-field"
              >
                <option value="">All Properties</option>
                <option value="true">Featured Only</option>
                <option value="false">Not Featured</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', search: '', featured: '', page: 1, limit: 10 })}
                className="btn-secondary w-full"
              >
                <FiFilter className="inline mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">
              Properties List <span className="text-gray-500 font-normal text-sm ml-2">({propertiesData?.pagination?.totalItems || 0} total)</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : propertiesData?.properties?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {propertiesData.properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center group">
                          <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                            <img
                              src={property.main_image?.image_url || '/images/placeholder.svg'}
                              alt={property.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {property.is_featured && (
                              <div className="absolute top-0 right-0 p-0.5 bg-yellow-400 rounded-bl-lg shadow-sm">
                                <FiStar className="w-2.5 h-2.5 text-white fill-current" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900 line-clamp-1 max-w-[200px]" title={property.title}>
                              {property.title}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-0.5">
                              <FiMapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate max-w-[180px]">{property.city}, {property.state}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {property.owner_first_name} {property.owner_last_name}
                        </div>
                        <div className="text-xs text-gray-500">{property.owner_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getPropertyTypeColor(property.property_type)}`}>
                          {property.property_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(property.status)}`}>
                          {property.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">৳{property.base_price}</div>
                        <div className="text-xs text-gray-500">per night</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-xs text-gray-700">
                            <FiStar className="w-3.5 h-3.5 text-yellow-400 mr-1 fill-current" />
                            <span className="font-medium">{property.average_rating || 0}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {property.total_reviews || 0} reviews
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {property.display_categories && property.display_categories.length > 0 ? (
                            property.display_categories.slice(0, 2).map(cat => (
                              <span key={cat.id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                {cat.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">None</span>
                          )}
                          {property.display_categories?.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-500">
                              +{property.display_categories.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Standard Actions */}
                          <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                            <button
                              onClick={() => navigate(`/property/${property.id}`)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded shadow-sm transition-all"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProperty(property)}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-white rounded shadow-sm transition-all"
                              title="Edit Property"
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAssignCategories(property)}
                              className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-white rounded shadow-sm transition-all"
                              title="Manage Categories"
                            >
                              <FiGrid className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleFeaturedToggle(property.id, !property.is_featured)}
                              className={`p-1.5 rounded shadow-sm transition-all ${property.is_featured ? 'text-yellow-500 bg-white' : 'text-gray-400 hover:text-yellow-500 hover:bg-white'}`}
                              title={property.is_featured ? 'Unfeature' : 'Feature'}
                            >
                              <FiHeart className={`w-4 h-4 ${property.is_featured ? 'fill-current' : ''}`} />
                            </button>
                          </div>

                          {/* Status Actions */}
                          {(property.status === 'pending_approval' || property.status === 'suspended') && (
                            <button
                              onClick={() => handleStatusChange(property.id, 'active')}
                              className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md border border-green-200 transition-colors"
                              title="Approve/Activate"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}

                          {(property.status === 'pending_approval' || property.status === 'active') && (
                            <button
                              onClick={() => handleStatusChange(property.id, 'suspended')}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md border border-red-200 transition-colors"
                              title="Suspend/Reject"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}


                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
                <FiHome className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No properties found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">None of the properties match your current filter settings. Try clearing the filters.</p>
              <button
                onClick={() => setFilters({ status: '', search: '', featured: '', page: 1, limit: 10 })}
                className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {propertiesData?.pagination && propertiesData.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page <span className="font-medium text-gray-900">{propertiesData.pagination.currentPage}</span> of <span className="font-medium text-gray-900">{propertiesData.pagination.totalPages}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFilterChange('page', propertiesData.pagination.prevPage)}
                  disabled={!propertiesData.pagination.hasPrevPage}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', propertiesData.pagination.nextPage)}
                  disabled={!propertiesData.pagination.hasNextPage}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Property Modal */}
        {showEditModal && selectedProperty && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
                onClick={handleCloseModal}
              ></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white" id="modal-title">
                    Edit Property
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdateProperty}>
                  <div className="bg-white px-6 py-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                          Property Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={editFormData.title}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-2">
                          Base Price (per night)
                        </label>
                        <input
                          type="number"
                          id="base_price"
                          value={editFormData.base_price}
                          onChange={(e) => setEditFormData({ ...editFormData, base_price: e.target.value })}
                          className="input-field"
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          id="status"
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                          className="input-field"
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="pending_approval">Pending Approval</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="display_category_id" className="block text-sm font-medium text-gray-700 mb-2">
                          Display Category (Optional)
                        </label>
                        <select
                          id="display_category_id"
                          value={editFormData.display_category_id}
                          onChange={(e) => setEditFormData({ ...editFormData, display_category_id: e.target.value })}
                          className="input-field"
                        >
                          <option value="">None</option>
                          {displayCategories?.filter(cat => cat.is_active).map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Properties in this category will appear on home page</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary inline-flex items-center"
                    >
                      <FiSave className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Categories Modal */}
        {showCategoryModal && selectedProperty && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
                onClick={() => {
                  setShowCategoryModal(false);
                  setSelectedProperty(null);
                  setSelectedCategoryIds([]);
                }}
              ></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white" id="modal-title">
                    Assign Categories to "{selectedProperty.title}"
                  </h3>
                  <button
                    onClick={() => {
                      setShowCategoryModal(false);
                      setSelectedProperty(null);
                      setSelectedCategoryIds([]);
                    }}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-white px-6 py-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Select display categories for this property. A property can be assigned to multiple categories.
                  </p>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {displayCategories?.filter(cat => cat.is_active).map((category) => {
                      const isSelected = selectedCategoryIds.includes(category.id);
                      return (
                        <div
                          key={category.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          onClick={() => handleToggleCategory(category.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                                }`}>
                                {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{category.name}</h4>
                                {category.description && (
                                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {category.property_count || 0} properties
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedCategoryIds.length > 0 && (
                    <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                      <p className="text-sm text-primary-800">
                        <strong>{selectedCategoryIds.length}</strong> categor{selectedCategoryIds.length === 1 ? 'y' : 'ies'} selected
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setSelectedProperty(null);
                      setSelectedCategoryIds([]);
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCategoryAssignments}
                    disabled={assignCategoriesMutation.isLoading}
                    className="btn-primary"
                  >
                    {assignCategoriesMutation.isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <FiSave className="w-4 h-4 mr-2" />
                        Save Assignments
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProperties;
