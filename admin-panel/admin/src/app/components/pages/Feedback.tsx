import { useState, useEffect } from "react";
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Eye, CheckCircle, XCircle } from "lucide-react";
import { FeedbackService } from "../../../services/firebase/feedback";
import { useAuth } from "../../../contexts/AuthContext";

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

export function Feedback() {
  const [reviews, setReviews] = useState<any[]>([]);
  const { user } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const unsubscribe = FeedbackService.subscribeToFeedback(setReviews);
    return () => unsubscribe();
  }, []);

  const handleAction = async (id: string, newStatus: "APPROVED" | "REJECTED" | "HIDDEN") => {
    if (!user) return;
    setLoadingAction(id);
    try {
      await FeedbackService.updateFeedbackStatus(id, newStatus, user.uid);
    } catch (error: any) {
      alert("Error updating feedback: " + error.message);
    } finally {
      setLoadingAction(null);
    }
  };

  const pendingCount = reviews.filter((r: any) => r.status === "PENDING").length;

  useEffect(() => {
    setPage(1);
  }, [reviews.length]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(reviews.length / itemsPerPage) || 1;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = reviews.slice(startIndex, endIndex);

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
          {paginatedReviews.map((r: any) => {
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
                            <button disabled={loadingAction === r.id} onClick={() => handleAction(r.id, "APPROVED")} className="p-1.5 rounded-lg hover:bg-white transition-colors" title="Approve">
                              <CheckCircle size={13} style={{ color: "#22C55E" }} />
                            </button>
                            <button disabled={loadingAction === r.id} onClick={() => handleAction(r.id, "REJECTED")} className="p-1.5 rounded-lg hover:bg-white transition-colors" title="Reject">
                              <XCircle size={13} style={{ color: "#EF4444" }} />
                            </button>
                            <button disabled={loadingAction === r.id} onClick={() => handleAction(r.id, "HIDDEN")} className="p-1.5 rounded-lg hover:bg-white transition-colors" title="Hide">
                              <Eye size={13} style={{ color: "#6B7280" }} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <StarRating rating={r.rating} />
                    <p className="text-xs mt-1.5" style={{ color: "#6B7280", lineHeight: 1.6 }}>{r.comment}</p>
                    <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{r.date || new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {reviews.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-500">No feedback available.</div>
          )}
        </div>
        {/* Pagination */}
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>
            Showing {reviews.length === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, reviews.length)} of {reviews.length} reviews
          </span>
          <div className="flex items-center gap-2">
            <button 
              className="px-2 py-1 text-xs border rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-bold" 
              disabled={page === 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button 
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className="w-6 h-6 text-xs rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                  style={{
                    backgroundColor: page === pageNum ? "#C76A00" : "transparent",
                    color: page === pageNum ? "#FFFFFF" : "#6B7280",
                    fontWeight: page === pageNum ? 700 : 500
                  }}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button 
              className="px-2 py-1 text-xs border rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-bold" 
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
