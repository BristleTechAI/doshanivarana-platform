// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useHeaderContext } from './PageHeader';

interface LayoutProps {
  unreadNotifications?: number;
  setUnreadNotifications?: (count: number) => void;
  title?: string;
  backTo?: string | number;
}

export function Layout({ unreadNotifications: legacyUnread, setUnreadNotifications, title: propTitle, backTo: propBackTo }: LayoutProps) {
  const { title: contextTitle, backTo: contextBackTo } = useHeaderContext();
  const title = propTitle || contextTitle;
  const backTo = propBackTo !== undefined ? propBackTo : contextBackTo;

  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // Demo static notifications
  const [notifications] = useState([
    { id: '1', title: 'New booking confirmed', message: 'Abhishek Pooja booked for tomorrow 6:00 AM.', isRead: false },
    { id: '2', title: 'Pujari assigned', message: 'Pt. Ramesh Kumar assigned to Sahasranama at 8:00 AM.', isRead: false },
    { id: '3', title: 'Delivery dispatched', message: '12 prasad packages dispatched to devotees.', isRead: true },
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile nav on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileNavOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Home', path: '/', icon: 'home' },
    { name: 'Pooja Schedule', path: '/schedule', icon: 'calendar_today' },
    { name: 'Bookings', path: '/bookings', icon: 'assignment' },
    { name: 'Pujari Management', path: '/pujaris', icon: 'person_celebrate' },
    { name: 'Live Stream', path: '/live-stream', icon: 'live_tv' },
    { name: 'Recordings', path: '/recordings', icon: 'video_library' },
    { name: 'Deliveries', path: '/deliveries', icon: 'package_2' },
    { name: 'Devotee Queries', path: '/queries', icon: 'chat' },
    { name: 'Feedback', path: '/feedback', icon: 'star' },
    { name: 'Profile & Settings', path: '/profile', icon: 'settings' },
  ];

  const SidebarContent = () => (
    <>
      <div>
        <div className="p-6 border-b border-outline-variant flex flex-col items-start gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center">
            <img src="/logo.jpg" alt="Doshanivarana Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-display text-headline-md font-bold text-primary">Doshanivarana</div>
            <div className="font-sans text-body-sm text-on-surface-variant">Temple Management</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                  isActive 
                    ? 'text-primary border-l-4 border-primary bg-gradient-to-r from-surface-container to-surface font-bold scale-[0.99]' 
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                }`}
              >
                <span 
                  className="material-symbols-outlined flex items-center justify-center"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Footer Watermark */}
      <div className="h-32 mandala-watermark opacity-40 mt-auto"></div>
    </>
  );

  return (
    <div className="bg-background text-on-background min-h-screen">
      
      {/* ── Desktop SideNavBar (hidden on mobile) ── */}
      <nav className="w-[240px] h-screen fixed left-0 top-0 overflow-y-auto bg-surface border-r border-outline-variant shadow-sm z-50 flex flex-col justify-between hidden lg:flex">
        <SidebarContent />
      </nav>

      {/* ── Mobile Sidebar Drawer ── */}
      {/* Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
      {/* Drawer Panel */}
      <nav
        className={`fixed top-0 left-0 h-full w-[280px] bg-surface border-r border-outline-variant shadow-xl z-50 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button inside drawer */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="p-1.5 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
            aria-label="Close navigation"
          >
            <span className="material-symbols-outlined flex items-center justify-center">close</span>
          </button>
        </div>
        <SidebarContent />
      </nav>

      {/* ── TopAppBar ── */}
      {/* Desktop: offset by sidebar width; Mobile: full width */}
      <header className="h-16 w-full lg:w-[calc(100%-240px)] fixed top-0 right-0 z-40 bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center px-4 lg:px-gutter lg:ml-[240px]">
        <div className="font-display text-headline-sm font-semibold text-on-surface flex items-center gap-2">
          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden p-2 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant mr-1 cursor-pointer flex items-center justify-center"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation"
          >
            <span className="material-symbols-outlined flex items-center justify-center">menu</span>
          </button>

          {backTo && (
            <button
              onClick={() => {
                if (backTo === -1) {
                  navigate(-1);
                } else {
                  navigate(backTo);
                }
              }}
              className="p-1 hover:bg-surface-container-highest rounded-full transition-colors cursor-pointer flex items-center justify-center text-on-surface-variant mr-1"
              title="Back"
            >
              <span className="material-symbols-outlined flex items-center justify-center">arrow_back</span>
            </button>
          )}
          <span className="truncate max-w-[140px] sm:max-w-none">{title || 'Doshanivarana'}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden md:flex gap-6 mr-4">
            <span className="text-primary font-bold border-b-2 border-primary pb-1 cursor-default text-sm">
              Sri Venkateswara Temple
            </span>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3 relative" ref={dropdownRef}>
            <button 
              className="p-2 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-full relative cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="material-symbols-outlined flex items-center justify-center">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-on-error flex items-center justify-center text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute top-12 right-0 w-80 max-w-[calc(100vw-1rem)] bg-surface border border-outline-variant rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low sticky top-0">
                  <h3 className="font-bold text-on-surface">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-on-surface-variant text-sm">No notifications</div>
                ) : (
                  <div className="divide-y divide-outline-variant/30">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-4 hover:bg-surface-container-lowest cursor-pointer transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                      >
                        <p className={`text-sm ${!n.isRead ? 'font-bold text-on-surface' : 'text-on-surface-variant'}`}>{n.title}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold overflow-hidden border border-outline-variant">
              <img 
                alt="Ravi" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQt4Zty_Yhgfp3V5PbaeQu19XiDkNsQjIkHmoV-eLOMipGZMy9N798LURF6hkO4wvoi842jdTzA5DGidB45engunywTEi5FStUUMn7P3PgTlI1jcMZacpQCM4JNoGX5B2fHk9TsT861sLv-3xO0ipE23BRHi1nXnGakpKnx8KcfhuKxhynE2XC_wLXdaXAEYngPO_BMcbs6XS_6inJNpIvkHcuZXgEVbCtpz49t38Iih2_GKkzwfArnlk-YILE6AjqPokbj_wdLe9s"
              />
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-full cursor-pointer"
              title="Logout"
            >
              <span className="material-symbols-outlined flex items-center justify-center">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Role Banner (Home only) ── */}
      {location.pathname === '/' && (
        <div className="w-full lg:w-[calc(100%-240px)] fixed top-16 right-0 h-10 z-30 bg-primary-container text-on-primary-container flex items-center px-4 lg:px-gutter lg:ml-[240px] shadow-sm cursor-default">
          <span className="material-symbols-outlined mr-2 text-on-primary-container text-[18px]">account_balance</span>
          <span className="font-sans text-label-md uppercase tracking-wider font-semibold truncate">
            You are managing: Sri Venkateswara Temple
          </span>
        </div>
      )}

      {/* ── Page Content Viewport ── */}
      {/* Desktop: offset by sidebar; Mobile: no offset */}
      <div className={`lg:ml-[240px] ${location.pathname === '/' ? 'pt-[104px]' : 'pt-[64px]'}`}>
        <div className={`p-4 sm:p-6 lg:p-xl ${location.pathname === '/' ? 'min-h-[calc(100vh-104px)]' : 'min-h-[calc(100vh-64px)]'} relative mandala-watermark`}>
          <Outlet />
        </div>
      </div>

    </div>
  );
}
