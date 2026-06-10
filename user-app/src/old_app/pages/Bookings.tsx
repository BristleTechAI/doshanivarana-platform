import { Circle, CheckCircle2, Clock, Package, PlayCircle, Video, X, Star } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { POOJAS } from '../lib/poojas';

export function Bookings() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Modal States
  const [cancelModal, setCancelModal] = useState<{isOpen: boolean, bookingId: string | null}>({isOpen: false, bookingId: null});
  const [rescheduleModal, setRescheduleModal] = useState<{isOpen: boolean, bookingId: string | null}>({isOpen: false, bookingId: null});
  const [refundModal, setRefundModal] = useState<{isOpen: boolean, bookingId: string | null}>({isOpen: false, bookingId: null});
  const [feedbackModal, setFeedbackModal] = useState<{isOpen: boolean, bookingId: string | null}>({isOpen: false, bookingId: null});

  // Feedback fields
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>("");

  // Fetch bookings dynamically from localStorage
  const [allBookings, setAllBookings] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const bookingsData = localStorage.getItem('doshanivarana_bookings');
      return bookingsData ? JSON.parse(bookingsData) : [];
    }
    return [];
  });

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'doshanivarana_bookings') {
        const data = localStorage.getItem('doshanivarana_bookings');
        setAllBookings(data ? JSON.parse(data) : []);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    const handleCustomUpdate = () => {
      const data = localStorage.getItem('doshanivarana_bookings');
      setAllBookings(data ? JSON.parse(data) : []);
    };
    window.addEventListener('doshanivarana_bookings_updated', handleCustomUpdate);
    window.addEventListener('focus', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('doshanivarana_bookings_updated', handleCustomUpdate);
      window.removeEventListener('focus', handleCustomUpdate);
    };
  }, []);

  const getPoojaImage = (poojaName: string) => {
    const found = POOJAS.find(
      (p) =>
        p.title.toLowerCase().includes(poojaName.toLowerCase()) ||
        poojaName.toLowerCase().includes(p.title.toLowerCase())
    );
    return found ? found.imageUrl : 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080';
  };

  const getBookingStage = (b: any) => {
    let stage = 1; // Seva Offered
    if (b.paymentStatus === 'Confirmed') stage = 2; // Confirmed
    if (b.pujari !== 'Not Assigned') stage = 3; // Scheduled
    if (b.streamStatus === 'In Progress') stage = 4; // Pooja Live
    if (b.streamStatus === 'Ended') stage = 5; // Completed
    if (b.recordingStatus === 'Available') stage = 6; // Recording Ready
    if (b.deliveryStatus === 'Packed') stage = 7; // Prasad Packed
    if (b.deliveryStatus === 'Dispatched' || b.deliveryStatus === 'In Transit' || b.deliveryStatus === 'Out for Delivery') stage = 8; // Dispatched / In Transit / Out for Delivery
    if (b.deliveryStatus === 'Delivered') stage = 9; // Delivered
    return stage;
  };

  const mappedBookings = allBookings.map((b: any) => {
    const status = b.tab || (b.streamStatus === 'Ended' ? 'completed' : 'upcoming');
    return {
      id: b.id,
      title: b.poojaName,
      temple: b.temple,
      date: b.dateTime,
      status: status,
      currentStage: getBookingStage(b),
      hasRecording: b.recordingStatus === 'Available',
      imageUrl: getPoojaImage(b.poojaName),
    };
  });

  const filteredBookings = mappedBookings.filter((booking) =>
    activeTab === 'active' ? booking.status === 'upcoming' : booking.status === 'completed'
  );

  const handleCancelBooking = (id: string) => {
    const updated = allBookings.map(b => b.id === id ? { ...b, tab: 'cancelled', paymentStatus: 'Pending' } : b);
    localStorage.setItem('doshanivarana_bookings', JSON.stringify(updated));
    window.dispatchEvent(new Event('doshanivarana_bookings_updated'));
    setCancelModal({isOpen: false, bookingId: null});
  };

  const handleRefundRequest = () => {
    setRefundModal({isOpen: false, bookingId: null});
    alert("Refund request submitted successfully.");
  };

  const handleFeedbackSubmit = () => {
    const bookingId = feedbackModal.bookingId;
    if (!bookingId) return;

    // 1. Update the booking feedback locally in doshanivarana_bookings
    const currentBookingsData = localStorage.getItem('doshanivarana_bookings');
    let bookingsList = currentBookingsData ? JSON.parse(currentBookingsData) : [];
    
    const updatedBookings = bookingsList.map((b: any) => {
      if (b.id === bookingId) {
        return {
          ...b,
          feedback: feedbackComment
        };
      }
      return b;
    });

    localStorage.setItem('doshanivarana_bookings', JSON.stringify(updatedBookings));
    window.dispatchEvent(new Event('doshanivarana_bookings_updated'));

    // 2. Find the updated booking to copy details to review
    const booking = updatedBookings.find((b: any) => b.id === bookingId);
    if (booking) {
      // 3. Save the feedback to the global feed
      const currentFeedbackData = localStorage.getItem('doshanivarana_feedback');
      let feedbackList = currentFeedbackData ? JSON.parse(currentFeedbackData) : [];

      const newReview = {
        id: String(Date.now()),
        devoteeName: booking.devoteeName || "Anonymous Devotee",
        avatarText: booking.devoteeName ? booking.devoteeName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "DV",
        avatarBg: "bg-[#e8def8] text-[#1d192b]",
        poojaName: booking.poojaName,
        temple: booking.temple || "Sri Venkateswara Temple",
        date: booking.dateTime ? booking.dateTime.split(',')[0] : new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        rating: feedbackRating,
        submittedTime: `Submitted Today, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        comment: `"${feedbackComment}"`,
        flagged: false
      };

      feedbackList.unshift(newReview);
      localStorage.setItem('doshanivarana_feedback', JSON.stringify(feedbackList));
      window.dispatchEvent(new Event('doshanivarana_feedback_updated'));
    }

    setFeedbackModal({isOpen: false, bookingId: null});
    setFeedbackRating(5);
    setFeedbackComment("");
    alert("Thank you for your feedback!");
  };

  const handleRescheduleSubmit = () => {
    setRescheduleModal({isOpen: false, bookingId: null});
    alert("Reschedule request submitted to PRO.");
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            {t('bookings.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            Track your pooja journey
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-card rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'active' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('common.active')}
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'completed' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Past & Completed
          </button>
        </div>

        {/* Bookings */}
        <div className="space-y-4 pb-24">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                No {activeTab} bookings
              </h3>
              <p className="text-sm text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                {activeTab === 'active' 
                  ? 'Book your first pooja to get started' 
                  : 'Your completed poojas will appear here'}
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                {...booking} 
                onCancel={() => setCancelModal({isOpen: true, bookingId: booking.id})}
                onReschedule={() => setRescheduleModal({isOpen: true, bookingId: booking.id})}
                onRefund={() => setRefundModal({isOpen: true, bookingId: booking.id})}
                onFeedback={() => setFeedbackModal({isOpen: true, bookingId: booking.id})}
              />
            ))
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 relative">
            <button onClick={() => setCancelModal({isOpen: false, bookingId: null})} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Cancel Booking</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Reason for cancellation</label>
              <textarea className="w-full border border-border rounded-lg p-3 text-sm bg-background" rows={3} placeholder="Please tell us why..."></textarea>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal({isOpen: false, bookingId: null})} className="flex-1 py-2.5 rounded-xl border border-border font-medium text-sm">Keep Booking</button>
              <button onClick={() => handleCancelBooking(cancelModal.bookingId!)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-medium text-sm hover:opacity-90">Cancel It</button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 relative">
            <button onClick={() => setRescheduleModal({isOpen: false, bookingId: null})} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Reschedule Request</h3>
            <p className="text-sm text-muted-foreground mb-4">Select a new date. This requires approval from the PRO.</p>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Select New Date</label>
              <input type="date" className="w-full border border-border rounded-lg p-3 text-sm bg-background" />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Reason</label>
              <textarea className="w-full border border-border rounded-lg p-3 text-sm bg-background" rows={2} placeholder="Optional reason..."></textarea>
            </div>
            <button onClick={handleRescheduleSubmit} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90">Submit Request</button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 relative">
            <button onClick={() => setRefundModal({isOpen: false, bookingId: null})} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Request Refund</h3>
            <p className="text-sm text-muted-foreground mb-4">Your refund request will be reviewed by our admin team within 24-48 hours.</p>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Refund Method</label>
              <select className="w-full border border-border rounded-lg p-3 text-sm bg-background">
                <option>Original Payment Method</option>
                <option>Devaseva Wallet</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Additional Details</label>
              <textarea className="w-full border border-border rounded-lg p-3 text-sm bg-background" rows={2} placeholder="Any specific details..."></textarea>
            </div>
            <button onClick={handleRefundRequest} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90">Submit Refund Request</button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 relative">
            <button onClick={() => setFeedbackModal({isOpen: false, bookingId: null})} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Rate Experience</h3>
            <p className="text-sm text-muted-foreground mb-4">How was your pooja experience?</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= feedbackRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Write a Review</label>
              <textarea
                className="w-full border border-border rounded-lg p-3 text-sm bg-background"
                rows={3}
                placeholder="Tell us more..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
              />
            </div>
            <button onClick={handleFeedbackSubmit} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90">Submit Feedback</button>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingCard({
  id,
  title,
  temple,
  date,
  status,
  currentStage,
  imageUrl,
  hasRecording,
  onCancel,
  onReschedule,
  onRefund,
  onFeedback
}: {
  id: string;
  title: string;
  temple: string;
  date: string;
  status: string;
  currentStage: number;
  imageUrl: string;
  hasRecording?: boolean;
  onCancel: () => void;
  onReschedule: () => void;
  onRefund: () => void;
  onFeedback: () => void;
}) {
  const stages = [
    { label: 'Seva Offered', icon: CheckCircle2 },
    { label: 'Confirmed', icon: CheckCircle2 },
    { label: 'Scheduled', icon: Clock },
    { label: 'Pooja Live', icon: PlayCircle },
    { label: 'Completed', icon: CheckCircle2 },
    { label: 'Recording Ready', icon: PlayCircle },
    { label: 'Prasad Packed', icon: Package },
    { label: 'Dispatched', icon: Package },
    { label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStatusColor = () => {
    if (status === 'upcoming') return 'bg-primary/10 text-primary';
    if (status === 'completed') return 'bg-green-500/10 text-green-500';
    return 'bg-red-500/10 text-red-500';
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-border">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {temple}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono text-muted-foreground px-2 py-1 bg-muted/50 rounded"
              style={{ fontFamily: "'Noto Sans Mono', monospace" }}
            >
              {id}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor()}`}>
            {status}
          </div>
          <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
            {date}
          </p>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="p-4 bg-muted/10 border-b border-border flex gap-2 overflow-x-auto scrollbar-hide">
        {status === 'upcoming' && (
          <>
            <button onClick={onReschedule} className="px-4 py-2 rounded-lg bg-background border border-border text-sm font-medium whitespace-nowrap hover:bg-muted/30">
              Request Reschedule
            </button>
            <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm font-medium whitespace-nowrap hover:bg-red-100">
              Cancel Booking
            </button>
          </>
        )}
        {status === 'completed' && (
          <button onClick={onFeedback} className="px-4 py-2 rounded-lg bg-background border border-border text-sm font-medium whitespace-nowrap hover:bg-muted/30 flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            Leave Feedback
          </button>
        )}
        {status === 'cancelled' && (
          <button onClick={onRefund} className="px-4 py-2 rounded-lg bg-background border border-border text-sm font-medium whitespace-nowrap hover:bg-muted/30 text-primary">
            Request Refund
          </button>
        )}
      </div>

      {/* Journey Timeline (Only if not cancelled) */}
      {status !== 'cancelled' && (
        <div className="p-4">
          <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            Pooja Journey
          </h4>
          <div className="space-y-3">
            {stages.slice(0, 5).map((stage, index) => {
              const Icon = stage.icon;
              const isCompleted = index < currentStage;
              const isCurrent = index === currentStage;

              return (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'bg-primary/20 text-primary ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCurrent ? (
                      <Circle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                      style={{ fontFamily: "'Noto Sans', sans-serif" }}
                    >
                      {stage.label}
                    </p>
                  </div>
                  {isCompleted && (
                    <div className="text-xs text-muted-foreground">✓</div>
                  )}
                </div>
              );
            })}
          </div>
          
          <Link to={`/journey/${id}`}>
            <button className="w-full mt-4 py-2.5 rounded-xl border-2 border-primary text-primary hover:bg-primary/5 transition-colors font-medium text-sm">
              View Full Journey
            </button>
          </Link>
          
          {hasRecording && (
            <Link to={`/live/${id.replace('DS', '')}`}>
              <button className="w-full mt-3 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-[#E05C10] transition-colors font-medium text-sm flex items-center justify-center gap-2">
                <Video className="w-4 h-4" />
                Watch Recording
              </button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}