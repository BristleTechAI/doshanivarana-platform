import { useState, useEffect } from "react";
import { Star, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, Eye, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { collection, query, onSnapshot, doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "feedback"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fbPromises = snapshot.docs.map(async (d) => {
        const data = d.data();
        let poojaName = "Pooja";
        let devoteeName = "Devotee";
        let templeName = "Temple";

        try {
          if (data.bookingId) {
            const bookingSnap = await getDoc(doc(db, "bookings", data.bookingId));
            if (bookingSnap.exists()) {
              const bData = bookingSnap.data();
              poojaName = bData.poojaName || poojaName;
              devoteeName = bData.devoteeDetails?.name || bData.devoteeName || devoteeName;
              templeName = bData.templeName || templeName;
            }
          }
        } catch (e) { console.error(e); }

        const dateObj = data.createdAt ? data.createdAt.toDate() : new Date();
        const date = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        
        let sentiment = "Neutral";
        if (data.rating >= 4) sentiment = "Positive";
        else if (data.rating <= 2) sentiment = "Negative";

        return {
          id: d.id,
          devotee: devoteeName,
          temple: templeName,
          service: poojaName,
          rating: data.rating || 0,
          comment: data.review || "",
          sentiment,
          date,
          status: data.status || "PENDING",
          avatar: devoteeName.substring(0, 2).toUpperCase(),
          bookingId: data.bookingId,
        };
      });

      const resolved = await Promise.all(fbPromises);
      resolved.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setReviews(resolved);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = async (id: string, newStatus: "APPROVED" | "REJECTED" | "HIDDEN") => {
    try {
      const fbRef = doc(db, "feedback", id);
      await updateDoc(fbRef, { status: newStatus });

      // Generate System Event
      const fbDoc = await getDoc(fbRef);
      if (fbDoc.exists()) {
        const data = fbDoc.data();
        await setDoc(doc(collection(db, "systemEvents")), {
          eventType: newStatus === "APPROVED" ? "feedback.approved" : "feedback.rejected",
          entityId: id,
          entityType: "feedback",
          payload: {
            feedbackId: id,
            bookingId: data.bookingId,
            userId: data.userId,
            templeId: data.templeId,
            status: newStatus
          },
          status: "PENDING",
          createdAt: serverTimestamp()
        });

        await setDoc(doc(collection(db, "auditLogs")), {
          action: `FEEDBACK_${newStatus}`,
          entityId: id,
          entityType: "feedback",
          performedBy: "admin",
          timestamp: serverTimestamp(),
          details: `Feedback ${id} ${newStatus.toLowerCase()} by admin.`
        });
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update feedback status");
    }
  };

  const pendingCount = reviews.filter(r => r.status === "PENDING").length;

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Feedback...</div>;
  }

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
          {reviews.map((r) => {
            const sc = sentimentConfig[r.sentiment];
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
