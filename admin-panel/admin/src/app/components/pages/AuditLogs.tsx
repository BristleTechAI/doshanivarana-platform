import { useState } from "react";
import { ScrollText, Shield, Building2, CalendarCheck, RefreshCcw, Settings, Search, Download, Filter, ChevronDown, AlertCircle, CheckCircle, Info } from "lucide-react";

const logs = [
  { id: "LOG-284291", actor: "Super Admin", actorType: "Admin", action: "Temple Activated", target: "Somnath Jyotirlinga Temple", details: "Temple status changed from Pending Review to Active. Initial PRO assigned.", category: "Temple Actions", severity: "Info", timestamp: "08 Jun 2026 · 10:42:18 AM", ip: "103.21.58.42" },
  { id: "LOG-284290", actor: "Priya Joshi", actorType: "PRO Manager", action: "Priest Assigned", target: "Pandit Dilip Jha → Shirdi Sai Baba Temple", details: "Priest transfer approved and assigned. Previous assignment: Unassigned.", category: "Temple Actions", severity: "Info", timestamp: "08 Jun 2026 · 10:38:04 AM", ip: "182.64.21.8" },
  { id: "LOG-284289", actor: "Super Admin", actorType: "Admin", action: "Refund Approved", target: "BK-2024-8414 · Deepak Joshi", details: "Refund of ₹1,600 approved for Vishnu Sahasranamam booking cancellation.", category: "Refund Approvals", severity: "Success", timestamp: "08 Jun 2026 · 10:22:41 AM", ip: "103.21.58.42" },
  { id: "LOG-284288", actor: "System", actorType: "System", action: "Booking Auto-Cancelled", target: "BK-2024-8218", details: "Booking auto-cancelled due to payment timeout after 30 minutes.", category: "Booking Changes", severity: "Warning", timestamp: "08 Jun 2026 · 10:15:09 AM", ip: "Internal" },
  { id: "LOG-284287", actor: "Ravi Shankar K.", actorType: "PRO Manager", action: "Live Stream Scheduled", target: "Rudrabhishek - Kashi Vishwanath", details: "Live stream event created. Start time: 08 Jun 2026 · 6:00 PM IST.", category: "System Events", severity: "Info", timestamp: "08 Jun 2026 · 09:54:22 AM", ip: "106.51.18.94" },
  { id: "LOG-284286", actor: "Super Admin", actorType: "Admin", action: "Festival Created", target: "Navratri Mahotsav 2026", details: "New festival created. 84 temples assigned. Booking limit set to 25,000.", category: "System Events", severity: "Info", timestamp: "08 Jun 2026 · 09:41:38 AM", ip: "103.21.58.42" },
  { id: "LOG-284285", actor: "System", actorType: "System", action: "Suspicious Login Attempt", target: "User: rajesh.admin@gmail.com", details: "Failed login attempt from unknown IP. Account temporarily locked.", category: "Admin Actions", severity: "Critical", timestamp: "08 Jun 2026 · 09:30:14 AM", ip: "195.54.160.22" },
  { id: "LOG-284284", actor: "Super Admin", actorType: "Admin", action: "Notification Campaign Sent", target: "NC001 · Navratri Special Push", details: "Push notification sent to 284,000 Telugu-language users. Open rate: 34.6%.", category: "System Events", severity: "Success", timestamp: "08 Jun 2026 · 09:14:52 AM", ip: "103.21.58.42" },
  { id: "LOG-284283", actor: "Suresh Menon", actorType: "PRO Manager", action: "Temple Settings Updated", target: "Sabarimala Temple", details: "Updated booking configuration: max slots per day changed from 200 to 250.", category: "Temple Actions", severity: "Info", timestamp: "08 Jun 2026 · 08:58:31 AM", ip: "110.224.15.62" },
  { id: "LOG-284282", actor: "Super Admin", actorType: "Admin", action: "User Account Deactivated", target: "User ID: U-018294", details: "User account deactivated due to multiple booking violations.", category: "Admin Actions", severity: "Warning", timestamp: "08 Jun 2026 · 08:42:08 AM", ip: "103.21.58.42" },
];

const severityConfig: Record<string, { bg: string; color: string; icon: typeof CheckCircle }> = {
  Info: { bg: "#EFF6FF", color: "#2563EB", icon: Info },
  Success: { bg: "#F0FDF4", color: "#16A34A", icon: CheckCircle },
  Warning: { bg: "#FFFBEB", color: "#D97706", icon: AlertCircle },
  Critical: { bg: "#FFF1F2", color: "#DC2626", icon: AlertCircle },
};

const categoryConfig: Record<string, { bg: string; color: string; icon: typeof Shield }> = {
  "Admin Actions": { bg: "#FFF0E6", color: "#C76A00", icon: Shield },
  "Temple Actions": { bg: "#F3E8FF", color: "#4A1259", icon: Building2 },
  "Booking Changes": { bg: "#EFF6FF", color: "#2563EB", icon: CalendarCheck },
  "Refund Approvals": { bg: "#FFFBEB", color: "#D97706", icon: RefreshCcw },
  "System Events": { bg: "#F3F4F6", color: "#6B7280", icon: Settings },
};

export function AuditLogs() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");

  const filtered = logs.filter((l) => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || l.category === categoryFilter;
    const matchSev = severityFilter === "All" || l.severity === severityFilter;
    return matchSearch && matchCat && matchSev;
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Logs Today", value: "2,841", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Admin Actions", value: "142", color: "#4A1259", bg: "#F3E8FF" },
          { label: "Temple Actions", value: "384", color: "#D4A017", bg: "#FFFBEB" },
          { label: "System Events", value: "1,820", color: "#22C55E", bg: "#F0FDF4" },
          { label: "Critical Alerts", value: "3", color: "#EF4444", bg: "#FFF1F2" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search logs by action, actor, target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={{ border: "1px solid rgba(199,106,0,0.15)", color: "#6B7280", backgroundColor: "#FAF6F2" }}
        >
          {["All", "Admin Actions", "Temple Actions", "Booking Changes", "Refund Approvals", "System Events"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs outline-none"
          style={{ border: "1px solid rgba(199,106,0,0.15)", color: "#6B7280", backgroundColor: "#FAF6F2" }}
        >
          {["All", "Info", "Success", "Warning", "Critical"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs ml-auto"
          style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
          <Download size={12} /> Export Logs
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {filtered.map((log) => {
            const sc = severityConfig[log.severity] || severityConfig.Info;
            const cc = categoryConfig[log.category] || categoryConfig["System Events"];
            const SevIcon = sc.icon;
            return (
              <div key={log.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{log.action}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#9CA3AF", fontFamily: "monospace" }}>{log.id}</div>
                  </div>
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                    <SevIcon size={10} />{log.severity}
                  </span>
                </div>
                <div className="text-xs truncate" style={{ color: "#6B7280" }}>{log.target}</div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>{log.actor} · {log.actorType}</span>
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>{log.timestamp.split(" · ")[1]}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#FAF6F2" }}>
                {["Log ID", "Actor", "Action", "Target", "Category", "Severity", "Timestamp", "IP Address"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const sc = severityConfig[log.severity] || severityConfig.Info;
                const cc = categoryConfig[log.category] || categoryConfig["System Events"];
                const SevIcon = sc.icon;
                const CatIcon = cc.icon;
                return (
                  <tr key={log.id} className="border-t hover:bg-orange-50 transition-colors cursor-pointer" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono" style={{ color: "#9CA3AF" }}>{log.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{log.actor}</div>
                      <div className="text-xs mt-0.5">
                        <span className="px-1.5 py-0.5 rounded text-xs"
                          style={{ backgroundColor: log.actorType === "Admin" ? "#FFF0E6" : log.actorType === "System" ? "#F3F4F6" : "#F3E8FF", color: log.actorType === "Admin" ? "#C76A00" : log.actorType === "System" ? "#6B7280" : "#4A1259", fontWeight: 500 }}>
                          {log.actorType}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{log.action}</div>
                      <div className="text-xs mt-0.5 max-w-48 truncate" style={{ color: "#9CA3AF" }}>{log.details}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs max-w-40 truncate" style={{ color: "#6B7280" }}>{log.target}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <CatIcon size={11} style={{ color: cc.color }} />
                        <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: cc.bg, color: cc.color, fontWeight: 600 }}>
                          {log.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <SevIcon size={11} style={{ color: sc.color }} />
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                          {log.severity}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "#9CA3AF" }}>{log.timestamp}</td>
                    <td className="px-4 py-3.5 text-xs font-mono" style={{ color: "#9CA3AF" }}>{log.ip}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            Showing {filtered.length} of {logs.length} log entries
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#9CA3AF" }}>Retention: 90 days · Auto-archived after expiry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
