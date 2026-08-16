import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';
import { useQuery } from 'react-query';
import api from '../../utils/api';
import { formatPrice } from '../../utils/textUtils';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HMSPricing = () => {
    const { user, fetchProfile } = useAuthStore();
    const settings = useSettingsStore(state => state.settings);
    const currency = settings?.currency || 'BDT';
    
    // Check if we just returned from successful payment
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('payment') === 'success';
    React.useEffect(() => {
        if (isSuccess) {
            toast.success('Your HMS Subscription is now Active!');
            fetchProfile(); // Refresh user profile to get the latest HMS status
            window.history.replaceState({}, '', '/property-owner/hms/pricing');
        }
    }, [isSuccess, fetchProfile]);

    const { data: packages = [], isLoading } = useQuery('owner-hms-packages', async () => {
        const res = await api.get('/property-owner/hms/packages');
        return res.data?.data || [];
    });
    
    const [isProcessing, setIsProcessing] = useState(false);

    // Status can be: active, trialing, expired, inactive
    const hmsStatus = user?.hms_status || 'inactive';
    const activePackageId = user?.hms_subscription?.package_id;
    const isTrialUsed = user?.hms_subscription?.is_trial_used;

    const getStatusTheme = () => {
        switch (hmsStatus) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'trialing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'expired': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRemainingDaysText = () => {
        if (hmsStatus === 'trialing' && user?.hms_subscription?.trial_ends_at) {
            const days = Math.ceil((new Date(user.hms_subscription.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
            return days > 0 ? `(${days} days remaining)` : '(Ends today)';
        } else if (hmsStatus === 'active' && user?.hms_subscription?.subscription_ends_at) {
            const days = Math.ceil((new Date(user.hms_subscription.subscription_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
            return days > 0 ? `(${days} days remaining)` : '(Ends today)';
        }
        return '';
    };

    const handleSubscribe = async (pkg) => {
        setIsProcessing(true);
        try {
            const res = await api.post('/sslcommerz/hms-request', {
                package_id: pkg.id,
                amount: pkg.price
            });
            if (res.data?.data?.url) {
                window.location.href = res.data.data.url;
            } else {
                 // The backend now returns 400 for errors, so it will go to catch.
                 // But in case of success:true without URL:
                throw new Error('Failed to generate payment URL');
            }
        } catch (error) {
            console.error('Subscription error', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
            setIsProcessing(false);
        }
    };

    const handleStartTrial = async () => {
        setIsProcessing(true);
        try {
            const res = await api.post('/property-owner/hms/start-trial');
            toast.success(res.data?.message || 'Trial started successfully!');
            await fetchProfile();
        } catch (error) {
            console.error('Trial error', error);
            toast.error(error.response?.data?.message || 'Failed to start trial');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <LoadingSpinner />;

    const trialPackage = packages.find(p => p.is_trial);
    const paidPackages = packages.filter(p => !p.is_trial);

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Hotel Management System (HMS)</h1>
            
            <div className={`p-6 rounded-lg border mb-8 ${getStatusTheme()}`}>
                <h2 className="text-xl font-semibold mb-2">
                    Current Status: <span className="capitalize">{hmsStatus}</span> <span className="text-sm font-normal ml-1">{getRemainingDaysText()}</span>
                </h2>
                <p className="text-sm">
                    {hmsStatus === 'active' && 'You have full access to all HMS features.'}
                    {hmsStatus === 'trialing' && 'You are currently on a free trial of HMS. Upgrade soon to keep access!'}
                    {hmsStatus === 'expired' && 'Your HMS access has expired. Please upgrade to continue using HMS features.'}
                    {hmsStatus === 'inactive' && 'You are not subscribed to HMS. Unlock powerful management features by upgrading!'}
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Basic / Standard Plan */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Standard Host</h3>
                    <div className="text-4xl font-extrabold text-gray-900 mb-6">Free</div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center text-gray-600">
                            <span className="text-green-500 mr-2">✓</span> Standard Property Listing
                        </li>
                        <li className="flex items-center text-gray-600">
                            <span className="text-green-500 mr-2">✓</span> Basic Calendar
                        </li>
                        <li className="flex items-center text-gray-600">
                            <span className="text-red-400 mr-2">✕</span> Room Inventory Management
                        </li>
                    </ul>
                    <div className="py-2 px-4 bg-gray-100 text-gray-500 text-center rounded-lg font-medium text-sm">
                        Default Active Plan
                    </div>
                </div>

                {/* Free Trial Card (Only if eligible) */}
                {hmsStatus === 'inactive' && !isTrialUsed && trialPackage && (
                    <div className="bg-blue-50 rounded-2xl shadow-sm border border-blue-200 p-8 flex flex-col border-dashed">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">{trialPackage.name}</h3>
                        <div className="text-3xl font-extrabold text-blue-900 mb-2">Free</div>
                        <p className="text-sm text-blue-600 mb-6">Full features for {trialPackage.trial_days} days</p>
                        <ul className="space-y-3 mb-8 flex-1 text-sm">
                            <li className="flex items-center text-blue-800">
                                <span className="text-blue-500 mr-2">✓</span> All Premium Features
                            </li>
                            <li className="flex items-center text-blue-800">
                                <span className="text-blue-500 mr-2">✓</span> Room Inventory Access
                            </li>
                            <li className="flex items-center text-blue-800">
                                <span className="text-blue-500 mr-2">✓</span> Staff Accounts
                            </li>
                        </ul>
                        <button 
                            onClick={handleStartTrial}
                            disabled={isProcessing}
                            className={`w-full font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md ${isProcessing ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            {isProcessing ? 'Activating...' : `Start ${trialPackage.trial_days} Days Trial`}
                        </button>
                    </div>
                )}

                {/* Dynamic Paid Packages */}
                {paidPackages.map((pkg, index) => {
                    const isRecommended = index === 0;
                    const isCurrentPlan = hmsStatus === 'active' && activePackageId === pkg.id;

                    return (
                        <div key={pkg.id} className={`rounded-2xl shadow p-8 flex flex-col relative overflow-hidden ${isRecommended ? 'bg-gradient-to-b from-blue-50 to-white border border-blue-200' : 'bg-white border border-gray-100'}`}>
                            {isRecommended && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    RECOMMENDED
                                </div>
                            )}
                            <h3 className={`text-2xl font-bold mb-4 ${isRecommended ? 'text-blue-900' : 'text-gray-900'}`}>{pkg.name}</h3>
                            <div className={`text-4xl font-extrabold mb-2 ${isRecommended ? 'text-blue-900' : 'text-gray-900'}`}>{currency} {formatPrice(pkg.price)}<span className={`text-lg font-medium ${isRecommended ? 'text-blue-500' : 'text-gray-500'}`}>/{pkg.billing_cycle}</span></div>
                            <p className={`text-sm mb-6 ${isRecommended ? 'text-blue-600' : 'text-gray-500'}`}>Duration: {pkg.duration_days} days</p>
                            
                            <ul className="space-y-4 mb-8 flex-1">
                                {Array.isArray(pkg.features) && pkg.features.map((feature, i) => (
                                    <li key={i} className={`flex items-center ${isRecommended ? 'text-blue-800' : 'text-gray-600'}`}>
                                        <span className={`${isRecommended ? 'text-blue-500' : 'text-green-500'} mr-2`}>✓</span> {feature}
                                    </li>
                                ))}
                            </ul>

                            {isCurrentPlan ? (
                                <button className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-xl cursor-default shadow-sm opacity-90" disabled>
                                    Current Active Plan
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleSubscribe(pkg)}
                                    disabled={isProcessing}
                                    className={`w-full font-bold py-3 px-4 rounded-xl transition duration-200 shadow-md transform hover:-translate-y-0.5 ${isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                >
                                    {isProcessing ? 'Processing...' : (hmsStatus === 'expired' || hmsStatus === 'active' ? 'Renew / Upgrade' : 'Upgrade Now')}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Payment & Renewal History Section */}
            <SubscriptionPaymentHistorySection />
        </div>
    );
};

const SubscriptionPaymentHistorySection = () => {
    const { data: historyData, isLoading } = useQuery('host-hms-subscription-history', async () => {
        const res = await api.get('/property-owner/hms/subscription-history');
        return res.data?.data || {};
    });

    const history = historyData?.history || [];

    return (
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">💳</span>
                Subscription Payment & Renewal History
            </h2>

            {isLoading ? (
                <div className="py-8 flex justify-center">
                    <LoadingSpinner message="Loading subscription payment history..." />
                </div>
            ) : history.length === 0 ? (
                <div className="py-8 text-center text-gray-400 font-medium">
                    No past subscription fee payment records found.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black uppercase text-gray-400 tracking-wider">
                                <th className="py-3 px-4">Package</th>
                                <th className="py-3 px-4">Amount Paid</th>
                                <th className="py-3 px-4">Payment Method</th>
                                <th className="py-3 px-4">Transaction ID</th>
                                <th className="py-3 px-4">Payment Date</th>
                                <th className="py-3 px-4">Active Until</th>
                                <th className="py-3 px-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                            {history.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="py-3.5 px-4 font-bold text-gray-900">
                                        {item.package_name}
                                        <span className="block text-xs font-normal text-gray-400">{item.duration_days} Days Access</span>
                                    </td>
                                    <td className="py-3.5 px-4 font-black text-gray-900">
                                        ৳{parseFloat(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-lg">
                                            {item.payment_method}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-xs text-gray-500 font-semibold">
                                        {item.tran_id}
                                    </td>
                                    <td className="py-3.5 px-4 text-xs font-semibold text-gray-600">
                                        {new Date(item.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="py-3.5 px-4 text-xs font-bold text-emerald-700">
                                        {item.valid_until ? new Date(item.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                            {item.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HMSPricing;
