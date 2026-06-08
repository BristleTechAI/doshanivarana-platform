import { Outlet, useLocation, Link } from 'react-router';
import { Home, Flame, Calendar, Building2, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function AppLayout() {
  const location = useLocation();
  const { t } = useLanguage();

  const tabs = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/poojas', icon: Flame, label: t('nav.poojas') },
    { path: '/bookings', icon: Calendar, label: t('nav.bookings') },
    { path: '/temples', icon: Building2, label: t('nav.temples') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Main content area with scrolling */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="max-w-lg mx-auto px-2 py-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.path);
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                    active
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${active ? 'scale-110' : ''} transition-transform`} />
                  <span className="text-xs font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    {tab.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}