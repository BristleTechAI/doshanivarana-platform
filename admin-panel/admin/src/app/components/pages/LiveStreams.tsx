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

