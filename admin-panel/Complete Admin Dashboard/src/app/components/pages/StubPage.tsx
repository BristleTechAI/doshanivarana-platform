import {
  Radio, Video, Package, MessageCircle, ClipboardList, Briefcase,
  Flame, Tag, Globe, RefreshCcw, TrendingUp, Construction
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Radio, Video, Package, MessageCircle, ClipboardList, Briefcase,
  Flame, Tag, Globe, RefreshCcw, TrendingUp,
};

interface StubPageProps {
  title: string;
  icon: string;
  description: string;
}

export function StubPage({ title, icon, description }: StubPageProps) {
  const Icon = iconMap[icon] || Construction;

  return (
    <div className="flex flex-col items-center justify-center min-h-96 text-center px-8">
      <div
        className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg, #FFF0E6, #F3E8FF)" }}
      >
        <Icon size={36} style={{ color: "#C76A00" }} />
      </div>
      <h2 className="text-2xl mb-3" style={{ color: "#1F1F1F", fontWeight: 700 }}>
        {title}
      </h2>
      <p className="max-w-md mb-8" style={{ color: "#6B7280", lineHeight: 1.7 }}>
        {description}
      </p>
      <div
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
        style={{ backgroundColor: "#FFF0E6", color: "#C76A00", fontWeight: 600 }}
      >
        <Construction size={16} />
        Full interface coming in next sprint
      </div>
    </div>
  );
}
