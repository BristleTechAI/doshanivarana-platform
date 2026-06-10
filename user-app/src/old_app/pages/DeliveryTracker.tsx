import { ArrowLeft, CheckCircle2, Package, Truck, Home as HomeIcon } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Link, useParams, useNavigate } from 'react-router';
import { useLanguage } from '../context/LanguageContext';

export function DeliveryTracker() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock delivery data
  const deliveryInfo = {
    id: id || 'DS2026031801',
    poojaName: 'Satyanarayana Pooja',
    temple: 'Tirumala Temple',
    trackingNumber: 'TRK9876543210IN',
    courier: 'BlueDart Express',
    estimatedDelivery: '24 March 2026',
    address: '123, Devotee Apartment, Block B, \nWhitefield, Bangalore, 560066',
    currentStage: 2, // 0: Packed, 1: Shipped, 2: Out for Delivery, 3: Delivered
    imageUrl: 'https://images.unsplash.com/photo-1761471658531-51ce97fc5b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaW5kdSUyMHRlbXBsZSUyMGFsdGFyJTIwZGl5YSUyMGxhbXB8ZW58MXx8fHwxNzczODI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  };

  const steps = [
    { label: 'Prasad Packed', date: '21 Mar, 10:00 AM', icon: Package, description: 'Blessed items securely packed at temple.' },
    { label: 'Shipped', date: '22 Mar, 04:30 PM', icon: Truck, description: 'Package picked up by courier partner.' },
    { label: 'Out for Delivery', date: '23 Mar, 09:15 AM', icon: Truck, description: 'Package is out for delivery today.' },
    { label: 'Delivered', date: 'Pending', icon: HomeIcon, description: 'Package successfully delivered.' },
  ];

  return (
    <div className="min-h-full bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/30 transition-colors">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Track Delivery
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Package Summary Card */}
        <div className="bg-card border border-border rounded-2xl p-4 flex gap-4">
          <ImageWithFallback
            src={deliveryInfo.imageUrl}
            alt={deliveryInfo.poojaName}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0 py-1">
            <h3 className="font-bold text-base mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Prasad: {deliveryInfo.poojaName}
            </h3>
            <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              {deliveryInfo.temple}
            </p>
            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg uppercase tracking-wider">
              {deliveryInfo.currentStage === 3 ? 'Delivered' : 'In Transit'}
            </span>
          </div>
        </div>

        {/* Tracking Details */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Tracking ID</p>
            <p className="text-sm font-semibold" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              {deliveryInfo.trackingNumber} ({deliveryInfo.courier})
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Estimated Delivery</p>
            <p className="text-lg font-bold text-primary" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              {deliveryInfo.estimatedDelivery}
            </p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Delivery Address</p>
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              {deliveryInfo.address}
            </p>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Delivery Status</h3>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= deliveryInfo.currentStage;
              const isCurrent = index === deliveryInfo.currentStage;
              
              return (
                <div key={index} className="relative flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-card ${
                    isCompleted 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  } ${isCurrent ? 'ring-2 ring-primary/30 ring-offset-2 ring-offset-card' : ''}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 pt-1.5 pb-4">
                    <h4 className={`text-base font-bold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`} style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                      {step.date}
                    </p>
                    <p className={`text-sm ${isCompleted ? 'text-foreground/80' : 'text-muted-foreground/60'}`} style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
