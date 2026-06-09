import { useState } from 'react';
import { Search, SlidersHorizontal, Clock, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Link } from 'react-router';

type Category = 'All' | 'Abhishekam' | 'Homam' | 'Archana' | 'Special Poojas';

export function Poojas() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const poojas = [
    // Abhishekam Category
    {
      id: 1,
      title: 'Rudrabhishekam',
      temple: 'Rameshwaram Temple',
      deity: 'Lord Shiva',
      duration: '45 mins',
      price: '₹1,200',
      purpose: 'Sacred bathing ritual for Lord Shiva for spiritual purification',
      category: 'Abhishekam',
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 2,
      title: 'Vishnu Abhishekam',
      temple: 'Tirumala Temple',
      deity: 'Lord Vishnu',
      duration: '40 mins',
      price: '₹1,100',
      purpose: 'Divine bathing ceremony for Lord Vishnu for prosperity and peace',
      category: 'Abhishekam',
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 3,
      title: 'Lakshmi Abhishekam',
      temple: 'Madurai Temple',
      deity: 'Goddess Lakshmi',
      duration: '35 mins',
      price: '₹900',
      purpose: 'Sacred bathing ritual for Goddess Lakshmi to attract wealth',
      category: 'Abhishekam',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 4,
      title: 'Ganesha Abhishekam',
      temple: 'Siddhi Vinayak Temple',
      deity: 'Lord Ganesha',
      duration: '30 mins',
      price: '₹800',
      purpose: 'Remove obstacles and invoke blessings for new beginnings',
      category: 'Abhishekam',
      imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 5,
      title: 'Saraswati Abhishekam',
      temple: 'Varanasi Temple',
      deity: 'Goddess Saraswati',
      duration: '35 mins',
      price: '₹850',
      purpose: 'Enhance knowledge, wisdom, and artistic abilities',
      category: 'Abhishekam',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    
    // Homam Category
    {
      id: 6,
      title: 'Ganapathi Homam',
      temple: 'Siddhi Vinayak Temple',
      deity: 'Lord Ganesha',
      duration: '90 mins',
      price: '₹2,500',
      purpose: 'Fire ritual to remove obstacles and ensure success in endeavors',
      category: 'Homam',
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 7,
      title: 'Navagraha Homam',
      temple: 'Kumbakonam Temple',
      deity: 'Nine Planets',
      duration: '120 mins',
      price: '₹3,500',
      purpose: 'Balances planetary influences and removes doshas',
      category: 'Homam',
      imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 8,
      title: 'Lakshmi Kubera Homam',
      temple: 'Madurai Temple',
      deity: 'Goddess Lakshmi',
      duration: '100 mins',
      price: '₹2,800',
      purpose: 'Attracts wealth, prosperity, and financial abundance',
      category: 'Homam',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 9,
      title: 'Sudarshana Homam',
      temple: 'Tirumala Temple',
      deity: 'Lord Vishnu',
      duration: '85 mins',
      price: '₹2,200',
      purpose: 'Protection from negative energies and evil forces',
      category: 'Homam',
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 10,
      title: 'Maha Mrityunjaya Homam',
      temple: 'Rameshwaram Temple',
      deity: 'Lord Shiva',
      duration: '110 mins',
      price: '₹3,000',
      purpose: 'Promotes health, longevity, and victory over death',
      category: 'Homam',
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },

    // Archana Category
    {
      id: 11,
      title: 'Sahasranama Archana',
      temple: 'Tirumala Temple',
      deity: 'Lord Vishnu',
      duration: '30 mins',
      price: '₹500',
      purpose: 'Chanting 1000 names of Lord Vishnu for divine blessings',
      category: 'Archana',
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 12,
      title: 'Lalita Sahasranama Archana',
      temple: 'Madurai Temple',
      deity: 'Goddess Lalita',
      duration: '35 mins',
      price: '₹600',
      purpose: 'Invoke divine feminine energy and blessings',
      category: 'Archana',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 13,
      title: 'Ashtottara Shatanamavali',
      temple: 'Siddhi Vinayak Temple',
      deity: 'Lord Ganesha',
      duration: '25 mins',
      price: '₹400',
      purpose: 'Offering 108 names for quick blessings and obstacle removal',
      category: 'Archana',
      imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 14,
      title: 'Hanuman Chalisa Archana',
      temple: 'Varanasi Temple',
      deity: 'Lord Hanuman',
      duration: '20 mins',
      price: '₹350',
      purpose: 'Gain strength, courage, and protection from difficulties',
      category: 'Archana',
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 15,
      title: 'Durga Ashtottara Archana',
      temple: 'Kolkata Temple',
      deity: 'Goddess Durga',
      duration: '30 mins',
      price: '₹550',
      purpose: 'Divine mother\'s blessings for protection and strength',
      category: 'Archana',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },

    // Special Poojas Category
    {
      id: 16,
      title: 'Satyanarayana Vratam',
      temple: 'Tirumala Temple',
      deity: 'Lord Satyanarayan',
      duration: '120 mins',
      price: '₹1,800',
      purpose: 'Complete vratam for fulfillment of wishes and prosperity',
      category: 'Special Poojas',
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 17,
      title: 'Varalakshmi Vratam',
      temple: 'Madurai Temple',
      deity: 'Goddess Lakshmi',
      duration: '90 mins',
      price: '₹1,500',
      purpose: 'Special vratam for family well-being and abundance',
      category: 'Special Poojas',
      imageUrl: 'https://images.unsplash.com/photo-1598089842456-ac3c6ef91f43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMGRlaXR5JTIwc2hyaW5lJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzM4MjU0NTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 18,
      title: 'Kalasabhishekam',
      temple: 'Rameshwaram Temple',
      deity: 'Lord Shiva',
      duration: '75 mins',
      price: '₹2,000',
      purpose: 'Grand abhishekam with sacred pots for complete purification',
      category: 'Special Poojas',
      imageUrl: 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 19,
      title: 'Pradosham Special Pooja',
      temple: 'Chidambaram Temple',
      deity: 'Lord Shiva',
      duration: '60 mins',
      price: '₹1,300',
      purpose: 'Performed during pradosham time for liberation from sins',
      category: 'Special Poojas',
      imageUrl: 'https://images.unsplash.com/photo-1772787429537-77ba39d3f855?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZW1wbGUlMjBmbG93ZXIlMjBvZmZlcmluZ3MlMjBpbmNlbnNlfGVufDF8fHx8MTc3MzgyNTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 20,
      title: 'Ekadashi Special Pooja',
      temple: 'Tirupati Temple',
      deity: 'Lord Vishnu',
      duration: '80 mins',
      price: '₹1,600',
      purpose: 'Auspicious pooja on Ekadashi for spiritual elevation',
      category: 'Special Poojas',
      imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

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