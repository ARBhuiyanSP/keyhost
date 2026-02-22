import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FiStar, FiSearch, FiFilter, FiCheck, FiX, FiEye, FiUser, FiHome, FiCalendar } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminReviews = () => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10
  });

  // Fetch reviews
  const { data: reviewsData, isLoading, refetch } = useQuery(
    ['admin-reviews', filters],
    () => api.get(`/admin/reviews?${new URLSearchParams(filters).toString()}`),
    {
      select: (response) => response.data?.data || { reviews: [], pagination: {} },
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleStatusChange = async (reviewId, status) => {
    try {
      const result = await api.patch(`/admin/reviews/${reviewId}/status`, {
        status: status
      });

      if (result.success) {
        refetch();
      }
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
          <p className="text-gray-600 mt-2">Moderate and manage property reviews</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reviews
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by guest name or property..."
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', search: '', page: 1, limit: 10 })}
                className="btn-secondary w-full"
              >
                <FiFilter className="inline mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">
              Reviews List <span className="text-gray-500 font-normal text-sm ml-2">({reviewsData?.pagination?.totalItems || 0} total)</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : reviewsData?.reviews?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {reviewsData.reviews.map((review) => (
                <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors duration-150 group">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {review.first_name ? (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                              {review.first_name[0]}{review.last_name?.[0]}
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                              <FiUser />
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900">{review.first_name} {review.last_name}</h4>
                              <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                <span className="font-medium mr-1">Booking:</span> {review.booking_reference}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${getStatusColor(review.status).replace('bg-', 'bg-opacity-10 border-')}`}>
                              {review.status}
                            </span>
                          </div>

                          <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                                <span className="text-sm font-bold text-gray-900 ml-1.5">{review.rating}</span>
                              </div>
                              <div className="text-xs text-gray-400 flex items-center">
                                <FiCalendar className="w-3 h-3 mr-1" />
                                {new Date(review.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <h5 className="text-sm font-semibold text-gray-900 mb-1">{review.title}</h5>
                            <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                          </div>

                          <div className="mt-3 flex items-center text-xs text-gray-500">
                            <FiHome className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                            <span className="font-medium text-gray-700 mr-1">Property:</span>
                            <span className="text-gray-600">{review.property_title}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span>{review.property_city}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 sm:ml-4 sm:border-l sm:border-gray-100 sm:pl-4 min-w-[120px] justify-center sm:justify-start">
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(review.id, 'approved')}
                            className="flex-1 sm:flex-none flex items-center justify-center px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition-colors text-sm font-medium"
                          >
                            <FiCheck className="w-4 h-4 mr-1.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(review.id, 'rejected')}
                            className="flex-1 sm:flex-none flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            <FiX className="w-4 h-4 mr-1.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {review.status !== 'pending' && (
                        <div className="text-center w-full py-2 text-xs text-gray-400 italic">
                          No actions available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
                <FiStar className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">None of the reviews match your current filter settings. Try clearing the filters.</p>
              <button
                onClick={() => setFilters({ status: '', search: '', page: 1, limit: 10 })}
                className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {reviewsData?.pagination && reviewsData.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page <span className="font-medium text-gray-900">{reviewsData.pagination.currentPage}</span> of <span className="font-medium text-gray-900">{reviewsData.pagination.totalPages}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleFilterChange('page', reviewsData.pagination.prevPage)}
                  disabled={!reviewsData.pagination.hasPrevPage}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', reviewsData.pagination.nextPage)}
                  disabled={!reviewsData.pagination.hasNextPage}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
