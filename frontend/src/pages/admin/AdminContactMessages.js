import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiMail, FiCheckCircle, FiClock, FiEye, FiTrash2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read, replied
    const [selectedMessage, setSelectedMessage] = useState(null);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = filter === 'all' ? '/api/contact' : `/api/contact?status=${filter}`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                setMessages(data.data.messages || []);
            } else {
                toast.error(data.message || 'Failed to fetch messages');
            }
        } catch (error) {
            toast.error('Error fetching messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [filter]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/contact/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            
            if (response.ok) {
                toast.success(`Message marked as ${newStatus}`);
                fetchMessages();
                if (selectedMessage && selectedMessage.id === id) {
                    setSelectedMessage({ ...selectedMessage, status: newStatus });
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error updating status');
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FiMessageSquare className="text-blue-600" /> Contact Messages
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage inquiries from the public contact form.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchMessages}
                        className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                        title="Refresh"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    </button>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                        <option value="all">All Messages</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Messages List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search messages..." 
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto flex-1 p-2">
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                No messages found.
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {messages.map((msg) => (
                                    <button
                                        key={msg.id}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            if (msg.status === 'unread') handleStatusChange(msg.id, 'read');
                                        }}
                                        className={`w-full text-left p-4 rounded-xl transition-all ${
                                            selectedMessage?.id === msg.id 
                                                ? 'bg-blue-50 border-blue-200' 
                                                : msg.status === 'unread' 
                                                    ? 'bg-white border-transparent hover:bg-gray-50' 
                                                    : 'bg-white opacity-80 border-transparent hover:bg-gray-50 hover:opacity-100'
                                        } border flex flex-col gap-1`}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <span className={`font-semibold text-sm truncate pr-2 ${msg.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {msg.name}
                                            </span>
                                            {msg.status === 'unread' && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate w-full">{msg.subject}</div>
                                        <div className="text-[10px] text-gray-400 mt-1">{formatDate(msg.created_at)}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Details */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 h-[700px] flex flex-col overflow-hidden">
                    {selectedMessage ? (
                        <>
                            <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <span className="font-semibold text-gray-900">{selectedMessage.name}</span>
                                        <span className="text-gray-300">•</span>
                                        <a href={`mailto:${selectedMessage.email}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                            <FiMail className="w-4 h-4" /> {selectedMessage.email}
                                        </a>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        <FiClock className="w-3 h-3" /> {formatDate(selectedMessage.created_at)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1 ${
                                        selectedMessage.status === 'unread' ? 'bg-blue-100 text-blue-700' :
                                        selectedMessage.status === 'read' ? 'bg-gray-100 text-gray-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                        {selectedMessage.status === 'unread' ? <FiEye className="w-3 h-3" /> :
                                         selectedMessage.status === 'replied' ? <FiCheckCircle className="w-3 h-3" /> :
                                         <FiEye className="w-3 h-3" />}
                                        {selectedMessage.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-1 p-6 overflow-y-auto bg-white">
                                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap font-medium leading-relaxed">
                                    {selectedMessage.message}
                                </div>
                            </div>
                            
                            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                {selectedMessage.status !== 'replied' && (
                                    <button 
                                        onClick={() => handleStatusChange(selectedMessage.id, 'replied')}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-semibold flex items-center gap-2 shadow-sm"
                                    >
                                        <FiCheckCircle className="w-4 h-4 text-green-500" /> Mark as Replied
                                    </button>
                                )}
                                <a 
                                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center gap-2 shadow-sm shadow-blue-600/20"
                                >
                                    <FiMail className="w-4 h-4" /> Reply via Email
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                <FiMessageSquare className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="text-lg">Select a message to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminContactMessages;
