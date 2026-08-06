import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FiChevronLeft, FiSend, FiUser, FiInfo, FiMapPin, FiCalendar, 
  FiDollarSign, FiClock, FiCheck, FiX, FiAlertTriangle 
} from 'react-icons/fi';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';
import useSettingsStore from '../../store/settingsStore';
import { getImageUrl } from '../../utils/imageUrl';
import { checkMessageCensorship } from '../../utils/censorship';

const BookingNegotiation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [proposedPrice, setProposedPrice] = useState('');
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // mobile: 'chat' | 'details'

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all negotiation details (booking info + chat conversation + messages)
  const { data, isLoading, refetch } = useQuery(
    ['booking-negotiation', bookingId],
    async () => {
      const response = await api.get(`/messages/booking-negotiation/${bookingId}`);
      return response.data?.data || null;
    },
    {
      enabled: !!bookingId,
      onError: (err) => {
        showError(err.response?.data?.message || 'Failed to load booking negotiation details');
        navigate(user?.user_type === 'guest' ? '/guest/bookings' : '/property-owner/bookings');
      }
    }
  );

  const booking = data?.booking || null;
  const conversationId = data?.conversationId || null;
  const messages = data?.messages || [];

  // Poll for new messages every 4 seconds
  useEffect(() => {
    if (!bookingId) return;
    const interval = setInterval(() => {
      refetch();
    }, 4000);
    return () => clearInterval(interval);
  }, [bookingId, refetch]);

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex justify-center bg-gray-50">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004e59]"></div>
          <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest">Loading negotiation details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Negotiation details not found</h2>
        <button
          onClick={() => navigate(user?.user_type === 'guest' ? '/guest/bookings' : '/property-owner/bookings')}
          className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isHost = user?.id === booking.host_user_id;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !conversationId) return;

    // Frontend censorship validation
    const validation = checkMessageCensorship(newMessage.trim(), settings);
    if (validation.hasRestricted) {
      showError(validation.reason);
      return;
    }

    setIsSending(true);
    try {
      const response = await api.post(`/messages/${conversationId}/reply`, {
        message: newMessage.trim()
      });

      if (response.data.success) {
        setNewMessage('');
        refetch();
      }
    } catch (err) {
      console.error(err);
      showError('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleProposePrice = async (e) => {
    e.preventDefault();
    const priceNum = parseFloat(proposedPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      showError('Please enter a valid proposed price');
      return;
    }

    setIsSubmittingPrice(true);
    try {
      const response = await api.post(`/property-owner/bookings/${bookingId}/propose-price`, {
        proposed_price: priceNum
      });
      if (response.data.success) {
        showSuccess('Proposed price updated successfully!');
        setProposedPrice('');
        refetch();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update proposed price');
    } finally {
      setIsSubmittingPrice(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (window.confirm('Are you sure you want to accept this booking request?')) {
      setIsUpdatingStatus(true);
      try {
        const response = await api.patch(`/property-owner/bookings/${bookingId}/confirm`);
        if (response.data.success) {
          showSuccess('Booking request accepted successfully!');
          refetch();
        }
      } catch (err) {
        showError(err.response?.data?.message || 'Failed to accept booking request');
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  const handleRejectRequest = async () => {
    if (window.confirm('Are you sure you want to reject this booking request?')) {
      setIsUpdatingStatus(true);
      try {
        const response = await api.patch(`/property-owner/bookings/${bookingId}/cancel`);
        if (response.data.success) {
          showSuccess('Booking request rejected.');
          refetch();
        }
      } catch (err) {
        showError(err.response?.data?.message || 'Failed to reject booking request');
      } finally {
        setIsUpdatingStatus(false);
      }
    }
  };

  const formatBDTRate = (amount) => {
    return parseFloat(amount || 0).toLocaleString('en-BD', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const getStatusAlert = () => {
    if (booking.status === 'pending') {
      return (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex gap-3 text-xs font-semibold">
          <FiClock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Pending Host Confirmation</p>
            <p className="text-amber-700 font-medium mt-1">
              {isHost 
                ? 'Review the request and negotiate price. Accept or Reject once satisfied.' 
                : 'Waiting for the host to confirm or adjust the booking rate.'}
            </p>
          </div>
        </div>
      );
    }

    if (booking.status === 'request_accepted' && booking.payment_status !== 'paid') {
      return (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 flex gap-3 text-xs font-semibold">
          <FiCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Request Accepted — Payment Pending</p>
            <p className="text-blue-700 font-medium mt-1">
              {isHost 
                ? 'Accepted. Waiting for guest payment.' 
                : 'The host accepted your booking! Click the button below to pay and confirm.'}
            </p>
            {!isHost && (
              <button 
                onClick={() => navigate(`/payment/${booking.id}`)}
                className="mt-3 px-4 py-2 bg-[#E41D57] hover:bg-[#E41D57]/90 text-white rounded-lg font-bold shadow-md transition-all text-xxs uppercase tracking-wider"
              >
                Go to Payment (৳{formatBDTRate(booking.total_amount)})
              </button>
            )}
          </div>
        </div>
      );
    }

    if (booking.status === 'confirmed') {
      return (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex gap-3 text-xs font-semibold">
          <FiCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Booking Confirmed & Confirmed</p>
            <p className="text-emerald-700 font-medium mt-1">This booking is fully paid and confirmed. Enjoy the stay!</p>
          </div>
        </div>
      );
    }

    if (booking.status === 'cancelled') {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-3 text-xs font-semibold">
          <FiX className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Booking Cancelled</p>
            <p className="text-red-700 font-medium mt-1">This booking request was rejected or cancelled.</p>
          </div>
        </div>
      );
    }

    return null;
  };

  const nights = Math.max(1, Math.ceil((new Date(booking.check_out_date) - new Date(booking.check_in_date)) / (1000 * 60 * 60 * 24)));

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(isHost ? '/property-owner/bookings' : '/guest/bookings')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-slate-500 hover:text-slate-800"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-850 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              Booking Negotiation
            </h1>
            <p className="text-xxs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Ref: {booking.booking_reference}</p>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher — only visible on small screens */}
      <div className="flex border-b border-gray-200 bg-white md:hidden shrink-0">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-center text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'chat'
              ? 'border-[#004e59] text-[#004e59] bg-[#004e59]/5'
              : 'border-transparent text-gray-400'
          }`}
        >
          <FiSend className="w-3.5 h-3.5" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-3 text-center text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'details'
              ? 'border-[#004e59] text-[#004e59] bg-[#004e59]/5'
              : 'border-transparent text-gray-400'
          }`}
        >
          <FiInfo className="w-3.5 h-3.5" />
          Booking Details
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden h-full w-full">
        
        {/* Left Column: Details & Actions — full width on mobile when 'details' tab active */}
        <div className={`bg-white border-r border-gray-200 overflow-y-auto shrink-0 ${
            activeTab === 'details' ? 'flex flex-col w-full' : 'hidden'
          } md:flex md:flex-col md:w-[380px]`}>
          <div className="p-6 space-y-6">
            
            {/* Property Image & Title */}
            <div className="space-y-3">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                {booking.property_image ? (
                  <img
                    src={getImageUrl(booking.property_image)}
                    alt={booking.property_title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-350">
                    <FiCalendar className="w-10 h-10" />
                  </div>
                )}
              </div>
              <h3 className="font-black text-slate-850 text-md leading-tight">{booking.property_title}</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <FiMapPin size={12} className="text-gray-400" /> {booking.property_city}, {booking.property_address}
              </p>
            </div>

            <hr className="border-slate-100" />

            {/* Booking Specifics */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stay Specifics</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Check-in</span>
                  <span className="font-bold text-slate-800">{new Date(booking.check_in_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[9px] text-gray-400 font-bold uppercase block">Check-out</span>
                  <span className="font-bold text-slate-800">{new Date(booking.check_out_date).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Nights:</span>
                <span className="text-slate-900 font-bold">{nights} night{nights > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Guests:</span>
                <span className="text-slate-900 font-bold">{booking.number_of_guests} Guest{booking.number_of_guests > 1 ? 's' : ''}</span>
              </div>
              {booking.special_requests && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs font-semibold text-slate-650">
                  <span className="font-bold text-slate-750 block mb-1">Special Requests:</span>
                  {booking.special_requests}
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Financial negotiation details */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate & Price Negotiation</h4>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-gray-500">
                  <span>Calculated Rent:</span>
                  <span>৳{formatBDTRate(booking.original_calculated_price || booking.total_amount)}</span>
                </div>
                {booking.host_proposed_price && (
                  <div className="flex justify-between font-bold text-slate-850">
                    <span>Host Proposed Rate:</span>
                    <span className="text-[#004e59]">৳{formatBDTRate(booking.host_proposed_price)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm border-t border-slate-100 pt-2 text-slate-900">
                  <span>Active Total:</span>
                  <span>৳{formatBDTRate(booking.total_amount)}</span>
                </div>
              </div>

              {/* Status Alert box */}
              {getStatusAlert()}

              {/* Price proposal input (Host only) - Redesigned to be extremely clean and premium */}
              {isHost && booking.status === 'pending' && (
                <form onSubmit={handleProposePrice} className="space-y-3 mt-4 bg-slate-50/50 p-4 rounded-xl border border-slate-150">
                  <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Propose Special Rate</label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold text-sm">৳</span>
                    </div>
                    <input
                      type="number"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      placeholder="Enter BDT amount"
                      className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004e59]/20 focus:border-[#004e59] transition-all"
                      disabled={isSubmittingPrice}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#004e59] hover:bg-[#003941] text-white rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-[#004e59]/10 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                    disabled={isSubmittingPrice || !proposedPrice}
                  >
                    {isSubmittingPrice ? 'Proposing...' : '💬 Propose Rate'}
                  </button>
                </form>
              )}

              {/* Confirmation / Cancellation Actions (Host only) */}
              {isHost && booking.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={handleAcceptRequest}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-100"
                    disabled={isUpdatingStatus}
                  >
                    <FiCheck size={16} /> {isUpdatingStatus ? 'Processing...' : 'Accept Booking'}
                  </button>
                  <button
                    onClick={handleRejectRequest}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-red-100"
                    disabled={isUpdatingStatus}
                  >
                    <FiX size={16} /> Reject
                  </button>
                </div>
              )}

            </div>

          </div>
          {/* Extra bottom padding on mobile for comfortable scrolling */}
          <div className="pb-4 md:pb-0" />
        </div>

        {/* Right Column: Chat negotiation thread — full width on mobile when 'chat' tab active */}
        <div className={`flex-col h-full bg-white relative w-full ${
            activeTab === 'chat' ? 'flex' : 'hidden'
          } md:flex md:flex-1`}>

          {/* Messages list bubble screen */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scroll-smooth">
            {messages.map((msg, index) => {
              const isSystemMessage = msg.content.startsWith('System:');
              const isMe = msg.sender_id === user?.id;

              if (isSystemMessage) {
                return (
                  <div key={msg.id} className="flex justify-center my-4">
                    <div className="bg-slate-100 border border-slate-250 text-slate-650 px-4 py-3 rounded-xl text-center text-xs font-semibold max-w-[85%] shadow-inner flex items-start gap-2">
                      <FiInfo className="w-4 h-4 text-[#004e59] shrink-0 mt-0.5" />
                      <div className="text-left whitespace-pre-wrap">{msg.content.replace('System:', '').trim()}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] sm:max-w-[70%] gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Avatar (other side user) */}
                    {!isMe && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 text-xs font-black shrink-0">
                        {msg.sender_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-2.5 text-xs leading-relaxed break-words shadow-sm font-semibold
                          ${isMe 
                            ? 'bg-[#004e59] text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-150'}`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 font-bold">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Text Input area */}
          <div className="p-4 bg-white border-t border-gray-150 shrink-0">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-3 bg-slate-50 border border-gray-200 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-[#004e59]/10 focus-within:border-gray-300 transition-all"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message to negotiate rate..."
                className="flex-1 bg-transparent border-none p-1.5 focus:ring-0 text-slate-800 placeholder-gray-400 text-sm font-semibold focus:outline-none"
                disabled={isSending}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className={`p-2 rounded-xl transition-all duration-200 shrink-0
                  ${!newMessage.trim() || isSending 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#004e59] text-white hover:opacity-90 active:scale-95 shadow'}`}
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSend className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BookingNegotiation;
