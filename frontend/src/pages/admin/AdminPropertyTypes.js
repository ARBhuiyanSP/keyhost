import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiHome, FiToggleLeft, FiToggleRight,
  FiMove, FiEye, FiEyeOff, FiImage, FiAlertCircle, FiCheck, FiGrid
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

// Icon name → emoji/image mapping for tab icons
const ICON_OPTIONS = [
  { label: 'Room / Bed', value: '/images/nav-icon-room.png', preview: '🛏️' },
  { label: 'Apartment', value: '/images/nav-icon-apartment.png', preview: '🏠' },
  { label: 'Hotel', value: '/images/nav-icon-hotel.png', preview: '🏨' },
  { label: 'Flight', value: '/images/flight.png', preview: '✈️' },
  { label: 'Bus', value: '/images/bus.png', preview: '🚌' },
];

// Smart icon picker based on name
const getSmartIcon = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('flight') || n.includes('air')) return '/images/flight.png';
  if (n.includes('bus')) return '/images/bus.png';
  if (n.includes('hotel')) return '/images/nav-icon-hotel.png';
  if (n.includes('apartment') || n.includes('villa') || n.includes('house') || n.includes('home')) return '/images/nav-icon-apartment.png';
  return '/images/nav-icon-room.png';
};

const TabPreview = ({ types }) => {
  const [activeTab, setActiveTab] = useState(0);
  const activeTypes = types?.filter(t => t.is_active) || [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <FiEye className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">Live Tab Preview</span>
        <span className="ml-auto text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Header as users see it</span>
      </div>
      <div className="px-4 py-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {activeTypes.length === 0 ? (
            <div className="text-sm text-gray-400 italic py-2">No active tabs — enable some property types to see preview</div>
          ) : (
            activeTypes.map((type, idx) => {
              const isActive = idx === activeTab;
              const iconUrl = type.icon_url || getSmartIcon(type.name);
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveTab(idx)}
                  className="flex flex-col items-center gap-1.5 min-w-[64px] flex-shrink-0 group"
                >
                  <img
                    src={iconUrl}
                    alt={type.name}
                    className={`w-7 h-7 object-contain transition-all duration-200 ${isActive ? 'opacity-100 grayscale-0' : 'opacity-60 grayscale'}`}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <span className={`text-xs font-semibold whitespace-nowrap pb-1.5 border-b-2 transition-all ${isActive ? 'text-black border-black' : 'text-gray-500 border-transparent'}`}>
                    {type.name}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const AdminPropertyTypes = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true,
    icon_url: ''
  });
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Fetch property types
  const { data: propertyTypesData, isLoading } = useQuery(
    'admin-property-types',
    () => api.get('/admin/property-types'),
    {
      select: (response) => response.data?.data?.propertyTypes || [],
    }
  );

  // Helper: invalidate ALL property-type queries so every component refreshes instantly
  const invalidateAllPropertyTypeQueries = () => {
    queryClient.invalidateQueries('admin-property-types');
    queryClient.invalidateQueries('home-property-types');
    queryClient.invalidateQueries('nav-property-types');
    // Also force refetch (bypass stale check)
    queryClient.refetchQueries('home-property-types');
    queryClient.refetchQueries('nav-property-types');
  };

  // Create property type mutation
  const createPropertyTypeMutation = useMutation(
    (propertyTypeData) => api.post('/admin/property-types', propertyTypeData),
    {
      onSuccess: () => {
        showSuccess('Property type created successfully!');
        invalidateAllPropertyTypeQueries();
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
        invalidateAllPropertyTypeQueries();
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
        invalidateAllPropertyTypeQueries();
        setShowDeleteConfirm(null);
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to delete property type');
        setShowDeleteConfirm(null);
      }
    }
  );

  // Toggle property type status mutation
  const togglePropertyTypeMutation = useMutation(
    ({ id, is_active }) => api.patch(`/admin/property-types/${id}/toggle`, { is_active }),
    {
      onMutate: async ({ id, is_active }) => {
        // Optimistic update in admin panel
        await queryClient.cancelQueries('admin-property-types');
        queryClient.setQueryData('admin-property-types', (old) => {
          if (!old?.data?.data?.propertyTypes) return old;
          return {
            ...old,
            data: {
              ...old.data,
              data: {
                ...old.data.data,
                propertyTypes: old.data.data.propertyTypes.map(pt =>
                  pt.id === id ? { ...pt, is_active } : pt
                )
              }
            }
          };
        });
      },
      onSuccess: () => {
        showSuccess('Status updated!');
        // Refetch everything so the header tabs update instantly
        invalidateAllPropertyTypeQueries();
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update status');
        queryClient.invalidateQueries('admin-property-types');
      }
    }
  );

  const resetForm = () => {
    setFormData({ name: '', description: '', sort_order: 0, is_active: true, icon_url: '' });
    setSelectedPropertyType(null);
    setShowIconPicker(false);
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
      is_active: propertyType.is_active,
      icon_url: propertyType.icon_url || ''
    });
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      icon_url: formData.icon_url || getSmartIcon(formData.name)
    };
    if (showAddModal) {
      createPropertyTypeMutation.mutate(payload);
    } else if (showEditModal) {
      updatePropertyTypeMutation.mutate({ id: selectedPropertyType.id, ...payload });
    }
  };

  const handleToggleStatus = (propertyType) => {
    togglePropertyTypeMutation.mutate({
      id: propertyType.id,
      is_active: !propertyType.is_active
    });
  };

  const isMutating = createPropertyTypeMutation.isLoading || updatePropertyTypeMutation.isLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const activeCount = propertyTypesData?.filter(t => t.is_active).length || 0;
  const totalCount = propertyTypesData?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiGrid className="w-6 h-6 text-primary-600" />
              Search Filter Tabs
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage the tab menu shown in the search header (Rooms, Apartments, Hotels, Flight…).
              <span className="ml-2 inline-flex items-center gap-1 text-green-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                {activeCount} active
              </span>
              <span className="ml-2 text-gray-400">/ {totalCount} total</span>
            </p>
          </div>
          <button
            onClick={handleAddPropertyType}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-sm font-medium text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Add New Tab
          </button>
        </div>

        {/* Live Preview */}
        <div className="mb-6">
          <TabPreview types={propertyTypesData} />
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Total Types</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Active in Header</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-400">{totalCount - activeCount}</div>
            <div className="text-xs text-gray-500 mt-0.5">Hidden</div>
          </div>
        </div>

        {/* Property Types List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">All Property Types</h2>
            <span className="text-xs text-gray-400">Drag to reorder (use Sort Order field)</span>
          </div>

          {propertyTypesData && propertyTypesData.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {[...propertyTypesData].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((pt) => {
                const iconUrl = pt.icon_url || getSmartIcon(pt.name);
                return (
                  <div
                    key={pt.id}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50 ${!pt.is_active ? 'opacity-50' : ''}`}
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                      <img
                        src={iconUrl}
                        alt={pt.name}
                        className="w-7 h-7 object-contain"
                        onError={(e) => { e.target.src = '/images/nav-icon-room.png'; }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{pt.name}</span>
                        {pt.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Showing in header
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                        {pt.description && <span className="truncate max-w-[200px]">{pt.description}</span>}
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1">
                          <FiMove className="w-3 h-3" />
                          Order: {pt.sort_order || 0}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {pt.property_count || 0} properties
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Toggle Switch */}
                      <button
                        onClick={() => handleToggleStatus(pt)}
                        disabled={togglePropertyTypeMutation.isLoading}
                        title={pt.is_active ? 'Click to hide from header' : 'Click to show in header'}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${pt.is_active ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${pt.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEditPropertyType(pt)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setShowDeleteConfirm(pt)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiGrid className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-500 font-medium mb-2">No property types yet</h3>
              <p className="text-gray-400 text-sm mb-4">Add your first tab to get started</p>
              <button
                onClick={handleAddPropertyType}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Property Type
              </button>
            </div>
          )}
        </div>

        {/* Help Note */}
        <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <FiAlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <strong>How it works:</strong> Active tabs appear in the search header. Users click a tab to filter properties by type.
            Use Sort Order (lower = first) to control the order. Properties in the database must have their <code className="bg-blue-100 px-1 rounded">property_type</code> field matching the tab name exactly.
          </div>
        </div>
      </div>

      {/* ===== Add / Edit Modal ===== */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {showAddModal ? '+ Add New Tab Type' : '✏️ Edit Tab Type'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tab Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  placeholder="e.g., Rooms, Hotel, Apartment, Villa..."
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Must match the property_type field in properties exactly (case-insensitive)</p>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                  <FiImage className="w-4 h-4" /> Tab Icon
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon_url: opt.value })}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs ${formData.icon_url === opt.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <img src={opt.value} alt={opt.label} className="w-7 h-7 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                      <span className="text-gray-600">{opt.label}</span>
                      {formData.icon_url === opt.value && <FiCheck className="w-3 h-3 text-primary-500 absolute" />}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, icon_url: getSmartIcon(formData.name) })}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all text-xs text-gray-500"
                  >
                    <span className="text-lg">🤖</span>
                    <span>Auto</span>
                  </button>
                </div>
                {/* Custom URL input */}
                <input
                  type="text"
                  value={formData.icon_url}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Or enter custom icon URL (/images/my-icon.png)"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm resize-none"
                  placeholder="Optional description"
                  rows="2"
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Display Order
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-24 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    min="0"
                  />
                  <span className="text-xs text-gray-500">Lower numbers appear first</span>
                </div>
              </div>

              {/* Active toggle (edit only) */}
              {showEditModal && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Show in Header</div>
                    <div className="text-xs text-gray-500">Enable to display this tab in search</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isMutating ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiSave className="w-4 h-4" />
                  )}
                  {showAddModal ? 'Create Tab' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Delete Confirm Modal ===== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Tab Type?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <strong>"{showDeleteConfirm.name}"</strong>?
              {showDeleteConfirm.property_count > 0 && (
                <span className="block mt-2 text-amber-600">
                  ⚠️ {showDeleteConfirm.property_count} properties use this type. They won't be deleted but will no longer appear in this tab.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePropertyTypeMutation.mutate(showDeleteConfirm.id)}
                disabled={deletePropertyTypeMutation.isLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                {deletePropertyTypeMutation.isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiTrash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPropertyTypes;
