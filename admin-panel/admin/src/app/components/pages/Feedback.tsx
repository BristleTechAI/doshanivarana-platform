import { useState, useEffect } from "react";
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Eye, CheckCircle, XCircle } from "lucide-react";

const sentimentConfig: Record<string, { bg: string; color: string; icon: typeof ThumbsUp }> = {
  Positive: { bg: "#F0FDF4", color: "#16A34A", icon: ThumbsUp },
  Neutral: { bg: "#FFFBEB", color: "#D97706", icon: MessageSquare },
  Negative: { bg: "#FFF1F2", color: "#DC2626", icon: ThumbsDown },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={11} fill={s <= rating ? "#D4A017" : "none"} style={{ color: "#D4A017" }} />
      ))}
    </div>
  );
}

const defaultFeedback = [
  { id: "fb1", devotee: "Ramesh P.", temple: "Kashi Vishwanath", service: "Rudrabhishek", rating: 5, comment: "Very blissful experience. The live stream was very clear and prasad was delivered on time.", sentiment: "Positive", date: "10 Jun 2026", status: "PENDING", avatar: "RP" },
  { id: "fb2", devotee: "Anjali S.", temple: "Meenakshi Amman", service: "Archana", rating: 4, comment: "Good service but the notification for stream start was delayed.", sentiment: "Positive", date: "09 Jun 2026", status: "PENDING", avatar: "AS" },
  { id: "fb3", devotee: "Vikas K.", temple: "Somnath", service: "Abhishek", rating: 2, comment: "I could not hear the mantras properly due to background noise.", sentiment: "Negative", date: "08 Jun 2026", status: "PENDING", avatar: "VK" },
  { id: "fb4", devotee: "Sushma R.", temple: "Tirumala", service: "Kalyanotsavam", rating: 5, comment: "Excellent darshan. Felt very divine.", sentiment: "Positive", date: "07 Jun 2026", status: "APPROVED", avatar: "SR" },
  { id: "fb5", devotee: "Deepak J.", temple: "Sabarimala", service: "Mandala Pooja", rating: 5, comment: "Prasad packaging was top notch.", sentiment: "Positive", date: "06 Jun 2026", status: "APPROVED", avatar: "DJ" },
  { id: "fb6", devotee: "Kavitha N.", temple: "Kedarnath", service: "Abhishek", rating: 3, comment: "Video was buffering a lot, please improve the stream quality.", sentiment: "Neutral", date: "06 Jun 2026", status: "PENDING", avatar: "KN" },
];

const LS_KEY = "demo_feedback";

function loadFeedback() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return defaultFeedback;
}

function saveFeedback(data: any) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export function Feedback() {
  const [reviews, setReviews] = useState(loadFeedback);

  useEffect(() => {
    saveFeedback(reviews);
  }, [reviews]);

  const handleAction = (id: string, newStatus: "APPROVED" | "REJECTED" | "HIDDEN") => {
    setReviews((prev: any) => prev.map((r: any) => r.id === id ? { ...r, status: newStatus } : r));
  };

  const pendingCount = reviews.filter((r: any) => r.status === "PENDING").length;

  return (
    <div className="space-y-5">
      {/* Reviews */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <div>
            <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Recent Reviews</h3>
            <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Moderation queue — latest feedback</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#FFFBEB", color: "#D97706", fontWeight: 600 }}>{pendingCount} Pending Moderation</span>
          </div>
        </div>
        <div className="divide-y" style={{ divideColor: "rgba(199,106,0,0.06)" }}>
          {reviews.map((r: any) => {
            const sc = sentimentConfig[r.sentiment] || sentimentConfig.Neutral;
            const SIcon = sc.icon;
            return (
              <div key={r.id} className={`px-5 py-4 transition-colors ${r.status === 'PENDING' ? 'bg-orange-50/50' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ backgroundColor: "#C76A00", fontWeight: 700 }}>
                    {r.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.devotee}</span>
                        <span className="mx-2 text-xs" style={{ color: "#D1D5DB" }}>·</span>
                        <span className="text-xs" style={{ color: "#C76A00", fontWeight: 500 }}>{r.temple}</span>
                        <span className="mx-2 text-xs" style={{ color: "#D1D5DB" }}>·</span>
                        <span className="text-xs" style={{ color: "#9CA3AF" }}>{r.service}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-semibold mr-2">{r.status}</span>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                          <SIcon size={10} />
                          {r.sentiment}
                        </span>
                        {r.status === "PENDING" && (
                          <>
                            <button onClick={() => handleAction(r.id, "APPROVED")} className="p-1.5 rounded-lg hover:bg-white transition-colors" title="Approve">
                              <CheckCircle size={13} style={{ color: "#22C55E" }} />
                            </button>
                            <button onClick={() => handleAction(r.id, "REJECTED")} className="p-1.5 rounded-lg hover:bg-white transition-colors" title="Reject">
                              <XCircle size={13} style={{ color: "#EF4444" }} />
                            </button>
                            <button onClick={() => handleAction(r.id, "HIDDEN")} className="p-1.5 rounded-lg hover:bg-white transition-colors" title="Hide">
                              <Eye size={13} style={{ color: "#6B7280" }} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <StarRating rating={r.rating} />
                    <p className="text-xs mt-1.5" style={{ color: "#6B7280", lineHeight: 1.6 }}>{r.comment}</p>
                    <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{r.date}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {reviews.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">No feedback available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
