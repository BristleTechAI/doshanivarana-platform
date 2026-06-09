import { Clock, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PoojaCardProps {
  title: string;
  temple: string;
  deity: string;
  duration: string;
  imageUrl: string;
  purpose: string;
}

export function PoojaCard({ title, temple, deity, duration, imageUrl, purpose }: PoojaCardProps) {
  return (
    <div className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
          {deity}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {purpose}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>{temple}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>

        <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground hover:bg-[#E05C10] transition-colors font-medium">
          Offer This Pooja
        </button>
      </div>
    </div>
  );
}
