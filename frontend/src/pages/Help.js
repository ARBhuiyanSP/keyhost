import React from 'react';
import { FiHelpCircle, FiUser, FiHome } from 'react-icons/fi';

function Help() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-12">
                    <FiHelpCircle className="w-12 h-12 text-[#E73367]" />
                    <h1 className="text-4xl font-extrabold text-gray-900">Help Center</h1>
                </div>
                <p className="text-lg text-gray-600 mb-10">
                    Find answers and guidance for both guests and property owners. If you need further assistance, feel free to contact our support team.
                </p>
                {/* Grid for Guest and Owner sections */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Guest Section */}
                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center mb-4">
                            <FiUser className="w-8 h-8 text-[#E73367] mr-2" />
                            <h2 className="text-2xl font-semibold text-gray-800">For Guests</h2>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>How to book a property</li>
                            <li>Payment methods and refunds</li>
                            <li>Managing your reservations</li>
                            <li>Contacting hosts</li>
                        </ul>
                    </section>
                    {/* Property Owner Section */}
                    <section className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center mb-4">
                            <FiHome className="w-8 h-8 text-[#E73367] mr-2" />
                            <h2 className="text-2xl font-semibold text-gray-800">For Property Owners</h2>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li>Listing your property</li>
                            <li>Setting pricing and availability</li>
                            <li>Managing bookings and cancellations</li>
                            <li>Getting paid</li>
                        </ul>
                    </section>
                </div>
                {/* FAQ / Contact */}
                <section className="mt-12 bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">General FAQs</h2>
                    <p className="text-gray-600 mb-4">
                        Can't find what you're looking for? Reach out to our support team and we'll help you out.
                    </p>
                    <a
                        href="mailto:support@keyhosthomes.com"
                        className="inline-block bg-[#E73367] text-white px-5 py-2 rounded-md hover:bg-[#d42c5c] transition-colors"
                    >
                        Contact Support
                    </a>
                </section>
            </div>
        </div>
    );
}

export default Help;
