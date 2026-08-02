import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageCircle, FiGlobe, FiClock } from 'react-icons/fi';
import useSettingsStore from '../store/settingsStore';
import api from '../utils/api';

const Contact = () => {
    const { settings } = useSettingsStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const response = await api.post('/contact', formData);
            
            if (response.data?.success) {
                setStatus('Message sent successfully! We will get back to you shortly.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setStatus(response.data?.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            setStatus(error.response?.data?.message || 'An error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setStatus(''), 5000);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans selection:bg-blue-200">
            {/* Elegant Document Header */}
            <div className="bg-gradient-to-br from-gray-900 to-navy-900 relative py-8 overflow-hidden rounded-b-[3rem] shadow-2xl mb-6">
                <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-[fadeInUp_1s_ease-out_forwards]">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-white">Get in Touch</h1>
                    <p className="text-blue-100 font-light max-w-3xl mx-auto text-sm opacity-90">
                        We'd love to hear from you. Our friendly team is always here to chat and help you with any inquiries.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pb-20 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Contact Channels Info */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 mb-3">
                                💬 Get in touch
                            </span>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                                Contact Information
                            </h2>
                            <p className="text-gray-500 mt-2 text-sm max-w-md">
                                Have questions or need assistance? Reach out via any of our official channels or send a message directly.
                            </p>
                        </div>

                        {/* Responsive Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* WhatsApp Card */}
                            {settings?.contact_phone && (
                                <a 
                                    href={`https://wa.me/${settings.contact_phone.replace(/[^0-9]/g, '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-250 transition-all duration-300 group flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                            <FiMessageCircle className="w-5 h-5 animate-[pulse_2s_infinite]" />
                                        </div>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Instant
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base mb-1">WhatsApp Chat</h4>
                                        <p className="text-xs text-gray-500 mb-3">Chat with reservation desk for quick help.</p>
                                        <span className="text-xs font-semibold text-emerald-600 group-hover:underline flex items-center gap-1">
                                            Chat Support &rarr;
                                        </span>
                                    </div>
                                </a>
                            )}

                            {/* Call Us Card */}
                            {settings?.contact_phone && (
                                <a 
                                    href={`tel:${settings.contact_phone}`} 
                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-250 transition-all duration-300 group flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                                            <FiPhone className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Voice
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base mb-1">Call Us</h4>
                                        <p className="text-xs text-gray-500 mb-3">Speak directly with our client relation desks.</p>
                                        <span className="text-xs font-semibold text-green-600 truncate group-hover:underline flex items-center gap-1">
                                            {settings.contact_phone}
                                        </span>
                                    </div>
                                </a>
                            )}

                            {/* Email Card */}
                            {settings?.contact_email && (
                                <a 
                                    href={`mailto:${settings.contact_email}`} 
                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-250 transition-all duration-300 group flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                            <FiMail className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Sales
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base mb-1">Email Sales</h4>
                                        <p className="text-xs text-gray-500 mb-3">Reach sales regarding properties & bookings.</p>
                                        <span className="text-xs font-semibold text-blue-600 truncate group-hover:underline flex items-center gap-1 block">
                                            {settings.contact_email}
                                        </span>
                                    </div>
                                </a>
                            )}

                            {/* Support Hours Card */}
                            <div 
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-250 transition-all duration-300 group flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                                        <FiClock className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        Active
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base mb-1">Support Hours</h4>
                                    <p className="text-xs text-gray-500 mb-3">Operational 24/7/365 to handle emergency requests.</p>
                                    <span className="text-xs font-bold text-amber-600">
                                        Response &lt; 15 mins
                                    </span>
                                </div>
                            </div>

                            {/* Visit Us Card - full width on mobile/tablet grid */}
                            {settings?.site_address && (
                                <div 
                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-250 transition-all duration-300 group sm:col-span-2 flex gap-4 items-start"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                        <FiMapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base mb-1">Our Locations</h4>
                                        <p className="text-xs text-gray-500 mb-2">Visit us for in-person agreements, documentation, or feedback.</p>
                                        <span className="text-xs font-semibold text-purple-600 leading-relaxed block">
                                            {settings.site_address}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-7 animate-[fadeInUp_1s_ease-out_0.7s_forwards]">
                        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 h-full flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Send us a message</h2>
                                <p className="text-sm text-gray-500 mb-8">Fill out the form below and our relations desk will reach out within 2 hours.</p>

                                {status && (
                                    <div className="mb-8 p-4 rounded-2xl bg-green-50 text-green-700 flex items-center gap-3 border border-green-200 animate-[fadeIn_0.5s_ease-out]">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <FiSend className="w-4 h-4" />
                                        </div>
                                        <p className="font-medium">{status}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">First Name</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-gray-905 text-sm placeholder-gray-400"
                                                placeholder="e.g. John Doe"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-gray-905 text-sm placeholder-gray-400"
                                                placeholder="e.g. john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-gray-905 text-sm placeholder-gray-400"
                                            placeholder="What can we help you with?"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Message</label>
                                        <textarea
                                            required
                                            rows="5"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-gray-905 text-sm resize-none placeholder-gray-400"
                                            placeholder="Please describe your inquiry in detail..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-base transition-all flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed group relative overflow-hidden shadow-md shadow-gray-200"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span>Send message</span>
                                                <FiSend className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default Contact;
