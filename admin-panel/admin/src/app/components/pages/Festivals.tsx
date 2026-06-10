import { useState } from "react";
import { Plus, Search, CalendarCheck, Building2, IndianRupee, Users, Eye, Edit, Settings, TrendingUp, Clock, CheckCircle, Play, Star } from "lucide-react";
import { Modal, Field, ModalFooter, inputCls, inputStyle, selectStyle } from "../Modal";

const festivalsData = [
  {
    id: "FV001", name: "Navratri Mahotsav 2026", temples: 84, revenue: "₹42.8L", bookings: 18420,
    status: "Active", startDate: "02 Oct 2026", endDate: "12 Oct 2026",
    poojas: 24, limit: 25000, filled: 74, color: "#C76A00",
    description: "Pan-India Navratri celebration with Garba nights, Durga Puja, and special Abhishekam services across all participating temples.",
    topTemples: ["Vaishno Devi", "Tirumala", "Meenakshi Amman"],
  },
  {
    id: "FV002", name: "Diwali Deepotsav 2026", temples: 142, revenue: "₹68.4L", bookings: 32840,
    status: "Upcoming", startDate: "20 Oct 2026", endDate: "25 Oct 2026",
    poojas: 18, limit: 40000, filled: 82, color: "#D4A017",
    description: "Grand Diwali festival featuring Lakshmi Puja, Lakshmi Abhishekam, and special prasad deliveries across India.",
    topTemples: ["Shirdi Sai Baba", "Kedarnath", "Somnath"],
  },
  {
    id: "FV003", name: "Sabarimala Mandala Season", temples: 12, revenue: "₹28.2L", bookings: 14200,
    status: "Active", startDate: "04 Dec 2025", endDate: "14 Jan 2026",
    poojas: 8, limit: 20000, filled: 71, color: "#4A1259",
    description: "Annual Mandala Maasam pilgrimage season for Lord Ayyappa devotees with special deeksha and virtual darshan services.",
    topTemples: ["Sabarimala", "Erumeli", "Pampa"],
  },
  {
    id: "FV004", name: "Kumbh Mela 2027", temples: 28, revenue: "₹84.6L", bookings: 42100,
    status: "Planning", startDate: "15 Jan 2027", endDate: "15 Mar 2027",
    poojas: 32, limit: 60000, filled: 0, color: "#22C55E",
    description: "Largest Hindu pilgrimage event — virtual participation packages with live streaming from all ghats and special pujas.",
    topTemples: ["Triveni Sangam", "Dashashwamedh Ghat", "Kashi"],
  },
  {
    id: "FV005", name: "Tirupati Brahmotsavam 2026", temples: 1, revenue: "₹18.4L", bookings: 8420,
    status: "Completed", startDate: "12 Sep 2026", endDate: "21 Sep 2026",
    poojas: 12, limit: 10000, filled: 100, color: "#6366F1",
    description: "Annual 9-day Brahmotsavam at Tirumala with Garuda Seva, Chakrasnanam, and other special events.",
    topTemples: ["Tirumala Tirupati"],
  },
  {
    id: "FV006", name: "Shivratri Mahotsav 2026", temples: 68, revenue: "₹32.1L", bookings: 15640,
    status: "Completed", startDate: "26 Feb 2026", endDate: "27 Feb 2026",
    poojas: 14, limit: 18000, filled: 87, color: "#EF4444",
    description: "Maha Shivratri special pujas including Rudrabhishek, Mahabhishek and midnight Shiva Aarti across all Shaiva temples.",
    topTemples: ["Kedarnath", "Kashi Vishwanath", "Somnath"],
  },
];

const festivalColors = ["#C76A00", "#D4A017", "#4A1259", "#22C55E", "#6366F1", "#EF4444", "#EC4899", "#14B8A6"];
const emptyFestForm = { name: "", status: "Upcoming", startDate: "", endDate: "", description: "", temples: "", poojas: "", limit: "" };

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  Active: { bg: "#F0FDF4", color: "#16A34A", label: "● Active" },
  Upcoming: { bg: "#EFF6FF", color: "#2563EB", label: "◷ Upcoming" },
  Planning: { bg: "#F3E8FF", color: "#7B3FA0", label: "✎ Planning" },
  Completed: { bg: "#F3F4F6", color: "#6B7280", label: "✓ Completed" },
};

export function Festivals() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [festivalsState, setFestivalsState] = useState(festivalsData);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<typeof festivalsData[0] | null>(null);
  const [festForm, setFestForm] = useState(emptyFestForm);

  const filtered = festivalsState.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleCreate() {
    if (!festForm.name || !festForm.startDate || !festForm.endDate) return;
    const newFest = {
      id: `FV${String(festivalsState.length + 1).padStart(3, "0")}`,
      name: festForm.name,
      status: festForm.status,
      startDate: festForm.startDate,
      endDate: festForm.endDate,
      description: festForm.description,
      temples: parseInt(festForm.temples) || 0,
      poojas: parseInt(festForm.poojas) || 0,
      limit: parseInt(festForm.limit) || 0,
      bookings: 0,
      revenue: "₹0",
      filled: 0,
      color: festivalColors[festivalsState.length % festivalColors.length],
      topTemples: [],
    };
    setFestivalsState(prev => [newFest, ...prev]);
    setFestForm(emptyFestForm);
    setCreateOpen(false);
  }

  function openEdit(f: typeof festivalsData[0]) {
    setEditTarget(f);
    setFestForm({ name: f.name, status: f.status, startDate: f.startDate, endDate: f.endDate, description: f.description, temples: String(f.temples), poojas: String(f.poojas), limit: String(f.limit) });
  }

  function handleEdit() {
    if (!editTarget) return;
    setFestivalsState(prev => prev.map(f => f.id === editTarget.id ? {
      ...f,
      name: festForm.name, status: festForm.status, startDate: festForm.startDate,
      endDate: festForm.endDate, description: festForm.description,
      temples: parseInt(festForm.temples) || f.temples,
      poojas: parseInt(festForm.poojas) || f.poojas,
      limit: parseInt(festForm.limit) || f.limit,
    } : f));
    setEditTarget(null);
    setFestForm(emptyFestForm);
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Festivals", value: "6", color: "#22C55E", bg: "#F0FDF4" },
          { label: "Total Bookings", value: "1.31L", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Festival Revenue", value: "₹2.74Cr", color: "#D4A017", bg: "#FFFBEB" },
          { label: "Participating Temples", value: "335", color: "#4A1259", bg: "#F3E8FF" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input
            type="text"
            placeholder="Search festivals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }}
          />
        </div>
        {["All", "Active", "Upcoming", "Planning", "Completed"].map((s) => (
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
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto"
          style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}
        >
          <Plus size={15} />
          Create Festival
        </button>
      </div>

      {/* Festival Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filtered.map((festival) => {
          const sc = statusConfig[festival.status] || statusConfig.Active;
          return (
            <div
              key={festival.id}
              className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow"
              style={{ borderColor: "rgba(199,106,0,0.1)" }}
            >
              {/* Festival Banner */}
              <div
                className="relative h-36 flex items-end p-5 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${festival.color} 0%, ${festival.color}88 60%, ${festival.color}22 100%)` }}
              >
                {/* Decorative pattern */}
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
                }} />
                <div className="absolute top-4 right-4">
                  <span
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)", color: "#FFFFFF", fontWeight: 600, backdropFilter: "blur(8px)" }}
                  >
                    {sc.label}
                  </span>
                </div>
                <div className="relative z-10">
                  <div className="text-white text-lg" style={{ fontWeight: 700 }}>{festival.name}</div>
                  <div className="flex items-center gap-3 mt-1 text-white/70 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {festival.startDate} — {festival.endDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <p className="text-xs mb-4" style={{ color: "#6B7280", lineHeight: 1.6 }}>{festival.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Temples", value: festival.temples, icon: Building2, color: "#C76A00" },
                    { label: "Bookings", value: festival.bookings.toLocaleString(), icon: CalendarCheck, color: "#4A1259" },
                    { label: "Revenue", value: festival.revenue, icon: IndianRupee, color: "#22C55E" },
                    { label: "Poojas", value: festival.poojas, icon: Star, color: "#D4A017" },
                  ].map((m) => {
                    const MIcon = m.icon;
                    return (
                      <div key={m.label} className="text-center p-2 rounded-xl" style={{ backgroundColor: "#FAF6F2" }}>
                        <MIcon size={14} className="mx-auto mb-1" style={{ color: m.color }} />
                        <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700 }}>{m.value}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{m.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Booking fill rate */}
                {festival.status !== "Planning" && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span style={{ color: "#6B7280" }}>Booking Capacity</span>
                      <span style={{ color: "#1F1F1F", fontWeight: 600 }}>{festival.filled}% filled ({festival.bookings.toLocaleString()} / {festival.limit.toLocaleString()})</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: "#F3EDE8" }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${festival.filled}%`,
                          background: festival.filled >= 90 ? "#EF4444" : festival.filled >= 70 ? "#D4A017" : "#22C55E",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Top temples */}
                <div className="mb-4">
                  <div className="text-xs mb-2" style={{ color: "#9CA3AF", fontWeight: 600 }}>PARTICIPATING TEMPLES</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {festival.topTemples.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: festival.color + "18", color: festival.color, fontWeight: 500 }}>
                        {t}
                      </span>
                    ))}
                    {festival.temples > festival.topTemples.length && (
                      <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#9CA3AF" }}>
                        +{festival.temples - festival.topTemples.length} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs"
                    style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
                    <Eye size={12} /> View Details
                  </button>
                  <button onClick={() => openEdit(festival)} className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs"
                    style={{ backgroundColor: "#F3EDE8", color: "#6B7280", fontWeight: 600 }}>
                    <Edit size={12} /> Edit
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs"
                    style={{ backgroundColor: "#F3E8FF", color: "#4A1259", fontWeight: 600 }}>
                    <Building2 size={12} /> Assign
                  </button>
                  <button className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs"
                    style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                    <TrendingUp size={12} /> Analytics
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Festival form shared JSX — used in both Create and Edit */}
      {(() => {
        const isEdit = !!editTarget;
        const open = isEdit ? true : createOpen;
        const title = isEdit ? `Edit Festival — ${editTarget!.id}` : "Create Festival";
        const onClose = isEdit
          ? () => { setEditTarget(null); setFestForm(emptyFestForm); }
          : () => { setCreateOpen(false); setFestForm(emptyFestForm); };
        const onSubmit = isEdit ? handleEdit : handleCreate;
        const submitLabel = isEdit ? "Save Changes" : "Create Festival";
        return (
          <Modal open={open} onClose={onClose} title={title} width="540px">
            <div className="px-6 py-5 space-y-4">
              <Field label="Festival Name">
                <input className={inputCls} style={inputStyle} placeholder="e.g. Navratri Mahotsav 2027" value={festForm.name} onChange={e => setFestForm(f => ({ ...f, name: e.target.value }))} />
              </Field>
              <Field label="Status">
                <select className={inputCls} style={selectStyle} value={festForm.status} onChange={e => setFestForm(f => ({ ...f, status: e.target.value }))}>
                  {["Active", "Upcoming", "Planning", "Completed"].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Date">
                  <input className={inputCls} style={inputStyle} placeholder="e.g. 02 Oct 2027" value={festForm.startDate} onChange={e => setFestForm(f => ({ ...f, startDate: e.target.value }))} />
                </Field>
                <Field label="End Date">
                  <input className={inputCls} style={inputStyle} placeholder="e.g. 12 Oct 2027" value={festForm.endDate} onChange={e => setFestForm(f => ({ ...f, endDate: e.target.value }))} />
                </Field>
              </div>
              <Field label="Description">
                <textarea className={inputCls} style={{ ...inputStyle, resize: "none" }} rows={3} placeholder="Brief description of the festival..." value={festForm.description} onChange={e => setFestForm(f => ({ ...f, description: e.target.value }))} />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Temples">
                  <input type="number" className={inputCls} style={inputStyle} placeholder="0" value={festForm.temples} onChange={e => setFestForm(f => ({ ...f, temples: e.target.value }))} />
                </Field>
                <Field label="Poojas">
                  <input type="number" className={inputCls} style={inputStyle} placeholder="0" value={festForm.poojas} onChange={e => setFestForm(f => ({ ...f, poojas: e.target.value }))} />
                </Field>
                <Field label="Booking Limit">
                  <input type="number" className={inputCls} style={inputStyle} placeholder="0" value={festForm.limit} onChange={e => setFestForm(f => ({ ...f, limit: e.target.value }))} />
                </Field>
              </div>
            </div>
            <ModalFooter onClose={onClose} onSubmit={onSubmit} submitLabel={submitLabel} />
          </Modal>
        );
      })()}
    </div>
  );
}
