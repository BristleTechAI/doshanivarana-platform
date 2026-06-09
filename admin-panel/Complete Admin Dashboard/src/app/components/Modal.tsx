import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, children, width = "480px" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(30,10,60,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width, maxWidth: "95vw", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <span style={{ color: "#1F1F1F", fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X size={15} style={{ color: "#9CA3AF" }} />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "#6B7280", fontWeight: 600 }}>{label}</label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{hint}</p>}
    </div>
  );
}

export const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none";
export const inputStyle = { backgroundColor: "#FAF6F2", border: "1px solid rgba(199,106,0,0.2)", color: "#1F1F1F" };
export const selectStyle = { ...inputStyle, appearance: "none" as const };

interface ModalFooterProps {
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
}

export function ModalFooter({ onClose, onSubmit, submitLabel = "Save" }: ModalFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
      <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: "#FAF6F2", color: "#6B7280", fontWeight: 500 }}>
        Cancel
      </button>
      <button onClick={onSubmit} className="px-5 py-2 rounded-lg text-sm" style={{ backgroundColor: "#C76A00", color: "#FFFFFF", fontWeight: 600 }}>
        {submitLabel}
      </button>
    </div>
  );
}
