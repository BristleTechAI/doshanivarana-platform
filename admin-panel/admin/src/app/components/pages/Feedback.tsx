import { useState, useEffect } from "react";
<<<<<<< Updated upstream
import { Star, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, Eye, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { collection, query, onSnapshot, doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
=======
import { Star, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, Eye, CheckCircle, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ratingTrend = [
  { month: "Jan", rating: 4.5 },
  { month: "Feb", rating: 4.6 },
  { month: "Mar", rating: 4.7 },
  { month: "Apr", rating: 4.6 },
  { month: "May", rating: 4.8 },
  { month: "Jun", rating: 4.9 },
];

const seedReviews = [
  {
    id: "1",
    devoteeName: "Rajesh Kumar",
    avatarText: "RK",
    avatarBg: "bg-tertiary-container text-on-tertiary-container",
    poojaName: "Sudarshana Homam",
    temple: "Tirumala Tirupati",
    date: "08 Jun 2026",
    rating: 5,
    submittedTime: "Submitted 08 Jun 9:00 AM",
    comment: '"The pooja was conducted beautifully by Pt. Sharma Ji. The live stream quality was excellent and we could participate fully from Bangalore. The prasad also arrived on time. Highly recommended!"',
    flagged: false
  },
  {
    id: "2",
    devoteeName: "Priya Sharma",
    avatarText: "PS",
    avatarBg: "bg-secondary-container text-on-secondary-container",
    poojaName: "Abhishekam",
    temple: "Sabarimala Temple",
    date: "07 Jun 2026",
    rating: 5,
    submittedTime: "Submitted 07 Jun 6:30 PM",
    comment: '"Felt the blessings of Lord Ayyappa through the screen. The timely delivery of prasad was a wonderful touch."',
    flagged: false
  },
  {
    id: "3",
    devoteeName: "Anand Reddy",
    avatarText: "AR",
    avatarBg: "bg-[#e8def8] text-[#1d192b]",
    poojaName: "Rudrabhishek",
    temple: "Kashi Vishwanath",
    date: "07 Jun 2026",
    rating: 3,
    submittedTime: "Submitted 07 Jun 10:15 AM",
    comment: '"The ritual was performed well but there was a 20-minute delay. Communication could be better."',
    flagged: false
  },
  {
    id: "4",
    devoteeName: "Sunita Devi",
    avatarText: "SD",
    avatarBg: "bg-[#f8bd00] text-white",
    poojaName: "Sahasranama Archana",
    temple: "Meenakshi Amman",
    date: "06 Jun 2026",
    rating: 5,
    submittedTime: "Submitted 06 Jun 4:00 PM",
    comment: '"Perfect experience from booking to prasad delivery. Will definitely book again for all festivals."',
    flagged: false
  },
  {
    id: "5",
    devoteeName: "Mohan Das",
    avatarText: "MD",
    avatarBg: "bg-surface-variant text-on-surface-variant",
    poojaName: "Kakad Aarti",
    temple: "Shirdi Sai Baba",
    date: "06 Jun 2026",
    rating: 2,
    submittedTime: "Submitted 06 Jun 1:00 PM",
    comment: '"The video quality was poor during the aarti. Couldn\'t see clearly. Disappointed with technical quality."',
    flagged: true
  },
  {
    id: "6",
    devoteeName: "Kavitha Iyer",
    avatarText: "KI",
    avatarBg: "bg-primary text-on-primary",
    poojaName: "Maha Abhishek",
    temple: "Somnath Temple",
    date: "05 Jun 2026",
    rating: 5,
    submittedTime: "Submitted 05 Jun 11:30 AM",
    comment: '"Outstanding service. The priest explained each step of the ritual in detail. Truly spiritually fulfilling."',
    flagged: false
  }
];

const templeRatings = [
  { temple: "Tirumala Tirupati", rating: 4.9, reviews: 8420 },
  { temple: "Kedarnath", rating: 4.9, reviews: 3840 },
  { temple: "Padmanabhaswamy", rating: 4.9, reviews: 2980 },
  { temple: "Sabarimala", rating: 4.8, reviews: 7240 },
  { temple: "Vaishno Devi", rating: 4.8, reviews: 5480 },
  { temple: "Meenakshi Amman", rating: 4.8, reviews: 4120 },
];
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
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
=======
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  const loadReviews = () => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('doshanivarana_feedback');
    if (!data) {
      localStorage.setItem('doshanivarana_feedback', JSON.stringify(seedReviews));
      return seedReviews;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return seedReviews;
    }
  };

  useEffect(() => {
    setReviewsList(loadReviews());

    const handleUpdate = () => {
      setReviewsList(loadReviews());
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('doshanivarana_feedback_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('doshanivarana_feedback_updated', handleUpdate);
    };
  }, []);

  const handleApprove = (id: string) => {
    const updated = reviewsList.map(r => r.id === id ? { ...r, flagged: false } : r);
    setReviewsList(updated);
    localStorage.setItem('doshanivarana_feedback', JSON.stringify(updated));
    window.dispatchEvent(new Event('doshanivarana_feedback_updated'));
  };

  const handleFlag = (id: string) => {
    const updated = reviewsList.map(r => r.id === id ? { ...r, flagged: true } : r);
    setReviewsList(updated);
    localStorage.setItem('doshanivarana_feedback', JSON.stringify(updated));
    window.dispatchEvent(new Event('doshanivarana_feedback_updated'));
  };

  const getSentiment = (rating: number) => {
    if (rating >= 4) return "Positive";
    if (rating === 3) return "Neutral";
    return "Negative";
  };

  // Computations
  const totalReviews = reviewsList.length;
  const totalRating = reviewsList.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(2) : "0.00";
  
  const positiveCount = reviewsList.filter(r => r.rating >= 4).length;
  const negativeCount = reviewsList.filter(r => r.rating <= 2).length;
  
  const positivePct = totalReviews > 0 ? ((positiveCount / totalReviews) * 100).toFixed(1) + "%" : "0.0%";
  const negativePct = totalReviews > 0 ? ((negativeCount / totalReviews) * 100).toFixed(1) + "%" : "0.0%";

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Platform Avg Rating", value: `${avgRating} ★`, color: "#D4A017", bg: "#FFFBEB" },
          { label: "Total Reviews", value: totalReviews.toLocaleString(), color: "#C76A00", bg: "#FFF0E6" },
          { label: "Positive Sentiment", value: positivePct, color: "#22C55E", bg: "#F0FDF4" },
          { label: "Negative Sentiment", value: negativePct, color: "#EF4444", bg: "#FFF1F2" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
            <div className="text-xl" style={{ color: s.color, fontWeight: 700 }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Rating Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Rating Trend</h3>
          <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>Platform average rating by month</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ratingTrend} barCategoryGap="50%">
              <CartesianGrid key="fb-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis key="fb-x" dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis key="fb-y" domain={[4, 5]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip key="fb-tooltip" contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar key="fb-bar-rating" dataKey="rating" name="Avg Rating" fill="#D4A017" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Rated Temples */}
        <div className="bg-white rounded-xl p-5 border" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
          <h3 className="mb-1" style={{ color: "#1F1F1F", fontWeight: 600 }}>Top Rated Temples</h3>
          <p className="mb-4" style={{ color: "#9CA3AF", fontSize: "12px" }}>By average devotee rating</p>
          <div className="space-y-3">
            {templeRatings.map((t, i) => (
              <div key={t.temple} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs w-4" style={{ color: "#9CA3AF", fontWeight: 600 }}>{i + 1}</span>
                  <div>
                    <div className="text-xs" style={{ color: "#1F1F1F", fontWeight: 500 }}>{t.temple}</div>
                    <div className="text-xs" style={{ color: "#9CA3AF" }}>{t.reviews.toLocaleString()} reviews</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={11} fill="#D4A017" style={{ color: "#D4A017" }} />
                  <span className="text-xs" style={{ color: "#1F1F1F", fontWeight: 700 }}>{t.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

>>>>>>> Stashed changes
      {/* Reviews */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <div>
            <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Recent Reviews</h3>
            <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Moderation queue — latest feedback</p>
          </div>
          <div className="flex items-center gap-2">
<<<<<<< Updated upstream
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#FFFBEB", color: "#D97706", fontWeight: 600 }}>{pendingCount} Pending Moderation</span>
=======
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#FFFBEB", color: "#D97706", fontWeight: 600 }}>
              {reviewsList.filter(r => r.flagged).length} Flagged / {totalReviews} Total
            </span>
>>>>>>> Stashed changes
          </div>
        </div>
        <div className="divide-y" style={{ divideColor: "rgba(199,106,0,0.06)" }}>
          {reviewsList.map((r) => {
            const sentiment = getSentiment(r.rating);
            const sc = sentimentConfig[sentiment];
            const SIcon = sc.icon;
            return (
<<<<<<< Updated upstream
              <div key={r.id} className={`px-5 py-4 transition-colors ${r.status === 'PENDING' ? 'bg-orange-50/50' : ''}`}>
=======
              <div key={r.id} className={`px-5 py-4 transition-colors ${r.flagged ? "bg-red-50/50" : "hover:bg-orange-50"}`}>
>>>>>>> Stashed changes
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ backgroundColor: "#C76A00", fontWeight: 700 }}>
                    {r.avatarText || (r.devoteeName ? r.devoteeName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "DV")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <span className="text-sm" style={{ color: "#1F1F1F", fontWeight: 600 }}>{r.devoteeName}</span>
                        <span className="mx-2 text-xs" style={{ color: "#D1D5DB" }}>·</span>
                        <span className="text-xs" style={{ color: "#C76A00", fontWeight: 500 }}>{r.temple}</span>
                        <span className="mx-2 text-xs" style={{ color: "#D1D5DB" }}>·</span>
                        <span className="text-xs" style={{ color: "#9CA3AF" }}>{r.poojaName}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
<<<<<<< Updated upstream
                        <span className="text-xs font-semibold mr-2">{r.status}</span>
=======
                        {r.flagged && (
                          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold uppercase tracking-wider">
                            Flagged / Hidden
                          </span>
                        )}
>>>>>>> Stashed changes
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                          <SIcon size={10} />
                          {sentiment}
                        </span>
<<<<<<< Updated upstream
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
=======
                        <button 
                          onClick={() => handleApprove(r.id)}
                          title="Approve / Unflag"
                          className="p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        >
                          <CheckCircle size={13} style={{ color: r.flagged ? "#9CA3AF" : "#22C55E" }} />
                        </button>
                        <button 
                          onClick={() => handleFlag(r.id)}
                          title="Flag / Hide"
                          className="p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        >
                          <AlertCircle size={13} style={{ color: r.flagged ? "#EF4444" : "#9CA3AF" }} />
                        </button>
>>>>>>> Stashed changes
                      </div>
                    </div>
                    <StarRating rating={r.rating} />
                    <p className="text-xs mt-1.5" style={{ color: "#6B7280", lineHeight: 1.6 }}>{r.comment}</p>
                    <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>{r.submittedTime || r.date}</p>
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
