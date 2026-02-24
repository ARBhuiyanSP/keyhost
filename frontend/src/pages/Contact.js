import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageCircle, FiGlobe, FiClock } from 'react-icons/fi';
import useSettingsStore from '../store/settingsStore';

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

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setStatus('Message sent successfully! We will get back to you shortly.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
            setTimeout(() => setStatus(''), 5000);
        }, 1500);
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans selection:bg-blue-200">
            {/* Hero Section */}
            <div className="relative bg-navy-900 text-white overflow-hidden py-24">
                <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/80 to-transparent z-0"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 opacity-0 animate-[fadeInUp_1s_ease-out_forwards]">
                        Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Touch</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light opacity-0 animate-[fadeInUp_1s_ease-out_0.2s_forwards]">
                        We'd love to hear from you. Our friendly team is always here to chat and help you with any inquiries.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Contact Information Cards */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-2xl opacity-0 animate-[fadeInUp_1s_ease-out_0.4s_forwards]">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <FiMessageCircle className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chat with sales</h3>
                            <p className="text-gray-600 mb-6">Speak to our friendly team regarding property listings, bulk corporate bookings, or special requests.</p>
                            {settings?.contact_email && (
                                <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors group">
                                    <FiMail className="mr-2 group-hover:scale-110 transition-transform" />
                                    {settings.contact_email}
                                </a>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-2xl opacity-0 animate-[fadeInUp_1s_ease-out_0.5s_forwards]">
                            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                                <FiPhone className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Call us</h3>
                            <p className="text-gray-600 mb-6">Need immediate assistance? We are available during standard business hours.</p>
                            {settings?.contact_phone && (
                                <a href={`tel:${settings.contact_phone}`} className="inline-flex items-center text-green-600 font-semibold hover:text-green-800 transition-colors group">
                                    <FiPhone className="mr-2 group-hover:scale-110 transition-transform" />
                                    {settings.contact_phone}
                                </a>
                            )}
                        </div>

                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 transform transition-all hover:-translate-y-1 hover:shadow-2xl opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_forwards]">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <FiMapPin className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Visit us</h3>
                            <p className="text-gray-600 mb-6">Visit our headquarters for an in-person consultation.</p>
                            {settings?.site_address && (
                                <div className="flex items-start text-purple-600 font-semibold group">
                                    <FiMapPin className="mr-2 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                    <span>{settings.site_address}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-7 opacity-0 animate-[fadeInUp_1s_ease-out_0.7s_forwards]">
                        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50 border border-gray-100 h-full">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Send us a message</h2>

                            {status && (
                                <div className="mb-8 p-4 rounded-2xl bg-green-50 text-green-700 flex items-center gap-3 border border-green-200 animate-[fadeIn_0.5s_ease-out]">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FiSend className="w-4 h-4" />
                                    </div>
                                    <p className="font-medium">{status}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Message</label>
                                    <textarea
                                        required
                                        rows="6"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-gray-900 resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-navy-900 text-white rounded-2xl font-bold text-lg hover:bg-navy-800 focus:ring-4 focus:ring-navy-900/20 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                                    <span className="relative flex items-center space-x-2">
                                        {isSubmitting ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span>Send Message</span>
                                                <FiSend className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </form>
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
