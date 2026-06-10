import { useState, useEffect } from "react";
import {
  Radio, Eye, Users, Clock, Wifi, WifiOff, Video, Play, Download,
  Package, MapPin, CheckCircle, AlertCircle, Truck, MessageCircle,
  Flag, Star, ChevronDown, Search, Plus, Edit, XCircle, Filter,
  Briefcase, Building2, UserCircle, TrendingUp, IndianRupee,
  Flame, Tag, Globe, RefreshCcw, BarChart2, ArrowUpRight,
  ClipboardList, PowerOff, Send, CheckCircle2, HardDrive, LayoutGrid,
  List, Calendar, ChevronRight, Reply, MoreVertical, Phone, Mail,
  TriangleAlert, Inbox, Timer, ArrowLeft, Archive
} from "lucide-react";
import { collection, query, onSnapshot, doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { v4 as uuidv4 } from "uuid";

const recStatusCfg: Record<string, { bg: string; color: string }> = {
  PUBLISHED: { bg: "#F0FDF4", color: "#16A34A" },
  READY: { bg: "#FFFBEB", color: "#D97706" },
  PROCESSING: { bg: "#EFF6FF", color: "#2563EB" },
  REJECTED: { bg: "#FFF1F2", color: "#DC2626" },
  ARCHIVED: { bg: "#F3F4F6", color: "#4B5563" },
};

export function RecordingsPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "recordings"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const promises = snapshot.docs.map(async (d) => {
        const data = d.data();
        let poojaName = "Unknown Pooja";
        let templeName = "Unknown Temple";
        let slotDate = "Unknown Date";

        if (data.bookingId) {
          const bDoc = await getDoc(doc(db, "bookings", data.bookingId));
          if (bDoc.exists()) {
            const bData = bDoc.data();
            poojaName = bData.poojaName || poojaName;
            templeName = bData.templeName || templeName;
            slotDate = bData.dateTime || slotDate;
          }
        }

        const dateStr = data.createdAt ? data.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Unknown";

        return {
          id: d.id,
          ...data,
          title: poojaName,
          temple: templeName,
          duration: data.duration || "—",
          views: data.status === "PUBLISHED" ? 12 : 0,
          size: "2.1 GB",
          status: data.status || "PROCESSING",
          quality: "HD 1080p",
          gradient: "linear-gradient(135deg,#1E0A3C,#4A1259)",
          dateStr,
          timestamp: data.createdAt ? data.createdAt.toMillis() : 0
        };
      });

      const resolved = await Promise.all(promises);
      resolved.sort((a, b) => b.timestamp - a.timestamp);
      setRecordings(resolved);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateSystemEvent = async (type: string, payload: any) => {
    try {
      const eventId = uuidv4();
      await setDoc(doc(db, "systemEvents", eventId), {
        eventId,
        eventType: type,
        payload,
        status: "PENDING",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error generating event:", error);
    }
  };

  const generateAuditLog = async (action: string, entityId: string, details: string) => {
    try {
      const logId = uuidv4();
      await setDoc(doc(db, "auditLogs", logId), {
        logId,
        action,
        entityType: "recording",
        entityId,
        userId: "ADMIN_USER",
        details,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error generating audit log:", error);
    }
  };

  const updateRecordingStatus = async (rec: any, newStatus: string, eventType: string, action: string) => {
    try {
      const recRef = doc(db, "recordings", rec.id);
      await updateDoc(recRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      if (rec.bookingId && (newStatus === "ARCHIVED" || newStatus === "REJECTED")) {
        const bookingRef = doc(db, "bookings", rec.bookingId);
        await updateDoc(bookingRef, {
          recordingStatus: "Unavailable",
          updatedAt: serverTimestamp()
        });
      } else if (rec.bookingId && newStatus === "PUBLISHED") {
        const bookingRef = doc(db, "bookings", rec.bookingId);
        await updateDoc(bookingRef, {
          recordingStatus: "Available",
          updatedAt: serverTimestamp()
        });
      }

      await generateSystemEvent(eventType, {
        recordingId: rec.id,
        bookingId: rec.bookingId,
        templeId: rec.templeId,
        userId: rec.userId || "USER",
        status: newStatus
      });

      await generateAuditLog(action, rec.id, `Admin ${action.toLowerCase()} recording for booking ${rec.bookingId}`);
    } catch (error) {
      console.error("Error updating recording status:", error);
    }
  };

  const filtered = recordings.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.temple.toLowerCase().includes(search.toLowerCase())
  );

  const groupedByDate = filtered.reduce((acc, curr) => {
    if (!acc[curr.dateStr]) acc[curr.dateStr] = [];
    acc[curr.dateStr].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  const groupedArray = Object.entries(groupedByDate).map(([date, items]) => ({ date, items }));

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
          { label: "Total Recordings", value: recordings.length, color: "#C76A00", bg: "#FFF0E6" },
          { label: "Pending Review", value: recordings.filter(r => r.status === "READY").length, color: "#D97706", bg: "#FFFBEB" },
          { label: "Published", value: recordings.filter(r => r.status === "PUBLISHED").length, color: "#22C55E", bg: "#F0FDF4" },
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

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading recordings...</div>
      ) : groupedArray.length === 0 ? (
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
                  const sc = recStatusCfg[r.status] || recStatusCfg.PROCESSING;
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
                        {r.status === "PROCESSING" && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#2563EB", color: "#FFFFFF", fontWeight: 600 }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Processing
                          </div>
                        )}
                        {r.status === "READY" && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#D97706", color: "#FFFFFF", fontWeight: 600 }}>
                            Ready
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
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2.5 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                          {r.status === "READY" && (
                            <>
                              <button onClick={() => updateRecordingStatus(r, "PUBLISHED", "recording.approved", "APPROVE")} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                                <CheckCircle size={11} /> Approve
                              </button>
                              <button onClick={() => updateRecordingStatus(r, "REJECTED", "recording.rejected", "REJECT")} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
                                <XCircle size={11} /> Reject
                              </button>
                            </>
                          )}
                          {r.status !== "ARCHIVED" && r.status !== "PROCESSING" && (
                            <button onClick={() => updateRecordingStatus(r, "ARCHIVED", "recording.archived", "ARCHIVE")} className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs" style={{ backgroundColor: "#F3F4F6", color: "#4B5563", fontWeight: 600 }}>
                              <Archive size={11} /> Archive
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
                {group.items.map((r, i) => {
                  const sc = recStatusCfg[r.status] || recStatusCfg.PROCESSING;
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
                      <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {r.status === "READY" && (
                          <>
                            <button onClick={() => updateRecordingStatus(r, "PUBLISHED", "recording.approved", "APPROVE")} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                              <CheckCircle size={11} />
                            </button>
                            <button onClick={() => updateRecordingStatus(r, "REJECTED", "recording.rejected", "REJECT")} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
                              <XCircle size={11} />
                            </button>
                          </>
                        )}
                        {r.status !== "ARCHIVED" && r.status !== "PROCESSING" && (
                          <button onClick={() => updateRecordingStatus(r, "ARCHIVED", "recording.archived", "ARCHIVE")} className="p-1.5 rounded-lg hover:bg-gray-100" title="Archive">
                            <Archive size={13} style={{ color: "#6B7280" }} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
