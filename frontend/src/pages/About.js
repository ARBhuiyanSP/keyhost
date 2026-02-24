import React from 'react';
import useSettingsStore from '../store/settingsStore';
import { FiGlobe, FiShield, FiHeart, FiStar, FiUsers, FiMapPin } from 'react-icons/fi';

const About = () => {
    const { settings } = useSettingsStore();

    return (
        <div className="bg-gray-50 min-h-screen font-sans selection:bg-blue-200">

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-white pt-24 pb-32">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-0 opacity-70"></div>
                <div className="absolute inset-y-0 right-0 w-1/2 bg-[url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-left opacity-10 filter grayscale-[20%] z-0 rounded-l-full transform translate-x-1/4 scale-125"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl text-left">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 animate-[fadeInUp_1s_ease-out_forwards] border border-blue-200 shadow-sm">
                            <FiStar className="mr-2" />
                            Redefining Hospitality
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-navy-900 tracking-tight leading-tight mb-6 animate-[fadeInUp_1s_ease-out_0.2s_forwards] opacity-0">
                            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{settings?.site_name || 'Keyhost'}</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light animate-[fadeInUp_1s_ease-out_0.4s_forwards] opacity-0 max-w-2xl">
                            {settings?.site_tagline || 'Your trusted partner for finding the perfect accommodation. We connect travelers with amazing places to stay.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section with Glassmorphism */}
            <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 md:p-12 animate-[fadeInUp_1s_ease-out_0.6s_forwards] opacity-0">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
                        <div className="group hidden lg:block border-none">
                            <div className="text-4xl md:text-5xl font-extrabold text-navy-900 mb-2 group-hover:scale-110 transition-transform duration-300">10k+</div>
                            <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">Active Properties</p>
                        </div>
                        <div className="group border-none lg:border-solid">
                            <div className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">50k+</div>
                            <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">Happy Travelers</p>
                        </div>
                        <div className="group">
                            <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 mb-2 group-hover:scale-110 transition-transform duration-300">120+</div>
                            <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">Countries</p>
                        </div>
                        <div className="group">
                            <div className="text-4xl md:text-5xl font-extrabold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">4.9/5</div>
                            <p className="text-gray-500 font-medium uppercase tracking-wider text-sm">Average Rating</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-600 rounded-3xl transform rotate-3 scale-105 opacity-20 group-hover:rotate-6 transition-transform duration-500"></div>
                            <img
                                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000&auto=format&fit=crop"
                                alt="Our Mission"
                                className="relative rounded-3xl shadow-xl w-full object-cover h-[500px]"
                            />
                        </div>

                        <div className="space-y-8">
                            <div>
                                <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-3">Our Mission</h2>
                                <h3 className="text-4xl font-extrabold text-navy-900 leading-tight mb-6">
                                    Making travel simple, accessible, and enjoyable for everyone.
                                </h3>
                                <div className="w-20 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-8"></div>
                                <p className="text-lg text-gray-600 leading-relaxed font-light">
                                    {settings?.site_description ||
                                        'We are dedicated to providing the best booking experience for travelers and hosts alike. Our platform bridge the gap between unique local experiences and global explorers seeking comfort, safety, and authenticity.'
                                    }
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">1</div>
                                    <div className="ml-4">
                                        <h4 className="text-xl font-bold text-gray-900 mb-1">Discover</h4>
                                        <p className="text-gray-500">Find hidden gems worldwide.</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">2</div>
                                    <div className="ml-4">
                                        <h4 className="text-xl font-bold text-gray-900 mb-1">Connect</h4>
                                        <p className="text-gray-500">Meet friendly local hosts.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-extrabold text-navy-900 mb-4">Our Core Values</h2>
                    <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">The principles that guide everything we do, ensuring you always get the best experience possible.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <FiGlobe className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Global Reach</h3>
                            <p className="text-gray-600 leading-relaxed">Connecting people across borders with unique local experiences. We believe that stepping out of your comfort zone shouldn't mean sacrificing comfort.</p>
                        </div>

                        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                                <FiShield className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trusted Safety</h3>
                            <p className="text-gray-600 leading-relaxed">Secure payments, vetted properties, and verified hosts for your absolute peace of mind. Your safety is our number one priority.</p>
                        </div>

                        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <FiHeart className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Stays</h3>
                            <p className="text-gray-600 leading-relaxed">Curated properties ensuring top-notch comfort and value. Every listing is reviewed to meet our high standards of hospitality.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision Call to Action */}
            <section className="relative overflow-hidden py-24 bg-navy-900 text-center">
                <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply z-0"></div>
                <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Our Vision</h2>
                    <p className="text-xl text-blue-100 leading-relaxed font-light mb-10">
                        We believe that travel changes people for the better. By opening doors to new places and cultures, we foster understanding and create lifelong memories. Let's explore the world together.
                    </p>
                    <a href="/properties" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-navy-900 bg-white rounded-full hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Explore Properties
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </a>
                </div>
            </section>

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
      `}</style>
        </div>
    );
};

export default About;
