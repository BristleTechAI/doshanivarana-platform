import { MapPin, Star, Flame } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState } from 'react';
import { Link } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

export function Temples() {
  const { t } = useLanguage();
  const [expandedTemple, setExpandedTemple] = useState<number | null>(null);

  const temples = [
    {
      id: 1,
      name: 'Tirumala Temple',
      location: 'Andhra Pradesh',
      deity: 'Lord Venkateswara',
      poojas: 12,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'One of the richest and most visited pilgrimage centers in the world',
      availablePoojas: [
        { id: 2, name: 'Vishnu Abhishekam', price: '₹1,100' },
        { id: 11, name: 'Sahasranama Archana', price: '₹500' },
        { id: 9, name: 'Sudarshana Homam', price: '₹2,200' },
        { id: 16, name: 'Satyanarayana Vratam', price: '₹1,800' },
      ],
    },
    {
      id: 2,
      name: 'Rameshwaram Temple',
      location: 'Tamil Nadu',
      deity: 'Lord Shiva',
      poojas: 10,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Sacred Jyotirlinga temple on the island of Rameshwaram',
      availablePoojas: [
        { id: 1, name: 'Rudrabhishekam', price: '₹1,200' },
        { id: 10, name: 'Maha Mrityunjaya Homam', price: '₹3,000' },
        { id: 18, name: 'Kalasabhishekam', price: '₹2,000' },
        { id: 19, name: 'Pradosham Special Pooja', price: '₹1,300' },
      ],
    },
    {
      id: 3,
      name: 'Madurai Temple',
      location: 'Tamil Nadu',
      deity: 'Goddess Meenakshi',
      poojas: 15,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Historic temple dedicated to Goddess Parvati in the form of Meenakshi',
      availablePoojas: [
        { id: 3, name: 'Lakshmi Abhishekam', price: '₹900' },
        { id: 8, name: 'Lakshmi Kubera Homam', price: '₹2,800' },
        { id: 12, name: 'Lalita Sahasranama Archana', price: '₹600' },
        { id: 17, name: 'Varalakshmi Vratam', price: '₹1,500' },
      ],
    },
    {
      id: 4,
      name: 'Varanasi Temple',
      location: 'Uttar Pradesh',
      deity: 'Lord Shiva',
      poojas: 8,
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Ancient temple on the banks of the holy Ganges river',
      availablePoojas: [
        { id: 5, name: 'Saraswati Abhishekam', price: '₹850' },
        { id: 14, name: 'Hanuman Chalisa Archana', price: '₹350' },
        { id: 7, name: 'Navagraha Homam', price: '₹3,500' },
      ],
    },
    {
      id: 5,
      name: 'Siddhi Vinayak Temple',
      location: 'Maharashtra',
      deity: 'Lord Ganesha',
      poojas: 9,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Famous temple dedicated to Lord Ganesha in Mumbai',
      availablePoojas: [
        { id: 4, name: 'Ganesha Abhishekam', price: '₹800' },
        { id: 6, name: 'Ganapathi Homam', price: '₹2,500' },
        { id: 13, name: 'Ashtottara Shatanamavali', price: '₹400' },
      ],
    },
  ];

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            {t('temples.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {t('temples.subtitle')}
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-4">
        {temples.map((temple) => (
          <TempleCard 
            key={temple.id} 
            {...temple} 
            isExpanded={expandedTemple === temple.id}
            onToggleExpand={() => setExpandedTemple(expandedTemple === temple.id ? null : temple.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TempleCard({
  id,
  name,
  location,
  deity,
  poojas,
  rating,
  imageUrl,
  description,
  availablePoojas,
  isExpanded,
  onToggleExpand,
}: {
  id: number;
  name: string;
  location: string;
  deity: string;
  poojas: number;
  rating: number;
  imageUrl: string;
  description: string;
  availablePoojas: { id: number; name: string; price: string }[];
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const { t } = useLanguage();
  
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all">
      {/* Image */}
      <div className="relative h-48">
        <ImageWithFallback
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {rating}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            {name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span style={{ fontFamily: "'Noto Sans', sans-serif" }}>{location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-accent">•</span>
              <span style={{ fontFamily: "'Noto Sans', sans-serif" }}>{deity}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 flex-1 text-sm">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              {poojas} {t('temples.availablePoojas')}
            </span>
          </div>
          <Link 
            to={`/temple/${id}`}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-[#E05C10] transition-colors font-medium text-sm text-center"
          >
            {t('temples.explore')}
          </Link>
        </div>
      </div>
    </div>
  );
}