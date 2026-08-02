import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from 'react-query';
import { 
    FiSearch, FiFilter, FiPrinter, FiDollarSign, 
    FiCalendar, FiPieChart, FiFileText, FiGrid, FiRefreshCw,
    FiChevronLeft, FiChevronRight, FiCheckCircle, FiInfo, FiDownload
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

const HMSRoomRevenueReport = () => {
    const { showError } = useToast();
    const { settings } = useSettingsStore();

    const escapeCSV = (val) => {
        if (val === null || val === undefined) return '""';
        let str = String(val);
        str = str.replace(/"/g, '""');
        return `"${str}"`;
    };

    // Default dates: First day of current month to today (or last day of month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const firstDayStr = formatDateLocal(firstDay);
    const lastDayStr = formatDateLocal(lastDay);

    // Main tabs: 'room-revenue' (individual transactions) or 'room-wise-revenue' (summary of all rooms)
    const [activeReportTab, setActiveReportTab] = useState('room-revenue');
    
    // Sub-views for Room Revenue tab: 'details' or 'summary'
    const [activeView, setActiveView] = useState('details');

    // Filter form states
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [startDate, setStartDate] = useState(firstDayStr);
    const [endDate, setEndDate] = useState(lastDayStr);

    // Search trigger parameters (only update query on search button click)
    const [searchParams, setSearchParams] = useState({
        propertyId: '',
        roomId: '',
        startDate: firstDayStr,
        endDate: lastDayStr,
        trigger: 0
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);

    // Custom DateRange Picker states
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
            label: 'Last 7 Days',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 6);
                return [start, end];
            }
        },
        {
            label: 'Last 14 Days',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 13);
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
            label: 'Last 120 Days',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 119);
                return [start, end];
            }
        },
        {
            label: 'Last 1 Year',
            getRange: () => {
                const end = new Date();
                const start = new Date();
                start.setFullYear(start.getFullYear() - 1);
                start.setDate(start.getDate() + 1);
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

    // 1. Fetch properties
    const { data: properties, isLoading: loadingProps } = useQuery(
        'hms-report-properties',
        async () => {
            const response = await api.get('/property-owner/properties');
            return response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
        },
        {
            refetchOnWindowFocus: false,
            onError: () => showError('Failed to load properties list')
        }
    );

    // Select default property
    useEffect(() => {
        if (properties && properties.length > 0 && !selectedPropertyId) {
            const savedPropertyId = localStorage.getItem('hms_selected_property_id');
            const defaultProp = properties.find(p => String(p.id) === String(savedPropertyId)) || properties[0];
            setSelectedPropertyId(defaultProp.id);
            setSearchParams(prev => ({
                ...prev,
                propertyId: defaultProp.id,
                startDate: firstDayStr,
                endDate: lastDayStr
            }));
        }
    }, [properties, selectedPropertyId]);

    // 2. Fetch rooms cascadingly
    const { data: rooms, isLoading: loadingRooms } = useQuery(
        ['hms-report-rooms', selectedPropertyId],
        async () => {
            if (!selectedPropertyId) return [];
            const response = await api.get(`/property-owner/hms/rooms/${selectedPropertyId}`);
            return response.data?.data?.rooms || [];
        },
        {
            enabled: !!selectedPropertyId,
            refetchOnWindowFocus: false,
            onError: () => showError('Failed to load rooms list')
        }
    );

    // Handle property selection changes
    const handlePropertyChange = (e) => {
        setSelectedPropertyId(e.target.value);
        setSelectedRoomId(''); // reset selected room
    };

    // 3. Fetch report data
    const { data: reportData, isLoading: loadingReport, refetch } = useQuery(
        ['hms-report-data', activeReportTab, searchParams],
        async () => {
            if (!searchParams.propertyId) return null;
            const endpoint = activeReportTab === 'room-revenue'
                ? '/property-owner/hms/reports/room-revenue'
                : '/property-owner/hms/reports/room-wise-revenue';
            
            const params = {
                property_id: searchParams.propertyId,
                start_date: searchParams.startDate,
                end_date: searchParams.endDate
            };

            if (activeReportTab === 'room-revenue') {
                params.room_id = searchParams.roomId;
            }

            const response = await api.get(endpoint, { params });
            return response.data?.data || null;
        },
        {
            enabled: !!searchParams.propertyId,
            refetchOnWindowFocus: false,
            onError: () => showError('Failed to load report data')
        }
    );

    // Filter trigger
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
            roomId: selectedRoomId,
            startDate,
            endDate,
            trigger: searchParams.trigger + 1
        });
    };

    // Reset filters
    const handleReset = () => {
        const savedPropertyId = localStorage.getItem('hms_selected_property_id');
        const defaultProp = properties?.find(p => String(p.id) === String(savedPropertyId)) || properties?.[0];
        const pId = defaultProp?.id || '';

        setSelectedPropertyId(pId);
        setSelectedRoomId('');
        setStartDate(firstDayStr);
        setEndDate(lastDayStr);
        setCurrentPage(1);
        setSearchParams({
            propertyId: pId,
            roomId: '',
            startDate: firstDayStr,
            endDate: lastDayStr,
            trigger: searchParams.trigger + 1
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        if (!transactions || transactions.length === 0) {
            showError('No transactions available to export');
            return;
        }
        const headers = ['SL', 'Date', 'Booking Ref', 'Guest Name', 'Room No', 'Stay Period', 'Nights', 'Service', 'Charge', 'VAT Amount', 'Service Charge', 'Total Amount'];
        const csvRows = [headers.map(escapeCSV).join(',')];
        
        transactions.forEach((tx, idx) => {
            const row = [
                idx + 1,
                fmtDate(tx.date),
                tx.booking_reference,
                tx.guest_name || 'Guest',
                tx.room_number || '—',
                tx.check_in_date && tx.check_out_date ? `${fmtDate(tx.check_in_date)} - ${fmtDate(tx.check_out_date)}` : '—',
                tx.stay_nights ?? '—',
                tx.service_name || 'ROOM CHARGE',
                parseFloat(tx.charge || 0).toFixed(2),
                parseFloat(tx.vat_amount || 0).toFixed(2),
                parseFloat(tx.service_charge || 0).toFixed(2),
                parseFloat(tx.total_amount || 0).toFixed(2)
            ];
            csvRows.push(row.map(escapeCSV).join(','));
        });
        
        const totalRow = [
            'Total',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            reportTotals.charge.toFixed(2),
            reportTotals.vat.toFixed(2),
            reportTotals.serviceCharge.toFixed(2),
            reportTotals.total.toFixed(2)
        ];
        csvRows.push(totalRow.map(escapeCSV).join(','));
        
        const csvContent = "\uFEFF" + csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Room_Revenue_Report_${searchParams.startDate}_to_${searchParams.endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportExcelWise = () => {
        if (!filteredRoomsList || filteredRoomsList.length === 0) {
            showError('No room statistics available to export');
            return;
        }
        const headers = ['SL', 'Room No', 'Room Type', 'Total Stays', 'Total Charge', 'VAT Amount', 'Service Charge', 'Total Revenue'];
        const csvRows = [headers.map(escapeCSV).join(',')];
        
        filteredRoomsList.forEach((room, idx) => {
            const row = [
                idx + 1,
                `Room ${room.room_number}`,
                room.room_type,
                `${room.total_bookings} stays`,
                parseFloat(room.total_charge || 0).toFixed(2),
                parseFloat(room.total_vat || 0).toFixed(2),
                parseFloat(room.total_service_charge || 0).toFixed(2),
                parseFloat(room.total_revenue || 0).toFixed(2)
            ];
            csvRows.push(row.map(escapeCSV).join(','));
        });
        
        const totalRow = [
            'Total',
            '',
            '',
            `${reportTotals.bookings} stays`,
            reportTotals.charge.toFixed(2),
            reportTotals.vat.toFixed(2),
            reportTotals.serviceCharge.toFixed(2),
            reportTotals.total.toFixed(2)
        ];
        csvRows.push(totalRow.map(escapeCSV).join(','));
        
        const csvContent = "\uFEFF" + csvRows.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Room_Wise_Revenue_Report_${searchParams.startDate}_to_${searchParams.endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Selected Property Title helper
    const selectedPropertyTitle = useMemo(() => {
        return properties?.find(p => String(p.id) === String(searchParams.propertyId))?.title || 'Selected Property';
    }, [properties, searchParams.propertyId]);

    // Selected Room Number helper
    const selectedRoomNumber = useMemo(() => {
        if (!searchParams.roomId || searchParams.roomId === 'all') return 'All Rooms';
        return rooms?.find(r => String(r.id) === String(searchParams.roomId))?.room_number || 'Room';
    }, [rooms, searchParams.roomId]);

    // Memoized metrics & totals calculations
    const transactions = reportData?.transactions || [];
    const roomsList = reportData?.rooms || [];

    const filteredRoomsList = useMemo(() => {
        if (!searchParams.roomId || searchParams.roomId === 'all') return roomsList;
        return roomsList.filter(r => String(r.room_id) === String(searchParams.roomId));
    }, [roomsList, searchParams.roomId]);

    const reportTotals = useMemo(() => {
        if (activeReportTab === 'room-revenue') {
            return transactions.reduce((acc, curr) => {
                acc.charge += parseFloat(curr.charge || 0);
                acc.vat += parseFloat(curr.vat_amount || 0);
                acc.serviceCharge += parseFloat(curr.service_charge || 0);
                acc.total += parseFloat(curr.total_amount || 0);
                return acc;
            }, { charge: 0, vat: 0, serviceCharge: 0, total: 0 });
        } else {
            return filteredRoomsList.reduce((acc, curr) => {
                acc.bookings += parseInt(curr.total_bookings || 0);
                acc.charge += parseFloat(curr.total_charge || 0);
                acc.vat += parseFloat(curr.total_vat || 0);
                acc.serviceCharge += parseFloat(curr.total_service_charge || 0);
                acc.total += parseFloat(curr.total_revenue || 0);
                return acc;
            }, { bookings: 0, charge: 0, vat: 0, serviceCharge: 0, total: 0 });
        }
    }, [activeReportTab, transactions, filteredRoomsList]);

    // Client side pagination calculations
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return transactions.slice(startIndex, startIndex + pageSize);
    }, [transactions, currentPage, pageSize]);

    const totalPages = Math.ceil(transactions.length / pageSize) || 1;

    // Date formatter helper
    const fmtDate = (dStr) => {
        if (!dStr || dStr === 'null' || dStr === 'undefined') return '';
        try {
            const date = new Date(dStr);
            if (isNaN(date.getTime())) return dStr;
            return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        } catch {
            return dStr;
        }
    };

    return (
        <div className="space-y-6 pb-12 print:bg-white print:p-0">
            {/* Header section - Hidden when printing */}
            <div className="bg-white px-6 py-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FiPieChart className="text-[#004e59]" /> Room Revenue Report
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Generate stay revenue reports and room comparative summaries.</p>
                </div>
                
                {/* Print button */}
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#004e59] text-white rounded-lg font-bold text-xs hover:bg-[#003d46] transition-all shadow-md active:scale-95"
                >
                    <FiPrinter size={14} /> Print Report
                </button>
            </div>

            {/* Print Title Header - Only visible when printing */}
            <div className="hidden print:block border-b border-gray-300 pb-4 mb-6">
                <h1 className="text-2xl font-black text-gray-900 uppercase">Room Revenue Report</h1>
                <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-600">
                    <div>
                        <p><strong>Property:</strong> {selectedPropertyTitle}</p>
                        {activeReportTab === 'room-revenue' && <p><strong>Room:</strong> {selectedRoomNumber}</p>}
                        <p><strong>Report Period:</strong> {fmtDate(searchParams.startDate)} &mdash; {fmtDate(searchParams.endDate)}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>Run Date:</strong> {new Date().toLocaleDateString()}</p>
                        <p><strong>Report Scope:</strong> {activeReportTab === 'room-revenue' ? 'Room Revenue Transactions' : 'Comparative Room Wise Revenue'}</p>
                    </div>
                </div>
            </div>

            {/* Tab selection - Hidden when printing */}
            <div className="flex border-b border-gray-200 print:hidden bg-white p-1 rounded-xl shadow-sm border max-w-fit">
                <button
                    onClick={() => {
                        setActiveReportTab('room-revenue');
                        setCurrentPage(1);
                    }}
                    className={`px-5 py-2 rounded-lg font-bold text-xs transition-all ${
                        activeReportTab === 'room-revenue'
                            ? 'bg-[#004e59] text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    Room Revenue
                </button>
                <button
                    onClick={() => {
                        setActiveReportTab('room-wise-revenue');
                        setCurrentPage(1);
                    }}
                    className={`px-5 py-2 rounded-lg font-bold text-xs transition-all ${
                        activeReportTab === 'room-wise-revenue'
                            ? 'bg-[#004e59] text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    Room Wise Revenue
                </button>
            </div>            {/* Filter Section - Hidden when printing */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm print:hidden">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    
                    {/* 1. Property Select */}
                    <div className="w-full md:w-1/4 flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Property</label>
                        <select
                            value={selectedPropertyId}
                            onChange={handlePropertyChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] h-[38px] bg-white cursor-pointer"
                        >
                            <option value="">Select Property</option>
                            {properties?.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* 2. Room Select */}
                    <div className="w-full md:w-1/4 flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Room</label>
                        <select
                            value={selectedRoomId}
                            onChange={e => setSelectedRoomId(e.target.value)}
                            disabled={loadingRooms || !selectedPropertyId}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#004e59] focus:border-[#004e59] disabled:bg-gray-50 h-[38px] bg-white cursor-pointer"
                        >
                            <option value="">Select a Room</option>
                            <option value="all">All Rooms</option>
                            {rooms?.map(r => (
                                <option key={r.id} value={r.id}>{r.room_number} &mdash; {r.room_type}</option>
                            ))}
                        </select>
                    </div>

                    {/* 3. Date Range Pickers & inline Search */}
                    <div className="w-full md:w-2/4 flex flex-col gap-1.5" ref={datePickerRef}>
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
                                            {startDate ? fmtDate(startDate) : "Start d..."}
                                        </span>
                                        <span className="text-gray-300 font-bold">&rarr;</span>
                                        <span className={endDate ? "text-gray-800 font-medium" : "text-gray-400"}>
                                            {endDate ? fmtDate(endDate) : "End date"}
                                        </span>
                                    </div>
                                    <FiCalendar className="text-gray-400" size={14} />
                                </div>
                                
                                {isDatePickerOpen && (
                                    <div className="absolute z-50 mt-2.5 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden top-full left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-0 w-[92vw] max-w-[340px] md:max-w-none md:w-max hms-daterange-popover">
                                        {/* Left sidebar: Presets */}
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
                                        
                                        {/* Right side: Inline Calendar */}
                                        <div className="p-3 bg-white hms-daterange-picker-picker" onClick={(e) => e.stopPropagation()}>
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
                                                            {/* Previous arrows on the first month (index 0) */}
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
                                                            
                                                            {/* Centered Month Name and Year */}
                                                            <div className="w-full text-center text-xs font-bold text-gray-700">
                                                                {monthName} {year}
                                                            </div>
                                                            
                                                            {/* Next arrows on the second month (index 1) or on mobile (when only 1 month shown) */}
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
                                className="flex items-center justify-center p-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg font-bold text-xs transition shadow-sm h-[38px] w-[38px] cursor-pointer"
                                title="Reset Filters"
                            >
                                <FiRefreshCw size={14} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* View selectors - Hidden when printing */}
            <div className="flex justify-between items-center print:hidden">
                <div className="flex bg-gray-100 p-0.5 rounded-lg border">
                    <button
                        onClick={() => setActiveView('details')}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-bold text-xs transition ${
                            activeView === 'details'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <FiFileText size={13} /> Details View
                    </button>
                    <button
                        onClick={() => setActiveView('summary')}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md font-bold text-xs transition ${
                            activeView === 'summary'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <FiGrid size={13} /> Summary View
                    </button>
                </div>
                
                <div className="text-xs text-gray-400 font-medium">
                    {activeReportTab === 'room-revenue' ? (
                        <>Found <strong className="text-gray-700">{transactions.length}</strong> transactions</>
                    ) : (
                        <>Found <strong className="text-gray-700">{filteredRoomsList.length}</strong> rooms</>
                    )}
                </div>
            </div>

            {/* TAB CONTENT: ROOM REVENUE */}
            {activeReportTab === 'room-revenue' && (
                <div className="space-y-6" id="hms-report-print-area">
                    
                    {/* View: Details View */}
                    {activeView === 'details' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
                            {loadingReport ? (
                                <div className="py-20 flex justify-center"><LoadingSpinner /></div>
                            ) : transactions.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#004e59]">
                                        <FiInfo size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-700">No Transactions Found</h3>
                                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Select a room and valid date range to search transaction details.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-100 border-b border-gray-250 print:bg-transparent">
                                                <tr>
                                                    {['SL', 'Date', 'Booking Ref', 'Guest Name', 'Room No', 'Stay Period', 'Nights', 'Service Name', 'Charge', 'VAT Amount', 'Service Charge', 'Total Amount'].map(h => (
                                                        <th key={h} className={`px-4 py-3 font-bold text-gray-800 uppercase tracking-wider ${
                                                            h === 'Nights' ? 'text-center' : ['Charge', 'VAT Amount', 'Service Charge', 'Total Amount'].includes(h) ? 'text-right' : ''
                                                        }`}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {paginatedTransactions.map((tx, idx) => (
                                                    <tr key={tx.id || idx} className="hover:bg-gray-50/50 print:hover:bg-transparent">
                                                        <td className="px-4 py-3 text-gray-800 font-medium">{(currentPage - 1) * pageSize + idx + 1}</td>
                                                        <td className="px-4 py-3 text-gray-850 font-medium whitespace-nowrap">{fmtDate(tx.date)}</td>
                                                        <td className="px-4 py-3 font-mono font-bold text-blue-800">{tx.booking_reference}</td>
                                                        <td className="px-4 py-3 text-gray-955 font-bold">{tx.guest_name || 'Guest'}</td>
                                                        <td className="px-4 py-3 text-gray-850 font-semibold">{tx.room_number || '—'}</td>
                                                        <td className="px-4 py-3 text-gray-850 font-medium whitespace-nowrap">{tx.check_in_date && tx.check_out_date ? `${fmtDate(tx.check_in_date)} - ${fmtDate(tx.check_out_date)}` : '—'}</td>
                                                        <td className="px-4 py-3 text-gray-850 font-bold text-center">{tx.stay_nights ?? '—'}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-[9px] font-bold uppercase">{tx.service_name}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-gray-850 font-medium">৳{fmt(tx.charge)}</td>
                                                        <td className="px-4 py-3 text-right text-gray-700 font-medium">৳{fmt(tx.vat_amount)}</td>
                                                        <td className="px-4 py-3 text-right text-gray-700 font-medium">{tx.service_charge > 0 ? `৳${fmt(tx.service_charge)}` : '—'}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-gray-955">৳{fmt(tx.total_amount)}</td>
                                                    </tr>
                                                ))}
                                                {/* Total summary row */}
                                                <tr className="bg-gray-50 font-bold border-t-2 border-gray-300 print:bg-transparent">
                                                    <td colSpan={8} className="px-4 py-4 text-gray-900 font-extrabold text-right">Total</td>
                                                    <td className="px-4 py-4 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.charge)}</td>
                                                    <td className="px-4 py-4 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.vat)}</td>
                                                    <td className="px-4 py-4 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.serviceCharge)}</td>
                                                    <td className="px-4 py-4 text-right text-[#004e59] text-sm font-black">৳{fmt(reportTotals.total)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls - Hidden when printing */}
                                    {totalPages > 1 && (
                                        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">Show</span>
                                                <select
                                                    value={pageSize}
                                                    onChange={e => {
                                                        setPageSize(parseInt(e.target.value));
                                                        setCurrentPage(1);
                                                    }}
                                                    className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none bg-white"
                                                >
                                                    <option value={10}>10</option>
                                                    <option value={25}>25</option>
                                                    <option value={50}>50</option>
                                                    <option value={100}>100</option>
                                                </select>
                                                <span className="text-xs text-gray-500">per page</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <FiChevronLeft size={14} />
                                                </button>
                                                {Array.from({ length: totalPages }).map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentPage(i + 1)}
                                                        className={`px-3 py-1 text-xs rounded font-bold ${
                                                            currentPage === i + 1
                                                                ? 'bg-[#004e59] text-white'
                                                                : 'border border-gray-200 hover:bg-gray-50 text-gray-600'
                                                        }`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <FiChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* View: Summary View (Printable Card Layout) */}
                    {activeView === 'summary' && (
                        <div className="space-y-6">
                            {/* Toolbar Buttons - Hidden when printing */}
                            <div className="flex justify-end gap-2.5 print:hidden">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#004e59] hover:bg-[#003d46] text-white rounded-lg font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                                >
                                    <FiPrinter size={14} /> Print
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                                >
                                    <FiDownload size={14} /> Save PDF
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                                >
                                    <FiFileText size={14} /> Export Excel
                                </button>
                            </div>

                            {/* Report Document Frame */}
                            <div className="bg-white p-8 md:p-12 border border-dashed border-gray-300 rounded-xl max-w-5xl mx-auto shadow-sm relative print:border-none print:shadow-none print:p-0">
                                {/* Print icon top-right - Hidden when printing */}
                                <button 
                                    onClick={handlePrint}
                                    className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-all print:hidden"
                                    title="Print Report"
                                >
                                    <FiPrinter size={16} />
                                </button>

                                {/* Document Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 pb-6 mb-6 gap-6">
                                    {/* Left: Logo */}
                                    <div>
                                        <img src={settings?.site_logo || "/logo.png"} alt="Logo" className="h-10 object-contain" />
                                    </div>

                                    {/* Right: Company Info */}
                                    <div className="text-right text-xs text-gray-700 mt-1 space-y-0.5">
                                        <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-tight">{settings?.site_name || 'KeyHost 24'}</h3>
                                        <p className="text-[10px] text-gray-600 mt-0.5">Address: {settings?.business_address || 'Gazipur'}</p>
                                        <p className="text-[10px] text-gray-600">Mobile: {settings?.contact_phone || '+8801730353300'}</p>
                                        <p className="text-[10px] text-gray-600">{settings?.contact_email || 'info@keyhost24.com'}</p>
                                    </div>
                                </div>

                                {/* Center: Document Title */}
                                <div className="text-center my-6">
                                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Room Revenue Report</h2>
                                    <p className="text-xs text-gray-700 mt-1.5 font-bold">
                                        {(searchParams.startDate && searchParams.endDate) 
                                            ? `${fmtDate(searchParams.startDate)} to ${fmtDate(searchParams.endDate)}` 
                                            : 'All Dates'}
                                    </p>
                                </div>

                                {/* Document Table */}
                                <div className="overflow-x-auto mt-8">
                                    <table className="w-full text-xs text-left border-collapse">
                                        <thead>
                                            <tr className="border-y border-gray-300 bg-gray-100/70 print:bg-transparent">
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-left">SL</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-left">Date</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-left">Booking Ref</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-left">Guest Name</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-left">Room No</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-left">Stay Period</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-center">Nights</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-left">Service</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-right">Charge</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-right">VAT Amount</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-right">Service Charge</th>
                                                <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-right">Total Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {transactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={12} className="px-3 py-12 text-center text-gray-600 font-medium">
                                                        No transactions found for the selected filter criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                transactions.map((tx, idx) => (
                                                    <tr key={tx.id || idx} className="hover:bg-gray-50/40 print:hover:bg-transparent">
                                                        <td className="px-3 py-2.5 text-gray-700">{idx + 1}</td>
                                                        <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{fmtDate(tx.date)}</td>
                                                        <td className="px-3 py-2.5 font-mono font-bold text-blue-800">{tx.booking_reference}</td>
                                                        <td className="px-3 py-2.5 text-gray-900 font-bold">{tx.guest_name || 'Guest'}</td>
                                                        <td className="px-3 py-2.5 text-gray-850 font-medium">{tx.room_number || '—'}</td>
                                                        <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{tx.check_in_date && tx.check_out_date ? `${fmtDate(tx.check_in_date)} - ${fmtDate(tx.check_out_date)}` : '—'}</td>
                                                        <td className="px-3 py-2.5 text-gray-800 font-bold text-center">{tx.stay_nights ?? '—'}</td>
                                                        <td className="px-3 py-2.5">
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-[9px] font-bold uppercase">{tx.service_name || 'ROOM CHARGE'}</span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-right text-gray-800 font-medium">৳{fmt(tx.charge)}</td>
                                                        <td className="px-3 py-2.5 text-right text-gray-700 font-medium">৳{fmt(tx.vat_amount)}</td>
                                                        <td className="px-3 py-2.5 text-right text-gray-700 font-medium">{tx.service_charge > 0 ? `৳${fmt(tx.service_charge)}` : '—'}</td>
                                                        <td className="px-3 py-2.5 text-right font-extrabold text-gray-950">৳{fmt(tx.total_amount)}</td>
                                                    </tr>
                                                ))
                                            )}
                                            {/* Total row */}
                                            <tr className="bg-gray-50 font-bold border-t border-gray-300 print:bg-transparent">
                                                <td colSpan={8} className="px-3 py-3 text-gray-900 font-extrabold text-right">Total</td>
                                                <td className="px-3 py-3 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.charge)}</td>
                                                <td className="px-3 py-3 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.vat)}</td>
                                                <td className="px-3 py-3 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.serviceCharge)}</td>
                                                <td className="px-3 py-3 text-right text-[#004e59] text-xs font-black">৳{fmt(reportTotals.total)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}

            {/* TAB CONTENT: ROOM WISE REVENUE */}
            {activeReportTab === 'room-wise-revenue' && (
                <div className="space-y-6" id="hms-report-print-area">
                    {activeView === 'details' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
                            {loadingReport ? (
                                <div className="py-20 flex justify-center"><LoadingSpinner /></div>
                            ) : filteredRoomsList.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#004e59]">
                                        <FiInfo size={24} />
                                    </div>
                                    <h3 className="font-bold text-gray-700">No Rooms Found</h3>
                                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Verify your property configurations or list rooms in inventory.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-100 border-b border-gray-250 print:bg-transparent">
                                            <tr>
                                                {['SL', 'Room No', 'Room Type', 'Total Stays', 'Total Charge', 'VAT Amount', 'Service Charge', 'Total Revenue'].map(h => (
                                                    <th key={h} className={`px-4 py-3 font-bold text-gray-800 uppercase tracking-wider ${
                                                        ['Total Stays', 'Total Charge', 'VAT Amount', 'Service Charge', 'Total Revenue'].includes(h) ? 'text-right' : ''
                                                    }`}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredRoomsList.map((room, idx) => (
                                                <tr key={room.room_id || idx} className="hover:bg-gray-50/50 print:hover:bg-transparent">
                                                    <td className="px-4 py-3 text-gray-800 font-medium">{idx + 1}</td>
                                                    <td className="px-4 py-3 text-gray-950 font-bold">Room {room.room_number}</td>
                                                    <td className="px-4 py-3 text-gray-800 font-medium">{room.room_type}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-gray-900">{room.total_bookings} stays</td>
                                                    <td className="px-4 py-3 text-right text-gray-850 font-medium">৳{fmt(room.total_charge)}</td>
                                                    <td className="px-4 py-3 text-right text-gray-700 font-medium">৳{fmt(room.total_vat)}</td>
                                                    <td className="px-4 py-3 text-right text-gray-700 font-medium">{room.total_service_charge > 0 ? `৳${fmt(room.total_service_charge)}` : '—'}</td>
                                                    <td className="px-4 py-3 text-right font-extrabold text-gray-950">৳{fmt(room.total_revenue)}</td>
                                                </tr>
                                            ))}
                                            {/* Total summary row */}
                                            <tr className="bg-gray-50 font-bold border-t-2 border-gray-300 print:bg-transparent">
                                                <td colSpan={3} className="px-4 py-4 text-gray-900 font-extrabold text-right">Total</td>
                                                <td className="px-4 py-4 text-right text-gray-950 font-bold">{reportTotals.bookings} stays</td>
                                                <td className="px-4 py-4 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.charge)}</td>
                                                <td className="px-4 py-4 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.vat)}</td>
                                                <td className="px-4 py-4 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.serviceCharge)}</td>
                                                <td className="px-4 py-4 text-right text-[#004e59] text-sm font-black">৳{fmt(reportTotals.total)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                        {activeView === 'summary' && (
                            <div className="space-y-6">
                                {/* Toolbar Buttons - Hidden when printing */}
                                <div className="flex justify-end gap-2.5 print:hidden">
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#004e59] hover:bg-[#003d46] text-white rounded-lg font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                                    >
                                        <FiPrinter size={14} /> Print
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                                    >
                                        <FiDownload size={14} /> Save PDF
                                    </button>
                                    <button
                                        onClick={handleExportExcelWise}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                                    >
                                        <FiFileText size={14} /> Export Excel
                                    </button>
                                </div>

                                {/* Report Document Frame */}
                                <div className="bg-white p-8 md:p-12 border border-dashed border-gray-300 rounded-xl max-w-5xl mx-auto shadow-sm relative print:border-none print:shadow-none print:p-0">
                                    {/* Print icon top-right - Hidden when printing */}
                                    <button 
                                        onClick={handlePrint}
                                        className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-all print:hidden cursor-pointer"
                                        title="Print Report"
                                    >
                                        <FiPrinter size={16} />
                                    </button>

                                    {/* Document Header */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-150 pb-6 mb-6 gap-6">
                                        {/* Left: Logo */}
                                        <div>
                                            <img src={settings?.site_logo || "/logo.png"} alt="Logo" className="h-10 object-contain" />
                                        </div>

                                        {/* Right: Company Info */}
                                        <div className="text-right text-xs text-gray-700 mt-1 space-y-0.5">
                                            <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-tight">{settings?.site_name || 'KeyHost 24'}</h3>
                                            <p className="text-[10px] text-gray-600 mt-0.5">Address: {settings?.business_address || 'Gazipur'}</p>
                                            <p className="text-[10px] text-gray-600">Mobile: {settings?.contact_phone || '+8801730353300'}</p>
                                            <p className="text-[10px] text-gray-600">{settings?.contact_email || 'info@keyhost24.com'}</p>
                                        </div>
                                    </div>

                                    {/* Center: Document Title */}
                                    <div className="text-center my-6">
                                        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Room Wise Revenue Report</h2>
                                        <p className="text-xs text-gray-700 mt-1.5 font-bold">
                                            {(searchParams.startDate && searchParams.endDate) 
                                                ? `${fmtDate(searchParams.startDate)} to ${fmtDate(searchParams.endDate)}` 
                                                : 'All Dates'}
                                        </p>
                                    </div>

                                    {/* Document Table */}
                                    <div className="overflow-x-auto mt-8">
                                        <table className="w-full text-xs text-left border-collapse">
                                            <thead>
                                                <tr className="border-y border-gray-350 bg-gray-100/70 print:bg-transparent">
                                                    <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-left">SL</th>
                                                    <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-left">Room No</th>
                                                    <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-left">Room Type</th>
                                                    <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-right">Total Stays</th>
                                                    <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-right">Total Charge</th>
                                                    <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-right">VAT Amount</th>
                                                    <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-right">Service Charge</th>
                                                    <th className="px-3 py-3 font-bold text-gray-800 uppercase tracking-wider text-right">Total Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredRoomsList.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} className="px-3 py-12 text-center text-gray-500 font-medium">
                                                            No rooms found for the selected filter criteria.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredRoomsList.map((room, idx) => (
                                                        <tr key={room.room_id || idx} className="hover:bg-gray-50/40 print:hover:bg-transparent">
                                                            <td className="px-3 py-2.5 text-gray-700">{idx + 1}</td>
                                                            <td className="px-3 py-2.5 text-gray-900 font-bold">Room {room.room_number}</td>
                                                            <td className="px-3 py-2.5 text-gray-800 font-medium">{room.room_type}</td>
                                                            <td className="px-3 py-2.5 text-right font-bold text-gray-900">{room.total_bookings} stays</td>
                                                            <td className="px-3 py-2.5 text-right text-gray-850 font-medium">৳{fmt(room.total_charge)}</td>
                                                            <td className="px-3 py-2.5 text-right text-gray-700 font-medium">৳{fmt(room.total_vat)}</td>
                                                            <td className="px-3 py-2.5 text-right text-gray-700 font-medium">{room.total_service_charge > 0 ? `৳${fmt(room.total_service_charge)}` : '—'}</td>
                                                            <td className="px-3 py-2.5 text-right font-extrabold text-gray-950">৳{fmt(room.total_revenue)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                                {/* Total row */}
                                                <tr className="bg-gray-50 font-bold border-t border-gray-350 print:bg-transparent">
                                                    <td colSpan={3} className="px-3 py-3 text-gray-900 font-extrabold text-right">Total</td>
                                                    <td className="px-3 py-3 text-right text-gray-955 font-bold">{reportTotals.bookings} stays</td>
                                                    <td className="px-3 py-3 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.charge)}</td>
                                                    <td className="px-3 py-3 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.vat)}</td>
                                                    <td className="px-3 py-3 text-right text-gray-900 font-extrabold">৳{fmt(reportTotals.serviceCharge)}</td>
                                                    <td className="px-3 py-3 text-right text-[#004e59] text-xs font-black">৳{fmt(reportTotals.total)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            {/* Print style overrides */}
            <style>{`
                @media print {
                    body > *:not(#root) {
                        display: none !important;
                    }
                    aside, header, button, .print-hidden, .bg-black.bg-opacity-50, [class*="bg-opacity-"] {
                        display: none !important;
                    }
                    html, body, #root, #root > div, main, .grid, [class*="col-span-"] {
                        position: static !important;
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    main {
                        padding: 20px !important;
                    }
                    #hms-report-print-area {
                        position: static !important;
                        width: 100% !important;
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border-bottom: 1px solid #ddd !important;
                        padding: 8px !important;
                    }
                    thead {
                        display: table-header-group !important;
                    }
                    tr {
                        page-break-inside: avoid !important;
                    }
                }

                /* Custom datepicker popover styling */
                .hms-daterange-popover {
                    filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
                }
                .hms-daterange-popover::before {
                    content: '';
                    position: absolute;
                    top: -6px;
                    left: 50%;
                    transform: translateX(-50%) rotate(45deg);
                    width: 12px;
                    height: 12px;
                    background: #f9fafb; /* Matches presets sidebar horizontal container */
                    border-top: 1px solid rgba(229, 231, 235, 1);
                    border-left: 1px solid rgba(229, 231, 235, 1);
                    z-index: 10;
                }
                @media (min-width: 768px) {
                    .hms-daterange-popover::before {
                        left: auto;
                        right: 24px;
                        transform: rotate(45deg);
                        background: #ffffff; /* On desktop, right side of popover is the calendar (white bg) */
                    }
                }

                .hms-daterange-picker-picker .react-datepicker {
                    border: none !important;
                    font-family: inherit !important;
                    background: transparent !important;
                    display: flex !important;
                }
                .hms-daterange-picker-picker .react-datepicker__header {
                    background: transparent !important;
                    border-bottom: none !important;
                    padding-top: 8px !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day-name {
                    color: #9ca3af !important;
                    font-weight: 600 !important;
                    width: 2.25rem !important;
                    line-height: 2.25rem !important;
                    margin: 0.125rem !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day {
                    width: 2.25rem !important;
                    line-height: 2.25rem !important;
                    margin: 0.125rem !important;
                    border-radius: 50% !important;
                    color: #374151 !important;
                    font-weight: 550 !important;
                    transition: all 0.15s ease !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day:hover {
                    background-color: #f3f4f6 !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--outside-month {
                    color: #d1d5db !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--today {
                    border: 1px solid #004e59 !important;
                    border-radius: 50% !important;
                    background-color: transparent !important;
                    color: #004e59 !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--today.react-datepicker__day--selected,
                .hms-daterange-picker-picker .react-datepicker__day--today.react-datepicker__day--range-start,
                .hms-daterange-picker-picker .react-datepicker__day--today.react-datepicker__day--range-end {
                    background-color: #004e59 !important;
                    color: white !important;
                    border: none !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--selected,
                .hms-daterange-picker-picker .react-datepicker__day--range-start,
                .hms-daterange-picker-picker .react-datepicker__day--range-end {
                    background-color: #004e59 !important;
                    color: white !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--in-selecting-range,
                .hms-daterange-picker-picker .react-datepicker__day--in-range {
                    background-color: rgba(0, 78, 89, 0.08) !important;
                    color: #004e59 !important;
                    border-radius: 0 !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--range-start {
                    border-top-left-radius: 50% !important;
                    border-bottom-left-radius: 50% !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--range-end {
                    border-top-right-radius: 50% !important;
                    border-bottom-right-radius: 50% !important;
                }
                .hms-daterange-picker-picker .react-datepicker__day--range-start.react-datepicker__day--range-end {
                    border-radius: 50% !important;
                }
                .hms-daterange-picker-picker .react-datepicker__month-container {
                    padding: 0 8px !important;
                }
                .hms-daterange-picker-picker .react-datepicker__navigation {
                    display: none !important;
                }
            `}</style>
        </div>
    );
};

export default HMSRoomRevenueReport;
