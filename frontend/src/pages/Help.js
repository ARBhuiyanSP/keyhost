import React, { useState } from 'react';
import { 
  FiHelpCircle, FiUser, FiHome, FiSearch, FiChevronDown, 
  FiMessageSquare, FiBookOpen, FiCreditCard, FiMail 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import useSettingsStore from '../store/settingsStore';

function Help() {
    const { settings } = useSettingsStore();
    const [activeCategory, setActiveCategory] = useState('general');
    const [searchQuery, setSearchQuery] = useState('');
    const [openIndex, setOpenIndex] = useState(null);

    const faqData = {
        general: [
            {
                question: "How do I make a booking?",
                answer: "Making a booking is easy! Just search for your desired location and dates, browse through the available properties, select the one you like, and click on 'Book Now'. Follow the checkout process to secure your reservation."
            },
            {
                question: "What is your cancellation policy?",
                answer: "Cancellation policies vary depending on the property and the host's specific rules. You can find the detailed cancellation policy for each listing on the property details page before you book."
            },
            {
                question: "Are there any hidden fees?",
                answer: "No, we believe in transparency. All service fees, cleaning fees, and taxes are clearly displayed before you confirm your booking. The total price you see is the price you pay."
            }
        ],
        payments: [
            {
                question: "What payment methods do you accept?",
                answer: "We accept major credit cards, debit cards, and select mobile payment options like bKash. Payment options will be displayed during the checkout process."
            },
            {
                question: "When is my card charged?",
                answer: "Depending on the host's policy, you may be charged immediately upon booking confirmation, or a hold may be placed on your card until a specific date before check-in."
            }
        ],
        hosting: [
            {
                question: "Can I host my property on this platform?",
                answer: "Absolutely! We welcome new hosts to join our community. Simply sign up for an account, navigate to the 'Become a Host' section, and follow the steps to list your property."
            },
            {
                question: "How do I contact the property host?",
                answer: "Once your booking is confirmed, you will receive the host's contact information. You can also message them directly through our platform's messaging system."
            }
        ]
    };

    const categories = [
        { id: 'general', name: 'General Questions', icon: <FiBookOpen className="w-5 h-5" /> },
        { id: 'payments', name: 'Payments & Billing', icon: <FiCreditCard className="w-5 h-5" /> },
        { id: 'hosting', name: 'Hosting & Managing', icon: <FiHome className="w-5 h-5" /> },
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const getFilteredItems = () => {
        const items = faqData[activeCategory] || [];
        if (!searchQuery) return items;
        return items.filter(
            item =>
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const displayedItems = getFilteredItems();

    return (
        <div className="bg-gray-50 min-h-screen font-sans selection:bg-blue-200">
            {/* Elegant Document Header */}
            <div className="bg-gradient-to-br from-gray-900 to-navy-900 relative py-20 overflow-hidden rounded-b-[3rem] shadow-2xl">
                <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-[fadeInUp_1s_ease-out_forwards]">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <FiHelpCircle className="w-10 h-10 text-[#E73367] animate-pulse" />
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">Help & Support Center</h1>
                    </div>
                    <p className="text-blue-100 font-light max-w-2xl mx-auto text-lg md:text-xl opacity-90 leading-relaxed">
                        Find quick guides, user manuals, and answers to frequently asked questions below.
                    </p>
                    
                    {/* Search Bar inside Header */}
                    <div className="mt-8 max-w-xl mx-auto relative shadow-2xl rounded-full">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-5 py-4 border-0 rounded-full text-sm text-gray-900 placeholder-gray-455 focus:ring-4 focus:ring-[#E73367]/20 transition-all duration-300 bg-white/95 backdrop-blur outline-none"
                            placeholder="Search help topics or FAQs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 opacity-0 animate-fade-in-up">
                
                {/* Section 1: Quick Guides & User Manual */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-250 pb-4">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-950">Quick Platform Guides</h2>
                            <p className="text-xs text-gray-500 mt-1">Get started with our system manual and key steps for guests and owners.</p>
                        </div>
                        <a
                            href="/project_documentation.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-[#E73367] text-white px-5 py-2.5 rounded-xl hover:bg-[#d42c5c] hover:scale-105 transition-all duration-150 font-bold text-xs shadow-md hover:shadow-lg"
                        >
                            View Full System Manual
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Guest Section */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-250/20 hover:shadow-2xl hover:border-rose-100 hover:-translate-y-1 transition-all duration-350 group flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-rose-500/5 blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
                            <div>
                                <div className="flex items-center mb-6">
                                    <div className="p-3 bg-rose-50 text-[#E73367] rounded-2xl mr-4 shadow-inner">
                                        <FiUser className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">For Guests</h3>
                                        <p className="text-xs text-gray-405">Discover and manage your stays</p>
                                    </div>
                                </div>
                                <ul className="space-y-4 text-sm text-gray-650">
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center text-[#E73367] mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600 font-medium">How to search and book properties easily</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center text-[#E73367] mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600 font-medium">Supported payment methods (bKash & Cards)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center text-[#E73367] mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600 font-medium">Refund request and cancellation guidelines</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center text-[#E73367] mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600 font-medium">Communicating directly with listing hosts</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Property Owner Section */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-250/20 hover:shadow-2xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-350 group flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full bg-indigo-500/5 blur-xl pointer-events-none transition-transform duration-500 group-hover:scale-125"></div>
                            <div>
                                <div className="flex items-center mb-6">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl mr-4 shadow-inner">
                                        <FiHome className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">For Property Owners</h3>
                                        <p className="text-xs text-gray-405">Maximize your listings & bookings</p>
                                    </div>
                                </div>
                                <ul className="space-y-4 text-sm text-gray-650">
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600 font-medium">Listing properties and seeding room inventory</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600 font-medium">Setting global & property auto-accept flags</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600 font-medium">PMS reservations, pricing and billing management</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mt-0.5">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </span>
                                        <span className="text-gray-600 font-medium">Payout procedures and banking details setup</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: FAQ Accordions */}
                <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                        <h2 className="text-2xl font-extrabold text-gray-950">Frequently Asked Questions</h2>
                        <p className="text-xs text-gray-500 mt-1">Browse through our help categories to find answers quickly.</p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Categories Left Sidebar */}
                        <div className="lg:w-1/3 space-y-2">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Categories</h3>
                            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            setOpenIndex(null);
                                        }}
                                        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex-shrink-0 w-auto lg:w-full text-left relative overflow-hidden group
                                            ${activeCategory === cat.id
                                                ? 'bg-white shadow-lg text-[#E73367] border border-rose-100 lg:translate-x-1'
                                                : 'text-gray-600 hover:bg-white hover:shadow-md hover:text-gray-900 bg-white/40 border border-transparent'
                                            }`}
                                    >
                                        {activeCategory === cat.id && (
                                            <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#E73367] to-[#d42c5c] rounded-r" />
                                        )}
                                        <span className={`p-1.5 rounded-lg transition-colors ${
                                            activeCategory === cat.id ? 'bg-rose-50 text-[#E73367]' : 'bg-gray-100 text-gray-500 group-hover:bg-rose-50 group-hover:text-[#E73367]'
                                        }`}>
                                            {cat.icon}
                                        </span>
                                        <span className="font-semibold">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Accordion Right side */}
                        <div className="lg:w-2/3 space-y-4 animate-delay-100">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {categories.find(c => c.id === activeCategory)?.name}
                                </h3>
                                {searchQuery && (
                                    <p className="text-xs text-gray-400 mt-1">Showing search results matching "{searchQuery}"</p>
                                )}
                            </div>

                            {displayedItems.length === 0 ? (
                                <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-xl shadow-gray-250/10 animate-fade-in">
                                    <FiSearch className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <h4 className="font-bold text-gray-900 mb-1">No FAQs Found</h4>
                                    <p className="text-xs text-gray-505">We couldn't find any results. Try searching for other terms or choose another category.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {displayedItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`bg-white rounded-2xl border transition-all duration-350 overflow-hidden ${
                                                openIndex === index 
                                                    ? 'border-rose-100 shadow-lg shadow-rose-100/10' 
                                                    : 'border-gray-100 hover:border-gray-200 shadow-sm'
                                            }`}
                                        >
                                            <button
                                                onClick={() => toggleAccordion(index)}
                                                className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none bg-white transition-all duration-300"
                                            >
                                                <span className={`font-bold text-base pr-6 transition-colors ${openIndex === index ? 'text-[#E73367]' : 'text-gray-900'}`}>
                                                    {item.question}
                                                </span>
                                                <span className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${openIndex === index ? 'bg-rose-50 text-[#E73367] transform rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                                                    <FiChevronDown className="w-4 h-4" />
                                                </span>
                                            </button>

                                            <div
                                                className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                            >
                                                <div className="overflow-hidden">
                                                    <div className="px-6 pb-6 pt-2 text-gray-655 text-sm leading-relaxed border-t border-gray-55">
                                                        {item.answer}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 3: Contact Support */}
                <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 md:p-10 shadow-xl shadow-gray-250/20 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-350 hover:shadow-2xl hover:border-rose-100 animate-delay-200">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-rose-500/5 blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none"></div>
                    
                    <div className="relative z-10 space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-extrabold text-gray-950 flex items-center justify-center md:justify-start gap-2">
                            <FiMessageSquare className="text-[#E73367] w-6 h-6 animate-pulse" />
                            Still need assistance?
                        </h3>
                        <p className="text-sm text-gray-600 max-w-xl leading-relaxed">
                            If you couldn't find the answers in our manuals or FAQs, please feel free to create a support ticket or contact our support desk directly. We respond within an hour!
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <Link 
                            to="/support" 
                            className="px-6 py-3 bg-gray-900 text-white font-bold text-xs rounded-xl hover:bg-black hover:scale-105 transition-all text-center shadow-md shadow-gray-900/10"
                        >
                            Open Support Ticket
                        </Link>
                        <a 
                            href={`mailto:${settings?.contact_email || 'support@keyhosthomes.com'}`}
                            className="px-6 py-3 bg-[#E73367] text-white font-bold text-xs rounded-xl hover:bg-[#d42c5c] hover:scale-105 transition-all text-center shadow-md shadow-[#E73367]/10"
                        >
                            Email Support
                        </a>
                    </div>
                </div>

            </div>

            <style jsx="true">{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
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
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-delay-100 {
                    animation-delay: 100ms;
                }
                .animate-delay-200 {
                    animation-delay: 200ms;
                }
                .animate-delay-300 {
                    animation-delay: 300ms;
                }
            `}</style>
        </div>
    );
}

export default Help;

