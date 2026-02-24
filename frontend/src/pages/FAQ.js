import React, { useState } from 'react';
import { FiChevronDown, FiHelpCircle, FiSearch, FiMessageSquare, FiBookOpen, FiCreditCard, FiHome } from 'react-icons/fi';
import useSettingsStore from '../store/settingsStore';

const FAQ = () => {
    const { settings } = useSettingsStore();
    const [activeCategory, setActiveCategory] = useState('general');
    const [searchQuery, setSearchQuery] = useState('');

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
        { id: 'general', name: 'General Questions', icon: <FiBookOpen /> },
        { id: 'payments', name: 'Payments & Billing', icon: <FiCreditCard /> },
        { id: 'hosting', name: 'Hosting & Managing', icon: <FiHome /> },
    ];

    const [openIndex, setOpenIndex] = useState(null);

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

            {/* Hero Section */}
            <div className="bg-gray-50 relative py-20 overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-8">
                    <div className="w-20 h-20 bg-white/50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-blue-200 shadow-sm">
                        <FiHelpCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-[fadeInUp_1s_ease-out_forwards] text-gray-900">
                        How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">help?</span>
                    </h1>

                    {/* Search Bar */}
                    <div className="mt-10 max-w-2xl mx-auto relative animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0 shadow-2xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiSearch className="h-6 w-6 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-5 border-0 rounded-full text-lg text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-blue-500/30 transition-shadow bg-white/95 backdrop-blur shadow-inner"
                            placeholder="Search for answers (e.g., cancellations, refunds)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/3">
                        <div className="sticky top-28 space-y-2 opacity-0 animate-[fadeIn_1s_ease-out_0.4s_forwards]">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 ml-2">Categories</h3>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setActiveCategory(cat.id);
                                        setOpenIndex(null); // Reset open accordion
                                    }}
                                    className={`w-full text-left px-6 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 font-semibold text-lg
                    ${activeCategory === cat.id
                                            ? 'bg-white shadow-xl shadow-gray-200/50 text-blue-600 border border-gray-100 transform scale-105'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <span className={`p-2 rounded-xl ${activeCategory === cat.id ? 'bg-blue-50' : 'bg-transparent text-gray-400'}`}>
                                        {cat.icon}
                                    </span>
                                    {cat.name}
                                </button>
                            ))}

                            <div className="mt-12 bg-blue-50 p-8 rounded-3xl border border-blue-100 flex flex-col items-center text-center shadow-inner">
                                <FiMessageSquare className="w-10 h-10 text-blue-600 mb-4" />
                                <h4 className="font-bold text-gray-900 text-lg mb-2">Still need help?</h4>
                                <p className="text-gray-600 mb-6 text-sm">We're here to help you with any questions you might have.</p>
                                <a href="/contact" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md w-full">
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Accordion List */}
                    <div className="lg:w-2/3">
                        <div className="mb-8 opacity-0 animate-[fadeInUp_1s_ease-out_0.5s_forwards]">
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                {categories.find(c => c.id === activeCategory)?.name}
                            </h2>
                            {searchQuery && (
                                <p className="text-gray-500 mt-2 font-medium">Showing results for "{searchQuery}"</p>
                            )}
                        </div>

                        {displayedItems.length === 0 ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_forwards]">
                                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiSearch className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                                <p className="text-gray-500">We couldn't find any answers matching your search. Try different keywords or browse our categories.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_forwards]">
                                {displayedItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === index ? 'border-blue-200 shadow-xl shadow-blue-900/5' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'}`}
                                    >
                                        <button
                                            onClick={() => toggleAccordion(index)}
                                            className="w-full text-left px-8 py-6 flex items-start justify-between focus:outline-none group bg-white"
                                        >
                                            <span className={`font-bold text-lg pr-8 transition-colors ${openIndex === index ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'}`}>
                                                {item.question}
                                            </span>
                                            <span className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${openIndex === index ? 'bg-blue-50 text-blue-600 transform rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                                <FiChevronDown className="w-5 h-5" />
                                            </span>
                                        </button>

                                        <div
                                            className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                        >
                                            <div className="overflow-hidden">
                                                <div className="px-8 pb-8 pt-2 text-gray-600 text-lg leading-relaxed font-light border-t border-gray-50/50">
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

export default FAQ;
