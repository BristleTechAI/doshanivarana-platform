import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { IndianRupee, TrendingUp, TrendingDown, RefreshCcw, XCircle, Building2, Star, ArrowUpRight, Download, Filter } from "lucide-react";

const revenueByMonth = [
  { month: "Jan", revenue: 4800000, refunds: 120000 },
  { month: "Feb", revenue: 5600000, refunds: 180000 },
  { month: "Mar", revenue: 6400000, refunds: 210000 },
  { month: "Apr", revenue: 5900000, refunds: 160000 },
  { month: "May", revenue: 7800000, refunds: 240000 },
  { month: "Jun", revenue: 9200000, refunds: 280000 },
];

const revenueByTemple = [
  { name: "Tirumala Tirupati", value: 28400000, color: "#C76A00" },
  { name: "Sabarimala", value: 22100000, color: "#4A1259" },
  { name: "Shirdi Sai Baba", value: 19500000, color: "#D4A017" },
  { name: "Vaishno Devi", value: 17200000, color: "#22C55E" },
  { name: "Kedarnath", value: 15800000, color: "#6366F1" },
  { name: "Others", value: 37400000, color: "#9CA3AF" },
];

const revenueByService = [
  { service: "Poojas", amount: 6840000, pct: 48 },
  { service: "Festival Packages", amount: 3420000, pct: 24 },
  { service: "Homam Services", amount: 2280000, pct: 16 },
  { service: "Prasad Delivery", amount: 1140000, pct: 8 },
  { service: "Live Stream Premium", amount: 420000, pct: 4 },
];

const transactions = [
  { id: "TXN-284291", devotee: "Rajesh Kumar", temple: "Tirumala Tirupati", service: "Sudarshana Homam", amount: "₹2,400", method: "UPI", status: "Success", date: "08 Jun 2026 · 09:42 AM" },
  { id: "TXN-284290", devotee: "Priya Menon", temple: "Sabarimala Temple", service: "Abhishekam", amount: "₹1,800", method: "Card", status: "Success", date: "08 Jun 2026 · 09:38 AM" },
  { id: "TXN-284289", devotee: "Ankit Sharma", temple: "Kashi Vishwanath", service: "Rudrabhishek", amount: "₹3,200", method: "NetBanking", status: "Success", date: "08 Jun 2026 · 09:22 AM" },
  { id: "TXN-284288", devotee: "Sunita Reddy", temple: "Meenakshi Amman", service: "Sahasranama Archana", amount: "₹1,200", method: "UPI", status: "Failed", date: "08 Jun 2026 · 09:15 AM" },
  { id: "TXN-284287", devotee: "Mohan Das", temple: "Shirdi Sai Baba", service: "Kakad Aarti", amount: "₹800", method: "UPI", status: "Refunded", date: "08 Jun 2026 · 08:54 AM" },
  { id: "TXN-284286", devotee: "Kavitha Iyer", temple: "Somnath Temple", service: "Maha Abhishek", amount: "₹4,500", method: "Card", status: "Success", date: "08 Jun 2026 · 08:41 AM" },
  { id: "TXN-284285", devotee: "Ramesh Pillai", temple: "Padmanabhaswamy", service: "Navakabhishekam", amount: "₹5,200", method: "NetBanking", status: "Pending", date: "08 Jun 2026 · 08:30 AM" },
];

const statusConfig: Record<string, { bg: string; color: string }> = {
  Success: { bg: "#F0FDF4", color: "#16A34A" },
  Failed: { bg: "#FFF1F2", color: "#DC2626" },
  Refunded: { bg: "#FFFBEB", color: "#D97706" },
  Pending: { bg: "#EFF6FF", color: "#2563EB" },
};

function formatCr(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${(v / 1000).toFixed(0)}K`;
}

export function Payments() {
  return (
    <div className="space-y-5">
      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue Today", value: "₹42.1L", change: "+22%", up: true, icon: IndianRupee, color: "#22C55E", bg: "#F0FDF4" },
          { label: "Monthly Revenue", value: "₹8.46Cr", change: "+31%", up: true, icon: TrendingUp, color: "#C76A00", bg: "#FFF0E6" },
          { label: "Refunds", value: "₹2.8L", change: "-8%", up: false, icon: RefreshCcw, color: "#D97706", bg: "#FFFBEB" },
          { label: "Failed Transactions", value: "₹84K", change: "-14%", up: true, icon: XCircle, color: "#EF4444", bg: "#FFF1F2" },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: m.bg }}>
                  <Icon size={20} style={{ color: m.color }} />
                </div>
                <div
                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: m.up ? "#F0FDF4" : "#FFF1F2",
                    color: m.up ? "#16A34A" : "#DC2626",
                    fontWeight: 600,
                  }}
                >
                  {m.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {m.change}
                </div>
              </div>
              <div className="text-2xl" style={{ color: "#1F1F1F", fontWeight: 700 }}>{m.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Revenue vs Refunds</h3>
              <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Monthly breakdown — 2026</p>
            </div>
            <button className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
              <Download size={12} /> Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByMonth} barCategoryGap="35%">
              <CartesianGrid key="pay-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis key="pay-x" dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="pay-y" tickFormatter={formatCr} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip key="pay-tooltip" formatter={(v: number) => formatCr(v)} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar key="pay-bar-revenue" dataKey="revenue" name="Revenue" fill="#C76A00" radius={[4, 4, 0, 0]} />
              <Bar key="pay-bar-refunds" dataKey="refunds" name="Refunds" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Temple Pie */}
        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Revenue by Temple</h3>
          <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>Top contributors</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie key="pay-pie" data={revenueByTemple} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={2}>
                {revenueByTemple.map((e) => <Cell key={`pay-cell-${e.name}`} fill={e.color} />)}
              </Pie>
              <Tooltip key="pay-pie-tooltip" formatter={(v: number) => formatCr(v)} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {revenueByTemple.map((t) => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span style={{ color: "#6B7280" }}>{t.name}</span>
                </div>
                <span style={{ color: "#1F1F1F", fontWeight: 600 }}>{formatCr(t.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Service */}
      <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <h3 className="mb-4" style={{ color: "#1F1F1F", fontWeight: 600 }}>Revenue by Service Type</h3>
        <div className="space-y-3">
          {revenueByService.map((s, i) => (
            <div key={s.service} className="flex items-center gap-4">
              <div className="w-32 text-xs" style={{ color: "#6B7280" }}>{s.service}</div>
              <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "#F3EDE8" }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${s.pct}%`,
                    backgroundColor: ["#C76A00", "#D4A017", "#4A1259", "#22C55E", "#6366F1"][i],
                  }}
                />
              </div>
              <div className="w-20 text-xs text-right" style={{ color: "#1F1F1F", fontWeight: 600 }}>{formatCr(s.amount)}</div>
              <div className="w-10 text-xs text-right" style={{ color: "#9CA3AF" }}>{s.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <div>
            <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Recent Transactions</h3>
            <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Today's payment activity</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#FAF6F2", color: "#6B7280", border: "1px solid rgba(199,106,0,0.15)" }}>
              <Filter size={12} /> Filter
            </button>
            <button className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
              <Download size={12} /> Export
            </button>
          </div>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {transactions.map((t) => {
            const sc = statusConfig[t.status] || statusConfig.Success;
            return (
              <div key={t.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-mono" style={{ color: "#C76A00", fontWeight: 700 }}>{t.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{t.status}</span>
                </div>
                <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{t.devotee}</div>
                <div className="text-xs" style={{ color: "#6B7280" }}>{t.temple} · {t.service}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700 }}>{t.amount}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>{t.method}</span>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>{t.date.split("·")[1]?.trim()}</span>
                  </div>
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
                {["Transaction ID", "Devotee", "Temple", "Service", "Amount", "Method", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const sc = statusConfig[t.status] || statusConfig.Success;
                return (
                  <tr key={t.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono" style={{ color: "#C76A00", fontWeight: 600 }}>{t.id}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{t.devotee}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#6B7280" }}>{t.temple}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#6B7280" }}>{t.service}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 700 }}>{t.amount}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280", fontWeight: 500 }}>
                        {t.method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "#9CA3AF" }}>{t.date}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
