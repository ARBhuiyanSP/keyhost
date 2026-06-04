import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiHome, FiPlus, FiEdit, FiEye, FiTrash2, FiMapPin, FiStar, FiDollarSign, FiCalendar, FiUsers, FiLink, FiX, FiCopy, FiCheck, FiChevronDown, FiPackage } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice } from '../../utils/textUtils';
import useToast from '../../hooks/useToast';

const BookingLinkModal = ({ property: initialProperty, onClose }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 86400000));
  const [guests, setGuests] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [monthsShown, setMonthsShown] = useState(window.innerWidth < 768 ? 1 : 2);
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Handle mobile responsiveness for calendar
  React.useEffect(() => {
    const handleResize = () => setMonthsShown(window.innerWidth < 768 ? 1 : 2);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch full property details
  const { data: propertyData } = useQuery(
    ['property-link-details', initialProperty.id],
    () => api.get(`/properties/${initialProperty.id}`),
    { select: (res) => res.data?.data?.property }
  );

  const property = propertyData || initialProperty;
  const hmsRooms = property?.hms_rooms || [];
  const isHMSMultiRoom = property?.is_hms_enabled === 1 && property?.is_single_unit !== 1 && property?.is_single_unit !== true;

  // Set default selection to first room
  React.useEffect(() => {
    if (property?.is_hms_enabled === 1 && hmsRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(hmsRooms[0].id);
    }
  }, [property, hmsRooms, selectedRoomId]);

  const selectedRoom = hmsRooms.find(r => r.id === selectedRoomId);
  const activeBasePrice = selectedRoom ? parseFloat(selectedRoom.price) : parseFloat(property?.base_price || 0);

  const { data: blockedDatesData } = useQuery(
    ['blockedDates-link', initialProperty.id, selectedRoomId],
    () => api.get(`/properties/${initialProperty.id}/blocked-dates${selectedRoomId ? `?hms_room_id=${selectedRoomId}` : ''}`),
    { select: (res) => res.data?.data || { blockedDates: [], checkInDates: [] } }
  );

  const blockedDates = blockedDatesData?.blockedDates || [];
  const availabilityMap = React.useMemo(() => {
    const map = {};
    (property?.availability_data || []).forEach(a => { map[a.date] = a; });
    return map;
  }, [property?.availability_data]);

  const isDateBlocked = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    return blockedDates.includes(dateStr);
  };

  const renderDayContents = (day, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isBlocked = isDateBlocked(date);
    const match = availabilityMap[dateStr];
    const hasSpecialRate = match && Number(match.is_available) === 1 && match.price && parseFloat(match.price) !== activeBasePrice;
    const price = hasSpecialRate ? parseFloat(match.price) : activeBasePrice;

    return (
      <div className="day-cell-wrapper flex flex-col items-center leading-none gap-[1px] pt-[3px]">
        <span className={`text-[12px] ${hasSpecialRate && !isBlocked ? 'font-bold text-indigo-600' : 'font-medium'}`}>{day}</span>
        {!isBlocked && price && (
          <span className={`text-[8px] font-bold ${hasSpecialRate ? 'text-indigo-600' : 'text-gray-400'}`}>
            ৳{formatPrice(price)}
          </span>
        )}
      </div>
    );
  };
  const nights = React.useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  const totalAmount = React.useMemo(() => {
    if (nights <= 0) return 0;
    return (nights * activeBasePrice) + 
           (parseFloat(property?.cleaning_fee) || 0) + 
           (parseFloat(property?.security_deposit) || 0) + 
           (guests > 1 ? (guests - 1) * (parseFloat(property?.extra_guest_fee) || 0) : 0);
  }, [nights, property, guests, activeBasePrice]);

  const baseUrl = window.location.origin;
  const effectiveCustomPrice = parseFloat(customPriceInput);
  const hasCustomPrice = !isNaN(effectiveCustomPrice) && effectiveCustomPrice > 0 && effectiveCustomPrice < totalAmount;
  const bookingLink = `${baseUrl}/property/${property.slug || property.id}?checkIn=${startDate?.toISOString().split('T')[0]}&checkOut=${endDate?.toISOString().split('T')[0]}&guests=${guests}&direct=true${hasCustomPrice ? `&customPrice=${effectiveCustomPrice}` : ''}${selectedRoomId ? `&hms_room_id=${selectedRoomId}` : ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsCalendarOpen(false)}>
      <div className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-[380px] w-full overflow-visible animate-in fade-in slide-in-from-bottom-4 duration-300 relative border border-gray-100" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Internal Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all z-10"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Price Header */}
          <div className="flex items-baseline gap-1 mb-5">
             <span className="text-xl font-black text-gray-900 italic tracking-tight">৳{formatPrice(activeBasePrice)}</span>
             <span className="text-gray-500 font-medium text-xs">/ night</span>
          </div>

          <div className="space-y-4">
            {/* Unified Box */}
            <div className="relative border-2 border-gray-900 rounded-2xl overflow-visible shadow-sm bg-white">
               <div className="grid grid-cols-2 divide-x-2 divide-gray-900 cursor-pointer" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                  <div className="p-3 hover:bg-gray-50 transition-colors">
                     <label className="block text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1 leading-none">Check-in</label>
                     <div className="text-[12px] font-bold text-gray-900">{startDate ? startDate.toLocaleDateString() : 'Add date'}</div>
                  </div>
                  <div className="p-3 hover:bg-gray-50 transition-colors">
                     <label className="block text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1 leading-none">Checkout</label>
                     <div className="text-[12px] font-bold text-gray-900">{endDate ? endDate.toLocaleDateString() : 'Add date'}</div>
                  </div>
               </div>

               {isHMSMultiRoom && hmsRooms.length > 0 && (
                 <div className="p-3 border-t-2 border-gray-900 relative">
                    <label className="block text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1 leading-none">Room</label>
                    <select value={selectedRoomId || ''} onChange={(e) => setSelectedRoomId(parseInt(e.target.value) || null)} className="w-full text-[12px] font-bold text-gray-900 outline-none bg-transparent cursor-pointer appearance-none pr-8">
                       {hmsRooms.map((room) => (
                         <option key={room.id} value={room.id}>Room {room.room_number} ({room.room_type}) - ৳{formatPrice(room.price)}/night</option>
                       ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-[60%] -translate-y-1/2 w-3.5 h-3.5 text-gray-900 pointer-events-none" />
                 </div>
               )}

               <div className="p-3 border-t-2 border-gray-900 relative">
                  <label className="block text-[9px] font-black text-gray-900 uppercase tracking-widest mb-1 leading-none">Guests</label>
                  <select value={guests} onChange={(e) => setGuests(parseInt(e.target.value))} className="w-full text-[12px] font-bold text-gray-900 outline-none bg-transparent cursor-pointer appearance-none pr-8">
                     {[...Array(property.max_guests || 10)].map((_, i) => (
                       <option key={i+1} value={i+1}>{i+1} Guest{i > 0 ? 's' : ''}</option>
                     ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-[60%] -translate-y-1/2 w-3.5 h-3.5 text-gray-900 pointer-events-none" />
               </div>

               {/* Centered Fixed Calendar Modal */}
               {isCalendarOpen && (
                 <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-gray-100 z-[200] animate-in fade-in zoom-in duration-300 origin-center ${monthsShown === 1 ? 'w-[92%] p-5' : 'w-[750px] p-10'}`}>
                    <button 
                       onClick={(e) => { e.stopPropagation(); setIsCalendarOpen(false); }}
                       className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                       <FiX className="w-6 h-6 text-gray-400" />
                    </button>
                    <style>{`
                      .custom-double-datepicker .react-datepicker { border: none !important; font-family: inherit !important; display: flex !important; flex-wrap: wrap; }
                      .custom-double-datepicker .react-datepicker__month-container { padding: 0 10px !important; }
                      .custom-double-datepicker .react-datepicker__header { background-color: white !important; border-bottom: none !important; padding-top: 0 !important; }
                      .custom-double-datepicker .react-datepicker__current-month { font-size: 16px !important; font-weight: 800 !important; margin-bottom: 20px !important; color: #111 !important; }
                      .custom-double-datepicker .react-datepicker__day-name { color: #888 !important; font-weight: 600 !important; width: 34px !important; margin: 4px !important; font-size: 11px !important; }
                      .custom-double-datepicker .react-datepicker__day { width: 34px !important; line-height: 34px !important; margin: 4px !important; border-radius: 10px !important; font-weight: 600 !important; color: #444 !important; font-size: 13px !important; }
                      .custom-double-datepicker .react-datepicker__day:hover { background-color: #f3f4f6 !important; }
                      .custom-double-datepicker .react-datepicker__day--selected, .custom-double-datepicker .react-datepicker__day--in-range { background-color: #111 !important; color: white !important; border-radius: 10px !important; }
                      .custom-double-datepicker .react-datepicker__day--keyboard-selected { background-color: transparent !important; }
                    `}</style>
                    <div className="flex justify-between items-start mb-6 pr-10">
                      <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight italic">Select travel dates</h2>
                        <p className="text-gray-400 text-xs font-medium">Pick your check-in and check-out days</p>
                      </div>
                    </div>
                    <div className="flex justify-center mb-5 custom-double-datepicker">
                      <DatePicker selected={startDate} onChange={(dates) => {
                        const [start, end] = dates; setStartDate(start); setEndDate(end);
                        if (start && end) setTimeout(() => setIsCalendarOpen(false), 300);
                      }} startDate={startDate} endDate={endDate} selectsRange monthsShown={monthsShown} inline minDate={new Date()} renderDayContents={renderDayContents} disabledKeyboardNavigation filterDate={(date) => !isDateBlocked(date)} />
                    </div>
                    <div className="flex justify-end gap-3 items-center">
                      <button onClick={(e) => { e.stopPropagation(); setStartDate(null); setEndDate(endDate && null); }} className="text-xs font-black text-gray-900 underline px-3 decoration-2 underline-offset-4">Clear</button>
                      <button onClick={(e) => { e.stopPropagation(); setIsCalendarOpen(false); }} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all">Apply</button>
                    </div>
                 </div>
               )}
            </div>

            {/* Detailed Amount Summary Section */}
            {nights > 0 && (
              <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                 <div className="flex justify-between text-sm font-medium text-gray-600">
                    <span className="underline underline-offset-4 decoration-gray-200">৳{formatPrice(activeBasePrice)} x {nights} nights</span>
                    <span>৳{formatPrice(nights * activeBasePrice)}</span>
                 </div>
                 
                 {parseFloat(property?.cleaning_fee) > 0 && (
                   <div className="flex justify-between text-sm font-medium text-gray-600">
                      <span className="underline underline-offset-4 decoration-gray-200">Cleaning fee</span>
                      <span>৳{formatPrice(property.cleaning_fee)}</span>
                   </div>
                 )}

                 {parseFloat(property?.security_deposit) > 0 && (
                   <div className="flex justify-between text-sm font-medium text-gray-600">
                      <span className="underline underline-offset-4 decoration-gray-200">Security deposit</span>
                      <span>৳{formatPrice(property.security_deposit)}</span>
                   </div>
                 )}

                 {guests > 1 && parseFloat(property?.extra_guest_fee) > 0 && (
                   <div className="flex justify-between text-sm font-medium text-gray-600">
                      <span className="underline underline-offset-4 decoration-gray-200">Extra guest fee ({guests - 1} extension)</span>
                      <span>৳{formatPrice((guests - 1) * parseFloat(property.extra_guest_fee))}</span>
                   </div>
                 )}

                  {hasCustomPrice && (
                    <div className="flex justify-between text-sm font-bold text-green-600">
                       <span>Host Discount</span>
                       <span>-৳{formatPrice(totalAmount - effectiveCustomPrice)}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-3 border-t-2 border-gray-900 text-lg font-black text-gray-900">
                     <span>Total</span>
                     <span>৳{formatPrice(hasCustomPrice ? effectiveCustomPrice : totalAmount)}</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-200">
                     <label className="block text-[9px] font-black text-gray-700 uppercase tracking-widest mb-1">
                       Customize Total Price (Discount)
                     </label>
                     <div className="relative rounded-xl border border-gray-300 shadow-sm overflow-hidden flex items-center bg-white focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900">
                       <span className="pl-3 text-gray-500 font-bold text-sm">৳</span>
                       <input
                         type="number"
                         placeholder={`Decrease total (max ৳${Math.floor(totalAmount)})`}
                         value={customPriceInput}
                         onChange={(e) => setCustomPriceInput(e.target.value)}
                         className="w-full pl-1 pr-3 py-2 text-sm font-bold text-gray-900 placeholder-gray-400 outline-none border-none focus:ring-0"
                       />
                     </div>
                     {customPriceInput && !hasCustomPrice && (
                       <p className="text-[10px] text-red-500 font-medium mt-1">
                         Custom price must be a positive number less than the standard total (৳{Math.floor(totalAmount)}).
                       </p>
                     )}
                     {hasCustomPrice && (
                       <p className="text-[10px] text-green-600 font-bold mt-1">
                         Applied Discount: ৳{formatPrice(totalAmount - effectiveCustomPrice)}!
                       </p>
                     )}
                  </div>
              </div>
            )}



            <div className="pt-4 border-t border-gray-100 space-y-2">
               <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Shareable Link</span>
                  {copied && <span className="text-[9px] font-bold text-green-600 animate-bounce">Copied !</span>}
               </div>
               <div className="flex gap-2">
                  <input readOnly value={bookingLink} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[10px] font-mono text-gray-400 outline-none" />
                  <button onClick={handleCopy} className={`w-10 rounded-xl transition-all shadow-md flex items-center justify-center ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'}`}>
                    {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



const MyProperties = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 6
  });
  const [selectedPropertyForLink, setSelectedPropertyForLink] = useState(null);

  // Fetch property owner's properties
  const { data: propertiesData, isLoading, refetch } = useQuery(
    ['owner-properties', filters],
    () => api.get(`/property-owner/properties?${new URLSearchParams(filters).toString()}`),
    {
      select: (response) => response.data?.data || { properties: [], pagination: {} },
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      [key]: value
    }));
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        const response = await api.delete(`/property-owner/properties/${propertyId}`);
        console.log('Delete response:', response);

        if (response.data?.success) {
          alert('Property deleted successfully!');
          refetch();
        } else {
          alert(response.data?.message || 'Failed to delete property');
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        alert(error.response?.data?.message || 'Failed to delete property. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (propertyId, currentStatus) => {
    if (currentStatus !== 'active' && currentStatus !== 'inactive') return;

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await api.patch(`/property-owner/properties/${propertyId}/status`, { status: newStatus });
      if (response.data?.success) {
        showSuccess(response.data?.message || `Property status updated to ${newStatus} successfully`);
        refetch();
      } else {
        showError(response.data?.message || 'Failed to update property status');
      }
    } catch (error) {
      console.error('Error toggling property status:', error);
      showError(error.response?.data?.message || 'Failed to toggle status. Please try again.');
    }
  };

  const handleToggleAutoAccept = async (propertyId, currentAutoAccept) => {
    const newAutoAccept = !currentAutoAccept;
    try {
      const response = await api.put(`/property-owner/properties/${propertyId}`, { auto_accept_bookings: newAutoAccept });
      if (response.data?.success) {
        showSuccess(newAutoAccept ? 'Auto Accept enabled successfully' : 'Auto Accept disabled successfully');
        refetch();
      } else {
        showError(response.data?.message || 'Failed to update auto accept setting');
      }
    } catch (error) {
      console.error('Error toggling auto accept:', error);
      showError(error.response?.data?.message || 'Failed to toggle auto accept. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyTypeColor = (type) => {
    switch (type) {
      case 'room':
        return 'bg-blue-100 text-blue-800';
      case 'villa':
        return 'bg-green-100 text-green-800';
      case 'apartment':
        return 'bg-purple-100 text-purple-800';
      case 'house':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
              <p className="text-gray-600 mt-2">Manage your property listings</p>
            </div>
            <button
              onClick={() => navigate('/property-owner/properties/new')}
              className="btn-primary flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Property
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="input-field w-auto"
              >
                <option value="">All Properties</option>
                <option value="active">Active</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="in_progress">In Progress (Draft)</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="loading-skeleton h-48"></div>
                <div className="p-6">
                  <div className="loading-skeleton h-4 mb-2"></div>
                  <div className="loading-skeleton h-4 w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : propertiesData?.properties?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesData.properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                {/* Property Image */}
                <div className="relative">
                  <img
                    src={property.main_image?.image_url || '/images/placeholder.svg'}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPropertyTypeColor(property.property_type)}`}>
                      {property.property_type}
                    </span>
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
                    {property.title}
                  </h3>

                  <p className="text-gray-600 flex items-center text-sm mb-4">
                    <FiMapPin className="mr-1" />
                    {property.city}, {property.state}
                  </p>

                  {/* Toggles Container - Side-by-side on desktop, stacked on mobile */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                    {/* Toggle Listing Status Switch */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 flex-1">
                      <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">Listing Status</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-bold capitalize ${
                          property.status === 'active' ? 'text-green-600' : 
                          property.status === 'inactive' ? 'text-gray-500' : 
                          property.status === 'suspended' ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {property.status?.replace('_', ' ')}
                        </span>
                        {(property.status === 'active' || property.status === 'inactive') ? (
                          <button
                            onClick={() => handleToggleStatus(property.id, property.status)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                              property.status === 'active' ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                            role="switch"
                            aria-checked={property.status === 'active'}
                            title="Toggle active/inactive status"
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                property.status === 'active' ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        ) : (
                          <button
                            disabled
                            className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-gray-100 opacity-60"
                            title={
                              property.status === 'suspended' ? 'Suspended by admin' : 
                              property.status === 'in_progress' ? 'Complete draft setup to activate' : 
                              'Pending admin approval'
                            }
                          >
                            <span
                              aria-hidden="true"
                              className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-gray-300 shadow ring-0"
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Toggle Auto Accept Switch */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-1">
                      <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">Auto Accept</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-bold ${
                          property.auto_accept_bookings === 1 || property.auto_accept_bookings === true ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {property.auto_accept_bookings === 1 || property.auto_accept_bookings === true ? 'On' : 'Off'}
                        </span>
                        <button
                          onClick={() => handleToggleAutoAccept(property.id, property.auto_accept_bookings)}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            property.auto_accept_bookings === 1 || property.auto_accept_bookings === true ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                          role="switch"
                          aria-checked={property.auto_accept_bookings === 1 || property.auto_accept_bookings === true}
                          title="Toggle auto-accept bookings"
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              property.auto_accept_bookings === 1 || property.auto_accept_bookings === true ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                    <div className="flex items-center text-gray-600">
                      <FiDollarSign className="mr-1" />
                      <span className="font-bold text-red-600">BDT {formatPrice(property.base_price)}/night</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiUsers className="mr-1" />
                      <span>Max {property.max_guests} guests</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiStar className="mr-1" />
                      <span>{property.average_rating || 'New'} Rating</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiCalendar className="mr-1" />
                      <span>{property.total_reviews || 0} reviews</span>
                    </div>
                  </div>

                  {/* Listing Progress for Drafts */}
                  {property.status === 'in_progress' && (
                    <div className="mb-4 bg-orange-50 border border-orange-100 rounded-lg p-3">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Listing Progress</span>
                          <span className="text-[10px] font-bold text-orange-700">60%</span>
                       </div>
                       <div className="w-full h-1.5 bg-orange-200 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 w-[60%]"></div>
                       </div>
                       <p className="text-[10px] text-orange-600 mt-2 font-medium">
                          Add photos and pricing to publish
                       </p>
                    </div>
                  )}

                  {/* Booking Link Button - New Feature */}
                  {property.status === 'active' && (
                    <button 
                      onClick={() => setSelectedPropertyForLink(property)}
                      className="mb-4 w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-indigo-100 transition-colors border border-indigo-100"
                    >
                      <FiLink className="mr-2" />
                      Share Booking Link
                    </button>
                  )}

                  {/* Actions */}
                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/property/${property.slug || property.id}`)}
                        className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                      >
                        <FiEye className="mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/property-owner/properties/${property.id}/edit`)}
                        className="flex-1 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 flex items-center justify-center"
                      >
                        {property.status === 'in_progress' ? (
                          <>
                            <FiEdit className="mr-1" />
                            Resume
                          </>
                        ) : (
                          <>
                            <FiEdit className="mr-1" />
                            Edit
                          </>
                        )}
                      </button>
                      {property.status !== 'active' && (
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Property"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>

                    {property.is_hms_enabled === 1 && property.is_single_unit !== 1 && property.is_single_unit !== true && (
                      <button
                        onClick={() => {
                          localStorage.setItem('hms_selected_property_id', property.id);
                          localStorage.setItem('hms_selected_property_type', property.property_type || 'hotel');
                          window.dispatchEvent(new Event('hmsPropertyChange'));
                          navigate('/property-owner/hms/rooms');
                        }}
                        className="w-full py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 flex items-center justify-center shadow-sm"
                      >
                        <FiPackage className="mr-2" />
                        Manage HMS Rooms
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiHome className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {filters.status
                ? `No properties with status "${filters.status}" found.`
                : "You haven't added any properties yet."
              }
            </p>
            <button
              onClick={() => navigate('/property-owner/properties/new')}
              className="btn-primary"
            >
              <FiPlus className="inline mr-2" />
              Add Your First Property
            </button>
          </div>
        )}

        {/* Pagination */}
        {propertiesData?.pagination && propertiesData.pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFilterChange('page', propertiesData.pagination.prevPage)}
                disabled={!propertiesData.pagination.hasPrevPage}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-sm text-gray-700">
                Page {propertiesData.pagination.currentPage} of {propertiesData.pagination.totalPages}
              </span>

              <button
                onClick={() => handleFilterChange('page', propertiesData.pagination.nextPage)}
                disabled={!propertiesData.pagination.hasNextPage}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Link Modal */}
      {selectedPropertyForLink && (
        <BookingLinkModal 
          property={selectedPropertyForLink} 
          onClose={() => setSelectedPropertyForLink(null)} 
        />
      )}
    </div>
  );
};

export default MyProperties;

