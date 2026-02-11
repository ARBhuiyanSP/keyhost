import React from 'react';
import { FaPlane } from 'react-icons/fa';

const PlaneLoader = ({ text = "Processing...", subtext = "Please wait a moment" }) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="relative mb-8">
                {/* Outer Ring */}
                <div className="w-32 h-32 border-4 border-gray-100 rounded-full"></div>

                {/* Spinning Ring */}
                <div className="absolute inset-0 w-32 h-32 border-4 border-transparent border-t-[#E41D57] border-l-[#E41D57]/50 rounded-full animate-spin"></div>

                {/* Inner Plane */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-bounce">
                        <FaPlane className="text-[#1e2049] text-4xl transform -rotate-45" />
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-bold text-[#1e2049] mb-2">{text}</h3>
            <p className="text-gray-500 font-medium animate-pulse">{subtext}</p>
        </div>
    );
};

export default PlaneLoader;
