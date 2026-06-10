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



const refunds = [
  { id: "RF-1284", devotee: "Deepak Joshi", booking: "BK-2024-8414", temple: "Vaishno Devi", pooja: "Vishnu Sahasranamam", amount: "₹1,600", reason: "Service cancelled by temple", method: "UPI", status: "Approved", requested: "06 Jun 2026", processed: "08 Jun 2026" },
  { id: "RF-1283", devotee: "Mohan Das", booking: "BK-2024-8417", temple: "Shirdi Sai Baba", pooja: "Kakad Aarti", amount: "₹800", reason: "Devotee requested cancellation (24h notice)", method: "Card", status: "Approved", requested: "07 Jun 2026", processed: "08 Jun 2026" },
  { id: "RF-1282", devotee: "Ramesh Pillai", booking: "BK-2024-8231", temple: "Padmanabhaswamy", pooja: "Navakabhishekam", amount: "₹5,200", reason: "Technical issue — stream failed", method: "NetBanking", status: "Pending", requested: "07 Jun 2026", processed: "—" },
  { id: "RF-1281", devotee: "Ankit Sharma", booking: "BK-2024-8109", temple: "Kashi Vishwanath", pooja: "Rudrabhishek", amount: "₹3,200", reason: "Priest not available, service rescheduled", method: "UPI", status: "Pending", requested: "06 Jun 2026", processed: "—" },
  { id: "RF-1280", devotee: "Priya Nair", booking: "BK-2024-7984", temple: "Sabarimala Temple", pooja: "Abhishekam", amount: "₹1,800", reason: "Dispute — prasad not delivered", method: "Card", status: "Under Review", requested: "05 Jun 2026", processed: "—" },
  { id: "RF-1279", devotee: "Kavitha Iyer", booking: "BK-2024-7842", temple: "Meenakshi Amman", pooja: "Archana", amount: "₹1,200", reason: "Fraudulent transaction", method: "UPI", status: "Rejected", requested: "04 Jun 2026", processed: "06 Jun 2026" },
];

const rfStatusCfg: Record<string, { bg: string; color: string }> = {
  Approved: { bg: "#F0FDF4", color: "#16A34A" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  "Under Review": { bg: "#EFF6FF", color: "#2563EB" },
  Rejected: { bg: "#FFF1F2", color: "#DC2626" },
};

export function RefundsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [refundsState, setRefundsState] = useState(refunds);

  function updateRefundStatus(id: string, status: string) {
    setRefundsState(prev => prev.map(r => r.id === id ? { ...r, status, processed: status === "Approved" || status === "Rejected" ? "08 Jun 2026" : r.processed } : r));
  }

  const filtered = refundsState.filter(r => statusFilter === "All" || r.status === statusFilter);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Approval", value: String(refundsState.filter(r => r.status === "Pending" || r.status === "Under Review").length), color: "#D97706", bg: "#FFFBEB" },
          { label: "Approved This Month", value: String(refundsState.filter(r => r.status === "Approved").length), color: "#22C55E", bg: "#F0FDF4" },
          { label: "Total Refund Value", value: "₹2.8L", color: "#EF4444", bg: "#FFF1F2" },
          { label: "Avg Processing Time", value: "1.4 days", color: "#4A1259", bg: "#F3E8FF" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {["All", "Pending", "Under Review", "Approved", "Rejected"].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: statusFilter === f ? "#C76A00" : "#FAF6F2", color: statusFilter === f ? "#FFFFFF" : "#6B7280", fontWeight: statusFilter === f ? 600 : 400, border: "1px solid", borderColor: statusFilter === f ? "#C76A00" : "rgba(199,106,0,0.15)" }}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {filtered.map(r => {
            const sc = rfStatusCfg[r.status];
            return (
              <div key={r.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono" style={{ color: "#C76A00", fontWeight: 700 }}>{r.id}</span>
                    <div className="text-sm mt-0.5" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.devotee}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span>
                </div>
                <div className="text-xs" style={{ color: "#6B7280" }}>{r.temple} · {r.pooja}</div>
                <div className="text-xs" style={{ color: "#9CA3AF" }}>{r.reason}</div>
                <div className="flex items-center justify-between">
                  <span className="text-base" style={{ color: "#EF4444", fontWeight: 700 }}>{r.amount}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>{r.method}</span>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>{r.requested}</span>
                  </div>
                </div>
                {(r.status === "Pending" || r.status === "Under Review") && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => updateRefundStatus(r.id, "Approved")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button onClick={() => updateRefundStatus(r.id, "Rejected")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
                {r.status === "Approved" && <div className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>✓ Approved</div>}
                {r.status === "Rejected" && <div className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>✗ Rejected</div>}
              </div>
            );
          })}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#FAF6F2" }}>
                {["Refund ID", "Devotee", "Temple / Pooja", "Amount", "Reason", "Method", "Requested", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const sc = rfStatusCfg[r.status];
                return (
                  <tr key={r.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-4 py-3.5 text-xs font-mono" style={{ color: "#C76A00", fontWeight: 600 }}>{r.id}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{r.devotee}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{r.temple}</div>
                      <div className="text-xs" style={{ color: "#9CA3AF" }}>{r.pooja}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#EF4444", fontWeight: 700 }}>{r.amount}</td>
                    <td className="px-4 py-3.5 text-xs max-w-40" style={{ color: "#6B7280" }}>{r.reason}</td>
                    <td className="px-4 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>{r.method}</span></td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "#9CA3AF" }}>{r.requested}</td>
                    <td className="px-4 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5 items-center">
                        {(r.status === "Pending" || r.status === "Under Review") && (
                          <>
                            <button onClick={() => updateRefundStatus(r.id, "Approved")} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-green-50 transition-colors" style={{ color: "#16A34A", fontWeight: 600 }}>
                              <CheckCircle2 size={12} /> Approve
                            </button>
                            <button onClick={() => updateRefundStatus(r.id, "Rejected")} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-red-50 transition-colors" style={{ color: "#DC2626", fontWeight: 600 }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {r.status === "Approved" && <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#16A34A", backgroundColor: "#F0FDF4", fontWeight: 600 }}>✓ Approved</span>}
                        {r.status === "Rejected" && <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#DC2626", backgroundColor: "#FFF1F2", fontWeight: 600 }}>✗ Rejected</span>}
                        <button className="p-1.5 rounded-lg hover:bg-orange-50"><Eye size={13} style={{ color: "#C76A00" }} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

