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

