import { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

type ProductCardProps = {
  product: Product;
  onView: (product: Product) => void;
};

export default function ProductCard({ product, onView }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    addItem(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    toggle(product.id);
  }

  const imageUrl = product.images[0] || `https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=400`;

  return (
    <div
      className="product-card group cursor-pointer"
      onClick={() => onView(product)}
    >
      {/* Image container */}
      <div className="relative overflow-hidden aspect-[3/4] bg-cream-100">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-cream-200 shimmer-bg" />
        )}
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="bg-champagne-500 text-white font-poppins text-[9px] tracking-[0.15em] px-2 py-0.5 uppercase">
              Featured
            </span>
          )}
          {discount > 0 && (
            <span className="bg-warm-800 text-cream-100 font-poppins text-[9px] tracking-[0.1em] px-2 py-0.5 uppercase">
              -{discount}%
            </span>
          )}
          {product.is_customizable && (
            <span className="bg-white/90 text-warm-700 font-poppins text-[9px] tracking-[0.1em] px-2 py-0.5 uppercase">
              Custom
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
        >
          <Heart
            size={14}
            className={`transition-colors ${isWishlisted(product.id) ? 'fill-red-400 text-red-400' : 'text-warm-600'}`}
          />
        </button>

        {/* Quick actions overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-poppins tracking-wider transition-all duration-200 ${
                addedToCart || isInCart(product.id)
                  ? 'bg-warm-800 text-cream-100'
                  : 'bg-champagne-500 text-white hover:bg-champagne-600'
              }`}
            >
              <ShoppingBag size={12} />
              {addedToCart ? 'Added!' : isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onView(product); }}
              className="w-9 flex items-center justify-center border border-cream-300 text-warm-600 hover:border-champagne-400 hover:text-champagne-600 transition-colors"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className="p-4 bg-white border border-cream-100 group-hover:border-champagne-200 transition-colors duration-300">
        <p className="font-poppins text-[10px] text-warm-400 tracking-[0.15em] uppercase mb-1">
          {product.categories?.name || 'Handcrafted'}
        </p>
        <h3 className="font-poppins text-sm font-medium text-warm-800 leading-snug line-clamp-2 group-hover:text-champagne-700 transition-colors duration-200">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} className="fill-champagne-400 text-champagne-400" />
          ))}
          <span className="font-poppins text-[10px] text-warm-400 ml-1">(12)</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-poppins text-base font-semibold text-warm-800">
            ₹{product.price.toLocaleString()}
          </span>
          {product.original_price && (
            <span className="font-poppins text-xs text-warm-400 line-through">
              ₹{product.original_price.toLocaleString()}
            </span>
          )}
        </div>
        {product.is_customizable && (
          <p className="font-poppins text-[10px] text-champagne-600 mt-1.5 tracking-wide">
            + Customization available
          </p>
        )}
      </div>
    </div>
  );
}
