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
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
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
            </div>
            <p className="text-gray-600 text-sm">
              {settings?.site_description || 'Your trusted partner for finding the perfect accommodation. We connect travelers with amazing places to stay.'}
            </p>
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

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Info</h3>
            <div className="space-y-3">
              {settings?.contact_email && (
                <div className="flex items-center space-x-3">
                  <FiMail className="w-4 h-4 text-[#E41D57]" />
                  <a 
                    href={`mailto:${settings.contact_email}`}
                    className="text-gray-600 text-sm hover:text-gray-900 transition-colors"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              )}
              {settings?.contact_phone && (
                <div className="flex items-center space-x-3">
                  <FiPhone className="w-4 h-4 text-[#E41D57]" />
                  <a 
                    href={`tel:${settings.contact_phone}`}
                    className="text-gray-600 text-sm hover:text-gray-900 transition-colors"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              )}
              {settings?.site_address && (
                <div className="flex items-start space-x-3">
                  <FiMapPin className="w-4 h-4 text-[#E41D57] mt-1" />
                  <span className="text-gray-600 text-sm">
                    {settings.site_address}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} {settings?.site_name || 'Keyhost Homes'}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                Terms
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
                Privacy
              </Link>
              <Link to="/cookies" className="text-gray-600 hover:text-gray-900 text-sm transition-colors duration-200">
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
