import { useState, useEffect } from "react";
import { Modal, Field, ModalFooter, inputCls, inputStyle, selectStyle } from "../Modal";
import {
  Package, CheckCircle, Truck, XCircle, Clock, Plus, Edit, Eye, Navigation
} from "lucide-react";
import { DeliveriesService, DeliveryStatus } from "../../../services/firebase/deliveries";
import { BookingsService } from "../../../services/firebase/bookings";
import { formatTimestamp } from "../../../services/firebase/core";

const kanbanCols = [
  { key: "Processing", label: "Processing", color: "#D97706", bg: "#FFFBEB", headerBg: "#FEF3C7", icon: Package },
  { key: "Packed", label: "Packed", color: "#7B3FA0", bg: "#F3E8FF", headerBg: "#EDE9FE", icon: Package },
  { key: "Shipped", label: "Shipped", color: "#C76A00", bg: "#FFF0E6", headerBg: "#FFEDD5", icon: Truck },
  { key: "Out For Delivery", label: "Out For Delivery", color: "#2563EB", bg: "#EFF6FF", headerBg: "#DBEAFE", icon: Navigation },
  { key: "Delivered", label: "Delivered", color: "#16A34A", bg: "#F0FDF4", headerBg: "#DCFCE7", icon: CheckCircle },
  { key: "Failed", label: "Failed", color: "#DC2626", bg: "#FFF1F2", headerBg: "#FEE2E2", icon: XCircle },
  { key: "Returned", label: "Returned", color: "#9CA3AF", bg: "#F3F4F6", headerBg: "#E5E7EB", icon: XCircle },
];

export function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const emptyForm = { bookingId: "", shippingAddress: "", carrier: "", trackingNumber: "", eta: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const unsubDels = DeliveriesService.subscribeToDeliveries(setDeliveries);
    const unsubBks = BookingsService.subscribeToBookings(setBookings);
    return () => { unsubDels(); unsubBks(); };
  }, []);

  // Filter bookings for creation:
  // Must be Confirmed/Completed AND not already have a delivery.
  const activeDeliveryBookingIds = new Set(deliveries.map(d => d.bookingId));
  const validBookings = bookings.filter(b => 
    (b.bookingStatus === "Confirmed" || b.bookingStatus === "Completed") && 
    !activeDeliveryBookingIds.has(b.id)
  );

  async function handleCreate() {
    if (!form.bookingId) {
      setErrorMsg("Booking is required.");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      const newId = `DEL_${Date.now()}`;
      await DeliveriesService.createDelivery(newId, {
        bookingId: form.bookingId,
        shippingAddress: form.shippingAddress,
        carrier: form.carrier,
        trackingNumber: form.trackingNumber,
        eta: form.eta,
      });
      setCreateOpen(false);
      setForm(emptyForm);
    } catch(e: any) {
      setErrorMsg(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, newStatus: DeliveryStatus) {
    try {
      await DeliveriesService.updateDeliveryStatus(id, newStatus);
      if (selectedDelivery) setSelectedDelivery({ ...selectedDelivery, status: newStatus });
    } catch(e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleUpdateDetails() {
    if (!selectedDelivery) return;
    setSaving(true);
    try {
      await DeliveriesService.updateDelivery(selectedDelivery.id, {
        trackingNumber: selectedDelivery.trackingNumber,
        carrier: selectedDelivery.carrier,
        shippingAddress: selectedDelivery.shippingAddress,
        eta: selectedDelivery.eta
      });
      alert("Updated successfully!");
    } catch(e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold" style={{ color: "#1F1F1F" }}>Prasad Deliveries</h2>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
          style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
          <Plus size={15} />
          Create Delivery
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
        {kanbanCols.map(col => {
          const Icon = col.icon;
          const count = deliveries.filter(d => d.status === col.key).length;
          return (
            <div key={col.key} className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: col.bg }}>
                <Icon size={14} style={{ color: col.color }} />
              </div>
              <div style={{ color: col.color, fontWeight: 700, fontSize: 20 }}>{count}</div>
              <div className="text-xs mt-0.5" style={{ color: "#9CA3AF", lineHeight: 1.3 }}>{col.label}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {kanbanCols.map(col => {
          const colItems = deliveries.filter(d => d.status === col.key);
          const Icon = col.icon;
          return (
            <div key={col.key} className="flex-shrink-0 w-64 flex flex-col gap-2">
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: col.headerBg }}>
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{ color: col.color }} />
                  <span style={{ color: col.color, fontWeight: 700, fontSize: 12 }}>{col.label}</span>
                </div>
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: col.color, color: "#FFFFFF", fontWeight: 700 }}>{colItems.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {colItems.map(d => (
                  <div key={d.id} onClick={() => setSelectedDelivery(d)} className="bg-white rounded-xl border p-3 hover:shadow-sm transition-shadow cursor-pointer" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: "#C76A00", fontSize: 10, fontWeight: 700 }}>
                        {d.devoteeName?.slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate" style={{ color: "#1F1F1F", fontWeight: 600 }}>{d.devoteeName}</div>
                        <div className="text-[10px]" style={{ color: "#9CA3AF" }}>{d.bookingNumber}</div>
                      </div>
                    </div>
                    <div className="text-xs mb-2.5" style={{ color: "#9CA3AF" }}>{d.templeName}</div>
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                      <span className="text-xs font-mono" style={{ color: "#6B7280", fontWeight: 700 }}>{d.carrier || "—"}</span>
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#9CA3AF" }}>
                        <Clock size={10} /> {d.eta || "No ETA"}
                      </div>
                    </div>
                    <div className="mt-1.5 text-xs font-mono" style={{ color: "#D1D5DB" }}>{d.awbNumber || d.trackingNumber || "No Tracking"}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Delivery Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setForm(emptyForm); setErrorMsg(""); }} title="Create Delivery">
        <div className="px-6 py-5 space-y-4">
          {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
          <Field label="Booking">
            <select className={inputCls} style={selectStyle} value={form.bookingId} onChange={e => setForm(f => ({...f, bookingId: e.target.value}))}>
              <option value="">Select a booking...</option>
              {validBookings.map(b => (
                <option key={b.id} value={b.id}>{b.bookingNumber} - {b.devoteeName} ({b.poojaName})</option>
              ))}
            </select>
          </Field>
          <Field label="Shipping Address">
            <textarea className={inputCls} style={{...inputStyle, resize: "none"}} rows={3} value={form.shippingAddress} onChange={e => setForm(f => ({...f, shippingAddress: e.target.value}))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Carrier">
              <input className={inputCls} style={inputStyle} value={form.carrier} onChange={e => setForm(f => ({...f, carrier: e.target.value}))} />
            </Field>
            <Field label="Tracking Number">
              <input className={inputCls} style={inputStyle} value={form.trackingNumber} onChange={e => setForm(f => ({...f, trackingNumber: e.target.value}))} />
            </Field>
          </div>
          <Field label="ETA (e.g. 15 Jun 2026)">
            <input className={inputCls} style={inputStyle} value={form.eta} onChange={e => setForm(f => ({...f, eta: e.target.value}))} />
          </Field>
        </div>
        <ModalFooter onClose={() => { setCreateOpen(false); setForm(emptyForm); }} onSubmit={handleCreate} submitLabel="Create" saving={saving} />
      </Modal>

      {/* Delivery Details Modal */}
      {selectedDelivery && (
        <Modal open={!!selectedDelivery} onClose={() => setSelectedDelivery(null)} title={`Delivery: ${selectedDelivery.bookingNumber}`}>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">{selectedDelivery.devoteeName}</div>
                <div className="text-xs text-gray-500">{selectedDelivery.templeName}</div>
              </div>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{selectedDelivery.status}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg space-y-3">
              <Field label="Tracking Number">
                <input className={inputCls} style={inputStyle} value={selectedDelivery.trackingNumber || ""} onChange={e => setSelectedDelivery({...selectedDelivery, trackingNumber: e.target.value})} />
              </Field>
              <Field label="Carrier">
                <input className={inputCls} style={inputStyle} value={selectedDelivery.carrier || ""} onChange={e => setSelectedDelivery({...selectedDelivery, carrier: e.target.value})} />
              </Field>
              <Field label="ETA">
                <input className={inputCls} style={inputStyle} value={selectedDelivery.eta || ""} onChange={e => setSelectedDelivery({...selectedDelivery, eta: e.target.value})} />
              </Field>
              <button onClick={handleUpdateDetails} disabled={saving} className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded font-bold">Update Details</button>
            </div>

            <div className="text-xs font-bold text-gray-400 mt-4">CHANGE STATUS</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => updateStatus(selectedDelivery.id, "Processing")} className="px-3 py-1.5 bg-gray-100 rounded text-xs">Processing</button>
              <button onClick={() => updateStatus(selectedDelivery.id, "Packed")} className="px-3 py-1.5 bg-gray-100 rounded text-xs">Packed</button>
              <button onClick={() => updateStatus(selectedDelivery.id, "Shipped")} className="px-3 py-1.5 bg-gray-100 rounded text-xs">Shipped</button>
              <button onClick={() => updateStatus(selectedDelivery.id, "Out For Delivery")} className="px-3 py-1.5 bg-gray-100 rounded text-xs">Out For Delivery</button>
              <button onClick={() => updateStatus(selectedDelivery.id, "Delivered")} className="px-3 py-1.5 bg-green-100 text-green-700 rounded text-xs">Delivered</button>
              <button onClick={() => updateStatus(selectedDelivery.id, "Failed")} className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs">Failed</button>
              <button onClick={() => updateStatus(selectedDelivery.id, "Returned")} className="px-3 py-1.5 bg-gray-200 rounded text-xs">Returned</button>
            </div>
            
            {selectedDelivery.deliveredAt && (
              <div className="text-xs text-green-600 mt-2">Delivered at: {formatTimestamp(selectedDelivery.deliveredAt)}</div>
            )}
          </div>
          <ModalFooter onClose={() => setSelectedDelivery(null)} onSubmit={() => setSelectedDelivery(null)} submitLabel="Close" />
        </Modal>
      )}
    </div>
  );
}
