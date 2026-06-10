import { useState } from "react";
import { Modal, Field, ModalFooter, inputCls, inputStyle, selectStyle } from "../Modal";
import {
  Radio, Eye, Users, Clock, Wifi, WifiOff, Video, Play, Download,
  Package, MapPin, CheckCircle, AlertCircle, Truck, MessageCircle,
  Flag, Star, ChevronDown, Search, Plus, Edit, XCircle, Filter,
  Briefcase, Building2, UserCircle, TrendingUp, IndianRupee,
  Flame, Tag, Globe, RefreshCcw, BarChart2, ArrowUpRight,
  ClipboardList, PowerOff, Send, CheckCircle2, HardDrive, LayoutGrid,
  List, Calendar, ChevronRight, Reply, MoreVertical, Phone, Mail,
  TriangleAlert, Inbox, Timer, ArrowLeft
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";



const poojas = [
  { id: "PJ001", name: "Rudrabhishek", category: "Abhishek", duration: "1h 30m", price: "₹2,400", temples: 142, bookings: 18420, rating: 4.9, prasad: true, liveStream: true, status: "Active" },
  { id: "PJ002", name: "Sahasranama Archana", category: "Archana", duration: "1h 00m", price: "₹1,200", temples: 98, bookings: 14280, rating: 4.8, prasad: true, liveStream: true, status: "Active" },
  { id: "PJ003", name: "Sudarshana Homam", category: "Homam", duration: "2h 00m", price: "₹4,800", temples: 64, bookings: 8420, rating: 4.9, prasad: true, liveStream: true, status: "Active" },
  { id: "PJ004", name: "Abhishekam", category: "Abhishek", duration: "45m", price: "₹800", temples: 184, bookings: 24680, rating: 4.7, prasad: true, liveStream: true, status: "Active" },
  { id: "PJ005", name: "Maha Abhishek", category: "Abhishek", duration: "3h 00m", price: "₹6,400", temples: 42, bookings: 4820, rating: 4.9, prasad: true, liveStream: true, status: "Active" },
  { id: "PJ006", name: "Satyanarayan Katha", category: "Katha", duration: "2h 30m", price: "₹3,200", temples: 78, bookings: 6240, rating: 4.6, prasad: true, liveStream: false, status: "Active" },
  { id: "PJ007", name: "Navakabhishekam", category: "Abhishek", duration: "4h 00m", price: "₹8,400", temples: 18, bookings: 1840, rating: 4.9, prasad: true, liveStream: true, status: "Active" },
  { id: "PJ008", name: "Ganapathi Homam", category: "Homam", duration: "2h 00m", price: "₹3,600", temples: 58, bookings: 5620, rating: 4.7, prasad: false, liveStream: true, status: "Under Review" },
];

const emptyPoojaForm = { name: "", category: "Abhishek", duration: "", price: "", liveStream: true, prasad: true };

export function PoojasPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [poojasState, setPoojasState] = useState(poojas);
  const [form, setForm] = useState(emptyPoojaForm);
  const [editTarget, setEditTarget] = useState<typeof poojas[0] | null>(null);
  const [editForm, setEditForm] = useState(emptyPoojaForm);
  const filtered = poojasState.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  function handleAdd() {
    if (!form.name || !form.duration || !form.price) return;
    const newPooja = {
      id: `PJ${String(poojasState.length + 1).padStart(3, "0")}`,
      name: form.name, category: form.category, duration: form.duration,
      price: form.price.startsWith("₹") ? form.price : `₹${form.price}`,
      temples: 0, bookings: 0, rating: 5.0,
      prasad: form.prasad, liveStream: form.liveStream, status: "Active",
    };
    setPoojasState(prev => [...prev, newPooja]);
    setForm(emptyPoojaForm);
    setAddOpen(false);
  }

  function openEdit(p: typeof poojas[0]) {
    setEditTarget(p);
    setEditForm({ name: p.name, category: p.category, duration: p.duration, price: p.price.replace("₹", ""), liveStream: p.liveStream, prasad: p.prasad });
  }

  function handleEdit() {
    if (!editTarget) return;
    setPoojasState(prev => prev.map(p => p.id === editTarget.id ? {
      ...p,
      name: editForm.name, category: editForm.category, duration: editForm.duration,
      price: editForm.price.startsWith("₹") ? editForm.price : `₹${editForm.price}`,
      liveStream: editForm.liveStream, prasad: editForm.prasad,
    } : p));
    setEditTarget(null);
    setEditForm(emptyPoojaForm);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Poojas", value: "284", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Active Services", value: "268", color: "#22C55E", bg: "#F0FDF4" },
          { label: "With Live Stream", value: "184", color: "#EF4444", bg: "#FFF1F2" },
          { label: "With Prasad", value: "241", color: "#4A1259", bg: "#F3E8FF" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 border flex items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input type="text" placeholder="Search poojas by name or category..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }} />
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
          <Plus size={15} /> Add Pooja
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {filtered.map(p => (
            <div key={p.id} className="p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFF0E6" }}>
                    <Flame size={14} style={{ color: "#C76A00" }} />
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{p.name}</div>
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#F3E8FF", color: "#4A1259" }}>{p.category}</span>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.status === "Active" ? "#F0FDF4" : "#FFFBEB", color: p.status === "Active" ? "#16A34A" : "#D97706", fontWeight: 600 }}>{p.status}</span>
              </div>
              <div className="flex items-center gap-4 text-xs flex-wrap">
                <span style={{ color: "#6B7280" }}>{p.duration}</span>
                <span style={{ color: "#1F1F1F", fontWeight: 700 }}>{p.price}</span>
                <span className="flex items-center gap-1">
                  <Star size={11} fill="#D4A017" style={{ color: "#D4A017" }} />
                  <span style={{ fontWeight: 600 }}>{p.rating}</span>
                </span>
                <span style={{ color: "#6B7280" }}>{p.bookings.toLocaleString()} bookings</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {p.liveStream && <span className="flex items-center gap-1" style={{ color: "#22C55E" }}><CheckCircle size={11} /> Live</span>}
                {p.prasad && <span className="flex items-center gap-1" style={{ color: "#C76A00" }}><CheckCircle size={11} /> Prasad</span>}
                <div className="ml-auto flex gap-2">
                  <button className="p-2 rounded-lg" style={{ minHeight: "44px", minWidth: "44px" }}><Eye size={14} style={{ color: "#C76A00" }} /></button>
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg" style={{ minHeight: "44px", minWidth: "44px" }}><Edit size={14} style={{ color: "#6B7280" }} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#FAF6F2" }}>
                {["Pooja Name", "Category", "Duration", "Price", "Temples", "Bookings", "Rating", "Live Stream", "Prasad", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFF0E6" }}>
                        <Flame size={14} style={{ color: "#C76A00" }} />
                      </div>
                      <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3E8FF", color: "#4A1259" }}>{p.category}</span></td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: "#6B7280" }}>{p.duration}</td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{p.price}</td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: "#1F1F1F" }}>{p.temples}</td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{p.bookings.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Star size={11} fill="#D4A017" style={{ color: "#D4A017" }} />
                      <span className="text-xs" style={{ fontWeight: 600 }}>{p.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">{p.liveStream ? <CheckCircle size={14} style={{ color: "#22C55E" }} /> : <XCircle size={14} style={{ color: "#D1D5DB" }} />}</td>
                  <td className="px-4 py-3.5">{p.prasad ? <CheckCircle size={14} style={{ color: "#22C55E" }} /> : <XCircle size={14} style={{ color: "#D1D5DB" }} />}</td>
                  <td className="px-4 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: p.status === "Active" ? "#F0FDF4" : "#FFFBEB", color: p.status === "Active" ? "#16A34A" : "#D97706", fontWeight: 600 }}>{p.status}</span></td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <button className="p-1.5 rounded-lg hover:bg-orange-50"><Eye size={13} style={{ color: "#C76A00" }} /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-50"><Edit size={13} style={{ color: "#6B7280" }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Pooja">
        <div className="px-6 py-5 space-y-4">
          <Field label="Pooja Name">
            <input className={inputCls} style={inputStyle} placeholder="e.g. Rudrabhishek" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Category">
            <select className={inputCls} style={selectStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {["Abhishek", "Homam", "Archana", "Katha", "Aarti", "Festival Puja", "Deeparadhana", "Sahasranama"].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration">
              <input className={inputCls} style={inputStyle} placeholder="e.g. 1h 30m" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
            </Field>
            <Field label="Price (₹)">
              <input className={inputCls} style={inputStyle} placeholder="e.g. 2,400" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </Field>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.liveStream} onChange={e => setForm(f => ({ ...f, liveStream: e.target.checked }))} />
              <span className="text-sm" style={{ color: "#374151" }}>Live Stream</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.prasad} onChange={e => setForm(f => ({ ...f, prasad: e.target.checked }))} />
              <span className="text-sm" style={{ color: "#374151" }}>Prasad Delivery</span>
            </label>
          </div>
        </div>
        <ModalFooter onClose={() => setAddOpen(false)} onSubmit={handleAdd} submitLabel="Add Pooja" />
      </Modal>

      {/* Edit Pooja Modal */}
      <Modal open={!!editTarget} onClose={() => { setEditTarget(null); setEditForm(emptyPoojaForm); }} title={`Edit Pooja — ${editTarget?.name ?? ""}`}>
        <div className="px-6 py-5 space-y-4">
          <Field label="Pooja Name">
            <input className={inputCls} style={inputStyle} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Category">
            <select className={inputCls} style={selectStyle} value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
              {["Abhishek", "Homam", "Archana", "Katha", "Aarti", "Festival Puja", "Deeparadhana", "Sahasranama"].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration">
              <input className={inputCls} style={inputStyle} value={editForm.duration} onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))} />
            </Field>
            <Field label="Price (₹)">
              <input className={inputCls} style={inputStyle} value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} />
            </Field>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editForm.liveStream} onChange={e => setEditForm(f => ({ ...f, liveStream: e.target.checked }))} />
              <span className="text-sm" style={{ color: "#374151" }}>Live Stream</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editForm.prasad} onChange={e => setEditForm(f => ({ ...f, prasad: e.target.checked }))} />
              <span className="text-sm" style={{ color: "#374151" }}>Prasad Delivery</span>
            </label>
          </div>
        </div>
        <ModalFooter onClose={() => { setEditTarget(null); setEditForm(emptyPoojaForm); }} onSubmit={handleEdit} submitLabel="Save Changes" />
      </Modal>
    </div>
  );
}

