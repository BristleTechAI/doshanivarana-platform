import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Package, Truck, Home as HomeIcon } from 'lucide-react';
import { useParams, useNavigate } from 'react-router';
import { DeliveriesService } from '../../services/firebase/deliveries';

function formatTimestamp(ts: any): string {
  if (!ts) return '';
  let d: Date;
  if (ts.toDate) d = ts.toDate();
  else if (ts.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit'
  });
}

function statusToStageIndex(status: string): number {
  const s = (status || '').toUpperCase();
  if (s === 'PACKED') return 0;
  if (s === 'SHIPPED' || s === 'IN_TRANSIT') return 1;
  if (s === 'OUT_FOR_DELIVERY') return 2;
  if (s === 'DELIVERED') return 3;
  return -1;
}

export function DeliveryTracker() {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Real-time delivery subscription
  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    const unsub = DeliveriesService.subscribeToDeliveryByBooking(bookingId, (d) => {
      setDelivery(d);
      setLoading(false);
    });
    return () => unsub();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          Loading delivery status…
        </p>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-full bg-background pb-24">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted/30">
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Track Delivery</h1>
          </div>
        </header>
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Prasad Not Yet Dispatched</h3>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            Your prasad is being prepared. You'll be notified once it's packed and shipped.
          </p>
        </div>
      </div>
    );
  }

  const currentStageIndex = statusToStageIndex(delivery.status);
  const isDelivered = currentStageIndex >= 3;

  const steps = [
    {
      label: 'Prasad Packed',
      icon: Package,
      description: 'Blessed items securely packed at the temple.',
      timestamp: formatTimestamp(delivery.packedAt),
    },
    {
      label: 'Shipped',
      icon: Truck,
      description: `Package picked up by ${delivery.courier || delivery.courierName || 'courier partner'}.`,
      timestamp: formatTimestamp(delivery.shippedAt || delivery.dispatchedAt),
    },
    {
      label: 'Out for Delivery',
      icon: Truck,
      description: 'Package is out for delivery.',
      timestamp: formatTimestamp(delivery.outForDeliveryAt),
    },
    {
      label: 'Delivered',
      icon: HomeIcon,
      description: 'Package successfully delivered.',
      timestamp: formatTimestamp(delivery.deliveredAt),
    },
  ];

  return (
    <div className="min-h-full bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted/30 transition-colors"
            >
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
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0 py-1">
            <h3 className="font-bold text-base mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              Prasad: {delivery.poojaName || 'Sacred Prasad Box'}
            </h3>
            <p className="text-sm text-muted-foreground mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              {delivery.templeName || delivery.templeId || ''}
            </p>
            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
              isDelivered
                ? 'bg-green-100 text-green-800'
                : 'bg-primary/10 text-primary'
            }`}>
              {isDelivered ? 'Delivered' : 'In Transit'}
            </span>
          </div>
        </div>

        {/* Tracking Details */}
        {(delivery.trackingNumber || delivery.courier || delivery.estimatedDelivery || delivery.deliveryAddress) && (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            {delivery.trackingNumber && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Tracking ID</p>
                <p className="text-sm font-semibold" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                  {delivery.trackingNumber}
                  {delivery.courier ? ` (${delivery.courier})` : ''}
                </p>
              </div>
            )}
            {delivery.estimatedDelivery && (
              <div className="border-t border-border pt-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Estimated Delivery</p>
                <p className="text-lg font-bold text-primary" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                  {typeof delivery.estimatedDelivery === 'string'
                    ? delivery.estimatedDelivery
                    : formatTimestamp(delivery.estimatedDelivery)}
                </p>
              </div>
            )}
            {delivery.deliveryAddress && (
              <div className="border-t border-border pt-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Delivery Address</p>
                <p className="text-sm text-foreground whitespace-pre-line leading-relaxed" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                  {delivery.deliveryAddress}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Stepper */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Delivery Status</h3>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <div key={index} className="relative flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-card transition-all ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  } ${isCurrent ? 'ring-2 ring-primary/30 ring-offset-2 ring-offset-card' : ''}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 pt-1.5 pb-4">
                    <h4
                      className={`text-base font-bold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}
                      style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
                    >
                      {step.label}
                    </h4>
                    {step.timestamp && (
                      <p className="text-xs text-primary font-medium mb-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                        {step.timestamp}
                      </p>
                    )}
                    <p
                      className={`text-sm ${isCompleted ? 'text-foreground/80' : 'text-muted-foreground/60'}`}
                      style={{ fontFamily: "'Noto Sans', sans-serif" }}
                    >
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
