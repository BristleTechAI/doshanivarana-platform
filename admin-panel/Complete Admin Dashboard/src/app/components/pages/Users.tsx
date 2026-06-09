import { useState } from "react";
import { Search, Users as UsersIcon, MapPin, Globe, CalendarCheck, IndianRupee, Eye, MoreVertical, TrendingUp, UserCheck, UserX, X, Mail, Phone, ShieldBan, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const users = [
  { id: "U001", name: "Rajesh Kumar", email: "rajesh.kumar@gmail.com", location: "Hyderabad, AP", language: "Telugu", bookings: 24, spend: "₹48,400", status: "Active", joined: "Jan 2024", avatar: "RK" },
  { id: "U002", name: "Priya Menon", email: "priya.menon@gmail.com", location: "Kochi, Kerala", language: "Malayalam", bookings: 18, spend: "₹32,600", status: "Active", joined: "Feb 2024", avatar: "PM" },
  { id: "U003", name: "Ankit Sharma", email: "ankit.sharma@yahoo.com", location: "Delhi, NCR", language: "Hindi", bookings: 12, spend: "₹21,800", status: "Active", joined: "Mar 2024", avatar: "AS" },
  { id: "U004", name: "Sunita Reddy", email: "sunita.r@gmail.com", location: "Chennai, TN", language: "Tamil", bookings: 31, spend: "₹61,200", status: "Active", joined: "Jan 2024", avatar: "SR" },
  { id: "U005", name: "Mohan Das", email: "mohan.d@outlook.com", location: "Mumbai, MH", language: "Hindi", bookings: 9, spend: "₹14,400", status: "Active", joined: "Apr 2024", avatar: "MD" },
  { id: "U006", name: "Kavitha Iyer", email: "kavitha.iyer@gmail.com", location: "Coimbatore, TN", language: "Tamil", bookings: 42, spend: "₹84,800", status: "Active", joined: "Dec 2023", avatar: "KI" },
  { id: "U007", name: "Deepak Joshi", email: "deepak.j@gmail.com", location: "Pune, MH", language: "Marathi", bookings: 6, spend: "₹9,600", status: "Inactive", joined: "Jun 2024", avatar: "DJ" },
  { id: "U008", name: "Sarla Gupta", email: "sarla.g@gmail.com", location: "Jaipur, RJ", language: "Hindi", bookings: 15, spend: "₹26,400", status: "Active", joined: "Mar 2024", avatar: "SG" },
  { id: "U009", name: "Narayanan V.", email: "narayanan.v@gmail.com", location: "Madurai, TN", language: "Tamil", bookings: 38, spend: "₹72,600", status: "Active", joined: "Jan 2024", avatar: "NV" },
  { id: "U010", name: "Meena Krishnan", email: "meena.k@gmail.com", location: "Bangalore, KA", language: "Kannada", bookings: 22, spend: "₹41,200", status: "Active", joined: "Feb 2024", avatar: "MK" },
];

const stateDist = [
  { state: "Andhra Pradesh", users: 520000 },
  { state: "Tamil Nadu", users: 480000 },
  { state: "Kerala", users: 340000 },
  { state: "Karnataka", users: 280000 },
  { state: "Maharashtra", users: 240000 },
  { state: "Uttar Pradesh", users: 220000 },
];

const activityByHour = [
  { hour: "6 AM", users: 1200 },
  { hour: "8 AM", users: 3400 },
  { hour: "10 AM", users: 6200 },
  { hour: "12 PM", users: 8400 },
  { hour: "2 PM", users: 7100 },
  { hour: "4 PM", users: 9200 },
  { hour: "6 PM", users: 11400 },
  { hour: "8 PM", users: 14200 },
  { hour: "10 PM", users: 8600 },
];

const langColors = ["#C76A00", "#D4A017", "#4A1259", "#22C55E", "#6366F1", "#EF4444"];

export function Users() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "2.84M", icon: UsersIcon, color: "#C76A00", bg: "#FFF0E6" },
          { label: "Active Users", value: "1.92M", icon: UserCheck, color: "#22C55E", bg: "#F0FDF4" },
          { label: "New This Month", value: "48,200", icon: TrendingUp, color: "#4A1259", bg: "#F3E8FF" },
          { label: "Inactive / Churned", value: "184K", icon: UserX, color: "#EF4444", bg: "#FFF1F2" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-4 border flex items-center gap-4" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-xl" style={{ color: "#1F1F1F", fontWeight: 700 }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* State distribution */}
        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>State-wise User Distribution</h3>
          <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>Top 6 states by user count</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stateDist} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="state" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip formatter={(v: number) => `${(v/1000).toFixed(0)}K users`} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar key="bar-state-users" dataKey="users" fill="#C76A00" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity by hour */}
        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>User Activity — Today</h3>
          <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>Active users by hour</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityByHour} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} users`} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar key="bar-hourly-users" dataKey="users" fill="#4A1259" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table controls */}
      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search users by name, email, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }}
          />
        </div>
        {["All", "Active", "Inactive"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: statusFilter === s ? "#C76A00" : "#FAF6F2", color: statusFilter === s ? "#FFFFFF" : "#6B7280", fontWeight: statusFilter === s ? 600 : 400, border: "1px solid", borderColor: statusFilter === s ? "#C76A00" : "rgba(199,106,0,0.15)" }}>
            {s}
          </button>
        ))}
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {filtered.map((u) => (
            <div key={u.id} className="p-4 flex items-center gap-3" style={{ minHeight: "64px" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                style={{ backgroundColor: "#C76A00", fontWeight: 700 }}>
                {u.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-sm truncate" style={{ color: "#1F1F1F", fontWeight: 600 }}>{u.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: u.status === "Active" ? "#F0FDF4" : "#FFF1F2", color: u.status === "Active" ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                    {u.status}
                  </span>
                </div>
                <div className="text-xs truncate mb-1" style={{ color: "#9CA3AF" }}>{u.email}</div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-xs" style={{ color: "#6B7280" }}>
                    <MapPin size={10} style={{ color: "#9CA3AF" }} />{u.location}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#F3E8FF", color: "#4A1259", fontWeight: 500 }}>{u.language}</span>
                  <span className="text-xs" style={{ color: "#22C55E", fontWeight: 600 }}>{u.spend}</span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(u)} className="p-2 rounded-lg flex-shrink-0" style={{ minHeight: "44px", minWidth: "44px" }}>
                <Eye size={14} style={{ color: "#C76A00" }} />
              </button>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#FAF6F2" }}>
                {["User", "Location", "Language", "Bookings", "Lifetime Spend", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{ backgroundColor: "#C76A00", fontWeight: 700 }}>
                        {u.avatar}
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{u.name}</div>
                        <div className="text-xs" style={{ color: "#9CA3AF" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 text-xs" style={{ color: "#6B7280" }}>
                      <MapPin size={10} style={{ color: "#9CA3AF" }} />
                      {u.location}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3E8FF", color: "#4A1259", fontWeight: 500 }}>
                      {u.language}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{u.bookings}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#22C55E", fontWeight: 600 }}>{u.spend}</td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: "#9CA3AF" }}>{u.joined}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: u.status === "Active" ? "#F0FDF4" : "#FFF1F2", color: u.status === "Active" ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setSelectedUser(u)} className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                      <Eye size={13} style={{ color: "#C76A00" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* User Detail Drawer */}
      {selectedUser && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl transition-transform"
            style={{ width: "340px", maxWidth: "100vw", borderLeft: "1px solid rgba(199,106,0,0.1)" }}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700 }}>User Profile</span>
              <button onClick={() => setSelectedUser(null)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X size={15} style={{ color: "#9CA3AF" }} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Avatar + name */}
              <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: "#C76A00", fontWeight: 700, fontSize: 18 }}>
                    {selectedUser.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base" style={{ color: "#1F1F1F", fontWeight: 700 }}>{selectedUser.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>ID: {selectedUser.id}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selectedUser.status === "Active" ? "#F0FDF4" : "#FFF1F2", color: selectedUser.status === "Active" ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                    {selectedUser.status}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs" style={{ color: "#6B7280" }}>
                  <div className="flex items-center gap-2"><Mail size={12} style={{ color: "#9CA3AF" }} />{selectedUser.email}</div>
                  <div className="flex items-center gap-2"><MapPin size={12} style={{ color: "#9CA3AF" }} />{selectedUser.location}</div>
                  <div className="flex items-center gap-2"><Globe size={12} style={{ color: "#9CA3AF" }} />
                    <span className="px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#F3E8FF", color: "#4A1259", fontWeight: 500 }}>{selectedUser.language}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                <div className="text-xs mb-3" style={{ color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em" }}>ACTIVITY</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Bookings", value: selectedUser.bookings, icon: CalendarCheck, color: "#C76A00" },
                    { label: "Spend", value: selectedUser.spend, icon: IndianRupee, color: "#22C55E" },
                    { label: "Joined", value: selectedUser.joined, icon: TrendingUp, color: "#4A1259" },
                  ].map(s => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "#FAF6F2" }}>
                        <Icon size={13} className="mx-auto mb-1" style={{ color: s.color }} />
                        <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700 }}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                <div className="text-xs mb-3" style={{ color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em" }}>RECENT BOOKINGS</div>
                <div className="space-y-2">
                  {[
                    { pooja: "Rudrabhishek", temple: "Kashi Vishwanath", date: "08 Jun 2026", amount: "₹2,400", status: "Confirmed" },
                    { pooja: "Sahasranama Archana", temple: "Tirumala Tirupati", date: "02 Jun 2026", amount: "₹1,200", status: "Completed" },
                    { pooja: "Abhishekam", temple: "Meenakshi Amman", date: "22 May 2026", amount: "₹800", status: "Completed" },
                  ].map((b, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ backgroundColor: "#FAF6F2" }}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{b.pooja}</span>
                        <span className="text-xs" style={{ color: "#22C55E", fontWeight: 600 }}>{b.amount}</span>
                      </div>
                      <div className="text-xs" style={{ color: "#9CA3AF" }}>{b.temple} · {b.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="px-5 py-4 border-t flex-shrink-0 space-y-2" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
                <Bell size={14} /> Send Notification
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
                style={{ backgroundColor: selectedUser.status === "Active" ? "#FFF1F2" : "#F0FDF4", color: selectedUser.status === "Active" ? "#DC2626" : "#16A34A", fontWeight: 600 }}>
                <ShieldBan size={14} /> {selectedUser.status === "Active" ? "Suspend Account" : "Activate Account"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
