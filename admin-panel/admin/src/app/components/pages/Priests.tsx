import { useState, useEffect } from "react";
import { Search, Plus, Star, CalendarCheck, Building2, UserCircle, Edit, PowerOff, Eye, Filter, RefreshCcw } from "lucide-react";
import { Modal, Field, ModalFooter, inputCls, inputStyle, selectStyle } from "../Modal";

const priestsData = [
  { id: "PR001", name: "Pandit Ramesh Sharma", photo: "RS", experience: "22 yrs", temple: "Kashi Vishwanath", location: "Varanasi, UP", specialization: "Vedic Rituals, Rudrabhishek", bookings: 1840, rating: 4.9, status: "Active", color: "#C76A00", languages: ["Sanskrit", "Hindi"], since: "Jan 2024" },
  { id: "PR002", name: "Swami Krishnananda", photo: "SK", experience: "18 yrs", temple: "Tirumala Tirupati", location: "Tirupati, AP", specialization: "Vaishnava Pujas, Sahasranama", bookings: 1620, rating: 4.8, status: "Active", color: "#4A1259", languages: ["Telugu", "Sanskrit"], since: "Feb 2024" },
  { id: "PR003", name: "Acharya Venkatesh Iyer", photo: "VI", experience: "25 yrs", temple: "Meenakshi Amman", location: "Madurai, TN", specialization: "Shaiva Agama, Festival Poojas", bookings: 1480, rating: 4.9, status: "Active", color: "#D4A017", languages: ["Tamil", "Sanskrit"], since: "Mar 2024" },
  { id: "PR004", name: "Pandit Gopal Das", photo: "GD", experience: "15 yrs", temple: "Dwarkadhish Temple", location: "Dwarka, Gujarat", specialization: "Krishna Bhakti, Bhagavatam", bookings: 1280, rating: 4.7, status: "Active", color: "#22C55E", languages: ["Gujarati", "Sanskrit"], since: "Apr 2024" },
  { id: "PR005", name: "Shastri Narayanan Pillai", photo: "NP", experience: "20 yrs", temple: "Padmanabhaswamy", location: "TVM, Kerala", specialization: "Kerala Style Poojas, Tantra", bookings: 1140, rating: 4.8, status: "Active", color: "#6366F1", languages: ["Malayalam", "Sanskrit"], since: "May 2024" },
  { id: "PR006", name: "Mahant Shivprasad Ji", photo: "SP", experience: "30 yrs", temple: "Kedarnath Temple", location: "Rudraprayag, UK", specialization: "Shiva Puja, Mahabhishek", bookings: 980, rating: 4.9, status: "Seasonal", color: "#EF4444", languages: ["Hindi", "Sanskrit"], since: "Jun 2024" },
  { id: "PR007", name: "Archaka Subramaniam", photo: "AS", experience: "12 yrs", temple: "Sabarimala Temple", location: "Pathanamthitta, KL", specialization: "Ayyappa Seva, Deeparadhana", bookings: 860, rating: 4.6, status: "Active", color: "#F59E0B", languages: ["Malayalam", "Tamil"], since: "Jul 2024" },
  { id: "PR008", name: "Pandit Dilip Jha", photo: "DJ", experience: "8 yrs", temple: "Unassigned", location: "Varanasi, UP", specialization: "Satyanarayan Katha, Havan", bookings: 640, rating: 4.5, status: "Available", color: "#14B8A6", languages: ["Hindi", "Sanskrit"], since: "Aug 2024" },
  { id: "PR009", name: "Guruji Chandrashekhar", photo: "CC", experience: "16 yrs", temple: "Somnath Jyotirlinga", location: "Veraval, Gujarat", specialization: "Jyotirlinga Puja, Rudrabhishek", bookings: 720, rating: 4.7, status: "Active", color: "#8B5CF6", languages: ["Gujarati", "Sanskrit"], since: "Sep 2024" },
  { id: "PR010", name: "Panditji Ramakrishna Rao", photo: "RR", experience: "11 yrs", temple: "Shirdi Sai Baba", location: "Shirdi, MH", specialization: "Sai Baba Seva, Kakad Aarti", bookings: 580, rating: 4.6, status: "On Leave", color: "#EC4899", languages: ["Marathi", "Hindi"], since: "Oct 2024" },
];

const statusConfig: Record<string, { bg: string; color: string }> = {
  Active: { bg: "#F0FDF4", color: "#16A34A" },
  Seasonal: { bg: "#FFFBEB", color: "#D97706" },
  Available: { bg: "#EFF6FF", color: "#2563EB" },
  "On Leave": { bg: "#FFF1F2", color: "#DC2626" },
};

import { PriestsService } from "../../../services/firebase/priests";
import { TemplesService } from "../../../services/firebase/temples";

const priestColors = ["#C76A00", "#4A1259", "#D4A017", "#22C55E", "#6366F1", "#EF4444", "#F59E0B", "#14B8A6", "#8B5CF6", "#EC4899"];
const emptyPriestForm = { name: "", experience: "", templeId: "", location: "", specialization: "", languagesStr: "Sanskrit, Hindi", status: "Active" };

export function Priests() {
  const [priests, setPriests] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [priestForm, setPriestForm] = useState(emptyPriestForm);
  const [saving, setSaving] = useState(false);
  const [temples, setTemples] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = PriestsService.subscribeToPriests(setPriests);
    TemplesService.getTemples().then(setTemples).catch(console.error);
    return () => unsubscribe();
  }, []);

  const filtered = priests.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.templeName || "").toLowerCase().includes(search.toLowerCase()) ||
      p.specialization.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = filtered.slice(startIndex, endIndex);

  async function handleAddPriest() {
    if (!priestForm.name) return;
    setSaving(true);
    const initials = priestForm.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const newId = `PR${String(Date.now()).slice(-6)}`;
    
    try {
      const selectedTemple = temples.find(t => t.id === priestForm.templeId);

      await PriestsService.createPriest(newId, {
        name: priestForm.name, photo: initials, experience: priestForm.experience || "1 yr",
        templeId: priestForm.templeId, templeName: selectedTemple ? selectedTemple.name : "Unassigned", location: priestForm.location,
        specialization: priestForm.specialization || "General Puja Services",
        bookings: 0, rating: 5.0, status: priestForm.status,
        color: priestColors[priests.length % priestColors.length],
        languages: priestForm.languagesStr.split(",").map(l => l.trim()).filter(Boolean),
        since: "Jun 2026",
      });
      setPriestForm(emptyPriestForm);
      setAddOpen(false);
    } catch (error: any) {
      alert("Error adding priest: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEditPriest() {
    if (!editTarget || !priestForm.name) return;
    setSaving(true);
    
    try {
      const selectedTemple = temples.find(t => t.id === priestForm.templeId);

      await PriestsService.updatePriest(editTarget.id, {
        name: priestForm.name, experience: priestForm.experience,
        templeId: priestForm.templeId, templeName: selectedTemple ? selectedTemple.name : "Unassigned", location: priestForm.location,
        specialization: priestForm.specialization, status: priestForm.status,
        languages: priestForm.languagesStr.split(",").map(l => l.trim()).filter(Boolean),
      });
      setEditTarget(null);
      setPriestForm(emptyPriestForm);
    } catch (error: any) {
      alert("Error updating priest: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePriest(id: string) {
    if (confirm("Are you sure you want to delete this priest?")) {
      try {
        await PriestsService.deletePriest(id);
      } catch (error: any) {
        alert("Error deleting priest: " + error.message);
      }
    }
  }

  function openEditPriest(p: any) {
    setEditTarget(p);
    setPriestForm({ name: p.name, experience: p.experience, templeId: p.templeId || "", location: p.location, specialization: p.specialization, languagesStr: p.languages.join(", "), status: p.status });
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Priests", value: priests.length.toLocaleString(), color: "#C76A00", bg: "#FFF0E6" },
          { label: "Active Priests", value: priests.filter(p => p.status === "Active").length.toLocaleString(), color: "#22C55E", bg: "#F0FDF4" },
          { label: "Avg Rating", value: priests.length > 0 ? (priests.reduce((s, p) => s + p.rating, 0) / priests.length).toFixed(1) + " ★" : "—", color: "#D4A017", bg: "#FFFBEB" },
          { label: "Available Now", value: priests.filter(p => p.status === "Available").length.toLocaleString(), color: "#4A1259", bg: "#F3E8FF" },
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
            placeholder="Search priests, temples, specializations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }}
          />
        </div>
        <div className="flex items-center gap-2">
          {["All", "Active", "Available", "Seasonal", "On Leave"].map((s) => (
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
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto"
          style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}
        >
          <Plus size={15} />
          Add Priest
        </button>
      </div>

      {/* Priest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {paginated.map((priest) => {
          const sc = statusConfig[priest.status] || statusConfig.Active;
          return (
            <div key={priest.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div
                className="h-3 w-full"
                style={{ background: `linear-gradient(90deg, ${priest.color}, ${priest.color}66)` }}
              />
              <div className="p-5">
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: priest.color, fontWeight: 700, fontSize: "18px" }}
                  >
                    {priest.photo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700 }}>{priest.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{priest.experience} experience</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                        {priest.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Star size={11} fill="#D4A017" style={{ color: "#D4A017" }} />
                      <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{priest.rating}</span>
                      <span className="text-xs" style={{ color: "#D1D5DB" }}>·</span>
                      <span className="text-xs" style={{ color: "#9CA3AF" }}>{(priest.bookings || 0).toLocaleString()} bookings</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <Building2 size={12} style={{ color: "#C76A00" }} />
                    <span style={{ color: (!priest.templeId || priest.templeName === "Unassigned") ? "#EF4444" : "#1F1F1F", fontWeight: 500 }}>{priest.templeName || "Unassigned"}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <UserCircle size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#9CA3AF" }} />
                    <span style={{ color: "#6B7280" }}>{priest.specialization}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(priest.languages || []).map((l: string) => (
                      <span key={l} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3E8FF", color: "#4A1259", fontWeight: 500 }}>
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs"
                    style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
                    <Eye size={11} /> View Profile
                  </button>
                  <button onClick={() => openEditPriest(priest)} className="flex items-center justify-center py-1.5 px-2.5 rounded-lg"
                    style={{ backgroundColor: "#F3EDE8", color: "#6B7280" }}>
                    <Edit size={12} />
                  </button>
                  <button className="flex items-center justify-center py-1.5 px-2.5 rounded-lg"
                    style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}>
                    <RefreshCcw size={12} />
                  </button>
                  <button onClick={() => handleDeletePriest(priest.id)} className="flex items-center justify-center py-1.5 px-2.5 rounded-lg"
                    style={{ backgroundColor: "#FFF1F2", color: "#EF4444" }}>
                    <PowerOff size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-xl border p-4 flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <span className="text-xs" style={{ color: "#9CA3AF" }}>
          Showing {filtered.length === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, filtered.length)} of {filtered.length} priests
        </span>
        <div className="flex items-center gap-2">
          <button 
            className="px-2 py-1 text-xs border rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-bold" 
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button 
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className="w-6 h-6 text-xs rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                style={{
                  backgroundColor: page === pageNum ? "#C76A00" : "transparent",
                  color: page === pageNum ? "#FFFFFF" : "#6B7280",
                  fontWeight: page === pageNum ? 700 : 500
                }}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <button 
            className="px-2 py-1 text-xs border rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-bold" 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Priest Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setPriestForm(emptyPriestForm); }} title="Add New Priest">
        <div className="px-6 py-5 space-y-4">
          <Field label="Full Name">
            <input className={inputCls} style={inputStyle} placeholder="e.g. Pandit Ramesh Sharma" value={priestForm.name} onChange={e => setPriestForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Experience">
              <input className={inputCls} style={inputStyle} placeholder="e.g. 12 yrs" value={priestForm.experience} onChange={e => setPriestForm(f => ({ ...f, experience: e.target.value }))} />
            </Field>
            <Field label="Status">
              <select className={inputCls} style={selectStyle} value={priestForm.status} onChange={e => setPriestForm(f => ({ ...f, status: e.target.value }))}>
                {["Active", "Available", "Seasonal", "On Leave"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Assigned Temple">
            <select className={inputCls} style={selectStyle} value={priestForm.templeId} onChange={e => setPriestForm(f => ({ ...f, templeId: e.target.value }))}>
              <option value="">Unassigned</option>
              {temples.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="Location">
            <input className={inputCls} style={inputStyle} placeholder="e.g. Varanasi, UP" value={priestForm.location} onChange={e => setPriestForm(f => ({ ...f, location: e.target.value }))} />
          </Field>
          <Field label="Specialization">
            <input className={inputCls} style={inputStyle} placeholder="e.g. Vedic Rituals, Rudrabhishek" value={priestForm.specialization} onChange={e => setPriestForm(f => ({ ...f, specialization: e.target.value }))} />
          </Field>
          <Field label="Languages" hint="Comma-separated — e.g. Sanskrit, Hindi, Telugu">
            <input className={inputCls} style={inputStyle} value={priestForm.languagesStr} onChange={e => setPriestForm(f => ({ ...f, languagesStr: e.target.value }))} />
          </Field>
        </div>
        <ModalFooter onClose={() => { setAddOpen(false); setPriestForm(emptyPriestForm); }} onSubmit={handleAddPriest} submitLabel="Add Priest" saving={saving} />
      </Modal>

      {/* Edit Priest Modal */}
      <Modal open={!!editTarget} onClose={() => { setEditTarget(null); setPriestForm(emptyPriestForm); }} title="Edit Priest Profile">
        <div className="px-6 py-5 space-y-4">
          <Field label="Full Name">
            <input className={inputCls} style={inputStyle} value={priestForm.name} onChange={e => setPriestForm(f => ({ ...f, name: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Experience">
              <input className={inputCls} style={inputStyle} value={priestForm.experience} onChange={e => setPriestForm(f => ({ ...f, experience: e.target.value }))} />
            </Field>
            <Field label="Status">
              <select className={inputCls} style={selectStyle} value={priestForm.status} onChange={e => setPriestForm(f => ({ ...f, status: e.target.value }))}>
                {["Active", "Available", "Seasonal", "On Leave"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Assigned Temple">
            <select className={inputCls} style={selectStyle} value={priestForm.templeId} onChange={e => setPriestForm(f => ({ ...f, templeId: e.target.value }))}>
              <option value="">Unassigned</option>
              {temples.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="Location">
            <input className={inputCls} style={inputStyle} value={priestForm.location} onChange={e => setPriestForm(f => ({ ...f, location: e.target.value }))} />
          </Field>
          <Field label="Specialization">
            <input className={inputCls} style={inputStyle} value={priestForm.specialization} onChange={e => setPriestForm(f => ({ ...f, specialization: e.target.value }))} />
          </Field>
          <Field label="Languages" hint="Comma-separated">
            <input className={inputCls} style={inputStyle} value={priestForm.languagesStr} onChange={e => setPriestForm(f => ({ ...f, languagesStr: e.target.value }))} />
          </Field>
        </div>
        <ModalFooter onClose={() => { setEditTarget(null); setPriestForm(emptyPriestForm); }} onSubmit={handleEditPriest} submitLabel="Save Changes" saving={saving} />
      </Modal>
    </div>
  );
}
