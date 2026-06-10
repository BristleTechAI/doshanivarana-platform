import { Link, useLocation } from "react-router";
import {
  LayoutDashboard, CalendarCheck, Radio, Video, Package, MessageCircle,
  Star, Building2, ClipboardList, Briefcase, UserCircle, Flame,
  PartyPopper, Tag, Globe, CreditCard, RefreshCcw, TrendingUp,
  Users, Bell, ScrollText, Settings, ChevronLeft, ChevronRight, X, LogOut,
  CalendarDays, BarChart2, FileText
} from "lucide-react";
import { useState } from "react";

const navSections = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Bookings", path: "/bookings", icon: CalendarCheck },
      { label: "Schedule", path: "/schedule", icon: CalendarDays },
      { label: "Live Streams", path: "/live-streams", icon: Radio },
      { label: "Recordings", path: "/recordings", icon: Video },
      { label: "Deliveries", path: "/deliveries", icon: Package },
      { label: "Queries", path: "/queries", icon: MessageCircle },
      { label: "Feedback", path: "/feedback", icon: Star },
    ],
  },
  {
    label: "TEMPLE NETWORK",
    items: [
      { label: "Temples", path: "/temples", icon: Building2 },
      { label: "Temple Requests", path: "/temple-requests", icon: ClipboardList },
      { label: "PRO Managers", path: "/pro-managers", icon: Briefcase },
      { label: "Priests", path: "/priests", icon: UserCircle },
    ],
  },
  {
    label: "SERVICE MANAGEMENT",
    items: [
      { label: "Poojas", path: "/poojas", icon: Flame },
      { label: "Festivals", path: "/festivals", icon: PartyPopper },
      { label: "Categories", path: "/categories", icon: Tag },
      { label: "Languages", path: "/languages", icon: Globe },
    ],
  },
  {
    label: "FINANCIALS",
    items: [
      { label: "Payments", path: "/payments", icon: CreditCard },
      { label: "Refunds", path: "/refunds", icon: RefreshCcw },
      { label: "Revenue", path: "/revenue", icon: TrendingUp },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { label: "Users", path: "/users", icon: Users },
      { label: "Notifications", path: "/notifications", icon: Bell },
      { label: "Analytics", path: "/analytics", icon: BarChart2 },
      { label: "Reports", path: "/reports", icon: FileText },
      { label: "Audit Logs", path: "/audit-logs", icon: ScrollText },
      { label: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

interface SidebarContentProps {
  collapsed: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

function SidebarContent({ collapsed, onClose, isMobile = false }: SidebarContentProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const showLabels = !collapsed || isMobile;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center flex-shrink-0 border-b"
        style={{
          borderColor: "rgba(255,255,255,0.07)",
          padding: showLabels ? "20px 16px" : "20px 0",
          justifyContent: showLabels ? "flex-start" : "center",
          gap: showLabels ? "12px" : "0",
          minHeight: "70px",
        }}
      >
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#C76A00", boxShadow: "0 4px 12px rgba(199,106,0,0.35)" }}
        >
          <span className="text-white select-none" style={{ fontSize: "17px" }}>🕉</span>
        </div>
        {showLabels && (
          <div className="flex-1 min-w-0">
            <div className="text-white" style={{ fontWeight: 800, fontSize: "13px", letterSpacing: "0.08em" }}>DEVASEVA</div>
            <div style={{ color: "rgba(196,181,212,0.6)", fontSize: "9.5px", letterSpacing: "0.18em", fontWeight: 500 }}>ADMIN CONTROL</div>
          </div>
        )}
        {isMobile && (
          <button
            onClick={onClose}
            className="ml-auto flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "rgba(196,181,212,0.7)", backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto" style={{ padding: showLabels ? "12px 8px" : "12px 0" }}>
        {navSections.map((section, sectionIndex) => (
          <div key={section.label}>
            {/* Section divider / label */}
            {showLabels ? (
              <div
                className="px-3 mb-1"
                style={{
                  color: "rgba(196,181,212,0.4)",
                  fontWeight: 700,
                  fontSize: "9.5px",
                  letterSpacing: "0.14em",
                  marginTop: sectionIndex > 0 ? "20px" : "4px",
                }}
              >
                {section.label}
              </div>
            ) : (
              sectionIndex > 0 && (
                <div
                  style={{
                    height: "1px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    margin: "10px 14px",
                  }}
                />
              )
            )}

            {/* Nav items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", alignItems: showLabels ? "stretch" : "center" }}>
              {section.items.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;

                if (!showLabels) {
                  // Collapsed icon pill
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      title={item.label}
                      onClick={isMobile ? onClose : undefined}
                      className="flex items-center justify-center transition-all duration-150 relative group"
                      style={{
                        width: "44px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: active ? "rgba(199,106,0,0.22)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.07)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      }}
                    >
                      {active && (
                        <span
                          className="absolute rounded-r-full"
                          style={{
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "3px",
                            height: "20px",
                            backgroundColor: "#C76A00",
                          }}
                        />
                      )}
                      <Icon
                        size={17}
                        style={{
                          color: active ? "#FF9A3C" : "rgba(196,181,212,0.55)",
                          filter: active ? "drop-shadow(0 0 6px rgba(199,106,0,0.6))" : "none",
                          transition: "all 0.15s ease",
                        }}
                      />
                    </Link>
                  );
                }

                // Expanded nav row
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={isMobile ? onClose : undefined}
                    className="flex items-center gap-3 rounded-lg px-3 transition-all duration-150 relative"
                    style={{
                      backgroundColor: active ? "rgba(199,106,0,0.16)" : "transparent",
                      color: active ? "#FFFFFF" : "rgba(196,181,212,0.8)",
                      minHeight: "38px",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                        style={{ width: "3px", height: "20px", backgroundColor: "#C76A00" }}
                      />
                    )}
                    <Icon
                      size={15}
                      style={{
                        color: active ? "#FF9A3C" : "rgba(196,181,212,0.6)",
                        flexShrink: 0,
                        transition: "color 0.15s ease",
                      }}
                    />
                    <span
                      className="text-sm truncate"
                      style={{ fontWeight: active ? 600 : 400, fontSize: "13px" }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        className="flex-shrink-0 border-t"
        style={{
          borderColor: "rgba(255,255,255,0.07)",
          padding: showLabels ? "12px 12px" : "12px 0",
          justifyContent: showLabels ? "flex-start" : "center",
          display: "flex",
          alignItems: "center",
          gap: showLabels ? "10px" : "0",
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white"
          style={{
            backgroundColor: "#C76A00",
            fontWeight: 700,
            fontSize: "11px",
            boxShadow: "0 2px 8px rgba(199,106,0,0.4)",
          }}
        >
          SA
        </div>
        {showLabels && (
          <>
            <div className="flex-1 min-w-0">
              <div className="text-white truncate" style={{ fontWeight: 600, fontSize: "12px" }}>Super Admin</div>
              <div className="truncate" style={{ color: "rgba(196,181,212,0.55)", fontSize: "10.5px" }}>admin@devaseva.com</div>
            </div>
            <button
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "rgba(196,181,212,0.4)", backgroundColor: "rgba(255,255,255,0.04)" }}
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 1024
  );

  return (
    <>
      {/* Desktop / Tablet sidebar — wrapped in relative container for the edge toggle */}
      <div
        className="hidden md:block relative flex-shrink-0 h-screen transition-all duration-300"
        style={{ width: collapsed ? "68px" : "240px" }}
      >
        <aside
          className="relative h-full flex flex-col overflow-hidden"
          style={{ backgroundColor: "#1A0935", width: "100%" }}
        >
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: "linear-gradient(180deg, rgba(74,18,89,0.18) 0%, transparent 40%, rgba(10,4,25,0.25) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col h-full">
            <SidebarContent collapsed={collapsed} />
          </div>
        </aside>

        {/* Floating edge toggle button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute z-20 flex items-center justify-center transition-all duration-200"
          style={{
            top: "22px",
            right: "-13px",
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            backgroundColor: "#1A0935",
            border: "1.5px solid rgba(199,106,0,0.35)",
            color: "#C76A00",
            boxShadow: "0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(199,106,0,0.08)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(199,106,0,0.7)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(199,106,0,0.3), 0 0 0 1px rgba(199,106,0,0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(199,106,0,0.35)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(199,106,0,0.08)";
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <ChevronRight size={12} strokeWidth={2.5} />
            : <ChevronLeft size={12} strokeWidth={2.5} />
          }
        </button>
      </div>

      {/* Mobile overlay sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden md:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: "#1A0935", width: "272px" }}
      >
        <SidebarContent collapsed={false} onClose={onMobileClose} isMobile />
      </aside>
    </>
  );
}
