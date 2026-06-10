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



const languages = [
  { code: "te", name: "Telugu", flag: "🇮🇳", region: "Andhra Pradesh, Telangana", users: 840000, temples: 84, poojas: 142, status: "Active" },
  { code: "ta", name: "Tamil", flag: "🇮🇳", region: "Tamil Nadu, Sri Lanka", users: 620000, temples: 62, poojas: 124, status: "Active" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", region: "North India (Pan-India)", users: 510000, temples: 98, poojas: 184, status: "Active" },
  { code: "kn", name: "Kannada", flag: "🇮🇳", region: "Karnataka", users: 340000, temples: 48, poojas: 84, status: "Active" },
  { code: "ml", name: "Malayalam", flag: "🇮🇳", region: "Kerala", users: 255000, temples: 38, poojas: 68, status: "Active" },
  { code: "gu", name: "Gujarati", flag: "🇮🇳", region: "Gujarat", users: 184000, temples: 32, poojas: 58, status: "Active" },
  { code: "mr", name: "Marathi", flag: "🇮🇳", region: "Maharashtra", users: 142000, temples: 28, poojas: 48, status: "Active" },
  { code: "en", name: "English", flag: "🌐", region: "Global / Diaspora", users: 96000, temples: 284, poojas: 268, status: "Active" },
];

export function LanguagesPage() {
  const [langs, setLangs] = useState(languages);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<null | typeof languages[0]>(null);
  const [form, setForm] = useState({ name: "", code: "", flag: "🇮🇳", region: "" });

  function handleAdd() {
    if (!form.name || !form.code) return;
    const newLang = {
      code: form.code.toLowerCase(), name: form.name, flag: form.flag || "🌐",
      region: form.region, users: 0, temples: 0, poojas: 0, status: "Active",
    };
    setLangs(prev => [...prev, newLang]);
    setForm({ name: "", code: "", flag: "🇮🇳", region: "" });
    setAddOpen(false);
  }

  function handleEdit() {
    if (!editTarget || !form.name) return;
    setLangs(prev => prev.map(l => l.code === editTarget.code ? { ...l, name: form.name, flag: form.flag, region: form.region } : l));
    setEditTarget(null);
    setForm({ name: "", code: "", flag: "🇮🇳", region: "" });
  }

  function openEdit(l: typeof languages[0]) {
    setEditTarget(l);
    setForm({ name: l.name, code: l.code, flag: l.flag, region: l.region });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Supported Languages", value: String(langs.length), color: "#C76A00", bg: "#FFF0E6" },
          { label: "Most Used", value: "Telugu", color: "#4A1259", bg: "#F3E8FF" },
          { label: "Total Multilingual Users", value: "2.99M", color: "#22C55E", bg: "#F0FDF4" },
          { label: "Pending Translations", value: "24", color: "#D97706", bg: "#FFFBEB" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <div>
            <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Language Configuration</h3>
            <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Manage platform language support and regional service availability</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
            <Plus size={15} /> Add Language
          </button>
        </div>
        <div className="divide-y" style={{ divideColor: "rgba(199,106,0,0.06)" }}>
          {langs.map((l) => (
            <div key={l.code} className="px-5 py-4 flex items-center gap-4 hover:bg-orange-50 transition-colors">
              <div className="text-2xl">{l.flag}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{l.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>{l.code.toUpperCase()}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{l.region}</div>
              </div>
              <div className="hidden md:flex items-center gap-6 text-center">
                <div>
                  <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{(l.users / 1000).toFixed(0)}K</div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Users</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{l.temples}</div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Temples</div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{l.poojas}</div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Poojas</div>
                </div>
              </div>
              <div className="w-32 hidden lg:block">
                <div className="h-1.5 rounded-full" style={{ backgroundColor: "#F3EDE8" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${Math.round((l.users / 840000) * 100)}%`, backgroundColor: "#C76A00" }} />
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>{l.status}</span>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg hover:bg-orange-50"><Edit size={13} style={{ color: "#C76A00" }} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Language">
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Language Name">
              <input className={inputCls} style={inputStyle} placeholder="e.g. Bengali" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Language Code">
              <input className={inputCls} style={inputStyle} placeholder="e.g. bn" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
            </Field>
          </div>
          <Field label="Flag / Icon (emoji)">
            <input className={inputCls} style={inputStyle} placeholder="🇮🇳" value={form.flag} onChange={e => setForm(f => ({ ...f, flag: e.target.value }))} />
          </Field>
          <Field label="Region / Coverage">
            <input className={inputCls} style={inputStyle} placeholder="e.g. West Bengal, Bangladesh" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
          </Field>
        </div>
        <ModalFooter onClose={() => setAddOpen(false)} onSubmit={handleAdd} submitLabel="Add Language" />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Language">
        <div className="px-6 py-5 space-y-4">
          <Field label="Language Name">
            <input className={inputCls} style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <Field label="Flag / Icon (emoji)">
            <input className={inputCls} style={inputStyle} value={form.flag} onChange={e => setForm(f => ({ ...f, flag: e.target.value }))} />
          </Field>
          <Field label="Region / Coverage">
            <input className={inputCls} style={inputStyle} value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
          </Field>
        </div>
        <ModalFooter onClose={() => setEditTarget(null)} onSubmit={handleEdit} submitLabel="Save Changes" />
      </Modal>
    </div>
  );
}

