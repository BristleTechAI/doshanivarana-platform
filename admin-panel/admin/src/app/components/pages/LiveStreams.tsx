import { useState, useEffect } from "react";
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
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const streamStatusCfg: Record<string, { bg: string; color: string; dot: string }> = {
  LIVE: { bg: "#FFF1F2", color: "#DC2626", dot: "#EF4444" },
  ENDED: { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  SCHEDULED: { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
};

export function LiveStreamsPage() {
  const [filter, setFilter] = useState("All");
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "liveStreams"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const promises = snapshot.docs.map(async (d) => {
        const data = d.data();
        let poojaName = "Unknown Pooja";
        let templeName = "Unknown Temple";
        let priestName = "Unknown Priest";

        if (data.bookingId) {
          const bDoc = await getDoc(doc(db, "bookings", data.bookingId));
          if (bDoc.exists()) {
            const bData = bDoc.data();
            poojaName = bData.poojaName || poojaName;
            templeName = bData.templeName || templeName;
            priestName = bData.priestName || priestName;
          }
        }

        const startedAtDate = data.createdAt ? data.createdAt.toDate() : new Date();
        const startedAt = startedAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let endedAt = "—";
        if (data.endedAt) {
          endedAt = data.endedAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        let duration = "—";
        if (data.status === "LIVE" && data.createdAt) {
          const mins = Math.floor((new Date().getTime() - startedAtDate.getTime()) / 60000);
          duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
        } else if (data.status === "ENDED" && data.createdAt && data.endedAt) {
          const mins = Math.floor((data.endedAt.toDate().getTime() - startedAtDate.getTime()) / 60000);
          duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
        }

        return {
          id: data.streamId || d.id,
          title: poojaName,
          temple: templeName,
          priest: priestName,
          viewers: data.status === "LIVE" ? 12 : 0,
          duration,
          quality: "HD 1080p",
          status: data.status || "SCHEDULED",
          startedAt,
          endedAt,
          timestamp: startedAtDate.getTime(),
        };
      });

      const resolved = await Promise.all(promises);
      resolved.sort((a, b) => b.timestamp - a.timestamp);
      setStreams(resolved);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const live = streams.filter(s => s.status === "LIVE").length;
  const filtered = filter === "All" ? streams : streams.filter(s => s.status === filter);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Live Now", value: String(live), color: "#EF4444", bg: "#FFF1F2" },
          { label: "Total Viewers", value: live * 12, color: "#C76A00", bg: "#FFF0E6" },
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
          {["All", "LIVE", "SCHEDULED", "ENDED"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ backgroundColor: filter === f ? "#C76A00" : "#FAF6F2", color: filter === f ? "#FFFFFF" : "#6B7280", fontWeight: filter === f ? 600 : 400, border: "1px solid", borderColor: filter === f ? "#C76A00" : "rgba(199,106,0,0.15)" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-gray-500">Loading Streams...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => {
            const sc = streamStatusCfg[s.status] || streamStatusCfg.SCHEDULED;
            return (
              <div key={s.id} className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
                <div className="h-36 relative flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1E0A3C, #4A1259)" }}>
                  {s.status === "LIVE" ? (
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
                      <div className="text-white/50 text-xs">
                        {s.status === "ENDED" ? `Ended at ${s.endedAt}` : `Starts at ${s.startedAt}`}
                      </div>
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
                  <div className="text-xs mb-3" style={{ color: "#9CA3AF" }}>{s.priest}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>Started: {s.startedAt}</div>
                    <div>Ended: {s.endedAt}</div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs" style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
                      <Eye size={11} /> Monitor
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500">No streams found.</div>
          )}
        </div>
      )}
    </div>
  );
}
