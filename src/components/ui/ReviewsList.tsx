import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { supabase, ProductReview } from '../../lib/supabase';
import StarRating, { RatingDisplay } from './StarRating';

type ReviewsListProps = {
  productId: string;
  refreshKey?: number;
};

export default function ReviewsList({ productId, refreshKey }: ReviewsListProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, total: 0, breakdown: [0, 0, 0, 0, 0] });

  useEffect(() => {
    loadReviews();
  }, [productId, refreshKey]);

  async function loadReviews() {
    setLoading(true);
    const { data } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
      // Calculate stats
      const total = data.length;
      const avg = total > 0 ? data.reduce((s, r) => s + r.rating, 0) / total : 0;
      const breakdown = [5, 4, 3, 2, 1].map(star => data.filter(r => r.rating === star).length);
      setStats({ avg, total, breakdown });
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="py-8">
        <div className="h-32 bg-cream-200 shimmer-bg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-cream-50 border border-cream-200 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Overall rating */}
          <div className="text-center md:text-left md:w-48">
            <p className="font-playfair text-5xl text-warm-800">{stats.avg.toFixed(1)}</p>
            <div className="flex justify-center md:justify-start mt-2">
              <StarRating value={Math.round(stats.avg)} readonly size={18} />
            </div>
            <p className="font-poppins text-xs text-warm-500 mt-1">{stats.total} review{stats.total !== 1 ? 's' : ''}</p>
          </div>

          {/* Rating breakdown */}
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star, idx) => {
              const count = stats.breakdown[idx];
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 mb-1.5">
                  <span className="font-poppins text-xs text-warm-600 w-4">{star}</span>
                  <Star value={star} size={11} filled />
                  <div className="flex-1 h-2 bg-cream-200 overflow-hidden">
                    <div
                      className="h-full bg-champagne-400 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-poppins text-xs text-warm-400 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Individual reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white border border-cream-200">
          <p className="font-poppins text-sm text-warm-500">No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white p-5 border border-cream-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-champagne-100 flex items-center justify-center overflow-hidden">
                      <span className="font-playfair text-sm text-champagne-600">
                        {review.customer_name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="font-poppins text-sm font-medium text-warm-800">{review.customer_name || 'Anonymous'}</p>
                      <p className="font-poppins text-xs text-warm-400">
                        {new Date(review.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <StarRating value={review.rating} readonly size={12} />
                </div>
              </div>
              {review.review && (
                <p className="font-poppins text-sm text-warm-600 leading-relaxed mt-3">{review.review}</p>
              )}
              {review.is_verified && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-cream-100">
                  <Check size={12} className="text-green-500" />
                  <span className="font-poppins text-xs text-green-600">Verified Purchase</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Small star helper
function Star({ value, size, filled }: { value: number; size: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="text-champagne-400">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
