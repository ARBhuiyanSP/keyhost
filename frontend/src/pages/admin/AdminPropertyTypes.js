import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiHome } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminPropertyTypes = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  // Fetch property types
  const { data: propertyTypesData, isLoading } = useQuery(
    'admin-property-types',
    () => api.get('/admin/property-types'),
    {
      select: (response) => response.data?.data?.propertyTypes || [],
    }
  );

  // Create property type mutation
  const createPropertyTypeMutation = useMutation(
    (propertyTypeData) => api.post('/admin/property-types', propertyTypeData),
    {
      onSuccess: () => {
        showSuccess('Property type created successfully!');
        queryClient.invalidateQueries('admin-property-types');
        queryClient.invalidateQueries('property-types'); // Invalidate public endpoint cache
        setShowAddModal(false);
        resetForm();
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to create property type');
      }
    }
  );

  // Update property type mutation
  const updatePropertyTypeMutation = useMutation(
    ({ id, ...propertyTypeData }) => api.put(`/admin/property-types/${id}`, propertyTypeData),
    {
      onSuccess: () => {
        showSuccess('Property type updated successfully!');
        queryClient.invalidateQueries('admin-property-types');
        queryClient.invalidateQueries('property-types'); // Invalidate public endpoint cache
        setShowEditModal(false);
        resetForm();
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update property type');
      }
    }
  );

  // Delete property type mutation
  const deletePropertyTypeMutation = useMutation(
    (id) => api.delete(`/admin/property-types/${id}`),
    {
      onSuccess: () => {
        showSuccess('Property type deleted successfully!');
        queryClient.invalidateQueries('admin-property-types');
        queryClient.invalidateQueries('property-types'); // Invalidate public endpoint cache
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to delete property type');
      }
    }
  );

  // Toggle property type status mutation
  const togglePropertyTypeMutation = useMutation(
    ({ id, is_active }) => api.patch(`/admin/property-types/${id}/toggle`, { is_active }),
    {
      onSuccess: () => {
        showSuccess('Property type status updated successfully!');
        queryClient.invalidateQueries('admin-property-types');
        queryClient.invalidateQueries('property-types'); // Invalidate public endpoint cache
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update property type status');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sort_order: 0,
      is_active: true
    });
    setSelectedPropertyType(null);
  };

  const handleAddPropertyType = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleEditPropertyType = (propertyType) => {
    setSelectedPropertyType(propertyType);
    setFormData({
      name: propertyType.name,
      description: propertyType.description || '',
      sort_order: propertyType.sort_order || 0,
      is_active: propertyType.is_active
    });
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (showAddModal) {
      createPropertyTypeMutation.mutate(formData);
    } else if (showEditModal) {
      updatePropertyTypeMutation.mutate({
        id: selectedPropertyType.id,
        ...formData
      });
    }
  };

  const handleDelete = (propertyType) => {
    if (window.confirm(`Are you sure you want to delete "${propertyType.name}"?`)) {
      deletePropertyTypeMutation.mutate(propertyType.id);
    }
  };

  const handleToggleStatus = (propertyType) => {
    togglePropertyTypeMutation.mutate({
      id: propertyType.id,
      is_active: !propertyType.is_active
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Property Types Management</h1>
          <p className="text-gray-600 mt-2">Manage property types that owners can select when adding properties</p>
        </div>

        {/* Add Property Type Button */}
        <div className="mb-6">
          <button
            onClick={handleAddPropertyType}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add New Property Type
          </button>
        </div>

        {/* Property Types Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {propertyTypesData && propertyTypesData.length > 0 ? (
                propertyTypesData.map((propertyType) => (
                  <tr key={propertyType.id} className={!propertyType.is_active ? 'opacity-60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiHome className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{propertyType.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {propertyType.description || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {propertyType.property_count || 0} {propertyType.property_count === 1 ? 'property' : 'properties'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{propertyType.sort_order}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(propertyType)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          propertyType.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {propertyType.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditPropertyType(propertyType)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(propertyType)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No property types found. Add your first property type!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add Property Type</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Add Property Type
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Edit Property Type</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Update Property Type
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

export default AdminPropertyTypes;

