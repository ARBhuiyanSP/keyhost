import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiHome, FiUser, FiCalendar, FiDollarSign, 
  FiInfo, FiRotateCw, FiCheck, FiX, FiClock, FiMoreVertical,
  FiFilter, FiMessageSquare, FiExternalLink, FiDownload, FiXCircle,
  FiAlertTriangle
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PaymentManagementModal from '../../components/property-owner/PaymentManagementModal';

const HMSReservations = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [viewTab, setViewTab] = useState('all'); // 'all', 'arrivals', 'in_house', 'departures'
    
    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [reservationForPayment, setReservationForPayment] = useState(null);

    // Refund Modal State
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [reservationForRefund, setReservationForRefund] = useState(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('Manual Refund');

    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Form state for manual reservation
    const [formData, setFormData] = useState({
        property_id: '',
        hms_room_id: '',
        check_in_date: null,
        check_out_date: null,
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        total_amount: '',
        payment_status: 'pending',
        special_requests: '',
        source: 'Walk-in'
    });

    // Fetch HMS properties
    const { data: properties, isLoading: isLoadingProperties } = useQuery(
        'hms-properties',
        async () => {
            const response = await api.get('/property-owner/properties');
            return response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
        }
    );

    useEffect(() => {
        if (properties?.length > 0) {
            const savedId = localStorage.getItem('hms_selected_property_id');
            const parsedSavedId = savedId ? parseInt(savedId) : null;
            const exists = properties.some(p => p.id === parsedSavedId);
            
            if (exists && parsedSavedId) {
                setSelectedPropertyId(parsedSavedId);
            } else {
                setSelectedPropertyId(properties[0].id);
                localStorage.setItem('hms_selected_property_id', properties[0].id);
                localStorage.setItem('hms_selected_property_type', properties[0].property_type || 'hotel');
            }
        }
    }, [properties]);

    useEffect(() => {
        const handlePropertyChange = () => {
            const savedId = localStorage.getItem('hms_selected_property_id');
            if (savedId) {
                setSelectedPropertyId(parseInt(savedId));
            }
        };
        window.addEventListener('hmsPropertyChange', handlePropertyChange);
        return () => window.removeEventListener('hmsPropertyChange', handlePropertyChange);
    }, []);

    const handlePropertyChange = (val) => {
        const newId = parseInt(val);
        setSelectedPropertyId(newId);
        localStorage.setItem('hms_selected_property_id', newId);
        const prop = properties?.find(p => p.id === newId);
        if (prop) {
            localStorage.setItem('hms_selected_property_type', prop.property_type || 'hotel');
            window.dispatchEvent(new Event('hmsPropertyChange'));
        }
    };

    // Fetch reservations
    const { data: reservations, isLoading: isLoadingReservations, refetch } = useQuery(
        ['hms-reservations', selectedPropertyId],
        () => api.get(`/property-owner/hms/reservations/${selectedPropertyId}`),
        {
            enabled: !!selectedPropertyId,
            select: (response) => response.data?.data?.reservations || []
        }
    );

    // Fetch rooms for manual entry
    const { data: rooms } = useQuery(
        ['hms-rooms', selectedPropertyId],
        () => api.get(`/property-owner/hms/rooms/${selectedPropertyId}`),
        {
            enabled: isModalOpen && !!selectedPropertyId,
            select: (response) => response.data?.data?.rooms || []
        }
    );

    // Fetch blocked dates for the selected room
    const { data: blockedDatesData } = useQuery(
        ['hms-blocked-dates', selectedPropertyId, formData.hms_room_id],
        async () => {
            if (!formData.hms_room_id) return { blockedDates: [], checkInDates: [] };
            const response = await api.get(`/properties/${selectedPropertyId}/blocked-dates`, {
                params: { hms_room_id: formData.hms_room_id }
            });
            return response.data?.data || { blockedDates: [], checkInDates: [] };
        },
        {
            enabled: isModalOpen && !!selectedPropertyId && !!formData.hms_room_id
        }
    );

    const createMutation = useMutation(
        (data) => {
            const formattedData = {
                ...data,
                property_id: selectedPropertyId,
                check_in_date: data.check_in_date ? format(data.check_in_date, 'yyyy-MM-dd') : null,
                check_out_date: data.check_out_date ? format(data.check_out_date, 'yyyy-MM-dd') : null
            };
            return api.post('/property-owner/hms/reservations', formattedData);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-reservations', selectedPropertyId]);
                queryClient.invalidateQueries(['hms-rooms', selectedPropertyId]);
                showSuccess('Reservation created successfully');
                setIsModalOpen(false);
                resetForm();
            },
            onError: (error) => showError(error.response?.data?.message || 'Failed to create reservation')
        }
    );

    const acceptMutation = useMutation(
        (id) => api.patch(`/property-owner/bookings/${id}/confirm`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-reservations', selectedPropertyId]);
                queryClient.invalidateQueries(['hms-rooms', selectedPropertyId]);
                showSuccess('Booking request accepted successfully');
            },
            onError: (error) => showError(error.response?.data?.message || 'Failed to accept booking request')
        }
    );

    const statusMutation = useMutation(
        ({ id, status }) => api.patch(`/property-owner/hms/reservations/${id}/status`, { status }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-reservations', selectedPropertyId]);
                queryClient.invalidateQueries(['hms-rooms', selectedPropertyId]);
                showSuccess('Status updated successfully');
            },
            onError: (error) => showError('Failed to update status')
        }
    );

    const refundMutation = useMutation(
        ({ id, amount, reason }) => api.post(`/property-owner/hms/bookings/${id}/refund`, { refund_amount: amount, reason }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-reservations', selectedPropertyId]);
                showSuccess('Refund processed and synced to accounts');
                setIsRefundModalOpen(false);
                setReservationForRefund(null);
                setRefundAmount('');
            },
            onError: (error) => showError(error.response?.data?.message || 'Failed to process refund')
        }
    );

    const resetForm = () => {
        setFormData({
            hms_room_id: '',
            check_in_date: null,
            check_out_date: null,
            guest_name: '',
            guest_email: '',
            guest_phone: '',
            total_amount: '',
            payment_status: 'pending',
            special_requests: '',
            source: 'Walk-in'
        });
    };

    const getSuggestedRefund = (res) => {
        if (!res) return 0;
        const checkIn = new Date(res.check_in_date);
        const referenceTime = res.cancelled_at ? new Date(res.cancelled_at) : new Date();
        const diffHours = (checkIn - referenceTime) / (1000 * 60 * 60);
        
        if (res.is_non_refundable || diffHours < 48) {
            return 0;
        }
        return res.total_amount;
    };

    // Calculate total amount automatically
    useEffect(() => {
        if (formData.check_in_date && formData.check_out_date && formData.hms_room_id) {
            const selectedRoom = rooms?.find(r => r.id === parseInt(formData.hms_room_id));
            if (selectedRoom) {
                const diffTime = Math.abs(formData.check_out_date - formData.check_in_date);
                const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const total = nights * selectedRoom.price;
                setFormData(prev => ({ ...prev, total_amount: total }));
            }
        }
    }, [formData.check_in_date, formData.check_out_date, formData.hms_room_id, rooms]);

    const handleStatusChange = (id, status) => {
        const res = reservations?.find(r => r.id === id);
        
        if (status === 'checked_out') {
            // Check for unpaid extras or unbalanced folio
            const total = parseFloat(res.total_amount) + parseFloat(res.extra_billing_amount || 0);
            const paid = parseFloat(res.paid_amount || 0);
            const unpaidFood = res.unpaid_food_count > 0;
            const hasExtraBills = res.extra_bills_count > 0;

            if (unpaidFood || hasExtraBills || (total - paid > 1)) {
                if (window.confirm(`This guest has unpaid food orders or extra service charges. You must settle the bill before checkout. Go to Billing page?`)) {
                    navigate(`/property-owner/hms/billing?bookingId=${id}&propertyId=${selectedPropertyId}`);
                }
                return;
            }
        }

        if (window.confirm(`Are you sure you want to change status to ${status}?`)) {
            statusMutation.mutate({ id, status });
        }
    };

    const handleAcceptBooking = (id) => {
        if (window.confirm('Are you sure you want to accept this booking request?')) {
            acceptMutation.mutate(id);
        }
    };

    const filteredReservations = (reservations || []).filter(res => {
        const guestName = (res.guest_name || `${res.guest_first_name} ${res.guest_last_name}`).toLowerCase();
        const matchesSearch = guestName.includes(searchQuery.toLowerCase()) || 
                             res.booking_reference.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesTab = true;
        const resCheckIn = format(new Date(res.check_in_date), 'yyyy-MM-dd');
        const resCheckOut = format(new Date(res.check_out_date), 'yyyy-MM-dd');

        if (viewTab === 'arrivals') {
            matchesTab = resCheckIn === today && res.status === 'confirmed';
        } else if (viewTab === 'in_house') {
            matchesTab = res.status === 'checked_in';
        } else if (viewTab === 'departures') {
            matchesTab = resCheckOut === today && res.status === 'checked_in';
        }

        const matchesStatus = !statusFilter || res.status === statusFilter;
        return matchesSearch && matchesStatus && matchesTab;
    });

    const counts = {
        all: (reservations || []).length,
        arrivals: (reservations || []).filter(r => format(new Date(r.check_in_date), 'yyyy-MM-dd') === today && r.status === 'confirmed').length,
        in_house: (reservations || []).filter(r => r.status === 'checked_in').length,
        departures: (reservations || []).filter(r => format(new Date(r.check_out_date), 'yyyy-MM-dd') === today && r.status === 'checked_in').length
    };

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            request_accepted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            confirmed: 'bg-green-100 text-green-700 border-green-200',
            checked_in: 'bg-blue-100 text-blue-700 border-blue-200',
            checked_out: 'bg-gray-100 text-gray-700 border-gray-200',
            cancelled: 'bg-red-100 text-red-700 border-red-200'
        };
        return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const selectedProperty = properties?.find(p => p.id === selectedPropertyId);
    const propertyType = selectedProperty?.property_type || 'hotel';

    const getTerminology = (propType) => {
        const type = (propType || '').toLowerCase();
        if (type.includes('apartment') || type.includes('flat') || type.includes('building')) {
            return {
                room: 'Flat',
                rooms: 'Flats',
                roomNo: 'Flat No.',
                roomType: 'Flat Type',
                roomSingular: 'flat'
            };
        } else if (type.includes('villa') || type.includes('house') || type.includes('resort')) {
            return {
                room: 'Unit',
                rooms: 'Units',
                roomNo: 'Unit No.',
                roomType: 'Unit Type',
                roomSingular: 'unit'
            };
        }
        return {
            room: 'Room',
            rooms: 'Rooms',
            roomNo: 'Room No.',
            roomType: 'Room Type',
            roomSingular: 'room'
        };
    };
    
    const terms = getTerminology(propertyType);

    if (isLoadingProperties) return <LoadingSpinner />;

    return (
        <div className="p-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-screen">
            {/* Header Area */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reservation Management</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <FiHome />
                        <span>Property:</span>
                        <select 
                            value={selectedPropertyId || ''} 
                            onChange={(e) => handlePropertyChange(e.target.value)}
                            className="bg-transparent font-bold text-primary-600 border-none p-0 focus:ring-0 cursor-pointer"
                        >
                            {properties?.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#004e59] text-white rounded-lg font-bold text-sm shadow-md hover:bg-[#003d4d] transition"
                    >
                        <FiPlus />
                        Add New Reservation
                    </button>
                    <button className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg shadow-sm hover:bg-gray-50">
                        <FiDownload />
                    </button>
                </div>
            </div>

            {/* Quick Status Tabs */}
            <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
                {[
                    { id: 'all', label: 'All Reservations', count: counts.all, color: 'text-gray-600', bg: 'bg-gray-100' },
                    { id: 'arrivals', label: 'Arrivals (Today)', count: counts.arrivals, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { id: 'in_house', label: 'In-House Guest', count: counts.in_house, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { id: 'departures', label: 'Departures (Today)', count: counts.departures, color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setViewTab(tab.id)}
                        className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            viewTab === tab.id 
                                ? 'bg-[#004e59] text-white shadow-lg shadow-[#004e59]/20' 
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] ${viewTab === tab.id ? 'bg-white/20 text-white' : `${tab.bg} ${tab.color}`}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search guest name or booking ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                    />
                </div>

                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 focus:ring-2 focus:ring-[#004e59]/20"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="request_accepted">Request Accepted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                <button 
                    onClick={() => refetch()}
                    className="p-2.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
                    title="Refresh list"
                >
                    <FiRotateCw className={isLoadingReservations ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Reservations Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest & Reference</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stay Dates</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{terms.room}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoadingReservations ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center"><LoadingSpinner /></td>
                                </tr>
                            ) : filteredReservations.length > 0 ? (
                                filteredReservations.map((res) => (
                                    <tr key={res.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#004e59]/10 rounded-full flex items-center justify-center text-[#004e59] font-bold">
                                                    {(res.guest_name || res.guest_first_name)?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{res.guest_name || (res.guest_first_name ? `${res.guest_first_name} ${res.guest_last_name}` : 'Guest')}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <span className="font-mono">{res.booking_reference}</span>
                                                        {res.guest_id && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">Web Guest</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center gap-1"><FiCalendar className="text-gray-400" size={12}/> {format(new Date(res.check_in_date), 'MMM dd')} - {format(new Date(res.check_out_date), 'MMM dd, yyyy')}</div>
                                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1"><FiClock size={12}/> {res.nights} Nights</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-bold text-gray-800">{terms.room} {res.room_number || 'N/A'}</div>
                                                <div className="text-xs text-gray-500">{res.room_type}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">BDT {res.total_amount.toLocaleString()}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`text-[10px] font-bold uppercase ${res.payment_status === 'paid' ? 'text-green-500' : 'text-red-400'}`}>
                                                    {res.payment_status}
                                                </div>
                                                {res.status !== 'checked_out' && (res.unpaid_food_count > 0 || res.extra_bills_count > 0) && (
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100" title="Unpaid food or service charges">
                                                        <FiAlertTriangle size={10} /> BILLING DUE
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(res.status)} uppercase`}>
                                                {res.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                                {res.source === 'Walk-in' ? <FiUser size={14}/> : <FiExternalLink size={14}/>}
                                                {res.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {res.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleAcceptBooking(res.id)}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                        title="Accept Booking Request"
                                                    >
                                                        <FiCheck size={18} />
                                                    </button>
                                                )}
                                                {res.status === 'confirmed' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(res.id, 'checked_in')}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Check In"
                                                    >
                                                        <FiCheck size={18} />
                                                    </button>
                                                )}
                                                {res.status === 'checked_in' && (
                                                    <button 
                                                        onClick={() => handleStatusChange(res.id, 'checked_out')}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                        title="Check Out"
                                                    >
                                                        <FiExternalLink size={18} />
                                                    </button>
                                                )}
                                                {(res.status === 'pending' || res.status === 'confirmed') && (
                                                    <button 
                                                        onClick={() => handleStatusChange(res.id, 'cancelled')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Cancel"
                                                    >
                                                        <FiX size={18} />
                                                    </button>
                                                )}
                                                {res.status === 'cancelled' && res.payment_status === 'paid' && (
                                                     <button 
                                                         onClick={() => {
                                                             const suggested = getSuggestedRefund(res);
                                                             setReservationForRefund(res);
                                                             setRefundAmount(suggested);
                                                             setRefundReason(suggested === res.total_amount ? 'Full Refund (Policy Compliant)' : 'Partial/No Refund (Policy Deduction)');
                                                             setIsRefundModalOpen(true);
                                                         }}
                                                         className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                                         title="Process Refund"
                                                     >
                                                         <FiRotateCw size={18} />
                                                     </button>
                                                 )}
                                                 {res.payment_status === 'pending' && (
                                                    <button 
                                                        onClick={() => {
                                                            setReservationForPayment(res);
                                                            setIsPaymentModalOpen(true);
                                                        }}
                                                        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                                                        title="Process Payment"
                                                    >
                                                        <FiDollarSign className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-200 rounded-lg transition-all">
                                                    <FiMoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                                <FiCalendar size={32} />
                                            </div>
                                            <p className="text-gray-500 font-medium">No reservations found</p>
                                            <button 
                                                onClick={() => setIsModalOpen(true)}
                                                className="text-primary-600 font-bold hover:underline"
                                            >
                                                Add your first reservation
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Management Modal */}
            <PaymentManagementModal 
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setReservationForPayment(null);
                }}
                reservation={reservationForPayment}
                propertyId={selectedPropertyId}
            />

            {/* Manual Reservation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-3xl my-auto relative animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[95vh]">
                        {/* Header */}
                        <div className="bg-[#004e59] p-4 md:p-6 text-white flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-lg md:text-xl font-bold">New Manual Reservation</h2>
                                <p className="text-white/70 text-xs md:text-sm mt-0.5">Add a walk-in or offline booking</p>
                            </div>
                            <button 
                                onClick={() => { setIsModalOpen(false); resetForm(); }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <FiX className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                            <div className="space-y-8">
                                <div className="col-span-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Guest Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Guest Name *</label>
                                            <input 
                                                type="text" required
                                                value={formData.guest_name}
                                                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                                            <input 
                                                type="text"
                                                value={formData.guest_phone}
                                                onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                                placeholder="+880 1xxx..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Stay Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Select {terms.room} *</label>
                                            <select 
                                                required
                                                value={formData.hms_room_id}
                                                onChange={(e) => setFormData({ ...formData, hms_room_id: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                            >
                                                <option value="">Select a {terms.roomSingular || 'room'}</option>
                                                {rooms?.map(room => (
                                                    <option key={room.id} value={room.id}>{terms.room} {room.room_number} ({room.room_type}) - BDT {room.price} [{room.status.toUpperCase()}]</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Booking Source</label>
                                            <select 
                                                value={formData.source}
                                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                            >
                                                <option value="Walk-in">Walk-in</option>
                                                <option value="Booking.com">Booking.com</option>
                                                <option value="Agoda">Agoda</option>
                                                <option value="Phone">Phone Call</option>
                                                <option value="Social Media">Social Media</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Check-in Date *</label>
                                            <DatePicker
                                                selected={formData.check_in_date}
                                                onChange={(date) => setFormData({ ...formData, check_in_date: date })}
                                                selectsStart
                                                startDate={formData.check_in_date}
                                                endDate={formData.check_out_date}
                                                minDate={new Date()}
                                                excludeDates={(blockedDatesData?.blockedDates || []).map(d => parseISO(d))}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                                placeholderText="Select check-in"
                                                required
                                                dateFormat="MMM dd, yyyy"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Check-out Date *</label>
                                            <DatePicker
                                                selected={formData.check_out_date}
                                                onChange={(date) => setFormData({ ...formData, check_out_date: date })}
                                                selectsEnd
                                                startDate={formData.check_in_date}
                                                endDate={formData.check_out_date}
                                                minDate={formData.check_in_date ? addDays(formData.check_in_date, 1) : addDays(new Date(), 1)}
                                                excludeDates={(blockedDatesData?.blockedDates || []).map(d => parseISO(d))}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                                placeholderText="Select check-out"
                                                required
                                                dateFormat="MMM dd, yyyy"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Information</h3>
                                    
                                    {formData.check_in_date && formData.check_out_date && formData.hms_room_id && (
                                        <div className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Nightly Price</span>
                                                <span className="font-bold text-gray-900">BDT {rooms?.find(r => r.id === parseInt(formData.hms_room_id))?.price.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Total Nights</span>
                                                <span className="font-bold text-gray-900">{Math.ceil(Math.abs(formData.check_out_date - formData.check_in_date) / (1000 * 60 * 60 * 24))} Nights</span>
                                            </div>
                                            <div className="pt-2 border-t border-gray-200 flex justify-between">
                                                <span className="text-sm font-bold text-[#004e59]">Calculated Subtotal</span>
                                                <span className="text-sm font-bold text-[#004e59]">BDT {formData.total_amount?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Final Amount (BDT) *</label>
                                            <div className="relative">
                                                <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input 
                                                    type="number" required
                                                    value={formData.total_amount}
                                                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all font-bold text-[#004e59]"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">You can manually adjust this if needed (e.g. for discounts)</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Payment Status</label>
                                            <select 
                                                value={formData.payment_status}
                                                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={createMutation.isLoading}
                                    className="flex-1 py-3 bg-[#004e59] text-white rounded-xl font-bold hover:bg-[#003d4d] transition disabled:opacity-50 shadow-lg shadow-[#004e59]/20"
                                >
                                    {createMutation.isLoading ? 'Saving...' : 'Confirm Reservation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Refund Modal */}
            {isRefundModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Process Manual Refund</h3>
                            <button onClick={() => setIsRefundModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                <p className="text-sm text-orange-800">
                                    This will record a <strong>Debit</strong> transaction in your HMS accounts ledger. 
                                    Ensure you have already returned the money to the guest via Cash/Bank.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Refund Amount (BDT)</label>
                                    <input 
                                        type="number"
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-lg"
                                        placeholder="Enter amount"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Original booking amount: BDT {reservationForRefund?.total_amount}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Reason for Refund</label>
                                    <textarea 
                                        value={refundReason}
                                        onChange={(e) => setRefundReason(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                                        rows="2"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button 
                                    onClick={() => setIsRefundModalOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => refundMutation.mutate({ 
                                        id: reservationForRefund.id, 
                                        amount: parseFloat(refundAmount), 
                                        reason: refundReason 
                                    })}
                                    disabled={refundMutation.isLoading || !refundAmount}
                                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition disabled:opacity-50"
                                >
                                    {refundMutation.isLoading ? 'Processing...' : 'Confirm Refund'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HMSReservations;
