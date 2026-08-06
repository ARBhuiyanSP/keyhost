import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  FiPieChart, FiTrendingUp, FiUsers, FiGlobe, FiClock, FiDollarSign, 
  FiHome, FiCalendar, FiMapPin
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HMSGuestAnalytics = ({ hideHeader = false }) => {
    const { showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);

    useEffect(() => {
        const savedId = localStorage.getItem('hms_selected_property_id');
        if (savedId) {
            setSelectedPropertyId(parseInt(savedId));
        }

        const handlePropertyChange = () => {
            const newId = localStorage.getItem('hms_selected_property_id');
            if (newId) {
                setSelectedPropertyId(parseInt(newId));
            }
        };

        window.addEventListener('hmsPropertyChange', handlePropertyChange);
        return () => window.removeEventListener('hmsPropertyChange', handlePropertyChange);
    }, []);

    // Fetch analytics data
    const { data = {}, isLoading } = useQuery(
        ['hms-guest-analytics', selectedPropertyId],
        async () => {
            if (!selectedPropertyId) return {};
            const response = await api.get(`/property-owner/hms/analytics/guests/${selectedPropertyId}`);
            return response.data?.data || {};
        },
        {
            enabled: !!selectedPropertyId,
            onError: (err) => showError(err.response?.data?.message || 'Failed to fetch guest analytics')
        }
    );

    const {
        revenueSplit = [],
        retentionStats = [],
        nationalityStats = [],
        stayDuration = []
    } = data;

    // Helper formatting functions
    const fmtBDT = (amount) => {
        return parseFloat(amount || 0).toLocaleString('en-BD', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

    // Calculate revenue split percentages
    const totalRev = revenueSplit.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0);
    const walkinRev = parseFloat(revenueSplit.find(r => r.source === 'admin')?.total_revenue || 0);
    const onlineRev = parseFloat(revenueSplit.find(r => r.source === 'website')?.total_revenue || 0);

    const walkinPct = totalRev > 0 ? ((walkinRev / totalRev) * 100).toFixed(1) : '0.0';
    const onlinePct = totalRev > 0 ? ((onlineRev / totalRev) * 100).toFixed(1) : '0.0';

    // Calculate retention stats
    const totalGuestsCount = retentionStats.reduce((sum, item) => sum + parseInt(item.guests_count || 0), 0);
    const repeatGuestsCount = parseInt(retentionStats.find(r => r.guest_type === 'Repeat Guest')?.guests_count || 0);
    const newGuestsCount = parseInt(retentionStats.find(r => r.guest_type === 'New Guest')?.guests_count || 0);

    const repeatPct = totalGuestsCount > 0 ? ((repeatGuestsCount / totalGuestsCount) * 100).toFixed(1) : '0.0';
    const newPct = totalGuestsCount > 0 ? ((newGuestsCount / totalGuestsCount) * 100).toFixed(1) : '0.0';

    // Calculate stay duration stats
    const totalDurationBookings = stayDuration.reduce((sum, item) => sum + parseInt(item.bookings_count || 0), 0);
    const maxDurationBookingsCount = Math.max(...stayDuration.map(d => parseInt(d.bookings_count)), 1);

    // SVG Donut Chart Renderer (matching UserAnalyticsReport.js)
    const renderDonutChart = (chartData, totalVal, totalLabel = 'Total') => {
        const total = chartData.reduce((acc, item) => acc + parseFloat(item.count || 0), 0);
        if (total === 0) return null;

        let accumulatedPercent = 0;
        return (
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0 print:border print:border-gray-100 print:rounded-full">
                <svg width="100%" height="100%" viewBox="0 0 42 42" className="transform -rotate-90">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                    {chartData.map((item, idx) => {
                        const count = parseFloat(item.count || 0);
                        if (count === 0) return null;
                        const percent = (count / total) * 100;
                        const strokeDash = `${percent} ${100 - percent}`;
                        const strokeOffset = 100 - accumulatedPercent;
                        accumulatedPercent += percent;
                        return (
                            <circle
                                key={idx}
                                cx="21"
                                cy="21"
                                r="15.915"
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="4.2"
                                strokeDasharray={strokeDash}
                                strokeDashoffset={strokeOffset}
                                className="transition-all duration-500"
                            />
                        );
                    })}
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black text-gray-900 leading-none">{totalVal}</span>
                    <span className="text-[6px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{totalLabel}</span>
                </div>
            </div>
        );
    };

    if (!selectedPropertyId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LoadingSpinner />
                <p className="text-sm text-slate-500 mt-4">Initializing analytics dashboard...</p>
            </div>
        );
    }

    // Prepare data arrays for rendering
    const revenueChartData = [
        { count: walkinRev, color: '#004e59', label: 'Walk-in (Offline)', pct: walkinPct, val: `৳${fmtBDT(walkinRev)}` },
        { count: onlineRev, color: '#10b981', label: 'Direct Online', pct: onlinePct, val: `৳${fmtBDT(onlineRev)}` }
    ];

    const retentionChartData = [
        { count: repeatGuestsCount, color: '#f59e0b', label: 'Repeat Guests', pct: repeatPct, val: `${repeatGuestsCount} Guests` },
        { count: newGuestsCount, color: '#64748b', label: 'New Guests', pct: newPct, val: `${newGuestsCount} Guests` }
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Title */}
            {!hideHeader && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">HMS Guest Analytics</h1>
                    <p className="text-xxs text-gray-400 mt-1 uppercase font-bold tracking-wider">Interactive occupancy, demographic, and retention metrics</p>
                </div>
            )}

            {isLoading ? (
                <div className="py-12 flex justify-center"><LoadingSpinner /></div>
            ) : (
                <div className="space-y-8">
                    {/* Main Distribution Grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* 1. Revenue Contribution Split */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
                                    <FiDollarSign className="text-[#004e59]" /> Revenue Contribution Split
                                </h2>
                                <p className="text-xxs text-gray-400 mt-0.5">Walk-in vs Direct Online channel distribution share.</p>
                            </div>

                            <div className="flex items-center gap-6 mt-6">
                                {renderDonutChart(revenueChartData, `${totalRev > 1000 ? '৳' + Math.round(totalRev / 1000) + 'k' : '৳' + totalRev}`, 'Revenue')}
                                <div className="space-y-3 flex-1">
                                    {revenueChartData.map(r => (
                                        <div key={r.label} className="space-y-1">
                                            <div className="flex justify-between text-xxs font-bold text-gray-605">
                                                <span>{r.label}</span>
                                                <span>{r.val} ({r.pct}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div 
                                                    className="h-1.5 rounded-full transition-all duration-500" 
                                                    style={{ width: `${r.pct}%`, backgroundColor: r.color }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. Customer Retention & Return Rate */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
                                    <FiUsers className="text-[#004e59]" /> Customer Retention
                                </h2>
                                <p className="text-xxs text-gray-400 mt-0.5">New vs returning regular customer distribution.</p>
                            </div>

                            <div className="flex items-center gap-6 mt-6">
                                {renderDonutChart(retentionChartData, totalGuestsCount, 'Guests')}
                                <div className="space-y-3 flex-1">
                                    {retentionChartData.map(r => (
                                        <div key={r.label} className="space-y-1">
                                            <div className="flex justify-between text-xxs font-bold text-gray-605">
                                                <span>{r.label}</span>
                                                <span>{r.val} ({r.pct}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div 
                                                    className="h-1.5 rounded-full transition-all duration-500" 
                                                    style={{ width: `${r.pct}%`, backgroundColor: r.color }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* 3. Length of Stay Distribution (Stay Duration) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="border-b border-gray-100 pb-3">
                            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                <FiClock className="text-[#004e59]" /> Stay Duration (Nights)
                            </h2>
                            <p className="text-xxs text-gray-400 mt-0.5">Frequency distribution of total stay durations across all bookings.</p>
                        </div>

                        {stayDuration.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-xs">No stay duration logs recorded yet.</div>
                        ) : (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                {/* Bar chart columns */}
                                <div className="space-y-4">
                                    {stayDuration.slice(0, 5).map((d) => {
                                        const pct = Math.round((d.bookings_count / maxDurationBookingsCount) * 100);
                                        const share = totalDurationBookings > 0 ? Math.round((d.bookings_count / totalDurationBookings) * 100) : 0;
                                        
                                        return (
                                            <div key={d.nights} className="space-y-1">
                                                <div className="flex justify-between text-xxs font-bold text-gray-605">
                                                    <span>{d.nights} {d.nights === 1 ? 'Night' : 'Nights'}</span>
                                                    <span>{d.bookings_count} bookings ({share}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div 
                                                        style={{ width: `${pct}%` }}
                                                        className="h-2 bg-[#004e59] rounded-full transition-all duration-500"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* Info Box */}
                                <div className="p-5 bg-gray-50 border border-gray-150 rounded-xl space-y-3">
                                    <FiTrendingUp className="text-[#004e59] w-6 h-6" />
                                    <h4 className="text-xs font-bold text-gray-900 leading-tight">Occupancy Insights</h4>
                                    <p className="text-xxs text-gray-550 leading-relaxed font-medium">
                                        Understanding how long guests stay helps optimize housekeeping staff rosters and direct marketing pricing coupons. Stays ranging from 1 to 2 nights typically dominate offline walk-ins.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4. Top Nationalities (Demographics Table Format) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <FiGlobe className="text-[#004e59]" /> Top Guest Nationalities
                                </h2>
                                <p className="text-xxs text-gray-400 mt-0.5">Ranked list of top guest nationalities visiting the property.</p>
                            </div>
                        </div>

                        {nationalityStats.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 italic text-xs">No nationality details logged yet.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-100 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                                            <th className="px-6 py-3">Rank</th>
                                            <th className="px-6 py-3">Country / Nationality</th>
                                            <th className="px-6 py-3 text-center">Bookings Count</th>
                                            <th className="px-6 py-3 text-right font-semibold">Total Revenue Contribution</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs text-gray-705">
                                        {nationalityStats.map((n, idx) => (
                                            <tr key={n.nationality} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-black text-gray-400">
                                                    #0{idx + 1}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-950 flex items-center gap-2">
                                                    <FiMapPin className="text-gray-400" size={13} />
                                                    <span>{n.nationality}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xxs font-bold">
                                                        {n.bookings_count} bookings
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-black text-gray-950 pr-8">
                                                    ৳{fmtBDT(n.total_revenue)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HMSGuestAnalytics;
