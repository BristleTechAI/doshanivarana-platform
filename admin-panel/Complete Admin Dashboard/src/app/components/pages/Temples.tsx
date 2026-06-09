import { useState } from "react";
import {
  Building2, Search, Plus, Filter, MapPin, Star, CalendarCheck,
  IndianRupee, Radio, MoreVertical, UserCircle, Edit, PowerOff,
  TrendingUp, Eye, CheckCircle, AlertCircle, XCircle
} from "lucide-react";
import { Modal, Field, ModalFooter, inputCls, inputStyle, selectStyle } from "../Modal";

const temples = [
  {
    id: "T001", name: "Tirumala Tirupati Devasthanam", location: "Tirupati, Andhra Pradesh",
    deity: "Lord Venkateswara", bookings: 4820, revenue: "₹28.4L", rating: 4.9,
    poojas: 18, streams: 42, status: "Active", pro: "Ravi Shankar K.", color: "#C76A00",
    type: "Vaishnava", since: "Mar 2024", devotees: 84200,
  },
  {
    id: "T002", name: "Sabarimala Temple", location: "Pathanamthitta, Kerala",
    deity: "Lord Ayyappa", bookings: 3960, revenue: "₹22.1L", rating: 4.8,
    poojas: 14, streams: 38, status: "Active", pro: "Suresh Menon", color: "#4A1259",
    type: "Shaiva", since: "Apr 2024", devotees: 72400,
  },
  {
    id: "T003", name: "Shirdi Sai Baba Temple", location: "Shirdi, Maharashtra",
    deity: "Sai Baba", bookings: 3540, revenue: "₹19.5L", rating: 4.7,
    poojas: 12, streams: 29, status: "Active", pro: "Priya Joshi", color: "#D4A017",
    type: "Multi-faith", since: "Feb 2024", devotees: 61800,
  },
  {
    id: "T004", name: "Vaishno Devi Shrine", location: "Katra, J&K",
    deity: "Goddess Vaishno Devi", bookings: 2980, revenue: "₹17.2L", rating: 4.8,
    poojas: 10, streams: 22, status: "Active", pro: "Amit Sharma", color: "#22C55E",
    type: "Shakta", since: "May 2024", devotees: 54200,
  },
  {
    id: "T005", name: "Kedarnath Temple", location: "Rudraprayag, Uttarakhand",
    deity: "Lord Shiva", bookings: 2640, revenue: "₹15.8L", rating: 4.9,
    poojas: 8, streams: 18, status: "Seasonal", pro: "Rajeev Nair", color: "#6366F1",
    type: "Shaiva", since: "Jun 2024", devotees: 48600,
  },
  {
    id: "T006", name: "Somnath Jyotirlinga", location: "Veraval, Gujarat",
    deity: "Lord Shiva", bookings: 2180, revenue: "₹13.1L", rating: 4.6,
    poojas: 11, streams: 16, status: "Active", pro: "Deepak Patel", color: "#EF4444",
    type: "Shaiva", since: "Jul 2024", devotees: 42100,
  },
  {
    id: "T007", name: "Kashi Vishwanath Temple", location: "Varanasi, Uttar Pradesh",
    deity: "Lord Shiva", bookings: 1980, revenue: "₹11.8L", rating: 4.7,
    poojas: 15, streams: 14, status: "Active", pro: "Sanjay Tiwari", color: "#F59E0B",
    type: "Shaiva", since: "Jan 2025", devotees: 38400,
  },
  {
    id: "T008", name: "Meenakshi Amman Temple", location: "Madurai, Tamil Nadu",
    deity: "Goddess Meenakshi", bookings: 1840, revenue: "₹10.4L", rating: 4.8,
    poojas: 13, streams: 12, status: "Active", pro: "Kavitha Selvan", color: "#EC4899",
    type: "Shakta", since: "Feb 2025", devotees: 34800,
  },
  {
    id: "T009", name: "Padmanabhaswamy Temple", location: "Thiruvananthapuram, Kerala",
    deity: "Lord Vishnu", bookings: 1620, revenue: "₹9.2L", rating: 4.9,
    poojas: 9, streams: 10, status: "Pending Review", pro: "Unassigned", color: "#14B8A6",
    type: "Vaishnava", since: "Mar 2025", devotees: 29600,
  },
  {
    id: "T010", name: "Dwarkadhish Temple", location: "Dwarka, Gujarat",
    deity: "Lord Krishna", bookings: 1480, revenue: "₹8.4L", rating: 4.6,
    poojas: 10, streams: 8, status: "Inactive", pro: "Harish Mehta", color: "#8B5CF6",
    type: "Vaishnava", since: "Apr 2025", devotees: 26400,
  },
];

const statusConfig: Record<string, { bg: string; color: string; icon: typeof CheckCircle }> = {
  Active: { bg: "#F0FDF4", color: "#16A34A", icon: CheckCircle },
  Seasonal: { bg: "#FFFBEB", color: "#D97706", icon: AlertCircle },
  "Pending Review": { bg: "#EFF6FF", color: "#2563EB", icon: AlertCircle },
  Inactive: { bg: "#FFF1F2", color: "#DC2626", icon: XCircle },
};

const templeProManagers = ["Ravi Shankar K.", "Suresh Menon", "Priya Joshi", "Amit Sharma", "Rajeev Nair", "Deepak Patel", "Sanjay Tiwari", "Kavitha Selvan", "Unassigned"];
const emptyTempleForm = { name: "", location: "", deity: "", type: "Shaiva", pro: "Unassigned", status: "Active" };

export function Temples() {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<typeof temples[0] | null>(null);
  const [templeForm, setTempleForm] = useState(emptyTempleForm);

  function openTempleEdit(t: typeof temples[0]) {
    setEditTarget(t);
    setTempleForm({ name: t.name, location: t.location, deity: t.deity, type: t.type, pro: t.pro, status: t.status });
  }

  function handleEditTemple() {
    if (!editTarget) return;
    // In a real app, this would persist to backend
    setEditTarget(null);
    setTempleForm(emptyTempleForm);
  }

  const filtered = temples.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.deity.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Temples", value: "284", icon: Building2, color: "#C76A00", bg: "#FFF0E6" },
          { label: "Active Temples", value: "261", icon: CheckCircle, color: "#22C55E", bg: "#F0FDF4" },
          { label: "Avg Rating", value: "4.78 ★", icon: Star, color: "#D4A017", bg: "#FFFBEB" },
          { label: "Pending Requests", value: "12", icon: AlertCircle, color: "#F59E0B", bg: "#FFFBEB" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl p-4 border flex items-center gap-4" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-lg" style={{ color: "#1F1F1F", fontWeight: 700 }}>{s.value}</div>
                <div className="text-xs" style={{ color: "#6B7280" }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search temples, deities, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }}
          />
        </div>
        <div className="flex items-center gap-2">
          {["All", "Active", "Seasonal", "Pending Review", "Inactive"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                backgroundColor: statusFilter === s ? "#C76A00" : "#FAF6F2",
                color: statusFilter === s ? "#FFFFFF" : "#6B7280",
                fontWeight: statusFilter === s ? 600 : 400,
                border: "1px solid",
                borderColor: statusFilter === s ? "#C76A00" : "rgba(199,106,0,0.15)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setView("cards")}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: view === "cards" ? "#FFF0E6" : "transparent", color: view === "cards" ? "#C76A00" : "#9CA3AF", fontWeight: 600 }}
          >
            Cards
          </button>
          <button
            onClick={() => setView("table")}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: view === "table" ? "#FFF0E6" : "transparent", color: view === "table" ? "#C76A00" : "#9CA3AF", fontWeight: 600 }}
          >
            Table
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}
          >
            <Plus size={15} />
            Add Temple
          </button>
        </div>
      </div>

      {/* Card View */}
      {view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((temple) => {
            const sc = statusConfig[temple.status] || statusConfig.Active;
            const StatusIcon = sc.icon;
            return (
              <div key={temple.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
                {/* Banner */}
                <div
                  className="h-28 relative flex items-end p-4"
                  style={{ background: `linear-gradient(135deg, ${temple.color}CC 0%, ${temple.color}44 100%)` }}
                >
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px)`
                  }} />
                  <div className="relative z-10 flex items-center gap-3 w-full">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
                      <Building2 size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm truncate" style={{ fontWeight: 700 }}>{temple.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-white/70" />
                        <span className="text-white/70 text-xs truncate">{temple.location}</span>
                      </div>
                    </div>
                    <span
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur"
                      style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#FFFFFF", fontWeight: 600 }}
                    >
                      <StatusIcon size={10} />
                      {temple.status}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs" style={{ color: "#9CA3AF" }}>Primary Deity</span>
                      <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{temple.deity}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={13} fill="#D4A017" style={{ color: "#D4A017" }} />
                      <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700 }}>{temple.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Bookings", value: temple.bookings.toLocaleString(), icon: CalendarCheck, color: "#C76A00" },
                      { label: "Revenue", value: temple.revenue, icon: IndianRupee, color: "#22C55E" },
                      { label: "Streams", value: temple.streams, icon: Radio, color: "#4A1259" },
                    ].map((m) => {
                      const MIcon = m.icon;
                      return (
                        <div key={m.label} className="text-center p-2 rounded-lg" style={{ backgroundColor: "#FAF6F2" }}>
                          <MIcon size={13} className="mx-auto mb-1" style={{ color: m.color }} />
                          <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700, lineHeight: 1 }}>{m.value}</div>
                          <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{m.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <UserCircle size={14} style={{ color: "#9CA3AF" }} />
                      <span className="text-xs" style={{ color: temple.pro === "Unassigned" ? "#EF4444" : "#6B7280" }}>
                        {temple.pro}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>Since {temple.since}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-colors"
                      style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
                      <Eye size={12} /> View
                    </button>
                    <button onClick={() => openTempleEdit(temple)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition-colors"
                      style={{ backgroundColor: "#F3EDE8", color: "#6B7280", fontWeight: 600 }}>
                      <Edit size={12} /> Edit
                    </button>
                    <button className="flex items-center justify-center py-1.5 px-2.5 rounded-lg text-xs transition-colors"
                      style={{ backgroundColor: "#FFF1F2", color: "#EF4444" }}>
                      <PowerOff size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#FAF6F2" }}>
                  {["ID", "Temple", "Deity", "Bookings", "Revenue", "Rating", "PRO Manager", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const sc = statusConfig[t.status] || statusConfig.Active;
                  return (
                    <tr key={t.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#9CA3AF", fontFamily: "monospace" }}>{t.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.color + "18" }}>
                            <Building2 size={14} style={{ color: t.color }} />
                          </div>
                          <div>
                            <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{t.name}</div>
                            <div className="flex items-center gap-1">
                              <MapPin size={9} style={{ color: "#9CA3AF" }} />
                              <span className="text-xs" style={{ color: "#9CA3AF" }}>{t.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#6B7280" }}>{t.deity}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{t.bookings.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#22C55E", fontWeight: 600 }}>{t.revenue}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Star size={11} fill="#D4A017" style={{ color: "#D4A017" }} />
                          <span className="text-xs" style={{ fontWeight: 600, color: "#1F1F1F" }}>{t.rating}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: t.pro === "Unassigned" ? "#EF4444" : "#6B7280" }}>{t.pro}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors"><Eye size={13} style={{ color: "#C76A00" }} /></button>
                          <button onClick={() => openTempleEdit(t)} className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"><Edit size={13} style={{ color: "#6B7280" }} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><PowerOff size={13} style={{ color: "#EF4444" }} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Temple Modal */}
      <Modal
        open={!!editTarget}
        onClose={() => { setEditTarget(null); setTempleForm(emptyTempleForm); }}
        title={`Edit Temple — ${editTarget?.id ?? ""}`}
      >
        <div className="px-6 py-5 space-y-4">
          <Field label="Temple Name">
            <input
              className={inputCls} style={inputStyle}
              value={templeForm.name}
              onChange={e => setTempleForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Kashi Vishwanath Temple"
            />
          </Field>
          <Field label="Location">
            <input
              className={inputCls} style={inputStyle}
              value={templeForm.location}
              onChange={e => setTempleForm(f => ({ ...f, location: e.target.value }))}
              placeholder="City, State"
            />
          </Field>
          <Field label="Primary Deity">
            <input
              className={inputCls} style={inputStyle}
              value={templeForm.deity}
              onChange={e => setTempleForm(f => ({ ...f, deity: e.target.value }))}
              placeholder="e.g. Lord Shiva"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Temple Type">
              <select
                className={inputCls} style={selectStyle}
                value={templeForm.type}
                onChange={e => setTempleForm(f => ({ ...f, type: e.target.value }))}
              >
                {["Shaiva", "Vaishnava", "Shakta", "Multi-faith"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select
                className={inputCls} style={selectStyle}
                value={templeForm.status}
                onChange={e => setTempleForm(f => ({ ...f, status: e.target.value }))}
              >
                {["Active", "Seasonal", "Pending Review", "Inactive"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="PRO Manager">
            <select
              className={inputCls} style={selectStyle}
              value={templeForm.pro}
              onChange={e => setTempleForm(f => ({ ...f, pro: e.target.value }))}
            >
              {templeProManagers.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
        </div>
        <ModalFooter
          onClose={() => { setEditTarget(null); setTempleForm(emptyTempleForm); }}
          onSubmit={handleEditTemple}
          submitLabel="Save Changes"
        />
      </Modal>
    </div>
  );
}
