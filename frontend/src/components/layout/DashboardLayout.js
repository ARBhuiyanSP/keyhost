import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FiGrid, FiCalendar, FiHome, FiUsers, FiDollarSign,
    FiSettings, FiLogOut, FiMenu, FiX, FiSearch,
    FiChevronDown, FiChevronRight, FiUser,
    FiTruck, FiActivity
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';

const DashboardLayout = () => {
    const { user, logout, isAdmin, isPropertyOwner } = useAuthStore();
    const { settings } = useSettingsStore();

    // Initialize sidebar based on screen width
    // Mobile (< 768px): default closed (false)
    // Desktop (>= 768px): default open (true)
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const navigate = useNavigate();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});

    // Close sidebar on route change for mobile
    useEffect(() => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, [location.pathname]);

    // Handle window resize to adjust sidebar state
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                // On desktop, we ideally want it open by default, 
                // but checking 'sidebarOpen' might be enough. 
                // Let's just ensure if we resize from mobile to desktop, 
                // the sidebar layout adjusts. The state 'sidebarOpen' 
                // on desktop means "expanded", on mobile means "visible".
                // If we are on desktop, force it open if it was closed? 
                // Maybe not, user might have wanted it collapsed on desktop.
                // But simplified logic: reset to true on desktop switch?
                // Let's keep it simple: if resizing to desktop, ensure it's visible.
                if (!sidebarOpen) setSidebarOpen(true);
            } else {
                // On mobile, default to closed
                setSidebarOpen(false);
            }
        };

        // Add listener only - logic inside needs care not to override user toggle excessively
        // For simplicity in this iteration, we won't auto-toggle on every pixel change,
        // but initial state handles the load.
        // Actually, preventing the sidebar from disappearing when resizing up is good.
    }, []);

    const toggleMenu = (name) => {
        setExpandedMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getMenu = () => {
        if (isAdmin()) {
            return [
                { name: 'Dashboard', path: '/admin', icon: FiGrid },
                {
                    name: 'Reservation',
                    icon: FiCalendar,
                    submenu: [
                        { name: 'All Bookings', path: '/admin/bookings' },
                    ]
                },
                {
                    name: 'Properties',
                    icon: FiHome,
                    submenu: [
                        { name: 'All Properties', path: '/admin/properties' },
                        { name: 'Property Types', path: '/admin/property-types' },
                        { name: 'Amenities', path: '/admin/amenities' },
                        { name: 'Display Categories', path: '/admin/display-categories' }
                    ]
                },
                { name: 'Users', path: '/admin/users', icon: FiUsers },
                { name: 'Reviews', path: '/admin/reviews', icon: FiActivity },
                { name: 'Rewards Points', path: '/admin/rewards-points', icon: FiActivity },
                { name: 'Earnings', path: '/admin/earnings', icon: FiDollarSign },
                { name: 'Accounting', path: '/admin/accounting', icon: FiDollarSign },
                { name: 'Analytics', path: '/admin/analytics', icon: FiActivity },
                { name: 'Settings', path: '/admin/settings', icon: FiSettings },
            ];
        } else if (isPropertyOwner()) {
            return [
                { name: 'Dashboard', path: '/property-owner', icon: FiGrid },
                { name: 'My Properties', path: '/property-owner/properties', icon: FiHome },
                { name: 'Add Property', path: '/property-owner/properties/new', icon: FiTruck },
                { name: 'Bookings', path: '/property-owner/bookings', icon: FiCalendar },
                { name: 'Earnings', path: '/property-owner/earnings', icon: FiDollarSign },
                { name: 'Analytics', path: '/property-owner/analytics', icon: FiActivity },
                { name: 'Profile', path: '/property-owner/profile', icon: FiUser },
            ];
        } else { // Guest
            return [
                { name: 'Dashboard', path: '/guest', icon: FiGrid },
                { name: 'Find Property', path: '/properties', icon: FiSearch },
                { name: 'My Bookings', path: '/guest/bookings', icon: FiCalendar },
                { name: 'Favorites', path: '/guest/favorites', icon: FiActivity },
                { name: 'Rewards', path: '/guest/rewards-points', icon: FiDollarSign },
                { name: 'Profile', path: '/guest/profile', icon: FiUser },
                // Added link to go back to Home for guest
                { name: 'Exit Dashboard', path: '/', icon: FiLogOut }
            ];
        }
    };

    const menuItems = getMenu();
    const allMenus = [...menuItems];

    return (
        <div className="h-screen bg-gray-100 flex relative overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-[#0F2936] text-white transition-all duration-300 flex flex-col fixed h-full z-40
                    md:static md:h-full md:z-0
                    ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
                    md:${sidebarOpen ? 'w-64' : 'w-20'}
                    md:translate-x-0
                `}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-center border-b border-gray-700 bg-[#0F2936] relative shrink-0">
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 md:hidden text-gray-400 hover:text-white"
                    >
                        <FiX className="w-6 h-6" />
                    </button>

                    {sidebarOpen ? (
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-wider hover:opacity-80">
                            <img src={settings?.site_logo || "/logo.png"} alt="Logo" className="h-8 md:h-10 object-contain brightness-0 invert"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentNode.innerHTML = '<span class="text-2xl text-white">360 HOTEL</span>';
                                }}
                            />
                        </Link>
                    ) : (
                        <span className="text-xl font-bold hidden md:block">360</span>
                    )}
                </div>

                {/* Search */}
                <div className={`${sidebarOpen ? 'px-4 py-4' : 'hidden'} md:${sidebarOpen ? 'block' : 'hidden'}`}>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            className="w-full bg-[#1A3A4A] text-gray-200 pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-[#009D91] text-sm placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                    <ul className="space-y-1 px-2">
                        {allMenus.map((item, index) => {
                            const isActive = location.pathname === item.path || (item.submenu && item.submenu.some(sub => location.pathname === sub.path));

                            return (
                                <li key={index}>
                                    {item.submenu ? (
                                        <div>
                                            <button
                                                onClick={() => {
                                                    if (!sidebarOpen && window.innerWidth >= 768) setSidebarOpen(true);
                                                    toggleMenu(item.name);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${isActive || expandedMenus[item.name] ? 'bg-[#007D88] text-white' : 'text-gray-300 hover:bg-[#1A3A4A] hover:text-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                                    <span className={`font-medium text-sm whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                {(sidebarOpen || (window.innerWidth < 768 && sidebarOpen)) && (
                                                    expandedMenus[item.name] ? <FiChevronDown /> : <FiChevronRight />
                                                )}
                                            </button>

                                            {/* Submenu */}
                                            {sidebarOpen && expandedMenus[item.name] && (
                                                <ul className="mt-1 ml-4 space-y-1 pl-4 border-l border-gray-600">
                                                    {item.submenu.map((sub, subIndex) => (
                                                        <li key={subIndex}>
                                                            <Link
                                                                to={sub.path}
                                                                className={`block px-3 py-2 rounded-md text-sm transition-colors ${location.pathname === sub.path ? 'text-[#00E5D1]' : 'text-gray-400 hover:text-white'
                                                                    }`}
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive ? 'bg-[#007D88] text-white' : 'text-gray-300 hover:bg-[#1A3A4A] hover:text-white'
                                                }`}
                                            title={!sidebarOpen ? item.name : ''}
                                        >
                                            <item.icon className="w-5 h-5 flex-shrink-0" />
                                            {/* Text visibility logic */}
                                            <span className={`font-medium text-sm whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                                                {item.name}
                                            </span>
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Bottom User Profile */}
                <div className="p-4 border-t border-gray-700 bg-[#0D2430] shrink-0">
                    <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
                        <img
                            src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.first_name || 'U') + "&background=random"}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-gray-600 flex-shrink-0"
                        />
                        {sidebarOpen && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold truncate text-white">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                            </div>
                        )}
                        {sidebarOpen && (
                            <button onClick={handleLogout} className="text-gray-400 hover:text-white ml-auto">
                                <FiLogOut className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ml-0`}>
                {/* Top Header */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-md hover:bg-gray-100 text-gray-600 focus:outline-none"
                        >
                            <FiMenu className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        {/* Date - Visual */}
                        <div className="hidden md:flex items-center gap-2 text-gray-600 text-sm">
                            <FiCalendar className="w-4 h-4 text-blue-500" />
                            <span>{new Date().toLocaleDateString('en-GB')}</span>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-0 md:pl-6 md:border-l border-gray-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
                                <p className="text-xs text-gray-500 capitalize">{isAdmin() ? 'Super Admin' : isPropertyOwner() ? 'Owner' : 'Guest'}</p>
                            </div>
                            <img
                                src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.first_name || 'U') + "&background=random"}
                                alt="Profile"
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-200 shadow-sm"
                            />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-[#F3F7F9]">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
