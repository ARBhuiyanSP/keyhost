import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
    FiGrid, FiCalendar, FiHome, FiUsers, FiDollarSign,
    FiSettings, FiLogOut, FiMenu, FiX, FiSearch,
    FiChevronDown, FiChevronRight, FiUser,
    FiTruck, FiActivity, FiSend, FiMessageSquare, FiPieChart, FiLifeBuoy, FiBook, FiHeart, FiCoffee, FiCheckCircle,
    FiShield, FiTool
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import useSettingsStore from '../../store/settingsStore';
import api from '../../utils/api';

const TakaIcon = ({ className = "w-4 h-4" }) => (
  <span className={`${className} font-bold font-sans flex items-center justify-center select-none leading-none`} style={{ fontSize: '1.2em' }}>
    ৳
  </span>
);

const DashboardLayout = () => {
    const { user, logout, isAdmin, isPropertyOwner } = useAuthStore();
    const { settings } = useSettingsStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize active dashboard mode ('host' or 'guest') for hosts
    const [dashboardMode, setDashboardMode] = useState(() => {
        if (isPropertyOwner() && !isAdmin()) {
            return localStorage.getItem('dashboard_role_mode') || 'host';
        }
        return 'guest'; // default for guests or other roles
    });

    // Synchronize dashboard mode with the URL path
    useEffect(() => {
        if (isPropertyOwner() && !isAdmin()) {
            if (location.pathname.startsWith('/guest')) {
                setDashboardMode('guest');
                localStorage.setItem('dashboard_role_mode', 'guest');
            } else if (location.pathname.startsWith('/property-owner') || location.pathname.startsWith('/staff')) {
                setDashboardMode('host');
                localStorage.setItem('dashboard_role_mode', 'host');
            }
        }
    }, [location.pathname, isPropertyOwner, isAdmin]);

    const toggleDashboardMode = () => {
        const newMode = dashboardMode === 'host' ? 'guest' : 'host';
        setDashboardMode(newMode);
        localStorage.setItem('dashboard_role_mode', newMode);
        if (newMode === 'guest') {
            navigate('/guest');
        } else {
            navigate('/property-owner');
        }
    };

    // Fetch menu notification counts reactively via React Query
    const { data: notificationCounts } = useQuery(
        'menu-notifications',
        async () => {
            const response = await api.get('/users/menu-notifications');
            return response.data?.data || {};
        },
        {
            enabled: !!user,
            refetchInterval: 30000, // Poll every 30 seconds
            refetchOnWindowFocus: true,
            staleTime: 10000
        }
    );

    const getNotificationCount = (menuName) => {
        if (!notificationCounts) return 0;
        const name = menuName.toLowerCase();
        
        if (name === 'my bookings') {
            return notificationCounts.guestPendingBookings || 0;
        }
        if (name === 'bookings' || name === 'all bookings' || name === 'hms reservations' || name === 'pms reservations') {
            return notificationCounts.pendingBookings || 0;
        }
        if (name === 'messages') {
            return notificationCounts.unreadMessages || 0;
        }
        if (name === 'support') {
            return notificationCounts.supportTickets || 0;
        }
        if (name === 'users') {
            return notificationCounts.pendingVerifications || 0;
        }
        if (name === 'contact messages') {
            return notificationCounts.unreadContacts || 0;
        }
        if (name === 'refunds') {
            return notificationCounts.pendingRefunds || 0;
        }
        if (name === 'security deposits') {
            return notificationCounts.pendingSecurityDeposits || 0;
        }
        if (name === 'properties' && isAdmin()) {
            return notificationCounts.pendingBookings || 0;
        }
        return 0;
    };

    const [selectedPropertyType, setSelectedPropertyType] = useState(
        localStorage.getItem('hms_selected_property_type') || 'hotel'
    );

    // Initialize sidebar based on screen width
    // Mobile (< 768px): default closed (false)
    // Desktop (>= 768px): default open (true)
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [expandedMenus, setExpandedMenus] = useState({});

    // Track selected property type updates reactively
    useEffect(() => {
        const handlePropertyChange = () => {
            setSelectedPropertyType(localStorage.getItem('hms_selected_property_type') || 'hotel');
        };
        window.addEventListener('hmsPropertyChange', handlePropertyChange);
        window.addEventListener('storage', handlePropertyChange);
        return () => {
            window.removeEventListener('hmsPropertyChange', handlePropertyChange);
            window.removeEventListener('storage', handlePropertyChange);
        };
    }, []);

    // Fetch and initialize property selection if not set
    useEffect(() => {
        if (isPropertyOwner() && (user?.hms_status === 'active' || user?.hms_status === 'trialing')) {
            const initProperty = async () => {
                try {
                    const savedId = localStorage.getItem('hms_selected_property_id');
                    if (!savedId) {
                        const response = await api.get('/property-owner/properties');
                        const hmsProperties = response.data?.data?.properties?.filter(p => p.is_hms_enabled) || [];
                        if (hmsProperties.length > 0) {
                            localStorage.setItem('hms_selected_property_id', hmsProperties[0].id);
                            localStorage.setItem('hms_selected_property_type', hmsProperties[0].property_type || 'hotel');
                            setSelectedPropertyType(hmsProperties[0].property_type || 'hotel');
                        }
                    }
                } catch (err) {
                    console.error('Failed to initialize selected property in layout:', err);
                }
            };
            initProperty();
        }
    }, [user, isPropertyOwner]);

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
                    name: 'Properties',
                    icon: FiHome,
                    submenu: [
                        { name: 'All Bookings', path: '/admin/bookings' },
                        { name: 'All Properties', path: '/admin/properties' },
                        { name: 'Property Types', path: '/admin/property-types' },
                        { name: 'Amenities', path: '/admin/amenities' },
                        { name: 'Display Categories', path: '/admin/display-categories' },
                        { name: 'Coupons', path: '/admin/coupons' }
                    ]
                },
                {
                    name: 'Flights',
                    icon: FiSend,
                    submenu: [
                        { name: 'All Flights', path: '/admin/flights' },
                        { name: 'Flight Bookings', path: '/admin/flight-bookings' },
                    ]
                },
                {
                    name: 'Bus',
                    icon: FiTruck,
                    submenu: [
                        { name: 'Bus Routes & Schedules', path: '/admin/bus-schedules' },
                        { name: 'Bus Bookings', path: '/admin/bus-bookings' },
                        { name: 'Bus Reports & Sales', path: '/admin/bus-reports' },
                    ]
                },
                { name: 'Users', path: '/admin/users', icon: FiUsers },
                { name: 'Contact Messages', path: '/admin/contact-messages', icon: FiMessageSquare },
                { name: 'Reviews', path: '/admin/reviews', icon: FiActivity },
                { name: 'Rewards Points', path: '/admin/rewards-points', icon: FiActivity },
                { name: 'Earnings', path: '/admin/earnings', icon: TakaIcon },
                { name: 'Accounting', path: '/admin/accounting', icon: TakaIcon },
                { name: 'Refunds', path: '/admin/refunds', icon: TakaIcon },
                { name: 'Security Deposits', path: '/admin/security-deposits', icon: FiShield },
                { name: 'Analytics', path: '/admin/analytics', icon: FiActivity },
                {
                    name: 'Reports', icon: FiPieChart, submenu: [
                        { name: 'User Analytics', path: '/admin/reports/user-analytics' },
                        { name: 'Property Analytics', path: '/admin/reports/property-analytics' },
                        { name: 'Booking Reports', path: '/admin/reports/bookings' },
                        { name: 'Financial Reports', path: '/admin/reports/financials' },
                        { name: 'Payout Reports', path: '/admin/reports/payouts' },
                        { name: 'Cancellation Reports', path: '/admin/reports/cancellations' },
                        { name: 'User Reports', path: '/admin/reports/users' }
                    ]
                },
                { name: 'Support', path: '/support', icon: FiLifeBuoy },
                { name: 'Settings', path: '/admin/settings', icon: FiSettings },
                { name: 'HMS Settings', path: '/admin/hms-settings', icon: FiSettings },
            ];
        } else if (isPropertyOwner() || user?.user_type === 'staff') {
            if (isPropertyOwner() && dashboardMode === 'guest') {
                return [
                    { name: 'Dashboard', path: '/guest', icon: FiGrid },
                    { name: 'Find Property', path: '/properties', icon: FiSearch },
                    { name: 'My Bookings', path: '/guest/bookings', icon: FiCalendar },
                    { name: 'My Refunds', path: '/guest/refunds', icon: TakaIcon },
                    { name: 'Messages', path: '/messages', icon: FiMessageSquare },
                    { name: 'Favorites', path: '/guest/favorites', icon: FiHeart },
                    { name: 'Rewards', path: '/guest/rewards-points', icon: TakaIcon },
                    { name: 'Reports', path: '/guest/reports', icon: FiPieChart },
                    { name: 'Support', path: '/support', icon: FiLifeBuoy },
                    { name: 'Exit Dashboard', path: '/', icon: FiLogOut }
                ];
            }

            const isStaff = user?.user_type === 'staff';
            const hasPermission = (perm) => {
                if (!isStaff) return true; // Property owner has all permissions
                const perms = typeof user?.permissions === 'string' 
                    ? JSON.parse(user.permissions) 
                    : (user?.permissions || {});
                return perms['*'] || perms[perm];
            };

            const hasHMSAccess = user?.hms_status === 'active' || user?.hms_status === 'trialing' || isStaff;
            
            const getTerminology = (propertyType) => {
                const type = (propertyType || '').toLowerCase();
                if (type.includes('apartment') || type.includes('flat') || type.includes('building')) {
                    return {
                        hmsLabel: 'Property Management (PMS)',
                        inventory: 'Flat Inventory',
                        reservations: 'PMS Reservations',
                        housekeeping: 'Cleaning & Maintenance'
                    };
                } else if (type.includes('villa') || type.includes('house') || type.includes('resort')) {
                    return {
                        hmsLabel: 'Property Management (PMS)',
                        inventory: 'Unit Inventory',
                        reservations: 'PMS Reservations',
                        housekeeping: 'Housekeeping'
                    };
                }
                return {
                    hmsLabel: 'Hotel Management (HMS)',
                    inventory: 'Room Inventory',
                    reservations: 'HMS Reservations',
                    housekeeping: 'Housekeeping'
                };
            };
            
            const terms = getTerminology(selectedPropertyType);

            const menu = [];

            // Dashboard
            if (!isStaff || hasPermission('view_analytics')) {
                menu.push({ name: 'Dashboard', path: '/property-owner', icon: FiGrid });
            }

            // Staff specific check-in desk
            if (isStaff) {
                menu.push({ divider: true, label: 'Staff Portal' });
                menu.push({ name: 'Duty Desktop', path: '/staff/attendance', icon: FiGrid });
            }

            // Properties & bookings
            if (hasPermission('manage_properties')) {
                menu.push({ divider: true, label: 'Properties' });
                menu.push({ name: 'Properties', path: '/property-owner/properties', icon: FiHome });
                menu.push({ name: 'Calendar Sync', path: '/property-owner/calendar', icon: FiCalendar });
                menu.push({ name: 'Bookings', path: '/property-owner/bookings', icon: FiCalendar });
            }

            // HMS/PMS Sections
            if (hasHMSAccess) {
                const hmsItems = [];

                if (hasPermission('manage_inventory')) {
                    hmsItems.push({ name: terms.inventory, path: '/property-owner/hms/rooms', icon: FiGrid });
                }
                if (hasPermission('manage_reservations')) {
                    hmsItems.push({ name: terms.reservations, path: '/property-owner/hms/reservations', icon: FiCalendar });
                    hmsItems.push({ name: terms.hmsLabel.includes('PMS') ? 'PMS Calendar' : 'HMS Calendar', path: '/property-owner/hms/calendar', icon: FiCalendar });
                }
                if (hasPermission('manage_housekeeping')) {
                    hmsItems.push({ name: terms.housekeeping, path: '/property-owner/hms/housekeeping', icon: FiCheckCircle });
                    hmsItems.push({ name: 'Room Maintenance', path: '/property-owner/hms/maintenance', icon: FiTool });
                }
                if (hasPermission('manage_food_beverage')) {
                    hmsItems.push({ name: 'Food & Beverage', path: '/property-owner/hms/food-beverage', icon: FiCoffee });
                }
                if (hasPermission('manage_hr')) {
                    hmsItems.push({
                        name: 'Human Resource',
                        icon: FiUsers,
                        submenu: [
                            { name: 'Employees', path: '/property-owner/hms/hr/employees' },
                            { name: 'Payroll', path: '/property-owner/hms/hr/payroll' },
                            { name: 'Duty Roster', path: '/property-owner/hms/hr/roster' },
                            { name: 'Attendance', path: '/property-owner/hms/hr/attendance' },
                            { name: 'Designation', path: '/property-owner/hms/hr/designations' },
                            { name: 'Department', path: '/property-owner/hms/hr/departments' },
                            { name: 'Shift', path: '/property-owner/hms/hr/shifts' },
                            { name: 'Allowance', path: '/property-owner/hms/hr/allowances' },
                            { name: 'Deduction', path: '/property-owner/hms/hr/deductions' },
                        ]
                    });
                }
                if (hasPermission('manage_accounts')) {
                    hmsItems.push({
                        name: 'Accounts',
                        icon: FiBook,
                        submenu: [
                            { name: 'Overview', path: '/property-owner/hms/accounts' },
                            { name: 'Voucher Entry', path: '/property-owner/hms/accounts/vouchers' },
                        ]
                    });
                }                if (hasPermission('manage_reservations') || hasPermission('manage_accounts')) {
                    const reportSubmenu = [];
                    if (hasPermission('manage_reservations')) {
                        reportSubmenu.push({ name: 'Room Revenue Report', path: '/property-owner/hms/reports/room-revenue' });
                    }
                    if (hasPermission('manage_accounts')) {
                        reportSubmenu.push({ name: 'Financial Statements', path: '/property-owner/hms/reports/financials' });
                    }
                    reportSubmenu.push({ name: 'User Analytics', path: '/property-owner/hms/reports/user-analytics' });
                    reportSubmenu.push({ name: 'Property Analytics', path: '/property-owner/hms/reports/property-analytics' });

                    if (reportSubmenu.length > 0) {
                        hmsItems.push({
                            name: 'Reports',
                            icon: FiPieChart,
                            submenu: reportSubmenu
                        });
                    }
                }
                if (hasPermission('manage_billing')) {
                    hmsItems.push({ name: 'HMS Billing', path: '/property-owner/hms/billing', icon: TakaIcon });
                    hmsItems.push({ name: 'HMS Subscription', path: '/property-owner/hms/pricing', icon: FiActivity });
                }
 
                if (hmsItems.length > 0) {
                    menu.push({ divider: true, label: terms.hmsLabel });
                    menu.push(...hmsItems);
                }
            } else if (!isStaff) {
                menu.push({ divider: true, label: 'HMS Features' });
                menu.push({ name: 'Unlock HMS', path: '/property-owner/hms/pricing', icon: FiActivity });
            }
 
            // Business & Analytics
            if (hasPermission('view_analytics')) {
                menu.push({ divider: true, label: 'Business & Analytics' });
                menu.push({ name: 'Earnings', path: '/property-owner/earnings', icon: TakaIcon });
                menu.push({ name: 'Analytics', path: '/property-owner/analytics', icon: FiActivity });
                menu.push({
                    name: 'Reports', icon: FiPieChart, submenu: [
                        { name: 'User Analytics', path: '/property-owner/reports/user-analytics' },
                        { name: 'Property Analytics', path: '/property-owner/reports/property-analytics' },
                        { name: 'Booking Reports', path: '/property-owner/reports/bookings' },
                        { name: 'Financial Reports', path: '/property-owner/reports/financials' },
                        { name: 'Cancellation Reports', path: '/property-owner/reports/cancellations' }
                    ]
                });
            }

            // Account and Support
            menu.push({ divider: true, label: 'Account' });
            menu.push({ name: 'Messages', path: '/messages', icon: FiMessageSquare });
            menu.push({ name: 'Support', path: '/support', icon: FiLifeBuoy });

            menu.push({ divider: true, label: 'System' });
            menu.push({ name: 'Exit Dashboard', path: '/', icon: FiLogOut });

            return menu;
        } else { // Guest
            return [
                { name: 'Dashboard', path: '/guest', icon: FiGrid },
                { name: 'Find Property', path: '/properties', icon: FiSearch },
                { name: 'My Bookings', path: '/guest/bookings', icon: FiCalendar },
                { name: 'My Refunds', path: '/guest/refunds', icon: TakaIcon },
                { name: 'Messages', path: '/messages', icon: FiMessageSquare },
                { name: 'Favorites', path: '/guest/favorites', icon: FiHeart },
                { name: 'Rewards', path: '/guest/rewards-points', icon: TakaIcon },
                { name: 'Reports', path: '/guest/reports', icon: FiPieChart },
                { name: 'Support', path: '/support', icon: FiLifeBuoy },
                // Added link to go back to Home for guest
                { name: 'Exit Dashboard', path: '/', icon: FiLogOut }
            ];
        }
    };

    const menuItems = getMenu();
    const allMenus = [...menuItems];

    // Determine sidebar theme colors based on user role
    const getSidebarTheme = () => {
        if (isAdmin()) return { bg: 'bg-[#1e1b4b]', logoBg: 'bg-[#312e81]' }; // Deep Indigo for Admin
        if (isPropertyOwner()) {
            if (dashboardMode === 'guest') {
                return { bg: 'bg-[#0f2936]', logoBg: 'bg-[#1a3a4a]' }; // Guest mode sidebar theme for Host
            }
            return { bg: 'bg-[#064e3b]', logoBg: 'bg-[#065f46]' }; // Host mode sidebar theme for Host
        }
        return { bg: 'bg-[#0f2936]', logoBg: 'bg-[#1a3a4a]' }; // Default Teal/Navy for Guest
    };

    const sidebarTheme = getSidebarTheme();

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
                className={`${sidebarTheme.bg} text-white transition-all duration-300 flex flex-col fixed h-full z-40
                    md:static md:h-full md:z-0
                    ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
                    md:${sidebarOpen ? 'w-64' : 'w-20'}
                    md:translate-x-0
                `}
            >
                {/* Logo Area */}
                <div className={`h-16 flex items-center justify-center border-b border-black/10 ${sidebarTheme.logoBg} relative shrink-0`}>
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
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 md:text-white/50 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            className="w-full bg-white/10 text-white pl-10 pr-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-white/30 text-sm placeholder-white/50"
                        />
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                    <ul className="space-y-1 px-2">
                        {allMenus.map((item, index) => {
                            // ── Divider ──────────────────────────────────
                            if (item.divider) {
                                return (
                                    <li key={index}>
                                        <div className={`flex items-center gap-2 px-3 py-2 mt-2 ${sidebarOpen ? '' : 'justify-center'}`}>
                                            {sidebarOpen ? (
                                                <>
                                                    <div className="flex-1 h-px bg-white/20" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 whitespace-nowrap">{item.label}</span>
                                                    <div className="flex-1 h-px bg-white/20" />
                                                </>
                                            ) : (
                                                <div className="w-8 h-px bg-white/20" />
                                            )}
                                        </div>
                                    </li>
                                );
                            }

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
                                                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors relative ${isActive || expandedMenus[item.name] ? 'bg-white/20 text-white font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="relative">
                                                        <item.icon className="w-5 h-5 flex-shrink-0" />
                                                        {!sidebarOpen && getNotificationCount(item.name) > 0 && (
                                                            <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-1 ring-[#064e3b] animate-pulse" />
                                                        )}
                                                    </div>
                                                    <span className={`font-medium text-sm whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                {(sidebarOpen || (window.innerWidth < 768 && sidebarOpen)) && (
                                                    <div className="flex items-center gap-2">
                                                        {getNotificationCount(item.name) > 0 && (
                                                            <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                                {getNotificationCount(item.name)}
                                                            </span>
                                                        )}
                                                        {expandedMenus[item.name] ? <FiChevronDown /> : <FiChevronRight />}
                                                    </div>
                                                )}
                                            </button>

                                            {/* Submenu */}
                                            {sidebarOpen && expandedMenus[item.name] && (
                                                <ul className="mt-1 ml-4 space-y-1 pl-4 border-l border-white/20">
                                                    {item.submenu.map((sub, subIndex) => (
                                                        <li key={subIndex}>
                                                            <Link
                                                                to={sub.path}
                                                                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${location.pathname === sub.path ? 'text-white font-medium bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                                                                    }`}
                                                            >
                                                                <span>{sub.name}</span>
                                                                {getNotificationCount(sub.name) > 0 && (
                                                                    <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                                                        {getNotificationCount(sub.name)}
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative ${isActive ? 'bg-white/20 text-white font-semibold shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                }`}
                                            title={!sidebarOpen ? item.name : ''}
                                        >
                                            <div className="relative">
                                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                                {!sidebarOpen && getNotificationCount(item.name) > 0 && (
                                                    <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-1 ring-[#064e3b] animate-pulse" />
                                                )}
                                            </div>
                                            {/* Text visibility logic */}
                                            <span className={`font-medium text-sm whitespace-nowrap transition-opacity duration-200 ${sidebarOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                                                {item.name}
                                            </span>
                                            {sidebarOpen && getNotificationCount(item.name) > 0 && (
                                                <span className="ml-auto bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                    {getNotificationCount(item.name)}
                                                </span>
                                            )}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
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

                    <div className="flex items-center gap-3 md:gap-6 relative">
                        {/* Switch to Guest/Host Mode (For Property Owners) */}
                        {isPropertyOwner() && !isAdmin() && (
                            <button
                                onClick={toggleDashboardMode}
                                className={`flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-full transition-all duration-200 border shadow-sm focus:outline-none ${
                                    dashboardMode === 'host'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
                                        : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
                                }`}
                            >
                                {dashboardMode === 'host' ? (
                                    <>
                                        <FiUser className="w-3.5 h-3.5" />
                                        <span>Switch to Guest Mode</span>
                                    </>
                                ) : (
                                    <>
                                        <FiHome className="w-3.5 h-3.5" />
                                        <span>Switch to Host Mode</span>
                                    </>
                                )}
                            </button>
                        )}

                        {/* Switch to Travel Button (For regular Guests only) */}
                        {!isAdmin() && !isPropertyOwner() && (
                            <Link
                                to="/"
                                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors border border-gray-200"
                            >
                                <span className="font-bold">Switch to Travel</span>
                            </Link>
                        )}

                        {/* Date - Visual */}
                        <div className="hidden md:flex items-center gap-2 text-gray-600 text-sm">
                            <FiCalendar className="w-4 h-4 text-blue-500" />
                            <span>{new Date().toLocaleDateString('en-GB')}</span>
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setExpandedMenus(prev => ({ ...prev, topDropdown: !prev.topDropdown }))}
                                className="flex items-center gap-3 pl-0 md:pl-6 md:border-l border-gray-200 focus:outline-none hover:opacity-80 transition-opacity"
                            >
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
                                    <p className="text-xs text-gray-500 capitalize">
                                        {isAdmin() ? 'Super Admin' : isPropertyOwner() ? 'Owner' : user?.user_type === 'staff' ? 'Staff' : 'Guest'}
                                    </p>
                                </div>
                                <div className="relative">
                                    <img
                                        src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.first_name || 'U') + "&background=random"}
                                        alt="Profile"
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-200 shadow-sm"
                                    />
                                    {Object.values(notificationCounts || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] h-[16px] flex items-center justify-center border border-white">
                                            {Object.values(notificationCounts || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)}
                                        </span>
                                    )}
                                </div>
                                <FiChevronDown className="hidden md:block text-gray-400" />
                            </button>

                            {/* Dropdown Menu */}
                            {expandedMenus.topDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-50">
                                    {!isAdmin() && user?.user_type !== 'staff' && (
                                        isPropertyOwner() ? (
                                            <Link
                                                to="/"
                                                onClick={() => setExpandedMenus(prev => ({ ...prev, topDropdown: false }))}
                                                className="w-full text-left px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 font-semibold border-b border-gray-100"
                                            >
                                                <FiActivity className="w-4 h-4" />
                                                Switch to traveller
                                            </Link>
                                        ) : (
                                            <Link
                                                to="/property-owner"
                                                onClick={() => setExpandedMenus(prev => ({ ...prev, topDropdown: false }))}
                                                className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 font-semibold border-b border-gray-100"
                                            >
                                                <FiHome className="w-4 h-4" />
                                                Become a host
                                            </Link>
                                        )
                                    )}
                                    {!isAdmin() && (
                                        <Link
                                            to={isPropertyOwner() || user?.user_type === 'staff' ? '/property-owner/profile' : '/guest/profile'}
                                            onClick={() => setExpandedMenus(prev => ({ ...prev, topDropdown: false }))}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-b border-gray-100"
                                        >
                                            <FiUser className="w-4 h-4" />
                                            Profile
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <FiLogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
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
