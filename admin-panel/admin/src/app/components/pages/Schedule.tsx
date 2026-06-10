import { useState } from "react";
import { Plus, Calendar, Clock, Search, Edit, Trash2, UserCircle } from "lucide-react";
import { Modal, Field, ModalFooter, inputCls, inputStyle, selectStyle } from "../Modal";

type SlotStatus = "Available" | "Booked" | "Cancelled";

interface Slot {
  id: string;
  temple: string;
  pooja: string;
  priest: string;
  date: string;
  time: string;
  duration: string;
  capacity: number;
  booked: number;
  language: string;
  status: SlotStatus;
}

const initialSlots: Slot[] = [
  { id: "SL001", temple: "Tirumala Tirupati", pooja: "Sudarshana Homam", priest: "Swami Krishnananda", date: "09 Jun 2026", time: "6:00 AM", duration: "2h", capacity: 10, booked: 8, language: "Telugu", status: "Available" },
  { id: "SL002", temple: "Kashi Vishwanath", pooja: "Rudrabhishek", priest: "Pandit Ramesh Sharma", date: "09 Jun 2026", time: "8:00 AM", duration: "1h 30m", capacity: 8, booked: 8, language: "Hindi", status: "Booked" },
  { id: "SL003", temple: "Sabarimala Temple", pooja: "Abhishekam", priest: "Archaka Subramaniam", date: "09 Jun 2026", time: "10:00 AM", duration: "45m", capacity: 12, booked: 4, language: "Malayalam", status: "Available" },
  { id: "SL004", temple: "Meenakshi Amman", pooja: "Sahasranama Archana", priest: "Acharya Venkatesh Iyer", date: "09 Jun 2026", time: "12:00 PM", duration: "1h", capacity: 15, booked: 12, language: "Tamil", status: "Available" },
  { id: "SL005", temple: "Shirdi Sai Baba", pooja: "Kakad Aarti", priest: "Panditji Ramakrishna Rao", date: "09 Jun 2026", time: "4:30 AM", duration: "30m", capacity: 20, booked: 20, language: "Marathi", status: "Booked" },
  { id: "SL006", temple: "Somnath Jyotirlinga", pooja: "Maha Abhishek", priest: "Guruji Chandrashekhar", date: "10 Jun 2026", time: "7:00 AM", duration: "3h", capacity: 6, booked: 0, language: "Gujarati", status: "Available" },
  { id: "SL007", temple: "Vaishno Devi Shrine", pooja: "Vishnu Sahasranamam", priest: "Pandit Gopal Das", date: "10 Jun 2026", time: "9:00 AM", duration: "1h", capacity: 10, booked: 3, language: "Hindi", status: "Available" },
  { id: "SL008", temple: "Kedarnath Temple", pooja: "Shiv Puja", priest: "Mahant Shivprasad Ji", date: "10 Jun 2026", time: "6:00 AM", duration: "1h 30m", capacity: 8, booked: 8, language: "Hindi", status: "Cancelled" },
  { id: "SL009", temple: "Tirumala Tirupati", pooja: "Abhishekam", priest: "Swami Krishnananda", date: "11 Jun 2026", time: "7:00 AM", duration: "45m", capacity: 20, booked: 14, language: "Telugu", status: "Available" },
  { id: "SL010", temple: "Kashi Vishwanath", pooja: "Navakabhishekam", priest: "Pandit Ramesh Sharma", date: "11 Jun 2026", time: "5:00 AM", duration: "4h", capacity: 5, booked: 5, language: "Hindi", status: "Booked" },
  { id: "SL011", temple: "Padmanabhaswamy", pooja: "Deeparadhana", priest: "Shastri Narayanan Pillai", date: "12 Jun 2026", time: "6:30 PM", duration: "1h", capacity: 25, booked: 18, language: "Malayalam", status: "Available" },
  { id: "SL012", temple: "Sabarimala Temple", pooja: "Rudrabhishek", priest: "Archaka Subramaniam", date: "13 Jun 2026", time: "8:00 AM", duration: "1h 30m", capacity: 10, booked: 2, language: "Tamil", status: "Available" },
];

const templeOptions = ["Tirumala Tirupati", "Kashi Vishwanath", "Sabarimala Temple", "Meenakshi Amman", "Shirdi Sai Baba", "Somnath Jyotirlinga", "Vaishno Devi Shrine", "Kedarnath Temple", "Padmanabhaswamy", "Dwarkadhish Temple"];
const poojaOptions = ["Sudarshana Homam", "Rudrabhishek", "Abhishekam", "Sahasranama Archana", "Kakad Aarti", "Maha Abhishek", "Vishnu Sahasranamam", "Shiv Puja", "Navakabhishekam", "Deeparadhana", "Satyanarayan Katha"];
const priestOptions = ["Swami Krishnananda", "Pandit Ramesh Sharma", "Archaka Subramaniam", "Acharya Venkatesh Iyer", "Panditji Ramakrishna Rao", "Guruji Chandrashekhar", "Pandit Gopal Das", "Mahant Shivprasad Ji", "Shastri Narayanan Pillai"];
const languageOptions = ["Telugu", "Hindi", "Malayalam", "Tamil", "Marathi", "Gujarati", "Kannada", "Sanskrit"];

const statusCfg: Record<SlotStatus, { bg: string; color: string }> = {
  Available: { bg: "#F0FDF4", color: "#16A34A" },
  Booked: { bg: "#EFF6FF", color: "#2563EB" },
  Cancelled: { bg: "#FFF1F2", color: "#DC2626" },
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekDates = ["09", "10", "11", "12", "13", "14", "15"];

const emptyForm = {
  temple: templeOptions[0], pooja: poojaOptions[0], priest: priestOptions[0],
  date: "", time: "", duration: "1h", capacity: "10", language: languageOptions[0],
  status: "Available" as SlotStatus,
};

export function Schedule() {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [selectedDay, setSelectedDay] = useState(0);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Slot | null>(null);
  const [form, setForm] = useState(emptyForm);

  const dayDate = `${weekDates[selectedDay]} Jun 2026`;
  const filtered = slots.filter(s => {
    const matchDay = s.date === dayDate;
    const matchSearch = !search ||
      s.pooja.toLowerCase().includes(search.toLowerCase()) ||
      s.temple.toLowerCase().includes(search.toLowerCase()) ||
      s.priest.toLowerCase().includes(search.toLowerCase());
    return matchDay && matchSearch;
  });

  function handleAdd() {
    if (!form.date || !form.time) return;
    const newSlot: Slot = {
      id: `SL${String(slots.length + 1).padStart(3, "0")}`,
      ...form,
      capacity: parseInt(form.capacity) || 10,
      booked: 0,
    };
    setSlots(prev => [...prev, newSlot]);
    setForm(emptyForm);
    setAddOpen(false);
  }

  function handleEdit() {
    if (!editTarget) return;
    setSlots(prev => prev.map(s =>
      s.id === editTarget.id ? { ...s, ...form, capacity: parseInt(form.capacity) || s.capacity } : s
    ));
    setEditTarget(null);
    setForm(emptyForm);
  }

  function openEdit(slot: Slot) {
    setEditTarget(slot);
    setForm({ ...slot, capacity: String(slot.capacity) });
  }

  function deleteSlot(id: string) {
    setSlots(prev => prev.filter(s => s.id !== id));
  }

  const totalSlots = slots.length;
  const available = slots.filter(s => s.status === "Available").length;
  const booked = slots.filter(s => s.status === "Booked").length;
  const cancelled = slots.filter(s => s.status === "Cancelled").length;

  const slotForm = (
    <div className="px-6 py-5 space-y-4">
      <Field label="Temple">
        <select className={inputCls} style={selectStyle} value={form.temple} onChange={e => setForm(f => ({ ...f, temple: e.target.value }))}>
          {templeOptions.map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Pooja / Service">
        <select className={inputCls} style={selectStyle} value={form.pooja} onChange={e => setForm(f => ({ ...f, pooja: e.target.value }))}>
          {poojaOptions.map(p => <option key={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Priest">
        <select className={inputCls} style={selectStyle} value={form.priest} onChange={e => setForm(f => ({ ...f, priest: e.target.value }))}>
          {priestOptions.map(p => <option key={p}>{p}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Date">
          <input className={inputCls} style={inputStyle} placeholder="e.g. 09 Jun 2026" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </Field>
        <Field label="Time">
          <input className={inputCls} style={inputStyle} placeholder="e.g. 6:00 AM" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Duration">
          <input className={inputCls} style={inputStyle} placeholder="e.g. 1h 30m" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
        </Field>
        <Field label="Capacity">
          <input className={inputCls} style={inputStyle} type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Language">
          <select className={inputCls} style={selectStyle} value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
            {languageOptions.map(l => <option key={l}>{l}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputCls} style={selectStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as SlotStatus }))}>
            {(["Available", "Booked", "Cancelled"] as SlotStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Slots", value: totalSlots, color: "#C76A00", bg: "#FFF0E6" },
          { label: "Available", value: available, color: "#16A34A", bg: "#F0FDF4" },
          { label: "Booked", value: booked, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Cancelled", value: cancelled, color: "#DC2626", bg: "#FFF1F2" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>Week of 09 Jun 2026</span>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
            style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}
          >
            <Plus size={15} /> Add Slot
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day, i) => {
            const daySlots = slots.filter(s => s.date === `${weekDates[i]} Jun 2026`);
            const isSelected = selectedDay === i;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(i)}
                className="flex flex-col items-center py-2.5 px-1 rounded-xl transition-all"
                style={{
                  backgroundColor: isSelected ? "#C76A00" : "#FAF6F2",
                  border: `1px solid ${isSelected ? "#C76A00" : "rgba(199,106,0,0.15)"}`,
                }}
              >
                <span className="text-xs mb-1" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "#9CA3AF", fontWeight: 500 }}>{day}</span>
                <span className="text-sm" style={{ color: isSelected ? "#FFFFFF" : "#1F1F1F", fontWeight: 700 }}>{weekDates[i]}</span>
                {daySlots.length > 0 && (
                  <span className="mt-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "rgba(199,106,0,0.12)", color: isSelected ? "#FFFFFF" : "#C76A00", fontWeight: 700 }}>
                    {daySlots.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slot List */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Search slots by temple, pooja, or priest..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }}
            />
          </div>
          <span className="text-xs flex-shrink-0" style={{ color: "#9CA3AF" }}>{dayDate} · {filtered.length} slot{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar size={28} className="mx-auto mb-2" style={{ color: "#E5D5C5" }} />
            <p className="text-sm" style={{ color: "#9CA3AF" }}>No slots scheduled for this day</p>
            <button onClick={() => setAddOpen(true)} className="mt-3 text-xs" style={{ color: "#C76A00", fontWeight: 600 }}>+ Add a slot</button>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
              {filtered.map(s => {
                const sc = statusCfg[s.status];
                const fillPct = Math.round((s.booked / s.capacity) * 100);
                return (
                  <div key={s.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{s.pooja}</div>
                        <div className="text-xs mt-0.5" style={{ color: "#C76A00", fontWeight: 500 }}>{s.temple}</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{s.status}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs" style={{ color: "#6B7280" }}>
                      <span className="flex items-center gap-1"><Clock size={10} /> {s.time}</span>
                      <span>{s.duration}</span>
                      <span className="flex items-center gap-1"><UserCircle size={10} /> {s.priest}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "#F3EDE8" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${fillPct}%`, backgroundColor: fillPct >= 90 ? "#EF4444" : "#22C55E" }} />
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: "#6B7280" }}>{s.booked}/{s.capacity}</span>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs"
                        style={{ backgroundColor: "#FAF6F2", color: "#6B7280", minHeight: "44px" }}>
                        <Edit size={12} /> Edit
                      </button>
                      <button onClick={() => deleteSlot(s.id)} className="flex items-center justify-center py-2 px-4 rounded-lg text-xs"
                        style={{ backgroundColor: "#FFF1F2", color: "#EF4444", minHeight: "44px", minWidth: "44px" }}>
                        <Trash2 size={12} />
                      </button>
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
                    {["Time", "Temple", "Pooja / Service", "Priest", "Duration", "Language", "Capacity", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const sc = statusCfg[s.status];
                    const fillPct = Math.round((s.booked / s.capacity) * 100);
                    return (
                      <tr key={s.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>
                            <Clock size={12} style={{ color: "#C76A00" }} /> {s.time}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "#C76A00", fontWeight: 500 }}>{s.temple}</td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{s.pooja}</td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: "#6B7280" }}>{s.priest}</td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: "#6B7280" }}>{s.duration}</td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3E8FF", color: "#4A1259" }}>{s.language}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: "#F3EDE8" }}>
                              <div className="h-1.5 rounded-full" style={{ width: `${fillPct}%`, backgroundColor: fillPct >= 90 ? "#EF4444" : "#22C55E" }} />
                            </div>
                            <span className="text-xs" style={{ color: "#6B7280" }}>{s.booked}/{s.capacity}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{s.status}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"><Edit size={13} style={{ color: "#6B7280" }} /></button>
                            <button onClick={() => deleteSlot(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={13} style={{ color: "#EF4444" }} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Slot Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setForm(emptyForm); }} title="Add Service Slot">
        {slotForm}
        <ModalFooter onClose={() => { setAddOpen(false); setForm(emptyForm); }} onSubmit={handleAdd} submitLabel="Add Slot" />
      </Modal>

      {/* Edit Slot Modal */}
      <Modal open={!!editTarget} onClose={() => { setEditTarget(null); setForm(emptyForm); }} title="Edit Service Slot">
        {slotForm}
        <ModalFooter onClose={() => { setEditTarget(null); setForm(emptyForm); }} onSubmit={handleEdit} submitLabel="Save Changes" />
      </Modal>
    </div>
  );
}
