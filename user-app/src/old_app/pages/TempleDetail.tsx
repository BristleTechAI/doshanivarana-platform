import { ArrowLeft, MapPin, Star, Flame, Info, Clock, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Link, useParams, useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

export function TempleDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock temple data
  const temple = {
    id: id,
    name: 'Tirumala Temple',
    location: 'Tirumala, Andhra Pradesh',
    deity: 'Lord Venkateswara',
    poojas: 12,
    rating: 4.9,
    reviewsCount: 12450,
    imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Tirumala Venkateswara Temple is a Hindu temple situated in the hill town of Tirumala at Tirupati in Tirupati district of Andhra Pradesh, India. The Temple is dedicated to Venkateswara, a form of Vishnu, who is believed to have appeared here to save mankind from trials and troubles of Kali Yuga.',
    timings: '5:30 AM to 10:00 PM',
    established: '300 AD',
    availablePoojas: [
      { id: 2, name: 'Vishnu Abhishekam', price: '₹1,100', duration: '45 mins' },
      { id: 11, name: 'Sahasranama Archana', price: '₹500', duration: '30 mins' },
      { id: 9, name: 'Sudarshana Homam', price: '₹2,200', duration: '2 hours' },
      { id: 16, name: 'Satyanarayana Vratam', price: '₹1,800', duration: '1.5 hours' },
    ],
  };

  return (
    <div className="min-h-full bg-background pb-24">
      {/* Hero Image & Header */}
      <div className="relative h-72">
        <ImageWithFallback
          src={temple.imageUrl}
          alt={temple.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <header className="absolute top-0 left-0 right-0 z-40 p-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 bg-black/20 backdrop-blur rounded-full hover:bg-black/40 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        </header>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-primary/90 backdrop-blur rounded text-[10px] font-bold text-white uppercase tracking-wider">
              {temple.deity}
            </span>
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur px-2 py-1 rounded text-white">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-bold">{temple.rating}</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            {temple.name}
          </h1>
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <MapPin className="w-4 h-4" />
            <span style={{ fontFamily: "'Noto Sans', sans-serif" }}>{temple.location}</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-8">
        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Timings</p>
              <p className="text-sm font-semibold" style={{ fontFamily: "'Noto Sans', sans-serif" }}>{temple.timings}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Established</p>
              <p className="text-sm font-semibold" style={{ fontFamily: "'Noto Sans', sans-serif" }}>{temple.established}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>About Temple</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {temple.description}
          </p>
        </section>

        {/* Available Poojas */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Available Poojas</h2>
            </div>
            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-lg">
              {temple.availablePoojas.length} Poojas
            </span>
          </div>
          
          <div className="space-y-3">
            {temple.availablePoojas.map((pooja) => (
              <div key={pooja.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/50 transition-colors group">
                <div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    {pooja.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{pooja.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    {pooja.price}
                  </div>
                  <Link to={`/pooja/${pooja.id}`} className="text-xs font-medium px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
