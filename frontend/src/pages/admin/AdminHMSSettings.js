import React, { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useSettingsStore from '../../store/settingsStore';
import { formatPrice } from '../../utils/textUtils';

const AdminHMSSettings = () => {
  const settings = useSettingsStore(state => state.settings);
  const currency = settings?.currency || 'BDT';
  
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    billing_cycle: 'monthly',
    is_trial: false,
    duration_days: 30,
    features: '',
    is_active: true
  });

  const { data: packages = [], isLoading, refetch } = useQuery(
    'hms-packages',
    async () => {
      const res = await api.get('/admin/hms/packages');
      return res.data?.data || [];
    }
  );

  const handleOpenModal = (pkg = null) => {
    if (pkg && pkg.id) {
      setEditingPkg(pkg);
      setFormData({
        name: pkg.name || '',
        price: pkg.price || '0',
        billing_cycle: pkg.billing_cycle || 'monthly',
        is_trial: !!pkg.is_trial,
        duration_days: pkg.duration_days || 30,
        trial_days: pkg.trial_days || 14,
        features: Array.isArray(pkg.features) ? pkg.features.filter(Boolean).join('\n') : '',
        is_active: pkg.is_active !== false
      });
    } else {
      setEditingPkg(null);
      setFormData({
        name: '',
        price: '',
        billing_cycle: 'monthly',
        is_trial: false,
        duration_days: 30,
        trial_days: 14,
        features: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const featuresArray = formData.features.split('\n').filter(f => f && f.trim() !== '');
      const payload = {
        ...formData,
        features: featuresArray
      };

      if (editingPkg && editingPkg.id) {
        await api.put(`/admin/hms/packages/${editingPkg.id}`, payload);
        toast.success('Package updated successfully');
      } else {
        await api.post('/admin/hms/packages', payload);
        toast.success('Package created successfully');
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save package');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await api.delete(`/admin/hms/packages/${id}`);
      toast.success('Package deleted successfully');
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete package');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">HMS Packages & Settings</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center font-medium"
        >
          <FiPlus className="mr-2" /> Add Package
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Package Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Package Type</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Duration (Days)</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {packages.map(pkg => (
              <tr key={'pkg-' + pkg.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{pkg.name}</td>
                <td className="px-6 py-4">
                  {pkg.is_trial ? (
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">TRIAL</span>
                  ) : (
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">PAID</span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">{currency} {formatPrice(pkg.price)} {pkg.is_trial ? '' : `/${pkg.billing_cycle}`}</td>
                <td className="px-6 py-4 text-gray-600">
                  {pkg.is_trial ? `${pkg.trial_days} days` : `${pkg.duration_days} days`}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleOpenModal(pkg)} className="text-blue-600 hover:text-blue-800">
                    <FiEdit2 />
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="text-red-600 hover:text-red-800">
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No packages found. Create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <FiX className="text-2xl" />
            </button>
            <h2 className="text-xl font-bold mb-6">{editingPkg ? 'Edit Package' : 'Create Package'}</h2>
            
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. HMS Pro, 7-Day Free Trial" />
                </div>
                
                <div className="col-span-2 flex items-center mb-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="is_trial"
                    checked={formData.is_trial} 
                    onChange={e => {
                        const isTrial = e.target.checked;
                        setFormData({
                            ...formData, 
                            is_trial: isTrial,
                            price: isTrial ? '0' : formData.price,
                            duration_days: isTrial ? 7 : 30
                        })
                    }} 
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" 
                  />
                  <label htmlFor="is_trial" className="ml-2 block text-sm text-gray-900 cursor-pointer font-medium">
                    This is a Free Trial Package
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ({currency})</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} disabled={formData.is_trial} className={`w-full border rounded-lg px-3 py-2 ${formData.is_trial ? 'bg-gray-100' : ''}`} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.is_trial ? 'Trial Duration (Days)' : 'Package Duration (Days)'}
                  </label>
                  {formData.is_trial ? (
                    <input required type="number" value={formData.trial_days} onChange={e => setFormData({...formData, trial_days: e.target.value, duration_days: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 7, 14, 30" />
                  ) : (
                    <input required type="number" value={formData.duration_days} onChange={e => setFormData({...formData, duration_days: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 7, 14, 30" />
                  )}
                </div>

                {!formData.is_trial && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                    <select value={formData.billing_cycle} onChange={e => setFormData({...formData, billing_cycle: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.is_active ? 'true' : 'false'} onChange={e => setFormData({...formData, is_active: e.target.value === 'true'})} className="w-full border rounded-lg px-3 py-2">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                
                <div className="col-span-2 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (One per line)</label>
                  <textarea rows="4" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full border rounded-lg px-3 py-2" placeholder="Advanced Room Inventory&#10;Staff Management" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHMSSettings;
