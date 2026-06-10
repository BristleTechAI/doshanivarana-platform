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



const monthlyRev = [
  { month: "Jan", revenue: 4800000, commission: 480000, net: 4320000 },
  { month: "Feb", revenue: 5600000, commission: 560000, net: 5040000 },
  { month: "Mar", revenue: 6400000, commission: 640000, net: 5760000 },
  { month: "Apr", revenue: 5900000, commission: 590000, net: 5310000 },
  { month: "May", revenue: 7800000, commission: 780000, net: 7020000 },
  { month: "Jun", revenue: 9200000, commission: 920000, net: 8280000 },
];

const revenueByType = [
  { name: "Pooja Bookings", value: 68, color: "#C76A00" },
  { name: "Festival Packages", value: 18, color: "#D4A017" },
  { name: "Live Stream Premium", value: 8, color: "#4A1259" },
  { name: "Prasad Delivery", value: 6, color: "#22C55E" },
];

function fCr(v: number) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  return `₹${(v / 100000).toFixed(1)}L`;
}

export function RevenuePage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Gross Revenue (YTD)", value: "₹39.7L", change: "+31%", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Platform Commission", value: "₹3.97L", change: "+31%", color: "#4A1259", bg: "#F3E8FF" },
          { label: "Net Payouts to Temples", value: "₹35.7L", change: "+31%", color: "#22C55E", bg: "#F0FDF4" },
          { label: "Projected Annual", value: "₹1.2Cr", change: "+28%", color: "#D4A017", bg: "#FFFBEB" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
              <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>{s.change}</span>
            </div>
            <div className="text-xs" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Revenue Breakdown</h3>
          <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>Gross revenue, commission, and net payouts by month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRev} barCategoryGap="25%">
              <CartesianGrid key="rev-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis key="rev-x" dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="rev-y" tickFormatter={fCr} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip key="rev-tooltip" formatter={(v: number) => fCr(v)} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar key="rev-bar-gross" dataKey="revenue" name="Gross Revenue" fill="#C76A00" radius={[4, 4, 0, 0]} />
              <Bar key="rev-bar-net" dataKey="net" name="Net Payout" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar key="rev-bar-comm" dataKey="commission" name="Commission" fill="#D4A017" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Revenue by Type</h3>
          <p className="mb-3" style={{ color: "#9CA3AF", fontSize: "12px" }}>Share of total platform revenue</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie key="rev-pie" data={revenueByType} cx="50%" cy="50%" innerRadius={42} outerRadius={68} dataKey="value" paddingAngle={2}>
                {revenueByType.map(e => <Cell key={`rev-cell-${e.name}`} fill={e.color} />)}
              </Pie>
              <Tooltip key="rev-pie-tooltip" formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {revenueByType.map(t => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                  <span style={{ color: "#6B7280" }}>{t.name}</span>
                </div>
                <span style={{ color: "#1F1F1F", fontWeight: 600 }}>{t.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Monthly Revenue Summary</h3>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
          {monthlyRev.map((r, i) => {
            const prev = monthlyRev[i - 1];
            const growth = prev ? (((r.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : null;
            const up = prev ? r.revenue >= prev.revenue : true;
            return (
              <div key={r.month} className="px-4 py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.month} 2026</div>
                  <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Net: <span style={{ color: "#22C55E", fontWeight: 600 }}>{fCr(r.net)}</span></div>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ color: "#C76A00", fontWeight: 700 }}>{fCr(r.revenue)}</div>
                  {growth ? (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: up ? "#F0FDF4" : "#FFF1F2", color: up ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                      {up ? "▲" : "▼"} {Math.abs(Number(growth))}%
                    </span>
                  ) : <span className="text-xs" style={{ color: "#9CA3AF" }}>—</span>}
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
                {["Month", "Gross Revenue", "Platform Commission (10%)", "Net Payout to Temples", "MoM Growth"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs whitespace-nowrap" style={{ color: "#9CA3AF", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyRev.map((r, i) => {
                const prev = monthlyRev[i - 1];
                const growth = prev ? (((r.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : "—";
                const up = prev ? r.revenue >= prev.revenue : true;
                return (
                  <tr key={r.month} className="border-t hover:bg-orange-50 transition-colors" style={{ borderColor: "rgba(199,106,0,0.06)" }}>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.month} 2026</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#C76A00", fontWeight: 700 }}>{fCr(r.revenue)}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#D4A017", fontWeight: 600 }}>{fCr(r.commission)}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: "#22C55E", fontWeight: 700 }}>{fCr(r.net)}</td>
                    <td className="px-5 py-3.5">
                      {prev ? (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: up ? "#F0FDF4" : "#FFF1F2", color: up ? "#16A34A" : "#DC2626", fontWeight: 600 }}>
                          {up ? "▲" : "▼"} {Math.abs(Number(growth))}%
                        </span>
                      ) : <span className="text-xs" style={{ color: "#9CA3AF" }}>—</span>}
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
