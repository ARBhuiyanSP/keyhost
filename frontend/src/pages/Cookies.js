import React, { useState, useEffect } from 'react';
import useSettingsStore from '../store/settingsStore';
import { FiDatabase, FiSettings, FiShield, FiEye, FiMail } from 'react-icons/fi';

const Cookies = () => {
    const { settings } = useSettingsStore();
    const siteName = settings?.site_name || 'Keyhost';
    const [activeSection, setActiveSection] = useState('what-are-cookies');

    const sections = [
        { id: 'what-are-cookies', title: '1. What Are Cookies', icon: <FiDatabase /> },
        { id: 'how-we-use', title: '2. How We Use Them', icon: <FiSettings /> },
        { id: 'types', title: '3. Types of Cookies', icon: <FiShield /> },
        { id: 'your-choices', title: '4. Your Choices', icon: <FiEye /> },
        { id: 'contact', title: '5. Contact Us', icon: <FiMail /> }
    ];

    useEffect(() => {
        const handleScroll = () => {
            const offsets = sections.map(sec => {
                const el = document.getElementById(sec.id);
                return { id: sec.id, top: el ? el.offsetTop : 0 };
            });
            const currentScroll = window.scrollY + 200;

            let matched = sections[0].id;
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
    }, [sections]);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans selection:bg-indigo-200 pb-20">

            {/* Cookies Document Header */}
            <div className="bg-gradient-to-br from-gray-900 to-navy-900 relative py-12 overflow-hidden rounded-b-[3rem] shadow-2xl mb-12">
                <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-[fadeInUp_1s_ease-out_forwards]">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">Cookies Policy</h1>
                    <p className="text-blue-100 font-light max-w-2xl mx-auto text-lg opacity-90 leading-relaxed">
                        Learn how we use cookies and similar technologies to improve your experience on our platform at {siteName}.
                    </p>
                    <div className="mt-6 inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-xs font-medium text-white">
                        <span className="w-2 h-2 rounded-full bg-blue-400 mr-3 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></span>
                        Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Table of Contents Sidebar */}
                    <div className="lg:w-1/4 hidden lg:block">
                        <div className="sticky top-28 bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-3">Contents</h3>
                            <nav className="space-y-1">
                                {sections.map(section => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 ${activeSection === section.id
                                            ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm border border-indigo-100'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                            }`}
                                    >
                                        <span className={`mr-3 ${activeSection === section.id ? 'text-indigo-500' : 'text-gray-400'}`}>
                                            {section.icon}
                                        </span>
                                        <span className="text-left text-sm">{section.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Document Content */}
                    <div className="lg:w-3/4">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-14 mb-10 animate-[fadeInUp_1s_ease-out_0.4s_forwards] opacity-0">

                            <div className="prose prose-indigo max-w-none text-gray-600 leading-loose prose-headings:text-navy-900 prose-headings:font-bold prose-p:font-light prose-p:text-lg">

                                <div id="what-are-cookies" className="scroll-mt-32">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">1. What Are Cookies</h2>
                                    <p>
                                        Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
                                    </p>
                                    <p>
                                        Cookies set by the website owner (in this case, <strong className="text-gray-900">{siteName}</strong>) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies".
                                    </p>
                                </div>

                                <div id="how-we-use" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">2. How We Use Them</h2>
                                    <p>We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.</p>
                                    <ul className="list-disc pl-6 space-y-3 marker:text-indigo-500 mt-6">
                                        <li>To enable core website functionality and secure logins.</li>
                                        <li>To automatically remember your preferences and settings during your visit.</li>
                                        <li>To analyze site traffic, usage patterns, and user interactions to improve our platform.</li>
                                        <li>To measure the effectiveness of our marketing campaigns.</li>
                                    </ul>
                                </div>

                                <div id="types" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">3. Types of Cookies</h2>
                                    
                                    <div className="space-y-4 my-8">
                                        <div className="flex flex-col md:flex-row gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">A</div>
                                            <div>
                                                <strong className="block text-indigo-900 mb-1">Essential Cookies</strong>
                                                <p className="text-sm leading-relaxed">These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">B</div>
                                            <div>
                                                <strong className="block text-indigo-900 mb-1">Performance & Analytics Cookies</strong>
                                                <p className="text-sm leading-relaxed">These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">C</div>
                                            <div>
                                                <strong className="block text-indigo-900 mb-1">Functionality Cookies</strong>
                                                <p className="text-sm leading-relaxed">These are used to recognize you when you return to our Website. This enables us to personalize our content for you and remember your preferences.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div id="your-choices" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">4. Your Choices</h2>
                                    <p>
                                        You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager or directly through your browser. 
                                    </p>
                                    <p>
                                        If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.
                                    </p>
                                </div>

                                <div id="contact" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">5. Contact Us</h2>
                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between mt-8">
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">Cookie inquiries?</h4>
                                            <p className="text-gray-600 mb-4 md:mb-0">Reach out to our Data Protection Officer for any specific questions involving how we use cookies.</p>
                                        </div>
                                        {settings?.contact_email ? (
                                            <a href={`mailto:${settings.contact_email}`} className="px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md whitespace-nowrap">
                                                Email Support
                                            </a>
                                        ) : (
                                            <a href="/contact" className="px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md whitespace-nowrap">
                                                Contact Form
                                            </a>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx="true">{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default Cookies;
