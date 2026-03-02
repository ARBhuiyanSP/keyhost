import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FiCalendar, FiLink, FiCopy, FiTrash2, FiPlus, FiChevronDown, FiSearch, FiMapPin } from 'react-icons/fi';
import api from '../../utils/api';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PropertyOwnerCalendar = () => {
    const { showSuccess, showError } = useToast();
    const queryClient = useQueryClient();
    const [selectedPropertyId, setSelectedPropertyId] = useState('');

    // Custom dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Provider custom dropdown state
    const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
    const [providerSearchQuery, setProviderSearchQuery] = useState('');
    const providerDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (providerDropdownRef.current && !providerDropdownRef.current.contains(event.target)) {
                setIsProviderDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Settings for iCal Import
    const [providerName, setProviderName] = useState('Airbnb');
    const [icalUrl, setIcalUrl] = useState('');

    // Fetch Owner's Properties
    const { data: propertiesData, isLoading: propsLoading } = useQuery('owner-properties-list', async () => {
        const res = await api.get('/property-owner/properties?limit=100');
        return res.data?.data?.properties || [];
    });

    // Fetch Bookings for full calendar
    const { data: bookingsData, isLoading: bookingsLoading } = useQuery(
        ['owner-calendar-bookings', selectedPropertyId],
        async () => {
            if (!selectedPropertyId) return [];
            // We can use the existing bookings list API but pass property_id
            const res = await api.get(`/property-owner/bookings?property_id=${selectedPropertyId}&limit=100`);
            return res.data?.data?.bookings || [];
        },
        { enabled: !!selectedPropertyId }
    );

    // Fetch External Calendars (iCal Links)
    const { data: calendarsData, isLoading: calendarsLoading } = useQuery(
        ['owner-external-calendars', selectedPropertyId],
        async () => {
            if (!selectedPropertyId) return [];
            const res = await api.get(`/ical/calendars/${selectedPropertyId}`);
            return res.data?.calendars || [];
        },
        { enabled: !!selectedPropertyId }
    );

    // Add External Calendar Mutation
    const addCalendarMutation = useMutation(
        (newCal) => api.post('/ical/import', newCal),
        {
            onSuccess: () => {
                showSuccess('Calendar link added and synced successfully!');
                setIcalUrl('');
                queryClient.invalidateQueries(['owner-external-calendars', selectedPropertyId]);
                queryClient.invalidateQueries(['owner-calendar-bookings', selectedPropertyId]);
            },
            onError: (error) => {
                showError(error.response?.data?.message || 'Failed to add calendar link');
            }
        }
    );

    // Delete External Calendar Mutation
    const deleteCalendarMutation = useMutation(
        (id) => api.delete(`/ical/calendars/${id}`),
        {
            onSuccess: () => {
                showSuccess('Calendar link removed successfully!');
                queryClient.invalidateQueries(['owner-external-calendars', selectedPropertyId]);
            },
            onError: (error) => {
                showError('Failed to remove calendar link');
            }
        }
    );

    useEffect(() => {
        if (propertiesData && propertiesData.length > 0 && !selectedPropertyId) {
            setSelectedPropertyId(propertiesData[0].id.toString());
        }
    }, [propertiesData, selectedPropertyId]);

    const handleCopyExportLink = () => {
        if (!selectedPropertyId) return;
        const exportUrl = `${window.location.protocol}//${window.location.host}/api/ical/export/${selectedPropertyId}`;
        navigator.clipboard.writeText(exportUrl);
        showSuccess('Export link copied to clipboard!');
    };

    const handleAddIcalLink = (e) => {
        e.preventDefault();
        if (!selectedPropertyId || !providerName || !icalUrl) {
            showError('Please fill in all fields');
            return;
        }
        addCalendarMutation.mutate({
            propertyId: selectedPropertyId,
            providerName,
            icalUrl
        });
    };

    // Prepare events for FullCalendar
    const calendarEvents = (bookingsData || []).map(booking => {
        const isExternal = booking.source && booking.source !== 'Internal';
        const checkin = new Date(booking.check_in_date);
        const checkout = new Date(booking.check_out_date);
        // For FullCalendar, to make checkout day exclusive, we add 1 day to end date
        checkout.setDate(checkout.getDate() + 1);

        return {
            id: booking.id,
            title: isExternal ? `Blocked (${booking.source})` : `${booking.guest_name} (${booking.status})`,
            start: checkin.toISOString().split('T')[0],
            end: checkout.toISOString().split('T')[0],
            backgroundColor: isExternal ? '#ef4444' : (booking.status === 'confirmed' ? '#10b981' : '#f59e0b'),
            borderColor: isExternal ? '#dc2626' : (booking.status === 'confirmed' ? '#059669' : '#d97706'),
            extendedProps: { booking }
        };
    });

    const filteredProperties = propertiesData?.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())) || [];
    const selectedProperty = propertiesData?.find(p => p.id.toString() === selectedPropertyId);

    const providerOptions = ['Airbnb', 'Booking.com', 'Agoda', 'Expedia', 'Vrbo', 'TripAdvisor', 'Other'];
    const filteredProviders = providerOptions.filter(p => p.toLowerCase().includes(providerSearchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-5 md:p-8">
            <div className="max-w-7xl mx-auto space-y-5 md:space-y-6">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <FiCalendar className="text-primary-600" /> Availability & Sync
                        </h1>
                        <p className="text-gray-600 mt-1">Manage calendar and sync with external platforms.</p>
                    </div>

                    <div className="w-full md:w-[500px] lg:w-[600px] xl:w-[700px] relative" ref={dropdownRef}>
                        <div
                            className="w-full bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between cursor-pointer hover:border-primary-500 transition-all font-medium text-gray-800"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <FiMapPin className="text-primary-500 flex-shrink-0" size={18} />
                                <span className="truncate">
                                    {selectedProperty ? selectedProperty.title : 'Select a property...'}
                                </span>
                            </div>
                            <FiChevronDown className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden origin-top animate-fade-in-down">
                                <div className="p-2 border-b border-gray-50 bg-gray-50/80">
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search properties..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>
                                <div className="max-h-[240px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
                                    {filteredProperties.length > 0 ? (
                                        filteredProperties.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedPropertyId(p.id.toString());
                                                    setIsDropdownOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className={`px-3 py-2.5 rounded-lg cursor-pointer text-sm md:text-base mb-1 transition-all duration-200 flex items-center gap-3 ${selectedPropertyId === p.id.toString()
                                                    ? 'bg-primary-50 text-primary-800 font-semibold shadow-sm border border-primary-100'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                                                    }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${selectedPropertyId === p.id.toString() ? 'bg-primary-600' : 'bg-gray-200'}`} />
                                                <span className="truncate">{p.title}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-8 text-center flex flex-col items-center justify-center gap-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                                <FiSearch className="text-gray-400" size={18} />
                                            </div>
                                            <p className="text-sm font-medium text-gray-600">No matching properties</p>
                                            <p className="text-xs text-gray-400">Try adjusting your search</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {propsLoading ? <LoadingSpinner /> : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Calendar View */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 w-full overflow-hidden">
                            {bookingsLoading ? <LoadingSpinner /> : (
                                <div className="calendar-container w-full overflow-x-auto pb-2">
                                    <div className="min-w-[450px]">
                                        <FullCalendar
                                            plugins={[dayGridPlugin, interactionPlugin]}
                                            initialView="dayGridMonth"
                                            events={calendarEvents}
                                            headerToolbar={{
                                                left: 'prev,next today',
                                                center: 'title',
                                                right: 'dayGridMonth'
                                            }}
                                            height="auto"
                                            eventClick={(info) => {
                                                // show message or modal
                                                const { booking } = info.event.extendedProps;
                                                const msg = `Booking Ref: ${booking.booking_reference}\nGuest: ${booking.guest_name || 'External'}\nStatus: ${booking.status}\nSource: ${booking.source || 'Internal'}`;
                                                alert(msg);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sync Settings View */}
                        <div className="space-y-6">

                            {/* Export Link */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                    <FiCopy className="text-blue-500" /> Export Calendar
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Copy this link and paste it into Airbnb, Booking.com, or other platforms to sync Keyhost availability.
                                </p>
                                <button
                                    onClick={handleCopyExportLink}
                                    disabled={!selectedPropertyId}
                                    className="w-full btn-primary flex justify-center items-center gap-2 py-3"
                                >
                                    <FiCopy /> Copy iCal Export Link
                                </button>
                            </div>

                            {/* Import Links */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                    <FiLink className="text-green-500" /> Import External Calendar
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Paste the iCal link from Airbnb or Booking.com block dates on Keyhost.
                                </p>

                                <form onSubmit={handleAddIcalLink} className="space-y-4">
                                    <div className="relative" ref={providerDropdownRef}>
                                        <div
                                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm font-medium text-gray-700 shadow-sm"
                                            onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
                                        >
                                            <span className="truncate">{providerName || 'Select Provider'}</span>
                                            <FiChevronDown className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${isProviderDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                        </div>

                                        {isProviderDropdownOpen && (
                                            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden origin-top animate-fade-in-down">
                                                <div className="p-2 border-b border-gray-50 bg-gray-50/80">
                                                    <div className="relative">
                                                        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                                        <input
                                                            type="text"
                                                            placeholder="Search providers..."
                                                            value={providerSearchQuery}
                                                            onChange={(e) => setProviderSearchQuery(e.target.value)}
                                                            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary-500 transition-all"
                                                            autoFocus
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-[180px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                                    {filteredProviders.length > 0 ? (
                                                        filteredProviders.map(p => (
                                                            <div
                                                                key={p}
                                                                onClick={() => {
                                                                    setProviderName(p);
                                                                    setIsProviderDropdownOpen(false);
                                                                    setProviderSearchQuery('');
                                                                }}
                                                                className={`px-3 py-2 rounded-md cursor-pointer text-sm mb-0.5 transition-all flex items-center gap-2 ${providerName === p
                                                                        ? 'bg-primary-50 text-primary-700 font-medium'
                                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                                    }`}
                                                            >
                                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${providerName === p ? 'bg-primary-500' : 'bg-transparent'}`} />
                                                                {p}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-4 text-center">
                                                            <p className="text-xs text-gray-500">No providers found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="url"
                                            placeholder="Paste iCal URL here..."
                                            value={icalUrl}
                                            onChange={e => setIcalUrl(e.target.value)}
                                            className="w-full input-field"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={addCalendarMutation.isLoading || !selectedPropertyId}
                                        className="w-full btn-secondary flex justify-center items-center gap-2 py-2"
                                    >
                                        {addCalendarMutation.isLoading ? <LoadingSpinner size="small" /> : <><FiPlus /> Save & Sync Link</>}
                                    </button>
                                </form>

                                {/* Imported Links List */}
                                <div className="mt-6">
                                    <h4 className="font-semibold text-gray-800 text-sm mb-3">Active Sync Links</h4>
                                    {calendarsLoading ? <LoadingSpinner size="small" /> : calendarsData?.length > 0 ? (
                                        <ul className="space-y-3">
                                            {calendarsData.map(cal => (
                                                <li key={cal.id} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div className="flex justify-between items-start">
                                                        <div className="font-medium text-sm text-gray-900">{cal.provider_name}</div>
                                                        <button
                                                            onClick={() => deleteCalendarMutation.mutate(cal.id)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                            title="Remove link"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate mt-1 max-w-[200px]" title={cal.ical_url}>
                                                        {cal.ical_url}
                                                    </div>
                                                    <div className="text-xs text-green-600 mt-2">
                                                        Last synced: {cal.last_sync ? new Date(cal.last_sync).toLocaleString() : 'Never'}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">No external links added yet.</p>
                                    )}
                                </div>

                            </div>

                        </div>
                    </div>
                )}

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
         .calendar-container .fc {
           font-family: inherit;
           color: #374151;
           font-size: 0.875rem;
         }
         .calendar-container .fc-toolbar-title {
           font-size: 1.25rem !important;
           font-weight: 700;
         }
         .calendar-container .fc-button-primary {
           background-color: #f3f4f6 !important;
           border-color: #e5e7eb !important;
           color: #374151 !important;
           font-weight: 500;
           text-transform: capitalize;
         }
         .calendar-container .fc-button-primary:hover {
           background-color: #e5e7eb !important;
         }
         .calendar-container .fc-button-active {
           background-color: #e5e7eb !important;
           border-color: #d1d5db !important;
           color: #111827 !important;
         }
         .calendar-container .fc-daygrid-day-number {
           color: #111827;
           font-weight: 500;
         }
         .calendar-container .fc-event {
           cursor: pointer;
           border-radius: 4px;
           padding: 2px 4px;
           margin-top: 2px;
         }
         .calendar-container .fc-event-title {
           font-weight: 500;
         }

         /* Custom Scrollbar */
         .scrollbar-thin::-webkit-scrollbar {
             width: 6px;
         }
         .scrollbar-thin::-webkit-scrollbar-track {
             background: transparent; 
         }
         .scrollbar-thin::-webkit-scrollbar-thumb {
             background-color: #e5e7eb; 
             border-radius: 20px;
         }
         .scrollbar-thin::-webkit-scrollbar-thumb:hover {
             background-color: #d1d5db; 
         }
         
         @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-5px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
         }
         .animate-fade-in-down {
            animation: fadeInDown 0.15s ease-out forwards;
         }

         /* Responsive Calendar Tweaks */
         @media (max-width: 640px) {
           .calendar-container .fc-toolbar {
             flex-direction: column;
             gap: 12px;
           }
           .calendar-container .fc-toolbar-chunk:first-child {
             order: 2;
           }
           .calendar-container .fc-toolbar-chunk:nth-child(2) {
             order: 1;
             margin-bottom: 4px;
           }
           .calendar-container .fc-toolbar-chunk:last-child {
             order: 3;
           }
           .calendar-container .fc-toolbar-title {
             font-size: 1.1rem !important;
           }
           .calendar-container .fc-button {
             padding: 0.3rem 0.6rem !important;
             font-size: 0.8rem !important;
           }
         }
      `}} />
        </div>
    );
};

export default PropertyOwnerCalendar;
