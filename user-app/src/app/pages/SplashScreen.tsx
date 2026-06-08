import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigate('/welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#1A0A00] px-6">
      {/* DEVASEVA Wordmark */}
      <h1
        className="text-6xl font-bold text-primary mb-8 animate-fade-in"
        style={{ fontFamily: "'Anek Devanagari', sans-serif", animationDuration: '2.5s' }}
      >
        DEVASEVA
      </h1>

      {/* Lotus/Diya Motif */}
      <div className="text-6xl mb-6 opacity-80" style={{ color: '#9A1515' }}>
        🪔
      </div>

      {/* Tagline */}
      <p
        className="text-sm italic text-muted-foreground animate-fade-in"
        style={{ 
          fontFamily: "'Noto Sans', sans-serif",
          color: '#78716C',
          animationDuration: '2.5s',
          animationDelay: '0.5s',
          opacity: 0,
          animationFillMode: 'forwards'
        }}
      >
        Where Technology Meets Devotion
      </p>
    </div>
  );
}
