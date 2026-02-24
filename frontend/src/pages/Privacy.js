import React, { useState, useEffect } from 'react';
import useSettingsStore from '../store/settingsStore';
import { FiDatabase, FiLock, FiShare2, FiEye, FiSettings, FiMail } from 'react-icons/fi';

const Privacy = () => {
    const { settings } = useSettingsStore();
    const siteName = settings?.site_name || 'Keyhost';
    const [activeSection, setActiveSection] = useState('collection');

    const sections = [
        { id: 'collection', title: '1. Information We Collect', icon: <FiDatabase /> },
        { id: 'usage', title: '2. How We Use It', icon: <FiSettings /> },
        { id: 'sharing', title: '3. Data Sharing', icon: <FiShare2 /> },
        { id: 'security', title: '4. Data Security', icon: <FiLock /> },
        { id: 'rights', title: '5. Your Rights', icon: <FiEye /> },
        { id: 'cookies', title: '6. Cookies Policy', icon: <FiDatabase /> },
        { id: 'contact', title: '7. Contact Us', icon: <FiMail /> }
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

            {/* Privacy Document Header */}
            <div className="bg-gray-50 relative py-20 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-white/5 backdrop-blur-[1px]"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-[fadeInUp_1s_ease-out_forwards]">
                    <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-indigo-200 shadow-sm">
                        <FiLock className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">Privacy Policy</h1>
                    <p className="text-gray-600 font-light max-w-2xl mx-auto text-lg leading-relaxed">
                        Your privacy is critically important to us. Learn how we collect, use, and protect your personal data.
                    </p>
                    <div className="mt-8 inline-flex items-center px-4 py-2 rounded-full border border-indigo-200 bg-white/50 backdrop-blur-md shadow-sm text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
                        <span className="text-gray-900">Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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

                                <div id="collection" className="scroll-mt-32">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">1. Information We Collect</h2>
                                    <p>
                                        When you use <strong className="text-gray-900">{siteName}</strong>, we collect various levels of information to ensure that your experience on our platform is secure, reliable, and deeply personalized for your specific needs.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                            <h4 className="font-bold text-indigo-900 mb-2 flex items-center"><FiDatabase className="mr-2" /> Personal Information</h4>
                                            <p className="text-sm">Information such as your name, email address, phone number, physical address, profile picture, and verified identity documents necessary to build trust between hosts and guests.</p>
                                        </div>
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                            <h4 className="font-bold text-indigo-900 mb-2 flex items-center"><FiSettings className="mr-2" /> Usage & Device Data</h4>
                                            <p className="text-sm">Technical information automatically collected, including IP address, browser type, operating system characteristics, location data, search history, and pages viewed during your session.</p>
                                        </div>
                                    </div>
                                </div>

                                <div id="usage" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">2. How We Use Your Information</h2>
                                    <p>We leverage the data we collect primarily to execute the core functionality of our service and to continually improve the {siteName} ecosystem:</p>
                                    <ul className="list-disc pl-6 space-y-3 marker:text-indigo-500 mt-6">
                                        <li>To completely process your selected bookings and secure payments.</li>
                                        <li>To facilitate seamless communication directly between hosts and guests.</li>
                                        <li>To provide active customer support and quickly resolve potential disputes.</li>
                                        <li>To powerfully personalize your search results according to your unique travel preferences.</li>
                                        <li>To perform essential security checks, preventing fraud and protecting our community members.</li>
                                    </ul>
                                </div>

                                <div id="sharing" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">3. Data Sharing & Disclosure</h2>
                                    <p>
                                        We profoundly respect your privacy and only share your information under strict, highly controlled circumstances:
                                    </p>
                                    <div className="space-y-4 my-8">
                                        <div className="flex flex-col md:flex-row gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">A</div>
                                            <div>
                                                <strong className="block text-indigo-900 mb-1">With Hosts & Guests</strong>
                                                <p className="text-sm leading-relaxed">When you actively confirm a booking, we share strictly necessary identification details—like your first name, basic profile, and contact information—between both parties.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">B</div>
                                            <div>
                                                <strong className="block text-indigo-900 mb-1">With Service Providers</strong>
                                                <p className="text-sm leading-relaxed">We utilize trusted third-party cloud infrastructure, secure payment gateways, and data analytics partners who process data exclusively under our strict legal instruction.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold">C</div>
                                            <div>
                                                <strong className="block text-indigo-900 mb-1">For Legal Compliance</strong>
                                                <p className="text-sm leading-relaxed">We may responsibly disclose information if explicitly required by law enforcement or necessary to protect the platform's overriding legal rights.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div id="security" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">4. Data Security</h2>
                                    <p>
                                        {siteName} implements robust, industry-leading security practices globally to ensure absolute protection of the confidentiality of your personal information. These advanced measures natively include end-to-end data encryption during transit (SSL/TLS), strict role-based access controls for enterprise personnel, and consistent proactive security audits against common threats.
                                    </p>
                                    <p>
                                        However, kindly note that while we fight constantly to protect your digital footprint, no electronic transmission mechanism is 100% impenetrable.
                                    </p>
                                </div>

                                <div id="rights" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">5. Your Privacy Rights</h2>
                                    <p>
                                        Depending entirely upon your geographical jurisdiction (e.g., GDPR in Europe, CCPA in California), you reserve extensive sovereign rights regarding your data:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-3 marker:text-indigo-500 my-6">
                                        <li>The fundamental right to formally request access to all data we have collected about you.</li>
                                        <li>The right to immediately request corrections to inaccurate personal records.</li>
                                        <li>The explicit "right to be forgotten" and have your data thoroughly erased.</li>
                                        <li>The technical right to efficiently export your profile information in a common format.</li>
                                    </ul>
                                    <p>You can execute the majority of these rights seamlessly from your {siteName} account dashboard.</p>
                                </div>

                                <div id="cookies" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">6. Cookies Policy</h2>
                                    <p>
                                        Our platform effectively utilizes strictly necessary cookies alongside targeted behavioral tracking technologies to analyze digital traffic, verify secure login sessions, and optimize performance. You possess the complete freedom to manually disable non-essential cookies via your standard browser settings.
                                    </p>
                                </div>

                                <div id="contact" className="scroll-mt-32 mt-16">
                                    <h2 className="text-3xl mb-6 pb-2 border-b border-gray-100">7. Contact Us</h2>
                                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between mt-8">
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">Privacy inquiries?</h4>
                                            <p className="text-gray-600 mb-4 md:mb-0">Reach out to our Data Protection Officer for any specific questions involving how we process your personal data.</p>
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

export default Privacy;
