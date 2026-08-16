import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiHome, FiUser, FiCalendar, FiDollarSign, 
  FiInfo, FiRotateCw, FiCheck, FiX, FiClock, FiMoreVertical,
  FiFilter, FiMessageSquare, FiExternalLink, FiDownload, FiXCircle,
  FiAlertTriangle, FiEdit, FiEye, FiShield, FiUpload, FiTrash2
} from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getImageUrl, getFirstImageUrl } from '../../utils/imageUrl';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker';
import GuestProfileModal from '../../components/property-owner/GuestProfileModal';
import 'react-datepicker/dist/react-datepicker.css';
import PaymentManagementModal from '../../components/property-owner/PaymentManagementModal';

const NATIONALITIES = [
    'Bangladeshi', 'Indian', 'Pakistani', 'American', 'British', 'Canadian',
    'Australian', 'Saudi Arabian', 'Emirati', 'Malaysian', 'Singaporean',
    'Turkish', 'German', 'French', 'Italian', 'Spanish', 'Chinese', 'Japanese',
    'Nepali', 'Sri Lankan', 'Maldivian'
];

const SearchablePropertyDropdown = ({ properties, selectedPropertyId, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);

    const selectedProperty = properties?.find(p => p.id === selectedPropertyId);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredProperties = properties?.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="relative inline-block" ref={containerRef}>
            <button
                type="button"
                onClick={() => { setIsOpen(!isOpen); setSearchQuery(''); }}
                className="flex items-center gap-1.5 font-bold text-primary-600 focus:outline-none hover:text-primary-700 transition max-w-[180px] xs:max-w-[240px] sm:max-w-xs md:max-w-md lg:max-w-lg truncate text-left"
            >
                <span className="truncate">{selectedProperty ? selectedProperty.title : 'Select Property'}</span>
                <svg className="w-3.5 h-3.5 text-[#004e59] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Mobile Centered Searchable Dropdown Modal (sm:hidden) */}
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[190] flex items-center justify-center p-4 sm:hidden">
                        <div 
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0"
                        />
                        <div className="relative w-full max-w-[320px] bg-white rounded-2xl shadow-2xl p-4 space-y-3 z-[200] animate-fadeIn">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search property..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] outline-none"
                                />
                            </div>
                            
                            <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                                {filteredProperties.length > 0 ? (
                                    filteredProperties.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(p.id);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors block truncate ${
                                                p.id === selectedPropertyId
                                                    ? 'bg-[#004e59] text-white font-bold'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {p.title}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-gray-400 text-center py-4">No properties found</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Dropdown Panel (hidden sm:block) */}
                    <div className="hidden sm:block absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 p-2.5 space-y-2 animate-fadeIn">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search property..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] outline-none"
                            />
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar">
                            {filteredProperties.length > 0 ? (
                                filteredProperties.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(p.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors block truncate ${
                                            p.id === selectedPropertyId
                                                ? 'bg-[#004e59] text-white font-bold'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {p.title}
                                    </button>
                                ))
                            ) : (
                                <p className="text-[10px] text-gray-400 text-center py-4">No properties found</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const HMSReservations = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError } = useToast();
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);

    // Custom Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        isDanger: false,
        onConfirm: null
    });

    const triggerConfirm = (options) => {
        setConfirmModal({
            isOpen: true,
            title: options.title || 'Are you sure?',
            message: options.message || '',
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            isDanger: options.isDanger || false,
            onConfirm: () => {
                options.onConfirm();
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Auto search and highlight when navigating from HMS Calendar
    useEffect(() => {
        if (location.state?.highlightBookingRef) {
            setSearchQuery(location.state.highlightBookingRef);
            setViewTab('all');
            setStatusFilter('');
        }
    }, [location.state]);

    // Date Picker States
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
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
                return [start, end];
            }
        }
    ];

    const handlePresetClick = (range) => {
        setStartDate(range[0]);
        setEndDate(range[1]);
        setIsDatePickerOpen(false);
    };

    const handleDateRangeChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        if (start && end) {
            setIsDatePickerOpen(false);
        }
    };

    const fmtDate = (d) => {
        if (!d) return '';
        return format(d, 'MMM dd, yyyy');
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectGuestPhone, setSelectGuestPhone] = useState(null);
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
    
    const [editingReservation, setEditingReservation] = useState(null);
 
    const [isNatOpen, setIsNatOpen] = useState(false);
    const natRef = useRef(null);

    // Close nationality dropdown on click outside
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (natRef.current && !natRef.current.contains(e.target)) {
                setIsNatOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);
 
    const [formData, setFormData] = useState({
        hms_room_id: '',
        check_in_date: null,
        check_out_date: null,
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        total_amount: '',
        payment_status: 'pending',
        special_requests: '',
        source: 'Walk-in',
        nationality: '',
        nid_number: '',
        passport_number: '',
        nid_document_url: '',
        passport_document_url: '',
        number_of_guests: 1,
        number_of_children: 0,
        number_of_infants: 0,
        extra_guests: [],
        paid_amount: ''
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
            refetchOnMount: 'always',
            refetchOnWindowFocus: true,
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
        ['hms-blocked-dates', selectedPropertyId, formData.hms_room_id, editingReservation?.id],
        async () => {
            if (!formData.hms_room_id) return { blockedDates: [], checkInDates: [] };
            const response = await api.get(`/properties/${selectedPropertyId}/blocked-dates`, {
                params: { 
                    hms_room_id: formData.hms_room_id,
                    exclude_booking_id: editingReservation?.id
                }
            });
            return response.data?.data || { blockedDates: [], checkInDates: [] };
        },
        {
            enabled: isModalOpen && !!selectedPropertyId && !!formData.hms_room_id
        }
    );

    const createMutation = useMutation(
        (data) => {
            // Compute base room total only — extra guest charges go to hms_bills separately
            const selectedRoom = rooms?.find(r => r.id === parseInt(data.hms_room_id));
            const nights = data.check_in_date && data.check_out_date
                ? Math.ceil(Math.abs(new Date(data.check_out_date) - new Date(data.check_in_date)) / (1000 * 60 * 60 * 24))
                : 0;
            const baseRoomTotal = selectedRoom ? (selectedRoom.price || 0) * nights : parseFloat(data.total_amount || 0);
            // Use manually entered total_amount if user overrode it (discount case), otherwise use calculated room total
            const finalRoomTotal = (parseFloat(data.total_amount) !== baseRoomTotal && data.total_amount !== '' && data.total_amount !== 0)
                ? parseFloat(data.total_amount)
                : baseRoomTotal;

            const extraGuestChargesTotal = (data.extra_guests || []).reduce((sum, g) => sum + (parseFloat(g.extra_charge) || 0), 0);
            const grandTotal = finalRoomTotal + extraGuestChargesTotal;

            // Resolve correct paid_amount to send to backend
            let resolvedPaidAmount = data.paid_amount;
            if (data.payment_status === 'paid') {
                resolvedPaidAmount = grandTotal; // Full payment = grand total (room + extra charges)
            } else if (data.payment_status === 'partial') {
                resolvedPaidAmount = parseFloat(data.paid_amount || 0);
            }

            const formattedData = {
                ...data,
                property_id: selectedPropertyId,
                total_amount: finalRoomTotal, // base room only — hms_bills handles extra charges
                grand_total: grandTotal,       // for reference
                paid_amount: resolvedPaidAmount,
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

    const updateMutation = useMutation(
        (data) => {
            const formattedData = {
                ...data,
                property_id: selectedPropertyId,
                check_in_date: data.check_in_date ? format(data.check_in_date, 'yyyy-MM-dd') : null,
                check_out_date: data.check_out_date ? format(data.check_out_date, 'yyyy-MM-dd') : null
            };
            return api.put(`/property-owner/hms/reservations/${editingReservation.id}`, formattedData);
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['hms-reservations', selectedPropertyId]);
                queryClient.invalidateQueries(['hms-rooms', selectedPropertyId]);
                showSuccess('Reservation updated successfully');
                setIsModalOpen(false);
                resetForm();
                setEditingReservation(null);
            },
            onError: (error) => showError(error.response?.data?.message || 'Failed to update reservation')
        }
    );

    const handleEditReservation = (res) => {
        setEditingReservation(res);
        setFormData({
            hms_room_id: res.hms_room_id || '',
            check_in_date: res.check_in_date ? new Date(res.check_in_date) : null,
            check_out_date: res.check_out_date ? new Date(res.check_out_date) : null,
            guest_name: res.guest_name || (res.guest_first_name ? `${res.guest_first_name} ${res.guest_last_name}` : ''),
            guest_email: res.guest_email || res.guest_user_email || '',
            guest_phone: res.guest_phone || res.guest_user_phone || '',
            total_amount: res.base_price || res.total_amount || '',
            payment_status: res.payment_status || 'pending',
            special_requests: res.special_requests || '',
            source: res.source || 'Walk-in',
            nationality: res.guest_nationality || '',
            nid_number: res.guest_nid_number || '',
            passport_number: res.guest_passport_number || '',
            nid_document_url: res.guest_nid_document_url || '',
            passport_document_url: res.guest_passport_document_url || '',
            number_of_guests: res.number_of_guests || 1,
            number_of_children: res.number_of_children || 0,
            number_of_infants: res.number_of_infants || 0,
            extra_guests: []
        });

        // Fetch existing extra guests from database on edit
        if (res.id) {
            api.get(`/property-owner/hms/reservations/${res.id}/detail`)
                .then(response => {
                    const details = response.data?.data;
                    if (details && details.extraGuests) {
                        setFormData(prev => ({
                            ...prev,
                            extra_guests: details.extraGuests.map(g => ({
                                first_name: g.first_name,
                                last_name: g.last_name,
                                email: g.email || '',
                                phone: g.phone || '',
                                gender: g.gender || '',
                                nid_number: g.nid_number || '',
                                passport_number: g.passport_number || '',
                                extra_charge: 0
                            }))
                        }));
                    }
                })
                .catch(err => console.error('[HMS] Failed to fetch reservation extra guests on edit:', err));
        }

        setIsModalOpen(true);
    };

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
            source: 'Walk-in',
            nationality: '',
            nid_number: '',
            passport_number: '',
            nid_document_url: '',
            passport_document_url: '',
            number_of_guests: 1,
            number_of_children: 0,
            number_of_infants: 0,
            extra_guests: [],
            paid_amount: ''
        });
    };

    const handlePhoneChange = async (val) => {
        setFormData(prev => ({ ...prev, guest_phone: val }));
        
        const cleaned = val.replace(/\D/g, '');
        if (cleaned.length >= 10) {
            try {
                const response = await api.get('/property-owner/hms/guests/lookup', {
                    params: { phone: val }
                });
                const guest = response.data?.data?.guest;
                if (guest) {
                    setFormData(prev => ({
                        ...prev,
                        guest_name: guest.first_name + (guest.last_name ? ' ' + guest.last_name : ''),
                        guest_email: guest.email || prev.guest_email,
                        nationality: guest.nationality || '',
                        nid_number: guest.nid_number || '',
                        passport_number: guest.passport_number || '',
                        nid_document_url: guest.nid_document_url || '',
                        passport_document_url: guest.passport_document_url || ''
                    }));
                    showSuccess('Linked existing guest account!');
                }
            } catch (err) {
                console.error('[HMS] Failed to lookup guest by phone:', err);
            }
        }
    };

    const handleDocumentUpload = (field) => (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            showError('Only image files (JPEG, PNG, GIF, WEBP) are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showError('File size must be less than 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            setFormData(prev => ({ ...prev, [field]: ev.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveDocument = (field) => {
        setFormData(prev => ({ ...prev, [field]: '' }));
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
            if (editingReservation) {
                const origCheckIn = editingReservation.check_in_date ? format(new Date(editingReservation.check_in_date), 'yyyy-MM-dd') : null;
                const origCheckOut = editingReservation.check_out_date ? format(new Date(editingReservation.check_out_date), 'yyyy-MM-dd') : null;
                const currentCheckIn = format(formData.check_in_date, 'yyyy-MM-dd');
                const currentCheckOut = format(formData.check_out_date, 'yyyy-MM-dd');
                const origRoomId = editingReservation.hms_room_id;
                
                const datesOrRoomChanged = 
                    origCheckIn !== currentCheckIn || 
                    origCheckOut !== currentCheckOut || 
                    parseInt(origRoomId) !== parseInt(formData.hms_room_id);
                
                if (!datesOrRoomChanged) {
                    return;
                }
            }

            const selectedRoom = rooms?.find(r => r.id === parseInt(formData.hms_room_id));
            if (selectedRoom) {
                const diffTime = Math.abs(formData.check_out_date - formData.check_in_date);
                const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const total = nights * selectedRoom.price;
                setFormData(prev => ({ ...prev, total_amount: total }));
            }
        }
    }, [formData.check_in_date, formData.check_out_date, formData.hms_room_id, rooms, editingReservation]);

    const handleStatusChange = (id, status) => {
        const res = reservations?.find(r => r.id === id);
        
        if (status === 'checked_out') {
            // Check for unpaid extras or unbalanced folio
            const total = parseFloat(res.total_amount) + parseFloat(res.extra_billing_amount || 0);
            const paid = parseFloat(res.paid_amount || 0);
            const unpaidFood = res.unpaid_food_count > 0;
            const hasExtraBills = res.extra_bills_count > 0;

            if (unpaidFood || hasExtraBills || (total - paid > 1)) {
                triggerConfirm({
                    title: 'Unsettled Bills Warning',
                    message: 'This guest has unpaid food orders or extra service charges. You must settle the bill before checking out. Go to the Billing page?',
                    confirmText: 'Go to Billing',
                    cancelText: 'Cancel',
                    isDanger: false,
                    onConfirm: () => {
                        navigate(`/property-owner/hms/billing?bookingId=${id}&propertyId=${selectedPropertyId}`);
                    }
                });
                return;
            }
        }

        const isCancel = status === 'cancelled';
        const isCheckOut = status === 'checked_out';
        
        let confirmTitle = 'Update Status';
        let confirmMsg = `Are you sure you want to change this reservation status to ${status.replace('_', ' ')}?`;
        let confirmText = 'Confirm';
        let isDanger = false;

        if (isCancel) {
            confirmTitle = 'Cancel Reservation';
            confirmMsg = 'Are you sure you want to cancel this reservation? This action will release the room block and cancel any pending charges.';
            confirmText = 'Yes, Cancel';
            isDanger = true;
        } else if (status === 'checked_in') {
            confirmTitle = 'Check In Guest';
            confirmMsg = 'Are you sure you want to check in this guest? This will mark the room as occupied and start the stay.';
            confirmText = 'Check In';
        } else if (isCheckOut) {
            confirmTitle = 'Check Out Guest';
            confirmMsg = 'Are you sure you want to check out this guest? This will release the room and mark the stay as complete.';
            confirmText = 'Check Out';
        }

        triggerConfirm({
            title: confirmTitle,
            message: confirmMsg,
            confirmText: confirmText,
            isDanger: isDanger,
            onConfirm: () => {
                statusMutation.mutate({ id, status });
            }
        });
    };

    const handleAcceptBooking = (id) => {
        triggerConfirm({
            title: 'Accept Booking Request',
            message: 'Are you sure you want to accept this booking request? This will confirm the reservation and allocate the room.',
            confirmText: 'Accept Request',
            isDanger: false,
            onConfirm: () => {
                acceptMutation.mutate(id);
            }
        });
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

        let matchesDate = true;
        if (startDate && endDate) {
            const startStr = format(startDate, 'yyyy-MM-dd');
            const endStr = format(endDate, 'yyyy-MM-dd');
            matchesDate = resCheckIn <= endStr && resCheckOut >= startStr;
        }

        return matchesSearch && matchesStatus && matchesTab && matchesDate;
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
    
    const getMaxCheckOutDate = () => {
        if (!formData.check_in_date || !blockedDatesData?.checkInDates) return null;
        
        const checkInTime = formData.check_in_date.getTime();
        
        // Find all check-in dates that are after the selected check-in date
        const futureCheckIns = blockedDatesData.checkInDates
            .map(d => parseISO(d))
            .filter(date => date.getTime() > checkInTime)
            .sort((a, b) => a - b);
            
        if (futureCheckIns.length > 0) {
            // The guest must checkout at latest on the next guest's checkin date
            return futureCheckIns[0];
        }
        return null;
    };
    
    const terms = getTerminology(propertyType);

    if (isLoadingProperties) return <LoadingSpinner />;

    return (
        <div className="p-6 max-w-[1600px] mx-auto bg-[#f8fafc] min-h-screen">
            {/* Header Area */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Reservation Management</h1>
                    <div className="flex flex-row flex-wrap items-center gap-1.5 text-sm text-gray-500 mt-1.5">
                        <div className="flex items-center gap-1">
                            <FiHome className="flex-shrink-0" />
                            <span className="font-semibold whitespace-nowrap">Property:</span>
                        </div>
                        <SearchablePropertyDropdown 
                            properties={properties}
                            selectedPropertyId={selectedPropertyId}
                            onChange={handlePropertyChange}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#004e59] text-white rounded-lg font-bold text-xs shadow-md hover:bg-[#003d4d] transition whitespace-nowrap"
                    >
                        <FiPlus />
                        Add New Reservation
                    </button>
                    <button className="p-2.5 bg-white border border-gray-250/70 text-gray-600 rounded-lg shadow-sm hover:bg-gray-50 flex items-center justify-center">
                        <FiDownload />
                    </button>
                </div>
            </div>

            {/* Quick Status Tabs */}
            <div className="flex items-center gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto max-w-full scrollbar-none pb-1">
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
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3">
                <div className="relative w-full md:flex-1">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search guest name or booking ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full sm:w-44 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-600 focus:ring-2 focus:ring-[#004e59]/20 bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="request_accepted">Request Accepted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="checked_in">Checked In</option>
                        <option value="checked_out">Checked Out</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Date Range Picker Dropdown */}
                    <div className="relative w-full sm:w-auto sm:shrink-0" ref={datePickerRef}>
                        <div 
                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                            className={`flex items-center justify-between sm:justify-start gap-2 bg-white border ${
                                isDatePickerOpen ? 'border-[#004e59] ring-2 ring-[#004e59]/20' : 'border-gray-200'
                            } rounded-lg px-4 py-2.5 text-sm text-gray-700 cursor-pointer select-none transition-all h-[42px] w-full sm:w-auto`}
                        >
                            <div className="flex items-center gap-2">
                                <FiCalendar className="text-gray-400" size={16} />
                                <span className="font-semibold text-xs whitespace-nowrap">
                                    {startDate ? fmtDate(startDate) : "Start"} ➔ {endDate ? fmtDate(endDate) : "End"}
                                </span>
                            </div>
                        </div>
                        
                        {isDatePickerOpen && (
                            <div className="absolute right-0 z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden w-[92vw] max-w-[320px] md:max-w-none md:w-max">
                                {/* Left presets list */}
                                <div className="w-full md:w-36 border-b md:border-b-0 md:border-r border-gray-100 p-1.5 flex flex-row md:flex-col gap-1 overflow-x-auto bg-gray-50/50 whitespace-nowrap">
                                    {presets.map(p => (
                                        <button
                                            key={p.label}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePresetClick(p.getRange());
                                            }}
                                            className="px-2.5 py-1.5 md:w-full text-left rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-[#004e59] transition-colors inline-block md:block flex-shrink-0"
                                        >
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                                
                                {/* DatePicker */}
                                <div className="p-2.5 bg-white hms-daterange-picker-picker" onClick={(e) => e.stopPropagation()}>
                                    <DatePicker
                                        selected={startDate}
                                        startDate={startDate}
                                        endDate={endDate}
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
                        onClick={() => refetch()}
                        className="p-2.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition flex items-center justify-center shrink-0"
                        title="Refresh list"
                    >
                        <FiRotateCw className={isLoadingReservations ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest & Reference</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stay Dates</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{terms.room}</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoadingReservations ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center"><LoadingSpinner /></td>
                                </tr>
                            ) : filteredReservations.length > 0 ? (
                                filteredReservations.map((res) => (
                                    <tr 
                                        key={res.id} 
                                        className={`hover:bg-gray-50/50 transition-all ${
                                            location.state?.highlightBookingRef === res.booking_reference
                                                ? 'bg-amber-50/80 font-medium'
                                                : ''
                                        }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#004e59]/10 rounded-full flex items-center justify-center text-[#004e59] font-bold">
                                                    {(res.guest_name || res.guest_first_name)?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (res.guest_phone) setSelectGuestPhone(res.guest_phone);
                                                        }}
                                                        className="font-bold text-gray-900 cursor-pointer hover:text-primary-600 hover:underline"
                                                    >
                                                        {res.guest_name || (res.guest_first_name ? `${res.guest_first_name} ${res.guest_last_name}` : 'Guest')}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-mono whitespace-nowrap">{res.booking_reference}</span>
                                                        {res.guest_id && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase whitespace-nowrap">Web Guest</span>}
                                                        {res.booking_type === 'monthly' && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold uppercase whitespace-nowrap">Monthly</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">
                                                <div className="flex items-center gap-1 whitespace-nowrap"><FiCalendar className="text-gray-400" size={12}/> {format(new Date(res.check_in_date), 'MMM dd')} - {format(new Date(res.check_out_date), 'MMM dd, yyyy')}</div>
                                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1"><FiClock size={12}/> {res.booking_type === 'monthly' ? `${res.months_count || Math.floor(res.nights / 30)} Months${(res.extra_days || res.nights % 30) > 0 ? ` + ${(res.extra_days || res.nights % 30)} Days` : ''}` : `${res.nights} ${res.nights === 1 ? 'Night' : 'Nights'}`}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="font-bold text-gray-800">{terms.room} {res.room_number || 'N/A'}</div>
                                                <div className="text-xs text-gray-500">{res.room_type}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const roomAmount = parseFloat(res.total_amount || 0);
                                                const extraBills = parseFloat(res.extra_billing_amount || 0);
                                                const grandTotal = roomAmount + extraBills;
                                                const paid = parseFloat(res.paid_amount || 0);
                                                const due = Math.max(0, grandTotal - paid);
                                                const hasDue = due > 0 || res.unpaid_food_count > 0;
                                                const isFullyPaid = (res.payment_status === 'paid' || due <= 0) && !hasDue;

                                                return (
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 font-mono">BDT {grandTotal.toLocaleString()}</div>
                                                        <div className="text-[10px] text-gray-500 font-medium">
                                                            Room: {roomAmount.toLocaleString()} {extraBills > 0 ? `+ Extra: ${extraBills.toLocaleString()}` : ''}
                                                        </div>
                                                        {res.booking_type === 'monthly' && (
                                                            <div className="text-[10px] text-gray-500 font-medium">
                                                                Advance: BDT {parseFloat(res.advance_amount || 0).toLocaleString()}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className={`text-[10px] font-bold uppercase ${isFullyPaid ? 'text-green-500' : paid > 0 ? 'text-amber-500' : 'text-red-400'}`}>
                                                                {isFullyPaid ? 'paid' : paid > 0 ? 'partial' : 'pending'}
                                                            </div>
                                                            {res.status !== 'checked_out' && hasDue && (
                                                                <div className="flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100" title={`Billing Due: BDT ${due.toLocaleString()}`}>
                                                                    <FiAlertTriangle size={10} /> BILLING DUE
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(res.status)} uppercase whitespace-nowrap`}>
                                                {res.status.replace('_', ' ')}
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
                                                 {(() => {
                                                     const grandTotal = (parseFloat(res.total_amount || 0) + parseFloat(res.extra_billing_amount || 0));
                                                     const paid = parseFloat(res.paid_amount || 0);
                                                     const due = Math.max(0, grandTotal - paid);
                                                     const showPayBtn = due > 0 || res.unpaid_food_count > 0;

                                                     return showPayBtn ? (
                                                         <button 
                                                             onClick={() => {
                                                                 setReservationForPayment(res);
                                                                 setIsPaymentModalOpen(true);
                                                             }}
                                                             className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all"
                                                             title="Process Payment / Payment Link"
                                                         >
                                                             <FiDollarSign className="w-4 h-4" />
                                                         </button>
                                                     ) : null;
                                                 })()}
                                                <button 
                                                    onClick={() => handleEditReservation(res)}
                                                    className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
                                                    title="Edit Reservation"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/property-owner/hms/reservations/${res.id}`)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004e59] text-white rounded-lg text-xs font-bold hover:bg-[#003d4d] transition-all"
                                                    title="View Details"
                                                >
                                                    <FiEye className="w-3.5 h-3.5" />
                                                    Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-32 text-center">
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

            {/* Mobile Reservations Cards List (hidden on desktop) */}
            <div className="grid grid-cols-1 gap-3 md:hidden mb-6">
                {isLoadingReservations ? (
                    <div className="p-12 flex justify-center bg-white rounded-xl border border-gray-100 shadow-sm">
                        <LoadingSpinner />
                    </div>
                ) : filteredReservations.length > 0 ? (
                    filteredReservations.map((res) => {
                        const initials = res.guest_name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 
                                         (res.guest_first_name ? `${res.guest_first_name[0]}${res.guest_last_name ? res.guest_last_name[0] : ''}` : 'G');
                        
                        return (
                            <div 
                                key={res.id} 
                                className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all ${
                                    location.state?.highlightBookingRef === res.booking_reference
                                        ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
                                        : 'border-gray-100'
                                }`}
                            >
                                {/* Card Header */}
                                <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 bg-[#004e59]/10 rounded-full flex items-center justify-center text-[#004e59] text-xs font-bold shrink-0">
                                            {initials.toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (res.guest_phone) setSelectGuestPhone(res.guest_phone);
                                                }}
                                                className="text-sm font-bold text-gray-900 leading-tight cursor-pointer hover:text-primary-600 hover:underline"
                                            >
                                                {res.guest_name || (res.guest_first_name ? `${res.guest_first_name} ${res.guest_last_name}` : 'Guest')}
                                            </h4>
                                            <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                <span className="font-mono text-blue-600 font-bold">{res.booking_reference}</span>
                                                {res.guest_id && (
                                                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold uppercase">
                                                        Web Guest
                                                    </span>
                                                )}
                                                {res.booking_type === 'monthly' && (
                                                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold uppercase">
                                                        Monthly
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(res.status)} whitespace-nowrap`}>
                                        {res.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Card Body Grid */}
                                <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                                    {/* Stay Dates */}
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Stay Dates</p>
                                        <p className="text-xs font-semibold text-gray-700">
                                            {format(new Date(res.check_in_date), 'MMM dd')} - {format(new Date(res.check_out_date), 'MMM dd, yyyy')}
                                            <span className="text-gray-400 font-normal ml-1.5">
                                                ({res.booking_type === 'monthly' ? `${res.months_count || Math.floor(res.nights / 30)} Months${(res.extra_days || res.nights % 30) > 0 ? ` + ${(res.extra_days || res.nights % 30)} Days` : ''}` : `${res.nights} ${res.nights === 1 ? 'Night' : 'Nights'}`})
                                            </span>
                                        </p>
                                    </div>

                                    {/* Room */}
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{terms.room}</p>
                                        <p className="text-xs font-bold text-gray-800">{terms.room} {res.room_number || 'N/A'}</p>
                                        <p className="text-[10px] text-gray-500">{res.room_type}</p>
                                    </div>

                                    {/* Total Billed Amount */}
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Billed</p>
                                        {(() => {
                                            const roomAmount = parseFloat(res.total_amount || 0);
                                            const extraBills = parseFloat(res.extra_billing_amount || 0);
                                            const grandTotal = roomAmount + extraBills;
                                            const paid = parseFloat(res.paid_amount || 0);
                                            const due = Math.max(0, grandTotal - paid);
                                            const isFullyPaid = res.payment_status === 'paid' && due <= 0;

                                            return (
                                                <>
                                                    <p className="text-sm font-bold text-gray-900 font-mono">BDT {grandTotal.toLocaleString()}</p>
                                                    {extraBills > 0 && (
                                                        <p className="text-[9px] text-gray-500 font-medium">Room: {roomAmount.toLocaleString()} + Extra: {extraBills.toLocaleString()}</p>
                                                    )}
                                                    {res.booking_type === 'monthly' && (
                                                        <p className="text-[10px] text-gray-500 font-medium leading-none mb-1">
                                                            Adv: BDT {parseFloat(res.advance_amount || 0).toLocaleString()}
                                                        </p>
                                                    )}
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${isFullyPaid ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
                                                        {isFullyPaid ? 'paid' : paid > 0 ? 'partial' : 'pending'}
                                                    </span>
                                                </>
                                            );
                                        })()}
                                    </div>

                                    {/* Source */}
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Source</p>
                                        <p className="text-xs font-semibold text-gray-750 flex items-center gap-1.5">
                                            {res.source === 'Walk-in' ? <FiUser size={12}/> : <FiExternalLink size={12}/>}
                                            {res.source}
                                        </p>
                                    </div>

                                    {/* Folio Warning */}
                                    {res.status !== 'checked_out' && (res.unpaid_food_count > 0 || res.extra_bills_count > 0) && (
                                        <div className="col-span-2 p-2 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-1.5 text-[9px] font-black text-rose-600">
                                            <FiAlertTriangle className="shrink-0 text-rose-500" size={12} />
                                            <span>UNPAID FOLIO / BILLING DUE</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Bar */}
                                <div className="px-4 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                                    {res.status === 'pending' && (
                                        <button
                                            onClick={() => handleAcceptBooking(res.id)}
                                            type="button"
                                            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl font-bold text-[10px] transition-all focus:outline-none"
                                        >
                                            <FiCheck className="h-3.5 w-3.5 shrink-0" /><span>Accept</span>
                                        </button>
                                    )}

                                    {res.status === 'confirmed' && (
                                        <button
                                            onClick={() => handleStatusChange(res.id, 'checked_in')}
                                            type="button"
                                            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl font-bold text-[10px] transition-all focus:outline-none"
                                        >
                                            <FiCheck className="h-3.5 w-3.5 shrink-0" /><span>Check In</span>
                                        </button>
                                    )}

                                    {res.status === 'checked_in' && (
                                        <button
                                            onClick={() => handleStatusChange(res.id, 'checked_out')}
                                            type="button"
                                            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl font-bold text-[10px] transition-all focus:outline-none"
                                        >
                                            <FiExternalLink className="h-3.5 w-3.5 shrink-0" /><span>Check Out</span>
                                        </button>
                                    )}

                                    {(res.status === 'pending' || res.status === 'confirmed') && (
                                        <button
                                            onClick={() => handleStatusChange(res.id, 'cancelled')}
                                            type="button"
                                            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl font-bold text-[10px] transition-all focus:outline-none"
                                        >
                                            <FiX className="h-3.5 w-3.5 shrink-0" /><span>Cancel</span>
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
                                            type="button"
                                            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-xl font-bold text-[10px] transition-all focus:outline-none"
                                        >
                                            <FiRotateCw className="h-3.5 w-3.5 shrink-0" /><span>Refund</span>
                                        </button>
                                    )}

                                    {res.payment_status === 'pending' && (
                                        <button
                                            onClick={() => {
                                                setReservationForPayment(res);
                                                setIsPaymentModalOpen(true);
                                            }}
                                            type="button"
                                            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl font-bold text-[10px] transition-all focus:outline-none"
                                        >
                                            <FiDollarSign className="h-3.5 w-3.5 shrink-0" /><span>Pay</span>
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => handleEditReservation(res)}
                                        className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-all flex items-center justify-center"
                                        title="Edit Reservation"
                                    >
                                        <FiEdit className="w-3.5 h-3.5 shrink-0" />
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/property-owner/hms/reservations/${res.id}`)}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-[#004e59] text-white rounded-xl font-bold text-[10px] hover:bg-[#003d4d] transition-all"
                                        title="View Details"
                                    >
                                        <FiEye className="w-3.5 h-3.5 shrink-0" />
                                        <span>View Details</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="p-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FiCalendar className="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="font-bold text-gray-700 text-sm">No reservations found</p>
                        <p className="text-xs text-gray-400 mt-1">Adjust search parameters and try again</p>
                    </div>
                )}
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
                                <h2 className="text-lg md:text-xl font-bold">{editingReservation ? 'Edit Reservation' : 'New Manual Reservation'}</h2>
                                <p className="text-white/70 text-xs md:text-sm mt-0.5">{editingReservation ? 'Update booking details' : 'Add a walk-in or offline booking'}</p>
                            </div>
                            <button 
                                onClick={() => { setIsModalOpen(false); resetForm(); setEditingReservation(null); }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <FiX className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={(e) => { e.preventDefault(); if (editingReservation) { updateMutation.mutate(formData); } else { createMutation.mutate(formData); } }} className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
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
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</label>
                                            <input 
                                                type="text"
                                                value={formData.guest_phone}
                                                onChange={(e) => handlePhoneChange(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                                placeholder="+880 1xxx..."
                                            />
                                        </div>
                                    </div>

                                    {/* Identity & Documents (Editable) */}
                                    <div className="mt-6 p-5 bg-slate-50/50 border border-slate-150 rounded-2xl space-y-4">
                                        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2">
                                            <FiShield className="text-[#004e59] w-4 h-4" />
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Identity &amp; Verification Documents</h4>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div ref={natRef} className="relative">
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Nationality</label>
                                                <input 
                                                    type="text"
                                                    value={formData.nationality}
                                                    onFocus={() => setIsNatOpen(true)}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, nationality: e.target.value });
                                                        setIsNatOpen(true);
                                                    }}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] text-sm transition-all"
                                                    placeholder="Search or type..."
                                                />
                                                {isNatOpen && (
                                                    <div className="absolute z-[160] left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg custom-scrollbar">
                                                        {NATIONALITIES.filter(n => n.toLowerCase().includes((formData.nationality || '').toLowerCase())).length > 0 ? (
                                                            NATIONALITIES.filter(n => n.toLowerCase().includes((formData.nationality || '').toLowerCase())).map((nat) => (
                                                                <button
                                                                    key={nat}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, nationality: nat });
                                                                        setIsNatOpen(false);
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#004e59]/5 hover:text-[#004e59] font-medium transition-colors"
                                                                >
                                                                    {nat}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsNatOpen(false)}
                                                                className="w-full text-left px-4 py-2 text-xs text-gray-400 italic hover:bg-gray-50"
                                                            >
                                                                No matching options (Click to close)
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">NID Number</label>
                                                <input 
                                                    type="text"
                                                    value={formData.nid_number}
                                                    onChange={(e) => setFormData({ ...formData, nid_number: e.target.value })}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] text-sm font-mono transition-all"
                                                    placeholder="13-digit or 17-digit NID"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Passport Number</label>
                                                <input 
                                                    type="text"
                                                    value={formData.passport_number}
                                                    onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] text-sm font-mono transition-all"
                                                    placeholder="Passport No."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                            {/* NID File Upload */}
                                            <div className="space-y-2">
                                                <span className="block text-xs font-bold text-gray-700">NID Card Photo</span>
                                                {formData.nid_document_url ? (
                                                    <div className="relative group rounded-xl overflow-hidden border border-gray-200 h-32 bg-white shadow-sm">
                                                        <img 
                                                            src={getImageUrl(formData.nid_document_url)}
                                                            alt="NID" 
                                                            className="w-full h-full object-cover"
                                                            onError={() => handleRemoveDocument('nid_document_url')}
                                                        />
                                                        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveDocument('nid_document_url')}
                                                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 hover:border-[#004e59] rounded-xl cursor-pointer bg-white transition-colors">
                                                        <FiUpload className="text-gray-400 w-6 h-6 mb-1" />
                                                        <span className="text-[10px] text-gray-500 font-semibold">Upload NID image</span>
                                                        <input 
                                                            type="file" accept="image/*" 
                                                            onChange={handleDocumentUpload('nid_document_url')} 
                                                            className="hidden" 
                                                        />
                                                    </label>
                                                )}
                                            </div>

                                            {/* Passport File Upload */}
                                            <div className="space-y-2">
                                                <span className="block text-xs font-bold text-gray-700">Passport Photo</span>
                                                {formData.passport_document_url ? (
                                                    <div className="relative group rounded-xl overflow-hidden border border-gray-200 h-32 bg-white shadow-sm">
                                                        <img 
                                                            src={getImageUrl(formData.passport_document_url)}
                                                            alt="Passport" 
                                                            className="w-full h-full object-cover"
                                                            onError={() => handleRemoveDocument('passport_document_url')}
                                                        />
                                                        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleRemoveDocument('passport_document_url')}
                                                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 hover:border-[#004e59] rounded-xl cursor-pointer bg-white transition-colors">
                                                        <FiUpload className="text-gray-400 w-6 h-6 mb-1" />
                                                        <span className="text-[10px] text-gray-500 font-semibold">Upload Passport image</span>
                                                        <input 
                                                            type="file" accept="image/*" 
                                                            onChange={handleDocumentUpload('passport_document_url')} 
                                                            className="hidden" 
                                                        />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Extra Guests Section */}
                                <div className="col-span-2 mt-4 p-5 bg-slate-50/50 border border-slate-150 rounded-2xl">
                                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <FiUser className="text-[#004e59] w-4 h-4" />
                                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Additional Guests / Occupants</h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    extra_guests: [
                                                        ...prev.extra_guests,
                                                        { first_name: '', last_name: '', email: '', phone: '', gender: 'Male', nid_number: '', passport_number: '', extra_charge: '' }
                                                    ]
                                                }));
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004e59]/10 text-[#004e59] hover:bg-[#004e59]/20 rounded-lg text-xs font-bold transition-all"
                                        >
                                            <FiPlus size={14} /> Add Extra Guest
                                        </button>
                                    </div>

                                    {formData.extra_guests?.length > 0 ? (
                                        <div className="space-y-4">
                                            {formData.extra_guests.map((guest, idx) => (
                                                <div key={idx} className="p-4 bg-white border border-gray-150 rounded-xl relative space-y-3 shadow-sm">
                                                    <div className="flex justify-between items-center border-b border-gray-50 pb-1.5">
                                                        <span className="text-xs font-bold text-gray-500">Guest #{idx + 1} Profile</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    extra_guests: prev.extra_guests.filter((_, i) => i !== idx)
                                                                }));
                                                            }}
                                                            className="text-red-500 hover:text-red-700 transition"
                                                            title="Remove Guest"
                                                        >
                                                            <FiTrash2 size={15} />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                         <div>
                                                             <label className="block text-[10px] font-bold text-gray-700 mb-1">First Name</label>
                                                             <input
                                                                 type="text"
                                                                 value={guest.first_name || ''}
                                                                 onChange={(e) => {
                                                                     const updated = [...formData.extra_guests];
                                                                     updated[idx].first_name = e.target.value;
                                                                     setFormData({ ...formData, extra_guests: updated });
                                                                 }}
                                                                 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59]"
                                                                 placeholder="First Name"
                                                             />
                                                         </div>
                                                         <div>
                                                             <label className="block text-[10px] font-bold text-gray-700 mb-1">Last Name</label>
                                                             <input
                                                                 type="text"
                                                                 value={guest.last_name || ''}
                                                                 onChange={(e) => {
                                                                     const updated = [...formData.extra_guests];
                                                                     updated[idx].last_name = e.target.value;
                                                                     setFormData({ ...formData, extra_guests: updated });
                                                                 }}
                                                                 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59]"
                                                                 placeholder="Last Name"
                                                             />
                                                         </div>
                                                         <div>
                                                             <label className="block text-[10px] font-bold text-gray-700 mb-1">Gender</label>
                                                             <select
                                                                 value={guest.gender}
                                                                 onChange={(e) => {
                                                                     const updated = [...formData.extra_guests];
                                                                     updated[idx].gender = e.target.value;
                                                                     setFormData({ ...formData, extra_guests: updated });
                                                                 }}
                                                                 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59]"
                                                             >
                                                                 <option value="Male">Male</option>
                                                                 <option value="Female">Female</option>
                                                                 <option value="Other">Other</option>
                                                             </select>
                                                         </div>
                                                         <div>
                                                             <label className="block text-[10px] font-bold text-gray-700 mb-1">Phone Number</label>
                                                             <input
                                                                 type="text"
                                                                 value={guest.phone || ''}
                                                                 onChange={(e) => {
                                                                     const updated = [...formData.extra_guests];
                                                                     updated[idx].phone = e.target.value;
                                                                     setFormData({ ...formData, extra_guests: updated });
                                                                 }}
                                                                 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59]"
                                                                 placeholder="+880 1xxx..."
                                                             />
                                                         </div>
                                                         <div>
                                                             <label className="block text-[10px] font-bold text-gray-700 mb-1">Email</label>
                                                             <input
                                                                 type="email"
                                                                 value={guest.email || ''}
                                                                 onChange={(e) => {
                                                                     const updated = [...formData.extra_guests];
                                                                     updated[idx].email = e.target.value;
                                                                     setFormData({ ...formData, extra_guests: updated });
                                                                 }}
                                                                 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59]"
                                                                 placeholder="email@example.com"
                                                             />
                                                         </div>
                                                         <div>
                                                             <label className="block text-[10px] font-bold text-gray-700 mb-1">NID Number</label>
                                                             <input
                                                                 type="text"
                                                                 value={guest.nid_number || ''}
                                                                 onChange={(e) => {
                                                                     const updated = [...formData.extra_guests];
                                                                     updated[idx].nid_number = e.target.value;
                                                                     setFormData({ ...formData, extra_guests: updated });
                                                                 }}
                                                                 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] font-mono"
                                                                 placeholder="NID Number"
                                                             />
                                                         </div>
                                                         <div>
                                                             <label className="block text-[10px] font-bold text-gray-700 mb-1">Passport Number</label>
                                                             <input
                                                                 type="text"
                                                                 value={guest.passport_number || ''}
                                                                 onChange={(e) => {
                                                                     const updated = [...formData.extra_guests];
                                                                     updated[idx].passport_number = e.target.value;
                                                                     setFormData({ ...formData, extra_guests: updated });
                                                                 }}
                                                                 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] font-mono"
                                                                 placeholder="Passport Number"
                                                             />
                                                         </div>
                                                         <div>
                                                             <label className="block text-[10px] font-bold text-gray-700 mb-1">Extra Charge (BDT)</label>
                                                             <input
                                                                 type="number" min="0"
                                                                 value={guest.extra_charge}
                                                                 onChange={(e) => {
                                                                     const updated = [...formData.extra_guests];
                                                                     updated[idx].extra_charge = e.target.value;
                                                                     setFormData({ ...formData, extra_guests: updated });
                                                                 }}
                                                                 className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] font-bold text-emerald-600 font-mono"
                                                                 placeholder="0"
                                                             />
                                                         </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center border-2 border-dashed border-gray-200 rounded-xl">
                                            <p className="text-xs text-gray-400 font-medium">No additional guests added yet.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Stay Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Select {terms.room} *</label>
                                            <select 
                                                required
                                                value={formData.hms_room_id}
                                                onChange={(e) => {
                                                    const roomId = e.target.value;
                                                    const selectedRoom = rooms?.find(r => r.id === parseInt(roomId));
                                                    let roomTotal = formData.total_amount;
                                                    if (selectedRoom && formData.check_in_date && formData.check_out_date) {
                                                        const nights = Math.max(1, Math.ceil(Math.abs(formData.check_out_date - formData.check_in_date) / (1000 * 60 * 60 * 24)));
                                                        roomTotal = (selectedRoom.price || 0) * nights;
                                                    }
                                                    setFormData(prev => ({ ...prev, hms_room_id: roomId, total_amount: roomTotal }));
                                                }}
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
                                                onChange={(date) => {
                                                    let roomTotal = formData.total_amount;
                                                    if (date && formData.check_out_date && formData.hms_room_id) {
                                                        const selectedRoom = rooms?.find(r => r.id === parseInt(formData.hms_room_id));
                                                        if (selectedRoom) {
                                                            const nights = Math.max(1, Math.ceil(Math.abs(formData.check_out_date - date) / (1000 * 60 * 60 * 24)));
                                                            roomTotal = (selectedRoom.price || 0) * nights;
                                                        }
                                                    }
                                                    setFormData(prev => ({ ...prev, check_in_date: date, total_amount: roomTotal }));
                                                }}
                                                selectsStart
                                                startDate={formData.check_in_date}
                                                endDate={formData.check_out_date}
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
                                                onChange={(date) => {
                                                    let roomTotal = formData.total_amount;
                                                    if (date && formData.check_in_date && formData.hms_room_id) {
                                                        const selectedRoom = rooms?.find(r => r.id === parseInt(formData.hms_room_id));
                                                        if (selectedRoom) {
                                                            const nights = Math.max(1, Math.ceil(Math.abs(date - formData.check_in_date) / (1000 * 60 * 60 * 24)));
                                                            roomTotal = (selectedRoom.price || 0) * nights;
                                                        }
                                                    }
                                                    setFormData(prev => ({ ...prev, check_out_date: date, total_amount: roomTotal }));
                                                }}
                                                selectsEnd
                                                startDate={formData.check_in_date}
                                                endDate={formData.check_out_date}
                                                minDate={formData.check_in_date ? addDays(formData.check_in_date, 1) : null}
                                                maxDate={getMaxCheckOutDate()}
                                                excludeDates={(blockedDatesData?.blockedDates || [])
                                                    .map(d => parseISO(d))
                                                    .filter(date => {
                                                        const nextCheckIn = getMaxCheckOutDate();
                                                        if (nextCheckIn && isSameDay(date, nextCheckIn)) {
                                                            return false;
                                                        }
                                                        return true;
                                                    })
                                                }
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                                placeholderText="Select check-out"
                                                required
                                                dateFormat="MMM dd, yyyy"
                                            />
                                        </div>

                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Guests (Adults) *</label>
                                            <input 
                                                type="number" required min="1" max="20"
                                                value={formData.number_of_guests}
                                                onChange={(e) => setFormData({ ...formData, number_of_guests: parseInt(e.target.value) || 1 })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all text-sm font-semibold text-gray-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Children</label>
                                            <input 
                                                type="number" min="0" max="20"
                                                value={formData.number_of_children}
                                                onChange={(e) => setFormData({ ...formData, number_of_children: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all text-sm font-semibold text-gray-800"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Infants</label>
                                            <input 
                                                type="number" min="0" max="20"
                                                value={formData.number_of_infants}
                                                onChange={(e) => setFormData({ ...formData, number_of_infants: parseInt(e.target.value) || 0 })}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all text-sm font-semibold text-gray-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Information</h3>
                                    
                                    {formData.check_in_date && formData.check_out_date && formData.hms_room_id && (() => {
                                        const selectedRoom = rooms?.find(r => r.id === parseInt(formData.hms_room_id));
                                        const nights = Math.max(1, Math.ceil(Math.abs(formData.check_out_date - formData.check_in_date) / (1000 * 60 * 60 * 24)));
                                        const defaultRoomTotal = (selectedRoom?.price || 0) * nights;
                                        const roomSubtotal = parseFloat(formData.total_amount) || 0;
                                        const extraGuestChargesTotal = (formData.extra_guests || []).reduce((sum, g) => sum + (parseFloat(g.extra_charge) || 0), 0);
                                        const grandTotal = roomSubtotal + extraGuestChargesTotal;
                                        const isCustomRoomRate = roomSubtotal !== defaultRoomTotal;

                                        return (
                                            <div className="mb-4 p-5 bg-gradient-to-br from-[#004e59]/5 to-slate-50 border border-[#004e59]/15 rounded-2xl space-y-2.5">
                                                <p className="text-[10px] font-black text-[#004e59] uppercase tracking-wider mb-3">Billing Summary</p>

                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Standard Rate</span>
                                                    <span className="font-bold text-gray-700">BDT {selectedRoom?.price?.toLocaleString()} × {nights} nights</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Room Subtotal {isCustomRoomRate ? '(Custom/Discounted)' : ''}</span>
                                                    <span className={`font-bold ${isCustomRoomRate ? 'text-[#004e59]' : 'text-gray-900'}`}>BDT {roomSubtotal.toLocaleString()}</span>
                                                </div>

                                                {(formData.extra_guests || []).filter(g => parseFloat(g.extra_charge) > 0).map((g, i) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span className="text-gray-500">Extra Guest – {g.first_name || `Guest #${i+1}`}</span>
                                                        <span className="font-bold text-amber-600">+ BDT {parseFloat(g.extra_charge).toLocaleString()}</span>
                                                    </div>
                                                ))}

                                                {extraGuestChargesTotal > 0 && (
                                                    <div className="flex justify-between text-sm border-t border-[#004e59]/10 pt-2">
                                                        <span className="text-gray-500">Extra Guest Charges Total</span>
                                                        <span className="font-bold text-amber-600">+ BDT {extraGuestChargesTotal.toLocaleString()}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between pt-2.5 border-t-2 border-[#004e59]/20">
                                                    <span className="text-sm font-black text-[#004e59]">Grand Total</span>
                                                    <span className="text-lg font-black text-[#004e59]">BDT {grandTotal.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Room Amount (BDT) *</label>
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
                                            <p className="text-[10px] text-gray-400 mt-1">Base room charge only. Extra guest charges are added separately.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Payment Status</label>
                                            <select 
                                                value={formData.payment_status}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        payment_status: val,
                                                        paid_amount: val === 'paid' ? prev.total_amount : val === 'pending' ? '' : prev.paid_amount
                                                    }));
                                                }}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                                            >
                                                <option value="pending">Pending (No payment yet)</option>
                                                <option value="partial">Partial Payment</option>
                                                <option value="paid">Paid in Full</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Partial payment input */}
                                    {formData.payment_status === 'partial' && (() => {
                                        const extraCharges = (formData.extra_guests || []).reduce((s, g) => s + (parseFloat(g.extra_charge) || 0), 0);
                                        const computedGrandTotal = parseFloat(formData.total_amount || 0) + extraCharges;
                                        return (
                                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                                                <label className="block text-sm font-bold text-amber-800 mb-2">Amount Paid Now (BDT) *</label>
                                                <div className="relative">
                                                    <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
                                                    <input
                                                        type="number" required
                                                        min="1"
                                                        max={computedGrandTotal}
                                                        value={formData.paid_amount || ''}
                                                        onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                                                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 font-bold text-amber-700"
                                                        placeholder="Enter amount received..."
                                                    />
                                                </div>
                                                {formData.paid_amount && (
                                                    <div className="mt-2 flex justify-between items-center">
                                                        <p className="text-xs text-amber-700 font-semibold">
                                                            Remaining due: BDT {Math.max(0, computedGrandTotal - parseFloat(formData.paid_amount || 0)).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            of BDT {computedGrandTotal.toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Full payment confirmation pill */}
                                    {formData.payment_status === 'paid' && (() => {
                                        const extraCharges = (formData.extra_guests || []).reduce((s, g) => s + (parseFloat(g.extra_charge) || 0), 0);
                                        const computedGrandTotal = parseFloat(formData.total_amount || 0) + extraCharges;
                                        return (
                                            <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <p className="text-xs font-bold text-emerald-700">Full payment of BDT {computedGrandTotal.toLocaleString()} will be recorded on confirmation.</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button 
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); resetForm(); setEditingReservation(null); }}
                                    className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={createMutation.isLoading || updateMutation.isLoading}
                                    className="flex-1 py-3 bg-[#004e59] text-white rounded-xl font-bold hover:bg-[#003d4d] transition disabled:opacity-50 shadow-lg shadow-[#004e59]/20"
                                >
                                    {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : (editingReservation ? 'Save Changes' : 'Confirm Reservation')}
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

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200 p-6 space-y-4 transform scale-100 transition-all duration-300">
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${confirmModal.isDanger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                {confirmModal.isDanger ? (
                                    <FiAlertTriangle className="w-6 h-6" />
                                ) : (
                                    <FiInfo className="w-6 h-6" />
                                )}
                            </div>
                            <h3 className="text-base font-bold text-slate-800">{confirmModal.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">{confirmModal.message}</p>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold transition"
                            >
                                {confirmModal.cancelText}
                            </button>
                            <button
                                type="button"
                                onClick={confirmModal.onConfirm}
                                className={`flex-1 px-4 py-2.5 text-white rounded-xl text-xs font-bold transition shadow-sm ${confirmModal.isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#004e59] hover:bg-[#003d4d]'}`}
                            >
                                {confirmModal.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
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

            {selectGuestPhone && (
                <GuestProfileModal 
                    phone={selectGuestPhone} 
                    onClose={() => setSelectGuestPhone(null)} 
                />
            )}
        </div>
    );
};

export default HMSReservations;
