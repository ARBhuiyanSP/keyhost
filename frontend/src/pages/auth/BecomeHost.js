import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const BecomeHost = () => {
    const navigate = useNavigate();
    const { becomeHost, user } = useAuthStore();
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleContinue = async () => {
        if (!agreed) {
            setError('You must agree to the terms to continue.');
            return;
        }

        setIsLoading(true);
        setError('');

        const res = await becomeHost();
        if (res.success) {
            navigate('/property-owner');
        } else {
            setError(res.error || 'Failed to become a host. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg">
                <div>
                    <h2 className="mt-2 text-center text-4xl font-extrabold text-gray-900 tracking-tight">
                        Become a Host
                    </h2>
                    <p className="mt-4 text-center text-lg text-gray-600">
                        Welcome, {user?.first_name}! You are just one step away from joining our dynamic community of hosts.
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="bg-primary-50 border-l-4 border-primary-500 p-6 rounded-r-lg">
                        <h3 className="text-xl flex items-center gap-2 font-bold text-primary-800 mb-3">
                            <span>🏠</span> Why host with us?
                        </h3>
                        <ul className="space-y-3 text-primary-700">
                            <li className="flex items-start">
                                <span className="text-primary-500 mr-2">✓</span>
                                Earn extra income by safely renting out your property.
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary-500 mr-2">✓</span>
                                You have full control over your availability, prices, and rules.
                            </li>
                            <li className="flex items-start">
                                <span className="text-primary-500 mr-2">✓</span>
                                Comprehensive support and analytics to help you grow.
                            </li>
                        </ul>
                    </div>

                    <div className="flex items-start py-4 border-y border-gray-100">
                        <div className="flex items-center h-5">
                            <input
                                id="agreed"
                                name="agreed"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="focus:ring-primary-500 h-5 w-5 text-primary-600 border-gray-300 rounded cursor-pointer transition-colors"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="agreed" className="font-medium text-gray-700 cursor-pointer">
                                I agree to the Hosting Terms and Conditions
                            </label>
                            <p className="text-gray-500 mt-1">
                                By checking this box, you agree to comply with our local hosting policies, maintaining a high standard of quality and safety for all guests.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 flex gap-4">
                        <button
                            className="flex-1 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-bold transition-colors"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button
                            className={`flex-1 py-3 font-bold rounded-lg shadow-md transition-all ${agreed ? 'bg-primary-600 text-white hover:bg-primary-700 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'
                                }`}
                            onClick={handleContinue}
                            disabled={!agreed || isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Agree & Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BecomeHost;
