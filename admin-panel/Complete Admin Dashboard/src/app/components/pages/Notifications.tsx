import { useState } from "react";
import { Bell, Smartphone, Mail, MessageSquare, Radio, Package, PartyPopper, Plus, Send, Eye, Trash2, CheckCircle, Clock } from "lucide-react";
import { Modal, Field, ModalFooter, inputCls, inputStyle, selectStyle } from "../Modal";

const notifTypes = [
  { id: "push", label: "Push Notifications", icon: Bell, count: 284, color: "#C76A00", bg: "#FFF0E6" },
  { id: "sms", label: "SMS Alerts", icon: Smartphone, count: 142, color: "#4A1259", bg: "#F3E8FF" },
  { id: "email", label: "Email Campaigns", icon: Mail, count: 68, color: "#D4A017", bg: "#FFFBEB" },
  { id: "live", label: "Live Stream Alerts", icon: Radio, count: 18, color: "#EF4444", bg: "#FFF1F2" },
];

const emptyCampaignForm = { title: "", type: "Push", target: "", message: "", scheduleDate: "", scheduleTime: "" };

const campaigns = [
  { id: "NC001", title: "Navratri Special Packages — Book Now!", type: "Push", target: "All Telugu Users", sent: 284000, opened: 98400, status: "Sent", date: "07 Jun 2026" },
  { id: "NC002", title: "Live Stream Alert: Rudrabhishek Starts in 30 Minutes", type: "Push", target: "Kashi Vishwanath Subscribers", sent: 42800, opened: 31200, status: "Sent", date: "08 Jun 2026" },
  { id: "NC003", title: "Your Prasad Has Been Dispatched — Track Now", type: "SMS", target: "Delivery Pending Users", sent: 1284, opened: 1284, status: "Sent", date: "08 Jun 2026" },
  { id: "NC004", title: "Diwali Deepotsav 2026 — Early Booking Open!", type: "Email", target: "Premium Devotees", sent: 142000, opened: 68400, status: "Scheduled", date: "09 Jun 2026" },
  { id: "NC005", title: "Festival Alert: Sabarimala Mandala Season Begins", type: "Push", target: "All Kerala Users", sent: 0, opened: 0, status: "Draft", date: "—" },
  { id: "NC006", title: "New Temple Onboarded: Sri Ranganathaswamy Temple", type: "Push", target: "All Users", sent: 0, opened: 0, status: "Draft", date: "—" },
];

const statusConfig: Record<string, { bg: string; color: string; icon: typeof CheckCircle }> = {
  Sent: { bg: "#F0FDF4", color: "#16A34A", icon: CheckCircle },
  Scheduled: { bg: "#EFF6FF", color: "#2563EB", icon: Clock },
  Draft: { bg: "#F3F4F6", color: "#9CA3AF", icon: Bell },
};

const typeConfig: Record<string, { bg: string; color: string }> = {
  Push: { bg: "#FFF0E6", color: "#C76A00" },
  SMS: { bg: "#F3E8FF", color: "#4A1259" },
  Email: { bg: "#FFFBEB", color: "#D4A017" },
};

export function Notifications() {
  const [activeTab, setActiveTab] = useState("all");
  const [campaignsState, setCampaignsState] = useState(campaigns);
  const [createOpen, setCreateOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm);

  function handleCreateCampaign() {
    if (!campaignForm.title || !campaignForm.target) return;
    const isScheduled = !!(campaignForm.scheduleDate && campaignForm.scheduleTime);
    const newCampaign = {
      id: `NC${String(campaignsState.length + 1).padStart(3, "0")}`,
      title: campaignForm.title,
      type: campaignForm.type,
      target: campaignForm.target,
      sent: 0,
      opened: 0,
      status: isScheduled ? "Scheduled" : "Draft",
      date: isScheduled ? campaignForm.scheduleDate : "—",
    };
    setCampaignsState(prev => [newCampaign, ...prev]);
    setCampaignForm(emptyCampaignForm);
    setCreateOpen(false);
  }

  return (
    <div className="space-y-5">
      {/* Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {notifTypes.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.id} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.bg }}>
                  <Icon size={18} style={{ color: t.color }} />
                </div>
                <div className="text-xl" style={{ color: "#1F1F1F", fontWeight: 700 }}>{t.count}</div>
              </div>
              <div className="text-xs" style={{ color: "#6B7280" }}>{t.label}</div>
            </div>
          );
        })}
      </div>

      {/* Compose button + filters */}
      <div className="bg-white rounded-xl p-4 border flex items-center gap-3 flex-wrap" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="flex items-center gap-1.5">
          {["all", "push", "sms", "email", "live"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-3 py-1.5 rounded-lg text-xs capitalize transition-all"
              style={{ backgroundColor: activeTab === tab ? "#C76A00" : "#FAF6F2", color: activeTab === tab ? "#FFFFFF" : "#6B7280", fontWeight: activeTab === tab ? 600 : 400, border: "1px solid", borderColor: activeTab === tab ? "#C76A00" : "rgba(199,106,0,0.15)" }}>
              {tab === "all" ? "All Campaigns" : tab.toUpperCase()}
            </button>
          ))}
        </div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm ml-auto"
          style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
          <Plus size={15} />
          Create Campaign
        </button>
      </div>

      {/* Campaigns table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {campaignsState.map((c) => {
            const sc = statusConfig[c.status];
            const tc = typeConfig[c.type] || typeConfig.Push;
            const StatusIcon = sc.icon;
            const openRate = c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0;
            return (
              <div key={c.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: "#1F1F1F", fontWeight: 600 }}>{c.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{c.target}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: tc.bg, color: tc.color, fontWeight: 600 }}>{c.type}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap text-xs">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                    <StatusIcon size={10} />{c.status}
                  </span>
                  {c.sent > 0 && <span style={{ color: "#6B7280" }}>{c.sent.toLocaleString()} sent · {openRate}% open rate</span>}
                  <span style={{ color: "#9CA3AF" }}>{c.date}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="p-2 rounded-lg" style={{ minHeight: "44px", minWidth: "44px" }}><Eye size={14} style={{ color: "#C76A00" }} /></button>
                  {c.status === "Draft" && <button className="p-2 rounded-lg" style={{ minHeight: "44px", minWidth: "44px" }}><Send size={14} style={{ color: "#22C55E" }} /></button>}
                  <button className="p-2 rounded-lg" style={{ minHeight: "44px", minWidth: "44px" }}><Trash2 size={14} style={{ color: "#EF4444" }} /></button>
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
                {["Campaign", "Type", "Target Audience", "Sent", "Opened / Read", "Open Rate", "Date", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaignsState.map((c) => {
                const sc = statusConfig[c.status];
                const tc = typeConfig[c.type] || typeConfig.Push;
                const StatusIcon = sc.icon;
                const openRate = c.sent > 0 ? Math.round((c.opened / c.sent) * 100) : 0;
                return (
                  <tr key={c.id} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-5 py-3.5">
                      <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{c.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#9CA3AF", fontFamily: "monospace" }}>{c.id}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tc.bg, color: tc.color, fontWeight: 600 }}>
                        {c.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#6B7280" }}>{c.target}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{c.sent > 0 ? c.sent.toLocaleString() : "—"}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F" }}>{c.opened > 0 ? c.opened.toLocaleString() : "—"}</td>
                    <td className="px-5 py-3.5">
                      {c.sent > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full" style={{ backgroundColor: "#F3EDE8" }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${openRate}%`, backgroundColor: "#22C55E" }} />
                          </div>
                          <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{openRate}%</span>
                        </div>
                      ) : <span className="text-xs" style={{ color: "#9CA3AF" }}>—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: "#9CA3AF" }}>{c.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <StatusIcon size={11} style={{ color: sc.color }} />
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                          {c.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button className="p-1.5 rounded-lg hover:bg-orange-50 transition-colors"><Eye size={13} style={{ color: "#C76A00" }} /></button>
                        {c.status === "Draft" && <button className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"><Send size={13} style={{ color: "#22C55E" }} /></button>}
                        <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={13} style={{ color: "#EF4444" }} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick notification categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Festival Announcements", icon: PartyPopper, desc: "Notify all users about upcoming festivals, special events, and seasonal offerings.", count: 6, color: "#D4A017", bg: "#FFFBEB" },
          { label: "Live Stream Alerts", icon: Radio, desc: "Auto-send alerts to subscribers when a live stream starts at their followed temples.", count: 18, color: "#EF4444", bg: "#FFF1F2" },
          { label: "Delivery Notifications", icon: Package, desc: "Automated prasad delivery tracking notifications sent at each delivery milestone.", count: 312, color: "#4A1259", bg: "#F3E8FF" },
        ].map((c) => {
          const CIcon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                  <CIcon size={20} style={{ color: c.color }} />
                </div>
                <div>
                  <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{c.label}</div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>{c.count} active</div>
                </div>
              </div>
              <p className="text-xs mb-3" style={{ color: "#6B7280", lineHeight: 1.6 }}>{c.desc}</p>
              <button className="text-xs" style={{ color: c.color, fontWeight: 600 }}>Manage →</button>
            </div>
          );
        })}
      </div>

      {/* Create Campaign Modal */}
      <Modal open={createOpen} onClose={() => { setCreateOpen(false); setCampaignForm(emptyCampaignForm); }} title="Create Notification Campaign" width="520px">
        <div className="px-6 py-5 space-y-4">
          <Field label="Campaign Title">
            <input className={inputCls} style={inputStyle} placeholder="e.g. Navratri Special Packages — Book Now!" value={campaignForm.title} onChange={e => setCampaignForm(f => ({ ...f, title: e.target.value }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Channel">
              <select className={inputCls} style={selectStyle} value={campaignForm.type} onChange={e => setCampaignForm(f => ({ ...f, type: e.target.value }))}>
                {["Push", "SMS", "Email"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Target Audience">
              <select className={inputCls} style={selectStyle} value={campaignForm.target} onChange={e => setCampaignForm(f => ({ ...f, target: e.target.value }))}>
                {["", "All Users", "Premium Devotees", "All Telugu Users", "All Tamil Users", "All Kerala Users", "Kashi Vishwanath Subscribers", "Delivery Pending Users", "New Registrations"].map(t => <option key={t} value={t}>{t || "Select audience…"}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Message / Body">
            <textarea className={inputCls} style={{ ...inputStyle, resize: "none" }} rows={3} placeholder="Write your notification message..." value={campaignForm.message} onChange={e => setCampaignForm(f => ({ ...f, message: e.target.value }))} />
          </Field>
          <div className="rounded-xl p-4" style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.12)" }}>
            <div className="text-xs mb-3" style={{ color: "#9CA3AF", fontWeight: 600 }}>SCHEDULE (optional — leave blank to save as Draft)</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Send Date">
                <input type="date" className={inputCls} style={inputStyle} value={campaignForm.scheduleDate} onChange={e => setCampaignForm(f => ({ ...f, scheduleDate: e.target.value }))} />
              </Field>
              <Field label="Send Time">
                <input type="time" className={inputCls} style={inputStyle} value={campaignForm.scheduleTime} onChange={e => setCampaignForm(f => ({ ...f, scheduleTime: e.target.value }))} />
              </Field>
            </div>
          </div>
        </div>
        <ModalFooter onClose={() => { setCreateOpen(false); setCampaignForm(emptyCampaignForm); }} onSubmit={handleCreateCampaign} submitLabel="Create Campaign" />
      </Modal>
    </div>
  );
}
