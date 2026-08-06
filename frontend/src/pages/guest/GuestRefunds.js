import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import { formatPrice } from '../../utils/textUtils';

const GuestRefunds = () => {
    const navigate = useNavigate();
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0
    });

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        try {
            setLoading(true);
            const response = await api.get('/guest/refunds');
            const refundsList = response.data.data.refunds || [];
            
            let pendingCount = 0;
            let completedCount = 0;

            refundsList.forEach(refund => {
                if (refund.status === 'pending' || refund.status === 'processing') pendingCount++;
                if (refund.status === 'completed') completedCount++;
            });

            setRefunds(refundsList);
            setStats({
                total: refundsList.length,
                pending: pendingCount,
                completed: completedCount
            });
        } catch (err) {
            console.error('Failed to fetch refunds:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return <FiCheckCircle className="w-4 h-4" />;
            case 'pending': return <FiClock className="w-4 h-4" />;
            case 'processing': return <FiRefreshCw className="w-4 h-4 animate-spin-slow" />;
            default: return <FiAlertCircle className="w-4 h-4" />;
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Refunds</h1>
                <p className="text-gray-500 text-sm mt-1">Track and manage your booking refund requests</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Requests</p>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-1">In Progress</p>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.pending}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.completed}</p>
                </div>
            </div>

            {refunds.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiDollarSign className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No refunds found</h3>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto mt-2">
                        You don't have any refund requests at the moment. Refund requests are created when you cancel a booking.
                    </p>
                    <button 
                        onClick={() => navigate('/guest/bookings')}
                        className="mt-6 px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                    >
                        Check My Bookings
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {refunds.map((refund) => (
                        <div 
                            key={refund.id}
                            onClick={() => navigate(`/guest/bookings/${refund.booking_id}`)}
                            className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Property Image */}
                                <div className="w-full md:w-20 h-24 md:h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                    {refund.property_image ? (
                                        <img src={refund.property_image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiDollarSign className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{refund.property_title}</h3>
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusStyle(refund.status)}`}>
                                            {getStatusIcon(refund.status)}
                                            {refund.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">Ref: {refund.refund_reference} • Booking #{refund.booking_reference}</p>
                                    
                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Refund Amount</p>
                                            <p className="text-base font-extrabold text-rose-600">BDT {formatPrice(refund.refund_amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Requested On</p>
                                            <p className="text-sm font-bold text-gray-700">{new Date(refund.requested_at).toLocaleDateString()}</p>
                                        </div>
                                        {refund.completed_at && (
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Completed On</p>
                                                <p className="text-sm font-bold text-green-600">{new Date(refund.completed_at).toLocaleDateString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Link Indicator */}
                                <div className="hidden md:flex flex-shrink-0 text-gray-300 group-hover:text-rose-500 transition-colors">
                                    <FiChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
                <FiAlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-1">How refunds work?</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                        Once you cancel a booking, a refund request is automatically generated based on the cancellation policy. 
                        Our team typically reviews and approves requests within 24-48 hours. After approval, the amount will be sent 
                        back to your original payment method. Depending on your bank, it may take 7-10 business days to reflect in your account.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GuestRefunds;
