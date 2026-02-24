import React, { useState, useEffect } from 'react';
import useSettingsStore from '../store/settingsStore';
import { FiCheckCircle, FiFileText, FiShield, FiTrendingUp } from 'react-icons/fi';

const Terms = () => {
    const { settings } = useSettingsStore();
    const siteName = settings?.site_name || 'Keyhost';
    const [activeSection, setActiveSection] = useState('acceptance');

    const sections = [
        { id: 'acceptance', title: '1. Acceptance', icon: <FiCheckCircle /> },
        { id: 'service', title: '2. Service', icon: <FiTrendingUp /> },
        { id: 'obligations', title: '3. Obligations', icon: <FiShield /> },
        { id: 'financial', title: '4. Financial', icon: <FiFileText /> },
        { id: 'cancellations', title: '5. Cancellations', icon: <FiFileText /> },
        { id: 'hosts', title: '6. Hosts', icon: <FiFileText /> },
        { id: 'liability', title: '7. Liability', icon: <FiFileText /> }
    ];

    // Simple scroll spy effect
    useEffect(() => {
        const handleScroll = () => {
            const offsets = sections.map(sec => {
                const el = document.getElementById(sec.id);
                return { id: sec.id, top: el ? el.offsetTop : 0 };
            });
            const currentScroll = window.scrollY + 200; // offset for header

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
                top: el.offsetTop - 100, // adjust for sticky header
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans selection:bg-blue-200 pb-20">

            {/* Elegant Document Header */}
            <div className="bg-gray-50 relative py-20 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-[fadeInUp_1s_ease-out_forwards]">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">Terms of Service</h1>
                    <p className="text-gray-600 font-light max-w-2xl mx-auto text-lg">
                        Please read these terms carefully before using our platform.
                    </p>
                    <div className="mt-8 inline-flex items-center px-4 py-2 rounded-full bg-white/50 backdrop-blur-md border border-blue-200 shadow-sm text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
                        <span className="text-gray-900">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
                                            ? 'bg-blue-50 text-blue-700 font-bold shadow-sm border border-blue-100'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                            }`}
                                    >
                                        <span className={`mr-3 ${activeSection === section.id ? 'text-blue-500' : 'text-gray-400'}`}>
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

                            <div className="prose prose-blue max-w-none text-gray-600 leading-loose prose-headings:text-navy-900 prose-headings:font-bold prose-p:font-light prose-p:text-lg">

                                <div id="acceptance" className="scroll-mt-32">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">1. Acceptance of Terms</h2>
                                    <p>
                                        By accessing and using <strong className="text-gray-900">{siteName}</strong>, you agree to comply with and be bound by these Terms of Service. These terms form a legally binding agreement between you and our platform.
                                    </p>
                                    <p>
                                        If you do not agree to these terms, including any future modifications, please do not use our services or access our application.
                                    </p>
                                </div>

                                <div id="service" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">2. Description of Service</h2>
                                    <p>
                                        <strong>{siteName}</strong> provides a trusted online marketplace that connects hosts (users who have accommodations to rent) with guests (users seeking to rent accommodations). We provide a digital space for these two parties to connect, communicate, and quickly book travel accommodations securely.
                                    </p>
                                    <p className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-900 my-8 shadow-inner">
                                        <strong className="block mb-2 text-blue-800">Please note:</strong>
                                        When a booking is made, a contract is formed directly between the Host and the Guest. We act solely as an intermediary to facilitate the connection and process secure payments.
                                    </p>
                                </div>

                                <div id="obligations" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">3. User Obligations</h2>
                                    <p>To use our services efficiently and safely, you agree to the following conditions:</p>
                                    <ul className="list-disc pl-6 space-y-4 marker:text-blue-500">
                                        <li className="pl-2">You must be at least <strong>18 years old</strong> (or the age of majority in your jurisdiction) to legally enter into contracts.</li>
                                        <li className="pl-2">You agree to provide accurate, current, and complete information during the registration process and keep your account details updated.</li>
                                        <li className="pl-2">You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</li>
                                        <li className="pl-2">You must not use the platform to conduct any illegal activities, harass other users, or attempt to circumvent our security measures.</li>
                                    </ul>
                                </div>

                                <div id="financial" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">4. Bookings and Financial Terms</h2>
                                    <p>
                                        When a booking is requested through our platform, hosts have the opportunity to review and accept or decline the request—unless "instant booking" is enabled for that specific listing.
                                    </p>
                                    <p>
                                        Guests agree to pay all charges associated with the booking, including accommodation fees, applicable service fees, cleaning fees, and local taxes. All payments are processed securely, and funds are held in escrow until the guest checks in to ensure safety for both parties.
                                    </p>
                                </div>

                                <div id="cancellations" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">5. Cancellations and Refunds</h2>
                                    <p>
                                        Cancellations and refunds are strictly governed by the specific cancellation policy carefully selected by the host and agreed to by the guest at checkout.
                                    </p>
                                    <p>
                                        It is highly advised to review the cancellation policy thoroughly before confirming any booking. In the event of an extenuating circumstance (e.g., severe weather emergencies or government travel restrictions), special cancellation policies may apply at the platform's sole discretion.
                                    </p>
                                </div>

                                <div id="hosts" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">6. Host Responsibilities</h2>
                                    <p>
                                        Hosts utilizing {siteName} take on specific responsibilities to ensure the platform remains trustworthy:
                                    </p>
                                    <ul className="space-y-4">
                                        <li className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <strong>Accuracy of Listings:</strong> Hosts are responsible for ensuring that their listings are accurate, up-to-date, and precisely describe the amenities and availability of the property.
                                        </li>
                                        <li className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <strong>Legal Compliance:</strong> Hosts must comply entirely with all local laws, zoning regulations, and tax obligations concerning short-term rentals in their respective municipalities.
                                        </li>
                                    </ul>
                                </div>

                                <div id="liability" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">7. Limitation of Liability</h2>
                                    <p>
                                        <strong>{siteName}</strong> acts exclusively as a platform connecting users. We are not a party to any rental agreement between hosts and guests.
                                    </p>
                                    <p>
                                        Under no circumstances will {siteName} be liable for any direct, indirect, incidental, or consequential damages arising out of your use of the platform. We are not responsible for the physical condition, safety, or legality of any accommodation listed on the site.
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Support CTA */}
                        <div className="bg-blue-600 text-white rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-blue-500/20 animate-[fadeInUp_1s_ease-out_0.6s_forwards] opacity-0">
                            <div className="mb-6 md:mb-0">
                                <h3 className="text-2xl font-bold mb-2">Have questions about our terms?</h3>
                                <p className="text-blue-100">Our legal support team is happy to clarify any points of confusion.</p>
                            </div>
                            <a href="/contact" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:scale-105 transition-transform shadow-lg whitespace-nowrap">
                                Contact Legal
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
      `}</style>
        </div>
    );
};

export default Terms;
