import { useState, useEffect } from 'react';
import { db, type Review } from '../lib/db';
import { PageHeader } from '../components/PageHeader';

export function Feedback() {
  const [reviews, setReviews] = useState<Review[]>(() => db.getFeedback());

  useEffect(() => {
    const handleUpdate = () => {
      setReviews(db.getFeedback());
    };
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('doshanivarana_feedback_updated', handleUpdate);

    return () => {
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('doshanivarana_feedback_updated', handleUpdate);
    };
  }, []);

  const [poojaFilter, setPoojaFilter] = useState('All Poojas');
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [poojaFilter, starFilter]);

  const handleReset = () => {
    setPoojaFilter('All Poojas');
    setStarFilter(null);
  };

  const filteredReviews = reviews.filter(r => {
    const matchesPooja = poojaFilter === 'All Poojas' || r.poojaName === poojaFilter;
    const matchesStar = starFilter === null || r.rating === starFilter;
    return matchesPooja && matchesStar;
  });

  const uniquePoojas = ['All Poojas', ...Array.from(new Set(reviews.map(r => r.poojaName)))];

  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1)
    : '0.0';

  const countByStar = (star: number) => reviews.filter(r => r.rating === star).length;
  const pctByStar = (star: number) => totalReviewsCount > 0
    ? Math.round((countByStar(star) / totalReviewsCount) * 100)
    : 0;

  // Pagination calculations
  const reviewsPerPage = 5;
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage) || 1;
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

  const fromIndex = filteredReviews.length > 0 ? startIndex + 1 : 0;
  const toIndex = Math.min(startIndex + reviewsPerPage, filteredReviews.length);

  return (
    <div className="max-w-[1440px] mx-auto pb-12 font-sans relative">
      <PageHeader title="Feedback & Reviews" />
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between mt-4 gap-4">
        <div>
          <p className="text-body-lg text-on-surface-variant font-medium">Read-only view — feedback for your Temple</p>
        </div>
        <div className="bg-surface-container py-2 px-4 rounded-full border border-outline-variant/30 flex items-center gap-2 text-on-surface-variant w-fit font-semibold text-xs">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span>View Only — Contact Admin to moderate feedback</span>
        </div>
      </div>

      {/* Summary Section Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 font-semibold">
        {/* Left: Overall Rating Card */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] p-6 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[200px]">star</span>
          </div>
          
          <div className="flex flex-col items-center text-center md:text-left md:items-start shrink-0">
            <div className="text-[64px] leading-none text-[#D4A017] font-bold mb-2 font-display">{averageRating}</div>
            <div className="flex text-[#D4A017] mb-2 text-2xl gap-1">
              {[1, 2, 3, 4, 5].map(star => {
                const val = parseFloat(averageRating);
                const isFull = star <= val;
                const isHalf = !isFull && (star - 0.5 <= val);
                return (
                  <span 
                    key={star} 
                    className="material-symbols-outlined" 
                    style={{ fontVariationSettings: isFull || isHalf ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {isFull ? 'star' : isHalf ? 'star_half' : 'star'}
                  </span>
                );
              })}
            </div>
            <p className="text-body-sm text-on-surface-variant font-medium">Based on {totalReviewsCount} reviews</p>
          </div>
          
          <div className="w-full flex-grow flex flex-col gap-2 z-10 text-xs text-on-surface-variant">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center gap-3 w-full">
                <div className="flex items-center w-24 font-bold">
                  <span className="material-symbols-outlined text-[#D4A017] text-sm mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> 
                  {star} star{star > 1 ? 's' : ''}
                </div>
                <div className="flex-grow h-2 bg-surface-variant rounded-full overflow-hidden flex">
                  <div className="bg-[#D4A017] h-full rounded-full" style={{ width: `${pctByStar(star)}%` }}></div>
                </div>
                <div className="w-20 text-right font-medium">{countByStar(star)} reviews</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="lg:col-span-4 grid grid-rows-3 gap-4">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Total Reviews</span>
              <span className="text-headline-lg text-on-surface font-bold leading-none">{totalReviewsCount}</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">forum</span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Pending</span>
              <span className="text-headline-lg text-on-surface font-bold leading-none">{reviews.filter(r => r.status === 'PENDING').length}</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">hourglass_top</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] p-4 flex items-center justify-between bg-gradient-to-r from-surface-container-lowest to-[#fffbf0]">
            <div className="flex flex-col">
              <span className="text-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Average</span>
              <span className="text-headline-lg text-[#D4A017] font-bold leading-none">{averageRating} ★</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fdf5e6] border border-[#f0e6d2] flex items-center justify-center text-[#D4A017]">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] p-4 mb-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex flex-wrap items-center gap-4">
          <select 
            value={poojaFilter}
            onChange={(e) => setPoojaFilter(e.target.value)}
            className="rounded-full border border-outline-variant bg-transparent py-2 pl-4 pr-10 font-button text-button text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer font-bold"
          >
            {uniquePoojas.map((p, i) => <option key={i} value={p}>{p}</option>)}
          </select>
          
          <div className="flex items-center border border-outline-variant rounded-full overflow-hidden h-[38px] font-bold text-xs">
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star}
                type="button"
                onClick={() => setStarFilter(starFilter === star ? null : star)}
                className={`px-3 h-full flex items-center justify-center border-r last:border-r-0 border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer ${
                  starFilter === star ? 'bg-[#ffeae1] text-primary' : 'text-on-surface-variant'
                }`}
              >
                {star}★
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3 font-semibold">
          <button 
            onClick={handleReset}
            className="text-on-surface-variant hover:text-on-surface px-4 py-2 rounded-full transition-colors cursor-pointer font-bold text-xs"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Feedback Cards List */}
      <div className="flex flex-col gap-4 mb-8 font-sans">
        {paginatedReviews.map(review => {
          if (review.flagged) {
            return (
              <div key={review.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-surface/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
                  <div className="bg-surface-container-lowest border border-outline-variant px-6 py-4 rounded-xl shadow-lg flex flex-col items-center text-center">
                    <div className="flex items-center gap-2 text-error mb-1">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                      <span className="font-display text-headline-sm font-bold">Feedback Hidden</span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant font-bold">This feedback has been flagged or rejected by Admin</p>
                  </div>
                </div>
                
                <div className="opacity-20 pointer-events-none select-none font-semibold">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">U</div>
                      <div>
                        <h3 className="font-display text-headline-sm text-on-surface">Unknown User</h3>
                        <p className="text-label-md text-on-surface-variant">{review.poojaName} • {review.date}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-body-md text-on-surface">[Content Hidden]</p>
                </div>
              </div>
            );
          }

          return (
            <div key={review.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-[#F0E6D2] p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-2 font-semibold">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display text-headline-sm font-bold ${review.avatarBg}`}>
                    {review.avatarText}
                  </div>
                  <div>
                    <h3 className="font-display text-headline-sm text-on-surface font-bold">{review.devoteeName}</h3>
                    <p className="text-label-md text-on-surface-variant">{review.poojaName} • {review.date}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end">
                  <div className="flex text-[#D4A017] mb-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span 
                        key={s} 
                        className="material-symbols-outlined text-lg" 
                        style={{ fontVariationSettings: s <= review.rating ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-medium">{review.submittedTime}</span>
                </div>
              </div>
              
              <p className="text-body-md text-on-surface font-semibold italic">
                {review.comment}
              </p>
            </div>
          );
        })}

        {filteredReviews.length === 0 && (
          <div className="bg-surface-container-lowest border border-[#F0E6D2] p-12 text-center rounded-xl text-on-surface-variant font-semibold">
            No feedback found matching filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-container-lowest rounded-xl border border-[#F0E6D2] p-4 gap-4 font-semibold text-body-sm">
        <span className="text-on-surface-variant">Showing {fromIndex}–{toIndex} of {filteredReviews.length} reviews</span>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                currentPage === page
                  ? 'bg-primary text-on-primary font-bold'
                  : 'hover:bg-surface-container-low text-on-surface'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-container-low cursor-pointer disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>

    </div>
  );
}
