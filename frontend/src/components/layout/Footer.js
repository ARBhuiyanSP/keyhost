import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiYoutube } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';
import useSettingsStore from '../../store/settingsStore';

const Footer = () => {
  const { settings } = useSettingsStore();

  return (
    <footer className="bg-white text-gray-900 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 gap-y-12">
          {/* Company Info - Full Width on Mobile */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Link to="/" className="flex items-center inline-block">
              {settings?.site_logo ? (
                <img
                  src={settings.site_logo}
                  alt={settings?.site_name || 'Logo'}
                  className="h-8 w-auto max-w-[150px] object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-[#E41D57] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {(settings?.site_name || 'Keyhost Homes').charAt(0)}
                  </span>
                </div>
              )}
            </Link>
            <p className="text-black text-sm">
              {settings?.site_description || 'Your trusted partner for finding the perfect accommodation. We connect travelers with amazing places to stay.'}
            </p>
            <div className="bg-gray-50 border-l-4 border-[#E63367] p-3 mt-4 rounded-r-lg max-w-full overflow-hidden">
              <p className="text-black text-[11px] font-bold leading-tight uppercase tracking-wider mb-1">
                Trade License:
              </p>
              <p className="text-[#E63367] text-xs sm:text-sm font-black tracking-tight break-all">
                TRAD/DNCC/032615/2024
              </p>
            </div>
            <div className="flex space-x-4">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <FiFacebook className="w-5 h-5" />
                </a>
              )}
              {settings?.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <FiTwitter className="w-5 h-5" />
                </a>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <FiInstagram className="w-5 h-5" />
                </a>
              )}
              {settings?.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <FiLinkedin className="w-5 h-5" />
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <FiYoutube className="w-5 h-5" />
                </a>
              )}
              {settings?.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  <FaTiktok className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links - Side-by-side on Mobile */}
          <div className="col-span-1 lg:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-2 inline-block">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-black hover:text-primary-600 transition-colors duration-200 text-sm font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-black hover:text-primary-600 transition-colors duration-200 text-sm font-medium">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-black hover:text-primary-600 transition-colors duration-200 text-sm font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-black hover:text-primary-600 transition-colors duration-200 text-sm font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support - Side-by-side on Mobile */}
          <div className="col-span-1 lg:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-2 inline-block">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-black hover:text-primary-600 transition-colors duration-200 text-sm font-medium">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <a href="/project_documentation.html" target="_blank" rel="noopener noreferrer" className="text-black hover:text-primary-600 transition-colors duration-200 text-sm font-medium">
                  User Manual
                </a>
              </li>
              <li>
                <Link to="/terms" className="text-black hover:text-primary-600 transition-colors duration-200 text-sm font-medium">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-black hover:text-primary-600 transition-colors duration-200 text-sm font-medium">
                  Refund & Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info - Full Width on Mobile */}
          <div className="col-span-2 lg:col-span-1 space-y-4 border-t border-gray-100 pt-6 mt-4 lg:border-none lg:pt-0 lg:mt-0">
            <h3 className="text-lg font-bold text-black">Contact Info</h3>
            <div className="space-y-4">
              {settings?.contact_email && (
                <div className="flex items-start space-x-3">
                  <FiMail className="w-5 h-5 flex-shrink-0 text-[#E41D57] mt-0.5" />
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-black text-sm hover:text-primary-600 transition-colors break-words font-medium"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              )}
              {settings?.contact_phone && (
                <div className="flex items-start space-x-3">
                  <FiPhone className="w-5 h-5 flex-shrink-0 text-[#E41D57] mt-0.5" />
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="text-black text-sm hover:text-primary-600 transition-colors font-medium"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              )}
              {settings?.site_address && (
                <div className="flex items-start space-x-3">
                  <FiMapPin className="w-5 h-5 flex-shrink-0 text-[#E41D57] mt-0.5" />
                  <span className="text-black text-sm leading-relaxed font-medium">
                    {settings.site_address}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          {/* Payment Banner - Inside Content Box */}
          <div className="w-full bg-white border border-gray-200 mb-8 rounded-xl shadow-sm overflow-hidden">
            <img 
              src="/images/payment.png" 
              alt="Payment Methods" 
              className="w-full h-auto block"
              style={{ objectFit: 'cover' }}
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-black text-sm font-bold">
              © {new Date().getFullYear()} {settings?.site_name || 'Keyhost Homes'}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-black hover:text-primary-600 text-sm transition-colors duration-200 font-medium">
                Terms
              </Link>
              <Link to="/refund-policy" className="text-black hover:text-primary-600 text-sm transition-colors duration-200 font-medium">
                Refund & Cancellation
              </Link>
              <Link to="/cookies" className="text-black hover:text-primary-600 text-sm transition-colors duration-200 font-medium">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
