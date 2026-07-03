import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { NotificationsService } from '../../services/firebase/notifications';
import { useAuth } from '../../contexts/AuthContext';

function formatRelativeTime(ts: any): string {
  if (!ts) return '';
  let d: Date;
  if (ts.toDate) d = ts.toDate();
  else if (ts.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);

  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function getNotifIcon(type: string) {
  switch (type) {
    case 'live':
    case 'stream.started': return '📺';
    case 'booking.created':
    case 'confirmation': return '✅';
    case 'pujari.assigned': return '🙏';
    case 'stream.scheduled': return '📅';
    case 'booking.completed': return '🎊';
    case 'recording.available': return '🎬';
    case 'delivery.packed':
    case 'prasad': return '📦';
    case 'delivery.shipped':
    case 'dispatch': return '🚚';
    case 'delivery.delivered': return '🏠';
    case 'festival': return '🪔';
    default: return '🔔';
  }
}

export function Notifications() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time subscription
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = NotificationsService.subscribeToNotifications(user.uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const filteredNotifications = notifications.filter(n =>
    activeTab === 'all' ? true : !n.isRead
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    // Optimistically update local state
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    // Persist to Firestore
    await NotificationsService.markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await NotificationsService.markAllAsRead(user.uid);
  };

  const handleDelete = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await NotificationsService.markAsDeleted(id);
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-muted/30 transition-colors">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </Link>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-card rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ fontFamily: "'Noto Sans', sans-serif" }}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ fontFamily: "'Noto Sans', sans-serif" }}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'unread' ? 'bg-white text-primary' : 'bg-primary text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {loading ? (
            // Skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-2 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h3>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                {activeTab === 'unread'
                  ? 'You have no unread notifications.'
                  : 'Notifications about your bookings will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                className={`bg-card border rounded-2xl p-4 transition-all cursor-pointer ${
                  !notif.isRead ? 'border-primary shadow-sm bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Unread dot */}
                  <div className={`w-2 h-2 rounded-full mt-2.5 flex-shrink-0 ${
                    !notif.isRead ? 'bg-primary' : 'bg-transparent'
                  }`} />

                  {/* Emoji Icon */}
                  <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 text-base">
                    {getNotifIcon(notif.type || notif.eventType || '')}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4
                        className={`text-sm ${!notif.isRead ? 'font-bold' : 'font-medium'}`}
                        style={{ fontFamily: "'Noto Sans', sans-serif" }}
                      >
                        {notif.title || notif.subject || 'Notification'}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notif.id);
                        }}
                        className="text-muted-foreground hover:text-destructive flex-shrink-0 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p
                      className="text-sm text-muted-foreground mb-2"
                      style={{ fontFamily: "'Noto Sans', sans-serif" }}
                    >
                      {notif.body || notif.message || ''}
                    </p>
                    <p
                      className="text-xs text-muted-foreground font-medium"
                      style={{ fontFamily: "'Noto Sans', sans-serif" }}
                    >
                      {formatRelativeTime(notif.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
