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
    () => api.get(`/admin/reviews/pending?${new URLSearchParams(filters).toString()}`),
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

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Reviews ({reviewsData?.pagination?.totalItems || 0})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : reviewsData?.reviews?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {reviewsData.reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Guest Info */}
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">
                            {review.first_name?.[0]}{review.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {review.first_name} {review.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {review.booking_reference}
                          </div>
                        </div>
                      </div>

                      {/* Property Info */}
                      <div className="mb-3">
                        <h4 className="text-lg font-medium text-gray-900 mb-1">
                          {review.property_title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiHome className="w-4 h-4 mr-1" />
                          <span>{review.property_city}</span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {review.rating}/5
                        </span>
                      </div>

                      {/* Review Content */}
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-1">
                          {review.title}
                        </h5>
                        <p className="text-sm text-gray-700">
                          {review.comment}
                        </p>
                      </div>

                      {/* Review Date */}
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        <span>
                          Submitted on {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex flex-col items-end space-y-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                      
                      {review.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleStatusChange(review.id, 'approved')}
                            className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          >
                            <FiCheck className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(review.id, 'rejected')}
                            className="flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                          >
                            <FiX className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiStar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}

          {/* Pagination */}
          {reviewsData?.pagination && reviewsData.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((reviewsData.pagination.currentPage - 1) * reviewsData.pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(reviewsData.pagination.currentPage * reviewsData.pagination.itemsPerPage, reviewsData.pagination.totalItems)} of{' '}
                  {reviewsData.pagination.totalItems} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', reviewsData.pagination.prevPage)}
                    disabled={!reviewsData.pagination.hasPrevPage}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {reviewsData.pagination.currentPage} of {reviewsData.pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handleFilterChange('page', reviewsData.pagination.nextPage)}
                    disabled={!reviewsData.pagination.hasNextPage}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
