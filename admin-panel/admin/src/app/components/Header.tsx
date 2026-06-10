import { Bell, Search, ChevronDown, AlertCircle, CheckCircle, Clock, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/bookings": "Bookings Management",
  "/schedule": "Schedule Management",
  "/live-streams": "Live Streams",
  "/recordings": "Recordings",
  "/deliveries": "Deliveries",
  "/queries": "Queries",
  "/feedback": "Feedback Management",
  "/temples": "Temple Management",
  "/temple-requests": "Temple Requests",
  "/pro-managers": "PRO Managers",
  "/priests": "Priest Management",
  "/poojas": "Poojas",
  "/festivals": "Festival Management",
  "/categories": "Categories",
  "/languages": "Languages",
  "/payments": "Payments",
  "/refunds": "Refunds",
  "/revenue": "Revenue Analytics",
  "/users": "User Management",
  "/notifications": "Notifications",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const title = pageTitles[location.pathname] ?? "Devaseva Admin";

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("recipientType", "==", "ADMIN"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
    }
  };

  return (
    <header
      className="h-14 md:h-16 flex items-center px-4 md:px-6 gap-3 md:gap-4 border-b bg-white flex-shrink-0"
      style={{ borderColor: "rgba(199,106,0,0.1)" }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)" }}
      >
        <Menu size={18} style={{ color: "#6B7280" }} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm md:text-base truncate" style={{ color: "#1F1F1F", fontWeight: 600, lineHeight: 1.2 }}>
          {title}
        </h1>
      </div>

      {/* Search */}
      <div className="relative hidden md:flex">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
        <input
          type="text"
          placeholder="Search temples, bookings, priests..."
          className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all w-72"
          style={{
            backgroundColor: "#FAF6F2",
            border: "1px solid rgba(199,106,0,0.15)",
            color: "#1F1F1F",
          }}
        />
      </div>

      {/* Platform health badge */}
      <div
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
        style={{ backgroundColor: "#F0FDF4", border: "1px solid #86EFAC" }}
      >
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span style={{ color: "#15803D", fontWeight: 600 }}>All Systems Operational</span>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)" }}
        >
          <Bell size={16} style={{ color: "#6B7280" }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
              style={{ backgroundColor: "#C76A00", fontSize: "9px", fontWeight: 700 }}
            >
              {unreadCount}
            </span>
          )}
        </button>
        {showNotifs && (
          <div
            className="absolute right-0 top-11 w-80 rounded-xl shadow-xl z-50 overflow-hidden"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(199,106,0,0.12)" }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <span className="text-sm" style={{ fontWeight: 600, color: "#1F1F1F" }}>Notifications</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}
              >
                {unreadCount} new
              </span>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto" style={{ divideColor: "rgba(199,106,0,0.08)" }}>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs" style={{ color: "#9CA3AF" }}>No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    className={`px-4 py-3 flex gap-3 items-start hover:bg-orange-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-orange-50/50' : ''}`}
                  >
                    <Clock size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#C76A00" }} />
                    <div>
                      <p className="text-sm" style={{ color: "#1F1F1F", fontWeight: n.isRead ? 400 : 600 }}>{n.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#1F1F1F" }}>{n.message}</p>
                      <p className="text-[10px] mt-1" style={{ color: "#9CA3AF" }}>{new Date(n.createdAt?.toDate() || Date.now()).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin profile */}
      <button
        className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg transition-colors"
        style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
          style={{ backgroundColor: "#C76A00", fontWeight: 700 }}
        >
          SA
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>Super Admin</div>
          <div className="text-xs" style={{ color: "#9CA3AF" }}>Platform Owner</div>
        </div>
        <ChevronDown size={13} style={{ color: "#9CA3AF" }} />
      </button>
    </header>
  );
}
