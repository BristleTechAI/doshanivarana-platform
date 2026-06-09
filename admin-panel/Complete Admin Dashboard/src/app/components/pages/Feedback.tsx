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

const reviews = [
  { id: 1, devotee: "Rajesh K.", temple: "Tirumala Tirupati", service: "Sudarshana Homam", rating: 5, comment: "An incredibly divine experience. The priest performed the ritual with great devotion. The live stream quality was excellent.", sentiment: "Positive", date: "08 Jun 2026", avatar: "RK" },
  { id: 2, devotee: "Priya M.", temple: "Sabarimala Temple", service: "Abhishekam", rating: 5, comment: "Felt the blessings of Lord Ayyappa through the screen. The timely delivery of prasad was a wonderful touch.", sentiment: "Positive", date: "07 Jun 2026", avatar: "PM" },
  { id: 3, devotee: "Ankit S.", temple: "Kashi Vishwanath", service: "Rudrabhishek", rating: 3, comment: "The ritual was performed well but there was a 20-minute delay. Communication could be better.", sentiment: "Neutral", date: "07 Jun 2026", avatar: "AS" },
  { id: 4, devotee: "Sunita R.", temple: "Meenakshi Amman", service: "Sahasranama Archana", rating: 5, comment: "Perfect experience from booking to prasad delivery. Will definitely book again for all festivals.", sentiment: "Positive", date: "06 Jun 2026", avatar: "SR" },
  { id: 5, devotee: "Mohan D.", temple: "Shirdi Sai Baba", service: "Kakad Aarti", rating: 2, comment: "The video quality was poor during the aarti. Couldn't see clearly. Disappointed with technical quality.", sentiment: "Negative", date: "06 Jun 2026", avatar: "MD" },
  { id: 6, devotee: "Kavitha I.", temple: "Somnath Temple", service: "Maha Abhishek", rating: 5, comment: "Outstanding service. The priest explained each step of the ritual in detail. Truly spiritually fulfilling.", sentiment: "Positive", date: "05 Jun 2026", avatar: "KI" },
];

const templeRatings = [
  { temple: "Tirumala Tirupati", rating: 4.9, reviews: 8420 },
  { temple: "Kedarnath", rating: 4.9, reviews: 3840 },
  { temple: "Padmanabhaswamy", rating: 4.9, reviews: 2980 },
  { temple: "Sabarimala", rating: 4.8, reviews: 7240 },
  { temple: "Vaishno Devi", rating: 4.8, reviews: 5480 },
  { temple: "Meenakshi Amman", rating: 4.8, reviews: 4120 },
];

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
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Platform Avg Rating", value: "4.78 ★", color: "#D4A017", bg: "#FFFBEB" },
          { label: "Total Reviews", value: "1.84M", color: "#C76A00", bg: "#FFF0E6" },
          { label: "Positive Sentiment", value: "91.4%", color: "#22C55E", bg: "#F0FDF4" },
          { label: "Negative Sentiment", value: "2.8%", color: "#EF4444", bg: "#FFF1F2" },
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

      {/* Reviews */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "rgba(199,106,0,0.1)" }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(199,106,0,0.08)" }}>
          <div>
            <h3 style={{ color: "#1F1F1F", fontWeight: 600 }}>Recent Reviews</h3>
            <p style={{ color: "#9CA3AF", fontSize: "12px" }}>Moderation queue — latest feedback</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: "#FFFBEB", color: "#D97706", fontWeight: 600 }}>12 Pending Moderation</span>
          </div>
        </div>
        <div className="divide-y" style={{ divideColor: "rgba(199,106,0,0.06)" }}>
          {reviews.map((r) => {
            const sc = sentimentConfig[r.sentiment];
            const SIcon = sc.icon;
            return (
              <div key={r.id} className="px-5 py-4 hover:bg-orange-50 transition-colors">
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
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: sc.bg, color: sc.color, fontWeight: 600 }}>
                          <SIcon size={10} />
                          {r.sentiment}
                        </span>
                        <button className="p-1.5 rounded-lg hover:bg-white transition-colors">
                          <CheckCircle size={13} style={{ color: "#22C55E" }} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white transition-colors">
                          <AlertCircle size={13} style={{ color: "#EF4444" }} />
                        </button>
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
        </div>
      </div>
    </div>
  );
}
