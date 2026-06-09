interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
        {description}
      </p>
    </div>
  );
}
