import { useState } from "react";
import { Radio, Eye, Users, Clock } from "lucide-react";

const streamStatusCfg: Record<string, { bg: string; color: string; dot: string }> = {
  LIVE: { bg: "#FFF1F2", color: "#DC2626", dot: "#EF4444" },
  ENDED: { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  SCHEDULED: { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6" },
};

const defaultStreams = [
  { id: "ls1", title: "Maha Rudrabhishek", temple: "Kashi Vishwanath", priest: "Pandit Ramesh Sharma", viewers: 1842, duration: "1h 12m", quality: "HD 1080p", status: "LIVE", startedAt: "08:30 AM", endedAt: "—" },
  { id: "ls2", title: "Suprabhata Seva", temple: "Tirumala Tirupati", priest: "Swami Krishnananda", viewers: 4200, duration: "45m", quality: "HD 1080p", status: "ENDED", startedAt: "04:30 AM", endedAt: "05:15 AM" },
  { id: "ls3", title: "Evening Aarti", temple: "Somnath", priest: "Guruji Chandrashekhar", viewers: 0, duration: "—", quality: "HD 1080p", status: "SCHEDULED", startedAt: "07:00 PM", endedAt: "—" },
  { id: "ls4", title: "Sahasranama Archana", temple: "Meenakshi Amman", priest: "Acharya Venkatesh Iyer", viewers: 0, duration: "—", quality: "HD 1080p", status: "SCHEDULED", startedAt: "Tomorrow, 06:00 AM", endedAt: "—" },
  { id: "ls5", title: "Kalyanotsavam", temple: "Tirumala Tirupati", priest: "Swami Krishnananda", viewers: 8400, duration: "2h 30m", quality: "HD 1080p", status: "ENDED", startedAt: "09:00 AM", endedAt: "11:30 AM" },
];

export function LiveStreamsPage() {
  const [filter, setFilter] = useState("All");
  const streams = defaultStreams;

  const live = streams.filter(s => s.status === "LIVE").length;
  const filtered = filter === "All" ? streams : streams.filter(s => s.status === filter);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Live Now", value: String(live), color: "#EF4444", bg: "#FFF1F2" },
          { label: "Total Viewers", value: streams.reduce((s, c) => s + c.viewers, 0).toLocaleString(), color: "#C76A00", bg: "#FFF0E6" },
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
    </div>
  );
}
