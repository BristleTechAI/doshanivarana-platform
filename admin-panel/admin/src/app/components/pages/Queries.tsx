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



const queries = [
  {
    id: "QR-1284", devotee: "Rajesh Kumar", avatar: "RK", email: "rajesh@gmail.com", phone: "+91 98421 84210",
    subject: "Request to reschedule Rudrabhishek booking", category: "Booking", priority: "High",
    status: "Open", assigned: "Support Team A", created: "08 Jun · 9:42 AM",
    preview: "I need to reschedule my Rudrabhishek booking at Kashi Vishwanath from 15 Jun to 22 Jun due to travel plans.",
    thread: [
      { from: "Rajesh Kumar", time: "9:42 AM", text: "Hi, I would like to reschedule my Rudrabhishek booking (BK-2024-8284) from 15 Jun to 22 Jun. Is that possible?", isAdmin: false },
      { from: "Support Team A", time: "10:05 AM", text: "Hello Rajesh, thank you for reaching out. Let me check availability for 22 Jun at Kashi Vishwanath.", isAdmin: true },
      { from: "Support Team A", time: "10:18 AM", text: "Good news! We have slots available on 22 Jun. I will initiate the reschedule. You'll receive a confirmation within 30 minutes.", isAdmin: true },
    ],
  },
  {
    id: "QR-1283", devotee: "Priya Menon", avatar: "PM", email: "priya@gmail.com", phone: "+91 94472 28410",
    subject: "Prasad delivery not received after 10 days", category: "Delivery", priority: "High",
    status: "In Progress", assigned: "Logistics Team", created: "08 Jun · 8:30 AM",
    preview: "I placed my order 10 days ago and the prasad from Sabarimala has not arrived yet.",
    thread: [
      { from: "Priya Menon", time: "8:30 AM", text: "I placed order DEL-8240 on 29 May and still haven't received my prasad from Sabarimala. Tracking shows it's been stuck for 5 days.", isAdmin: false },
      { from: "Logistics Team", time: "9:15 AM", text: "We're sorry for the inconvenience. We're investigating with BlueDart. Can you please confirm your delivery address?", isAdmin: true },
    ],
  },
  {
    id: "QR-1282", devotee: "Sunita Reddy", avatar: "SR", email: "sunita@gmail.com", phone: "+91 99001 28410",
    subject: "Live stream video quality was very poor", category: "Technical", priority: "Medium",
    status: "In Progress", assigned: "Tech Support", created: "07 Jun · 4:15 PM",
    preview: "During the Sahasranama Archana live stream yesterday, the video kept buffering and the quality was 240p.",
    thread: [
      { from: "Sunita Reddy", time: "4:15 PM", text: "The live stream for Sahasranama Archana on 07 Jun was unwatchable. Very poor quality and buffering every 30 seconds.", isAdmin: false },
      { from: "Tech Support", time: "5:02 PM", text: "Thank you for the report, Sunita. We've logged a technical incident for that stream. Our team is reviewing server logs.", isAdmin: true },
    ],
  },
  {
    id: "QR-1281", devotee: "Mohan Das", avatar: "MD", email: "mohan@gmail.com", phone: "+91 97301 28401",
    subject: "Refund not processed after 7 days", category: "Payment", priority: "High",
    status: "Escalated", assigned: "Finance Team", created: "07 Jun · 2:00 PM",
    preview: "My refund of ₹800 for cancelled Kakad Aarti booking has not been credited back to my account.",
    thread: [
      { from: "Mohan Das", time: "2:00 PM", text: "I cancelled booking BK-2024-8417 on 01 Jun and was promised a 5-7 day refund. It's been 7 days now and nothing.", isAdmin: false },
      { from: "Finance Team", time: "3:30 PM", text: "This has been escalated to our payment gateway team. The refund reference is REF-2024-8417. Expected by 09 Jun.", isAdmin: true },
    ],
  },
  {
    id: "QR-1280", devotee: "Kavitha Iyer", avatar: "KI", email: "kavitha@gmail.com", phone: "+91 98001 82410",
    subject: "Unable to find preferred language options", category: "Platform", priority: "Low",
    status: "Resolved", assigned: "Product Team", created: "06 Jun · 11:30 AM",
    preview: "I prefer Tamil for the booking flow but the app keeps defaulting to English.",
    thread: [
      { from: "Kavitha Iyer", time: "11:30 AM", text: "The app keeps showing content in English. I changed my language preference to Tamil but it doesn't stick.", isAdmin: false },
      { from: "Product Team", time: "12:45 PM", text: "This is a known issue on iOS 17.4+. We've released a fix in v2.4.1. Please update your app and let us know!", isAdmin: true },
      { from: "Kavitha Iyer", time: "1:10 PM", text: "Updated the app and it's working perfectly now. Thank you!", isAdmin: false },
    ],
  },
  {
    id: "QR-1279", devotee: "Deepak Joshi", avatar: "DJ", email: "deepak@gmail.com", phone: "+91 93001 82410",
    subject: "Priest didn't perform the correct ritual variant", category: "Service Quality", priority: "High",
    status: "Open", assigned: "Unassigned", created: "06 Jun · 9:00 AM",
    preview: "I booked the Laghu Rudrabhishek variant but the priest performed the standard version instead.",
    thread: [
      { from: "Deepak Joshi", time: "9:00 AM", text: "I specifically booked Laghu Rudrabhishek with Pandit Chandrashekhar at Kashi Vishwanath, but he performed the basic Abhishek instead. I feel cheated.", isAdmin: false },
    ],
  },
  {
    id: "QR-1278", devotee: "Sarla Gupta", avatar: "SG", email: "sarla@gmail.com", phone: "+91 90001 82410",
    subject: "How to book for multiple family members?", category: "General", priority: "Low",
    status: "Resolved", assigned: "Support Team B", created: "05 Jun · 3:45 PM",
    preview: "Is it possible to book the same pooja for multiple family members in a single transaction?",
    thread: [
      { from: "Sarla Gupta", time: "3:45 PM", text: "Can I book Sahasranama Archana for myself and my husband in one booking, or do I need two separate bookings?", isAdmin: false },
      { from: "Support Team B", time: "4:30 PM", text: "Yes! You can add multiple devotee names in the 'Devotee Names' field during booking. No need for separate bookings.", isAdmin: true },
      { from: "Sarla Gupta", time: "4:42 PM", text: "That's great, thank you!", isAdmin: false },
    ],
  },
];

const qPriorityCfg: Record<string, { bg: string; color: string; dot: string }> = {
  High: { bg: "#FFF1F2", color: "#DC2626", dot: "#EF4444" },
  Medium: { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
  Low: { bg: "#F0FDF4", color: "#16A34A", dot: "#22C55E" },
};
const qStatusCfg: Record<string, { bg: string; color: string }> = {
  Open: { bg: "#EFF6FF", color: "#2563EB" },
  "In Progress": { bg: "#FFF0E6", color: "#C76A00" },
  Escalated: { bg: "#FFF1F2", color: "#DC2626" },
  Resolved: { bg: "#F0FDF4", color: "#16A34A" },
};

export function QueriesPage() {
  const [selected, setSelected] = useState(queries[0].id);
  const [statusFilter, setStatusFilter] = useState("All");
  const [reply, setReply] = useState("");
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const activeQuery = queries.find(q => q.id === selected) || queries[0];
  const filtered = statusFilter === "All" ? queries : queries.filter(q => q.status === statusFilter);

  const statusDot: Record<string, string> = {
    Open: "#3B82F6",
    "In Progress": "#C76A00",
    Escalated: "#EF4444",
    Resolved: "#22C55E",
  };

  function selectQuery(id: string) {
    setSelected(id);
    setMobilePanelOpen(true);
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 560 }}>
      {/* Minimal top bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0 gap-2">
        <div className="flex items-center gap-0.5 p-1 rounded-lg overflow-x-auto" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(199,106,0,0.12)" }}>
          {["All", "Open", "In Progress", "Escalated", "Resolved"].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className="px-2.5 py-1.5 rounded-md text-xs transition-all whitespace-nowrap"
              style={{
                backgroundColor: statusFilter === f ? "#FAF6F2" : "transparent",
                color: statusFilter === f ? "#C76A00" : "#9CA3AF",
                fontWeight: statusFilter === f ? 600 : 400,
              }}>
              {f}
              {f !== "All" && (
                <span className="ml-1 text-xs" style={{ color: statusFilter === f ? "#C76A00" : "#D1D5DB" }}>
                  {queries.filter(q => q.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: "#9CA3AF" }}>{filtered.length}</span>
      </div>

      {/* Split pane */}
      <div className="flex gap-4 flex-1 min-h-0" style={{ height: "calc(100vh - 200px)", minHeight: 480 }}>

        {/* Left — compact list (hidden on mobile when thread is open) */}
        <div className={`${mobilePanelOpen ? "hidden" : "flex"} md:flex w-full md:w-72 flex-shrink-0 flex-col bg-white rounded-2xl border overflow-hidden`} style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
            {filtered.map(q => {
              const isActive = q.id === selected;
              return (
                <button key={q.id} onClick={() => selectQuery(q.id)}
                  className="w-full text-left px-4 py-3.5 transition-colors relative"
                  style={{ backgroundColor: isActive ? "#FFF8F0" : "transparent", minHeight: "44px" }}>
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r" style={{ backgroundColor: "#C76A00" }} />
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusDot[q.status] }} />
                    <span className="text-xs truncate flex-1" style={{ color: "#1F1F1F", fontWeight: isActive ? 600 : 500 }}>{q.devotee}</span>
                    <span className="text-xs flex-shrink-0" style={{ color: "#C4C9D4" }}>{q.created.split("·")[1]?.trim()}</span>
                  </div>
                  <div className="pl-4 text-xs line-clamp-2" style={{ color: isActive ? "#374151" : "#9CA3AF", lineHeight: 1.5 }}>
                    {q.subject}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — thread (hidden on mobile when list is shown) */}
        <div className={`${mobilePanelOpen ? "flex" : "hidden"} md:flex flex-1 flex-col bg-white rounded-2xl border overflow-hidden min-w-0`} style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          {/* Header */}
          <div className="px-4 md:px-6 py-3 md:py-4 border-b flex items-center gap-3" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
            {/* Mobile back button */}
            <button
              onClick={() => setMobilePanelOpen(false)}
              className="md:hidden flex items-center gap-1 text-xs flex-shrink-0 py-1 pr-2"
              style={{ color: "#C76A00", fontWeight: 600 }}
            >
              <ArrowLeft size={13} /> Back
            </button>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusDot[activeQuery.status] }} />
            <div className="flex-1 min-w-0">
              <span className="text-sm line-clamp-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>{activeQuery.subject}</span>
            </div>
            <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: "#9CA3AF" }}>{activeQuery.category} · {activeQuery.assigned}</span>
            {activeQuery.status !== "Resolved" && (
              <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600, minHeight: "36px" }}>
                <CheckCircle size={11} /> Resolve
              </button>
            )}
          </div>

          {/* Thread messages */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 space-y-4 md:space-y-5">
            {activeQuery.thread.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.isAdmin ? "flex-row-reverse" : ""}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: msg.isAdmin ? "#4A1259" : "#C76A00", fontSize: 9, fontWeight: 700 }}>
                  {msg.isAdmin ? "A" : activeQuery.avatar}
                </div>
                <div className={`max-w-xs sm:max-w-xl flex flex-col ${msg.isAdmin ? "items-end" : "items-start"}`}>
                  <span className="text-xs mb-1" style={{ color: "#C4C9D4" }}>{msg.time}</span>
                  <div className="px-4 py-3 text-sm"
                    style={{
                      backgroundColor: msg.isAdmin ? "#F5F0FC" : "#FAF6F2",
                      color: "#374151",
                      lineHeight: 1.65,
                      borderRadius: msg.isAdmin ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                    }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply bar */}
          <div className="px-4 md:px-6 pb-4 md:pb-5 pt-3 border-t flex-shrink-0" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
            <div className="flex items-end gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.15)" }}>
              <textarea
                rows={2}
                placeholder="Reply to this query…"
                value={reply}
                onChange={e => setReply(e.target.value)}
                className="flex-1 text-sm outline-none resize-none bg-transparent"
                style={{ color: "#1F1F1F" }}
              />
              <button
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs transition-all"
                style={{ backgroundColor: reply.trim() ? "#C76A00" : "rgba(199,106,0,0.12)", color: reply.trim() ? "#FFFFFF" : "#C76A00", fontWeight: 600, minHeight: "44px" }}>
                <Send size={11} /> Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

