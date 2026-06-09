import { useState } from "react";
import { Download, FileText, TrendingUp, Users, Building2, UserCircle, PartyPopper, ChevronDown, Calendar } from "lucide-react";

const reports = [
  {
    id: "RPT001", name: "Booking Summary Report", icon: FileText, color: "#C76A00", bg: "#FFF0E6",
    desc: "Complete breakdown of all bookings — status, temple, pooja, devotee, payment, and delivery.",
    generated: "08 Jun 2026", size: "2.4 MB",
  },
  {
    id: "RPT002", name: "Revenue & Financials Report", icon: TrendingUp, color: "#22C55E", bg: "#F0FDF4",
    desc: "Gross revenue, platform commission, net payouts to temples, refunds, and outstanding balances.",
    generated: "08 Jun 2026", size: "1.8 MB",
  },
  {
    id: "RPT003", name: "Temple Performance Report", icon: Building2, color: "#D4A017", bg: "#FFFBEB",
    desc: "Individual temple metrics — bookings, revenue, ratings, priest utilization, and growth trends.",
    generated: "07 Jun 2026", size: "3.1 MB",
  },
  {
    id: "RPT004", name: "User Activity Report", icon: Users, color: "#4A1259", bg: "#F3E8FF",
    desc: "User registration trends, active sessions, language preferences, geographic distribution, and LTV.",
    generated: "07 Jun 2026", size: "5.2 MB",
  },
  {
    id: "RPT005", name: "Priest Performance Report", icon: UserCircle, color: "#6366F1", bg: "#EEF2FF",
    desc: "Priest bookings, ratings, availability, specialization match, and devotee satisfaction scores.",
    generated: "06 Jun 2026", size: "1.4 MB",
  },
  {
    id: "RPT006", name: "Festival Analytics Report", icon: PartyPopper, color: "#EF4444", bg: "#FFF1F2",
    desc: "Festival booking capacity, fill rates, revenue attribution, participating temples, and promo performance.",
    generated: "06 Jun 2026", size: "2.7 MB",
  },
];

const recentExports = [
  { name: "Booking Summary — May 2026.xlsx", by: "Super Admin", at: "08 Jun · 2:30 PM", size: "2.1 MB", color: "#C76A00" },
  { name: "Revenue Report — Q1 2026.pdf", by: "Super Admin", at: "07 Jun · 11:00 AM", size: "1.6 MB", color: "#22C55E" },
  { name: "User Activity — Apr 2026.csv", by: "Super Admin", at: "05 Jun · 4:15 PM", size: "4.8 MB", color: "#4A1259" },
  { name: "Temple Performance — May 2026.xlsx", by: "Super Admin", at: "03 Jun · 9:00 AM", size: "2.9 MB", color: "#D4A017" },
];

const dateRanges = ["This Month", "Last Month", "Q2 2026", "Q1 2026", "YTD 2026", "Custom Range"];

export function Reports() {
  const [dateRange, setDateRange] = useState("This Month");
  const [rangeOpen, setRangeOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Reports Available", value: "6", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Exports This Month", value: "24", color: "#4A1259", bg: "#F3E8FF" },
          { label: "Scheduled Reports", value: "3", color: "#22C55E", bg: "#F0FDF4" },
          { label: "Data Coverage", value: "Jan–Jun 2026", color: "#D4A017", bg: "#FFFBEB" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-lg" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls bar */}
      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div>
          <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>Generate Reports</div>
          <div className="text-xs" style={{ color: "#9CA3AF" }}>Export platform data in XLSX, PDF, or CSV format</div>
        </div>
        <div className="ml-auto relative">
          <button
            onClick={() => setRangeOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ border: "1px solid rgba(199,106,0,0.2)", color: "#6B7280", backgroundColor: "#FAF6F2" }}
          >
            <Calendar size={13} style={{ color: "#C76A00" }} />
            {dateRange}
            <ChevronDown size={12} />
          </button>
          {rangeOpen && (
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl z-20 py-1 w-44"
              style={{ border: "1px solid rgba(199,106,0,0.12)" }}>
              {dateRanges.map(r => (
                <button key={r} onClick={() => { setDateRange(r); setRangeOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-orange-50 transition-colors"
                  style={{ color: r === dateRange ? "#C76A00" : "#374151", fontWeight: r === dateRange ? 600 : 400 }}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.id} className="bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="flex items-start gap-4 mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: r.bg }}>
                  <Icon size={20} style={{ color: r.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700 }}>{r.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Last: {r.generated} · {r.size}</div>
                </div>
              </div>
              <p className="text-xs mb-4" style={{ color: "#6B7280", lineHeight: 1.6 }}>{r.desc}</p>
              <div className="text-xs mb-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: "#FAF6F2", color: "#9CA3AF" }}>
                <Calendar size={11} style={{ color: "#C76A00" }} />
                Range: <span style={{ color: "#C76A00", fontWeight: 600 }}>{dateRange}</span>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs"
                  style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
                  <Download size={12} /> Export XLSX
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs"
                  style={{ backgroundColor: "#FAF6F2", color: "#6B7280", fontWeight: 600 }}>
                  <Download size={12} /> Export PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scheduled Reports */}
      <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Scheduled Reports</h3>
            <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Reports that auto-generate and deliver on a schedule</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { name: "Daily Booking Summary", freq: "Every day at 11:59 PM", email: "admin@devaseva.com", status: "Active", color: "#22C55E" },
            { name: "Weekly Revenue Report", freq: "Every Monday at 7:00 AM", email: "admin@devaseva.com", status: "Active", color: "#22C55E" },
            { name: "Monthly Platform Analytics", freq: "1st of each month at 8:00 AM", email: "admin@devaseva.com", status: "Active", color: "#22C55E" },
          ].map(r => (
            <div key={r.name} className="flex items-center gap-4 p-3.5 rounded-xl" style={{ backgroundColor: "#FAF6F2" }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{r.freq} → {r.email}</div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Exports */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Recent Exports</h3>
          <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Downloads generated in the last 30 days</p>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {recentExports.map((e, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4 hover:bg-orange-50 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: e.color + "15" }}>
                <FileText size={14} style={{ color: e.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate" style={{ color: "#1F1F1F", fontWeight: 500 }}>{e.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{e.by} · {e.at} · {e.size}</div>
              </div>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs flex-shrink-0"
                style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}
              >
                <Download size={11} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
