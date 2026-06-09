import { useState } from 'react';
import { Search, SlidersHorizontal, Clock, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Link } from 'react-router';

import { POOJAS } from '../lib/poojas';

type Category = 'All' | 'Abhishekam' | 'Homam' | 'Archana' | 'Special Poojas';

export function Poojas() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const poojas = POOJAS;

  const categories: Category[] = ['All', 'Abhishekam', 'Homam', 'Archana', 'Special Poojas'];

  const filteredPoojas = poojas.filter(pooja => {
    const matchesCategory = activeCategory === 'All' || pooja.category === activeCategory;
    const matchesSearch = pooja.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pooja.deity.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pooja.temple.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            All Poojas
          </h1>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search poojas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ fontFamily: "'Noto Sans', sans-serif" }}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium whitespace-nowrap">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground'
                }`}
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Pooja List */}
      <div className="max-w-lg mx-auto px-6 py-6 space-y-4">
        {filteredPoojas.map((pooja) => (
          <PoojaListCard key={pooja.id} {...pooja} />
        ))}
      </div>
    </div>
  );
}

function PoojaListCard({
  id,
  title,
  temple,
  deity,
  duration,
  purpose,
  imageUrl,
  price,
}: {
  id: number;
  title: string;
  temple: string;
  deity: string;
  duration: string;
  purpose: string;
  imageUrl: string;
  price: string;
}) {
  return (
    <Link to={`/pooja/${id}`}>
      <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all">
        <div className="flex gap-4 p-4">
          <ImageWithFallback
            src={imageUrl}
            alt={title}
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                {title}
              </h3>
              <div className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-xs font-medium whitespace-nowrap ml-2">
                {deity}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              {purpose}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{temple}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{duration}</span>
              </div>
            </div>
            <div className="text-primary font-semibold" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              {price}
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-[#E05C10] transition-colors font-medium text-sm">
            Offer This Pooja
          </button>
        </div>
      </div>
    </Link>
  );
}