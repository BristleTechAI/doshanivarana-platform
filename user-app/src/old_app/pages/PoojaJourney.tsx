import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Play, Package, Truck, Video, Star } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router';
import { BookingsService } from '../../services/firebase/bookings';
import { LiveStreamsService } from '../../services/firebase/liveStreams';
import { RecordingsService } from '../../services/firebase/recordings';
import { DeliveriesService } from '../../services/firebase/deliveries';
import { FeedbackService } from '../../services/firebase/feedback';
import { useAuth } from '../../contexts/AuthContext';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTimestamp(ts: any): string {
  if (!ts) return '';
  let d: Date;
  if (ts.toDate) d = ts.toDate();
  else if (ts.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function deliveryStatusToStage(status: string): number {
  const s = (status || '').toUpperCase();
  if (s === 'PACKED') return 0;
  if (s === 'SHIPPED' || s === 'IN_TRANSIT') return 1;
  if (s === 'OUT_FOR_DELIVERY') return 2;
  if (s === 'DELIVERED') return 3;
  return -1;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function PoojaJourney() {
  const navigate = useNavigate();
  const { id: bookingId } = useParams<{ id: string }>();
  const { user } = useAuth();

  // ── Four real-time data streams ───────────────────────────────────────────
  const [booking, setBooking] = useState<any>(null);
  const [liveStream, setLiveStream] = useState<any>(null);
  const [recording, setRecording] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

  // ── Feedback modal ────────────────────────────────────────────────────────
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // ── Subscribe to Booking ──────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    setLoadingBooking(true);
    const unsub = BookingsService.subscribeToBookingById(bookingId, (b) => {
      setBooking(b);
      setLoadingBooking(false);
    });
    return () => unsub();
  }, [bookingId]);

  // ── Subscribe to Live Stream ──────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    const unsub = LiveStreamsService.subscribeToLiveStreamByBooking(bookingId, setLiveStream);
    return () => unsub();
  }, [bookingId]);

  // ── Subscribe to Recording ────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    const unsub = RecordingsService.subscribeToRecordingByBooking(bookingId, setRecording);
    return () => unsub();
  }, [bookingId]);

  // ── Subscribe to Delivery ─────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    const unsub = DeliveriesService.subscribeToDeliveryByBooking(bookingId, setDelivery);
    return () => unsub();
  }, [bookingId]);

  // ── Check if feedback already submitted ───────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    FeedbackService.getFeedbackByBooking(bookingId).then(fb => {
      if (fb) setFeedbackSubmitted(true);
    });
  }, [bookingId]);

  // ── Derive stage states ───────────────────────────────────────────────────

  const streamStatus = liveStream?.streamStatus || liveStream?.status || '';
  const isLive = streamStatus === 'Live' || streamStatus === 'LIVE';
  const streamEnded = streamStatus === 'Ended' || streamStatus === 'ENDED' || streamStatus === 'Archived';
  const recordingPublished = recording?.status === 'Published' || recording?.status === 'PUBLISHED';
  const bookingCompleted =
    booking?.bookingStatus === 'Completed' ||
    booking?.bookingStatus === 'COMPLETED' ||
    booking?.status === 'COMPLETED' ||
    streamEnded;
  const pujariAssigned = !!(booking?.priestId && booking.priestId !== 'Not Assigned');
  const isScheduled = !!(booking?.scheduledDate || liveStream?.slotId);
  const deliveryStage = deliveryStatusToStage(delivery?.status || '');
  const prasadPacked = deliveryStage >= 0;
  const prasadDispatched = deliveryStage >= 1;
  const prasadDelivered = deliveryStage >= 3;

  // ── Build dynamic stages ──────────────────────────────────────────────────

  type StageStatus = 'completed' | 'current' | 'upcoming';

  interface Stage {
    id: number;
    icon: any;
    name: string;
    desc: string;
    status: StageStatus;
    timestamp?: string;
    cta?: { label: string; to?: string; action?: () => void; disabled?: boolean };
  }

  const stages: Stage[] = [
    {
      id: 1,
      icon: CheckCircle2,
      name: 'Seva Offered',
      desc: `Your ritual request has been received with devotion.`,
      status: booking ? 'completed' : 'current',
      timestamp: formatTimestamp(booking?.createdAt),
    },
    {
      id: 2,
      icon: CheckCircle2,
      name: 'Pujari Assigned',
      desc: pujariAssigned
        ? `${booking.priestName} has been assigned to conduct your seva.`
        : 'A Pujari will be assigned shortly.',
      status: pujariAssigned ? 'completed' : booking ? 'current' : 'upcoming',
      timestamp: pujariAssigned ? formatTimestamp(booking?.updatedAt) : undefined,
    },
    {
      id: 3,
      icon: CheckCircle2,
      name: 'Scheduled',
      desc: isScheduled
        ? `Sankalpam timed for ${booking?.scheduledDate || ''}${booking?.scheduledTime ? ' at ' + booking.scheduledTime : ''}.`
        : 'Schedule will be confirmed soon.',
      status: isScheduled ? 'completed' : pujariAssigned ? 'current' : 'upcoming',
      timestamp: isScheduled ? (booking?.scheduledDate || '') : undefined,
    },
    {
      id: 4,
      icon: CheckCircle2,
      name: 'Pooja Live',
      desc: isLive
        ? 'Sacred live stream is broadcasting. Blessings being shared.'
        : streamEnded
        ? 'Sacred live stream was broadcasted. Blessings shared.'
        : 'Your Pooja broadcast will begin at the scheduled time.',
      status: isLive || streamEnded ? 'completed' : isScheduled ? 'current' : 'upcoming',
      timestamp: formatTimestamp(liveStream?.actualStartTime),
      cta: isLive
        ? { label: 'Watch Live Now', to: `/live/${bookingId}` }
        : undefined,
    },
    {
      id: 5,
      icon: CheckCircle2,
      name: 'Completed',
      desc: bookingCompleted
        ? `Pooja performed successfully in your name and Gothram.`
        : 'Awaiting pooja completion.',
      status: bookingCompleted ? 'completed' : isLive ? 'current' : 'upcoming',
      timestamp: formatTimestamp(liveStream?.actualEndTime),
    },
    {
      id: 6,
      icon: Play,
      name: 'Recording Ready',
      desc: recordingPublished
        ? 'Your dedicated pooja video is ready to watch.'
        : 'Your dedicated pooja video archive is preparing.',
      status: recordingPublished ? 'completed' : bookingCompleted ? 'current' : 'upcoming',
      cta: recordingPublished && recording?.recordingUrl
        ? { label: 'Watch Recording', to: `/live/${bookingId}` }
        : undefined,
    },
    {
      id: 7,
      icon: Package,
      name: 'Prasad Packed',
      desc: prasadPacked
        ? 'Sacred elements packaged in the Devaseva blessing box.'
        : 'Prasad will be packed after pooja completion.',
      status: prasadPacked ? 'completed' : bookingCompleted ? 'current' : 'upcoming',
      timestamp: formatTimestamp(delivery?.packedAt),
    },
    {
      id: 8,
      icon: Truck,
      name: 'Dispatched',
      desc: prasadDispatched
        ? `Tracking: ${delivery?.trackingNumber || '—'} via ${delivery?.courier || delivery?.courierName || '—'}`
        : 'Your prasad will be dispatched soon.',
      status: prasadDispatched ? 'completed' : prasadPacked ? 'current' : 'upcoming',
      timestamp: formatTimestamp(delivery?.shippedAt || delivery?.dispatchedAt),
      cta: prasadDispatched
        ? { label: 'Track Prasad Box', to: `/delivery/${bookingId}` }
        : undefined,
    },
    {
      id: 9,
      icon: CheckCircle2,
      name: 'Prasad Delivered',
      desc: prasadDelivered
        ? 'Your blessed prasad has been delivered.'
        : 'Estimated delivery coming soon.',
      status: prasadDelivered ? 'completed' : prasadDispatched ? 'current' : 'upcoming',
      timestamp: formatTimestamp(delivery?.deliveredAt),
    },
  ];

  // Active current stage for bottom CTA logic
  const isRecordingReady = recordingPublished && !!(recording?.recordingUrl);

  const handleFeedbackSubmit = async () => {
    if (!user || !bookingId || submittingFeedback) return;
    setSubmittingFeedback(true);
    try {
      await FeedbackService.submitFeedback(
        user.uid,
        bookingId,
        feedbackRating,
        feedbackComment,
        booking?.templeId
      );
      setFeedbackSubmitted(true);
      setShowFeedback(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loadingBooking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
          Loading your Pooja Journey…
        </p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-4">Booking not found.</p>
          <Link to="/bookings" className="text-primary text-sm font-medium">View My Bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-lg mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl hover:bg-muted/50 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
                Pooja Journey
              </h1>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                Booking ID: {bookingId}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Sankalpam Details Card */}
      <div className="max-w-lg mx-auto px-6 pt-6">
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>
            Sankalpam Details
          </p>
          <div className="space-y-2">
            {[
              { label: 'Pooja Seva', value: booking.poojaName || '—' },
              { label: 'Temple Location', value: booking.templeName || booking.templeId || '—' },
              { label: 'Devotee Name', value: booking.devoteeName || booking.devoteeNames || '—' },
              { label: 'Gothram / Nakshatra', value: [booking.gothram, booking.nakshatra].filter(Boolean).join(' / ') || '—' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>{row.label}</span>
                <span className="text-xs font-semibold text-right max-w-[55%]" style={{ fontFamily: "'Noto Sans', sans-serif" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-lg mx-auto px-6 pb-8">
        <div className="relative">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className="relative pb-8">
                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`absolute left-[22px] top-[44px] w-0.5 h-full ${
                      isCompleted
                        ? 'bg-primary'
                        : isCurrent
                        ? 'bg-gradient-to-b from-primary to-border'
                        : 'border-l-2 border-dashed border-border'
                    }`}
                  />
                )}

                <div className="flex gap-4">
                  {/* Icon Circle */}
                  <div
                    className={`relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isCurrent
                        ? 'bg-primary/20 text-primary ring-4 ring-primary/20'
                        : 'bg-card border-2 border-border text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`font-semibold ${isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'} ${isCurrent ? 'text-primary' : ''}`}
                        style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
                      >
                        {stage.name}
                      </h3>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                    </div>
                    <p
                      className="text-sm text-muted-foreground mb-2 leading-relaxed"
                      style={{ fontFamily: "'Noto Sans', sans-serif" }}
                    >
                      {stage.desc}
                    </p>
                    {stage.timestamp && (
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
                        {stage.timestamp}
                      </p>
                    )}
                    {stage.cta && (
                      stage.cta.to ? (
                        <Link to={stage.cta.to}>
                          <button
                            className="mt-3 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-bold bg-primary/5 hover:bg-primary/10 transition-colors"
                            style={{ fontFamily: "'Noto Sans', sans-serif" }}
                          >
                            {stage.cta.label}
                          </button>
                        </Link>
                      ) : (
                        <button
                          onClick={stage.cta.action}
                          disabled={stage.cta.disabled}
                          className="mt-3 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-bold bg-primary/5 hover:bg-primary/10 transition-colors disabled:opacity-50"
                          style={{ fontFamily: "'Noto Sans', sans-serif" }}
                        >
                          {stage.cta.label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback Section — shown after completion */}
        {bookingCompleted && !feedbackSubmitted && (
          <div className="mt-2 bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-primary" />
              <h3 className="font-semibold" style={{ fontFamily: "'Anek Devanagari', sans-serif" }}>Rate Your Experience</h3>
            </div>
            {!showFeedback ? (
              <button
                onClick={() => setShowFeedback(true)}
                className="w-full py-2 rounded-xl border border-primary text-primary text-sm font-bold bg-primary/5 hover:bg-primary/10 transition-colors"
                style={{ fontFamily: "'Noto Sans', sans-serif" }}
              >
                Share Your Blessings Experience
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setFeedbackRating(star)}>
                      <Star
                        className={`w-7 h-7 transition-colors ${star <= feedbackRating ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={feedbackComment}
                  onChange={e => setFeedbackComment(e.target.value)}
                  placeholder="Share your experience with the pooja…"
                  rows={3}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  style={{ fontFamily: "'Noto Sans', sans-serif" }}
                />
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={submittingFeedback}
                  className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-[#E05C10] transition-colors disabled:opacity-50"
                  style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
                >
                  {submittingFeedback ? 'Submitting…' : 'Submit Feedback'}
                </button>
              </div>
            )}
          </div>
        )}

        {bookingCompleted && feedbackSubmitted && (
          <div className="mt-2 bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
            <Star className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-sm font-medium text-primary" style={{ fontFamily: "'Noto Sans', sans-serif" }}>
              Feedback submitted. Thank you for sharing your blessings experience!
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTAs */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
        <div className="max-w-lg mx-auto flex gap-3">
          {/* Watch Live / Watch Recording */}
          {isLive ? (
            <Link to={`/live/${bookingId}`} className="flex-1">
              <button
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-[#E05C10] transition-colors"
                style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
              >
                🔴 Watch Video Broadcast
              </button>
            </Link>
          ) : isRecordingReady ? (
            <Link to={`/live/${bookingId}`} className="flex-1">
              <button
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-[#E05C10] transition-colors"
                style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
              >
                <Video className="w-4 h-4 inline mr-2" />
                Watch Recording
              </button>
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-semibold text-sm cursor-not-allowed"
              style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
            >
              Watch Video Broadcast
            </button>
          )}

          {/* Track Prasad Box */}
          {prasadDispatched ? (
            <Link to={`/delivery/${bookingId}`} className="flex-1">
              <button
                className="w-full py-3 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
                style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
              >
                Track Prasad Box
              </button>
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 py-3 rounded-xl border-2 border-border text-muted-foreground font-semibold text-sm cursor-not-allowed"
              style={{ fontFamily: "'Anek Devanagari', sans-serif" }}
            >
              Track Prasad Box
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
