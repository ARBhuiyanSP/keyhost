import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { FiAward, FiTrendingUp, FiClock, FiCheckCircle, FiXCircle, FiGift } from 'react-icons/fi';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RewardsPoints = () => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch user's rewards points
  const { data: pointsData, isLoading, refetch } = useQuery(
    'rewards-points',
    () => api.get('/rewards-points/my-points'),
    {
      select: (response) => response.data?.data,
    }
  );

  // Fetch transaction history
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery(
    ['rewards-points-transactions', selectedTab],
    () => api.get('/rewards-points/my-transactions?page=1&limit=50'),
    {
      select: (response) => response.data?.data,
      enabled: selectedTab === 'history',
    }
  );

  // Fetch member tiers
  const { data: tiersData } = useQuery(
    'member-tiers',
    () => api.get('/rewards-points/member-tiers'),
    {
      select: (response) => response.data?.data,
    }
  );

  const points = pointsData?.points || {};
  const settings = pointsData?.settings || {};
  const transactions = transactionsData?.transactions || [];
  const tiers = tiersData?.tiers || [];

  // Find current tier and next tier
  const currentTier = tiers.find(t => t.id === points.member_status_tier_id) || tiers[0];
  const nextTier = tiers.find(t => t.min_points > (points.total_points_earned || 0)) || null;
  const progressToNextTier = nextTier 
    ? Math.min(100, ((points.total_points_earned || 0) / nextTier.min_points) * 100)
    : 100;

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards Points</h1>
          <p className="text-gray-600">Earn points with every booking and redeem them for discounts</p>
        </div>

        {/* Points Balance Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-100 text-sm mb-1">Available Points</p>
              <h2 className="text-4xl font-bold">{points.current_balance || 0}</h2>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <FiAward className="w-8 h-8" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-primary-100 text-sm">Total Earned</p>
              <p className="text-xl font-semibold">{points.total_points_earned || 0}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Points Used</p>
              <p className="text-xl font-semibold">{points.lifetime_points_spent || 0}</p>
            </div>
          </div>
        </div>

        {/* Member Status Card */}
        {currentTier && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Member Status</h3>
                <div className="flex items-center gap-2">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: currentTier.tier_color || '#666' }}
                  >
                    {currentTier.tier_display_name}
                  </span>
                </div>
              </div>
              <FiAward className="w-8 h-8" style={{ color: currentTier.tier_color || '#666' }} />
            </div>
            
            {nextTier && (
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress to {nextTier.tier_display_name}</span>
                  <span>{points.total_points_earned || 0} / {nextTier.min_points} points</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressToNextTier}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {nextTier.min_points - (points.total_points_earned || 0)} more points needed
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setSelectedTab('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  selectedTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedTab('history')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  selectedTab === 'history'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transaction History
              </button>
              <button
                onClick={() => setSelectedTab('tiers')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  selectedTab === 'tiers'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Member Tiers
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* How it works */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">How Rewards Points Work</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FiTrendingUp className="w-6 h-6 text-primary-600" />
                        <h4 className="font-semibold text-gray-900">Earn Points</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Earn points based on your booking amount. The more you spend, the more points you earn!
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FiGift className="w-6 h-6 text-primary-600" />
                        <h4 className="font-semibold text-gray-900">Redeem Points</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Use your points to get discounts on future bookings. {settings.points_per_taka && `1 point = ${(1 / settings.points_per_taka).toFixed(2)} BDT`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Points Settings */}
                {settings && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Points Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points per Taka:</span>
                        <span className="font-medium">{settings.points_per_taka || 1} point = 1 BDT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum to Redeem:</span>
                        <span className="font-medium">{settings.min_points_to_redeem || 100} points</span>
                      </div>
                      {settings.max_points_per_booking && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max per Booking:</span>
                          <span className="font-medium">{settings.max_points_per_booking} points</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {selectedTab === 'history' && (
              <div>
                {transactionsLoading ? (
                  <LoadingSpinner />
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <FiClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.transaction_type === 'earned' 
                              ? 'bg-green-100 text-green-600'
                              : transaction.transaction_type === 'redeemed'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {transaction.transaction_type === 'earned' ? (
                              <FiTrendingUp className="w-5 h-5" />
                            ) : transaction.transaction_type === 'redeemed' ? (
                              <FiGift className="w-5 h-5" />
                            ) : (
                              <FiClock className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.transaction_type === 'earned' && 'Points Earned'}
                              {transaction.transaction_type === 'redeemed' && 'Points Redeemed'}
                              {transaction.transaction_type === 'expired' && 'Points Expired'}
                              {transaction.transaction_type === 'adjusted' && 'Points Adjusted'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {transaction.description || 'No description'}
                            </p>
                            {transaction.booking_reference && (
                              <p className="text-xs text-gray-500">
                                Booking: {transaction.booking_reference}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${
                            transaction.transaction_type === 'earned' 
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'earned' ? '+' : '-'}{Math.abs(transaction.points)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Balance: {transaction.balance_after}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tiers Tab */}
            {selectedTab === 'tiers' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Status Tiers</h3>
                <div className="space-y-4">
                  {tiers.map((tier, index) => {
                    const isCurrentTier = tier.id === points.member_status_tier_id;
                    const isUnlocked = (points.total_points_earned || 0) >= tier.min_points;
                    
                    return (
                      <div
                        key={tier.id}
                        className={`border-2 rounded-lg p-4 ${
                          isCurrentTier 
                            ? 'border-primary-600 bg-primary-50'
                            : isUnlocked
                            ? 'border-gray-300 bg-white'
                            : 'border-gray-200 bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: tier.tier_color || '#666' }}
                            >
                              {tier.tier_display_name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{tier.tier_display_name}</h4>
                              <p className="text-sm text-gray-600">
                                Minimum {tier.min_points.toLocaleString()} points
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {isCurrentTier && (
                              <span className="px-3 py-1 bg-primary-600 text-white text-sm rounded-full">
                                Current
                              </span>
                            )}
                            {isUnlocked && !isCurrentTier && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                                Unlocked
                              </span>
                            )}
                            {!isUnlocked && (
                              <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full">
                                Locked
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPoints;

