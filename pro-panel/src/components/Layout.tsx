import { Link, useLocation, useNavigate, Outlet } from 'react-router';

interface LayoutProps {
  unreadNotifications?: number;
  setUnreadNotifications?: (count: number) => void;
}

export function Layout({ unreadNotifications = 3, setUnreadNotifications }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
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

  return (
    <div className="bg-background text-on-background min-h-screen">
      
      {/* TopAppBar Medium */}
      <header className="h-16 w-[calc(100%-240px)] fixed top-0 right-0 z-40 bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center px-gutter ml-[240px]">
        <div className="font-display text-headline-sm font-semibold text-on-surface">
          Doshanivarana
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 mr-6">
            <span className="text-primary font-bold border-b-2 border-primary pb-1 cursor-default">
              Sri Venkateswara Temple
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <button 
              className="p-2 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-full relative cursor-pointer"
              onClick={() => setUnreadNotifications && setUnreadNotifications(0)}
            >
              <span className="material-symbols-outlined flex items-center justify-center">notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
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

      {/* TopAppBar Small (Role Indicator Banner) */}
      <div className="w-[calc(100%-240px)] fixed top-16 right-0 h-10 z-30 bg-primary-container text-on-primary-container flex items-center px-gutter ml-[240px] shadow-sm cursor-default">
        <span className="material-symbols-outlined mr-2 text-on-primary-container text-[18px]">account_balance</span>
        <span className="font-sans text-label-md uppercase tracking-wider font-semibold">
          You are managing: Sri Venkateswara Temple
        </span>
      </div>

      {/* SideNavBar */}
      <nav className="w-[240px] h-screen fixed left-0 top-0 overflow-y-auto bg-surface border-r border-outline-variant shadow-sm z-50 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-outline-variant flex flex-col items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary border border-outline-variant">
              <span className="material-symbols-outlined text-[28px]">account_balance</span>
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
      </nav>

      {/* Page Content Viewport */}
      <div className="ml-[240px] pt-[104px]">
        {/* Main Content Render */}
        <div className="p-xl min-h-[calc(100vh-104px)] relative mandala-watermark">
          {/* Children components injected here */}
          <Outlet />
        </div>
      </div>

    </div>
  );
}
