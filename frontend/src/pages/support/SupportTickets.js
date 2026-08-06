import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useAuthStore from '../../store/authStore';
import useToast from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreateTicketModal from './CreateTicketModal';
import { FiPlus, FiFilter, FiTag, FiClock, FiHome, FiChevronRight } from 'react-icons/fi';

const StatusBadge = ({ status }) => {
  const getColors = (status) => {
    switch (status) {
      case 'Open': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getColors(status)}`}>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const getColors = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-blue-500';
      case 'Low': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${getColors(priority)}`}></span>
      <span className="text-xs font-semibold text-slate-600">{priority}</span>
    </div>
  );
};

const SupportTickets = () => {
  const { user } = useAuthStore();
  const { showError } = useToast();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const role = user?.user_type;

  useEffect(() => {
    fetchTickets();
  }, [activeFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = activeFilter !== 'All' ? { status: activeFilter } : {};
      const response = await api.get('/support', { params });
      setTickets(response.data.data.tickets);
    } catch (err) {
      showError('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (id) => {
    navigate(`/support/ticket/${id}`);
  };

  const filters = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
      {/* Modern Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-[#E41D57]">
            <FiLifeBuoy className="text-3xl" />
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Support <span className="text-[#E41D57]">Hub</span></h1>
          </div>
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl">
            {role === 'admin' ? 'Global command center for all guest and host concerns.' : 
             role === 'property_owner' ? 'Track your property maintenance and personal travel issues.' : 
             'Need assistance? We typically respond within 2 hours.'}
          </p>
        </div>
        
        {(role === 'guest' || role === 'property_owner') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#E41D57] hover:bg-[#c21849] text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl shadow-rose-100 active:scale-95 group"
          >
            <FiPlus className="text-xl group-hover:rotate-90 transition-transform" />
            New Ticket
          </button>
        )}
      </div>

      {/* Modern Filters */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-wrap items-center gap-2">
        <div className="px-3 flex items-center gap-2 text-slate-400 border-r border-slate-100 mr-2">
          <FiFilter />
          <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
        </div>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeFilter === f 
                ? 'bg-[#E41D57] text-white shadow-lg shadow-rose-200' 
                : 'bg-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20"><LoadingSpinner /></div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎫</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Internal tickets clear</h2>
          <p className="text-slate-500 max-w-xs mx-auto">You don't have any {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} support tickets right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View (No Scroll) */}
          <div className="hidden lg:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-24 text-center">ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Subject & Category</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Property</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">Priority</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tickets.map((t) => (
                  <tr 
                    key={t.id} 
                    onClick={() => handleTicketClick(t.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-all group"
                  >
                    <td className="px-8 py-6 text-center font-bold text-slate-400 text-sm">#{t.id}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-[#E41D57] transition-colors">{t.subject}</span>
                          {role === 'property_owner' && t.guest_id === user.id && (
                             <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded border border-blue-100 leading-none">Own</span>
                          )}
                          {role === 'property_owner' && t.host_id === user.id && (
                             <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-black uppercase rounded border border-purple-100 leading-none">Assigned</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <FiTag className="text-[#E41D57]" /> {t.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-600">
                      <div className="flex items-center gap-2">
                        <FiHome className="text-slate-300" />
                        {t.property_title || '--'}
                      </div>
                    </td>
                    <td className="px-8 py-6"><PriorityBadge priority={t.priority} /></td>
                    <td className="px-8 py-6 text-center"><StatusBadge status={t.status} /></td>
                    <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">
                      <div className="flex items-center justify-end gap-1.5">
                        <FiClock /> {new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {tickets.map((t) => (
              <div 
                key={t.id} 
                onClick={() => handleTicketClick(t.id)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-300">#{t.id}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
                
                <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                  {t.subject}
                  {role === 'property_owner' && t.guest_id === user.id && (
                     <span className="w-2 h-2 rounded-full bg-blue-500" title="Own Created"></span>
                  )}
                  {role === 'property_owner' && t.host_id === user.id && (
                     <span className="w-2 h-2 rounded-full bg-purple-500" title="Assigned"></span>
                  )}
                </h3>
                
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <FiTag className="text-[#E41D57]" /> {t.category}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <FiHome /> {t.property_title || 'General Support'}
                   </div>
                   <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                        <FiClock /> {new Date(t.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[#E41D57] flex items-center gap-1 font-bold text-xs">
                        View Chat <FiChevronRight />
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <CreateTicketModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTickets();
          }} 
        />
      )}
    </div>
  );
};

// Assuming FiLifeBuoy was meant to be imported or use a common one
const FiLifeBuoy = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="4"></circle>
    <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
    <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
    <line x1="14.83" y1="4.93" x2="10.59" y2="9.17"></line>
    <line x1="9.17" y1="14.83" x2="4.93" y2="19.07"></line>
  </svg>
);

export default SupportTickets;
