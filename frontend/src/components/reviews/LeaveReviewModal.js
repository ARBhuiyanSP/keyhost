import React, { useState } from 'react';
import { FiStar, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';

const LeaveReviewModal = ({ isOpen, onClose, booking, onSuccess }) => {
    const { showSuccess, showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        rating: 0,
        title: '',
        comment: '',
        cleanliness_rating: 0,
        communication_rating: 0,
        check_in_rating: 0,
        accuracy_rating: 0,
        location_rating: 0,
        value_rating: 0,
    });

    if (!isOpen) return null;

    const handleRatingChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.rating === 0) {
            showError('Please provide an overall rating');
            return;
        }

        try {
            setLoading(true);
            await api.post('/reviews', {
                booking_id: booking.id,
                ...formData
            });
            showSuccess('Review submitted for approval');
            onSuccess();
            onClose();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const StarRating = ({ rating, onChange, label }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        className={`text-2xl focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                        <FiStar className="fill-current" />
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Overall Rating</h3>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRatingChange('rating', star)}
                                    className={`text-3xl focus:outline-none ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    <FiStar className="fill-current" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <StarRating
                            label="Cleanliness"
                            rating={formData.cleanliness_rating}
                            onChange={(val) => handleRatingChange('cleanliness_rating', val)}
                        />
                        <StarRating
                            label="Communication"
                            rating={formData.communication_rating}
                            onChange={(val) => handleRatingChange('communication_rating', val)}
                        />
                        <StarRating
                            label="Check-in"
                            rating={formData.check_in_rating}
                            onChange={(val) => handleRatingChange('check_in_rating', val)}
                        />
                        <StarRating
                            label="Accuracy"
                            rating={formData.accuracy_rating}
                            onChange={(val) => handleRatingChange('accuracy_rating', val)}
                        />
                        <StarRating
                            label="Location"
                            rating={formData.location_rating}
                            onChange={(val) => handleRatingChange('location_rating', val)}
                        />
                        <StarRating
                            label="Value"
                            rating={formData.value_rating}
                            onChange={(val) => handleRatingChange('value_rating', val)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Summarize your experience"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                        <textarea
                            required
                            rows={4}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Tell others about your stay"
                            value={formData.comment}
                            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveReviewModal;
