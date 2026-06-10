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



const categories = [
  { id: "CAT001", name: "Abhishek", poojas: 48, bookings: 62840, icon: "💧", color: "#C76A00", description: "Ritual bathing of the deity with sacred substances" },
  { id: "CAT002", name: "Homam", poojas: 32, bookings: 28420, icon: "🔥", color: "#EF4444", description: "Sacred fire rituals with oblations and mantras" },
  { id: "CAT003", name: "Archana", poojas: 42, bookings: 84200, icon: "🌺", color: "#D4A017", description: "Offering of flowers or leaves with devotional chanting" },
  { id: "CAT004", name: "Katha", poojas: 18, bookings: 12480, icon: "📖", color: "#4A1259", description: "Devotional discourse and storytelling of sacred texts" },
  { id: "CAT005", name: "Aarti", poojas: 28, bookings: 48200, icon: "🪔", color: "#D97706", description: "Ritual of light offering with lamps and devotional songs" },
  { id: "CAT006", name: "Festival Puja", poojas: 24, bookings: 32840, icon: "🎊", color: "#22C55E", description: "Special pujas tied to annual festival events and calendars" },
  { id: "CAT007", name: "Deeparadhana", poojas: 14, bookings: 18420, icon: "✨", color: "#6366F1", description: "Waving of lighted lamps before the deity" },
  { id: "CAT008", name: "Sahasranama", poojas: 12, bookings: 14840, icon: "🕉️", color: "#4A1259", description: "Chanting of thousand names of the deity" },
];

const catColors = ["#C76A00", "#EF4444", "#D4A017", "#4A1259", "#D97706", "#22C55E", "#6366F1", "#2563EB"];

export function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<null | typeof categories[0]>(null);
  const [cats, setCats] = useState(categories);
  const [form, setForm] = useState({ name: "", icon: "🕉️", description: "" });
  const filtered = cats.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  function handleAdd() {
    if (!form.name) return;
    const newCat = {
      id: `CAT${String(cats.length + 1).padStart(3, "0")}`,
      name: form.name, icon: form.icon || "🕉️",
      color: catColors[cats.length % catColors.length],
      description: form.description, poojas: 0, bookings: 0,
    };
    setCats(prev => [...prev, newCat]);
    setForm({ name: "", icon: "🕉️", description: "" });
    setAddOpen(false);
  }

  function handleEdit() {
    if (!editTarget || !form.name) return;
    setCats(prev => prev.map(c => c.id === editTarget.id ? { ...c, name: form.name, icon: form.icon, description: form.description } : c));
    setEditTarget(null);
    setForm({ name: "", icon: "🕉️", description: "" });
  }

  function openEdit(c: typeof categories[0]) {
    setEditTarget(c);
    setForm({ name: c.name, icon: c.icon, description: c.description });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Categories", value: "28", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Total Poojas", value: "284", color: "#4A1259", bg: "#F3E8FF" },
          { label: "Most Popular", value: "Archana", color: "#D4A017", bg: "#FFFBEB" },
          { label: "Total Bookings", value: "3.01L", color: "#22C55E", bg: "#F0FDF4" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-lg" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-4 border flex items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input type="text" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }} />
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
          <Plus size={15} /> Add Category
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border hover:shadow-md transition-shadow p-5" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: c.color + "18" }}>{c.icon}</div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-50"><Edit size={12} style={{ color: "#9CA3AF" }} /></button>
              </div>
            </div>
            <div className="text-sm mb-1" style={{ color: "#1F1F1F", fontWeight: 700 }}>{c.name}</div>
            <p className="text-xs mb-3" style={{ color: "#9CA3AF", lineHeight: 1.5 }}>{c.description}</p>
            <div className="flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
              <span style={{ color: "#6B7280" }}>{c.poojas} poojas</span>
              <span style={{ color: c.color, fontWeight: 600 }}>{c.bookings.toLocaleString()} bookings</span>
            </div>
          </div>
        ))}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Category">
        <div className="px-6 py-5 space-y-4">
          <Field label="Category Name">
            <input className={inputCls} style={inputStyle} placeholder="e.g. Abhishek" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Icon (emoji)" hint="Paste any emoji to represent this category">
            <input className={inputCls} style={inputStyle} placeholder="🕉️" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
          </Field>
          <Field label="Description">
            <textarea className={inputCls} style={inputStyle} rows={3} placeholder="Brief description of this category..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </Field>
        </div>
        <ModalFooter onClose={() => setAddOpen(false)} onSubmit={handleAdd} submitLabel="Add Category" />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Category">
        <div className="px-6 py-5 space-y-4">
          <Field label="Category Name">
            <input className={inputCls} style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Icon (emoji)">
            <input className={inputCls} style={inputStyle} value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
          </Field>
          <Field label="Description">
            <textarea className={inputCls} style={inputStyle} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </Field>
        </div>
        <ModalFooter onClose={() => setEditTarget(null)} onSubmit={handleEdit} submitLabel="Save Changes" />
      </Modal>
    </div>
  );
}

