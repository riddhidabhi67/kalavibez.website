import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from './StarRating';

type ReviewFormProps = {
  productId: string;
  productName: string;
  onSubmitted: () => void;
};

export default function ReviewForm({ productId, productName, onSubmitted }: ReviewFormProps) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [form, setForm] = useState({ review: '', customer_name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }

    setSubmitting(true);
    setError('');

    const reviewData = {
      product_id: productId,
      user_id: user?.id || null,
      rating,
      review: form.review,
      customer_name: user ? (profile?.display_name || 'Customer') : form.customer_name,
      email: user ? user.email! : form.email,
      is_verified: !!user,
      is_visible: true,
    };

    try {
      const { error: insertError } = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      }).then(r => r.json());

      // Fallback: direct Supabase insert (for demo, using anon key)
      const { error: supError } = await (await import('../../lib/supabase')).supabase
        .from('product_reviews')
        .insert(reviewData);

      if (supError) throw supError;

      setSubmitted(true);
      setRating(0);
      setForm({ review: '', customer_name: '', email: '' });
      onSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review. Please try again.');
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 p-6 text-center">
        <Check size={32} className="text-green-500 mx-auto mb-3" />
        <p className="font-poppins text-sm text-green-700 font-medium mb-1">Thank you for your review!</p>
        <p className="font-poppins text-xs text-green-600">Your feedback helps other customers make better choices.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-cream-50 border border-cream-200 p-6">
      <h3 className="font-playfair text-lg text-warm-800 mb-4">Write a Review</h3>
      <p className="font-poppins text-xs text-warm-500 mb-5">Share your experience with {productName}</p>

      {/* Star Rating */}
      <div className="mb-5">
        <label className="font-poppins text-xs text-warm-600 mb-2 block">
          Your Rating <span className="text-red-400">*</span>
        </label>
        <div className="flex items-center gap-3">
          <StarRating value={rating} onChange={setRating} size={28} />
          {rating > 0 && (
            <span className="font-poppins text-sm text-champagne-600">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </span>
          )}
        </div>
      </div>

      {/* Review text */}
      <div className="mb-4">
        <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Your Review</label>
        <textarea
          rows={4}
          placeholder="Share your thoughts about this product..."
          value={form.review}
          onChange={e => setForm(p => ({ ...p, review: e.target.value }))}
          className="input-luxury resize-none text-sm"
        />
      </div>

      {/* Guest fields */}
      {!user && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="font-poppins text-xs text-warm-600 mb-1.5 block">
              Your Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Your name"
              value={form.customer_name}
              onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
              className="input-luxury text-sm"
            />
          </div>
          <div>
            <label className="font-poppins text-xs text-warm-600 mb-1.5 block">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="input-luxury text-sm"
            />
          </div>
        </div>
      )}

      {/* Logged in user display */}
      {user && (
        <p className="font-poppins text-xs text-warm-500 mb-4 p-3 bg-white border border-cream-200">
          Reviewing as <span className="font-medium text-warm-700">{profile?.display_name || user.email}</span>
        </p>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-3 mb-4">
          <AlertCircle size={14} className="text-red-500" />
          <p className="font-poppins text-xs text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </span>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
}
