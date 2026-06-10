import { useState, useEffect } from "react";
import {
  Building2, Search, Plus, Filter, MapPin, Star, CalendarCheck,
  IndianRupee, Radio, MoreVertical, UserCircle, Edit, PowerOff,
  TrendingUp, Eye, CheckCircle, AlertCircle, XCircle
} from "lucide-react";
import { Modal, Field, ModalFooter, inputCls, inputStyle, selectStyle } from "../Modal";
import { db } from "../../../lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, query, where } from "firebase/firestore";
import type { Temple } from "@devaseva/core";

const statusConfig: Record<string, { bg: string; color: string; icon: typeof CheckCircle }> = {
  Active: { bg: "#F0FDF4", color: "#16A34A", icon: CheckCircle },
  Seasonal: { bg: "#FFFBEB", color: "#D97706", icon: AlertCircle },
  "Pending Review": { bg: "#EFF6FF", color: "#2563EB", icon: AlertCircle },
  Inactive: { bg: "#FFF1F2", color: "#DC2626", icon: XCircle },
};

const templeProManagers = ["Ravi Shankar K.", "Suresh Menon", "Priya Joshi", "Amit Sharma", "Rajeev Nair", "Deepak Patel", "Sanjay Tiwari", "Kavitha Selvan", "Unassigned"];
const emptyTempleForm = { name: "", location: "", deity: "", type: "Shaiva", pro: "Unassigned", status: "Active" };

// Extended UI type to preserve existing UI without changing @devaseva/core
type UITemple = Temple & { 
  bookings: number; 
  revenue: string; 
  rating: number; 
  poojas: number; 
  streams: number; 
  status: string; 
  pro: string; 
  color: string; 
  type: string; 
  since: string; 
  devotees: number; 
};

export function Temples() {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editTarget, setEditTarget] = useState<UITemple | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [templeForm, setTempleForm] = useState(emptyTempleForm);
  const [temples, setTemples] = useState<UITemple[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemples = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "temples"), where("isDeleted", "==", false));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name || "",
          description: d.description || "",
          location: d.location || "",
          city: d.city || "",
          state: d.state || "",
          deity: d.deity || "",
          isActive: d.isActive ?? true,
          createdAt: d.createdAt?.toDate?.() || new Date(),
          updatedAt: d.updatedAt?.toDate?.() || new Date(),
          isDeleted: d.isDeleted || false,
          
          // UI specific mocks/aggregations for V1
          bookings: d.bookings || Math.floor(Math.random() * 5000),
          revenue: d.revenue || "₹0L",
          rating: d.rating || 4.5,
          poojas: d.poojas || 0,
          streams: d.streams || 0,
          status: d.status || (d.isActive ? "Active" : "Inactive"),
          pro: d.pro || "Unassigned",
          color: d.color || "#C76A00",
          type: d.type || "Shaiva",
          since: d.since || "Jan 2026",
          devotees: d.devotees || Math.floor(Math.random() * 100000),
        } as UITemple;
      });
      setTemples(data);
    } catch (err) {
      console.error("Failed to fetch temples", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples();
  }, []);

  function openTempleEdit(t: UITemple) {
    setEditTarget(t);
    setTempleForm({ name: t.name, location: t.location, deity: t.deity, type: t.type, pro: t.pro, status: t.status });
  }

  function openTempleAdd() {
    setIsAdding(true);
    setTempleForm(emptyTempleForm);
  }

  async function handleSaveTemple() {
    try {
      const dataToSave = {
        name: templeForm.name,
        location: templeForm.location,
        deity: templeForm.deity,
        type: templeForm.type,
        pro: templeForm.pro,
        status: templeForm.status,
        isActive: templeForm.status === "Active",
        updatedAt: serverTimestamp(),
      };

      if (editTarget) {
        await updateDoc(doc(db, "temples", editTarget.id), dataToSave);
      } else {
        await addDoc(collection(db, "temples"), {
          ...dataToSave,
          description: "",
          city: "",
          state: "",
          isDeleted: false,
          createdAt: serverTimestamp(),
        });
      }
      
      setEditTarget(null);
      setIsAdding(false);
      setTempleForm(emptyTempleForm);
      fetchTemples();
    } catch (error) {
      console.error("Error saving temple:", error);
    }
  }

  async function handleDeleteTemple(t: UITemple) {
    if (confirm(`Are you sure you want to deactivate/delete ${t.name}?`)) {
      try {
        await updateDoc(doc(db, "temples", t.id), {
          isDeleted: true,
          isActive: false,
          deletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        fetchTemples();
      } catch (e) {
        console.error("Error deleting temple", e);
      }
    }
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
          { label: "Total Temples", value: temples.length, icon: Building2, color: "#C76A00", bg: "#FFF0E6" },
          { label: "Active Temples", value: temples.filter(t => t.isActive).length, icon: CheckCircle, color: "#22C55E", bg: "#F0FDF4" },
          { label: "Avg Rating", value: "4.78 ★", icon: Star, color: "#D4A017", bg: "#FFFBEB" },
          { label: "Pending Requests", value: temples.filter(t => t.status === "Pending Review").length, icon: AlertCircle, color: "#F59E0B", bg: "#FFFBEB" },
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
            onClick={openTempleAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
            style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}
          >
            <Plus size={15} />
            Add Temple
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10 text-gray-500">Loading Temples...</div>
      ) : (
        <>
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
                        <button onClick={() => handleDeleteTemple(temple)} className="flex items-center justify-center py-1.5 px-2.5 rounded-lg text-xs transition-colors"
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
                          <td className="px-5 py-3.5 text-xs" style={{ color: "#9CA3AF", fontFamily: "monospace" }}>{t.id.slice(0, 8)}...</td>
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
                              <button onClick={() => handleDeleteTemple(t)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><PowerOff size={13} style={{ color: "#EF4444" }} /></button>
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
        </>
      )}

      {/* Edit Temple Modal */}
      <Modal
        open={!!editTarget || isAdding}
        onClose={() => { setEditTarget(null); setIsAdding(false); setTempleForm(emptyTempleForm); }}
        title={editTarget ? `Edit Temple — ${editTarget.id.slice(0, 8)}` : "Add Temple"}
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
          onClose={() => { setEditTarget(null); setIsAdding(false); setTempleForm(emptyTempleForm); }}
          onSubmit={handleSaveTemple}
          submitLabel="Save Changes"
        />
      </Modal>
    </div>
  );
}
