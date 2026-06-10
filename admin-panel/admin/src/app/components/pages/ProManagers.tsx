import { useState } from "react";
import { Modal, Field, ModalFooter, inputCls, inputStyle } from "../Modal";
import { MapPin, Search, Plus, Edit, Eye, Star } from "lucide-react";

const proManagers = [
  { id: "PRO001", name: "Ravi Shankar K.", avatar: "RS", temples: 4, location: "Tirupati, AP", email: "ravi@devaseva.com", phone: "+91 98421 84210", revenue: "₹28.4L", bookings: 4820, rating: 4.9, status: "Active", since: "Jan 2024", color: "#C76A00" },
  { id: "PRO002", name: "Suresh Menon", avatar: "SM", temples: 3, location: "Kochi, Kerala", email: "suresh@devaseva.com", phone: "+91 98432 18240", revenue: "₹22.1L", bookings: 3960, rating: 4.8, status: "Active", since: "Feb 2024", color: "#4A1259" },
  { id: "PRO003", name: "Priya Joshi", avatar: "PJ", temples: 2, location: "Nashik, MH", email: "priya@devaseva.com", phone: "+91 97302 84210", revenue: "₹19.5L", bookings: 3540, rating: 4.7, status: "Active", since: "Mar 2024", color: "#D4A017" },
  { id: "PRO004", name: "Amit Sharma", avatar: "AS", temples: 5, location: "Jammu, J&K", email: "amit@devaseva.com", phone: "+91 94428 18420", revenue: "₹17.2L", bookings: 2980, rating: 4.8, status: "Active", since: "Apr 2024", color: "#22C55E" },
  { id: "PRO005", name: "Rajeev Nair", avatar: "RN", temples: 2, location: "Dehradun, UK", email: "rajeev@devaseva.com", phone: "+91 98201 84210", revenue: "₹15.8L", bookings: 2640, rating: 4.9, status: "Active", since: "May 2024", color: "#6366F1" },
  { id: "PRO006", name: "Deepak Patel", avatar: "DP", temples: 3, location: "Veraval, GJ", email: "deepak@devaseva.com", phone: "+91 97421 84210", revenue: "₹13.1L", bookings: 2180, rating: 4.6, status: "Active", since: "Jun 2024", color: "#EF4444" },
];

const proColors = ["#C76A00", "#4A1259", "#D4A017", "#22C55E", "#6366F1", "#EF4444", "#2563EB", "#0891B2"];
const emptyForm = { name: "", location: "", email: "", phone: "", temples: "1" };

export function PROManagersPage() {
  const [managers, setManagers] = useState(proManagers);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<typeof proManagers[0] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = managers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.location.toLowerCase().includes(search.toLowerCase())
  );

  // Reactive stats derived from local state
  const avgTemples = managers.length > 0
    ? (managers.reduce((s, m) => s + m.temples, 0) / managers.length).toFixed(1)
    : "0";

  function handleAdd() {
    if (!form.name || !form.location || !form.email) return;
    setSaving(true);
    const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const newMgr = {
      id: `PRO${String(managers.length + 1).padStart(3, "0")}`,
      name: form.name, avatar: initials, temples: parseInt(form.temples) || 1,
      location: form.location, email: form.email, phone: form.phone,
      revenue: "₹0", bookings: 0, rating: 5.0, status: "Active", since: "Jun 2026",
      color: proColors[managers.length % proColors.length],
    };
    setManagers(prev => [...prev, newMgr]);
    setForm(emptyForm);
    setAddOpen(false);
    setSaving(false);
  }

  function openEdit(p: typeof proManagers[0]) {
    setEditTarget(p);
    setForm({ name: p.name, location: p.location, email: p.email, phone: p.phone, temples: String(p.temples) });
  }

  function handleEdit() {
    if (!editTarget || !form.name) return;
    setSaving(true);
    setManagers(prev => prev.map(m => m.id === editTarget.id ? {
      ...m,
      name: form.name,
      location: form.location,
      email: form.email,
      phone: form.phone,
      temples: parseInt(form.temples) || m.temples,
      avatar: form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    } : m));
    setEditTarget(null);
    setForm(emptyForm);
    setSaving(false);
  }

  function closeModal() {
    setAddOpen(false);
    setEditTarget(null);
    setForm(emptyForm);
  }

  return (
    <div className="space-y-5">
      {/* Stats — fully reactive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total PRO Managers", value: String(managers.length), color: "#C76A00", bg: "#FFF0E6" },
          { label: "Active", value: String(managers.filter(m => m.status === "Active").length), color: "#22C55E", bg: "#F0FDF4" },
          { label: "Avg Temples Managed", value: avgTemples, color: "#4A1259", bg: "#F3E8FF" },
          { label: "Avg Revenue", value: "₹14.2L", color: "#D4A017", bg: "#FFFBEB" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="bg-white rounded-xl p-4 border flex items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input type="text" placeholder="Search PRO managers..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }} />
        </div>
        <button onClick={() => { setForm(emptyForm); setAddOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
          <Plus size={15} /> Add PRO Manager
        </button>
      </div>

      {/* Manager Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border hover:shadow-md transition-shadow overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}66)` }} />
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: p.color, fontWeight: 700, fontSize: "16px" }}>{p.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700 }}>{p.name}</div>
                  <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                    <MapPin size={10} /> {p.location}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} fill="#D4A017" style={{ color: "#D4A017" }} />
                    <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{p.rating}</span>
                    <span className="text-xs ml-1" style={{ color: "#9CA3AF" }}>· {p.temples} temples</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>{p.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-2 rounded-lg text-center" style={{ backgroundColor: "#FAF6F2" }}>
                  <div className="text-sm" style={{ color: "#C76A00", fontWeight: 700 }}>{p.revenue}</div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Revenue</div>
                </div>
                <div className="p-2 rounded-lg text-center" style={{ backgroundColor: "#FAF6F2" }}>
                  <div className="text-sm" style={{ color: "#4A1259", fontWeight: 700 }}>{p.bookings.toLocaleString()}</div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Bookings</div>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}><Eye size={11} /> View</button>
                <button onClick={() => openEdit(p)} className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#F3EDE8", color: "#6B7280", fontWeight: 600 }}><Edit size={11} /> Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={closeModal} title="Add PRO Manager">
        <div className="px-6 py-5 space-y-4">
          <Field label="Full Name">
            <input className={inputCls} style={inputStyle} placeholder="e.g. Ravi Shankar K." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Location">
            <input className={inputCls} style={inputStyle} placeholder="e.g. Tirupati, AP" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </Field>
          <Field label="Email">
            <input className={inputCls} style={inputStyle} type="email" placeholder="email@devaseva.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Phone">
            <input className={inputCls} style={inputStyle} placeholder="+91 98XXX XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </Field>
          <Field label="Number of Temples Assigned">
            <input className={inputCls} style={inputStyle} type="number" min="1" max="20" value={form.temples} onChange={e => setForm(f => ({ ...f, temples: e.target.value }))} />
          </Field>
        </div>
        <ModalFooter onClose={closeModal} onSubmit={handleAdd} submitLabel="Add Manager" saving={saving} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTarget} onClose={closeModal} title={editTarget ? `Edit — ${editTarget.name}` : "Edit PRO Manager"}>
        <div className="px-6 py-5 space-y-4">
          <Field label="Full Name">
            <input className={inputCls} style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Location">
            <input className={inputCls} style={inputStyle} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </Field>
          <Field label="Email">
            <input className={inputCls} style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Phone">
            <input className={inputCls} style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </Field>
          <Field label="Number of Temples Assigned">
            <input className={inputCls} style={inputStyle} type="number" min="1" max="20" value={form.temples} onChange={e => setForm(f => ({ ...f, temples: e.target.value }))} />
          </Field>
        </div>
        <ModalFooter onClose={closeModal} onSubmit={handleEdit} submitLabel="Save Changes" saving={saving} />
      </Modal>
    </div>
  );
}
