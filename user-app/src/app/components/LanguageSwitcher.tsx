import { useState, useRef, useEffect } from 'react';
import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en' as const, name: 'English', nativeName: 'English' },
    { code: 'te' as const, name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'hi' as const, name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'gu' as const, name: 'Gujarati', nativeName: 'ગુજરાતી' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center transition-colors relative"
        aria-label="Change language"
      >
        <Languages className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-12 w-48 bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50"
          style={{ 
            animation: 'slideDown 0.2s ease-out',
          }}
        >
          <div className="p-2 border-b border-border">
            <p className="px-3 py-2 text-xs font-semibold text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              {t('language.label')}
            </p>
          </div>
          <div className="p-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  language === lang.code
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted/30'
                }`}
              >
                <span className="font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                  {lang.nativeName}
                </span>
                {language === lang.code && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
