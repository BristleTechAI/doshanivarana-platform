import { useState } from 'react';
import { ArrowLeft, Bell, Check, Trash2, X } from 'lucide-react';
import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

export function Notifications() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'live',
      title: 'Live Pooja Starting Soon',
      message: 'Rudrabhishek at Sri Kalahasti starts in 2 hours',
      time: '2h ago',
      read: false
    },
    {
      id: 2,
      type: 'confirmation',
      title: 'Pooja Confirmed',
      message: 'Your Lakshmi Pooja has been scheduled for tomorrow',
      time: '1 day ago',
      read: false
    },
    {
      id: 3,
      type: 'festival',
      title: 'Upcoming Festival',
      message: 'Ekadashi is tomorrow - Book Vishnu poojas',
      time: '2 days ago',
      read: true
    },
    {
      id: 4,
      type: 'dispatch',
      title: 'Prasad Dispatched',
      message: 'Your Prasad for Satyanarayana Vratam is out for delivery.',
      time: '3 days ago',
      read: true
    }
  ]);

  const filteredNotifications = notifications.filter(n => 
    activeTab === 'all' ? true : !n.read
  );

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
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
          </div>
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
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
          >
            Unread
            {notifications.filter(n => !n.read).length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'unread' ? 'bg-white text-primary' : 'bg-primary text-white'
              }`}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                No notifications
              </h3>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                You're all caught up!
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`bg-card border rounded-2xl p-4 transition-all cursor-pointer ${
                  !notification.read ? 'border-primary shadow-sm bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    !notification.read ? 'bg-primary' : 'bg-transparent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-sm ${!notification.read ? 'font-bold' : 'font-medium'}`} style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                        {notification.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                        className="text-muted-foreground hover:text-destructive flex-shrink-0 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                      {notification.time}
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
