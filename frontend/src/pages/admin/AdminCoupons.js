import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiSave, FiX, FiTag, FiClock, FiDollarSign, FiPercent
} from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminCoupons = () => {
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    minimum_amount: '',
    maximum_discount: '',
    usage_limit: '',
    user_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  // Fetch coupons
  const { data: couponsData, isLoading } = useQuery(
    'admin-coupons',
    () => api.get('/admin/coupons'),
    {
      select: (response) => response.data?.data?.coupons || [],
    }
  );

  // Create coupon mutation
  const createCouponMutation = useMutation(
    (couponData) => api.post('/admin/coupons', couponData),
    {
      onSuccess: () => {
        showSuccess('Coupon created successfully!');
        queryClient.invalidateQueries('admin-coupons');
        setShowAddModal(false);
        resetForm();
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to create coupon');
      }
    }
  );

  // Update coupon mutation
  const updateCouponMutation = useMutation(
    ({ id, ...couponData }) => api.put(`/admin/coupons/${id}`, couponData),
    {
      onSuccess: () => {
        showSuccess('Coupon updated successfully!');
        queryClient.invalidateQueries('admin-coupons');
        setShowEditModal(false);
        resetForm();
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update coupon');
      }
    }
  );

  // Delete coupon mutation
  const deleteCouponMutation = useMutation(
    (id) => api.delete(`/admin/coupons/${id}`),
    {
      onSuccess: () => {
        showSuccess('Coupon deleted successfully!');
        queryClient.invalidateQueries('admin-coupons');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to delete coupon');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      minimum_amount: '',
      maximum_discount: '',
      usage_limit: '',
      user_limit: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    });
    setSelectedCoupon(null);
  };

  const handleAddCoupon = () => {
    setShowAddModal(true);
    resetForm();
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name || '',
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      minimum_amount: coupon.minimum_amount || '',
      maximum_discount: coupon.maximum_discount || '',
      usage_limit: coupon.usage_limit || '',
      user_limit: coupon.user_limit || '',
      valid_from: coupon.valid_from ? coupon.valid_from.substring(0, 10) : '',
      valid_until: coupon.valid_until ? coupon.valid_until.substring(0, 10) : '',
      is_active: coupon.is_active === 1 || coupon.is_active === true
    });
    setShowEditModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      discount_value: parseFloat(formData.discount_value),
      minimum_amount: formData.minimum_amount ? parseFloat(formData.minimum_amount) : 0,
      maximum_discount: formData.maximum_discount ? parseFloat(formData.maximum_discount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      user_limit: formData.user_limit ? parseInt(formData.user_limit) : null,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      is_active: formData.is_active ? 1 : 0
    };

    if (showAddModal) {
      createCouponMutation.mutate(payload);
    } else if (showEditModal) {
      updateCouponMutation.mutate({
        id: selectedCoupon.id,
        ...payload
      });
    }
  };

  const handleDelete = (coupon) => {
    if (window.confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      deleteCouponMutation.mutate(coupon.id);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coupons Management</h1>
            <p className="text-gray-600 mt-2">Manage discount coupons for guests</p>
          </div>
          <button
            onClick={handleAddCoupon}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Add New Coupon
          </button>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Limits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {couponsData?.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiTag className="text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                    </div>
                    {coupon.name && <div className="text-xs text-gray-500">{coupon.name}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `BDT ${coupon.discount_value}`}
                    </div>
                    <div className="text-xs text-gray-500">Min spend: BDT {coupon.minimum_amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Usage: {coupon.used_count || 0} / {coupon.usage_limit || '∞'}</div>
                    <div className="text-xs text-gray-500">Per user: {coupon.user_limit || '∞'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString() : 'Always'}
                    </div>
                    <div className="text-xs text-gray-500">
                      to {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Always'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditCoupon(coupon)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {showAddModal ? 'Add New Coupon' : 'Edit Coupon'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="input-field"
                      placeholder="e.g., WELCOME10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="e.g., Welcome Discount"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 10% off for new users"
                    rows="2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (BDT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
                    <input
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Spend (BDT)</label>
                    <input
                      type="number"
                      value={formData.minimum_amount}
                      onChange={(e) => setFormData({ ...formData, minimum_amount: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Discount (BDT)</label>
                    <input
                      type="number"
                      value={formData.maximum_discount}
                      onChange={(e) => setFormData({ ...formData, maximum_discount: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 100"
                      disabled={formData.discount_type === 'fixed'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit (Total)</label>
                    <input
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User Limit (Per User)</label>
                    <input
                      type="number"
                      value={formData.user_limit}
                      onChange={(e) => setFormData({ ...formData, user_limit: e.target.value })}
                      className="input-field"
                      placeholder="e.g., 1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid From</label>
                    <input
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valid Until</label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

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
                    disabled={createCouponMutation.isLoading || updateCouponMutation.isLoading}
                    className="btn-primary"
                  >
                    {createCouponMutation.isLoading || updateCouponMutation.isLoading ? (
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

export default AdminCoupons;
