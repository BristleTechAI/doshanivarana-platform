import { useState, useEffect } from "react";
import { Search, Calendar, LayoutGrid, List, Play, CheckCircle, XCircle, Archive, HardDrive, Eye, Settings, Plus } from "lucide-react";
import { RecordingsService, RecordingStatus } from "../../../services/firebase/recordings";
import { LiveStreamsService } from "../../../services/firebase/liveStreams";
import { Modal, Field, ModalFooter, inputCls, inputStyle, selectStyle } from "../Modal";
import { formatTimestamp } from "../../../services/firebase/core";

const recStatusCfg: Record<string, { bg: string; color: string }> = {
  Published: { bg: "#F0FDF4", color: "#16A34A" },
  Draft: { bg: "#FFFBEB", color: "#D97706" },
  Archived: { bg: "#F3F4F6", color: "#4B5563" },
};

export function RecordingsPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [streams, setStreams] = useState<any[]>([]);
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editRec, setEditRec] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({ streamId: "", recordingTitle: "", recordingDescription: "", recordingUrl: "", thumbnailUrl: "", durationSeconds: 0 });

  useEffect(() => {
    const unsubRecs = RecordingsService.subscribeToRecordings(setRecordings);
    const unsubStreams = LiveStreamsService.subscribeToStreams(setStreams);
    return () => { unsubRecs(); unsubStreams(); };
  }, []);

  const eligibleStreams = streams.filter(s => (s.streamStatus === "Ended" || s.streamStatus === "Archived") && !s.recordingGenerated);

  const filtered = recordings.filter((r: any) =>
    (r.recordingTitle || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.templeName || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecordings = filtered.slice(startIndex, endIndex);

  const groupedByDate = paginatedRecordings.reduce((acc: any, curr: any) => {
    const dateStr = curr.createdAt ? new Date(curr.createdAt).toLocaleDateString() : "Unknown Date";
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  const groupedArray = Object.entries(groupedByDate)
    .map(([date, items]) => ({ date, items: items as any[] }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  async function handleCreate() {
    if (!form.streamId) return setErrorMsg("Stream ID is required.");
    setSaving(true);
    try {
      const newId = `REC_${Date.now()}`;
      await RecordingsService.createRecording(newId, form.streamId, form);
      setCreateOpen(false);
      setForm({ streamId: "", recordingTitle: "", recordingDescription: "", recordingUrl: "", thumbnailUrl: "", durationSeconds: 0 });
    } catch(e: any) {
      setErrorMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editRec) return;
    setSaving(true);
    try {
      await RecordingsService.updateRecording(editRec.id, {
        recordingTitle: editRec.recordingTitle,
        recordingDescription: editRec.recordingDescription,
        recordingUrl: editRec.recordingUrl,
        thumbnailUrl: editRec.thumbnailUrl,
        durationSeconds: Number(editRec.durationSeconds),
      });
      setEditRec(null);
    } catch(e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(id: string, status: RecordingStatus) {
    try {
      await RecordingsService.updateRecordingStatus(id, status);
    } catch(e: any) {
      alert("Error: " + e.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "#1F1F1F" }}>Recordings</h2>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
          <Plus size={15} />
          Create Recording
        </button>
      </div>

      {/* Top strip */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Storage widget (placeholder) */}
        <div className="lg:col-span-1 bg-white rounded-xl p-5 border flex flex-col justify-between" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FFF0E6" }}>
              <HardDrive size={18} style={{ color: "#C76A00" }} />
            </div>
            <div>
              <div className="text-xs" style={{ color: "#9CA3AF" }}>Storage</div>
              <div style={{ color: "#1F1F1F", fontWeight: 700 }}>14.2 TB <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: 11 }}>/ 20 TB</span></div>
            </div>
          </div>
          <div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F3EDE8" }}>
              <div className="h-full rounded-full" style={{ width: `71%`, background: "linear-gradient(90deg, #C76A00, #D4A017)" }} />
            </div>
            <div className="flex justify-between mt-1.5 text-xs" style={{ color: "#9CA3AF" }}>
              <span>71% used</span>
              <span>5.8 TB free</span>
            </div>
          </div>
        </div>
        {/* Stats */}
        {[
          { label: "Total Recordings", value: recordings.length, color: "#C76A00", bg: "#FFF0E6" },
          { label: "Drafts", value: recordings.filter((r: any) => r.recordingStatus === "Draft").length, color: "#D97706", bg: "#FFFBEB" },
          { label: "Published", value: recordings.filter((r: any) => r.recordingStatus === "Published").length, color: "#22C55E", bg: "#F0FDF4" },
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
      </div>

      {groupedArray.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No recordings found.</div>
      ) : (
        groupedArray.map(group => (
          <div key={group.date} className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar size={13} style={{ color: "#9CA3AF" }} />
              <span style={{ color: "#9CA3AF", fontSize: 12, fontWeight: 600 }}>{group.date}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#FAF6F2", color: "#C76A00", fontWeight: 600 }}>{group.items.length} recordings</span>
            </div>

            {view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {group.items.map(r => {
                  const sc = recStatusCfg[r.recordingStatus] || recStatusCfg.Draft;
                  return (
                    <div key={r.id} className="bg-white rounded-2xl border flex flex-col overflow-hidden hover:shadow-md transition-shadow" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
                      <div className="relative h-36 flex items-center justify-center bg-gray-900 bg-cover bg-center" style={{ backgroundImage: r.thumbnailUrl ? `url(${r.thumbnailUrl})` : "none", backgroundBlendMode: r.thumbnailUrl ? 'overlay' : 'normal', backgroundColor: r.thumbnailUrl ? 'rgba(0,0,0,0.4)' : '#1E0A3C' }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                            <Play size={20} className="text-white" style={{ marginLeft: 2 }} />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-white text-xs" style={{ backgroundColor: "rgba(0,0,0,0.6)", fontWeight: 600 }}>{r.durationSeconds}s</div>
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#FFFFFF", fontWeight: 500 }}>{r.poojaName}</div>
                      </div>
                      <div className="p-3.5 flex-1 flex flex-col">
                        <div className="text-sm mb-0.5" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.recordingTitle}</div>
                        <div className="text-xs mb-2" style={{ color: "#C76A00", fontWeight: 500 }}>{r.templeName}</div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">From Stream: {r.streamTitle}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: sc.bg, color: sc.color }}>{r.recordingStatus}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-auto pt-2.5 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                          {r.recordingStatus === "Draft" && (
                            <button onClick={() => handleStatus(r.id, "Published")} className="flex-1 py-1.5 rounded-lg text-xs bg-green-50 text-green-700 font-bold hover:bg-green-100">
                              Publish
                            </button>
                          )}
                          {r.recordingStatus === "Published" && (
                            <button onClick={() => handleStatus(r.id, "Archived")} className="flex-1 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-700 font-bold hover:bg-gray-200">
                              Archive
                            </button>
                          )}
                          <button onClick={() => setEditRec(r)} className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-200" title="Edit Metadata"><Settings size={14}/></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
                {group.items.map((r, i) => {
                  const sc = recStatusCfg[r.recordingStatus] || recStatusCfg.Draft;
                  return (
                    <div key={r.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-orange-50 transition-colors cursor-pointer ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                      <div className="w-14 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-900 bg-cover bg-center" style={{ backgroundImage: r.thumbnailUrl ? `url(${r.thumbnailUrl})` : "none", backgroundBlendMode: r.thumbnailUrl ? 'overlay' : 'normal', backgroundColor: r.thumbnailUrl ? 'rgba(0,0,0,0.4)' : '#1E0A3C' }}>
                        <Play size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.recordingTitle}</div>
                        <div className="text-xs" style={{ color: "#9CA3AF" }}>{r.templeName} | {r.poojaName}</div>
                      </div>
                      <div className="text-xs w-20 text-right" style={{ color: "#9CA3AF" }}>{r.durationSeconds}s</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap" style={{ backgroundColor: sc.bg, color: sc.color }}>{r.recordingStatus}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {r.recordingStatus === "Draft" && (
                          <button onClick={() => handleStatus(r.id, "Published")} className="p-1.5 rounded-lg hover:bg-green-50 text-green-700" title="Publish">
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {r.recordingStatus === "Published" && (
                          <button onClick={() => handleStatus(r.id, "Archived")} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Archive">
                            <Archive size={14} />
                          </button>
                        )}
                        <button onClick={() => setEditRec(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Edit Metadata">
                          <Settings size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}

      {/* Pagination */}
      <div className="bg-white rounded-xl border p-4 flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <span className="text-xs" style={{ color: "#9CA3AF" }}>
          Showing {filtered.length === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, filtered.length)} of {filtered.length} recordings
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

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setForm({ streamId: "", recordingTitle: "", recordingDescription: "", recordingUrl: "", thumbnailUrl: "", durationSeconds: 0 }); setErrorMsg(""); }} title="Create Recording from Stream" width="500px">
        <div className="px-6 py-5 space-y-4">
          {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
          <Field label="Source Stream">
            <select className={inputCls} style={selectStyle} value={form.streamId} onChange={e => setForm(f => ({...f, streamId: e.target.value}))}>
              <option value="">Select an Ended/Archived Stream...</option>
              {eligibleStreams.map(s => <option key={s.id} value={s.id}>{s.title} ({s.templeName})</option>)}
            </select>
          </Field>
          <Field label="Recording Title (Optional Override)">
            <input className={inputCls} style={inputStyle} value={form.recordingTitle} onChange={e => setForm(f => ({...f, recordingTitle: e.target.value}))} placeholder="Defaults to Stream Title" />
          </Field>
          <div className="mt-4 p-4 bg-gray-50 border rounded-lg space-y-3">
             <div className="text-xs font-bold text-gray-500">TODO: Future YouTube Integration Fields</div>
             <Field label="Recording URL">
               <input className={inputCls} style={inputStyle} value={form.recordingUrl} onChange={e => setForm(f => ({...f, recordingUrl: e.target.value}))} />
             </Field>
             <Field label="Duration (Seconds)">
               <input type="number" className={inputCls} style={inputStyle} value={form.durationSeconds} onChange={e => setForm(f => ({...f, durationSeconds: Number(e.target.value)}))} />
             </Field>
          </div>
        </div>
        <ModalFooter onClose={() => setCreateOpen(false)} onSubmit={handleCreate} submitLabel="Generate Recording" saving={saving} />
      </Modal>

      {/* Edit Metadata Modal */}
      <Modal open={!!editRec} onClose={() => setEditRec(null)} title="Update Recording Metadata" width="400px">
        {editRec && (
          <div className="px-6 py-5 space-y-4">
            <Field label="Title">
              <input className={inputCls} style={inputStyle} value={editRec.recordingTitle || ""} onChange={e => setEditRec({...editRec, recordingTitle: e.target.value})} />
            </Field>
            <Field label="Description">
              <input className={inputCls} style={inputStyle} value={editRec.recordingDescription || ""} onChange={e => setEditRec({...editRec, recordingDescription: e.target.value})} />
            </Field>
            <div className="mt-4 p-4 bg-gray-50 border rounded-lg space-y-3">
              <div className="text-xs font-bold text-gray-500 mb-2">TODO: Future YouTube Integration</div>
              <Field label="Recording URL">
                <input className={inputCls} style={inputStyle} value={editRec.recordingUrl || ""} onChange={e => setEditRec({...editRec, recordingUrl: e.target.value})} />
              </Field>
              <Field label="Thumbnail URL">
                <input className={inputCls} style={inputStyle} value={editRec.thumbnailUrl || ""} onChange={e => setEditRec({...editRec, thumbnailUrl: e.target.value})} />
              </Field>
              <Field label="Duration (Seconds)">
                <input type="number" className={inputCls} style={inputStyle} value={editRec.durationSeconds || 0} onChange={e => setEditRec({...editRec, durationSeconds: e.target.value})} />
              </Field>
            </div>
            <div className="text-[10px] text-red-500 font-mono mt-2">
              Note: Relation fields (Stream, Temple, Pooja, Priest) are strictly immutable.
            </div>
          </div>
        )}
        <ModalFooter onClose={() => setEditRec(null)} onSubmit={handleUpdate} submitLabel="Save Metadata" saving={saving} />
      </Modal>
    </div>
  );
}
