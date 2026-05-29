import { useState } from 'react';
import { Star } from 'lucide-react';

type StarRatingProps = {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
};

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 16,
  showValue = false,
  reviewCount,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform duration-100 ${!readonly && 'hover:scale-110'}`}
        >
          <Star
            size={size}
            className={`transition-colors duration-150 ${
              (hover || value) >= star
                ? 'fill-champagne-400 text-champagne-400'
                : 'text-cream-300'
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className="font-poppins text-sm text-warm-600 ml-1">
          {value.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="text-warm-400"> ({reviewCount})</span>
          )}
        </span>
      )}
    </div>
  );
}

// Compact rating display component
export function RatingDisplay({ rating, count, size = 14 }: { rating: number; count?: number; size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <StarRating value={rating} readonly size={size} />
      {count !== undefined && (
        <span className="font-poppins text-xs text-warm-400">({count})</span>
      )}
    </div>
  );
}
