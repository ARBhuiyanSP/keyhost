import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from 'react-query';
import { 
    FiSearch, FiPrinter, FiCalendar, FiPieChart, FiFileText, 
    FiRefreshCw, FiChevronLeft, FiChevronRight, FiCheckCircle, 
    FiInfo, FiDownload, FiBookOpen, FiDollarSign
} from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import useSettingsStore from '../../../../store/settingsStore';
import api from '../../../../utils/api';
import useToast from '../../../../hooks/useToast';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const fmt = (n) => parseFloat(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDateLocal = (date) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// Business Category mapping for Financial Reports
const getRevenueCategory = (headName) => {
    const name = (headName || '').toLowerCase();
    if (name.includes('room') || name.includes('booking') || name.includes('rent') || name.includes('accommodation')) {
        return 'Room Booking Revenue';
    }
    if (name.includes('food') || name.includes('beverage') || name.includes('restaurant') || name.includes('dining') || name.includes('meal')) {
        return 'Food & Beverage Revenue';
    }
    return 'Other Revenue & Receipts';
};

const getExpenseCategory = (headName) => {
    const name = (headName || '').toLowerCase();
    if (name.includes('repair') || name.includes('maintenance') || name.includes('pest') || name.includes('ac') || name.includes('plumb') || name.includes('paint') || name.includes('electric') || name.includes('wiring') || name.includes('wire')) {
        return 'Repairs & Maintenance';
    }
    if (name.includes('salary') || name.includes('wage') || name.includes('employee') || name.includes('allowance') || name.includes('payroll') || name.includes('bonus') || name.includes('hr')) {
        return 'Staff Salaries & HR';
    }
    if (name.includes('utility') || name.includes('water') || name.includes('gas') || name.includes('internet') || name.includes('wifi') || name.includes('bill')) {
        return 'Utilities & Bills';
    }
    if (name.includes('clean') || name.includes('laundry') || name.includes('housekeeping') || name.includes('supplies') || name.includes('soap') || name.includes('toiletries') || name.includes('linen')) {
        return 'Housekeeping & Supplies';
    }
    return 'Other Operational Expenses';
};

// Visual SVG Donut Chart
const DonutChart = ({ revenue, expenses }) => {
    const total = parseFloat(revenue || 0) + parseFloat(expenses || 0);
    const netProfit = parseFloat(revenue || 0) - parseFloat(expenses || 0);

    const revPct = total > 0 ? (revenue / total) * 100 : 0;
    const expPct = total > 0 ? (expenses / total) * 100 : 0;

    const radius = 35;
    const circ = 2 * Math.PI * radius; // ~219.9
    const strokeDashoffsetRev = circ - (revPct / 100) * circ;

    return (
        <div className="flex flex-row items-center gap-6 w-full">
            <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke="#f3f4f6"
                        strokeWidth="10"
                    />
                    {/* Revenue segment (green) */}
                    {revenue > 0 && (
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke="#004e59"
                            strokeWidth="10"
                            strokeDasharray={circ}
                            strokeDashoffset={0}
                        />
                    )}
                    {/* Expense segment (red) starting from the end of revenue */}
                    {expenses > 0 && (
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke="#e11d48"
                            strokeWidth="10"
                            strokeDasharray={circ}
                            strokeDashoffset={strokeDashoffsetRev}
                        />
                    )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[8px] font-bold text-gray-400 uppercase">Profit Margin</span>
                    <span className="text-[11px] font-black text-gray-800">
                        {revenue > 0 ? `${((netProfit / revenue) * 100).toFixed(0)}%` : '0%'}
                    </span>
                </div>
            </div>
            <div className="space-y-2 flex-1 w-full text-xs">
                <div className="flex justify-between items-center pb-1 border-b border-gray-100">
                    <span className="flex items-center gap-1.5 font-bold text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#004e59]"></span> Revenues
                    </span>
                    <span className="font-extrabold text-gray-800">{fmt(revenue)} BDT</span>
                </div>
                <div className="flex justify-between items-center pb-1 border-b border-gray-100">
                    <span className="flex items-center gap-1.5 font-bold text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Expenses
                    </span>
                    <span className="font-extrabold text-gray-800">{fmt(expenses)} BDT</span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                    <span className="font-bold text-gray-600">Net Profit</span>
                    <span className={`font-black ${netProfit >= 0 ? 'text-[#004e59]' : 'text-rose-700'}`}>{fmt(netProfit)} BDT</span>
                </div>
            </div>
        </div>
    );
};

// Visual SVG Horizontal Bar Chart
const CategoryBarChart = ({ categories }) => {
    const maxAmount = Math.max(...categories.map(c => c.total), 1);

    return (
        <div className="space-y-3.5 w-full">
            {categories.map(cat => {
                const percent = (cat.total / maxAmount) * 100;
                return (
                    <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-gray-500">
                            <span>{cat.name}</span>
                            <span className="text-gray-800 font-extrabold">{fmt(cat.total)} BDT</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div 
                                className="bg-[#004e59] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}
            {categories.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs italic">No expenses recorded</div>
            )}
        </div>
    );
};

const HMSFinancialReports = () => {
    const { showError } = useToast();
    const { settings } = useSettingsStore();

    // Default date range: First day of current month to today
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const firstDayStr = formatDateLocal(firstDay);
    const lastDayStr = formatDateLocal(lastDay);

    // Active report: 'income-statement' or 'balance-sheet'
    const [activeReportTab, setActiveReportTab] = useState('income-statement');

    // Sub-view: 'summary' (condensed financial ledger) or 'details' (transaction list)
    const [activeView, setActiveView] = useState('summary');

    // Filter states
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [startDate, setStartDate] = useState(firstDayStr);
    const [endDate, setEndDate] = useState(lastDayStr);

    // Search parameters
    const [searchParams, setSearchParams] = useState({
        propertyId: '',
        startDate: firstDayStr,
        endDate: lastDayStr,
        trigger: 0
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);


    // Date picker state
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [monthsShown, setMonthsShown] = useState(window.innerWidth < 768 ? 1 : 2);
    const datePickerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setMonthsShown(window.innerWidth < 768 ? 1 : 2);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsDatePickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const presets = [
        {
            label: 'Yesterday',
            getRange: () => {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                return [d, d];
            }
        },
        {
            label: 'Today',
            getRange: () => {
                const d = new Date();
                return [d, d];
            }
        },
        {
            label: 'This Month',
            getRange: () => {
                const d = new Date();
                const start = new Date(d.getFullYear(), d.getMonth(), 1);
                const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
                return [start, end];
            }
        },
        {
            label: 'Last Month',
            getRange: () => {
                const d = new Date();
                const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
                const end = new Date(d.getFullYear(), d.getMonth(), 0);
                return [start, end];
            }
        },
        {
            label: 'Last 30 Days',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 29);
                return [start, end];
            }
        },
        {
            label: 'Last 90 Days',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 89);
                return [start, end];
            }
        },
        {
            label: 'This Year',
            getRange: () => {
                const d = new Date();
                const start = new Date(d.getFullYear(), 0, 1);
                const end = new Date(d.getFullYear(), 11, 31);
                return [start, end];
            }
        }
    ];

    const handleDateRangeChange = (dates) => {
        const [start, end] = dates;
        if (start) {
            setStartDate(formatDateLocal(start));
        } else {
            setStartDate('');
        }
        
        if (end) {
            setEndDate(formatDateLocal(end));
            setIsDatePickerOpen(false);
        } else {
            setEndDate('');
        }
    };

    const handlePresetClick = (range) => {
        const [start, end] = range;
        setStartDate(formatDateLocal(start));
        setEndDate(formatDateLocal(end));
        setIsDatePickerOpen(false);
    };

    // 1. Fetch properties list
    const { data: properties, isLoading: loadingProps } = useQuery(
        'hms-financial-properties',
        async () => {
            const response = await api.get('/property-owner/properties');
            return response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
        },
        {
            refetchOnWindowFocus: false,
            onError: () => showError('Failed to load properties list')
        }
    );

    // Default select property
    useEffect(() => {
        if (properties && properties.length > 0 && !selectedPropertyId) {
            const savedPropertyId = localStorage.getItem('hms_selected_property_id') || 'all';
            setSelectedPropertyId(savedPropertyId);
            setSearchParams(prev => ({
                ...prev,
                propertyId: savedPropertyId,
                startDate: firstDayStr,
                endDate: lastDayStr
            }));
        }
    }, [properties, selectedPropertyId]);

    // 2. Fetch financial report data
    const { data: reportData, isLoading: loadingReport, refetch } = useQuery(
        ['hms-financial-report', activeReportTab, searchParams],
        async () => {
            if (!searchParams.propertyId) return null;
            const endpoint = activeReportTab === 'income-statement'
                ? '/hms/accounts/reports/income-statement'
                : '/hms/accounts/reports/balance-sheet';
            
            const params = {
                property_id: searchParams.propertyId,
                startDate: searchParams.startDate,
                endDate: searchParams.endDate
            };

            const response = await api.get(endpoint, { params });
            return response.data?.data || null;
        },
        {
            enabled: !!searchParams.propertyId,
            refetchOnWindowFocus: false,
            onError: () => showError('Failed to load report data')
        }
    );

    // Categorized revenue and expense data
    const categorizedData = useMemo(() => {
        if (!reportData) return null;

        const revs = reportData.revenues || [];
        const exps = reportData.expenses || [];

        // Group revenues
        const revGrouped = {};
        revs.forEach(r => {
            const cat = getRevenueCategory(r.head_name);
            if (!revGrouped[cat]) revGrouped[cat] = { name: cat, items: [], total: 0 };
            revGrouped[cat].items.push(r);
            revGrouped[cat].total += parseFloat(r.amount || 0);
        });

        // Group expenses
        const expGrouped = {};
        exps.forEach(e => {
            const cat = getExpenseCategory(e.head_name);
            if (!expGrouped[cat]) expGrouped[cat] = { name: cat, items: [], total: 0 };
            expGrouped[cat].items.push(e);
            expGrouped[cat].total += parseFloat(e.amount || 0);
        });

        return {
            revenues: Object.values(revGrouped),
            expenses: Object.values(expGrouped)
        };
    }, [reportData]);

    const handleSearch = () => {
        if (!selectedPropertyId) {
            showError('Please select a property');
            return;
        }
        if (!startDate || !endDate) {
            showError('Please select a valid date range');
            return;
        }
        setCurrentPage(1);
        setSearchParams({
            propertyId: selectedPropertyId,
            startDate,
            endDate,
            trigger: searchParams.trigger + 1
        });
    };

    const handleReset = () => {
        const savedPropertyId = localStorage.getItem('hms_selected_property_id') || 'all';

        setSelectedPropertyId(savedPropertyId);
        setStartDate(firstDayStr);
        setEndDate(lastDayStr);
        setCurrentPage(1);
        setSearchParams({
            propertyId: savedPropertyId,
            startDate: firstDayStr,
            endDate: lastDayStr,
            trigger: searchParams.trigger + 1
        });
    };

    const handlePrint = () => {
        window.print();
    };

    // Export Excel CSV
    const handleExportCSV = () => {
        if (!reportData) {
            showError('No data available to export');
            return;
        }

        if (activeView === 'details') {
            const transactions = reportData.transactions || [];
            if (transactions.length === 0) {
                showError('No transactions found to export');
                return;
            }
            const headers = ['SL', 'Date', 'Property', 'Account Head', 'Description', 'Reference Type', 'Reference ID', 'Type', 'Amount (BDT)'];
            const csvRows = [headers.join(',')];
            
            transactions.forEach((tx, idx) => {
                const row = [
                    idx + 1,
                    tx.date ? new Date(tx.date).toLocaleDateString() : '',
                    `"${(tx.property_name || selectedPropertyTitle).replace(/"/g, '""')}"`,
                    `"${(tx.head_name || '').replace(/"/g, '""')}"`,
                    `"${(tx.description || '').replace(/"/g, '""')}"`,
                    tx.reference_type || '—',
                    tx.reference_id || '—',
                    tx.trans_type || tx.head_type,
                    parseFloat(tx.amount || 0).toFixed(2)
                ];
                csvRows.push(row.join(','));
            });

            const csvContent = "\uFEFF" + csvRows.join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Financial_Report_Details_${activeReportTab}_${searchParams.startDate}_to_${searchParams.endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Export Summary View
            const csvRows = [];
            
            if (activeReportTab === 'income-statement') {
                csvRows.push(`INCOME STATEMENT - ${selectedPropertyTitle.toUpperCase()}`);
                csvRows.push(`Period: ${fmtDate(searchParams.startDate)} to ${fmtDate(searchParams.endDate)}`);
                csvRows.push('');
                csvRows.push('REVENUE/INCOME');
                (reportData.revenues || []).forEach(r => {
                    csvRows.push(`  ${r.head_name},${parseFloat(r.amount).toFixed(2)}`);
                });
                csvRows.push(`TOTAL REVENUE,,${parseFloat(reportData.totalRevenue || 0).toFixed(2)}`);
                csvRows.push('');
                csvRows.push('OPERATIONAL EXPENSES');
                (reportData.expenses || []).forEach(e => {
                    csvRows.push(`  ${e.head_name},${parseFloat(e.amount).toFixed(2)}`);
                });
                csvRows.push(`TOTAL EXPENSES,,${parseFloat(reportData.totalExpenses || 0).toFixed(2)}`);
                csvRows.push('');
                csvRows.push(`NET PROFIT/LOSS,,${parseFloat(reportData.netProfit || 0).toFixed(2)}`);
            } else {
                csvRows.push(`BALANCE SHEET - ${selectedPropertyTitle.toUpperCase()}`);
                csvRows.push(`As of Date: ${fmtDate(searchParams.endDate)}`);
                csvRows.push('');
                csvRows.push('ASSETS');
                csvRows.push(`  Cash & Bank,,${parseFloat(reportData.cashAndBank || 0).toFixed(2)}`);
                (reportData.customAssets || []).forEach(a => {
                    csvRows.push(`  ${a.head_name},,${parseFloat(a.amount).toFixed(2)}`);
                });
                csvRows.push(`TOTAL ASSETS,,${parseFloat(reportData.totalAssets || 0).toFixed(2)}`);
                csvRows.push('');
                csvRows.push('LIABILITIES');
                (reportData.customLiabilities || []).forEach(l => {
                    csvRows.push(`  ${l.head_name},,${parseFloat(l.amount).toFixed(2)}`);
                });
                csvRows.push(`TOTAL LIABILITIES,,${parseFloat(reportData.totalLiabilities || 0).toFixed(2)}`);
                csvRows.push('');
                csvRows.push('OWNER\'S EQUITY');
                csvRows.push(`  Retained Earnings (Prior Periods),,${parseFloat(reportData.retainedEarnings || 0).toFixed(2)}`);
                csvRows.push(`  Current Period Net Earnings,,${parseFloat(reportData.currentEarnings || 0).toFixed(2)}`);
                csvRows.push(`TOTAL OWNER\'S EQUITY,,${parseFloat(reportData.totalEquity || 0).toFixed(2)}`);
                csvRows.push('');
                csvRows.push(`TOTAL LIABILITIES & EQUITY,,${parseFloat(reportData.totalLiabilitiesAndEquity || 0).toFixed(2)}`);
            }

            const csvContent = "\uFEFF" + csvRows.join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Financial_Report_Summary_${activeReportTab}_${searchParams.startDate}_to_${searchParams.endDate}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const selectedPropertyTitle = useMemo(() => {
        if (searchParams.propertyId === 'all') return 'All Properties (Consolidated)';
        return properties?.find(p => String(p.id) === String(searchParams.propertyId))?.title || 'Selected Property';
    }, [properties, searchParams.propertyId]);

    const fmtDate = (dStr) => {
        if (!dStr) return '';
        try {
            const date = new Date(dStr);
            if (isNaN(date.getTime())) return dStr;
            return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        } catch {
            return dStr;
        }
    };

    // Pagination helper
    const paginatedTransactions = useMemo(() => {
        const list = reportData?.transactions || [];
        const start = (currentPage - 1) * pageSize;
        return list.slice(start, start + pageSize);
    }, [reportData?.transactions, currentPage, pageSize]);

    const totalPages = Math.ceil((reportData?.transactions || []).length / pageSize) || 1;

    // Check if Balance Sheet is balanced
    const isBalanced = useMemo(() => {
        if (activeReportTab !== 'balance-sheet' || !reportData) return true;
        return Math.abs(parseFloat(reportData.totalAssets || 0) - parseFloat(reportData.totalLiabilitiesAndEquity || 0)) < 0.01;
    }, [activeReportTab, reportData]);

    const imbalanceAmount = useMemo(() => {
        if (activeReportTab !== 'balance-sheet' || !reportData) return 0;
        return Math.abs(parseFloat(reportData.totalAssets || 0) - parseFloat(reportData.totalLiabilitiesAndEquity || 0));
    }, [activeReportTab, reportData]);

    return (
        <div className="space-y-6 pb-12 print:bg-white print:p-0">
            {/* Header - Hidden on print */}
            <div className="bg-white px-6 py-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FiFileText className="text-[#004e59]" /> Financial Statements
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Generate professional Income Statement (P&L) and Balance Sheet reports.</p>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        disabled={loadingReport || !reportData}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#004e59] text-white rounded-lg font-bold text-xs hover:bg-[#003d46] transition-all shadow-md active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed"
                    >
                        <FiPrinter size={14} /> Print Statement
                    </button>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block border-b border-gray-300 pb-4 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase">
                            {activeReportTab === 'income-statement' ? 'Income Statement (Profit & Loss)' : 'Balance Sheet'}
                        </h1>
                        <p className="text-sm font-bold text-gray-700 mt-1">{selectedPropertyTitle}</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                        <p className="font-bold text-gray-700">HMS Financial Services</p>
                        <p>info@keyhost24.com</p>
                        <p>Mobile: +8801730353300</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-gray-600">
                    <div>
                        <p><strong>Reporting Period:</strong> {activeReportTab === 'income-statement' ? `${fmtDate(searchParams.startDate)} — ${fmtDate(searchParams.endDate)}` : `As of ${fmtDate(searchParams.endDate)}`}</p>
                        <p><strong>Property Scope:</strong> {selectedPropertyTitle}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>Run Date:</strong> {new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                        <p><strong>Currency:</strong> BDT</p>
                    </div>
                </div>
            </div>

            {/* Top Report Selector Tabs - Hidden on print */}
            <div className="flex border-b border-gray-200 print:hidden bg-white p-1 rounded-xl shadow-sm border max-w-fit">
                <button
                    onClick={() => {
                        setActiveReportTab('income-statement');
                        setCurrentPage(1);
                    }}
                    className={`px-5 py-2 rounded-lg font-bold text-xs transition-all ${
                        activeReportTab === 'income-statement'
                            ? 'bg-[#004e59] text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    Income Statement (P&L)
                </button>
                <button
                    onClick={() => {
                        setActiveReportTab('balance-sheet');
                        setCurrentPage(1);
                    }}
                    className={`px-5 py-2 rounded-lg font-bold text-xs transition-all ${
                        activeReportTab === 'balance-sheet'
                            ? 'bg-[#004e59] text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    Balance Sheet
                </button>
            </div>

            {/* Filter Module - Hidden on print */}
            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row gap-4 items-end print:hidden">
                {/* 1. Property Select */}
                <div className="w-full md:w-1/3 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-0.5">
                        <span className="text-red-500">*</span> Property
                    </label>
                    <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        disabled={loadingProps}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 focus:outline-none focus:border-[#004e59] focus:ring-1 focus:ring-[#004e59] h-[38px] font-medium"
                    >
                        <option value="all">All Properties (Aggregated)</option>
                        {properties?.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                </div>

                {/* 2. Custom Date Range Picker Overlay */}
                <div className="w-full md:w-2/3 flex flex-col gap-1.5" ref={datePickerRef}>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-0.5">
                        <span className="text-red-500">*</span> Date Range
                    </label>
                    <div className="flex gap-2 items-center w-full">
                        <div className="relative flex-1">
                            <div 
                                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                className={`w-full flex items-center justify-between bg-white border ${
                                    isDatePickerOpen ? 'border-[#004e59] ring-1 ring-[#004e59]' : 'border-gray-200'
                                } rounded-lg px-3 py-2 text-xs text-gray-700 cursor-pointer select-none focus:outline-none transition-all h-[38px]`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={startDate ? "text-gray-800 font-medium" : "text-gray-400"}>
                                        {startDate ? fmtDate(startDate) : "Start date"}
                                    </span>
                                    <span className="text-gray-300 font-bold">&rarr;</span>
                                    <span className={endDate ? "text-gray-800 font-medium" : "text-gray-400"}>
                                        {endDate ? fmtDate(endDate) : "End date"}
                                    </span>
                                </div>
                                <FiCalendar className="text-gray-400" size={14} />
                            </div>
                            
                            {isDatePickerOpen && (
                                <div className="absolute z-50 mt-2.5 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden top-full left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 w-[92vw] max-w-[340px] md:max-w-none md:w-max shadow-2xl">
                                    {/* Presets */}
                                    <div className="w-full md:w-40 border-b md:border-b-0 md:border-r border-gray-150 p-2 flex flex-row md:flex-col gap-1 overflow-x-auto bg-gray-50/50 whitespace-nowrap">
                                        {presets.map(p => (
                                            <button
                                                key={p.label}
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePresetClick(p.getRange());
                                                }}
                                                className="px-3 py-1.5 md:py-2 md:w-full text-left rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-[#004e59] transition-colors inline-block md:block flex-shrink-0"
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* Calendar */}
                                    <div className="p-3 bg-white" onClick={(e) => e.stopPropagation()}>
                                        <DatePicker
                                            selected={startDate ? new Date(startDate) : null}
                                            startDate={startDate ? new Date(startDate) : null}
                                            endDate={endDate ? new Date(endDate) : null}
                                            selectsRange
                                            onChange={handleDateRangeChange}
                                            monthsShown={monthsShown}
                                            inline
                                            renderCustomHeader={({
                                                monthDate,
                                                customHeaderCount,
                                                decreaseMonth,
                                                increaseMonth,
                                                decreaseYear,
                                                increaseYear,
                                                prevMonthButtonDisabled,
                                                nextMonthButtonDisabled,
                                                prevYearButtonDisabled,
                                                nextYearButtonDisabled,
                                            }) => {
                                                const monthName = monthDate.toLocaleString('en-US', { month: 'short' });
                                                const year = monthDate.getFullYear();
                                                
                                                return (
                                                    <div className="flex items-center justify-between px-3 py-1.5 select-none relative">
                                                        {customHeaderCount === 0 ? (
                                                            <div className="flex items-center gap-1.5 absolute left-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={decreaseYear}
                                                                    disabled={prevYearButtonDisabled}
                                                                    className="text-gray-400 hover:text-gray-900 disabled:opacity-30 text-xs font-bold p-1 cursor-pointer transition-colors"
                                                                >
                                                                    &lt;&lt;
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={decreaseMonth}
                                                                    disabled={prevMonthButtonDisabled}
                                                                    className="text-gray-400 hover:text-gray-900 disabled:opacity-30 text-xs font-bold p-1 cursor-pointer transition-colors"
                                                                >
                                                                    &lt;
                                                                </button>
                                                            </div>
                                                        ) : null}
                                                        
                                                        <div className="w-full text-center text-xs font-bold text-gray-700">
                                                            {monthName} {year}
                                                        </div>
                                                        
                                                        {(customHeaderCount === 1 || monthsShown === 1) ? (
                                                            <div className="flex items-center gap-1.5 absolute right-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={increaseMonth}
                                                                    disabled={nextMonthButtonDisabled}
                                                                    className="text-gray-400 hover:text-gray-900 disabled:opacity-30 text-xs font-bold p-1 cursor-pointer transition-colors"
                                                                >
                                                                    &gt;
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={increaseYear}
                                                                    disabled={nextYearButtonDisabled}
                                                                    className="text-gray-400 hover:text-gray-900 disabled:opacity-30 text-xs font-bold p-1 cursor-pointer transition-colors"
                                                                >
                                                                    &gt;&gt;
                                                                </button>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={handleSearch}
                            disabled={loadingReport || loadingProps}
                            className="flex items-center gap-1.5 py-2 px-5 bg-[#004e59] hover:bg-[#003d46] text-white rounded-lg font-bold text-xs transition shadow-sm h-[38px] cursor-pointer"
                        >
                            <FiSearch size={14} /> Search
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={loadingReport || loadingProps}
                            className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-100 rounded-lg font-bold text-xs transition shadow-sm h-[38px] w-[38px] cursor-pointer"
                            title="Reset Filters"
                        >
                            <FiRefreshCw size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-view Controls - Hidden on print */}
            {reportData && (
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm print:hidden">
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-lg border border-gray-150">
                        <button
                            onClick={() => setActiveView('summary')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                                activeView === 'summary'
                                    ? 'bg-white text-[#004e59] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <FiBookOpen size={13} /> Summary Ledger
                        </button>
                        <button
                            onClick={() => setActiveView('details')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                                activeView === 'details'
                                    ? 'bg-white text-[#004e59] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            <FiPieChart size={13} /> Details View
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {activeReportTab === 'balance-sheet' && (
                            <div>
                                {isBalanced ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                                        <FiCheckCircle size={12} /> Balanced
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                                        <FiInfo size={12} /> Imbalance of {fmt(imbalanceAmount)} BDT
                                    </span>
                                )}
                            </div>
                        )}
                        
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-xs font-bold transition-all"
                        >
                            <FiDownload size={13} /> Export CSV
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {loadingReport ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-4">
                    <LoadingSpinner />
                    <span className="text-sm font-semibold text-gray-500">Generating Statement...</span>
                </div>
            ) : reportData ? (
                <div>
                    {/* Visual Insights Section - Hidden on print */}
                    {activeView === 'summary' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden max-w-4xl mx-auto mb-6">
                            {/* Donut Chart: Total Revenues vs Expenses */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row items-center gap-6">
                                <DonutChart revenue={reportData.totalRevenue} expenses={reportData.totalExpenses} />
                            </div>

                            {/* Bar Chart: Expenses by Category */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between">
                                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-4">Expenses by Category</h4>
                                <CategoryBarChart categories={categorizedData?.expenses || []} />
                            </div>
                        </div>
                    )}

                    {/* SUMMARY VIEW (A4 structured statement) */}
                    {activeView === 'summary' && (
                        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-md border border-gray-150 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
                            {/* Income Statement Summary */}
                            {activeReportTab === 'income-statement' && (
                                <div className="space-y-8">
                                    <div className="text-center pb-6 border-b border-gray-200 print:pb-3">
                                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Statement of Income</h2>
                                        <p className="text-xs text-gray-500 mt-1">For the period ended {fmtDate(searchParams.startDate)} to {fmtDate(searchParams.endDate)}</p>
                                    </div>

                                    {/* Revenues Section */}
                                    <div>
                                        <h3 className="text-xs font-extrabold uppercase text-[#004e59] tracking-wider mb-4 pb-1 border-b border-gray-150">Revenues & Receipts</h3>
                                        <div className="space-y-4">
                                            {categorizedData?.revenues.map(cat => (
                                                <div key={cat.name} className="pl-2 border-l-2 border-teal-600/30">
                                                    <div className="flex justify-between font-bold text-gray-800 text-[11px] bg-gray-50/50 py-1.5 px-2.5 rounded-lg">
                                                        <span>{cat.name}</span>
                                                        <span>{fmt(cat.total)} BDT</span>
                                                    </div>
                                                    <table className="w-full text-xs text-gray-600 mt-1">
                                                        <tbody>
                                                            {cat.items.map(r => (
                                                                <tr key={r.head_id} className="border-b border-gray-50/40">
                                                                    <td className="py-2 pl-4">{r.head_name}</td>
                                                                    <td className="py-2 text-right pr-4">{fmt(r.amount)} BDT</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                            {(!categorizedData || categorizedData.revenues.length === 0) && (
                                                <div className="text-center py-4 text-gray-400 italic">No revenue recorded in this period</div>
                                            )}
                                            <div className="border-t border-gray-800 font-extrabold bg-gray-50/80 p-2.5 rounded-lg flex justify-between text-xs text-gray-900 mt-2">
                                                <span>Total Revenues & Receipts</span>
                                                <span className="text-[#004e59]">{fmt(reportData.totalRevenue)} BDT</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expenses Section */}
                                    <div>
                                        <h3 className="text-xs font-extrabold uppercase text-[#004e59] tracking-wider mb-4 pb-1 border-b border-gray-150">Operational Expenses</h3>
                                        <div className="space-y-4">
                                            {categorizedData?.expenses.map(cat => (
                                                <div key={cat.name} className="pl-2 border-l-2 border-rose-600/30">
                                                    <div className="flex justify-between font-bold text-gray-800 text-[11px] bg-gray-50/50 py-1.5 px-2.5 rounded-lg">
                                                        <span>{cat.name}</span>
                                                        <span>{fmt(cat.total)} BDT</span>
                                                    </div>
                                                    <table className="w-full text-xs text-gray-600 mt-1">
                                                        <tbody>
                                                            {cat.items.map(e => (
                                                                <tr key={e.head_id} className="border-b border-gray-50/40">
                                                                    <td className="py-2 pl-4">{e.head_name}</td>
                                                                    <td className="py-2 text-right pr-4">{fmt(e.amount)} BDT</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ))}
                                            {(!categorizedData || categorizedData.expenses.length === 0) && (
                                                <div className="text-center py-4 text-gray-400 italic">No expenses recorded in this period</div>
                                            )}
                                            <div className="border-t border-gray-800 font-extrabold bg-gray-50/80 p-2.5 rounded-lg flex justify-between text-xs text-gray-900 mt-2">
                                                <span>Total Operating Expenses</span>
                                                <span className="text-rose-700">{fmt(reportData.totalExpenses)} BDT</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Net Profit/Loss (P&L Double Underline) */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex justify-between items-center p-4 bg-teal-50/50 border-t-2 border-b-[4px] border-double border-gray-800 rounded-lg">
                                            <span className="text-sm font-extrabold uppercase text-gray-800">Net Profit / (Loss)</span>
                                            <span className={`text-base font-black ${
                                                parseFloat(reportData.netProfit) >= 0 ? 'text-[#004e59]' : 'text-red-700'
                                            }`}>
                                                {fmt(reportData.netProfit)} BDT
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Balance Sheet Summary */}
                            {activeReportTab === 'balance-sheet' && (
                                <div className="space-y-8">
                                    <div className="text-center pb-6 border-b border-gray-200 print:pb-3">
                                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Statement of Financial Position</h2>
                                        <p className="text-xs text-gray-500 mt-1">As of Date: {fmtDate(searchParams.endDate)}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
                                        {/* Assets Column */}
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-extrabold uppercase text-[#004e59] tracking-wider pb-1.5 border-b border-gray-200">Assets</h3>
                                            <table className="w-full text-xs text-gray-700">
                                                <tbody>
                                                    <tr className="border-b border-gray-50 font-medium">
                                                        <td className="py-2.5 pl-1">Cash & Bank Balance</td>
                                                        <td className="py-2.5 text-right pr-1">{fmt(reportData.cashAndBank)} BDT</td>
                                                    </tr>
                                                    {(reportData.customAssets || []).map(a => (
                                                        <tr key={a.head_id} className="border-b border-gray-50">
                                                            <td className="py-2.5 pl-1">{a.head_name}</td>
                                                            <td className="py-2.5 text-right pr-1">{fmt(a.amount)} BDT</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <div className="pt-2 border-t-2 border-gray-800 flex justify-between font-bold bg-gray-50 p-2 rounded">
                                                <span>Total Assets</span>
                                                <span className="text-[#004e59]">{fmt(reportData.totalAssets)} BDT</span>
                                            </div>
                                        </div>

                                        {/* Liabilities & Equity Column */}
                                        <div className="space-y-6">
                                            {/* Liabilities */}
                                            <div className="space-y-3">
                                                <h3 className="text-xs font-extrabold uppercase text-[#004e59] tracking-wider pb-1.5 border-b border-gray-200">Liabilities</h3>
                                                <table className="w-full text-xs text-gray-700">
                                                    <tbody>
                                                        {(reportData.customLiabilities || []).map(l => (
                                                            <tr key={l.head_id} className="border-b border-gray-50">
                                                                <td className="py-2.5 pl-1">{l.head_name}</td>
                                                                <td className="py-2.5 text-right pr-1">{fmt(l.amount)} BDT</td>
                                                            </tr>
                                                        ))}
                                                        {(!reportData.customLiabilities || reportData.customLiabilities.length === 0) && (
                                                            <tr>
                                                                <td colSpan={2} className="py-2.5 text-center text-gray-400 italic">No liability accounts active</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-800 pl-1 text-[11px]">
                                                    <span>Total Liabilities</span>
                                                    <span>{fmt(reportData.totalLiabilities)} BDT</span>
                                                </div>
                                            </div>

                                            {/* Owner's Equity */}
                                            <div className="space-y-3">
                                                <h3 className="text-xs font-extrabold uppercase text-[#004e59] tracking-wider pb-1.5 border-b border-gray-200">Owner's Equity</h3>
                                                <table className="w-full text-xs text-gray-700">
                                                    <tbody>
                                                        <tr className="border-b border-gray-50">
                                                            <td className="py-2.5 pl-1">Retained Earnings (Prior Years)</td>
                                                            <td className="py-2.5 text-right pr-1">{fmt(reportData.retainedEarnings)} BDT</td>
                                                        </tr>
                                                        <tr className="border-b border-gray-50">
                                                            <td className="py-2.5 pl-1">Current period net earnings</td>
                                                            <td className="py-2.5 text-right pr-1">{fmt(reportData.currentEarnings)} BDT</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-800 pl-1 text-[11px]">
                                                    <span>Total Owner's Equity</span>
                                                    <span>{fmt(reportData.totalEquity)} BDT</span>
                                                </div>
                                            </div>

                                            {/* Liabilities & Equity Total */}
                                            <div className="pt-2 border-t-2 border-gray-800 flex justify-between font-bold bg-gray-50 p-2 rounded">
                                                <span>Total Liabilities & Equity</span>
                                                <span className="text-[#004e59]">{fmt(reportData.totalLiabilitiesAndEquity)} BDT</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Double underline confirmation for Balance Sheet */}
                                    <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="text-center md:text-left">
                                            <p className="text-xs font-bold text-gray-600">Accounting Equation Balance Check:</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Assets ({fmt(reportData.totalAssets)}) = Liabilities & Equity ({fmt(reportData.totalLiabilitiesAndEquity)})</p>
                                        </div>
                                        <div>
                                            {isBalanced ? (
                                                <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs font-extrabold uppercase tracking-wide">
                                                    <FiCheckCircle size={14} className="text-emerald-700" /> Balanced
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg text-xs font-extrabold uppercase tracking-wide">
                                                    <FiInfo size={14} className="text-amber-700" /> Out of Balance ({fmt(imbalanceAmount)} BDT)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Signatures Area for summary view - Visible when printing */}
                            <div className="hidden print:block pt-16 mt-16 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-8 text-center text-xs">
                                    <div>
                                        <div className="w-48 border-b border-gray-400 mx-auto mb-2"></div>
                                        <p className="font-bold text-gray-700">Prepared By</p>
                                        <p className="text-gray-400">HMS Accountant Officer</p>
                                    </div>
                                    <div className="ml-auto mr-12 text-center">
                                        <div className="w-48 border-b border-gray-400 mx-auto mb-2"></div>
                                        <p className="font-bold text-gray-700">Approved By</p>
                                        <p className="text-gray-400">Property Manager/Owner</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DETAILS VIEW (Interactive transaction audit table) */}
                    {activeView === 'details' && (
                        <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden print:hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-600">
                                    Showing {(reportData.transactions || []).length} items matching filters
                                </span>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-400">Page Size:</label>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(parseInt(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-700 focus:outline-none"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-150 text-gray-500 font-bold uppercase tracking-wider">
                                            <th className="py-3 px-4 w-12 text-center">SL</th>
                                            <th className="py-3 px-4 w-28">Date</th>
                                            <th className="py-3 px-4">Account Head</th>
                                            <th className="py-3 px-4">Description</th>
                                            <th className="py-3 px-4 w-32">Reference</th>
                                            <th className="py-3 px-4 w-20 text-center">Type</th>
                                            <th className="py-3 px-4 w-32 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        {paginatedTransactions.map((tx, idx) => {
                                            const sl = (currentPage - 1) * pageSize + idx + 1;
                                            const isDr = tx.trans_type === 'debit';
                                            return (
                                                <tr key={tx.id} className="hover:bg-gray-50/60 transition-colors">
                                                    <td className="py-3 px-4 text-center font-medium text-gray-400">{sl}</td>
                                                    <td className="py-3 px-4 text-gray-500 font-medium">
                                                        {tx.date ? new Date(tx.date).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-bold text-gray-800">{tx.head_name}</div>
                                                        <div className="text-[10px] text-gray-400 capitalize">{tx.head_type}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600 italic max-w-xs truncate" title={tx.description}>
                                                        {tx.description || '—'}
                                                    </td>
                                                    <td className="py-3 px-4 font-mono text-gray-500">
                                                        {tx.reference_type ? (
                                                            <span>
                                                                {tx.reference_type} #{tx.reference_id}
                                                            </span>
                                                        ) : '—'}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                                            isDr ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                                                        }`}>
                                                            {tx.trans_type || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-gray-800">
                                                        {fmt(tx.amount)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {paginatedTransactions.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                                                    No transactions found matching the selection.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/40">
                                    <span className="text-xs text-gray-500">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="p-1.5 border border-gray-200 rounded hover:bg-white text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <FiChevronLeft size={16} />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="p-1.5 border border-gray-200 rounded hover:bg-white text-gray-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                                        >
                                            <FiChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-2">
                    <FiBookOpen size={48} className="text-gray-300" />
                    <h3 className="text-sm font-bold text-gray-600 mt-2">No Financial Data Loaded</h3>
                    <p className="text-xs text-gray-400 max-w-xs text-center">Select a property and date range then click Search to compile the financial reports.</p>
                </div>
            )}
        </div>
    );
};

export default HMSFinancialReports;
