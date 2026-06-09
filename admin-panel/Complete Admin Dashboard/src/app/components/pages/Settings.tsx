import { useState } from "react";
import { Settings as SettingsIcon, Shield, Bell, Globe, CreditCard, Building2, Users, Key, Save, Eye, EyeOff, CheckCircle } from "lucide-react";

const sections = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notification Prefs", icon: Bell },
  { id: "payments", label: "Payment Config", icon: CreditCard },
  { id: "platform", label: "Platform Config", icon: Globe },
  { id: "api", label: "API Keys", icon: Key },
];

export function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex gap-6">
      {/* Settings Sidebar */}
      <div className="w-56 flex-shrink-0">
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          {sections.map((s) => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all border-b last:border-b-0 text-left"
                style={{
                  borderColor: "rgba(199,106,0,0.08)",
                  backgroundColor: active ? "#FFF0E6" : "transparent",
                  color: active ? "#C76A00" : "#6B7280",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon size={15} style={{ color: active ? "#C76A00" : "#9CA3AF" }} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 space-y-5">
        {activeSection === "general" && (
          <>
            <div className="bg-white rounded-xl p-6 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <h3 className="mb-5" style={{ color: "#1F1F1F", fontWeight: 600 }}>Platform Settings</h3>
              <div className="space-y-4">
                {[
                  { label: "Platform Name", value: "Devaseva", placeholder: "Enter platform name" },
                  { label: "Support Email", value: "support@devaseva.com", placeholder: "support@example.com" },
                  { label: "Support Phone", value: "+91 80 4840 2840", placeholder: "+91..." },
                  { label: "Platform Tagline", value: "Divine Darshan, Delivered", placeholder: "Enter tagline" },
                ].map((f) => (
                  <div key={f.label} className="grid grid-cols-3 gap-4 items-start">
                    <label className="text-sm pt-2" style={{ color: "#6B7280", fontWeight: 500 }}>{f.label}</label>
                    <div className="col-span-2">
                      <input
                        defaultValue={f.value}
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                        style={{ border: "1px solid rgba(199,106,0,0.2)", color: "#1F1F1F", backgroundColor: "#FFFFFF" }}
                      />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-4 items-start">
                  <label className="text-sm pt-2" style={{ color: "#6B7280", fontWeight: 500 }}>Maintenance Mode</label>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-11 h-6 rounded-full relative cursor-pointer" style={{ backgroundColor: "#E5E7EB" }}>
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm transition-all" />
                    </div>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>Platform is currently online</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
              <h3 className="mb-5" style={{ color: "#1F1F1F", fontWeight: 600 }}>Branding</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-sm" style={{ color: "#6B7280", fontWeight: 500 }}>Primary Color</label>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: "#C76A00" }} />
                    <input defaultValue="#C76A00" className="w-32 px-3 py-1.5 rounded-lg text-sm outline-none"
                      style={{ border: "1px solid rgba(199,106,0,0.2)", color: "#1F1F1F" }} />
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>Saffron Orange</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-sm" style={{ color: "#6B7280", fontWeight: 500 }}>Accent Color</label>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: "#4A1259" }} />
                    <input defaultValue="#4A1259" className="w-32 px-3 py-1.5 rounded-lg text-sm outline-none"
                      style={{ border: "1px solid rgba(199,106,0,0.2)", color: "#1F1F1F" }} />
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>Royal Purple</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeSection === "security" && (
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <h3 className="mb-5" style={{ color: "#1F1F1F", fontWeight: 600 }}>Security Configuration</h3>
            <div className="space-y-5">
              {[
                { label: "Two-Factor Authentication", desc: "Require 2FA for all admin accounts", enabled: true },
                { label: "Session Timeout", desc: "Auto-logout inactive sessions after 30 minutes", enabled: true },
                { label: "IP Whitelist", desc: "Restrict admin access to whitelisted IP addresses only", enabled: false },
                { label: "Audit Log Retention", desc: "Retain audit logs for 90 days", enabled: true },
                { label: "Failed Login Alerts", desc: "Send email alert after 3 failed login attempts", enabled: true },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
                  <div>
                    <div className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{item.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{item.desc}</div>
                  </div>
                  <div
                    className="w-11 h-6 rounded-full relative cursor-pointer flex-shrink-0 transition-colors"
                    style={{ backgroundColor: item.enabled ? "#C76A00" : "#E5E7EB" }}
                  >
                    <div
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all"
                      style={{ left: item.enabled ? "22px" : "2px" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "api" && (
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <h3 className="mb-5" style={{ color: "#1F1F1F", fontWeight: 600 }}>API Keys & Integrations</h3>
            <div className="space-y-4">
              {[
                { label: "Payment Gateway (Razorpay)", key: "rzp_live_XXXXXXXXXXXX", env: "Production" },
                { label: "SMS Provider (MSG91)", key: "AUTHKEY_XXXXXXXXXXXXXXXX", env: "Production" },
                { label: "Email (SendGrid)", key: "SG.XXXXXXXXXXXXXXXXXXXXXXXX", env: "Production" },
                { label: "Live Streaming (AWS)", key: "AKIAXXXXXXXXXXXXXXXX", env: "Production" },
                { label: "Maps API (Google)", key: "AIzaSyXXXXXXXXXXXXXXXXX", env: "Production" },
              ].map((api) => (
                <div key={api.label} className="p-4 rounded-xl border" style={{ borderColor: "rgba(199,106,0,0.12)", backgroundColor: "#FAF6F2" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 600 }}>{api.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", fontWeight: 600 }}>
                      {api.env}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs" style={{ color: "#6B7280" }}>
                      {showKey ? api.key : api.key.replace(/[a-zA-Z0-9]/g, "•")}
                    </code>
                    <button onClick={() => setShowKey(!showKey)} className="p-1.5 rounded-lg transition-colors hover:bg-white">
                      {showKey ? <EyeOff size={12} style={{ color: "#9CA3AF" }} /> : <Eye size={12} style={{ color: "#9CA3AF" }} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeSection === "notifications" || activeSection === "payments" || activeSection === "platform") && (
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <h3 className="mb-3" style={{ color: "#1F1F1F", fontWeight: 600 }}>
              {activeSection === "notifications" ? "Notification Preferences" : activeSection === "payments" ? "Payment Configuration" : "Platform Configuration"}
            </h3>
            <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
              Configure {activeSection === "notifications" ? "alert channels and notification rules for the admin team" : activeSection === "payments" ? "payment gateways, settlement schedules, and commission structures" : "platform-wide operational parameters and integrations"}.
            </p>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg" style={{ backgroundColor: "#FAF6F2" }} />
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          <button className="px-4 py-2 rounded-lg text-sm" style={{ color: "#6B7280", border: "1px solid rgba(199,106,0,0.15)" }}>
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-all"
            style={{ backgroundColor: saved ? "#22C55E" : "#C76A00", color: "#FFFFFF", fontWeight: 600 }}
          >
            {saved ? <><CheckCircle size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
