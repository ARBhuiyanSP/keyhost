import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StatusBadge = ({ status }) => {
  const getColors = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-500 text-white border-red-500';
      case 'In Progress': return 'bg-yellow-500 text-white border-yellow-500';
      case 'Resolved': return 'bg-green-500 text-white border-green-500';
      case 'Closed': return 'bg-gray-500 text-white border-gray-500';
      default: return 'bg-gray-500 text-white';
    }
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getColors(status)}`}>{status}</span>;
};

const TicketChat = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
    const interval = setInterval(fetchTicketDetails, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicketDetails = async () => {
    try {
      const response = await api.get(`/support/${id}`);
      setTicket(response.data.data.ticket);
      setMessages(response.data.data.messages);
      setLoading(false);
    } catch (err) {
      showError('Failed to fetch ticket info');
      setLoading(false);
      navigate('/support');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append('message', newMessage);
      if (attachment) {
        formData.append('attachment', attachment);
      }

      await api.post(`/support/${id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setNewMessage('');
      setAttachment(null);
      fetchTicketDetails();
    } catch (err) {
      showError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      await api.patch(`/support/${id}/status`, { status });
      showSuccess(`Status updated to ${status}`);
      fetchTicketDetails();
    } catch (err) {
      showError('Failed to update status');
    }
  };

  const handleAssignToHost = async () => {
    try {
      setAssigning(true);
      await api.patch(`/support/${id}/assign`, {});
      showSuccess('Ticket assigned to the host successfully');
      fetchTicketDetails();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!ticket) return null;

  const isClosed = ticket.status === 'Closed';
  const isResolved = ticket.status === 'Resolved';
  const role = user?.user_type;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <button 
        onClick={() => navigate('/support')}
        className="text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4 text-sm font-medium transition-all"
      >
        ← Back to Support Dashboard
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Conversation Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[75vh] overflow-hidden">
          <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center z-10">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">{ticket.subject}</h1>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="text-xs text-gray-500">Ticket #{ticket.id} • {ticket.category} • {ticket.priority} Priority</p>
            </div>
            
            {/* Status Management Buttons */}
            <div className="flex gap-2">
              {/* Admin Assign Button */}
              {role === 'admin' && !ticket.host_id && (
                <button
                  onClick={handleAssignToHost}
                  disabled={assigning}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow active:scale-95 disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Assign to Host'}
                </button>
              )}
              
              {/* Host/Admin Resolver (only if they are the HOST of the ticket or admin) */}
              {(role === 'admin' || ticket.host_id === user.id) && (ticket.status === 'Open' || ticket.status === 'In Progress') && (
                <button
                  onClick={() => updateStatus('Resolved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow active:scale-95"
                >
                  Mark as Resolved
                </button>
              )}

              {/* Guest 'Close Forever' (Only if they are the GUEST of this ticket) */}
              {ticket.guest_id === user.id && !isClosed && (
                <button
                  onClick={() => updateStatus('Closed')}
                  className="bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow active:scale-95"
                >
                  {isResolved ? 'Confirm & Close' : 'Close Ticket'}
                </button>
              )}

              {/* Admin 'Close Forever' (Only if Resolved) */}
              {role === 'admin' && isResolved && (
                <button
                  onClick={() => updateStatus('Closed')}
                  className="bg-gray-900 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow active:scale-95"
                >
                  Close Forever
                </button>
              )}

              {/* Guest 'Re-open' (Only if they are the GUEST of this ticket and it's Resolved) */}
              {ticket.guest_id === user.id && isResolved && (
                <button
                  onClick={() => updateStatus('Open')}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow active:scale-95"
                >
                  Not Solved? Re-open
                </button>
              )}
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
            {messages.map((msg, index) => {
              const isMine = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{msg.sender_name} ({msg.sender_role})</span>
                      <span className="text-[9px] text-gray-300">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className={`
                      px-4 py-3 rounded-2xl shadow-sm text-sm
                      ${isMine ? 'bg-[#E41D57] text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}
                    `}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      {msg.attachment_url && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <a 
                            href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${msg.attachment_url}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-xs p-2 rounded-lg transition-all ${isMine ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-50 hover:bg-gray-100 text-[#E41D57]'}`}
                          >
                           📎 View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          {!isClosed && (
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="relative group">
                  <textarea
                    rows={2}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E41D57] transition-all outline-none resize-none text-sm"
                    placeholder="Type your message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button 
                    type="submit"
                    disabled={sending || (!newMessage.trim() && !attachment)}
                    className="absolute right-3 bottom-3 p-2 bg-[#E41D57] text-white rounded-lg hover:bg-[#c21849] transition-all disabled:opacity-30 shadow-md active:scale-95"
                  >
                    <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-500 cursor-pointer hover:text-gray-900 transition-colors">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f && f.size > 20 * 1024 * 1024) {
                          showError('File size must be less than 20MB');
                          return;
                        }
                        setAttachment(f);
                      }}
                    />
                    <span className="p-1.5 bg-gray-100 rounded-md">📎</span>
                    {attachment ? <span className="text-[#E41D57]">{attachment.name}</span> : 'Attach Image/PDF (Max 20MB)'}
                  </label>
                  {attachment && (
                    <button 
                      type="button" 
                      onClick={() => setAttachment(null)} 
                      className="text-[10px] uppercase font-black text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
          {isClosed && (
            <div className="p-8 bg-gray-100 text-center">
               <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">This ticket has been closed permanently.</p>
            </div>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Ticket Information</h2>
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Property</p>
                  <p className="text-sm font-bold text-gray-800">{ticket.property_title || 'N/A'}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Category</p>
                  <p className="text-sm font-bold text-gray-800">{ticket.category}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Priority</p>
                  <p className="text-sm font-bold text-gray-800">{ticket.priority}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Date Raised</p>
                  <p className="text-sm font-bold text-gray-800">{new Date(ticket.created_at).toLocaleString()}</p>
               </div>
            </div>
          </div>

          <div className="bg-[#fff1f5] rounded-2xl p-6 border border-[#ffcad9]">
            <h2 className="text-xs font-bold text-[#E41D57] mb-2 uppercase tracking-widest">Need Urgent Help?</h2>
            <p className="text-[11px] text-[#E41D57]/70 leading-relaxed">
              If this is an emergency (fire, leak, lock-out), please contact our hotline directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketChat;
