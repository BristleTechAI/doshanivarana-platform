import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const rfStatusCfg: Record<string, { bg: string; color: string }> = {
  APPROVED: { bg: "#F0FDF4", color: "#16A34A" },
  REQUESTED: { bg: "#FFFBEB", color: "#D97706" },
  "Under Review": { bg: "#EFF6FF", color: "#2563EB" },
  REJECTED: { bg: "#FFF1F2", color: "#DC2626" },
};

export function RefundsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [refundsState, setRefundsState] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "refunds"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRefundsState(data);
    });
    return () => unsubscribe();
  }, []);

  async function updateRefundStatus(id: string, status: string, bookingId: string, amount: number, userId: string) {
    try {
      await updateDoc(doc(db, "refunds", id), {
        status,
        updatedAt: serverTimestamp()
      });

      if (status === "APPROVED") {
        const eventRef = doc(collection(db, "systemEvents"));
        await setDoc(eventRef, {
          eventType: "refund.approved",
          entityId: id,
          entityType: "refund",
          payload: { refundId: id, bookingId, userId, amount },
          status: "PENDING",
          createdAt: serverTimestamp()
        });
      }

      const auditRef = doc(collection(db, "auditLogs"));
      await setDoc(auditRef, {
        action: `Refund ${status}`,
        entityId: id,
        entityType: "refund",
        performedBy: "admin_global",
        details: `Refund ${id} was ${status} for amount ${amount}`,
        createdAt: serverTimestamp()
      });

    } catch (e) {
      console.error("Failed to update refund", e);
    }
  }

  const filtered = refundsState.filter(r => statusFilter === "All" || r.status === statusFilter || (statusFilter === "Pending" && r.status === "REQUESTED"));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Approval", value: String(refundsState.filter(r => r.status === "REQUESTED").length), color: "#D97706", bg: "#FFFBEB" },
          { label: "Approved", value: String(refundsState.filter(r => r.status === "APPROVED").length), color: "#22C55E", bg: "#F0FDF4" },
          { label: "Total Refund Value", value: "—", color: "#EF4444", bg: "#FFF1F2" },
          { label: "Avg Processing Time", value: "—", color: "#4A1259", bg: "#F3E8FF" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-4 border flex flex-wrap items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {["All", "Pending", "APPROVED", "REJECTED"].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ backgroundColor: statusFilter === f ? "#C76A00" : "#FAF6F2", color: statusFilter === f ? "#FFFFFF" : "#6B7280", fontWeight: statusFilter === f ? 600 : 400, border: "1px solid", borderColor: statusFilter === f ? "#C76A00" : "rgba(199,106,0,0.15)" }}>
            {f === "Pending" ? "Requested" : f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {filtered.map(r => {
            const sc = rfStatusCfg[r.status] || rfStatusCfg["REQUESTED"];
            return (
              <div key={r.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono" style={{ color: "#C76A00", fontWeight: 700 }}>{r.id.slice(0, 8)}...</span>
                    <div className="text-sm mt-0.5" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.userId}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span>
                </div>
                <div className="text-xs" style={{ color: "#6B7280" }}>Booking: {r.bookingId}</div>
                <div className="text-xs" style={{ color: "#9CA3AF" }}>{r.reason}</div>
                <div className="flex items-center justify-between">
                  <span className="text-base" style={{ color: "#EF4444", fontWeight: 700 }}>₹{r.amount}</span>
                </div>
                {r.status === "REQUESTED" && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => updateRefundStatus(r.id, "APPROVED", r.bookingId, r.amount, r.userId)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button onClick={() => updateRefundStatus(r.id, "REJECTED", r.bookingId, r.amount, r.userId)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
                {r.status === "APPROVED" && <div className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>✓ Approved</div>}
                {r.status === "REJECTED" && <div className="text-xs py-2 text-center rounded-xl" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>✗ Rejected</div>}
              </div>
            );
          })}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#FAF6F2" }}>
                {["Refund ID", "User ID", "Booking ID", "Amount", "Reason", "Requested", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const sc = rfStatusCfg[r.status] || rfStatusCfg["REQUESTED"];
                return (
                  <tr key={r.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-4 py-3.5 text-xs font-mono" style={{ color: "#C76A00", fontWeight: 600 }}>{r.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{r.userId}</td>
                    <td className="px-4 py-3.5 text-xs">{r.bookingId}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#EF4444", fontWeight: 700 }}>₹{r.amount}</td>
                    <td className="px-4 py-3.5 text-xs max-w-40" style={{ color: "#6B7280" }}>{r.reason}</td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "#9CA3AF" }}>{r.createdAt?.toDate().toLocaleDateString()}</td>
                    <td className="px-4 py-3.5"><span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{r.status}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5 items-center">
                        {r.status === "REQUESTED" && (
                          <>
                            <button onClick={() => updateRefundStatus(r.id, "APPROVED", r.bookingId, r.amount, r.userId)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-green-50 transition-colors" style={{ color: "#16A34A", fontWeight: 600 }}>
                              <CheckCircle2 size={12} /> Approve
                            </button>
                            <button onClick={() => updateRefundStatus(r.id, "REJECTED", r.bookingId, r.amount, r.userId)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-red-50 transition-colors" style={{ color: "#DC2626", fontWeight: 600 }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {r.status === "APPROVED" && <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#16A34A", backgroundColor: "#F0FDF4", fontWeight: 600 }}>✓ Approved</span>}
                        {r.status === "REJECTED" && <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "#DC2626", backgroundColor: "#FFF1F2", fontWeight: 600 }}>✗ Rejected</span>}
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
