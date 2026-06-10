import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Building2, Users, CalendarCheck, IndianRupee, Radio, Package,
  MessageCircle, RefreshCcw, PartyPopper, TrendingUp, TrendingDown,
  ArrowUpRight, Star, Flame, CheckCircle2, AlertCircle, Clock,
  MapPin, Activity
} from "lucide-react";

const bookingTrend = [
  { month: "Jan", bookings: 3200, target: 3000 },
  { month: "Feb", bookings: 3800, target: 3200 },
  { month: "Mar", bookings: 4200, target: 3800 },
  { month: "Apr", bookings: 3900, target: 4000 },
  { month: "May", bookings: 5100, target: 4500 },
  { month: "Jun", bookings: 5800, target: 5000 },
  { month: "Jul", bookings: 6200, target: 5500 },
  { month: "Aug", bookings: 7100, target: 6000 },
  { month: "Sep", bookings: 8400, target: 7000 },
  { month: "Oct", bookings: 9200, target: 8000 },
  { month: "Nov", bookings: 10800, target: 9500 },
  { month: "Dec", bookings: 12300, target: 11000 },
];

const revenueTrend = [
  { month: "Jan", revenue: 480000, prev: 320000 },
  { month: "Feb", revenue: 560000, prev: 380000 },
  { month: "Mar", revenue: 640000, prev: 450000 },
  { month: "Apr", revenue: 590000, prev: 410000 },
  { month: "May", revenue: 780000, prev: 520000 },
  { month: "Jun", revenue: 920000, prev: 640000 },
  { month: "Jul", revenue: 1050000, prev: 720000 },
  { month: "Aug", revenue: 1180000, prev: 830000 },
  { month: "Sep", revenue: 1340000, prev: 950000 },
  { month: "Oct", revenue: 1520000, prev: 1100000 },
  { month: "Nov", revenue: 1820000, prev: 1350000 },
  { month: "Dec", revenue: 2100000, prev: 1600000 },
];

const templePerformance = [
  { name: "Tirupati", revenue: 2840000, bookings: 4820 },
  { name: "Sabarimala", revenue: 2210000, bookings: 3960 },
  { name: "Shirdi", revenue: 1950000, bookings: 3540 },
  { name: "Vaishno Devi", revenue: 1720000, bookings: 2980 },
  { name: "Kedarnath", revenue: 1580000, bookings: 2640 },
  { name: "Somnath", revenue: 1310000, bookings: 2180 },
];

const poojaPopularity = [
  { name: "Abhishek", value: 2840, color: "#C76A00" },
  { name: "Sahasranama", value: 1980, color: "#D4A017" },
  { name: "Homam", value: 1640, color: "#4A1259" },
  { name: "Archana", value: 1420, color: "#22C55E" },
  { name: "Others", value: 980, color: "#E8894A" },
];

const languageDist = [
  { name: "Telugu", value: 34 },
  { name: "Tamil", value: 22 },
  { name: "Hindi", value: 18 },
  { name: "Kannada", value: 12 },
  { name: "Malayalam", value: 9 },
  { name: "Others", value: 5 },
];

const topTemples = [
  {
    name: "Tirumala Tirupati Devasthanam",
    location: "Tirupati, Andhra Pradesh",
    deity: "Lord Venkateswara",
    revenue: "₹28.4L",
    bookings: 4820,
    rating: 4.9,
    poojas: 18,
    streams: 42,
    status: "Active",
    color: "#C76A00",
  },
  {
    name: "Sabarimala Temple",
    location: "Pathanamthitta, Kerala",
    deity: "Lord Ayyappa",
    revenue: "₹22.1L",
    bookings: 3960,
    rating: 4.8,
    poojas: 14,
    streams: 38,
    status: "Active",
    color: "#4A1259",
  },
  {
    name: "Shirdi Sai Baba Temple",
    location: "Shirdi, Maharashtra",
    deity: "Sai Baba",
    revenue: "₹19.5L",
    bookings: 3540,
    rating: 4.7,
    poojas: 12,
    streams: 29,
    status: "Active",
    color: "#D4A017",
  },
  {
    name: "Vaishno Devi Shrine",
    location: "Katra, Jammu & Kashmir",
    deity: "Goddess Vaishno Devi",
    revenue: "₹17.2L",
    bookings: 2980,
    rating: 4.8,
    poojas: 10,
    streams: 22,
    status: "Active",
    color: "#22C55E",
  },
  {
    name: "Kedarnath Temple",
    location: "Rudraprayag, Uttarakhand",
    deity: "Lord Shiva",
    revenue: "₹15.8L",
    bookings: 2640,
    rating: 4.9,
    poojas: 8,
    streams: 18,
    status: "Seasonal",
    color: "#6366F1",
  },
];

const activityFeed = [
  { id: 1, type: "booking", icon: CalendarCheck, color: "#22C55E", bg: "#F0FDF4", message: "New booking received for Sudarshana Homam", temple: "Tirupati Temple", time: "Just now" },
  { id: 2, type: "stream", icon: Radio, color: "#C76A00", bg: "#FFF0E6", message: "Live stream started: Sahasranama Archana", temple: "Sabarimala Temple", time: "3 min ago" },
  { id: 3, type: "delivery", icon: Package, color: "#D4A017", bg: "#FFFBEB", message: "Prasad dispatched to 24 devotees", temple: "Shirdi Temple", time: "8 min ago" },
  { id: 4, type: "refund", icon: RefreshCcw, color: "#EF4444", bg: "#FFF1F2", message: "Refund requested by devotee Ramesh K.", temple: "Vaishno Devi Shrine", time: "12 min ago" },
  { id: 5, type: "temple", icon: Building2, color: "#4A1259", bg: "#F3E8FF", message: "Temple activated: Somnath Jyotirlinga", temple: "Platform Admin", time: "18 min ago" },
  { id: 6, type: "recording", icon: Activity, color: "#6366F1", bg: "#EEF2FF", message: "Recording published: Kedarnath Aarti", temple: "Kedarnath Temple", time: "25 min ago" },
  { id: 7, type: "booking", icon: CalendarCheck, color: "#22C55E", bg: "#F0FDF4", message: "Pooja scheduled: Rudrabhishek (45 devotees)", temple: "Kashi Vishwanath", time: "31 min ago" },
  { id: 8, type: "query", icon: MessageCircle, color: "#F59E0B", bg: "#FFFBEB", message: "New query: Booking reschedule request", temple: "Support Desk", time: "40 min ago" },
];

const kpis = [
  { label: "Total Temples", value: "284", change: "+12", up: true, icon: Building2, color: "#C76A00", bg: "#FFF0E6" },
  { label: "Total Devotees", value: "2.84M", change: "+18%", up: true, icon: Users, color: "#4A1259", bg: "#F3E8FF" },
  { label: "Today's Bookings", value: "1,284", change: "+34%", up: true, icon: CalendarCheck, color: "#D4A017", bg: "#FFFBEB" },
  { label: "Revenue Today", value: "₹4.2L", change: "+22%", up: true, icon: IndianRupee, color: "#22C55E", bg: "#F0FDF4" },
  { label: "Revenue This Month", value: "₹84.6L", change: "+31%", up: true, icon: TrendingUp, color: "#C76A00", bg: "#FFF0E6" },
  { label: "Active Live Streams", value: "18", change: "+3", up: true, icon: Radio, color: "#EF4444", bg: "#FFF1F2" },
  { label: "Pending Deliveries", value: "312", change: "-8%", up: false, icon: Package, color: "#F59E0B", bg: "#FFFBEB" },
  { label: "Open Queries", value: "47", change: "+12", up: false, icon: MessageCircle, color: "#6366F1", bg: "#EEF2FF" },
  { label: "Pending Refunds", value: "23", change: "-3", up: true, icon: RefreshCcw, color: "#EF4444", bg: "#FFF1F2" },
  { label: "Active Festivals", value: "6", change: "+2", up: true, icon: PartyPopper, color: "#D4A017", bg: "#FFFBEB" },
];

const LANG_COLORS = ["#C76A00", "#D4A017", "#4A1259", "#22C55E", "#E8894A", "#6366F1"];

function formatRupee(v: number) {
  if (v >= 1000000) return `₹${(v / 1000000).toFixed(1)}M`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${(v / 1000).toFixed(0)}K`;
}

export function Dashboard() {
  return (
    <div className="space-y-6 max-w-[1440px]">
      {/* Welcome header */}
      <div
        className="rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden relative"
        style={{ background: "linear-gradient(135deg, #1E0A3C 0%, #4A1259 60%, #C76A00 100%)" }}
      >
        <div className="relative z-10">
          <div className="text-orange-300 text-sm mb-1" style={{ fontWeight: 500, letterSpacing: "0.05em" }}>
            🙏 Namaste, Super Admin
          </div>
          <h1 className="text-white text-xl md:text-2xl mb-1" style={{ fontWeight: 700 }}>
            Welcome to Devaseva Control Center
          </h1>
          <p className="hidden sm:block" style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}>
            Monday, 8 June 2026 · Platform is healthy · 284 Temples Online
          </p>
        </div>
        <div className="flex gap-3 relative z-10 flex-shrink-0">
          <div className="text-center px-4 py-2.5 md:px-6 md:py-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <div className="text-white text-lg md:text-xl" style={{ fontWeight: 700 }}>99.8%</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>Uptime</div>
          </div>
          <div className="text-center px-4 py-2.5 md:px-6 md:py-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <div className="text-white text-lg md:text-xl" style={{ fontWeight: 700 }}>18</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>Live Now</div>
          </div>
          <div className="hidden sm:block text-center px-4 py-2.5 md:px-6 md:py-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <div className="text-white text-lg md:text-xl" style={{ fontWeight: 700 }}>4.8★</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>Avg Rating</div>
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-10" style={{ background: "#C76A00", transform: "translate(30%, -30%)" }} />
        <div className="absolute right-32 bottom-0 w-40 h-40 rounded-full opacity-10" style={{ background: "#D4A017", transform: "translate(0, 40%)" }} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl p-4 border transition-shadow hover:shadow-md"
              style={{ borderColor: "rgba(199,106,0,0.1)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                  <Icon size={18} style={{ color: kpi.color }} />
                </div>
                <div
                  className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: kpi.up ? "#F0FDF4" : "#FFF1F2",
                    color: kpi.up ? "#16A34A" : "#DC2626",
                    fontWeight: 600,
                  }}
                >
                  {kpi.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {kpi.change}
                </div>
              </div>
              <div className="text-xl" style={{ color: "#1F1F1F", fontWeight: 700 }}>{kpi.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Booking Trends */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Booking Trends</h3>
              <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Monthly bookings vs target</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
              2026 YTD
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={bookingTrend}>
              <defs>
                <linearGradient id="dash-booking-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C76A00" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#C76A00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="dash-book-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis key="dash-book-x" dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="dash-book-y" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip key="dash-book-tooltip"
                contentStyle={{ borderRadius: "8px", border: "1px solid rgba(199,106,0,0.15)", fontSize: "12px" }}
              />
              <Area key="area-bookings" type="monotone" dataKey="bookings" name="Bookings" stroke="#C76A00" fill="url(#dash-booking-grad)" strokeWidth={2.5} dot={false} />
              <Area key="area-target" type="monotone" dataKey="target" name="Target" stroke="#D4A017" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Popular Poojas Pie */}
        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="mb-4">
            <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Most Popular Poojas</h3>
            <p style={{ color: "#9CA3AF", fontSize: "12px" }}>By booking volume</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie key="dash-pooja-pie" data={poojaPopularity} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={2}>
                {poojaPopularity.map((entry) => (
                  <Cell key={`pooja-cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip key="dash-pooja-tooltip" contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {poojaPopularity.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span style={{ color: "#6B7280" }}>{p.name}</span>
                </div>
                <span style={{ color: "#1F1F1F", fontWeight: 600 }}>{p.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Trends */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Revenue Trends</h3>
              <p style={{ color: "#9CA3AF", fontSize: "12px" }}>2026 vs 2025 revenue comparison</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
              +31% YoY
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="dash-rev-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A1259" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4A1259" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dash-prev-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A017" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="dash-rev-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis key="dash-rev-x" dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="dash-rev-y" tickFormatter={formatRupee} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip key="dash-rev-tooltip" formatter={(v: number) => formatRupee(v)} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Area key="area-rev-2026" type="monotone" dataKey="revenue" name="2026" stroke="#4A1259" fill="url(#dash-rev-grad)" strokeWidth={2.5} dot={false} />
              <Area key="area-rev-2025" type="monotone" dataKey="prev" name="2025" stroke="#D4A017" fill="url(#dash-prev-grad)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Language Distribution */}
        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="mb-4">
            <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Language Distribution</h3>
            <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Devotee language preferences</p>
          </div>
          <div className="space-y-3">
            {languageDist.map((l, i) => (
              <div key={l.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span style={{ color: "#6B7280" }}>{l.name}</span>
                  <span style={{ color: "#1F1F1F", fontWeight: 600 }}>{l.value}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: "#F3EDE8" }}>
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: `${l.value}%`, backgroundColor: LANG_COLORS[i % LANG_COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Temple Performance Bar Chart */}
      <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Temple Performance</h3>
            <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Top temples by revenue and bookings</p>
          </div>
          <button
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}
          >
            View All Temples →
          </button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={templePerformance} barCategoryGap="30%">
            <CartesianGrid key="dash-temple-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
            <XAxis key="dash-temple-x" dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis key="dash-temple-y" tickFormatter={formatRupee} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip key="dash-temple-tooltip" formatter={(v: number, n: string) => n === "Revenue" ? formatRupee(v) : v.toLocaleString()} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            <Legend key="dash-temple-legend" wrapperStyle={{ fontSize: "12px" }} />
            <Bar key="bar-temple-revenue" dataKey="revenue" name="Revenue" fill="#C76A00" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row: Top Temples Table + Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Temples */}
        <div className="lg:col-span-2 bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
            <div>
              <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Top Performing Temples</h3>
              <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Ranked by revenue this month</p>
            </div>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
            {topTemples.map((t, i) => (
              <div key={t.name} className="px-4 py-3.5 flex items-center gap-3">
                <span className="w-5 text-xs flex-shrink-0" style={{ color: "#9CA3AF", fontWeight: 600 }}>{i + 1}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.color + "18" }}>
                  <Building2 size={14} style={{ color: t.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate" style={{ color: "#1F1F1F", fontWeight: 600 }}>{t.name}</div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>{t.revenue} · {t.bookings.toLocaleString()} bookings</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star size={11} fill="#D4A017" style={{ color: "#D4A017" }} />
                  <span className="text-xs" style={{ fontWeight: 600 }}>{t.rating}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#FAF6F2" }}>
                  <th className="text-left px-5 py-3 text-xs" style={{ color: "#9CA3AF", fontWeight: 600 }}>#</th>
                  <th className="text-left px-5 py-3 text-xs" style={{ color: "#9CA3AF", fontWeight: 600 }}>Temple</th>
                  <th className="text-left px-5 py-3 text-xs" style={{ color: "#9CA3AF", fontWeight: 600 }}>Revenue</th>
                  <th className="text-left px-5 py-3 text-xs" style={{ color: "#9CA3AF", fontWeight: 600 }}>Bookings</th>
                  <th className="text-left px-5 py-3 text-xs" style={{ color: "#9CA3AF", fontWeight: 600 }}>Rating</th>
                  <th className="text-left px-5 py-3 text-xs" style={{ color: "#9CA3AF", fontWeight: 600 }}>Streams</th>
                  <th className="text-left px-5 py-3 text-xs" style={{ color: "#9CA3AF", fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {topTemples.map((t, i) => (
                  <tr key={t.name} className="border-t hover:bg-orange-50 transition-colors cursor-pointer" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#9CA3AF", fontWeight: 600 }}>{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: t.color + "18" }}>
                          <Building2 size={14} style={{ color: t.color }} />
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{t.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin size={9} style={{ color: "#9CA3AF" }} />
                            <span className="text-xs" style={{ color: "#9CA3AF" }}>{t.location}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{t.revenue}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F" }}>{t.bookings.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Star size={11} fill="#D4A017" style={{ color: "#D4A017" }} />
                        <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{t.rating}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F" }}>{t.streams}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: t.status === "Active" ? "#F0FDF4" : "#FFFBEB", color: t.status === "Active" ? "#16A34A" : "#D97706", fontWeight: 600 }}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Operations Feed */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
            <div>
              <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Live Operations</h3>
              <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Real-time activity feed</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#22C55E", fontWeight: 600 }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
            {activityFeed.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative px-4 py-3 border-b" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                  {i < activityFeed.length - 1 && (
                    <div className="absolute left-8 top-10 bottom-0 w-px" style={{ backgroundColor: "rgba(199,106,0,0.08)" }} />
                  )}
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10" style={{ backgroundColor: item.bg }}>
                      <Icon size={12} style={{ color: item.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs" style={{ color: "#1F1F1F" }}>{item.message}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: "#C76A00", fontWeight: 500 }}>{item.temple}</span>
                        <span className="text-xs" style={{ color: "#D1D5DB" }}>·</span>
                        <span className="text-xs" style={{ color: "#9CA3AF" }}>{item.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
