import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiGrid, FiHome, FiCheck } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminDisplayCategories = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState([]);
  const [searchProperty, setSearchProperty] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  // Fetch display categories
  const { data: categoriesData, isLoading } = useQuery(
    'admin-display-categories',
    () => api.get('/admin/display-categories'),
    {
      select: (response) => response.data?.data?.categories || [],
    }
  );

  // Create category mutation
  const createCategoryMutation = useMutation(
    (categoryData) => api.post('/admin/display-categories', categoryData),
    {
      onSuccess: () => {
        showSuccess('Display category created successfully!');
        queryClient.invalidateQueries('admin-display-categories');
        setShowAddModal(false);
        resetForm();
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to create display category');
      }
    }
  );

  // Update category mutation
  const updateCategoryMutation = useMutation(
    ({ id, ...categoryData }) => api.put(`/admin/display-categories/${id}`, categoryData),
    {
      onSuccess: () => {
        showSuccess('Display category updated successfully!');
        queryClient.invalidateQueries('admin-display-categories');
        setShowEditModal(false);
        resetForm();
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update display category');
      }
    }
  );

  // Delete category mutation
  const deleteCategoryMutation = useMutation(
    (id) => api.delete(`/admin/display-categories/${id}`),
    {
      onSuccess: () => {
        showSuccess('Display category deleted successfully!');
        queryClient.invalidateQueries('admin-display-categories');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to delete display category');
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
    setSelectedCategory(null);
  };

  const handleAddCategory = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      sort_order: category.sort_order || 0,
      is_active: category.is_active
    });
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (showAddModal) {
      createCategoryMutation.mutate(formData);
    } else if (showEditModal) {
      updateCategoryMutation.mutate({
        id: selectedCategory.id,
        ...formData
      });
    }
  };

  const handleDelete = (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  const handleAssignProperties = (category) => {
    setSelectedCategory(category);
    setShowAssignModal(true);
  };

  // Fetch all properties for assignment
  const { data: allProperties } = useQuery(
    'admin-all-properties',
    () => api.get('/admin/properties/all'),
    {
      select: (response) => response.data?.data?.properties || [],
      enabled: showAssignModal,
    }
  );

  // Fetch properties assigned to selected category
  const { data: assignedProperties } = useQuery(
    ['category-properties', selectedCategory?.id],
    () => api.get(`/admin/display-categories/${selectedCategory?.id}/properties`),
    {
      select: (response) => response.data?.data?.properties || [],
      enabled: showAssignModal && !!selectedCategory?.id,
      onSuccess: (data) => {
        // Set selected property IDs when data loads
        const assignedIds = data?.map(p => p.id) || [];
        setSelectedPropertyIds(assignedIds);
      }
    }
  );

  // Assign properties mutation
  const assignPropertiesMutation = useMutation(
    ({ categoryId, propertyIds }) => api.post(`/admin/display-categories/${categoryId}/assign-properties`, { property_ids: propertyIds }),
    {
      onSuccess: () => {
        showSuccess('Properties assigned successfully!');
        queryClient.invalidateQueries('admin-display-categories');
        queryClient.invalidateQueries(['category-properties', selectedCategory?.id]);
        setShowAssignModal(false);
        setSelectedCategory(null);
        setSelectedPropertyIds([]);
        setSearchProperty('');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to assign properties');
      }
    }
  );

  const handleToggleProperty = (propertyId) => {
    setSelectedPropertyIds(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSaveAssignments = () => {
    if (selectedCategory) {
      assignPropertiesMutation.mutate({
        categoryId: selectedCategory.id,
        propertyIds: selectedPropertyIds
      });
    }
  };

  // Filter properties based on search
  const filteredProperties = allProperties?.filter(property => 
    property.title?.toLowerCase().includes(searchProperty.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchProperty.toLowerCase())
  ) || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Display Categories Management</h1>
          <p className="text-gray-600 mt-2">Manage display categories for home page property sections</p>
        </div>

        {/* Add Category Button */}
        <div className="mb-6">
          <button
            onClick={handleAddCategory}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add New Display Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesData?.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center flex-1">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    <FiGrid className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>Properties: {category.property_count || 0}</span>
                      <span>Order: {category.sort_order || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <button
                    onClick={() => handleAssignProperties(category)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Assign Properties"
                  >
                    <FiHome className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Status: <span className={category.is_active ? 'text-green-600' : 'text-gray-400'}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span></p>
                <p>Created: {new Date(category.created_at).toLocaleDateString()}</p>
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
                  {showAddModal ? 'Add New Display Category' : 'Edit Display Category'}
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
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Beachfront Properties, City Center, Luxury"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder="Brief description of this category"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
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
                    disabled={createCategoryMutation.isLoading || updateCategoryMutation.isLoading}
                    className="btn-primary"
                  >
                    {createCategoryMutation.isLoading || updateCategoryMutation.isLoading ? (
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

        {/* Assign Properties Modal */}
        {showAssignModal && selectedCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Assign Properties to "{selectedCategory.name}"
                </h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedCategory(null);
                    setSelectedPropertyIds([]);
                    setSearchProperty('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchProperty}
                  onChange={(e) => setSearchProperty(e.target.value)}
                  className="input-field"
                  placeholder="Search properties by name or city..."
                />
              </div>

              {/* Selected count */}
              <div className="mb-4 text-sm text-gray-600">
                {selectedPropertyIds.length} property(s) selected
              </div>

              {/* Properties List */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredProperties.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredProperties.map((property) => {
                      const isSelected = selectedPropertyIds.includes(property.id);
                      return (
                        <div
                          key={property.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            isSelected ? 'bg-primary-50' : ''
                          }`}
                          onClick={() => handleToggleProperty(property.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center mr-3 ${
                                isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                              }`}>
                                {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{property.title}</h3>
                                <p className="text-sm text-gray-500">
                                  {property.city}, {property.state} • BDT {property.base_price}/night
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No properties found
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedCategory(null);
                    setSelectedPropertyIds([]);
                    setSearchProperty('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignments}
                  disabled={assignPropertiesMutation.isLoading}
                  className="btn-primary"
                >
                  {assignPropertiesMutation.isLoading ? (
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
        )}
      </div>
    </div>
  );
};

export default AdminDisplayCategories;

