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



const allDeliveries = [
  { id: "DEL-8421", devotee: "Rajesh Kumar", avatar: "RK", temple: "Tirumala Tirupati", pooja: "Sudarshana Homam", partner: "BlueDart", tracking: "BD7421928374", status: "Out for Delivery", eta: "Today by 8 PM", city: "Hyderabad" },
  { id: "DEL-8419", devotee: "Ankit Sharma", avatar: "AS", temple: "Kashi Vishwanath", pooja: "Rudrabhishek", partner: "FedEx", tracking: "FX2918374", status: "Out for Delivery", eta: "Today by 6 PM", city: "Delhi" },
  { id: "DEL-8420", devotee: "Priya Menon", avatar: "PM", temple: "Sabarimala Temple", pooja: "Abhishekam", partner: "DTDC", tracking: "DT9284712", status: "Dispatched", eta: "10 Jun 2026", city: "Kochi" },
  { id: "DEL-8413", devotee: "Meena Krishnan", avatar: "MK", temple: "Meenakshi Amman", pooja: "Archana", partner: "BlueDart", tracking: "BD5921837", status: "Dispatched", eta: "11 Jun 2026", city: "Bangalore" },
  { id: "DEL-8416", devotee: "Kavitha Iyer", avatar: "KI", temple: "Somnath Temple", pooja: "Maha Abhishek", partner: "FedEx", tracking: "FX7291038", status: "In Transit", eta: "09 Jun 2026", city: "Ahmedabad" },
  { id: "DEL-8414", devotee: "Deepak Joshi", avatar: "DJ", temple: "Dwarkadhish Temple", pooja: "Sahasranama", partner: "India Post", tracking: "IP7391028", status: "In Transit", eta: "12 Jun 2026", city: "Pune" },
  { id: "DEL-8415", devotee: "Ramesh Pillai", avatar: "RP", temple: "Padmanabhaswamy", pooja: "Navakabhishekam", partner: "DTDC", tracking: "DT8192874", status: "Pending Pickup", eta: "11 Jun 2026", city: "Trivandrum" },
  { id: "DEL-8412", devotee: "Sarla Gupta", avatar: "SG", temple: "Vaishno Devi", pooja: "Abhishek", partner: "BlueDart", tracking: "BD4821930", status: "Pending Pickup", eta: "13 Jun 2026", city: "Jaipur" },
  { id: "DEL-8418", devotee: "Sunita Reddy", avatar: "SR", temple: "Meenakshi Amman", pooja: "Sahasranama Archana", partner: "India Post", tracking: "IP2847192", status: "Delivered", eta: "Delivered 07 Jun", city: "Chennai" },
  { id: "DEL-8417", devotee: "Mohan Das", avatar: "MD", temple: "Shirdi Sai Baba", pooja: "Kakad Aarti", partner: "BlueDart", tracking: "BD6392810", status: "Delivered", eta: "Delivered 07 Jun", city: "Mumbai" },
  { id: "DEL-8411", devotee: "Narayanan V.", avatar: "NV", temple: "Kedarnath Temple", pooja: "Rudrabhishek", partner: "FedEx", tracking: "FX1029374", status: "Delivered", eta: "Delivered 06 Jun", city: "Madurai" },
  { id: "DEL-8410", devotee: "Narayanan V.", avatar: "NV", temple: "Dwarkadhish Temple", pooja: "Krishna Abhishek", partner: "BlueDart", tracking: "BD5182736", status: "Failed", eta: "Reattempt Today", city: "Ahmedabad" },
];

const kanbanCols = [
  { key: "Pending Pickup", label: "Pending Pickup", color: "#D97706", bg: "#FFFBEB", headerBg: "#FEF3C7", icon: Package, count: 2 },
  { key: "Dispatched", label: "Dispatched", color: "#7B3FA0", bg: "#F3E8FF", headerBg: "#EDE9FE", icon: Package, count: 2 },
  { key: "In Transit", label: "In Transit", color: "#C76A00", bg: "#FFF0E6", headerBg: "#FFEDD5", icon: Truck, count: 2 },
  { key: "Out for Delivery", label: "Out for Delivery", color: "#2563EB", bg: "#EFF6FF", headerBg: "#DBEAFE", icon: Truck, count: 2 },
  { key: "Delivered", label: "Delivered", color: "#16A34A", bg: "#F0FDF4", headerBg: "#DCFCE7", icon: CheckCircle, count: 3 },
  { key: "Failed", label: "Failed", color: "#DC2626", bg: "#FFF1F2", headerBg: "#FEE2E2", icon: XCircle, count: 1 },
];

const partnerColors: Record<string, string> = {
  BlueDart: "#0050A0",
  DTDC: "#E97B00",
  FedEx: "#4D148C",
  "India Post": "#CC0000",
};

export function DeliveriesPage() {
  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {kanbanCols.map(col => {
          const Icon = col.icon;
          return (
            <div key={col.key} className="bg-white rounded-xl p-3 border text-center" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: col.bg }}>
                <Icon size={14} style={{ color: col.color }} />
              </div>
              <div style={{ color: col.color, fontWeight: 700, fontSize: 20 }}>{col.count}</div>
              <div className="text-xs mt-0.5" style={{ color: "#9CA3AF", lineHeight: 1.3 }}>{col.label}</div>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {kanbanCols.map(col => {
          const colItems = allDeliveries.filter(d => d.status === col.key);
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
                  <div key={d.id} className="bg-white rounded-xl border p-3 hover:shadow-sm transition-shadow cursor-pointer" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: "#C76A00", fontSize: 10, fontWeight: 700 }}>
                        {d.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate" style={{ color: "#1F1F1F", fontWeight: 600 }}>{d.devotee}</div>
                        <div className="text-xs" style={{ color: "#9CA3AF" }}>{d.city}</div>
                      </div>
                    </div>
                    <div className="text-xs mb-1 truncate" style={{ color: "#C76A00", fontWeight: 500 }}>{d.pooja}</div>
                    <div className="text-xs mb-2.5" style={{ color: "#9CA3AF" }}>{d.temple}</div>
                    <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                      <span className="text-xs font-mono" style={{ color: partnerColors[d.partner] || "#6B7280", fontWeight: 700 }}>{d.partner}</span>
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#9CA3AF" }}>
                        <Clock size={10} /> {d.eta.replace("Delivered ", "")}
                      </div>
                    </div>
                    <div className="mt-1.5 text-xs font-mono" style={{ color: "#D1D5DB" }}>{d.tracking}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

