import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FiHome, FiSearch, FiFilter, FiEye, FiEdit, FiCheck, FiX, FiMapPin, FiStar, FiDollarSign, FiSave, FiHeart, FiGrid, FiShield, FiTrendingUp, FiZap, FiAward } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

// Animated count-up hook
const useCountUp = (target, duration = 800, isLoading = false) => {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  const prevTargetRef = useRef(0);

  useEffect(() => {
    if (isLoading || target === undefined) return;
    const startVal = prevTargetRef.current;
    const endVal = target;
    prevTargetRef.current = endVal;
    if (startVal === endVal) { setCount(endVal); return; }
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + (endVal - startVal) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, isLoading, duration]);

  return count;
};

// Individual stat card with its own count-up
const StatCard = ({ card, totalAll, isStatsLoading }) => {
  const animatedValue = useCountUp(card.value, 900, isStatsLoading);
  const IconComp = card.icon;
  const pct = totalAll > 0 && card.key !== 'all' ? Math.round((card.value / totalAll) * 100) : (card.key === 'all' ? 100 : 0);

  return (
    <div
      onClick={card.onClick}
      className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 group select-none bg-white
        ${card.isActive
          ? 'shadow-xl scale-[1.03] -translate-y-0.5'
          : 'hover:-translate-y-0.5 hover:shadow-md shadow-sm border border-gray-100'
        }`}
      style={card.isActive ? { boxShadow: `0 6px 20px ${card.accentColor}30`, outline: `2px solid ${card.accentColor}` } : {}}
    >
      {isStatsLoading ? (
        <div className="p-3.5 h-[90px]">
          <div className="stat-card-skeleton h-2.5 w-12 rounded mb-3" />
          <div className="stat-card-skeleton h-6 w-10 rounded mb-2" />
          <div className="stat-card-skeleton h-1.5 w-16 rounded" />
        </div>
      ) : (
        <>
          {/* Top color accent bar */}
          <div className="h-1 w-full" style={{ background: card.accentColor }} />

          {/* Pulse dot */}
          {card.pulse && !card.isActive && (
            <div className="absolute top-3 right-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: card.accentColor }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: card.accentColor }} />
              </span>
            </div>
          )}

          {card.isActive && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border"
                style={{ color: card.accentColor, borderColor: card.accentColor, background: `${card.accentColor}15` }}>
                <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: card.accentColor }} />
                ON
              </span>
            </div>
          )}

          <div className="p-3.5 flex items-center gap-3">
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${card.accentColor}18` }}
            >
              <IconComp className="w-4 h-4" style={{ color: card.accentColor }} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xl font-black text-gray-900 leading-none tracking-tight tabular-nums">
                {animatedValue.toLocaleString()}
              </p>
              <p className="text-[11px] font-bold text-gray-600 mt-0.5 uppercase tracking-wide truncate">{card.label}</p>
              {/* Progress bar */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%`, background: card.accentColor }}
                  />
                </div>
                <span className="text-[9px] font-bold text-gray-400">{pct}%</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ExpandablePropertyTitle = ({ title, maxLength = 25 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!title || title.length <= maxLength) {
    return <div className="text-sm font-bold text-gray-900 leading-tight break-words">{title}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="text-sm font-bold text-gray-900 leading-tight whitespace-normal break-words">
        {isExpanded ? title : `${title.substring(0, maxLength)}...`}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="text-primary-600 font-medium text-[11px] hover:underline focus:outline-none text-left mt-0.5 self-start"
      >
        {isExpanded ? 'View Less' : 'View More'}
      </button>
    </div>
  );
};

const AdminProperties = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchParamVal = searchParams.get('search') || '';
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    status: '',
    search: searchParamVal,
    featured: '',
    monthly_status: '',
    page: 1,
    limit: 10
  });

  const [searchInput, setSearchInput] = useState(filters.search);
  const searchTimeoutRef = React.useRef(null);

  React.useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleFilterChange('search', val);
    }, 300);
  };

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
  const { data: propertiesData, isLoading, isFetching, refetch } = useQuery(
    ['admin-properties', filters],
    () => api.get(`/admin/properties?${new URLSearchParams(filters).toString()}`),
    {
      keepPreviousData: true,
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
    setFilters(prev => {
      const newFilters = {
        ...prev,
        page: 1,
        [key]: value
      };
      if (key === 'status' && value !== '') {
        newFilters.monthly_status = '';
      }
      if (key === 'monthly_status' && value !== '') {
        newFilters.status = '';
      }
      return newFilters;
    });
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

  const handleMonthlyApprovedToggle = async (propertyId, approve) => {
    try {
      const endpoint = approve 
        ? `/admin/properties/${propertyId}/approve-monthly` 
        : `/admin/properties/${propertyId}/revoke-monthly`;
      
      const response = await api.put(endpoint);

      if (response.data?.success) {
        showSuccess(response.data?.message || `Monthly stay status updated successfully!`);
        await refetch();
      } else {
        showError(response.data?.message || 'Failed to update monthly stay status');
      }
    } catch (error) {
      console.error('Error updating monthly stay status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update monthly stay status. Please try again.';
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

  const stats = propertiesData?.stats;
  const isStatsLoading = isLoading || !stats;

  // Stat card config
  const statCards = [
    {
      key: 'all',
      label: 'Total Properties',
      sublabel: 'All listings',
      value: stats?.all ?? (propertiesData?.pagination?.totalItems || 0),
      icon: FiHome,
      gradient: 'from-blue-600 to-indigo-600',
      lightGradient: 'from-blue-50 to-indigo-50',
      accentColor: '#4F46E5',
      textColor: 'text-white',
      isActive: filters.status === '' && filters.monthly_status === '' && filters.featured === '',
      onClick: () => setFilters(prev => ({ ...prev, status: '', featured: '', monthly_status: '', page: 1 })),
      pulse: false,
    },
    {
      key: 'pending_approval',
      label: 'Pending Approval',
      sublabel: 'Awaiting review',
      value: stats?.pending_approval ?? 0,
      icon: FiZap,
      gradient: 'from-amber-500 to-orange-500',
      lightGradient: 'from-amber-50 to-orange-50',
      accentColor: '#F59E0B',
      textColor: 'text-white',
      isActive: filters.status === 'pending_approval',
      onClick: () => setFilters(prev => ({ ...prev, status: 'pending_approval', featured: '', monthly_status: '', page: 1 })),
      pulse: (stats?.pending_approval ?? 0) > 0,
    },
    {
      key: 'active',
      label: 'Active',
      sublabel: 'Live & bookable',
      value: stats?.active ?? 0,
      icon: FiCheck,
      gradient: 'from-emerald-500 to-teal-500',
      lightGradient: 'from-emerald-50 to-teal-50',
      accentColor: '#10B981',
      textColor: 'text-white',
      isActive: filters.status === 'active',
      onClick: () => setFilters(prev => ({ ...prev, status: 'active', featured: '', monthly_status: '', page: 1 })),
      pulse: false,
    },
    {
      key: 'suspended',
      label: 'Suspended',
      sublabel: 'Needs attention',
      value: stats?.suspended ?? 0,
      icon: FiShield,
      gradient: 'from-rose-500 to-red-600',
      lightGradient: 'from-rose-50 to-red-50',
      accentColor: '#EF4444',
      textColor: 'text-white',
      isActive: filters.status === 'suspended',
      onClick: () => setFilters(prev => ({ ...prev, status: 'suspended', featured: '', monthly_status: '', page: 1 })),
      pulse: false,
    },
    {
      key: 'monthly_pending',
      label: 'Monthly Pending',
      sublabel: 'Awaiting monthly approval',
      value: stats?.monthly_pending ?? 0,
      icon: FiTrendingUp,
      gradient: 'from-violet-500 to-purple-600',
      lightGradient: 'from-violet-50 to-purple-50',
      accentColor: '#7C3AED',
      textColor: 'text-white',
      isActive: filters.monthly_status === 'pending',
      onClick: () => setFilters(prev => ({ ...prev, status: '', featured: '', monthly_status: 'pending', page: 1 })),
      pulse: (stats?.monthly_pending ?? 0) > 0,
    },
    {
      key: 'featured',
      label: 'Featured',
      sublabel: 'Promoted listings',
      value: stats?.featured ?? 0,
      icon: FiAward,
      gradient: 'from-pink-500 to-rose-500',
      lightGradient: 'from-pink-50 to-rose-50',
      accentColor: '#EC4899',
      textColor: 'text-white',
      isActive: filters.featured === 'true',
      onClick: () => setFilters(prev => ({ ...prev, status: '', featured: 'true', monthly_status: '', page: 1 })),
      pulse: false,
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f5f0ff 100%)' }}>
      <style>{`
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(3deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 40px rgba(255,255,255,0.3); }
        }
        .stat-card-active {
          transform: translateY(-4px);
        }
        .stat-card-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 400px 100%;
          animation: shimmer 1.5s infinite;
        }
        .count-animate {
          animation: countUp 0.5s ease-out forwards;
        }
        .icon-float {
          animation: float 3s ease-in-out infinite;
        }
        .card-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Property Management</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage, approve, and monitor property listings</p>
          </div>
          <div className="hidden lg:flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl px-4 py-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-gray-600">
              {stats?.active ?? 0} live listings
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((card) => (
            <StatCard
              key={card.key}
              card={card}
              totalAll={stats?.all || 0}
              isStatsLoading={isStatsLoading}
            />
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Search Properties
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-blue-500 text-gray-400">
                  <FiSearch className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title or city..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="input-field pl-10 w-full transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field w-full transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-gray-300"
              >
                <option value="">All Statuses</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Featured
              </label>
              <select
                value={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.value)}
                className="input-field w-full transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-gray-300"
              >
                <option value="">All Properties</option>
                <option value="true">Featured Only</option>
                <option value="false">Not Featured</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Monthly Status
              </label>
              <select
                value={filters.monthly_status}
                onChange={(e) => handleFilterChange('monthly_status', e.target.value)}
                className="input-field w-full transition-all duration-200 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-gray-300"
              >
                <option value="">All</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', search: '', featured: '', monthly_status: '', page: 1, limit: 10 })}
                className="btn-secondary w-full transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] flex items-center justify-center gap-2 border border-gray-200 font-semibold"
              >
                <FiFilter className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
          {/* Subtle loading line at the top of the table container */}
          <div 
            className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 ${
              isFetching ? 'opacity-100 animate-pulse translate-y-0' : 'opacity-0 -translate-y-1'
            }`}
            style={{ zIndex: 10 }}
          />

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
            <div className={`transition-all duration-300 ${isFetching ? 'opacity-65 pointer-events-none filter blur-[0.5px]' : 'opacity-100'}`}>

              {/* ── MOBILE CARD LIST (< md) ── */}
              <div className="md:hidden divide-y divide-gray-100">
                {propertiesData.properties.map((property) => (
                  <div key={property.id} className="p-4 hover:bg-gray-50 transition-colors">
                    {/* Top row: title + status badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          <ExpandablePropertyTitle title={property.title} maxLength={30} />
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-0.5 gap-1">
                          <FiMapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{property.city}, {property.state}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold capitalize border ${getStatusColor(property.status)}`}>
                          {property.status?.replace('_', ' ')}
                        </span>
                        {property.is_featured && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                            <FiHeart className="w-2.5 h-2.5 fill-current" /> Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-gray-400">Owner:</span>
                        {property.owner_first_name} {property.owner_last_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${getPropertyTypeColor(property.property_type)}`}>
                          {property.property_type}
                        </span>
                      </span>
                      <span className="font-bold text-gray-800">৳{property.base_price}<span className="font-normal text-gray-400">/night</span></span>
                      <span className="flex items-center gap-0.5">
                        <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="font-medium">{property.average_rating || 0}</span>
                        <span className="text-gray-400">({property.total_reviews || 0})</span>
                      </span>
                    </div>

                    {/* Monthly status */}
                    {property.monthly_rent_enabled ? (
                      <div className="mb-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          property.monthly_approved
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          Monthly: {property.monthly_approved ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </div>
                    ) : null}

                    {/* Categories */}
                    {property.display_categories?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {property.display_categories.slice(0, 3).map(cat => (
                          <span key={cat.id} className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            {cat.name}
                          </span>
                        ))}
                        {property.display_categories.length > 3 && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-50 text-gray-500">
                            +{property.display_categories.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button onClick={() => navigate(`/property/${property.slug || property.id}`)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-gray-200 transition-colors">
                        <FiEye className="w-3.5 h-3.5" /> View
                      </button>
                      <button onClick={() => handleEditProperty(property)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-green-50 hover:text-green-600 rounded-lg border border-gray-200 transition-colors">
                        <FiEdit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleAssignCategories(property)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-purple-50 hover:text-purple-600 rounded-lg border border-gray-200 transition-colors">
                        <FiGrid className="w-3.5 h-3.5" /> Categories
                      </button>
                      <button onClick={() => handleFeaturedToggle(property.id, !property.is_featured)}
                        className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${property.is_featured ? 'text-yellow-600 bg-yellow-50 border-yellow-200' : 'text-gray-600 bg-gray-100 border-gray-200 hover:text-yellow-600 hover:bg-yellow-50'}`}>
                        <FiHeart className={`w-3.5 h-3.5 ${property.is_featured ? 'fill-current' : ''}`} />
                        {property.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      {(property.status === 'pending_approval' || property.status === 'suspended') && (
                        <button onClick={() => handleStatusChange(property.id, 'active')}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
                          <FiCheck className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {(property.status === 'pending_approval' || property.status === 'active') && (
                        <button onClick={() => handleStatusChange(property.id, 'suspended')}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors">
                          <FiX className="w-3.5 h-3.5" /> Suspend
                        </button>
                      )}
                      {property.monthly_rent_enabled === 1 && (
                        property.monthly_approved === 1 ? (
                          <button onClick={() => handleMonthlyApprovedToggle(property.id, false)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors whitespace-nowrap">
                            Revoke Mo.
                          </button>
                        ) : (
                          <button onClick={() => handleMonthlyApprovedToggle(property.id, true)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg border border-purple-700 transition-colors whitespace-nowrap">
                            Approve Mo.
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── DESKTOP TABLE (≥ md) ── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-64">Actions</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Property</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Type</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Status</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Monthly Status</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Price</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Stats</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Categories</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {propertiesData.properties.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-3 py-3 whitespace-nowrap text-left text-sm font-medium">
                          <div className="flex items-center justify-start space-x-1 flex-nowrap">
                            <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg border border-gray-100 flex-nowrap">
                              <button onClick={() => navigate(`/property/${property.slug || property.id}`)} className="p-1 px-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded shadow-sm transition-all" title="View Details"><FiEye className="w-4 h-4" /></button>
                              <button onClick={() => handleEditProperty(property)} className="p-1 px-1.5 text-gray-500 hover:text-green-600 hover:bg-white rounded shadow-sm transition-all" title="Edit Property"><FiEdit className="w-4 h-4" /></button>
                              <button onClick={() => handleAssignCategories(property)} className="p-1 px-1.5 text-gray-500 hover:text-purple-600 hover:bg-white rounded shadow-sm transition-all" title="Manage Categories"><FiGrid className="w-4 h-4" /></button>
                              <button onClick={() => handleFeaturedToggle(property.id, !property.is_featured)} className={`p-1 px-1.5 rounded shadow-sm transition-all ${property.is_featured ? 'text-yellow-500 bg-white' : 'text-gray-400 hover:text-yellow-500 hover:bg-white'}`} title={property.is_featured ? 'Unfeature' : 'Feature'}><FiHeart className={`w-4 h-4 ${property.is_featured ? 'fill-current' : ''}`} /></button>
                            </div>
                            {(property.status === 'pending_approval' || property.status === 'suspended') && (
                              <button onClick={() => handleStatusChange(property.id, 'active')} className="p-1 px-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md border border-green-200 transition-colors" title="Approve/Activate"><FiCheck className="w-4 h-4" /></button>
                            )}
                            {(property.status === 'pending_approval' || property.status === 'active') && (
                              <button onClick={() => handleStatusChange(property.id, 'suspended')} className="p-1 px-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md border border-red-200 transition-colors" title="Suspend/Reject"><FiX className="w-4 h-4" /></button>
                            )}
                            {property.monthly_rent_enabled === 1 && (
                              property.monthly_approved === 1 ? (
                                <button onClick={() => handleMonthlyApprovedToggle(property.id, false)} className="p-1 px-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md border border-purple-200 transition-colors text-xs font-bold whitespace-nowrap" title="Revoke Monthly Approval">Revoke Mo.</button>
                              ) : (
                                <button onClick={() => handleMonthlyApprovedToggle(property.id, true)} className="p-1 px-2 bg-purple-600 text-white hover:bg-purple-700 rounded-md border border-purple-700 transition-colors text-xs font-bold whitespace-nowrap" title="Approve Monthly Stay">Approve Mo.</button>
                              )
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-normal break-words">
                          <div className="flex items-center">
                            <div className="min-w-0 max-w-[160px]">
                              <ExpandablePropertyTitle title={property.title} maxLength={22} />
                              <div className="text-xs text-gray-500 flex items-center mt-1"><FiMapPin className="w-3 h-3 mr-1 flex-shrink-0" /><span className="break-words leading-tight">{property.city}, {property.state}</span></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-normal break-words">
                          <div className="text-sm font-medium text-gray-900 leading-tight">{property.owner_first_name} {property.owner_last_name}</div>
                          <div className="text-xs text-gray-500 break-all leading-tight mt-1">{property.owner_email}</div>
                        </td>
                        <td className="px-3 py-3 whitespace-normal">
                          <span className={`inline-flex items-center px-2 py-0.5 text-center rounded text-[10px] font-medium capitalize ${getPropertyTypeColor(property.property_type)}`}>{property.property_type}</span>
                        </td>
                        <td className="px-3 py-3 whitespace-normal">
                          <span className={`inline-flex items-center px-2 py-0.5 text-center rounded text-[10px] font-medium capitalize border ${getStatusColor(property.status)}`}>{property.status?.replace('_', ' ')}</span>
                        </td>
                        <td className="px-3 py-3 whitespace-normal">
                          {property.monthly_rent_enabled ? (
                            <span className={`inline-flex items-center px-2 py-0.5 text-center rounded text-[10px] font-semibold border ${property.monthly_approved ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                              {property.monthly_approved ? '✅ Approved' : '⏳ Pending'}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-normal">
                          <div className="text-sm font-bold text-gray-900 break-words leading-tight">৳{property.base_price}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">per night</div>
                        </td>
                        <td className="px-3 py-3 whitespace-normal">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center text-xs text-gray-700"><FiStar className="w-3.5 h-3.5 text-yellow-400 mr-1 fill-current shrink-0" /><span className="font-medium truncate">{property.average_rating || 0}</span></div>
                            <div className="text-[10px] text-gray-500 truncate leading-tight">{property.total_reviews || 0} reviews</div>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-normal break-words">
                          <div className="flex flex-wrap gap-1 leading-tight">
                            {property.display_categories && property.display_categories.length > 0 ? (
                              property.display_categories.slice(0, 2).map(cat => (
                                <span key={cat.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-800 border border-gray-200">{cat.name}</span>
                              ))
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">None</span>
                            )}
                            {property.display_categories?.length > 2 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-50 text-gray-500">+{property.display_categories.length - 2}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
