import { useState, useEffect } from "react";
import { Radio, Eye, Users, Clock, Plus, Edit, Settings } from "lucide-react";
import { LiveStreamsService, StreamStatus } from "../../../services/firebase/liveStreams";
import { TemplesService } from "../../../services/firebase/temples";
import { PoojasService } from "../../../services/firebase/poojas";
import { PriestsService } from "../../../services/firebase/priests";
import { SlotsService } from "../../../services/firebase/slots";
import { Modal, Field, ModalFooter, inputCls, inputStyle, selectStyle } from "../Modal";
import { formatTimestamp } from "../../../services/firebase/core";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";
import { ClipboardList } from "lucide-react";

const streamStatusCfg: Record<string, { bg: string; color: string; dot: string }> = {
  Live: { bg: "#FFF1F2", color: "#DC2626", dot: "#EF4444" },
  Ended: { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  Scheduled: { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
  Archived: { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
};

export function LiveStreamsPage() {
  const [filter, setFilter] = useState("All");
  const [streams, setStreams] = useState<any[]>([]);
  const [temples, setTemples] = useState<any[]>([]);
  const [poojas, setPoojas] = useState<any[]>([]);
  const [priests, setPriests] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editStream, setEditStream] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const emptyForm = { title: "", description: "", templeId: "", poojaId: "", priestId: "", slotId: "", youtubeVideoId: "", youtubeLiveUrl: "", thumbnailUrl: "" };
  const [form, setForm] = useState(emptyForm);

  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistBookingId, setChecklistBookingId] = useState<string | null>(null);
  const [activeChecklist, setActiveChecklist] = useState<any>(null);

  useEffect(() => {
    if (!checklistBookingId) {
      setActiveChecklist(null);
      return;
    }
    const unsub = onSnapshot(doc(db, 'streamReadiness', checklistBookingId), (docSnap) => {
      if (docSnap.exists()) {
        setActiveChecklist(docSnap.data());
      }
    });
    return () => unsub();
  }, [checklistBookingId]);

  async function handleOpenChecklist(stream: any) {
    let bookingId = stream.bookingId;
    if (!bookingId && stream.slotId) {
      try {
        const bookingsQ = query(collection(db, 'bookings'), where('slotId', '==', stream.slotId), where('isDeleted', '==', false));
        const bookingsSnap = await getDocs(bookingsQ);
        if (!bookingsSnap.empty) {
          bookingId = bookingsSnap.docs[0].id;
        }
      } catch (e) {
        console.error("Failed to find booking for stream slot:", e);
      }
    }

    if (bookingId) {
      setChecklistBookingId(bookingId);
      setChecklistOpen(true);
    } else {
      alert("No active bookings found for this scheduled stream slot.");
    }
  }

  useEffect(() => {
    const unsub = LiveStreamsService.subscribeToStreams(setStreams);
    TemplesService.getTemples().then(setTemples);
    PoojasService.subscribeToPoojas(setPoojas);
    PriestsService.subscribeToPriests(setPriests);
    SlotsService.subscribeToSlots(setSlots);
    return () => unsub();
  }, []);

  const live = streams.filter(s => s.streamStatus === "Live").length;
  const filtered = filter === "All" ? streams : streams.filter(s => s.streamStatus === filter);

  async function handleCreate() {
    if (!form.templeId || !form.poojaId || !form.priestId || !form.slotId) {
      setErrorMsg("Temple, Pooja, Priest, and Slot are required.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      const newId = `LS_${Date.now()}`;
      await LiveStreamsService.createStream(newId, form);
      setCreateOpen(false);
      setForm(emptyForm);
    } catch(e: any) {
      setErrorMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editStream) return;
    setSaving(true);
    try {
      await LiveStreamsService.updateStream(editStream.id, {
        youtubeVideoId: editStream.youtubeVideoId,
        youtubeLiveUrl: editStream.youtubeLiveUrl,
        thumbnailUrl: editStream.thumbnailUrl,
      });
      setEditStream(null);
    } catch(e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusUpdate(id: string, newStatus: StreamStatus, templeId: string) {
    try {
      if (newStatus === "Live") {
        await LiveStreamsService.goLive(id, templeId);
      } else {
        await LiveStreamsService.updateStreamStatus(id, newStatus);
      }
    } catch(e: any) {
      alert("Error: " + e.message);
    }
  }

  const validPoojas = poojas.filter(p => p.templeId === form.templeId);
  const validPriests = priests.filter(p => p.templeId === form.templeId);
  const validSlots = slots.filter(s => s.templeId === form.templeId);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "#1F1F1F" }}>Live Streams</h2>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
          <Plus size={15} />
          Schedule Stream
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Live Now", value: String(live), color: "#EF4444", bg: "#FFF1F2" },
          { label: "Total Views", value: "—", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Avg Quality", value: "HD 1080p", color: "#22C55E", bg: "#F0FDF4" },
          { label: "Total Streams", value: String(streams.length), color: "#4A1259", bg: "#F3E8FF" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="flex items-center gap-1.5">
          {["All", "Scheduled", "Live", "Ended", "Archived"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ backgroundColor: filter === f ? "#C76A00" : "#FAF6F2", color: filter === f ? "#FFFFFF" : "#6B7280", fontWeight: filter === f ? 600 : 400, border: "1px solid", borderColor: filter === f ? "#C76A00" : "rgba(199,106,0,0.15)" }}>
              {f === "All" ? "All Streams" : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(s => {
          const sc = streamStatusCfg[s.streamStatus] || streamStatusCfg.Scheduled;
          return (
            <div key={s.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow flex flex-col" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="h-36 relative flex items-center justify-center bg-gray-900 bg-cover bg-center" style={{ backgroundImage: s.thumbnailUrl ? `url(${s.thumbnailUrl})` : "none", backgroundBlendMode: s.thumbnailUrl ? 'overlay' : 'normal', backgroundColor: s.thumbnailUrl ? 'rgba(0,0,0,0.4)' : '#1E0A3C' }}>
                {s.streamStatus === "Live" ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Radio size={48} className="text-white opacity-20" />
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: "#EF4444" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      <span className="text-white text-xs" style={{ fontWeight: 700 }}>LIVE</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Clock size={28} className="text-white/30 mx-auto mb-2" />
                    <div className="text-white/50 text-xs font-bold">
                      {s.streamStatus}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{s.title}</div>
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.dot }} />
                    {s.streamStatus}
                  </span>
                </div>
                <div className="text-xs mb-1" style={{ color: "#C76A00", fontWeight: 500 }}>{s.templeName}</div>
                <div className="text-xs mb-3" style={{ color: "#9CA3AF" }}>{s.poojaName} | {s.priestName}</div>
                
                <div className="mt-auto space-y-1 text-[10px] text-gray-400 font-mono">
                  {s.actualStartTime && <div>Start: {formatTimestamp(s.actualStartTime)}</div>}
                  {s.actualEndTime && <div>End: {formatTimestamp(s.actualEndTime)}</div>}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                  {(s.streamStatus === "Scheduled" || s.streamStatus === "Live") && (
                     <button onClick={() => handleOpenChecklist(s)} className="py-1.5 px-3 rounded-lg text-xs bg-orange-50 text-orange-700 font-bold hover:bg-orange-100 border border-orange-200 flex items-center justify-center gap-1" title="View Stream Readiness Checklist"><ClipboardList size={12}/> Checklist</button>
                  )}
                  {s.streamStatus === "Scheduled" && (
                     <button onClick={() => handleStatusUpdate(s.id, "Live", s.templeId)} className="flex-1 py-1.5 rounded-lg text-xs bg-red-100 text-red-700 font-bold hover:bg-red-200">Go Live</button>
                  )}
                  {s.streamStatus === "Live" && (
                     <button onClick={() => handleStatusUpdate(s.id, "Ended", s.templeId)} className="flex-1 py-1.5 rounded-lg text-xs bg-orange-100 text-orange-700 font-bold hover:bg-orange-200">End Stream</button>
                  )}
                  {s.streamStatus === "Ended" && (
                     <button onClick={() => handleStatusUpdate(s.id, "Archived", s.templeId)} className="flex-1 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">Archive</button>
                  )}
                  <button onClick={() => setEditStream(s)} className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-200" title="Edit Stream Integration"><Settings size={14}/></button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500">No streams found.</div>
        )}
      </div>

      {/* Schedule Stream Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setForm(emptyForm); setErrorMsg(""); }} title="Schedule Live Stream" width="500px">
        <div className="px-6 py-5 space-y-4">
          {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
          <Field label="Title">
            <input className={inputCls} style={inputStyle} value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} />
          </Field>
          <Field label="Temple">
            <select className={inputCls} style={selectStyle} value={form.templeId} onChange={e => setForm(f => ({...f, templeId: e.target.value, poojaId: "", priestId: "", slotId: ""}))}>
              <option value="">Select Temple...</option>
              {temples.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          {form.templeId && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Pooja">
                  <select className={inputCls} style={selectStyle} value={form.poojaId} onChange={e => setForm(f => ({...f, poojaId: e.target.value}))}>
                    <option value="">Select Pooja...</option>
                    {validPoojas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
                <Field label="Priest">
                  <select className={inputCls} style={selectStyle} value={form.priestId} onChange={e => setForm(f => ({...f, priestId: e.target.value}))}>
                    <option value="">Select Priest...</option>
                    {validPriests.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Slot">
                <select className={inputCls} style={selectStyle} value={form.slotId} onChange={e => setForm(f => ({...f, slotId: e.target.value}))}>
                  <option value="">Select Slot...</option>
                  {validSlots.map(s => <option key={s.id} value={s.id}>{formatTimestamp(s.startTime)} - {formatTimestamp(s.endTime)}</option>)}
                </select>
              </Field>
            </>
          )}
          <div className="mt-4 p-4 bg-gray-50 border rounded-lg space-y-3">
             <div className="text-xs font-bold text-gray-500">TODO: Future YouTube Live API Integration</div>
             <Field label="YouTube Video ID (Placeholder)">
               <input className={inputCls} style={inputStyle} value={form.youtubeVideoId} onChange={e => setForm(f => ({...f, youtubeVideoId: e.target.value}))} />
             </Field>
          </div>
        </div>
        <ModalFooter onClose={() => { setCreateOpen(false); setForm(emptyForm); }} onSubmit={handleCreate} submitLabel="Schedule" saving={saving} />
      </Modal>

      {/* Edit Stream Modal */}
      <Modal open={!!editStream} onClose={() => setEditStream(null)} title="Update Stream Information" width="400px">
        {editStream && (
          <div className="px-6 py-5 space-y-4">
            <div className="text-xs font-bold text-gray-500 mb-2">TODO: Future YouTube Live API Integration</div>
            <Field label="YouTube Video ID">
              <input className={inputCls} style={inputStyle} value={editStream.youtubeVideoId || ""} onChange={e => setEditStream({...editStream, youtubeVideoId: e.target.value})} />
            </Field>
            <Field label="YouTube Live URL">
              <input className={inputCls} style={inputStyle} value={editStream.youtubeLiveUrl || ""} onChange={e => setEditStream({...editStream, youtubeLiveUrl: e.target.value})} />
            </Field>
            <Field label="Thumbnail URL">
              <input className={inputCls} style={inputStyle} value={editStream.thumbnailUrl || ""} onChange={e => setEditStream({...editStream, thumbnailUrl: e.target.value})} />
            </Field>
          </div>
        )}
        <ModalFooter onClose={() => setEditStream(null)} onSubmit={handleUpdate} submitLabel="Save" saving={saving} />
      </Modal>

      {/* Stream Readiness Checklist Modal (Read-Only) */}
      <Modal open={checklistOpen} onClose={() => { setChecklistOpen(false); setChecklistBookingId(null); }} title="Stream Readiness Monitoring" width="550px">
        <div className="px-6 py-5 space-y-5">
          {!activeChecklist ? (
            <div className="text-center py-8 text-gray-500 font-medium space-y-2">
              <ClipboardList className="mx-auto text-gray-300 animate-pulse" size={40} />
              <p>Awaiting checklist initialization by PRO...</p>
              <p className="text-[11px] text-gray-400">Preparation status will appear here in real time once the PRO starts the checklist.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="p-4 rounded-xl border flex items-center justify-between" style={{ backgroundColor: "#FAF6F2", borderColor: "rgba(199,106,0,0.15)" }}>
                <div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Overall Status</div>
                  <div className="text-sm font-bold mt-1" style={{ color: "#1F1F1F" }}>
                    {activeChecklist.isReady ? "Ready to Broadcast ✅" : "In Preparation..."}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: "#C76A00" }}>{activeChecklist.progressPercent}%</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Prepared</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: `${activeChecklist.progressPercent}%`, backgroundColor: "#C76A00" }}></div>
              </div>

              {/* Stages List */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {(activeChecklist.stages || []).map((stage: any) => {
                  const isCompleted = stage.status === 'COMPLETED';
                  const isInProgress = stage.status === 'IN_PROGRESS';
                  const isLocked = stage.status === 'LOCKED';

                  return (
                    <div key={stage.id} className="border rounded-xl p-4 space-y-3" style={{ borderColor: isCompleted ? "rgba(34,197,94,0.2)" : isInProgress ? "rgba(199,106,0,0.3)" : "rgba(0,0,0,0.06)", opacity: isLocked ? 0.6 : 1 }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                            isCompleted ? 'bg-green-50 text-green-700' : isInProgress ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {stage.title}
                          </span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: isCompleted ? '#16A34A' : isInProgress ? '#D97706' : '#6B7280' }}>
                          {stage.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                        {(stage.items || []).map((item: any) => (
                          <div key={item.id} className="flex items-center gap-2 text-xs">
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                              item.completed ? 'bg-green-500 border-green-600 text-white' : 'border-gray-300 bg-white'
                            }`}>
                              {item.completed && <span className="text-[9px] font-bold">✓</span>}
                            </span>
                            <span className={item.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <ModalFooter onClose={() => { setChecklistOpen(false); setChecklistBookingId(null); }} onSubmit={() => { setChecklistOpen(false); setChecklistBookingId(null); }} submitLabel="Close" />
      </Modal>
    </div>
  );
}
