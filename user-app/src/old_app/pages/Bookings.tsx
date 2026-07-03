import { Circle, CheckCircle2, Clock, Package, PlayCircle, Video, X, Star } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { BookingsService } from '../../services/firebase/bookings';
import { FeedbackService } from '../../services/firebase/feedback';
import { useAuth } from '../../contexts/AuthContext';

// ─── Stage derivation from live Firestore fields ─────────────────────────────
function getBookingStage(b: any): number {
  if (!b) return 0;
  // Stage 1: Booking exists
  let stage = 1;
  // Stage 2: Pujari assigned
  if (b.priestId && b.priestId !== 'Not Assigned') stage = 2;
  // Stage 3: Scheduled date exists
  if (b.scheduledDate) stage = 3;
  // Stage 4: Stream is live  
  if (b.streamStatus === 'Live' || b.streamStatus === 'LIVE') stage = 4;
  // Stage 5: Pooja completed
  if (b.bookingStatus === 'Completed' || b.status === 'COMPLETED' || b.streamStatus === 'Ended') stage = 5;
  // Stage 6: Recording published
  if (b.recordingStatus === 'Published' || b.recordingStatus === 'Available') stage = 6;
  // Stage 7: Prasad packed
  if (b.deliveryStatus === 'PACKED' || b.deliveryStatus === 'Packed') stage = 7;
  // Stage 8: Dispatched
  if (['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'Dispatched', 'In Transit', 'Out for Delivery'].includes(b.deliveryStatus)) stage = 8;
  // Stage 9: Delivered
  if (b.deliveryStatus === 'DELIVERED' || b.deliveryStatus === 'Delivered') stage = 9;
  return stage;
}

function isBookingCompleted(b: any): boolean {
  return (
    b.bookingStatus === 'Completed' ||
    b.status === 'COMPLETED' ||
    b.streamStatus === 'Ended' ||
    b.streamStatus === 'ENDED' ||
    b.deliveryStatus === 'DELIVERED' ||
    b.deliveryStatus === 'Delivered'
  );
}

function getPoojaImage(poojaName: string): string {
  return 'https://images.unsplash.com/photo-1680342786718-39d1febb5349?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB0ZW1wbGUlMjB3b3JzaGlwJTIwcml0dWFsfGVufDF8fHx8MTc3MzgyNTQ1Mnww&ixlib=rb-4.1.0&q=80&w=1080';
}

function formatDate(b: any): string {
  if (b.scheduledDate) return b.scheduledDate;
  if (b.createdAt?.toDate) return b.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  if (b.createdAt?.seconds) return new Date(b.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return '—';
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function Bookings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; bookingId: string | null }>({ isOpen: false, bookingId: null });
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState<{ isOpen: boolean; bookingId: string | null }>({ isOpen: false, bookingId: null });
  const [refundModal, setRefundModal] = useState<{ isOpen: boolean; bookingId: string | null }>({ isOpen: false, bookingId: null });
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; bookingId: string | null }>({ isOpen: false, bookingId: null });
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // ── Real-time subscription to user's bookings from Firestore ─────────────
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = BookingsService.subscribeToUserBookings(user.uid, (bookings) => {
      setAllBookings(bookings);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  // ── Map & filter ──────────────────────────────────────────────────────────
  const mappedBookings = allBookings.map((b: any) => {
    const completed = isBookingCompleted(b);
    const cancelled = b.bookingStatus === 'Cancelled' || b.status === 'CANCELLED';
    const status = cancelled ? 'cancelled' : completed ? 'completed' : 'upcoming';
    return {
      id: b.id,
      title: b.poojaName || '—',
      temple: b.templeName || b.templeId || '—',
      date: formatDate(b),
      status,
      currentStage: getBookingStage(b),
      hasRecording: b.recordingStatus === 'Published' || b.recordingStatus === 'Available',
      imageUrl: getPoojaImage(b.poojaName || ''),
      raw: b,
    };
  });

  const filteredBookings = mappedBookings.filter(b =>
    activeTab === 'active' ? b.status === 'upcoming' : (b.status === 'completed' || b.status === 'cancelled')
  );

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleCancelBooking = async () => {
    const id = cancelModal.bookingId;
    if (!id || !user) return;
    setCancellingId(id);
    try {
      await BookingsService.cancelBooking(id, user.uid, cancelReason || 'User requested cancellation');
    } catch (e) {
      console.error(e);
    }
    setCancellingId(null);
    setCancelModal({ isOpen: false, bookingId: null });
    setCancelReason('');
  };

  const handleFeedbackSubmit = async () => {
    const id = feedbackModal.bookingId;
    if (!id || !user || submittingFeedback) return;
    const booking = allBookings.find(b => b.id === id);
    setSubmittingFeedback(true);
    try {
      await FeedbackService.submitFeedback(
        user.uid, id, feedbackRating, feedbackComment, booking?.templeId
      );
    } catch (e) {
      console.error(e);
    }
    setSubmittingFeedback(false);
    setFeedbackModal({ isOpen: false, bookingId: null });
    setFeedbackRating(5);
    setFeedbackComment('');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>My Bookings</h1>
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
              activeTab === 'active' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ fontFamily: "'Noto Sans', sans-serif" }}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'completed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ fontFamily: "'Noto Sans', sans-serif" }}
          >
            Past & Completed
          </button>
        </div>

        {/* Bookings */}
        <div className="space-y-4 pb-24">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredBookings.length === 0 ? (
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
                onCancel={() => setCancelModal({ isOpen: true, bookingId: booking.id })}
                onReschedule={() => setRescheduleModal({ isOpen: true, bookingId: booking.id })}
                onRefund={() => setRefundModal({ isOpen: true, bookingId: booking.id })}
                onFeedback={() => setFeedbackModal({ isOpen: true, bookingId: booking.id })}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {/* Cancel Modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 relative">
            <button onClick={() => setCancelModal({ isOpen: false, bookingId: null })} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Cancel Booking</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure? This action cannot be undone.</p>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Reason for cancellation</label>
              <textarea
                className="w-full border border-border rounded-lg p-3 text-sm bg-background"
                rows={3}
                placeholder="Please tell us why..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCancelModal({ isOpen: false, bookingId: null })} className="flex-1 py-2.5 rounded-xl border border-border font-medium text-sm">Keep Booking</button>
              <button
                onClick={handleCancelBooking}
                disabled={!!cancellingId}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50"
              >
                {cancellingId ? 'Cancelling…' : 'Cancel It'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 relative">
            <button onClick={() => setRescheduleModal({ isOpen: false, bookingId: null })} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
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
              <textarea className="w-full border border-border rounded-lg p-3 text-sm bg-background" rows={2} placeholder="Optional reason..." />
            </div>
            <button
              onClick={() => setRescheduleModal({ isOpen: false, bookingId: null })}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90"
            >
              Submit Request
            </button>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 relative">
            <button onClick={() => setRefundModal({ isOpen: false, bookingId: null })} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Request Refund</h3>
            <p className="text-sm text-muted-foreground mb-4">Your refund request will be reviewed within 24–48 hours.</p>
            <div className="mb-4">
              <label className="text-sm font-medium block mb-1">Refund Method</label>
              <select className="w-full border border-border rounded-lg p-3 text-sm bg-background">
                <option>Original Payment Method</option>
                <option>Devaseva Wallet</option>
              </select>
            </div>
            <button onClick={() => setRefundModal({ isOpen: false, bookingId: null })} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90">
              Submit Refund Request
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 relative">
            <button onClick={() => setFeedbackModal({ isOpen: false, bookingId: null })} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Rate Experience</h3>
            <p className="text-sm text-muted-foreground mb-4">How was your pooja experience?</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setFeedbackRating(star)}>
                  <Star className={`w-8 h-8 transition-colors ${star <= feedbackRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
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
                onChange={e => setFeedbackComment(e.target.value)}
              />
            </div>
            <button
              onClick={handleFeedbackSubmit}
              disabled={submittingFeedback}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50"
            >
              {submittingFeedback ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Booking Card Component ──────────────────────────────────────────────────

function BookingCard({
  id, title, temple, date, status, currentStage, imageUrl, hasRecording,
  onCancel, onReschedule, onRefund, onFeedback
}: {
  id: string; title: string; temple: string; date: string; status: string;
  currentStage: number; imageUrl: string; hasRecording?: boolean;
  onCancel: () => void; onReschedule: () => void; onRefund: () => void; onFeedback: () => void;
}) {
  const stages = [
    { label: 'Seva Offered', icon: CheckCircle2 },
    { label: 'Pujari Assigned', icon: CheckCircle2 },
    { label: 'Scheduled', icon: Clock },
    { label: 'Pooja Live', icon: PlayCircle },
    { label: 'Completed', icon: CheckCircle2 },
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
          <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>{title}</h3>
          <p className="text-sm text-muted-foreground mb-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>{temple}</p>
          <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-muted/50 rounded" style={{ fontFamily: "'Noto Sans Mono', monospace" }}>
            {id.slice(0, 12)}…
          </span>
        </div>
        <div className="text-right">
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor()}`}>
            {status}
          </div>
          <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: "'Noto Sans', sans-serif" }}>{date}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-muted/10 border-b border-border flex gap-2 overflow-x-auto">
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

      {/* Journey Mini-Timeline */}
      {status !== 'cancelled' && (
        <div className="p-4">
          <h4 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Pooja Journey</h4>
          <div className="space-y-3">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const stageNum = index + 1;
              const isCompleted = stageNum < currentStage;
              const isCurrent = stageNum === currentStage;

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'bg-primary/20 text-primary ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>
                  <p className={`text-sm font-medium flex-1 ${isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'} ${isCurrent ? 'text-primary font-semibold' : ''}`}
                    style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                    {stage.label}
                  </p>
                  {isCompleted && <div className="text-xs text-primary">✓</div>}
                  {isCurrent && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                </div>
              );
            })}
          </div>

          <Link to={`/journey/${id}`}>
            <button className="w-full mt-4 py-2.5 rounded-xl border-2 border-primary text-primary hover:bg-primary/5 transition-colors font-medium text-sm"
              style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
              View Full Journey
            </button>
          </Link>

          {hasRecording && (
            <Link to={`/live/${id}`}>
              <button className="w-full mt-3 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-[#E05C10] transition-colors font-medium text-sm flex items-center justify-center gap-2"
                style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
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