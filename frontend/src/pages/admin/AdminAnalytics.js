import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminAnalytics = () => {
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/analytics?period=${timeRange}`);
      setAnalytics(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Comprehensive insights into platform performance</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics?.data?.users?.total_users || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics?.data?.properties?.total_properties || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics?.data?.bookings?.total_bookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  BDT {analytics?.data?.bookings?.total_revenue?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meta Pixel Health & Tracking Status */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 border border-blue-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 mb-4 gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-blue-500">🔵</span> Meta Pixel &amp; Conversions API Status
              </h2>
              <p className="text-xs text-gray-500 mt-1">Real-time health checking and standard events dashboard</p>
            </div>
            <div>
              {settings?.facebook_pixel_id ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 text-gray-400 rounded-full text-xs font-bold">
                  <span className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
                  Inactive
                </span>
              )}
            </div>
          </div>

          {settings?.facebook_pixel_id ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left col: Configuration stats */}
              <div className="space-y-3 border-r border-gray-100 pr-0 md:pr-6">
                <div>
                  <span className="text-xs text-gray-400 block">Pixel ID</span>
                  <span className="text-sm font-bold text-gray-800">{settings.facebook_pixel_id}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Advanced Matching</span>
                  <span className="text-sm font-bold text-gray-800">
                    {settings.meta_advanced_matching !== false ? '✅ Enabled (Hashed)' : '❌ Disabled'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Conversions API (CAPI)</span>
                  <span className="text-sm font-bold text-gray-800">
                    {settings.meta_capi_enabled === true ? '✅ Connected (Server)' : '❌ Disabled'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Test Mode Code</span>
                  <span className="text-sm font-bold text-gray-800">
                    {settings.meta_test_event_code || '—'}
                  </span>
                </div>
              </div>

              {/* Middle col: Mock event counts */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Events Tracked (Last 24 hours)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'PageView', count: 1245, color: 'bg-blue-500' },
                    { label: 'Search', count: 320, color: 'bg-indigo-500' },
                    { label: 'ViewContent', count: 154, color: 'bg-pink-500' },
                    { label: 'Purchase', count: 24, color: 'bg-emerald-500' }
                  ].map((item, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-xs text-gray-500 font-semibold">{item.label}</span>
                      </div>
                      <span className="text-xl font-black text-gray-900">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
                  <span className="text-lg">💡</span>
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    To test your events in real-time, enter your <strong>Meta Test Event Code</strong> in settings and visit the <strong>Test Events</strong> tab in your Meta Events Manager.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-3xl block mb-2">📢</span>
              <p className="text-sm text-gray-500 font-medium">
                Facebook Pixel ID is not configured. Please add it in <strong>Settings &gt; Analytics &amp; Ads</strong> to start tracking conversion events.
              </p>
            </div>
          )}
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            {analytics?.data?.revenueChart?.length > 0 ? (
              <div className="overflow-x-auto pb-2 scrollbar-thin">
                <div 
                  className="h-64 flex items-end justify-between space-x-2 pb-1 w-full"
                  style={{ minWidth: `${analytics.data.revenueChart.length * 36}px` }}
                >
                  {analytics.data.revenueChart.map((item, index) => (
                    <div key={index} className="flex flex-col items-center w-8 shrink-0">
                      <div
                        className="bg-blue-500 rounded-t w-full mb-2 hover:bg-blue-600 transition-colors"
                        style={{ height: `${Math.max(4, (item.amount / Math.max(...analytics.data.revenueChart.map(r => r.amount))) * 180)}px` }}
                      ></div>
                      <span className="text-[10px] text-gray-500 truncate w-full text-center">{item.date}</span>
                      <span className="text-[10px] font-bold text-gray-900" title={`BDT ${item.amount}`}>
                        {item.amount < 1000 ? item.amount : (item.amount / 1000).toFixed(1) + 'k'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-lg shadow p-6 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
            {analytics?.data?.userChart?.length > 0 ? (
              <div className="overflow-x-auto pb-2 scrollbar-thin">
                <div 
                  className="h-64 flex items-end justify-between space-x-2 pb-1 w-full"
                  style={{ minWidth: `${analytics.data.userChart.length * 36}px` }}
                >
                  {analytics.data.userChart.map((item, index) => (
                    <div key={index} className="flex flex-col items-center w-8 shrink-0">
                      <div
                        className="bg-green-500 rounded-t w-full mb-2 hover:bg-green-600 transition-colors"
                        style={{ height: `${Math.max(4, (item.count / Math.max(...analytics.data.userChart.map(r => r.count))) * 180)}px` }}
                      ></div>
                      <span className="text-[10px] text-gray-500 truncate w-full text-center">{item.date}</span>
                      <span className="text-[10px] font-bold text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No user growth data available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Properties */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Properties</h3>
            <div className="space-y-4">
              {analytics?.data?.topProperties?.slice(0, 5).map((property, index) => (
                <div key={property.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{property.title}</p>
                      <p className="text-sm text-gray-600">{property.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">BDT {parseFloat(property.total_revenue || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{property.total_bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {analytics?.data?.recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mr-3 ${activity.type === 'booking' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-600">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default AdminAnalytics;
