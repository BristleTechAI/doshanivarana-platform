import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, Edit, RefreshCcw, ChevronDown, Calendar, Building2, Package, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Modal, ModalFooter } from "../Modal";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

const statusConfig: Record<string, { bg: string; color: string; icon: typeof CheckCircle }> = {
  Confirmed: { bg: "#EFF6FF", color: "#2563EB", icon: CheckCircle },
  Completed: { bg: "#F0FDF4", color: "#16A34A", icon: CheckCircle },
  "In Progress": { bg: "#FFF0E6", color: "#C76A00", icon: Clock },
  Pending: { bg: "#FFFBEB", color: "#D97706", icon: Clock },
  Cancelled: { bg: "#FFF1F2", color: "#DC2626", icon: XCircle },
};

const deliveryConfig: Record<string, { bg: string; color: string }> = {
  Delivered: { bg: "#F0FDF4", color: "#16A34A" },
  Dispatched: { bg: "#EFF6FF", color: "#2563EB" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  "Not Required": { bg: "#F3F4F6", color: "#9CA3AF" },
  Failed: { bg: "#FFF1F2", color: "#DC2626" },
};

const paymentConfig: Record<string, { bg: string; color: string }> = {
  Paid: { bg: "#F0FDF4", color: "#16A34A" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  Refunded: { bg: "#FFF1F2", color: "#DC2626" },
};

export function Bookings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "bookings"), where("isDeleted", "==", false));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            devotee: d.devoteeDetails?.name || "Unknown",
            temple: d.templeName || "Temple",
            pooja: d.poojaName || "Pooja",
            date: d.scheduledDate || "",
            amount: `₹${d.amountPaid || 0}`,
            delivery: d.hasPrasadDelivery ? "Pending" : "Not Required",
            status: d.status === "COMPLETED" ? "Completed" : "Confirmed",
            payment: d.paymentStatus === "PAID" ? "Paid" : "Pending",
            lang: "Sanskrit", // Hardcoded for now
          };
        });

        // Sort by date descending
        data.sort((a, b) => b.date.localeCompare(a.date));
        
        setBookings(data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.devotee.toLowerCase().includes(search.toLowerCase()) ||
      b.temple.toLowerCase().includes(search.toLowerCase()) ||
      b.pooja.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Bookings", value: bookings.length.toString(), color: "#C76A00", bg: "#FFF0E6" },
          { label: "Confirmed", value: bookings.filter(b => b.status === "Confirmed").length.toString(), color: "#2563EB", bg: "#EFF6FF" },
          { label: "Completed", value: bookings.filter(b => b.status === "Completed").length.toString(), color: "#16A34A", bg: "#F0FDF4" },
          { label: "Pending", value: bookings.filter(b => b.status === "Pending").length.toString(), color: "#D97706", bg: "#FFFBEB" },
          { label: "Cancelled", value: bookings.filter(b => b.status === "Cancelled").length.toString(), color: "#DC2626", bg: "#FFF1F2" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Search by booking ID, devotee, temple, pooja..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)", color: "#1F1F1F" }}
            />
          </div>

          {/* Filter dropdowns */}
          {[
            { placeholder: "Temple", icon: Building2 },
            { placeholder: "Date", icon: Calendar },
            { placeholder: "Payment", icon: CheckCircle },
          ].map((f) => {
            const FIcon = f.icon;
            return (
              <button key={f.placeholder} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ border: "1px solid rgba(199,106,0,0.15)", color: "#6B7280", backgroundColor: "#FAF6F2" }}>
                <FIcon size={13} style={{ color: "#9CA3AF" }} />
                {f.placeholder}
                <ChevronDown size={12} />
              </button>
            );
          })}

          {/* Status tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["All", "Confirmed", "In Progress", "Completed", "Pending", "Cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  backgroundColor: statusFilter === s ? "#C76A00" : "transparent",
                  color: statusFilter === s ? "#FFFFFF" : "#6B7280",
                  fontWeight: statusFilter === s ? 600 : 400,
                  border: "1px solid",
                  borderColor: statusFilter === s ? "#C76A00" : "rgba(199,106,0,0.12)",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm ml-auto"
            style={{ border: "1px solid rgba(199,106,0,0.15)", color: "#C76A00", fontWeight: 600, backgroundColor: "#FFF0E6" }}>
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {filtered.map((b) => {
            const sc = statusConfig[b.status] || statusConfig.Confirmed;
            const dc = deliveryConfig[b.delivery] || deliveryConfig["Not Required"];
            const pc = paymentConfig[b.payment] || paymentConfig.Pending;
            return (
              <div key={b.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono" style={{ color: "#C76A00", fontWeight: 700 }}>{b.id}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: "#C76A00", fontSize: "9px", fontWeight: 700 }}>
                        {b.devotee.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                      </div>
                      <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{b.devotee}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{b.status}</span>
                </div>
                <div className="text-xs" style={{ color: "#6B7280" }}>{b.temple}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{b.pooja}</span>
                  <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700 }}>{b.amount}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: pc.bg, color: pc.color, fontWeight: 600 }}>{b.payment}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: dc.bg, color: dc.color, fontWeight: 600 }}>{b.delivery}</span>
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>{b.date}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setSelectedBooking(b)} className="flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1" style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
                    <Eye size={12} /> View
                  </button>
                  <button className="flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1" style={{ backgroundColor: "#F3F4F6", color: "#6B7280", fontWeight: 500 }}>
                    <Edit size={12} /> Edit
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
                {["Booking ID", "Devotee", "Temple", "Pooja / Service", "Date", "Amount", "Delivery", "Payment", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const sc = statusConfig[b.status] || statusConfig.Confirmed;
                const dc = deliveryConfig[b.delivery] || deliveryConfig["Not Required"];
                const pc = paymentConfig[b.payment] || paymentConfig.Pending;
                const StatusIcon = sc.icon;
                return (
                  <tr key={b.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono" style={{ color: "#C76A00", fontWeight: 600 }}>{b.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                          style={{ backgroundColor: "#C76A00", fontWeight: 700 }}
                        >
                          {b.devotee.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{b.devotee}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#6B7280" }}>{b.temple}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{b.pooja}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{b.lang}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "#6B7280" }}>{b.date}</td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{b.amount}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Package size={11} style={{ color: dc.color }} />
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: dc.bg, color: dc.color, fontWeight: 600 }}>
                          {b.delivery}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: pc.bg, color: pc.color, fontWeight: 600 }}>
                        {b.payment}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon size={11} style={{ color: sc.color }} />
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                          {b.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedBooking(b)} className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors"><Eye size={13} style={{ color: "#C76A00" }} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"><Edit size={13} style={{ color: "#6B7280" }} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><RefreshCcw size={13} style={{ color: "#EF4444" }} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            Showing {filtered.length} of {bookings.length} bookings
          </span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-7 h-7 rounded-lg text-xs transition-all"
                style={{
                  backgroundColor: page === p ? "#C76A00" : "transparent",
                  color: page === p ? "#FFFFFF" : "#6B7280",
                  fontWeight: page === p ? 600 : 400,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Modal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title={selectedBooking.id} width="580px">
          <div className="px-6 py-5 space-y-4">
            {/* Devotee header */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: "#C76A00", fontWeight: 700, fontSize: 17 }}>
                {selectedBooking.devotee.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base" style={{ color: "#1F1F1F", fontWeight: 700 }}>{selectedBooking.devotee}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: statusConfig[selectedBooking.status]?.bg, color: statusConfig[selectedBooking.status]?.color, fontWeight: 600 }}>
                    {selectedBooking.status}
                  </span>
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>{selectedBooking.lang}</span>
                </div>
              </div>
              <div className="text-xl flex-shrink-0" style={{ color: "#1F1F1F", fontWeight: 700 }}>{selectedBooking.amount}</div>
            </div>

            {/* Booking Info */}
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#FAF6F2" }}>
              <div className="text-xs mb-1" style={{ color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em" }}>BOOKING DETAILS</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Temple</div>
                  <div className="text-xs mt-0.5" style={{ color: "#1F1F1F", fontWeight: 600 }}>{selectedBooking.temple}</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Pooja / Service</div>
                  <div className="text-xs mt-0.5" style={{ color: "#1F1F1F", fontWeight: 600 }}>{selectedBooking.pooja}</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Scheduled Date</div>
                  <div className="text-xs mt-0.5" style={{ color: "#1F1F1F", fontWeight: 600 }}>{selectedBooking.date}</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Language</div>
                  <div className="text-xs mt-0.5">
                    <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F3E8FF", color: "#4A1259", fontWeight: 500 }}>{selectedBooking.lang}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: "#FAF6F2" }}>
              <div className="text-xs mb-1" style={{ color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em" }}>PAYMENT</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Amount Paid</div>
                  <div className="text-base mt-0.5" style={{ color: "#1F1F1F", fontWeight: 700 }}>{selectedBooking.amount}</div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: paymentConfig[selectedBooking.payment]?.bg, color: paymentConfig[selectedBooking.payment]?.color, fontWeight: 600 }}>
                  {selectedBooking.payment}
                </span>
              </div>
            </div>

            {/* Prasad Delivery */}
            <div className="rounded-xl p-4" style={{ backgroundColor: "#FAF6F2" }}>
              <div className="text-xs mb-2" style={{ color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em" }}>PRASAD DELIVERY</div>
              <div className="flex items-center gap-2">
                <Package size={13} style={{ color: deliveryConfig[selectedBooking.delivery]?.color || "#9CA3AF" }} />
                <span className="text-xs px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: deliveryConfig[selectedBooking.delivery]?.bg, color: deliveryConfig[selectedBooking.delivery]?.color, fontWeight: 600 }}>
                  {selectedBooking.delivery}
                </span>
              </div>
            </div>

            {/* Actions */}
            {(selectedBooking.status === "Confirmed" || selectedBooking.status === "Pending") && (
              <div className="flex gap-3">
                <button className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#EFF6FF", color: "#2563EB", fontWeight: 600 }}>
                  Reschedule
                </button>
                <button className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
          <ModalFooter onClose={() => setSelectedBooking(null)} onSubmit={() => setSelectedBooking(null)} submitLabel="Close" />
        </Modal>
      )}
    </div>
  );
}
