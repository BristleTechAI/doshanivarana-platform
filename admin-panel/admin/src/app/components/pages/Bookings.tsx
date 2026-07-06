import { useState, useEffect } from "react";
import { Search, Filter, Download, Eye, Edit, RefreshCcw, ChevronDown, Calendar, Building2, Package, CheckCircle, Clock, XCircle, Plus } from "lucide-react";
import { Modal, Field, ModalFooter, inputCls, selectStyle, inputStyle } from "../Modal";
import { BookingsService } from "../../../services/firebase/bookings";
import { SlotsService } from "../../../services/firebase/slots";
import { formatTimestamp, toDateObj } from "../../../services/firebase/core";
import { TemplesService } from "../../../services/firebase/temples";
import { PoojasService } from "../../../services/firebase/poojas";

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
  const [slots, setSlots] = useState<any[]>([]);
  const [temples, setTemples] = useState<any[]>([]);
  const [poojas, setPoojas] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const emptyForm = {
    devoteeName: "",
    devoteeEmail: "",
    slotId: "",
    amount: "501",
    paymentStatus: "Pending",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const unsubBookings = BookingsService.subscribeToBookings(setBookings);
    const unsubSlots = SlotsService.subscribeToSlots(setSlots);
    const unsubTemples = TemplesService.subscribeToTemples(setTemples);
    const unsubPoojas = PoojasService.subscribeToPoojas(setPoojas);
    return () => {
      unsubBookings();
      unsubSlots();
      unsubTemples();
      unsubPoojas();
    };
  }, []);

  const filtered = bookings.filter((b: any) => {
    const matchSearch =
      (b.bookingNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.devoteeName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.templeName || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.poojaName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || b.bookingStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginated = filtered.slice(startIndex, endIndex);

  const availableSlots = slots.filter(s => s.status !== "Full" && s.status !== "Cancelled");

  async function handleAdd() {
    if (!form.devoteeName || !form.slotId) {
      setErrorMsg("Please fill required fields.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      const slot = slots.find(s => s.id === form.slotId);
      if (!slot) throw new Error("Slot not found");

      const newId = `BK_${Date.now()}`;
      await BookingsService.createBooking(newId, {
        userId: "GUEST",
        devoteeName: form.devoteeName,
        devoteeEmail: form.devoteeEmail,
        slotId: slot.id,
        templeId: slot.templeId,
        templeName: temples.find(t => t.id === slot.templeId)?.name || "Unknown Temple",
        poojaId: slot.poojaId,
        poojaName: poojas.find(p => p.id === slot.poojaId)?.name || "Unknown Pooja",
        amount: `₹${form.amount}`,
        paymentStatus: form.paymentStatus,
        bookingStatus: "Pending"
      });
      setAddOpen(false);
      setForm(emptyForm);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      await BookingsService.updateBookingStatus(id, newStatus);
      if (selectedBooking) {
        setSelectedBooking({ ...selectedBooking, bookingStatus: newStatus });
      }
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    }
  }

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Bookings", value: bookings.length.toString(), color: "#C76A00", bg: "#FFF0E6" },
          { label: "Confirmed", value: bookings.filter((b: any) => b.bookingStatus === "Confirmed").length.toString(), color: "#2563EB", bg: "#EFF6FF" },
          { label: "Completed", value: bookings.filter((b: any) => b.bookingStatus === "Completed").length.toString(), color: "#16A34A", bg: "#F0FDF4" },
          { label: "Pending", value: bookings.filter((b: any) => b.bookingStatus === "Pending").length.toString(), color: "#D97706", bg: "#FFFBEB" },
          { label: "Cancelled", value: bookings.filter((b: any) => b.bookingStatus === "Cancelled").length.toString(), color: "#DC2626", bg: "#FFF1F2" },
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

          {/* Status tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["All", "Confirmed", "Completed", "Pending", "Cancelled"].map((s) => (
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

          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto"
            style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
            <Plus size={15} />
            Create Booking
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {paginated.map((b: any) => {
            const sc = statusConfig[b.bookingStatus] || statusConfig.Confirmed;
            const pc = paymentConfig[b.paymentStatus] || paymentConfig.Pending;
            return (
              <div key={b.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-mono" style={{ color: "#C76A00", fontWeight: 700 }}>{b.bookingNumber}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: "#C76A00", fontSize: "9px", fontWeight: 700 }}>
                        {b.devoteeName?.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{b.devoteeName}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>{b.bookingStatus}</span>
                </div>
                <div className="text-xs" style={{ color: "#6B7280" }}>{b.templeName}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{b.poojaName}</span>
                  <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 700 }}>{b.amount}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setSelectedBooking(b)} className="flex-1 py-2 rounded-lg text-xs flex items-center justify-center gap-1" style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}>
                    <Eye size={12} /> View
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
                {["Booking ID", "Devotee", "Temple", "Pooja", "Date Created", "Amount", "Payment", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((b: any) => {
                const sc = statusConfig[b.bookingStatus] || statusConfig.Pending;
                const pc = paymentConfig[b.paymentStatus] || paymentConfig.Pending;
                const StatusIcon = sc.icon;
                return (
                  <tr key={b.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono" style={{ color: "#C76A00", fontWeight: 600 }}>{b.bookingNumber}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                          style={{ backgroundColor: "#C76A00", fontWeight: 700 }}
                        >
                          {b.devoteeName?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{b.devoteeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#6B7280" }}>{b.templeName}</td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{b.poojaName}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color: "#6B7280" }}>
                      {formatTimestamp(b.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{b.amount}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: pc.bg, color: pc.color, fontWeight: 600 }}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon size={11} style={{ color: sc.color }} />
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                          {b.bookingStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelectedBooking(b)} className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors"><Eye size={13} style={{ color: "#C76A00" }} /></button>
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
            Showing {filtered.length === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, filtered.length)} of {filtered.length} bookings
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
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create Offline Booking">
        <div className="px-6 py-5 space-y-4">
          {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
          <Field label="Devotee Name">
            <input className={inputCls} style={inputStyle} value={form.devoteeName} onChange={e => setForm(f => ({...f, devoteeName: e.target.value}))} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} style={inputStyle} value={form.devoteeEmail} onChange={e => setForm(f => ({...f, devoteeEmail: e.target.value}))} />
          </Field>
          <Field label="Slot">
            <select className={inputCls} style={selectStyle} value={form.slotId} onChange={e => setForm(f => ({...f, slotId: e.target.value}))}>
              <option value="">Select an available slot...</option>
              {availableSlots.map(s => {
                const dObj = toDateObj(s.startTime);
                const timeStr = dObj ? dObj.toLocaleString() : 'Unknown Time';
                const tName = temples.find(t => t.id === s.templeId)?.name || "Unknown Temple";
                const pName = poojas.find(p => p.id === s.poojaId)?.name || "Unknown Pooja";
                return (
                  <option key={s.id} value={s.id}>
                    {timeStr} - {tName} - {pName} ({s.capacity - s.bookedCount} left)
                  </option>
                );
              })}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (₹)">
              <input type="number" className={inputCls} style={inputStyle} value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} />
            </Field>
            <Field label="Payment Status">
              <select className={inputCls} style={selectStyle} value={form.paymentStatus} onChange={e => setForm(f => ({...f, paymentStatus: e.target.value}))}>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </Field>
          </div>
        </div>
        <ModalFooter onClose={() => setAddOpen(false)} onSubmit={handleAdd} submitLabel="Create Booking" saving={saving} />
      </Modal>

      {selectedBooking && (
        <Modal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title={selectedBooking.bookingNumber} width="580px">
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: "#C76A00", fontWeight: 700, fontSize: 17 }}>
                {selectedBooking.devoteeName?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base" style={{ color: "#1F1F1F", fontWeight: 700 }}>{selectedBooking.devoteeName}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: statusConfig[selectedBooking.bookingStatus]?.bg, color: statusConfig[selectedBooking.bookingStatus]?.color, fontWeight: 600 }}>
                    {selectedBooking.bookingStatus}
                  </span>
                </div>
              </div>
              <div className="text-xl flex-shrink-0" style={{ color: "#1F1F1F", fontWeight: 700 }}>{selectedBooking.amount}</div>
            </div>

            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#FAF6F2" }}>
              <div className="text-xs mb-1" style={{ color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.08em" }}>BOOKING DETAILS</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Temple</div>
                  <div className="text-xs mt-0.5" style={{ color: "#1F1F1F", fontWeight: 600 }}>{selectedBooking.templeName}</div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>Pooja</div>
                  <div className="text-xs mt-0.5" style={{ color: "#1F1F1F", fontWeight: 600 }}>{selectedBooking.poojaName}</div>
                </div>
              </div>
            </div>

            {selectedBooking.bookingStatus === "Pending" && (
              <div className="flex gap-3">
                <button onClick={() => updateStatus(selectedBooking.id, "Confirmed")} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#EFF6FF", color: "#2563EB", fontWeight: 600 }}>
                  Confirm Booking
                </button>
                <button onClick={() => updateStatus(selectedBooking.id, "Cancelled")} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
                  Cancel Booking
                </button>
              </div>
            )}
            {selectedBooking.bookingStatus === "Confirmed" && (
              <div className="flex gap-3">
                <button onClick={() => updateStatus(selectedBooking.id, "Completed")} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                  Mark Completed
                </button>
                <button onClick={() => updateStatus(selectedBooking.id, "Cancelled")} className="flex-1 py-2 rounded-lg text-xs" style={{ backgroundColor: "#FFF1F2", color: "#DC2626", fontWeight: 600 }}>
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
