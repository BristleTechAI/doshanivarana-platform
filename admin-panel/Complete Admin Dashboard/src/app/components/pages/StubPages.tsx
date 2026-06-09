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

// ─── LIVE STREAMS ──────────────────────────────────────────────────────────────

const liveStreams = [
  { id: "LS001", title: "Rudrabhishek — Evening", temple: "Kashi Vishwanath", priest: "Pandit Ramesh Sharma", viewers: 4284, duration: "1h 24m", quality: "HD 1080p", status: "Live", startedAt: "5:00 PM", category: "Abhishek" },
  { id: "LS002", title: "Sahasranama Archana", temple: "Tirumala Tirupati", priest: "Swami Krishnananda", viewers: 8420, duration: "2h 05m", quality: "HD 1080p", status: "Live", startedAt: "4:30 PM", category: "Archana" },
  { id: "LS003", title: "Maha Aarti — Sunset", temple: "Vaishno Devi Shrine", priest: "Amit Sharma", viewers: 12840, duration: "42m", quality: "HD 720p", status: "Live", startedAt: "6:00 PM", category: "Aarti" },
  { id: "LS004", title: "Deeparadhana — Evening", temple: "Sabarimala Temple", priest: "Subramaniam A.", viewers: 6120, duration: "1h 10m", quality: "HD 1080p", status: "Live", startedAt: "5:30 PM", category: "Archana" },
  { id: "LS005", title: "Navakabhishekam", temple: "Padmanabhaswamy", priest: "Narayanan Pillai", viewers: 3840, duration: "3h 00m", quality: "4K", status: "Live", startedAt: "3:00 PM", category: "Abhishek" },
  { id: "LS006", title: "Sandhya Vandanam", temple: "Somnath Jyotirlinga", priest: "Chandrashekhar G.", viewers: 2180, duration: "28m", quality: "HD 720p", status: "Buffering", startedAt: "6:15 PM", category: "Puja" },
  { id: "LS007", title: "Krishna Janmashtami Special", temple: "Dwarkadhish Temple", priest: "Pandit Gopal Das", viewers: 0, duration: "—", quality: "HD 1080p", status: "Scheduled", startedAt: "8:00 PM", category: "Festival" },
  { id: "LS008", title: "Shiv Puja — Morning", temple: "Kedarnath Temple", priest: "Mahant Shivprasad", viewers: 0, duration: "—", quality: "HD 1080p", status: "Scheduled", startedAt: "7:00 AM Tomorrow", category: "Puja" },
];

const streamStatusCfg: Record<string, { bg: string; color: string; dot: string }> = {
  Live: { bg: "#FFF1F2", color: "#DC2626", dot: "#EF4444" },
  Buffering: { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  Scheduled: { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
};

const streamTemples = ["Kashi Vishwanath", "Tirumala Tirupati", "Vaishno Devi Shrine", "Sabarimala Temple", "Padmanabhaswamy", "Somnath Jyotirlinga", "Kedarnath Temple"];

export function LiveStreamsPage() {
  const [filter, setFilter] = useState("All");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [streams, setStreams] = useState(liveStreams);
  const [form, setForm] = useState({ title: "", temple: streamTemples[0], priest: "", startTime: "", quality: "HD 1080p", category: "Puja" });

  const live = streams.filter(s => s.status === "Live").length;
  const filtered = filter === "All" ? streams : streams.filter(s => s.status === filter);

  function handleSchedule() {
    if (!form.title || !form.priest || !form.startTime) return;
    const newStream = {
      id: `LS${String(streams.length + 1).padStart(3, "0")}`,
      title: form.title, temple: form.temple, priest: form.priest,
      viewers: 0, duration: "—", quality: form.quality,
      status: "Scheduled" as const, startedAt: form.startTime, category: form.category,
    };
    setStreams(prev => [...prev, newStream]);
    setForm({ title: "", temple: streamTemples[0], priest: "", startTime: "", quality: "HD 1080p", category: "Puja" });
    setScheduleOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Live Now", value: String(live), color: "#EF4444", bg: "#FFF1F2" },
          { label: "Total Viewers", value: "37,684", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Avg Quality", value: "HD 1080p", color: "#22C55E", bg: "#F0FDF4" },
          { label: "Scheduled Today", value: "2", color: "#4A1259", bg: "#F3E8FF" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="flex items-center gap-1.5">
          {["All", "Live", "Buffering", "Scheduled"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ backgroundColor: filter === f ? "#C76A00" : "#FAF6F2", color: filter === f ? "#FFFFFF" : "#6B7280", fontWeight: filter === f ? 600 : 400, border: "1px solid", borderColor: filter === f ? "#C76A00" : "rgba(199,106,0,0.15)" }}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setScheduleOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto" style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
          <Plus size={15} /> Schedule Stream
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(s => {
          const sc = streamStatusCfg[s.status] || streamStatusCfg.Scheduled;
          return (
            <div key={s.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="h-36 relative flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1E0A3C, #4A1259)" }}>
                {s.status === "Live" ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Radio size={48} className="text-white opacity-10" />
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: "#EF4444" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-white text-xs" style={{ fontWeight: 700 }}>LIVE</span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1 text-white/70 text-xs">
                      <Users size={11} /> {s.viewers.toLocaleString()}
                    </div>
                    <div className="absolute bottom-3 left-3 text-white text-xs opacity-60">{s.duration}</div>
                    <div className="absolute bottom-3 right-3 text-white text-xs opacity-60">{s.quality}</div>
                  </>
                ) : (
                  <div className="text-center">
                    <Clock size={28} className="text-white/30 mx-auto mb-2" />
                    <div className="text-white/50 text-xs">Starts {s.startedAt}</div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{s.title}</div>
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} />
                    {s.status}
                  </span>
                </div>
                <div className="text-xs mb-1" style={{ color: "#C76A00", fontWeight: 500 }}>{s.temple}</div>
                <div className="text-xs" style={{ color: "#9CA3AF" }}>{s.priest}</div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
                    <Eye size={11} /> Monitor
                  </button>
                  {s.status === "Live" && (
                    <button className="flex items-center justify-center py-1.5 px-3 rounded-lg text-xs" style={{ backgroundColor: "#FFF1F2", color: "#EF4444", fontWeight: 600 }}>
                      End
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="Schedule Live Stream">
        <div className="px-6 py-5 space-y-4">
          <Field label="Stream Title">
            <input className={inputCls} style={inputStyle} placeholder="e.g. Rudrabhishek — Evening" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label="Temple">
            <select className={inputCls} style={selectStyle} value={form.temple} onChange={e => setForm(f => ({ ...f, temple: e.target.value }))}>
              {streamTemples.map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Priest Name">
            <input className={inputCls} style={inputStyle} placeholder="e.g. Pandit Ramesh Sharma" value={form.priest} onChange={e => setForm(f => ({ ...f, priest: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time">
              <input className={inputCls} style={inputStyle} placeholder="e.g. 6:00 PM" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </Field>
            <Field label="Quality">
              <select className={inputCls} style={selectStyle} value={form.quality} onChange={e => setForm(f => ({ ...f, quality: e.target.value }))}>
                {["HD 720p", "HD 1080p", "4K"].map(q => <option key={q}>{q}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Category">
            <select className={inputCls} style={selectStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {["Puja", "Abhishek", "Aarti", "Archana", "Homam", "Festival"].map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <ModalFooter onClose={() => setScheduleOpen(false)} onSubmit={handleSchedule} submitLabel="Schedule Stream" />
      </Modal>
    </div>
  );
}

// ─── RECORDINGS ────────────────────────────────────────────────────────────────

const recByDate = [
  {
    date: "08 Jun 2026",
    items: [
      { id: "REC009", title: "Morning Abhishekam", temple: "Tirumala Tirupati", duration: "1h 12m", views: 3240, size: "2.1 GB", status: "Processing", quality: "4K", gradient: "linear-gradient(135deg,#1E0A3C,#4A1259)" },
      { id: "REC010", title: "Sunrise Aarti", temple: "Vaishno Devi", duration: "38m", views: 5840, size: "1.3 GB", status: "Published", quality: "HD 1080p", gradient: "linear-gradient(135deg,#7B3FA0,#C76A00)" },
    ],
  },
  {
    date: "07 Jun 2026",
    items: [
      { id: "REC001", title: "Sudarshana Homam — Morning", temple: "Tirumala Tirupati", duration: "2h 18m", views: 8420, size: "4.2 GB", status: "Published", quality: "4K", gradient: "linear-gradient(135deg,#1E0A3C,#C76A00)" },
      { id: "REC002", title: "Sahasranama Archana", temple: "Sabarimala Temple", duration: "1h 45m", views: 6120, size: "3.1 GB", status: "Published", quality: "HD 1080p", gradient: "linear-gradient(135deg,#4A1259,#D4A017)" },
      { id: "REC003", title: "Rudrabhishek — Evening", temple: "Kashi Vishwanath", duration: "1h 30m", views: 4280, size: "2.8 GB", status: "Published", quality: "HD 1080p", gradient: "linear-gradient(135deg,#0F4C81,#1E0A3C)" },
    ],
  },
  {
    date: "06 Jun 2026",
    items: [
      { id: "REC004", title: "Maha Abhishek", temple: "Somnath Jyotirlinga", duration: "3h 05m", views: 3840, size: "5.4 GB", status: "Under Review", quality: "4K", gradient: "linear-gradient(135deg,#1E0A3C,#7B3FA0)" },
      { id: "REC005", title: "Deeparadhana — Sunset", temple: "Meenakshi Amman", duration: "48m", views: 2920, size: "1.6 GB", status: "Published", quality: "HD 720p", gradient: "linear-gradient(135deg,#7B3415,#C76A00)" },
      { id: "REC006", title: "Navakabhishekam", temple: "Padmanabhaswamy", duration: "4h 20m", views: 1840, size: "7.8 GB", status: "Published", quality: "4K", gradient: "linear-gradient(135deg,#1E3A5F,#4A1259)" },
      { id: "REC007", title: "Kedarnath Aarti", temple: "Kedarnath Temple", duration: "35m", views: 12480, size: "1.2 GB", status: "Published", quality: "HD 1080p", gradient: "linear-gradient(135deg,#1E0A3C,#D4A017)" },
    ],
  },
];

const recStatusCfg: Record<string, { bg: string; color: string }> = {
  Published: { bg: "#F0FDF4", color: "#16A34A" },
  Processing: { bg: "#EFF6FF", color: "#2563EB" },
  "Under Review": { bg: "#FFFBEB", color: "#D97706" },
  Rejected: { bg: "#FFF1F2", color: "#DC2626" },
};

export function RecordingsPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [recordings, setRecordings] = useState(recByDate);

  function approveRecording(id: string) {
    setRecordings(prev => prev.map(group => ({
      ...group,
      items: group.items.map(r => r.id === id ? { ...r, status: "Published" } : r),
    })));
  }

  function rejectRecording(id: string) {
    setRecordings(prev => prev.map(group => ({
      ...group,
      items: group.items.map(r => r.id === id ? { ...r, status: "Rejected" } : r),
    })));
  }

  const filteredByDate = recordings.map(group => ({
    ...group,
    items: group.items.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.temple.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(g => g.items.length > 0);

  const storageUsed = 14.2;
  const storageCap = 20;
  const storagePct = Math.round((storageUsed / storageCap) * 100);

  return (
    <div className="space-y-5">
      {/* Top strip */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Storage widget */}
        <div className="lg:col-span-1 bg-white rounded-xl p-5 border flex flex-col justify-between" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF0E6" }}>
              <HardDrive size={18} style={{ color: "#C76A00" }} />
            </div>
            <div>
              <div className="text-xs" style={{ color: "#9CA3AF" }}>Storage</div>
              <div style={{ color: "#1F1F1F", fontWeight: 700 }}>{storageUsed} TB <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: 11 }}>/ {storageCap} TB</span></div>
            </div>
          </div>
          <div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F3EDE8" }}>
              <div className="h-full rounded-full" style={{ width: `${storagePct}%`, background: "linear-gradient(90deg, #C76A00, #D4A017)" }} />
            </div>
            <div className="flex justify-between mt-1.5 text-xs" style={{ color: "#9CA3AF" }}>
              <span>{storagePct}% used</span>
              <span>{storageCap - storageUsed} TB free</span>
            </div>
          </div>
        </div>
        {/* Stats */}
        {[
          { label: "Total Recordings", value: "2,841", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Total Views", value: "18.4M", color: "#4A1259", bg: "#F3E8FF" },
          { label: "Published", value: "2,614", color: "#22C55E", bg: "#F0FDF4" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 border flex flex-col justify-between" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xs" style={{ color: "#9CA3AF" }}>{s.label}</div>
            <div style={{ color: s.color, fontWeight: 700, fontSize: 24 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input type="text" placeholder="Search by title or temple..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)" }}>
          <button onClick={() => setView("grid")} className="p-1.5 rounded-md transition-all"
            style={{ backgroundColor: view === "grid" ? "#FFFFFF" : "transparent", color: view === "grid" ? "#C76A00" : "#9CA3AF", boxShadow: view === "grid" ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
            <LayoutGrid size={14} />
          </button>
          <button onClick={() => setView("list")} className="p-1.5 rounded-md transition-all"
            style={{ backgroundColor: view === "list" ? "#FFFFFF" : "transparent", color: view === "list" ? "#C76A00" : "#9CA3AF", boxShadow: view === "list" ? "0 1px 3px rgba(0,0,0,0.08)" : "none" }}>
            <List size={14} />
          </button>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
          <Download size={13} /> Export
        </button>
      </div>

      {/* Date-grouped content */}
      {filteredByDate.map(group => (
        <div key={group.date} className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={13} style={{ color: "#9CA3AF" }} />
            <span style={{ color: "#9CA3AF", fontSize: 12, fontWeight: 600 }}>{group.date}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FAF6F2", color: "#C76A00", fontWeight: 600 }}>{group.items.length} recordings</span>
          </div>

          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {group.items.map(r => {
                const sc = recStatusCfg[r.status] || recStatusCfg.Published;
                return (
                  <div key={r.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow cursor-pointer" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
                    {/* Thumbnail */}
                    <div className="relative h-36 flex items-center justify-center" style={{ background: r.gradient }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                          <Play size={20} className="text-white" style={{ marginLeft: 2 }} />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: "rgba(0,0,0,0.6)", fontWeight: 600 }}>{r.duration}</div>
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#FFFFFF", fontWeight: 500 }}>{r.quality}</div>
                      {r.status === "Processing" && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#2563EB", color: "#FFFFFF", fontWeight: 600 }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Processing
                        </div>
                      )}
                      {r.status === "Under Review" && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#D97706", color: "#FFFFFF", fontWeight: 600 }}>
                          Under Review
                        </div>
                      )}
                    </div>
                    <div className="p-3.5">
                      <div className="text-sm mb-0.5" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.title}</div>
                      <div className="text-xs mb-2" style={{ color: "#C76A00", fontWeight: 500 }}>{r.temple}</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs" style={{ color: "#9CA3AF" }}>
                          <Eye size={11} /> {r.views.toLocaleString()} views
                        </div>
                        <div className="flex items-center gap-1 text-xs" style={{ color: "#9CA3AF" }}>
                          <HardDrive size={11} /> {r.size}
                        </div>
                      </div>
                      {r.status === "Under Review" && (
                        <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                          <button onClick={() => approveRecording(r.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                            <CheckCircle size={11} /> Approve
                          </button>
                          <button onClick={() => rejectRecording(r.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
                            <XCircle size={11} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              {group.items.map((r, i) => {
                const sc = recStatusCfg[r.status] || recStatusCfg.Published;
                return (
                  <div key={r.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-orange-50 transition-colors cursor-pointer ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <div className="w-14 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: r.gradient }}>
                      <Play size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.title}</div>
                      <div className="text-xs" style={{ color: "#9CA3AF" }}>{r.temple}</div>
                    </div>
                    <div className="text-xs w-20 text-right" style={{ color: "#9CA3AF" }}>{r.duration}</div>
                    <div className="text-xs w-24 text-right" style={{ color: "#6B7280", fontWeight: 600 }}>{r.views.toLocaleString()} views</div>
                    <div className="text-xs w-16 text-right" style={{ color: "#9CA3AF" }}>{r.size}</div>
                    <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {r.status === "Under Review" ? (
                        <>
                          <button onClick={() => approveRecording(r.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                            <CheckCircle size={11} /> Approve
                          </button>
                          <button onClick={() => rejectRecording(r.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
                            <XCircle size={11} /> Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="p-1.5 rounded-lg hover:bg-orange-100"><Eye size={13} style={{ color: "#C76A00" }} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100"><Download size={13} style={{ color: "#6B7280" }} /></button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── DELIVERIES ────────────────────────────────────────────────────────────────

const allDeliveries = [
  { id: "DEL-8421", devotee: "Rajesh Kumar", avatar: "RK", temple: "Tirumala Tirupati", pooja: "Sudarshana Homam", partner: "BlueDart", tracking: "BD7421928374", status: "Out for Delivery", eta: "Today by 8 PM", city: "Hyderabad" },
  { id: "DEL-8419", devotee: "Ankit Sharma", avatar: "AS", temple: "Kashi Vishwanath", pooja: "Rudrabhishek", partner: "FedEx", tracking: "FX2918374", status: "Out for Delivery", eta: "Today by 6 PM", city: "Delhi" },
  { id: "DEL-8420", devotee: "Priya Menon", avatar: "PM", temple: "Sabarimala Temple", pooja: "Abhishekam", partner: "DTDC", tracking: "DT9284712", status: "Dispatched", eta: "10 Jun 2026", city: "Kochi" },
  { id: "DEL-8413", devotee: "Meena Krishnan", avatar: "MK", temple: "Meenakshi Amman", pooja: "Archana", partner: "BlueDart", tracking: "BD5921837", status: "Dispatched", eta: "11 Jun 2026", city: "Bangalore" },
  { id: "DEL-8416", devotee: "Kavitha Iyer", avatar: "KI", temple: "Somnath Temple", pooja: "Maha Abhishek", partner: "FedEx", tracking: "FX7291038", status: "In Transit", eta: "09 Jun 2026", city: "Ahmedabad" },
  { id: "DEL-8414", devotee: "Deepak Joshi", avatar: "DJ", temple: "Dwarkadhish Temple", pooja: "Sahasranama", partner: "India Post", tracking: "IP7391028", status: "In Transit", eta: "12 Jun 2026", city: "Pune" },
  { id: "DEL-8415", devotee: "Ramesh Pillai", avatar: "RP", temple: "Padmanabhaswamy", pooja: "Navakabhishekam", partner: "DTDC", tracking: "DT8192874", status: "Pending Pickup", eta: "11 Jun 2026", city: "Trivandrum" },
  { id: "DEL-8412", devotee: "Sarla Gupta", avatar: "SG", temple: "Vaishno Devi", pooja: "Abhishek", partner: "BlueDart", tracking: "BD4821930", status: "Pending Pickup", eta: "13 Jun 2026", city: "Jaipur" },
  { id: "DEL-8418", devotee: "Sunita Reddy", avatar: "SR", temple: "Meenakshi Amman", pooja: "Sahasranama Archana", partner: "India Post", tracking: "IP2847192", status: "Delivered", eta: "Delivered 07 Jun", city: "Chennai" },
  { id: "DEL-8417", devotee: "Mohan Das", avatar: "MD", temple: "Shirdi Sai Baba", pooja: "Kakad Aarti", partner: "BlueDart", tracking: "BD6392810", status: "Delivered", eta: "Delivered 07 Jun", city: "Mumbai" },
  { id: "DEL-8411", devotee: "Narayanan V.", avatar: "NV", temple: "Kedarnath Temple", pooja: "Rudrabhishek", partner: "FedEx", tracking: "FX1029374", status: "Delivered", eta: "Delivered 06 Jun", city: "Madurai" },
  { id: "DEL-8410", devotee: "Narayanan V.", avatar: "NV", temple: "Dwarkadhish Temple", pooja: "Krishna Abhishek", partner: "BlueDart", tracking: "BD5182736", status: "Failed", eta: "Reattempt Today", city: "Ahmedabad" },
];

const kanbanCols = [
  { key: "Pending Pickup", label: "Pending Pickup", color: "#D97706", bg: "#FFFBEB", headerBg: "#FEF3C7", icon: Package, count: 2 },
  { key: "Dispatched", label: "Dispatched", color: "#7B3FA0", bg: "#F3E8FF", headerBg: "#EDE9FE", icon: Package, count: 2 },
  { key: "In Transit", label: "In Transit", color: "#C76A00", bg: "#FFF0E6", headerBg: "#FFEDD5", icon: Truck, count: 2 },
  { key: "Out for Delivery", label: "Out for Delivery", color: "#2563EB", bg: "#EFF6FF", headerBg: "#DBEAFE", icon: Truck, count: 2 },
  { key: "Delivered", label: "Delivered", color: "#16A34A", bg: "#F0FDF4", headerBg: "#DCFCE7", icon: CheckCircle, count: 3 },
  { key: "Failed", label: "Failed", color: "#DC2626", bg: "#FFF1F2", headerBg: "#FEE2E2", icon: XCircle, count: 1 },
];

const partnerColors: Record<string, string> = {
  BlueDart: "#0050A0",
  DTDC: "#E97B00",
  FedEx: "#4D148C",
  "India Post": "#CC0000",
};

export function DeliveriesPage() {
  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {kanbanCols.map(col => {
          const Icon = col.icon;
          return (
            <div key={col.key} className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: col.bg }}>
                <Icon size={14} style={{ color: col.color }} />
              </div>
              <div style={{ color: col.color, fontWeight: 700, fontSize: 20 }}>{col.count}</div>
              <div className="text-xs mt-0.5" style={{ color: "#9CA3AF", lineHeight: 1.3 }}>{col.label}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {kanbanCols.map(col => {
          const colItems = allDeliveries.filter(d => d.status === col.key);
          const Icon = col.icon;
          return (
            <div key={col.key} className="flex-shrink-0 w-64 flex flex-col gap-2">
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: col.headerBg }}>
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{ color: col.color }} />
                  <span style={{ color: col.color, fontWeight: 700, fontSize: 12 }}>{col.label}</span>
                </div>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: col.color, color: "#FFFFFF", fontWeight: 700 }}>{colItems.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {colItems.map(d => (
                  <div key={d.id} className="bg-white rounded-xl border p-3 hover:shadow-sm transition-shadow cursor-pointer" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: "#C76A00", fontSize: 10, fontWeight: 700 }}>
                        {d.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate" style={{ color: "#1F1F1F", fontWeight: 600 }}>{d.devotee}</div>
                        <div className="text-xs" style={{ color: "#9CA3AF" }}>{d.city}</div>
                      </div>
                    </div>
                    <div className="text-xs mb-1 truncate" style={{ color: "#C76A00", fontWeight: 500 }}>{d.pooja}</div>
                    <div className="text-xs mb-2.5" style={{ color: "#9CA3AF" }}>{d.temple}</div>
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                      <span className="text-xs font-mono" style={{ color: partnerColors[d.partner] || "#6B7280", fontWeight: 700 }}>{d.partner}</span>
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#9CA3AF" }}>
                        <Clock size={10} /> {d.eta.replace("Delivered ", "")}
                      </div>
                    </div>
                    <div className="mt-1.5 text-xs font-mono" style={{ color: "#D1D5DB" }}>{d.tracking}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── QUERIES ───────────────────────────────────────────────────────────────────

const queries = [
  {
    id: "QR-1284", devotee: "Rajesh Kumar", avatar: "RK", email: "rajesh@gmail.com", phone: "+91 98421 84210",
    subject: "Request to reschedule Rudrabhishek booking", category: "Booking", priority: "High",
    status: "Open", assigned: "Support Team A", created: "08 Jun · 9:42 AM",
    preview: "I need to reschedule my Rudrabhishek booking at Kashi Vishwanath from 15 Jun to 22 Jun due to travel plans.",
    thread: [
      { from: "Rajesh Kumar", time: "9:42 AM", text: "Hi, I would like to reschedule my Rudrabhishek booking (BK-2024-8284) from 15 Jun to 22 Jun. Is that possible?", isAdmin: false },
      { from: "Support Team A", time: "10:05 AM", text: "Hello Rajesh, thank you for reaching out. Let me check availability for 22 Jun at Kashi Vishwanath.", isAdmin: true },
      { from: "Support Team A", time: "10:18 AM", text: "Good news! We have slots available on 22 Jun. I will initiate the reschedule. You'll receive a confirmation within 30 minutes.", isAdmin: true },
    ],
  },
  {
    id: "QR-1283", devotee: "Priya Menon", avatar: "PM", email: "priya@gmail.com", phone: "+91 94472 28410",
    subject: "Prasad delivery not received after 10 days", category: "Delivery", priority: "High",
    status: "In Progress", assigned: "Logistics Team", created: "08 Jun · 8:30 AM",
    preview: "I placed my order 10 days ago and the prasad from Sabarimala has not arrived yet.",
    thread: [
      { from: "Priya Menon", time: "8:30 AM", text: "I placed order DEL-8240 on 29 May and still haven't received my prasad from Sabarimala. Tracking shows it's been stuck for 5 days.", isAdmin: false },
      { from: "Logistics Team", time: "9:15 AM", text: "We're sorry for the inconvenience. We're investigating with BlueDart. Can you please confirm your delivery address?", isAdmin: true },
    ],
  },
  {
    id: "QR-1282", devotee: "Sunita Reddy", avatar: "SR", email: "sunita@gmail.com", phone: "+91 99001 28410",
    subject: "Live stream video quality was very poor", category: "Technical", priority: "Medium",
    status: "In Progress", assigned: "Tech Support", created: "07 Jun · 4:15 PM",
    preview: "During the Sahasranama Archana live stream yesterday, the video kept buffering and the quality was 240p.",
    thread: [
      { from: "Sunita Reddy", time: "4:15 PM", text: "The live stream for Sahasranama Archana on 07 Jun was unwatchable. Very poor quality and buffering every 30 seconds.", isAdmin: false },
      { from: "Tech Support", time: "5:02 PM", text: "Thank you for the report, Sunita. We've logged a technical incident for that stream. Our team is reviewing server logs.", isAdmin: true },
    ],
  },
  {
    id: "QR-1281", devotee: "Mohan Das", avatar: "MD", email: "mohan@gmail.com", phone: "+91 97301 28401",
    subject: "Refund not processed after 7 days", category: "Payment", priority: "High",
    status: "Escalated", assigned: "Finance Team", created: "07 Jun · 2:00 PM",
    preview: "My refund of ₹800 for cancelled Kakad Aarti booking has not been credited back to my account.",
    thread: [
      { from: "Mohan Das", time: "2:00 PM", text: "I cancelled booking BK-2024-8417 on 01 Jun and was promised a 5-7 day refund. It's been 7 days now and nothing.", isAdmin: false },
      { from: "Finance Team", time: "3:30 PM", text: "This has been escalated to our payment gateway team. The refund reference is REF-2024-8417. Expected by 09 Jun.", isAdmin: true },
    ],
  },
  {
    id: "QR-1280", devotee: "Kavitha Iyer", avatar: "KI", email: "kavitha@gmail.com", phone: "+91 98001 82410",
    subject: "Unable to find preferred language options", category: "Platform", priority: "Low",
    status: "Resolved", assigned: "Product Team", created: "06 Jun · 11:30 AM",
    preview: "I prefer Tamil for the booking flow but the app keeps defaulting to English.",
    thread: [
      { from: "Kavitha Iyer", time: "11:30 AM", text: "The app keeps showing content in English. I changed my language preference to Tamil but it doesn't stick.", isAdmin: false },
      { from: "Product Team", time: "12:45 PM", text: "This is a known issue on iOS 17.4+. We've released a fix in v2.4.1. Please update your app and let us know!", isAdmin: true },
      { from: "Kavitha Iyer", time: "1:10 PM", text: "Updated the app and it's working perfectly now. Thank you!", isAdmin: false },
    ],
  },
  {
    id: "QR-1279", devotee: "Deepak Joshi", avatar: "DJ", email: "deepak@gmail.com", phone: "+91 93001 82410",
    subject: "Priest didn't perform the correct ritual variant", category: "Service Quality", priority: "High",
    status: "Open", assigned: "Unassigned", created: "06 Jun · 9:00 AM",
    preview: "I booked the Laghu Rudrabhishek variant but the priest performed the standard version instead.",
    thread: [
      { from: "Deepak Joshi", time: "9:00 AM", text: "I specifically booked Laghu Rudrabhishek with Pandit Chandrashekhar at Kashi Vishwanath, but he performed the basic Abhishek instead. I feel cheated.", isAdmin: false },
    ],
  },
  {
    id: "QR-1278", devotee: "Sarla Gupta", avatar: "SG", email: "sarla@gmail.com", phone: "+91 90001 82410",
    subject: "How to book for multiple family members?", category: "General", priority: "Low",
    status: "Resolved", assigned: "Support Team B", created: "05 Jun · 3:45 PM",
    preview: "Is it possible to book the same pooja for multiple family members in a single transaction?",
    thread: [
      { from: "Sarla Gupta", time: "3:45 PM", text: "Can I book Sahasranama Archana for myself and my husband in one booking, or do I need two separate bookings?", isAdmin: false },
      { from: "Support Team B", time: "4:30 PM", text: "Yes! You can add multiple devotee names in the 'Devotee Names' field during booking. No need for separate bookings.", isAdmin: true },
      { from: "Sarla Gupta", time: "4:42 PM", text: "That's great, thank you!", isAdmin: false },
    ],
  },
];

const qPriorityCfg: Record<string, { bg: string; color: string; dot: string }> = {
  High: { bg: "#FFF1F2", color: "#DC2626", dot: "#EF4444" },
  Medium: { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  Low: { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
};
const qStatusCfg: Record<string, { bg: string; color: string }> = {
  Open: { bg: "#EFF6FF", color: "#2563EB" },
  "In Progress": { bg: "#FFF0E6", color: "#C76A00" },
  Escalated: { bg: "#FFF1F2", color: "#DC2626" },
  Resolved: { bg: "#F0FDF4", color: "#16A34A" },
};

export function QueriesPage() {
  const [selected, setSelected] = useState(queries[0].id);
  const [statusFilter, setStatusFilter] = useState("All");
  const [reply, setReply] = useState("");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const activeQuery = queries.find(q => q.id === selected) || queries[0];
  const filtered = statusFilter === "All" ? queries : queries.filter(q => q.status === statusFilter);

  const statusDot: Record<string, string> = {
    Open: "#3B82F6",
    "In Progress": "#C76A00",
    Escalated: "#EF4444",
    Resolved: "#22C55E",
  };

  function selectQuery(id: string) {
    setSelected(id);
    setMobilePanelOpen(true);
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 560 }}>
      {/* Minimal top bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 gap-2">
        <div className="flex items-center gap-0.5 p-1 rounded-lg overflow-x-auto" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(199,106,0,0.12)" }}>
          {["All", "Open", "In Progress", "Escalated", "Resolved"].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className="px-2.5 py-1.5 rounded-md text-xs transition-all whitespace-nowrap"
              style={{
                backgroundColor: statusFilter === f ? "#FAF6F2" : "transparent",
                color: statusFilter === f ? "#C76A00" : "#9CA3AF",
                fontWeight: statusFilter === f ? 600 : 400,
              }}>
              {f}
              {f !== "All" && (
                <span className="ml-1 text-xs" style={{ color: statusFilter === f ? "#C76A00" : "#D1D5DB" }}>
                  {queries.filter(q => q.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: "#9CA3AF" }}>{filtered.length}</span>
      </div>

      {/* Split pane */}
      <div className="flex gap-4 flex-1 min-h-0" style={{ height: "calc(100vh - 200px)", minHeight: 480 }}>

        {/* Left — compact list (hidden on mobile when thread is open) */}
        <div className={`${mobilePanelOpen ? "hidden" : "flex"} md:flex w-full md:w-72 flex-shrink-0 flex-col bg-white rounded-2xl border overflow-hidden`} style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
            {filtered.map(q => {
              const isActive = q.id === selected;
              return (
                <button key={q.id} onClick={() => selectQuery(q.id)}
                  className="w-full text-left px-4 py-3.5 transition-colors relative"
                  style={{ backgroundColor: isActive ? "#FFF8F0" : "transparent", minHeight: "44px" }}>
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r" style={{ backgroundColor: "#C76A00" }} />
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusDot[q.status] }} />
                    <span className="text-xs truncate flex-1" style={{ color: "#1F1F1F", fontWeight: isActive ? 600 : 500 }}>{q.devotee}</span>
                    <span className="text-xs flex-shrink-0" style={{ color: "#C4C9D4" }}>{q.created.split("·")[1]?.trim()}</span>
                  </div>
                  <div className="pl-4 text-xs line-clamp-2" style={{ color: isActive ? "#374151" : "#9CA3AF", lineHeight: 1.5 }}>
                    {q.subject}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — thread (hidden on mobile when list is shown) */}
        <div className={`${mobilePanelOpen ? "flex" : "hidden"} md:flex flex-1 flex-col bg-white rounded-2xl border overflow-hidden min-w-0`} style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          {/* Header */}
          <div className="px-4 md:px-6 py-3 md:py-4 border-b flex items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
            {/* Mobile back button */}
            <button
              onClick={() => setMobilePanelOpen(false)}
              className="md:hidden flex items-center gap-1 text-xs flex-shrink-0 py-1 pr-2"
              style={{ color: "#C76A00", fontWeight: 600 }}
            >
              <ArrowLeft size={13} /> Back
            </button>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusDot[activeQuery.status] }} />
            <div className="flex-1 min-w-0">
              <span className="text-sm line-clamp-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>{activeQuery.subject}</span>
            </div>
            <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: "#9CA3AF" }}>{activeQuery.category} · {activeQuery.assigned}</span>
            {activeQuery.status !== "Resolved" && (
              <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600, minHeight: "36px" }}>
                <CheckCircle size={11} /> Resolve
              </button>
            )}
          </div>

          {/* Thread messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-5">
            {activeQuery.thread.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.isAdmin ? "flex-row-reverse" : ""}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: msg.isAdmin ? "#4A1259" : "#C76A00", fontSize: 9, fontWeight: 700 }}>
                  {msg.isAdmin ? "A" : activeQuery.avatar}
                </div>
                <div className={`max-w-xs sm:max-w-xl flex flex-col ${msg.isAdmin ? "items-end" : "items-start"}`}>
                  <span className="text-xs mb-1" style={{ color: "#C4C9D4" }}>{msg.time}</span>
                  <div className="px-4 py-3 text-sm"
                    style={{
                      backgroundColor: msg.isAdmin ? "#F5F0FC" : "#FAF6F2",
                      color: "#374151",
                      lineHeight: 1.65,
                      borderRadius: msg.isAdmin ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply bar */}
          <div className="px-4 md:px-6 pb-4 md:pb-5 pt-3 border-t flex-shrink-0" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
            <div className="flex items-end gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)" }}>
              <textarea
                rows={2}
                placeholder="Reply to this query…"
                value={reply}
                onChange={e => setReply(e.target.value)}
                className="flex-1 text-sm outline-none resize-none bg-transparent"
                style={{ color: "#1F1F1F" }}
              />
              <button
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs transition-all"
                style={{ backgroundColor: reply.trim() ? "#C76A00" : "rgba(199,106,0,0.12)", color: reply.trim() ? "#FFFFFF" : "#C76A00", fontWeight: 600, minHeight: "44px" }}>
                <Send size={11} /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLE REQUESTS ───────────────────────────────────────────────────────────

const templeRequests = [
  { id: "TR-284", name: "Sri Ranganathaswamy Temple", location: "Srirangam, Tamil Nadu", deity: "Lord Vishnu", type: "Vaishnava", contact: "Arumugam Pillai", phone: "+91 98421 84210", submitted: "07 Jun 2026", status: "Pending Review", docs: "Complete" },
  { id: "TR-283", name: "Kamakshi Amman Temple", location: "Kanchipuram, Tamil Nadu", deity: "Goddess Kamakshi", type: "Shakta", contact: "Subramania Iyer", phone: "+91 98432 12840", submitted: "06 Jun 2026", status: "Under Verification", docs: "Incomplete" },
  { id: "TR-282", name: "Siddhivinayak Temple", location: "Mumbai, Maharashtra", deity: "Lord Ganesha", type: "Shaiva", contact: "Mahesh Kale", phone: "+91 98201 84210", submitted: "05 Jun 2026", status: "Pending Review", docs: "Complete" },
  { id: "TR-281", name: "Hazur Sahib Gurdwara", location: "Nanded, Maharashtra", deity: "Guru Granth Sahib", type: "Multi-faith", contact: "Gurpreet Singh", phone: "+91 97302 18421", submitted: "04 Jun 2026", status: "Approved", docs: "Complete" },
  { id: "TR-280", name: "Brihadeeswara Temple", location: "Thanjavur, Tamil Nadu", deity: "Lord Shiva", type: "Shaiva", contact: "Natarajan K.", phone: "+91 94428 18420", submitted: "03 Jun 2026", status: "Rejected", docs: "Incomplete" },
];

const trStatusCfg: Record<string, { bg: string; color: string }> = {
  "Pending Review": { bg: "#FFFBEB", color: "#D97706" },
  "Under Verification": { bg: "#EFF6FF", color: "#2563EB" },
  Approved: { bg: "#F0FDF4", color: "#16A34A" },
  Rejected: { bg: "#FFF1F2", color: "#DC2626" },
};

export function TempleRequestsPage() {
  const [requests, setRequests] = useState(templeRequests);

  function updateStatus(id: string, status: string) {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  const pending = requests.filter(r => r.status === "Pending Review").length;
  const verifying = requests.filter(r => r.status === "Under Verification").length;
  const approved = requests.filter(r => r.status === "Approved").length;
  const rejected = requests.filter(r => r.status === "Rejected").length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Review", value: String(pending), color: "#D97706", bg: "#FFFBEB" },
          { label: "Under Verification", value: String(verifying), color: "#2563EB", bg: "#EFF6FF" },
          { label: "Approved", value: String(approved), color: "#22C55E", bg: "#F0FDF4" },
          { label: "Rejected", value: String(rejected), color: "#EF4444", bg: "#FFF1F2" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Temple Onboarding Requests</h3>
          <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Review, verify and approve temple onboarding submissions</p>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {requests.map(r => {
            const sc = trStatusCfg[r.status] || trStatusCfg["Pending Review"];
            return (
              <div key={r.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#FFF0E6" }}>
                      <Building2 size={16} style={{ color: "#C76A00" }} />
                    </div>
                    <div>
                      <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.name}</div>
                      <div className="text-xs" style={{ color: "#9CA3AF" }}>{r.location}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>{r.type}</span>
                  <span className="text-xs" style={{ color: "#6B7280" }}>{r.deity}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: r.docs === "Complete" ? "#F0FDF4" : "#FFF1F2", color: r.docs === "Complete" ? "#16A34A" : "#DC2626", fontWeight: 600 }}>{r.docs} Docs</span>
                </div>
                <div className="text-xs" style={{ color: "#6B7280" }}>{r.contact} · {r.submitted}</div>
                {(r.status === "Pending Review" || r.status === "Under Verification") && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => updateStatus(r.id, "Approved")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button onClick={() => updateStatus(r.id, "Rejected")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
                {r.status === "Approved" && <div className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>✓ Approved</div>}
                {r.status === "Rejected" && <div className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>✗ Rejected</div>}
              </div>
            );
          })}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#FAF6F2" }}>
                {["ID", "Temple Name", "Location", "Deity", "Type", "Contact", "Submitted", "Docs", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => {
                const sc = trStatusCfg[r.status] || trStatusCfg["Pending Review"];
                return (
                  <tr key={r.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-4 py-3.5 text-xs font-mono" style={{ color: "#C76A00", fontWeight: 600 }}>{r.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#FFF0E6" }}>
                          <Building2 size={14} style={{ color: "#C76A00" }} />
                        </div>
                        <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#6B7280" }}>{r.location}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#6B7280" }}>{r.deity}</td>
                    <td className="px-4 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>{r.type}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs" style={{ color: "#1F1F1F" }}>{r.contact}</div>
                      <div className="text-xs" style={{ color: "#9CA3AF" }}>{r.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "#9CA3AF" }}>{r.submitted}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: r.docs === "Complete" ? "#F0FDF4" : "#FFF1F2", color: r.docs === "Complete" ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                        {r.docs}
                      </span>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        <button className="p-1.5 rounded-lg hover:bg-orange-50" title="View"><Eye size={13} style={{ color: "#C76A00" }} /></button>
                        {(r.status === "Pending Review" || r.status === "Under Verification") && (
                          <>
                            <button onClick={() => updateStatus(r.id, "Approved")} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-green-50 transition-colors" style={{ color: "#16A34A", fontWeight: 600 }}>
                              <CheckCircle2 size={12} /> Approve
                            </button>
                            <button onClick={() => updateStatus(r.id, "Rejected")} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-red-50 transition-colors" style={{ color: "#DC2626", fontWeight: 600 }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {r.status === "Approved" && <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#16A34A", backgroundColor: "#F0FDF4", fontWeight: 600 }}>✓ Approved</span>}
                        {r.status === "Rejected" && <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#DC2626", backgroundColor: "#FFF1F2", fontWeight: 600 }}>✗ Rejected</span>}
                      </div>
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

// ─── PRO MANAGERS ──────────────────────────────────────────────────────────────

const proManagers = [
  { id: "PRO001", name: "Ravi Shankar K.", avatar: "RS", temples: 4, location: "Tirupati, AP", email: "ravi@devaseva.com", phone: "+91 98421 84210", revenue: "₹28.4L", bookings: 4820, rating: 4.9, status: "Active", since: "Jan 2024", color: "#C76A00" },
  { id: "PRO002", name: "Suresh Menon", avatar: "SM", temples: 3, location: "Kochi, Kerala", email: "suresh@devaseva.com", phone: "+91 98432 18240", revenue: "₹22.1L", bookings: 3960, rating: 4.8, status: "Active", since: "Feb 2024", color: "#4A1259" },
  { id: "PRO003", name: "Priya Joshi", avatar: "PJ", temples: 2, location: "Nashik, MH", email: "priya@devaseva.com", phone: "+91 97302 84210", revenue: "₹19.5L", bookings: 3540, rating: 4.7, status: "Active", since: "Mar 2024", color: "#D4A017" },
  { id: "PRO004", name: "Amit Sharma", avatar: "AS", temples: 5, location: "Jammu, J&K", email: "amit@devaseva.com", phone: "+91 94428 18420", revenue: "₹17.2L", bookings: 2980, rating: 4.8, status: "Active", since: "Apr 2024", color: "#22C55E" },
  { id: "PRO005", name: "Rajeev Nair", avatar: "RN", temples: 2, location: "Dehradun, UK", email: "rajeev@devaseva.com", phone: "+91 98201 84210", revenue: "₹15.8L", bookings: 2640, rating: 4.9, status: "Active", since: "May 2024", color: "#6366F1" },
  { id: "PRO006", name: "Deepak Patel", avatar: "DP", temples: 3, location: "Veraval, GJ", email: "deepak@devaseva.com", phone: "+91 97421 84210", revenue: "₹13.1L", bookings: 2180, rating: 4.6, status: "Active", since: "Jun 2024", color: "#EF4444" },
];

const proColors = ["#C76A00", "#4A1259", "#D4A017", "#22C55E", "#6366F1", "#EF4444", "#2563EB", "#0891B2"];

export function PROManagersPage() {
  const [managers, setManagers] = useState(proManagers);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", email: "", phone: "", temples: "1" });

  const filtered = managers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.location.toLowerCase().includes(search.toLowerCase()));

  function handleAdd() {
    if (!form.name || !form.location || !form.email) return;
    const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const newMgr = {
      id: `PRO${String(managers.length + 1).padStart(3, "0")}`,
      name: form.name, avatar: initials, temples: parseInt(form.temples) || 1,
      location: form.location, email: form.email, phone: form.phone,
      revenue: "₹0", bookings: 0, rating: 5.0, status: "Active", since: "Jun 2026",
      color: proColors[managers.length % proColors.length],
    };
    setManagers(prev => [...prev, newMgr]);
    setForm({ name: "", location: "", email: "", phone: "", temples: "1" });
    setAddOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total PRO Managers", value: String(managers.length), color: "#C76A00", bg: "#FFF0E6" },
          { label: "Active", value: String(managers.filter(m => m.status === "Active").length), color: "#22C55E", bg: "#F0FDF4" },
          { label: "Avg Temples Managed", value: "3.4", color: "#4A1259", bg: "#F3E8FF" },
          { label: "Avg Revenue", value: "₹14.2L", color: "#D4A017", bg: "#FFFBEB" },
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
          <input type="text" placeholder="Search PRO managers..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }} />
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
          <Plus size={15} /> Add PRO Manager
        </button>
      </div>
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
                <button className="flex items-center justify-center px-3 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#F3EDE8", color: "#6B7280" }}><Edit size={11} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add PRO Manager">
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
        <ModalFooter onClose={() => setAddOpen(false)} onSubmit={handleAdd} submitLabel="Add Manager" />
      </Modal>
    </div>
  );
}

// ─── POOJAS ────────────────────────────────────────────────────────────────────

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

// ─── CATEGORIES ────────────────────────────────────────────────────────────────

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

// ─── LANGUAGES ─────────────────────────────────────────────────────────────────

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

// ─── REFUNDS ───────────────────────────────────────────────────────────────────

const refunds = [
  { id: "RF-1284", devotee: "Deepak Joshi", booking: "BK-2024-8414", temple: "Vaishno Devi", pooja: "Vishnu Sahasranamam", amount: "₹1,600", reason: "Service cancelled by temple", method: "UPI", status: "Approved", requested: "06 Jun 2026", processed: "08 Jun 2026" },
  { id: "RF-1283", devotee: "Mohan Das", booking: "BK-2024-8417", temple: "Shirdi Sai Baba", pooja: "Kakad Aarti", amount: "₹800", reason: "Devotee requested cancellation (24h notice)", method: "Card", status: "Approved", requested: "07 Jun 2026", processed: "08 Jun 2026" },
  { id: "RF-1282", devotee: "Ramesh Pillai", booking: "BK-2024-8231", temple: "Padmanabhaswamy", pooja: "Navakabhishekam", amount: "₹5,200", reason: "Technical issue — stream failed", method: "NetBanking", status: "Pending", requested: "07 Jun 2026", processed: "—" },
  { id: "RF-1281", devotee: "Ankit Sharma", booking: "BK-2024-8109", temple: "Kashi Vishwanath", pooja: "Rudrabhishek", amount: "₹3,200", reason: "Priest not available, service rescheduled", method: "UPI", status: "Pending", requested: "06 Jun 2026", processed: "—" },
  { id: "RF-1280", devotee: "Priya Nair", booking: "BK-2024-7984", temple: "Sabarimala Temple", pooja: "Abhishekam", amount: "₹1,800", reason: "Dispute — prasad not delivered", method: "Card", status: "Under Review", requested: "05 Jun 2026", processed: "—" },
  { id: "RF-1279", devotee: "Kavitha Iyer", booking: "BK-2024-7842", temple: "Meenakshi Amman", pooja: "Archana", amount: "₹1,200", reason: "Fraudulent transaction", method: "UPI", status: "Rejected", requested: "04 Jun 2026", processed: "06 Jun 2026" },
];

const rfStatusCfg: Record<string, { bg: string; color: string }> = {
  Approved: { bg: "#F0FDF4", color: "#16A34A" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  "Under Review": { bg: "#EFF6FF", color: "#2563EB" },
  Rejected: { bg: "#FFF1F2", color: "#DC2626" },
};

export function RefundsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [refundsState, setRefundsState] = useState(refunds);

  function updateRefundStatus(id: string, status: string) {
    setRefundsState(prev => prev.map(r => r.id === id ? { ...r, status, processed: status === "Approved" || status === "Rejected" ? "08 Jun 2026" : r.processed } : r));
  }

  const filtered = refundsState.filter(r => statusFilter === "All" || r.status === statusFilter);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Approval", value: String(refundsState.filter(r => r.status === "Pending" || r.status === "Under Review").length), color: "#D97706", bg: "#FFFBEB" },
          { label: "Approved This Month", value: String(refundsState.filter(r => r.status === "Approved").length), color: "#22C55E", bg: "#F0FDF4" },
          { label: "Total Refund Value", value: "₹2.8L", color: "#EF4444", bg: "#FFF1F2" },
          { label: "Avg Processing Time", value: "1.4 days", color: "#4A1259", bg: "#F3E8FF" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {["All", "Pending", "Under Review", "Approved", "Rejected"].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: statusFilter === f ? "#C76A00" : "#FAF6F2", color: statusFilter === f ? "#FFFFFF" : "#6B7280", fontWeight: statusFilter === f ? 600 : 400, border: "1px solid", borderColor: statusFilter === f ? "#C76A00" : "rgba(199,106,0,0.15)" }}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {filtered.map(r => {
            const sc = rfStatusCfg[r.status];
            return (
              <div key={r.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono" style={{ color: "#C76A00", fontWeight: 700 }}>{r.id}</span>
                    <div className="text-sm mt-0.5" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.devotee}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span>
                </div>
                <div className="text-xs" style={{ color: "#6B7280" }}>{r.temple} · {r.pooja}</div>
                <div className="text-xs" style={{ color: "#9CA3AF" }}>{r.reason}</div>
                <div className="flex items-center justify-between">
                  <span className="text-base" style={{ color: "#EF4444", fontWeight: 700 }}>{r.amount}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>{r.method}</span>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>{r.requested}</span>
                  </div>
                </div>
                {(r.status === "Pending" || r.status === "Under Review") && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => updateRefundStatus(r.id, "Approved")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button onClick={() => updateRefundStatus(r.id, "Rejected")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
                {r.status === "Approved" && <div className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>✓ Approved</div>}
                {r.status === "Rejected" && <div className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>✗ Rejected</div>}
              </div>
            );
          })}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#FAF6F2" }}>
                {["Refund ID", "Devotee", "Temple / Pooja", "Amount", "Reason", "Method", "Requested", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const sc = rfStatusCfg[r.status];
                return (
                  <tr key={r.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-4 py-3.5 text-xs font-mono" style={{ color: "#C76A00", fontWeight: 600 }}>{r.id}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{r.devotee}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{r.temple}</div>
                      <div className="text-xs" style={{ color: "#9CA3AF" }}>{r.pooja}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#EF4444", fontWeight: 700 }}>{r.amount}</td>
                    <td className="px-4 py-3.5 text-xs max-w-40" style={{ color: "#6B7280" }}>{r.reason}</td>
                    <td className="px-4 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>{r.method}</span></td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "#9CA3AF" }}>{r.requested}</td>
                    <td className="px-4 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5 items-center">
                        {(r.status === "Pending" || r.status === "Under Review") && (
                          <>
                            <button onClick={() => updateRefundStatus(r.id, "Approved")} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-green-50 transition-colors" style={{ color: "#16A34A", fontWeight: 600 }}>
                              <CheckCircle2 size={12} /> Approve
                            </button>
                            <button onClick={() => updateRefundStatus(r.id, "Rejected")} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-red-50 transition-colors" style={{ color: "#DC2626", fontWeight: 600 }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {r.status === "Approved" && <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#16A34A", backgroundColor: "#F0FDF4", fontWeight: 600 }}>✓ Approved</span>}
                        {r.status === "Rejected" && <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#DC2626", backgroundColor: "#FFF1F2", fontWeight: 600 }}>✗ Rejected</span>}
                        <button className="p-1.5 rounded-lg hover:bg-orange-50"><Eye size={13} style={{ color: "#C76A00" }} /></button>
                      </div>
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

// ─── REVENUE ANALYTICS ─────────────────────────────────────────────────────────

const monthlyRev = [
  { month: "Jan", revenue: 4800000, commission: 480000, net: 4320000 },
  { month: "Feb", revenue: 5600000, commission: 560000, net: 5040000 },
  { month: "Mar", revenue: 6400000, commission: 640000, net: 5760000 },
  { month: "Apr", revenue: 5900000, commission: 590000, net: 5310000 },
  { month: "May", revenue: 7800000, commission: 780000, net: 7020000 },
  { month: "Jun", revenue: 9200000, commission: 920000, net: 8280000 },
];

const revenueByType = [
  { name: "Pooja Bookings", value: 68, color: "#C76A00" },
  { name: "Festival Packages", value: 18, color: "#D4A017" },
  { name: "Live Stream Premium", value: 8, color: "#4A1259" },
  { name: "Prasad Delivery", value: 6, color: "#22C55E" },
];

function fCr(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  return `₹${(v / 100000).toFixed(1)}L`;
}

export function RevenuePage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Gross Revenue (YTD)", value: "₹39.7L", change: "+31%", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Platform Commission", value: "₹3.97L", change: "+31%", color: "#4A1259", bg: "#F3E8FF" },
          { label: "Net Payouts to Temples", value: "₹35.7L", change: "+31%", color: "#22C55E", bg: "#F0FDF4" },
          { label: "Projected Annual", value: "₹1.2Cr", change: "+28%", color: "#D4A017", bg: "#FFFBEB" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>{s.change}</span>
            </div>
            <div className="text-xs" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Revenue Breakdown</h3>
          <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>Gross revenue, commission, and net payouts by month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRev} barCategoryGap="25%">
              <CartesianGrid key="rev-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis key="rev-x" dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="rev-y" tickFormatter={fCr} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip key="rev-tooltip" formatter={(v: number) => fCr(v)} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar key="rev-bar-gross" dataKey="revenue" name="Gross Revenue" fill="#C76A00" radius={[4, 4, 0, 0]} />
              <Bar key="rev-bar-net" dataKey="net" name="Net Payout" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar key="rev-bar-comm" dataKey="commission" name="Commission" fill="#D4A017" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Revenue by Type</h3>
          <p className="mb-3" style={{ color: "#9CA3AF", fontSize: "12px" }}>Share of total platform revenue</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie key="rev-pie" data={revenueByType} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={2}>
                {revenueByType.map(e => <Cell key={`rev-cell-${e.name}`} fill={e.color} />)}
              </Pie>
              <Tooltip key="rev-pie-tooltip" formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {revenueByType.map(t => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span style={{ color: "#6B7280" }}>{t.name}</span>
                </div>
                <span style={{ color: "#1F1F1F", fontWeight: 600 }}>{t.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Monthly Revenue Summary</h3>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {monthlyRev.map((r, i) => {
            const prev = monthlyRev[i - 1];
            const growth = prev ? (((r.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : null;
            const up = prev ? r.revenue >= prev.revenue : true;
            return (
              <div key={r.month} className="px-4 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.month} 2026</div>
                  <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Net: <span style={{ color: "#22C55E", fontWeight: 600 }}>{fCr(r.net)}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ color: "#C76A00", fontWeight: 700 }}>{fCr(r.revenue)}</div>
                  {growth ? (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: up ? "#F0FDF4" : "#FFF1F2", color: up ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                      {up ? "▲" : "▼"} {Math.abs(Number(growth))}%
                    </span>
                  ) : <span className="text-xs" style={{ color: "#9CA3AF" }}>—</span>}
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
                {["Month", "Gross Revenue", "Platform Commission (10%)", "Net Payout to Temples", "MoM Growth"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyRev.map((r, i) => {
                const prev = monthlyRev[i - 1];
                const growth = prev ? (((r.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : "—";
                const up = prev ? r.revenue >= prev.revenue : true;
                return (
                  <tr key={r.month} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.month} 2026</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#C76A00", fontWeight: 700 }}>{fCr(r.revenue)}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#D4A017", fontWeight: 600 }}>{fCr(r.commission)}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#22C55E", fontWeight: 700 }}>{fCr(r.net)}</td>
                    <td className="px-5 py-3.5">
                      {prev ? (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: up ? "#F0FDF4" : "#FFF1F2", color: up ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                          {up ? "▲" : "▼"} {Math.abs(Number(growth))}%
                        </span>
                      ) : <span className="text-xs" style={{ color: "#9CA3AF" }}>—</span>}
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
