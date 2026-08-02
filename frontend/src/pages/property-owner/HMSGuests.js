import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { 
  FiSearch, FiUser, FiPhone, FiMail, FiGlobe, FiShield, 
  FiFileText, FiCalendar, FiDollarSign, FiEye, FiCheckCircle, FiAward,
  FiMapPin, FiPrinter
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { getImageUrl } from '../../utils/imageUrl';

const HMSGuests = ({ hideHeader = false }) => {
    const { showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal state for viewing guest document scan
    const [previewDocUrl, setPreviewDocUrl] = useState(null);
    const [previewDocTitle, setPreviewDocTitle] = useState('');

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

    // Fetch guests list
    const { data: guests = [], isLoading } = useQuery(
        ['hms-guests-list', selectedPropertyId],
        async () => {
            if (!selectedPropertyId) return [];
            const response = await api.get(`/property-owner/hms/guests/${selectedPropertyId}`);
            return response.data?.data?.guests || [];
        },
        {
            enabled: !!selectedPropertyId,
            onError: (err) => showError(err.response?.data?.message || 'Failed to fetch guest directory')
        }
    );

    // Calculate aggregated metrics
    const totalGuests = guests.length;
    const repeatGuests = guests.filter(g => g.total_bookings_count > 1).length;
    const singleGuests = totalGuests - repeatGuests;
    const totalRevenue = guests.reduce((sum, g) => sum + parseFloat(g.total_revenue_spent || 0), 0);

    const repeatPct = totalGuests > 0 ? ((repeatGuests / totalGuests) * 100).toFixed(1) : '0.0';
    const singlePct = totalGuests > 0 ? ((singleGuests / totalGuests) * 100).toFixed(1) : '0.0';

    // Document Verification counts
    const nidCount = guests.filter(g => g.nid_number || g.nid_document_url).length;
    const passportCount = guests.filter(g => !g.nid_number && (g.passport_number || g.passport_document_url)).length;
    const unverifiedCount = totalGuests - nidCount - passportCount;

    const nidPct = totalGuests > 0 ? ((nidCount / totalGuests) * 100).toFixed(1) : '0.0';
    const passportPct = totalGuests > 0 ? ((passportCount / totalGuests) * 100).toFixed(1) : '0.0';
    const unverifiedPct = totalGuests > 0 ? ((unverifiedCount / totalGuests) * 100).toFixed(1) : '0.0';

    // Filter guests based on search input
    const filteredGuests = guests.filter(g => {
        const query = searchQuery.toLowerCase();
        return (
            (g.guest_name || '').toLowerCase().includes(query) ||
            (g.guest_phone || '').toLowerCase().includes(query) ||
            (g.guest_email || '').toLowerCase().includes(query) ||
            (g.nationality || '').toLowerCase().includes(query) ||
            (g.nid_number || '').toLowerCase().includes(query) ||
            (g.passport_number || '').toLowerCase().includes(query)
        );
    });

    const getDocImgSrc = (url) => getImageUrl(url);

    const fmtDate = (d) => {
        try {
            return format(new Date(d), 'dd MMM yyyy');
        } catch {
            return d || '—';
        }
    };

    const formatBDTRate = (amount) => {
        return parseFloat(amount || 0).toLocaleString('en-BD', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    };

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
                <p className="text-sm text-slate-500 mt-4">Initializing guest directory...</p>
            </div>
        );
    }

    const loyaltyChartData = [
        { count: repeatGuests, color: '#f59e0b', label: 'Repeat Guests', pct: repeatPct, val: `${repeatGuests} Guests` },
        { count: singleGuests, color: '#64748b', label: 'Single Stay Guests', pct: singlePct, val: `${singleGuests} Guests` }
    ];

    const verificationChartData = [
        { count: nidCount, color: '#004e59', label: 'NID Verified', pct: nidPct, val: `${nidCount} Guests` },
        { count: passportCount, color: '#10b981', label: 'Passport Verified', pct: passportPct, val: `${passportCount} Guests` },
        { count: unverifiedCount, color: '#94a3b8', label: 'Unverified', pct: unverifiedPct, val: `${unverifiedCount} Guests` }
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Title */}
            {!hideHeader && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">HMS Guest Directory</h1>
                    <p className="text-xxs text-gray-400 mt-1 uppercase font-bold tracking-wider">Manage unique guest records and view verification documents</p>
                </div>
            )}

            {/* Quick Metrics Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                    {[1, 2, 3].map((idx) => (
                        <div key={idx} className="h-24 bg-gray-100 border border-gray-200 rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Total Guests */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm print-border">
                        <p className="text-gray-400 text-xxs uppercase tracking-wider font-bold mb-1">Total Unique Guests</p>
                        <h3 className="text-2xl font-black text-gray-955">{totalGuests}</h3>
                        <span className="text-[10px] text-gray-400 font-medium">Distinct guest phone numbers</span>
                    </div>

                    {/* Loyal/Repeat Guests */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm print-border">
                        <p className="text-gray-400 text-xxs uppercase tracking-wider font-bold mb-1">Repeat Loyalty Guests</p>
                        <h3 className="text-2xl font-black text-gray-955">{repeatGuests}</h3>
                        <span className="text-[10px] text-gray-400 font-medium">{totalGuests > 0 ? ((repeatGuests / totalGuests) * 100).toFixed(1) : 0}% return stay rate</span>
                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm print-border">
                        <p className="text-gray-400 text-xxs uppercase tracking-wider font-bold mb-1">Total Offline Revenue</p>
                        <h3 className="text-2xl font-black text-gray-955">৳{formatBDTRate(totalRevenue)}</h3>
                        <span className="text-[10px] text-gray-400 font-medium">From manual / walk-in bookings</span>
                    </div>
                </div>
            )}

            {/* Distribution Charts (Unified Format) */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Loyalty Split */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
                                <FiAward className="text-[#004e59]" /> Guest Loyalty Distribution
                            </h2>
                            <p className="text-xxs text-gray-400 mt-0.5">Ratio of repeat stayers vs single-time offline guests.</p>
                        </div>

                        <div className="flex items-center gap-6 mt-6">
                            {renderDonutChart(loyaltyChartData, totalGuests, 'Guests')}
                            <div className="space-y-3 flex-1">
                                {loyaltyChartData.map(l => (
                                    <div key={l.label} className="space-y-1">
                                        <div className="flex justify-between text-xxs font-bold text-gray-605">
                                            <span>{l.label}</span>
                                            <span>{l.val} ({l.pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div 
                                                className="h-1.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${l.pct}%`, backgroundColor: l.color }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ID Verification Split */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
                                <FiShield className="text-[#004e59]" /> Identity Verification Type
                            </h2>
                            <p className="text-xxs text-gray-400 mt-0.5">Verification status and document type splits.</p>
                        </div>

                        <div className="flex items-center gap-6 mt-6">
                            {renderDonutChart(verificationChartData, `${nidCount + passportCount}/${totalGuests}`, 'Verified')}
                            <div className="space-y-3 flex-1">
                                {verificationChartData.map(v => (
                                    <div key={v.label} className="space-y-1">
                                        <div className="flex justify-between text-xxs font-bold text-gray-605">
                                            <span>{v.label}</span>
                                            <span>{v.val} ({v.pct}%)</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div 
                                                className="h-1.5 rounded-full transition-all duration-500" 
                                                style={{ width: `${v.pct}%`, backgroundColor: v.color }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter and Directory List */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Search Bar */}
                <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <FiSearch size={16} />
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, phone, NID or passport..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-slate-500/10 focus:border-slate-500 transition-all font-semibold text-gray-800 placeholder-gray-400"
                        />
                    </div>
                    <span className="text-xxs font-black text-gray-400 uppercase tracking-wider">{filteredGuests.length} Guests found</span>
                </div>

                {/* Table Directory */}
                {isLoading ? (
                    <div className="py-12 flex justify-center"><LoadingSpinner /></div>
                ) : filteredGuests.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 italic text-xs">
                        No guest records match your search criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-gray-200 text-xxs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-3">Guest Profile</th>
                                    <th className="px-6 py-3">Contact info</th>
                                    <th className="px-6 py-3 text-center">NID / Passport Status</th>
                                    <th className="px-6 py-3 text-center">Stays Frequency</th>
                                    <th className="px-6 py-3 text-right">Revenue Contrib.</th>
                                    <th className="px-6 py-3 text-center">ID Scans</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-705">
                                {filteredGuests.map((g, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-950 flex items-center gap-1.5">
                                                <FiUser className="text-gray-400 shrink-0" size={13} />
                                                <span>{g.guest_name || 'Guest walk-in'}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 block mt-0.5">
                                                Nationality: {g.nationality || 'Unspecified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <FiPhone className="text-gray-400" size={11} />
                                                <span>{g.guest_phone}</span>
                                            </div>
                                            {g.guest_email && (
                                                <div className="flex items-center gap-1.5 text-xxs text-gray-400 font-medium">
                                                    <FiMail className="text-gray-400" size={11} />
                                                    <span>{g.guest_email}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center space-y-1">
                                            {g.nid_number ? (
                                                <span className="inline-block bg-blue-50 text-blue-700 border border-blue-150 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    NID: {g.nid_number}
                                                </span>
                                            ) : g.passport_number ? (
                                                <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    Passport: {g.passport_number}
                                                </span>
                                            ) : (
                                                <span className="inline-block bg-gray-50 text-gray-450 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    Unverified
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {g.total_bookings_count > 1 ? (
                                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xxs font-black">
                                                    <FiAward size={10} /> {g.total_bookings_count} stays
                                                </span>
                                            ) : (
                                                <span className="bg-gray-50 text-gray-600 border border-gray-150 px-2.5 py-0.5 rounded-full text-xxs font-bold">
                                                    {g.total_bookings_count} stay
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-gray-950 pr-8">
                                            ৳{formatBDTRate(g.total_revenue_spent)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {g.nid_document_url && (
                                                    <button
                                                        onClick={() => {
                                                            setPreviewDocUrl(getDocImgSrc(g.nid_document_url));
                                                            setPreviewDocTitle(`${g.guest_name || 'Guest'} - National ID Card`);
                                                        }}
                                                        className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                                                        title="View National ID card"
                                                    >
                                                        <FiEye size={12} />
                                                    </button>
                                                )}
                                                {g.passport_document_url && (
                                                    <button
                                                        onClick={() => {
                                                            setPreviewDocUrl(getDocImgSrc(g.passport_document_url));
                                                            setPreviewDocTitle(`${g.guest_name || 'Guest'} - Passport Scan`);
                                                        }}
                                                        className="p-1.5 text-emerald-600 hover:text-emerald-800 bg-emerald-50 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                                                        title="View Passport scan"
                                                    >
                                                        <FiEye size={12} />
                                                    </button>
                                                )}
                                                {!g.nid_document_url && !g.passport_document_url && (
                                                    <span className="text-[10px] text-gray-400 italic">No scans</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Document Scan Modal Preview */}
            {previewDocUrl && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-150 animate-fadeIn">
                        <div className="p-4 bg-gray-50 border-b border-gray-150 flex items-center justify-between">
                            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">{previewDocTitle}</h3>
                            <button
                                onClick={() => {
                                    setPreviewDocUrl(null);
                                    setPreviewDocTitle('');
                                }}
                                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1 bg-gray-100 rounded hover:bg-gray-200 transition-all"
                            >
                                Close ✖
                            </button>
                        </div>
                        <div className="p-6 flex justify-center bg-gray-100 min-h-[300px] max-h-[500px] overflow-y-auto">
                            <img
                                src={previewDocUrl}
                                alt={previewDocTitle}
                                className="max-w-full h-auto object-contain rounded border border-gray-250 shadow-sm"
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/400x300?text=Scan+Document+Not+Found';
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HMSGuests;
