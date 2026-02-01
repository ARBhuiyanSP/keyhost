import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiAward, FiPlus, FiEdit, FiTrash2, FiSave, FiX, FiUsers, FiSettings, FiTrendingUp } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

const AdminRewardsPoints = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('slots');
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingTier, setEditingTier] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [slotForm, setSlotForm] = useState({ min_amount: '', max_amount: '', points_per_thousand: '', is_active: true });
  const [tierForm, setTierForm] = useState({ tier_name: '', tier_display_name: '', min_points: '', tier_color: '#666666', is_active: true });

  // Fetch data
  const { data: slotsData, isLoading: slotsLoading } = useQuery(
    'admin-rewards-slots',
    () => api.get('/rewards-points/admin/slots'),
    { select: (response) => response.data?.data }
  );

  const { data: settingsData, isLoading: settingsLoading } = useQuery(
    'admin-rewards-settings',
    () => api.get('/rewards-points/admin/settings'),
    { select: (response) => response.data?.data }
  );

  const { data: tiersData, isLoading: tiersLoading } = useQuery(
    'admin-member-tiers',
    () => api.get('/rewards-points/admin/member-tiers'),
    { select: (response) => response.data?.data }
  );

  const { data: usersPointsData, isLoading: usersPointsLoading } = useQuery(
    ['admin-users-points', activeTab],
    () => api.get('/rewards-points/admin/users-points?page=1&limit=50'),
    { 
      select: (response) => response.data?.data,
      enabled: activeTab === 'users'
    }
  );

  // Mutations
  const createSlotMutation = useMutation(
    (data) => api.post('/rewards-points/admin/slots', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-rewards-slots');
        setShowSlotModal(false);
        setSlotForm({ min_amount: '', max_amount: '', points_per_thousand: '', is_active: true });
        showSuccess('Rewards point slot created successfully');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to create slot');
      }
    }
  );

  const updateSlotMutation = useMutation(
    ({ id, data }) => api.put(`/rewards-points/admin/slots/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-rewards-slots');
        setEditingSlot(null);
        showSuccess('Slot updated successfully');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update slot');
      }
    }
  );

  const deleteSlotMutation = useMutation(
    (id) => api.delete(`/rewards-points/admin/slots/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-rewards-slots');
        showSuccess('Slot deleted successfully');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to delete slot');
      }
    }
  );

  const updateSettingsMutation = useMutation(
    (data) => api.put('/rewards-points/admin/settings', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-rewards-settings');
        showSuccess('Settings updated successfully');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update settings');
      }
    }
  );

  const createTierMutation = useMutation(
    (data) => api.post('/rewards-points/admin/member-tiers', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-member-tiers');
        setShowTierModal(false);
        setTierForm({ tier_name: '', tier_display_name: '', min_points: '', tier_color: '#666666', is_active: true });
        showSuccess('Member tier created successfully');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to create tier');
      }
    }
  );

  const updateTierMutation = useMutation(
    ({ id, data }) => api.put(`/rewards-points/admin/member-tiers/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-member-tiers');
        setEditingTier(null);
        showSuccess('Tier updated successfully');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to update tier');
      }
    }
  );

  const deleteTierMutation = useMutation(
    (id) => api.delete(`/rewards-points/admin/member-tiers/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-member-tiers');
        showSuccess('Tier deleted successfully');
      },
      onError: (error) => {
        showError(error.response?.data?.message || 'Failed to delete tier');
      }
    }
  );

  const handleSlotSubmit = (e) => {
    e.preventDefault();
    if (editingSlot) {
      updateSlotMutation.mutate({
        id: editingSlot.id,
        data: {
          min_amount: parseFloat(slotForm.min_amount),
          max_amount: parseFloat(slotForm.max_amount),
          points_per_thousand: parseFloat(slotForm.points_per_thousand),
          is_active: slotForm.is_active
        }
      });
    } else {
      createSlotMutation.mutate({
        min_amount: parseFloat(slotForm.min_amount),
        max_amount: parseFloat(slotForm.max_amount),
        points_per_thousand: parseFloat(slotForm.points_per_thousand),
        is_active: slotForm.is_active
      });
    }
  };

  const handleTierSubmit = (e) => {
    e.preventDefault();
    if (editingTier) {
      updateTierMutation.mutate({
        id: editingTier.id,
        data: {
          tier_name: tierForm.tier_name,
          tier_display_name: tierForm.tier_display_name,
          min_points: parseInt(tierForm.min_points),
          tier_color: tierForm.tier_color,
          is_active: tierForm.is_active,
          display_order: editingTier.display_order || 0
        }
      });
    } else {
      createTierMutation.mutate({
        tier_name: tierForm.tier_name,
        tier_display_name: tierForm.tier_display_name,
        min_points: parseInt(tierForm.min_points),
        tier_color: tierForm.tier_color,
        is_active: tierForm.is_active,
        display_order: (tiersData?.tiers?.length || 0) + 1
      });
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      min_amount: slot.min_amount,
      max_amount: slot.max_amount,
      points_per_thousand: slot.points_per_thousand,
      is_active: slot.is_active
    });
    setShowSlotModal(true);
  };

  const handleEditTier = (tier) => {
    setEditingTier(tier);
    setTierForm({
      tier_name: tier.tier_name,
      tier_display_name: tier.tier_display_name,
      min_points: tier.min_points,
      tier_color: tier.tier_color,
      is_active: tier.is_active
    });
    setShowTierModal(true);
  };

  const slots = slotsData?.slots || [];
  const settings = settingsData?.settings || {};
  const tiers = tiersData?.tiers || [];
  const usersPoints = usersPointsData?.usersPoints || [];

  if (slotsLoading || settingsLoading || tiersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards Points Management</h1>
          <p className="text-gray-600">Manage rewards points slots, settings, member tiers, and user points</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('slots')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'slots'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiTrendingUp className="inline mr-2" />
                Point Slots
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'settings'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiSettings className="inline mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('tiers')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'tiers'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiAward className="inline mr-2" />
                Member Tiers
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'users'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FiUsers className="inline mr-2" />
                Users Points
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Slots Tab */}
            {activeTab === 'slots' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Rewards Point Slots</h2>
                  <button
                    onClick={() => {
                      setEditingSlot(null);
                      setSlotForm({ min_amount: '', max_amount: '', points_per_thousand: '', is_active: true });
                      setShowSlotModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiPlus /> Add Slot
                  </button>
                </div>
                <div className="space-y-4">
                  {slots.map((slot) => {
                    const minAmount = parseFloat(slot.min_amount) || 0;
                    const maxAmount = parseFloat(slot.max_amount) || 0;
                    return (
                    <div key={slot.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          BDT {minAmount.toFixed(2)} - BDT {maxAmount === 999999999 ? '∞' : maxAmount.toFixed(2)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {parseFloat(slot.points_per_thousand) || 0} points per 1000 BDT
                        </p>
                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                          slot.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {slot.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSlot(slot)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this slot?')) {
                              deleteSlotMutation.mutate(slot.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Rewards Point Settings</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateSettingsMutation.mutate({
                    points_per_taka: parseFloat(e.target.points_per_taka.value),
                    min_points_to_redeem: parseInt(e.target.min_points_to_redeem.value),
                    max_points_per_booking: e.target.max_points_per_booking.value ? parseInt(e.target.max_points_per_booking.value) : null,
                    points_expiry_days: e.target.points_expiry_days.value ? parseInt(e.target.points_expiry_days.value) : null
                  });
                }} className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points per Taka
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="points_per_taka"
                      defaultValue={settings.points_per_taka || 1.00}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">How many points = 1 BDT</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Points to Redeem
                    </label>
                    <input
                      type="number"
                      name="min_points_to_redeem"
                      defaultValue={settings.min_points_to_redeem || 100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Points per Booking (leave empty for unlimited)
                    </label>
                    <input
                      type="number"
                      name="max_points_per_booking"
                      defaultValue={settings.max_points_per_booking || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Unlimited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Points Expiry Days (leave empty for no expiry)
                    </label>
                    <input
                      type="number"
                      name="points_expiry_days"
                      defaultValue={settings.points_expiry_days || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="No expiry"
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    Save Settings
                  </button>
                </form>
              </div>
            )}

            {/* Tiers Tab */}
            {activeTab === 'tiers' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Member Status Tiers</h2>
                  <button
                    onClick={() => {
                      setEditingTier(null);
                      setTierForm({ tier_name: '', tier_display_name: '', min_points: '', tier_color: '#666666', is_active: true });
                      setShowTierModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiPlus /> Add Tier
                  </button>
                </div>
                <div className="space-y-4">
                  {tiers.map((tier) => (
                    <div key={tier.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: tier.tier_color || '#666' }}
                        >
                          {tier.tier_display_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{tier.tier_display_name}</h3>
                          <p className="text-sm text-gray-600">Minimum {(parseInt(tier.min_points) || 0).toLocaleString()} points</p>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                            tier.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {tier.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTier(tier)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this tier?')) {
                              deleteTierMutation.mutate(tier.id);
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Users Points Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Users Rewards Points</h2>
                {usersPointsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Earned</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Balance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points Used</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usersPoints.map((userPoint) => (
                          <tr key={userPoint.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {userPoint.first_name} {userPoint.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{userPoint.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(parseInt(userPoint.total_points_earned) || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600">
                              {(parseInt(userPoint.current_balance) || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(parseInt(userPoint.lifetime_points_spent) || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {userPoint.tier_display_name && (
                                <span
                                  className="px-3 py-1 text-xs rounded-full text-white"
                                  style={{ backgroundColor: userPoint.tier_color || '#666' }}
                                >
                                  {userPoint.tier_display_name}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Slot Modal */}
        {showSlotModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{editingSlot ? 'Edit Slot' : 'Add Slot'}</h3>
                <button onClick={() => setShowSlotModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSlotSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={slotForm.min_amount}
                    onChange={(e) => setSlotForm({ ...slotForm, min_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount (BDT)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={slotForm.max_amount}
                    onChange={(e) => setSlotForm({ ...slotForm, max_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points per 1000 BDT</label>
                  <input
                    type="number"
                    step="0.01"
                    value={slotForm.points_per_thousand}
                    onChange={(e) => setSlotForm({ ...slotForm, points_per_thousand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="slot_active"
                    checked={slotForm.is_active}
                    onChange={(e) => setSlotForm({ ...slotForm, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="slot_active" className="text-sm text-gray-700">Active</label>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    <FiSave className="inline mr-2" />
                    {editingSlot ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSlotModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tier Modal */}
        {showTierModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{editingTier ? 'Edit Tier' : 'Add Tier'}</h3>
                <button onClick={() => setShowTierModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleTierSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier Name (lowercase, no spaces)</label>
                  <input
                    type="text"
                    value={tierForm.tier_name}
                    onChange={(e) => setTierForm({ ...tierForm, tier_name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                    disabled={!!editingTier}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={tierForm.tier_display_name}
                    onChange={(e) => setTierForm({ ...tierForm, tier_display_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Points</label>
                  <input
                    type="number"
                    value={tierForm.min_points}
                    onChange={(e) => setTierForm({ ...tierForm, min_points: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier Color</label>
                  <input
                    type="color"
                    value={tierForm.tier_color}
                    onChange={(e) => setTierForm({ ...tierForm, tier_color: e.target.value })}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tier_active"
                    checked={tierForm.is_active}
                    onChange={(e) => setTierForm({ ...tierForm, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="tier_active" className="text-sm text-gray-700">Active</label>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1">
                    <FiSave className="inline mr-2" />
                    {editingTier ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTierModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
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

export default AdminRewardsPoints;

