import React, { useState } from 'react';
import { FiMessageSquare, FiX, FiPhone, FiMail, FiHelpCircle, FiClock, FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import useSettingsStore from '../../store/settingsStore';

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettingsStore();

  const phone = settings?.contact_phone || '+8801700000000';
  const email = settings?.contact_email || 'support@keyhost24.com';

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-[9999] print:hidden">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-gray-900 text-white rotate-90' : 'bg-[#E41D57] text-white'
        }`}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageSquare className="w-6 h-6" />}
      </button>

      {/* Widget Content */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#E41D57] p-5 text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FiHelpCircle className="w-5 h-5" />
              Need Help?
            </h3>
            <p className="text-white/80 text-xs mt-1">We're here to assist you 24/7</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Quick Contact */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`tel:${phone}`}
                className="flex flex-col items-center justify-center p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 group"
              >
                <FiPhone className="w-4 h-4 text-green-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold text-gray-900">Call Us</span>
              </a>
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 group"
              >
                <FiMessageCircle className="w-4 h-4 text-emerald-500 mb-1.5 group-hover:scale-110 transition-transform animate-[pulse_2s_infinite]" />
                <span className="text-[9px] font-bold text-gray-900">WhatsApp</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex flex-col items-center justify-center p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 group"
              >
                <FiMail className="w-4 h-4 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold text-gray-900">Email</span>
              </a>
            </div>

            {/* Links */}
            <div className="space-y-2">
              <Link
                to="/support"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                      <FiMessageSquare className="w-4 h-4" />
                   </div>
                   <div className="text-left">
                      <div className="text-xs font-bold text-gray-900">Support Ticket</div>
                      <div className="text-[10px] text-gray-500">Track and manage queries</div>
                   </div>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </Link>

              <Link
                to="/help"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-55 transition-colors group"
              >
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                      <FiHelpCircle className="w-4 h-4" />
                   </div>
                   <div className="text-left">
                      <div className="text-xs font-bold text-gray-900">Help Center / FAQ</div>
                      <div className="text-[10px] text-gray-500">Instant answers to basics</div>
                   </div>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 py-2 border-t border-gray-50">
               <FiClock className="w-3 h-3 text-gray-400" />
               <span className="text-[10px] text-gray-400 font-medium italic">Avg. response time: &lt; 1 hour</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportWidget;
