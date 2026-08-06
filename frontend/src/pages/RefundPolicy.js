import React, { useState, useEffect } from 'react';
import useSettingsStore from '../store/settingsStore';
import { FiRefreshCcw, FiClock, FiAlertCircle, FiSettings, FiMail, FiCheckCircle, FiFileText, FiShield, FiTrendingUp, FiInfo, FiCreditCard, FiUsers, FiHome, FiAlertTriangle, FiDollarSign, FiLock, FiGlobe, FiPhone } from 'react-icons/fi';

const RefundPolicy = () => {
    const { settings } = useSettingsStore();
    const siteName = settings?.site_name || 'Keyhost';
    const [activeSection, setActiveSection] = useState('');
    const [parsedData, setParsedData] = useState({ sections: [], intro: [] });

    // Icons mapping for known sections
    const getIconForSection = (title) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('time') || lowerTitle.includes('when')) return <FiClock />;
        if (lowerTitle.includes('except') || lowerTitle.includes('force')) return <FiAlertCircle />;
        if (lowerTitle.includes('contact') || lowerTitle.includes('help')) return <FiMail />;
        if (lowerTitle.includes('general') || lowerTitle.includes('rule')) return <FiRefreshCcw />;
        if (lowerTitle.includes('cancel')) return <FiAlertTriangle />;
        if (lowerTitle.includes('refund')) return <FiDollarSign />;
        return <FiFileText />;
    };

    useEffect(() => {
        if (settings?.refund_policy) {
            const lines = settings.refund_policy.split('\n');
            const sections = [];
            let currentSection = null;
            let intro = [];

            lines.forEach(line => {
                const headingMatch = line.match(/^(#{2,3})\s+(.*)$/);
                if (headingMatch) {
                    if (currentSection) {
                        sections.push(currentSection);
                    }
                    const title = headingMatch[2];
                    currentSection = {
                        id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                        title: title,
                        icon: getIconForSection(title),
                        lines: []
                    };
                } else if (currentSection) {
                    currentSection.lines.push(line);
                } else {
                    intro.push(line);
                }
            });

            if (currentSection) {
                sections.push(currentSection);
            }

            setParsedData({ sections, intro });
            if (sections.length > 0) setActiveSection(sections[0].id);
        } else {
            // Fallback sections
            setParsedData({
                sections: [
                    { id: 'general', title: '1. General Refund Rules', icon: <FiRefreshCcw />, lines: ['All reservations at Keyhost...'] }
                ],
                intro: ['Understand your options for an easy and smooth refund process.']
            });
            setActiveSection('general');
        }
    }, [settings?.refund_policy]);

    // Simple scroll spy effect
    useEffect(() => {
        if (!parsedData.sections.length) return;

        const handleScroll = () => {
            const offsets = parsedData.sections.map(sec => {
                const el = document.getElementById(sec.id);
                return { id: sec.id, top: el ? el.offsetTop : 0 };
            });
            const currentScroll = window.scrollY + 250; // offset for header

            let matched = parsedData.sections[0].id;
            for (let i = offsets.length - 1; i >= 0; i--) {
                if (currentScroll >= offsets[i].top) {
                    matched = offsets[i].id;
                    break;
                }
            }
            setActiveSection(matched);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [parsedData.sections]);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 120, // adjust for sticky header
                behavior: 'smooth'
            });
        }
    };

    const renderLine = (line, idx) => {
        const trimmed = line.trim();
        if (trimmed === '---') {
            return null; // Skip hr as we format sections nicely
        }
        if (trimmed.startsWith('- ')) {
            return (
                <li key={idx} className="flex items-start mb-3 text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></span>
                    <span className="leading-relaxed">{trimmed.substring(2)}</span>
                </li>
            );
        }
        if (trimmed === '') {
            return <div key={idx} className="h-3"></div>;
        }
        return <p key={idx} className="mb-4 text-gray-600 leading-relaxed">{trimmed}</p>;
    };

    return (
        <div className="bg-gray-50/50 min-h-screen font-sans selection:bg-blue-200 pb-20">

            {/* Elegant Document Header */}
            <div className="bg-gradient-to-br from-gray-900 to-navy-900 relative py-8 overflow-hidden rounded-b-[3rem] shadow-2xl mb-6">
                <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-[fadeInUp_1s_ease-out_forwards]">
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-white">Refund Policy</h1>
                    <p className="text-blue-100 font-light max-w-2xl mx-auto text-sm opacity-90">
                        Understand your options for an easy and smooth refund process here at {siteName}.
                    </p>
                    <div className="mt-3 inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-xs font-medium text-white">
                        <span className="w-2 h-2 rounded-full bg-green-400 mr-3 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                        Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Table of Contents Sidebar */}
                    {parsedData.sections.length > 1 && (
                        <div className="lg:w-1/4 hidden lg:block">
                            <div className="sticky top-28 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 ml-3">Contents</h3>
                                <nav className="space-y-1.5 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                                    {parsedData.sections.map(section => (
                                        <button
                                            key={section.id}
                                            onClick={() => scrollToSection(section.id)}
                                            className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group ${
                                                activeSection === section.id
                                                    ? 'bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100/50'
                                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium border border-transparent'
                                            }`}
                                        >
                                            <span className="text-left text-sm leading-tight">{section.title}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    )}

                    {/* Main Document Content */}
                    <div className={parsedData.sections.length > 1 ? "lg:w-3/4" : "w-full max-w-4xl mx-auto"}>
                        
                        {/* Intro Box */}
                        {parsedData.intro.length > 0 && parsedData.intro.join('').trim() !== '' && (
                            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 mb-8 animate-[fadeInUp_1s_ease-out_0.3s_forwards] opacity-0">
                                <div className="text-lg text-gray-600 leading-relaxed font-medium">
                                    {parsedData.intro.map((line, i) => renderLine(line, i))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-8">
                            {parsedData.sections.map((section, index) => (
                                <div 
                                    key={section.id} 
                                    id={section.id} 
                                    className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 scroll-mt-28 animate-[fadeInUp_1s_ease-out_forwards] opacity-0"
                                    style={{ animationDelay: `${0.4 + (index * 0.1)}s` }}
                                >
                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                            {section.title}
                                        </h2>
                                    </div>
                                    
                                    <div className="text-lg text-gray-700">
                                        <ul className="list-none space-y-1">
                                            {section.lines.map((line, i) => renderLine(line, i))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Support CTA */}
                        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-blue-500/20 animate-[fadeInUp_1s_ease-out_1s_forwards] opacity-0">
                            <div className="mb-6 md:mb-0">
                                <h3 className="text-2xl font-bold mb-2">Need Help with a Refund?</h3>
                                <p className="text-blue-100 opacity-90">Reach out to our support team for any queries regarding cancellations or refunds.</p>
                            </div>
                            <a href="/contact" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg whitespace-nowrap">
                                Contact Support
                            </a>
                        </div>

                    </div>
                </div>
            </div>

            <style jsx="true">{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #E5E7EB;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default RefundPolicy;
