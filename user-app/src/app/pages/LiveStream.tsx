import { ArrowLeft, Volume2, Maximize, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function LiveStream() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-[#1A0A00] flex flex-col">
      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Video Frame */}
        <div className="absolute inset-0 p-2" style={{ backgroundColor: '#2D0A2E' }}>
          <div className="w-full h-full rounded overflow-hidden relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Live Stream"
              className="w-full h-full object-cover"
            />

            {/* Top Overlay */}
            <div
              className="absolute top-0 left-0 right-0 flex items-center justify-between p-4"
              style={{
                background: 'linear-gradient(to bottom, rgba(26, 10, 0, 0.8), transparent)',
              }}
            >
              <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 text-center">
                <p className="text-sm font-medium" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#F5F5F0' }}>
                  Rudrabhishek — Sri Kalahasti
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-white" />
                <span className="text-xs font-bold text-white" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                  LIVE
                </span>
              </div>
            </div>

            {/* Bottom Overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4"
              style={{
                background: 'linear-gradient(to top, rgba(26, 10, 0, 0.9), transparent)',
              }}
            >
              <p className="text-xs text-center mb-4" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#F5F5F0' }}>
                This pooja is being offered for Priya Sharma and family
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Area */}
      <div className="p-6 space-y-4">
        {/* Stream Info */}
        <div className="flex items-center justify-between text-xs" style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>720p</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>312 watching</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-8">
          <button className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <Volume2 className="w-6 h-6 text-foreground" />
          </button>
          <button className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <Maximize className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Description */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            Chant along if you know the mantras. Light a diya at home during the aarti.
          </p>
        </div>
      </div>
    </div>
  );
}
