import { TrendingUp, Users, CalendarCheck, Star, IndianRupee, ArrowUpRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const bookingTrends = [
  { month: "Jan", bookings: 8400, users: 2100 },
  { month: "Feb", bookings: 10200, users: 2800 },
  { month: "Mar", bookings: 12800, users: 3600 },
  { month: "Apr", bookings: 11400, users: 3200 },
  { month: "May", bookings: 16200, users: 4800 },
  { month: "Jun", bookings: 19400, users: 5900 },
];

const templePerformance = [
  { temple: "Tirumala", bookings: 4820 },
  { temple: "Sabarimala", bookings: 3960 },
  { temple: "Shirdi", bookings: 3540 },
  { temple: "Vaishno Devi", bookings: 2980 },
  { temple: "Kedarnath", bookings: 2640 },
];

const poojaPopularity = [
  { name: "Abhishekam", value: 28, color: "#C76A00" },
  { name: "Archana", value: 22, color: "#D4A017" },
  { name: "Rudrabhishek", value: 18, color: "#4A1259" },
  { name: "Homam", value: 14, color: "#22C55E" },
  { name: "Aarti", value: 10, color: "#6366F1" },
  { name: "Other", value: 8, color: "#9CA3AF" },
];

const userActivity = [
  { hour: "6 AM", users: 1200 },
  { hour: "9 AM", users: 4800 },
  { hour: "12 PM", users: 8200 },
  { hour: "3 PM", users: 7100 },
  { hour: "6 PM", users: 12400 },
  { hour: "9 PM", users: 14200 },
];

const revenueByTemple = [
  { month: "Jan", tirupati: 4800000, sabarimala: 3200000, others: 2100000 },
  { month: "Feb", tirupati: 5600000, sabarimala: 3800000, others: 2500000 },
  { month: "Mar", tirupati: 6800000, sabarimala: 4200000, others: 3100000 },
  { month: "Apr", tirupati: 6200000, sabarimala: 3900000, others: 2900000 },
  { month: "May", tirupati: 8400000, sabarimala: 5100000, others: 3900000 },
  { month: "Jun", tirupati: 9800000, sabarimala: 6200000, others: 4800000 },
];

function fL(v: number) {
  return `₹${(v / 100000).toFixed(1)}L`;
}

export function Analytics() {
  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings (Jun)", value: "19,400", change: "+31%", icon: CalendarCheck, color: "#C76A00", bg: "#FFF0E6" },
          { label: "New Users (Jun)", value: "5,900", change: "+23%", icon: Users, color: "#4A1259", bg: "#F3E8FF" },
          { label: "Gross Revenue", value: "₹9.2L", change: "+18%", icon: IndianRupee, color: "#22C55E", bg: "#F0FDF4" },
          { label: "Avg Platform Rating", value: "4.78 ★", change: "+0.06", icon: Star, color: "#D4A017", bg: "#FFFBEB" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <Icon size={17} style={{ color: s.color }} />
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                  <ArrowUpRight size={10} /> {s.change}
                </span>
              </div>
              <div className="text-xl" style={{ color: "#1F1F1F", fontWeight: 700 }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Booking & User Trends */}
      <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Bookings & User Growth</h3>
        <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>Monthly trend over the past 6 months</p>
        <div className="flex items-center gap-6 mb-3">
          {[{ color: "#C76A00", label: "Bookings" }, { color: "#4A1259", label: "New Users" }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
              <span className="w-3 h-1 rounded-full" style={{ backgroundColor: l.color }} /> {l.label}
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={bookingTrends}>
            <defs>
              <linearGradient id="gradBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C76A00" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#C76A00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A1259" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#4A1259" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid key="an-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis key="an-x" dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis key="an-y" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
            <Tooltip key="an-tip" contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            <Area key="an-area-bookings" type="monotone" dataKey="bookings" name="Bookings"
              stroke="#C76A00" strokeWidth={2} fill="url(#gradBookings)" />
            <Area key="an-area-users" type="monotone" dataKey="users" name="New Users"
              stroke="#4A1259" strokeWidth={2} fill="url(#gradUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Temple Performance + Pooja Popularity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Top Temple Performance</h3>
          <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>Bookings by top 5 temples this month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={templePerformance} layout="vertical" barCategoryGap="25%">
              <CartesianGrid key="tp-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
              <XAxis key="tp-x" type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="tp-y" type="category" dataKey="temple" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip key="tp-tip" contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar key="tp-bar" dataKey="bookings" name="Bookings" fill="#C76A00" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Pooja Popularity</h3>
          <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>Booking share by pooja type</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie key="pp-pie" data={poojaPopularity} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" paddingAngle={2}>
                  {poojaPopularity.map(e => <Cell key={`pp-cell-${e.name}`} fill={e.color} />)}
                </Pie>
                <Tooltip key="pp-tip" formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {poojaPopularity.map(p => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span style={{ color: "#6B7280" }}>{p.name}</span>
                  </div>
                  <span style={{ color: "#1F1F1F", fontWeight: 600 }}>{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Temple + User Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Revenue by Temple Group</h3>
          <p className="mb-3" style={{ color: "#9CA3AF", fontSize: "12px" }}>Monthly revenue split across top temple groups</p>
          <div className="flex items-center gap-4 mb-3">
            {[{ color: "#C76A00", label: "Tirumala" }, { color: "#4A1259", label: "Sabarimala" }, { color: "#22C55E", label: "Others" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} /> {l.label}
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByTemple} barCategoryGap="20%">
              <CartesianGrid key="rt-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis key="rt-x" dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="rt-y" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={fL} />
              <Tooltip key="rt-tip" formatter={fL} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar key="rt-tirupati" dataKey="tirupati" name="Tirumala" stackId="a" fill="#C76A00" />
              <Bar key="rt-sabarimala" dataKey="sabarimala" name="Sabarimala" stackId="a" fill="#4A1259" />
              <Bar key="rt-others" dataKey="others" name="Others" stackId="a" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>User Activity — Today</h3>
          <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>Active users by hour of day</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={userActivity} barCategoryGap="35%">
              <CartesianGrid key="ua-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis key="ua-x" dataKey="hour" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="ua-y" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip key="ua-tip" formatter={(v: number) => `${v.toLocaleString()} users`} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar key="ua-bar" dataKey="users" name="Active Users" fill="#4A1259" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick metrics table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Month-over-Month Summary</h3>
          <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Key platform metrics compared to previous month</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#FAF6F2" }}>
                {["Metric", "May 2026", "Jun 2026", "Change"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { metric: "Total Bookings", may: "16,200", jun: "19,400", change: "+19.8%", up: true },
                { metric: "New Users", may: "4,800", jun: "5,900", change: "+22.9%", up: true },
                { metric: "Gross Revenue", may: "₹7.8L", jun: "₹9.2L", change: "+17.9%", up: true },
                { metric: "Active Priests", may: "1,124", jun: "1,142", change: "+1.6%", up: true },
                { metric: "Live Streams", may: "284", jun: "312", change: "+9.9%", up: true },
                { metric: "Avg Rating", may: "4.72", jun: "4.78", change: "+0.06", up: true },
              ].map(row => (
                <tr key={row.metric} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{row.metric}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#9CA3AF" }}>{row.may}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 700 }}>{row.jun}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: row.up ? "#F0FDF4" : "#FFF1F2", color: row.up ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                      {row.up ? "▲" : "▼"} {row.change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
