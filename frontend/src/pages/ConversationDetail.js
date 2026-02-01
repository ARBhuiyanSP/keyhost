import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiChevronLeft, FiSend, FiUser, FiInfo, FiMapPin, FiCheckCircle, FiClock, FiCalendar } from 'react-icons/fi';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import useToast from '../hooks/useToast';

const ConversationDetail = () => {
    const { id: conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { showError } = useToast();
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [lastFetch, setLastFetch] = useState(Date.now());
    const [showDetails, setShowDetails] = useState(false); // Mobile toggle
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get(`/messages/${conversationId}`);
                if (response.data.success) {
                    setMessages(response.data.data.messages);
                    setConversation(response.data.data.conversation);
                    setLastFetch(Date.now());
                }
            } catch (error) {
                console.error('Fetch messages error:', error);
                showError('Failed to load conversation');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();

        // Poll for new messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [conversationId]); // Removed showError dependency

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const response = await api.post(`/messages/${conversationId}/reply`, {
                message: newMessage.trim()
            });

            if (response.data.success) {
                setNewMessage('');
                const newMsg = response.data.data.message;
                // Add sender info manually since backend might return minimal object
                newMsg.sender_name = user.first_name;
                newMsg.sender_image = user.profile_image;

                setMessages(prev => [...prev, newMsg]);
                setLastFetch(Date.now());
            }
        } catch (error) {
            console.error('Send message error:', error);
            showError('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Conversation not found</h2>
                <button
                    onClick={() => navigate('/messages')}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Back to Messages
                </button>
            </div>
        );
    }

    // Determine the "Other" user display info from the enhanced backend response
    const otherUserName = `${conversation.other_user_first_name} ${conversation.other_user_last_name}`.trim();
    const otherUserImage = conversation.other_user_image;
    // Removed isGuest usage or derive if needed

    return (
        <div className="min-h-screen bg-white pt-[64px] flex flex-col h-screen fixed inset-0">
            {/* Split Layout */}
            <div className="flex flex-1 overflow-hidden h-full max-w-7xl mx-auto w-full">

                {/* Left Column: Chat Area */}
                <div className="flex-1 flex flex-col h-full border-r border-gray-100 relative w-full">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-20 shadow-sm">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/messages')}
                                className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors text-gray-500"
                            >
                                <FiChevronLeft className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    {otherUserImage ? (
                                        <img
                                            src={otherUserImage}
                                            alt={otherUserName}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                            <FiUser className="w-5 h-5" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 leading-tight">
                                        {otherUserName}
                                    </h2>
                                    <p className="text-xs text-gray-500">Response time: Usually within an hour</p>
                                </div>
                            </div>
                        </div>

                        <button
                            className="lg:hidden p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-500"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            <FiInfo className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scroll-smooth">
                        {/* Conversation Start Notice */}
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <FiCalendar className="w-8 h-8" />
                            </div>
                            <p className="text-gray-500 text-sm">
                                This conversation started on {new Date(conversation.created_at).toLocaleDateString()}
                            </p>
                        </div>

                        {messages.map((msg, index) => {
                            const isMe = msg.sender_id === user.id;
                            const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.sender_id !== msg.sender_id);

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[85%] sm:max-w-[70%] gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>

                                        {/* Avatar (only for other user) */}
                                        {!isMe && (
                                            <div className="flex-shrink-0 w-8 flex items-end">
                                                {showAvatar ? (
                                                    otherUserImage ? (
                                                        <img
                                                            src={otherUserImage}
                                                            alt={otherUserName}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs">
                                                            {otherUserName[0]}
                                                        </div>
                                                    )
                                                ) : <div className="w-8" />}
                                            </div>
                                        )}

                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div
                                                className={`px-5 py-3 text-[15px] leading-relaxed break-words shadow-sm
                                                    ${isMe
                                                        ? 'bg-black text-white rounded-2xl rounded-tr-sm'
                                                        : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm border border-gray-100'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>
                                            <div className={`flex items-center gap-1 mt-1.5 ${isMe ? 'mr-1' : 'ml-1'}`}>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                                </span>
                                                {isMe && msg.is_read && (
                                                    <FiCheckCircle className="w-3 h-3 text-green-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form
                            onSubmit={handleSendMessage}
                            className="relative flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-3xl px-4 py-3 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-gray-300 transition-all"
                        >
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Write a message..."
                                className="flex-1 bg-transparent border-none p-2 focus:ring-0 text-gray-900 placeholder-gray-400 text-base"
                                disabled={isSending}
                                autoComplete="off"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || isSending}
                                className={`p-2.5 rounded-full transition-all duration-200 mb-0.5
                                    ${!newMessage.trim() || isSending
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed scale-95'
                                        : 'bg-black text-white hover:bg-gray-800 shadow-md scale-100 active:scale-90'
                                    }`}
                            >
                                {isSending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <FiSend className="w-5 h-5 ml-0.5" />
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Details (Desktop) */}
                <div className={`
                    fixed inset-0 z-30 bg-white transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-[380px] lg:border-l lg:border-gray-100 lg:block lg:z-auto
                    ${showDetails ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}>
                    <div className="h-full overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between lg:hidden">
                            <h3 className="font-bold text-lg">Details</h3>
                            <button onClick={() => setShowDetails(false)} className="p-2 text-gray-500">
                                <FiChevronLeft className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <h3 className="font-bold text-gray-900 mb-6 text-lg hidden lg:block">Trip Details</h3>

                            {/* Property Card */}
                            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-8 transition-transform hover:-translate-y-1 duration-300 hover:shadow-md cursor-pointer" onClick={() => navigate(`/property/${conversation.property_id}`)}>
                                <div className="aspect-[4/3] bg-gray-100 relative">
                                    {conversation.property_image ? (
                                        <img
                                            src={conversation.property_image}
                                            alt={conversation.property_title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <FiCalendar className="w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-black border border-white/20 shadow-sm">
                                        BDT {conversation.base_price}/night
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight">
                                            {conversation.property_title}
                                        </h4>
                                    </div>
                                    <div className="flex items-center text-gray-500 text-sm gap-1 mb-4">
                                        <FiMapPin className="w-3.5 h-3.5" />
                                        <span className="truncate">{conversation.property_city}, {conversation.property_address}</span>
                                    </div>
                                    <button className="w-full py-2.5 border border-black rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                                        View Property
                                    </button>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Payments</h4>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600 text-sm">Payment Status</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Secure</span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Always pay through Keyhost Homes to protect your payment.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                                <Link to="/help" className="text-gray-500 text-sm hover:text-black underline decoration-gray-300 underline-offset-4">
                                    Report this conversation
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationDetail;
