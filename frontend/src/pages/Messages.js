import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiUser, FiChevronRight, FiSearch } from 'react-icons/fi';
import api from '../utils/api';
import useToast from '../hooks/useToast';

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { showError } = useToast();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await api.get('/messages');
                if (response.data.success) {
                    setConversations(response.data.data.conversations);
                }
            } catch (error) {
                console.error('Fetch conversations error:', error);
                showError('Failed to load messages');
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [showError]);

    const filteredConversations = conversations.filter(conv => {
        const name = `${conv.other_user_first_name} ${conv.other_user_last_name}`.toLowerCase();
        const property = (conv.property_title || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || property.includes(search);
    });

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Messages</h1>

                    {/* Search Bar */}
                    <div className="relative max-w-md w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent transition duration-150 ease-in-out sm:text-sm"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                            <FiMessageSquare className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-500 text-center max-w-sm mb-8">
                            When you contact a host or receive a message regarding your bookings, it will appear here.
                        </p>
                        <Link
                            to="/"
                            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                        >
                            Explore properties
                        </Link>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No conversations found matching "{searchTerm}"</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {filteredConversations.map((conversation) => {
                                const isUnread = conversation.last_message_is_read_by_me === 0;

                                return (
                                    <Link
                                        key={conversation.id}
                                        to={`/messages/${conversation.id}`}
                                        className={`group block hover:bg-gray-50 transition-colors duration-200 ${isUnread ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="p-5 sm:p-6 flex items-start gap-5">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0 relative">
                                                {conversation.other_user_image ? (
                                                    <img
                                                        src={conversation.other_user_image}
                                                        alt={`${conversation.other_user_first_name} ${conversation.other_user_last_name}`}
                                                        className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                        <FiUser className="w-7 h-7" />
                                                    </div>
                                                )}
                                                {isUnread && (
                                                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-600 border-2 border-white rounded-full"></div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pt-1">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className={`text-base font-bold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {conversation.other_user_first_name} {conversation.other_user_last_name}
                                                    </h3>
                                                    <span className={`text-xs whitespace-nowrap ml-2 ${isUnread ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                                                        {formatTime(conversation.last_message_at)}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <p className={`text-sm truncate mb-1 ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                                            {conversation.last_message_content || 'Start of conversation'}
                                                        </p>
                                                        <p className="text-xs text-gray-400 truncate flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                            {conversation.property_title}
                                                        </p>
                                                    </div>

                                                    <FiChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
