import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check } from 'lucide-react';

const deities = [
  { id: 'ganesha', name: 'Ganesha', emoji: '🐘' },
  { id: 'lakshmi', name: 'Lakshmi', emoji: '💰' },
  { id: 'shiva', name: 'Shiva', emoji: '🔱' },
  { id: 'vishnu', name: 'Vishnu', emoji: '🦅' },
  { id: 'durga', name: 'Durga', emoji: '🦁' },
  { id: 'saraswati', name: 'Saraswati', emoji: '📿' },
  { id: 'hanuman', name: 'Hanuman', emoji: '🐵' },
  { id: 'murugan', name: 'Murugan', emoji: '🦚' },
];

export function ProfileSetup() {
  const [selected, setSelected] = useState<string[]>(['lakshmi', 'shiva']);
  const navigate = useNavigate();

  const toggleDeity = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#1A0A00] px-6 py-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="w-3 h-3 rounded-full bg-primary" />
        <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Heading */}
      <h1
        className="text-2xl font-bold mb-3"
        style={{ fontFamily: "'Anek Devanagari', sans-serif", color: '#F5F5F0' }}
      >
        Which deities do you hold closest?
      </h1>

      {/* Subtitle */}
      <p
        className="text-sm mb-8"
        style={{ fontFamily: "'Noto Sans', sans-serif", color: '#78716C' }}
      >
        We will personalise your pooja suggestions based on your answer.
      </p>

      {/* Deity Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {deities.map((deity) => {
          const isSelected = selected.includes(deity.id);
          return (
            <button
              key={deity.id}
              onClick={() => toggleDeity(deity.id)}
              className={`relative aspect-square rounded-xl p-6 flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#2D0A2E] border-2 border-primary'
                  : 'bg-[#2D0A2E] border border-border hover:border-primary/50'
              }`}
            >
              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#1A0A00]" />
                </div>
              )}

              {/* Deity Illustration */}
              <div className="text-5xl mb-3">{deity.emoji}</div>

              {/* Deity Name */}
              <p
                className="text-sm font-medium"
                style={{ fontFamily: "'Anek Devanagari', sans-serif", color: '#F5F5F0' }}
              >
                {deity.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* CTAs */}
      <div className="space-y-4">
        <button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className={`w-full py-4 rounded-xl font-medium text-base transition-colors ${
            selected.length === 0
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-[#1A0A00] hover:bg-[#E05C10]'
          }`}
          style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
        >
          Continue
        </button>

        <button
          onClick={handleContinue}
          className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: "'Noto Sans', sans-serif" }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
