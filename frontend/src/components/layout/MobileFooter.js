import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiHeart, FiUser, FiSettings, FiBookOpen, FiDollarSign, FiLogIn, FiUserPlus, FiMessageSquare, FiLifeBuoy } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';

const MobileFooter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isAdmin, isPropertyOwner } = useAuthStore();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get menu items based on user authentication and role
  const getMenuItems = () => {
    if (!isAuthenticated) {
      // Not logged in - show public menu
      return [
        {
          id: 'home',
          label: 'Home',
          icon: FiHome,
          path: '/',
          active: location.pathname === '/'
        },
        {
          id: 'properties',
          label: 'Properties',
          icon: FiBookOpen,
          path: '/properties',
          active: location.pathname.startsWith('/properties')
        },
        {
          id: 'become-host',
          label: 'Become a Host',
          icon: FiDollarSign,
          path: '/become-host',
          active: location.pathname.startsWith('/become-host')
        },
        {
          id: 'login',
          label: 'Login',
          icon: FiLogIn,
          path: '/login',
          active: location.pathname.startsWith('/login')
        }
      ];
    }

    if (isAdmin()) {
      // Admin menu
      return [
        {
          id: 'admin-dashboard',
          label: 'Dashboard',
          icon: FiSettings,
          path: '/admin',
          active: location.pathname.startsWith('/admin')
        },
        {
          id: 'admin-properties',
          label: 'Properties',
          icon: FiBookOpen,
          path: '/admin/properties',
          active: location.pathname.startsWith('/admin/properties')
        },
        {
          id: 'admin-bookings',
          label: 'Bookings',
          icon: FiBookOpen,
          path: '/admin/bookings',
          active: location.pathname.startsWith('/admin/bookings')
        },
        {
          id: 'admin-users',
          label: 'Users',
          icon: FiUser,
          path: '/admin/users',
          active: location.pathname.startsWith('/admin/users')
        },
        {
          id: 'admin-earnings',
          label: 'Earnings',
          icon: FiDollarSign,
          path: '/admin/earnings',
          active: location.pathname.startsWith('/admin/earnings')
        },
        {
          id: 'admin-settings',
          label: 'Settings',
          icon: FiSettings,
          path: '/admin/settings',
          active: location.pathname.startsWith('/admin/settings')
        }
      ];
    }

    if (isPropertyOwner()) {
      // Property Owner menu
      return [
        {
          id: 'owner-dashboard',
          label: 'Dashboard',
          icon: FiSettings,
          path: '/property-owner',
          active: location.pathname.startsWith('/property-owner')
        },
        {
          id: 'my-properties',
          label: 'My Properties',
          icon: FiBookOpen,
          path: '/property-owner/properties',
          active: location.pathname.startsWith('/property-owner/properties')
        },
        {
          id: 'owner-bookings',
          label: 'Bookings',
          icon: FiBookOpen,
          path: '/property-owner/bookings',
          active: location.pathname.startsWith('/property-owner/bookings')
        },
        {
          id: 'owner-messages',
          label: 'Messages',
          icon: FiMessageSquare,
          path: '/messages',
          active: location.pathname.startsWith('/messages')
        },
        {
          id: 'owner-support',
          label: 'Support',
          icon: FiLifeBuoy,
          path: '/support',
          active: location.pathname.startsWith('/support')
        }
      ];
    }

    // Guest menu
    return [
      {
        id: 'home',
        label: 'Home',
        icon: FiHome,
        path: '/',
        active: location.pathname === '/'
      },
      {
        id: 'properties',
        label: 'Properties',
        icon: FiBookOpen,
        path: '/properties',
        active: location.pathname === '/properties' || location.pathname.startsWith('/properties?')
      },
      {
        id: 'my-bookings',
        label: 'Booking',
        icon: FiBookOpen,
        path: '/guest/bookings',
        active: location.pathname.startsWith('/guest/bookings') || location.pathname.startsWith('/guest/booking/')
      },
      {
        id: 'favorites',
        label: 'Favorites',
        icon: FiHeart,
        path: '/guest/favorites',
        active: location.pathname.startsWith('/guest/favorites')
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: FiUser,
        path: '/guest',
        active: location.pathname === '/guest' || location.pathname.startsWith('/guest/profile')
      }
    ];
  };

  const menuItems = getMenuItems();

  const handleMenuClick = (item) => {
    // Ensure menu is visible when clicking (same as Properties/Favorites)
    setIsVisible(true);
    // Reset scroll position and navigate
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLastScrollY(0);
    navigate(item.path);
  };

  // Reset footer visibility and scroll position when route changes
  useEffect(() => {
    // Scroll to top when route changes (same as Properties/Favorites)
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsVisible(true);
    setLastScrollY(0);
  }, [location.pathname]);

  // Handle scroll to show/hide bottom menu (smooth behavior for all menus)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDifference = currentScrollY - lastScrollY;

          // Only process if scrolled more than 3px to avoid jitter
          if (Math.abs(scrollDifference) > 3) {
            // Scroll down - hide menu
            if (scrollDifference > 0 && currentScrollY > 20) {
              setIsVisible(false);
            }
            // Scroll up - show menu
            else if (scrollDifference < 0) {
              setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Hide footer on property details page
  if (location.pathname.startsWith('/property/')) {
    return null;
  }

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}>
      <div className="bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] w-full pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between px-2 h-16 w-full max-w-md mx-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.active;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)}
                className={`flex-1 flex flex-col items-center justify-center h-full gap-1 transition-colors duration-200 ${isActive ? 'text-[#E41D57]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${isActive ? 'bg-pink-50' : 'bg-transparent'}`}>
                  <IconComponent size={22} className={`${isActive ? 'text-[#E41D57] stroke-[2.5px]' : 'text-gray-500 stroke-[2px]'}`} />
                </div>
                <span className={`text-[10px] sm:text-[11px] leading-none whitespace-nowrap tracking-wide ${isActive ? 'font-bold text-[#E41D57]' : 'font-semibold text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileFooter;
