import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, ArrowLeft, Star, Truck, RefreshCw, ZoomIn, ChevronLeft, ChevronRight, Upload, Check, MessageSquare } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ui/ProductCard';
import StarRating from '../components/ui/StarRating';
import ReviewForm from '../components/ui/ReviewForm';
import ReviewsList from '../components/ui/ReviewsList';

type Page = 'home' | 'products' | 'gallery' | 'about' | 'contact' | 'product-detail' | 'auth' | 'dashboard' | 'admin' | 'cart';

type ProductDetailPageProps = {
  productId: string;
  onNavigate: (page: Page, params?: Record<string, string>) => void;
};

const FALLBACK_IMAGES = [
  'https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/5700184/pexels-photo-5700184.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export default function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState<Record<string, string>>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [tab, setTab] = useState<'description' | 'details' | 'reviews'>('description');
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('id', productId)
        .maybeSingle();

      if (data) {
        setProduct(data);
        if (data.category_id) {
          const { data: related } = await supabase
            .from('products')
            .select('*, categories(name, slug)')
            .eq('category_id', data.category_id)
            .eq('is_active', true)
            .neq('id', productId)
            .limit(4);
          setRelatedProducts(related || []);
        }
      }
      setLoading(false);
    }
    load();
    setSelectedImage(0);
    setCustomization({});
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity, customization);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  }

  function handleBuyNow() {
    if (!product) return;
    addItem(product, quantity, customization);
    onNavigate('cart');
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-luxury-gradient flex items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="w-10 h-10 border-2 border-champagne-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-poppins text-sm text-warm-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-luxury-gradient">
        <div className="text-center">
          <p className="font-playfair text-2xl text-warm-600 mb-4">Product not found</p>
          <button onClick={() => onNavigate('products')} className="btn-gold">Back to Shop</button>
        </div>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : FALLBACK_IMAGES;
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-luxury-gradient pt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <button onClick={() => onNavigate('products')} className="flex items-center gap-1.5 font-poppins text-sm text-warm-500 hover:text-champagne-600 transition-colors">
            <ArrowLeft size={14} />
            Shop
          </button>
          <span className="text-warm-300">/</span>
          {product.categories && (
            <>
              <button onClick={() => onNavigate('products', { category: product.categories!.slug })} className="font-poppins text-sm text-warm-500 hover:text-champagne-600 transition-colors">
                {product.categories.name}
              </button>
              <span className="text-warm-300">/</span>
            </>
          )}
          <span className="font-poppins text-sm text-warm-700 truncate">{product.name}</span>
        </div>

        {/* Main product layout */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          {/* Image gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative aspect-square bg-cream-100 overflow-hidden group cursor-zoom-in"
              onClick={() => setZoomOpen(true)}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <button className="absolute top-4 right-4 w-9 h-9 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={16} className="text-warm-700" />
              </button>
              {images.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedImage(i => (i - 1 + images.length) % images.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedImage(i => (i + 1) % images.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_featured && (
                  <span className="bg-champagne-500 text-white text-xs font-poppins px-2.5 py-1">Featured</span>
                )}
                {discount > 0 && (
                  <span className="bg-warm-800 text-cream-100 text-xs font-poppins px-2.5 py-1">-{discount}%</span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 shrink-0 overflow-hidden border-2 transition-all ${
                      idx === selectedImage ? 'border-champagne-500' : 'border-transparent hover:border-champagne-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-6">
            {product.categories && (
              <p className="font-poppins text-xs text-champagne-600 tracking-[0.2em] uppercase">{product.categories.name}</p>
            )}
            <h1 className="font-playfair text-3xl md:text-4xl text-warm-800 leading-tight">{product.name}</h1>

            {/* Rating */}
            <button onClick={() => setTab('reviews')} className="flex items-center gap-2 group">
              <StarRating value={4.9} readonly size={14} />
              <span className="font-poppins text-sm text-warm-500 group-hover:text-champagne-600 transition-colors">(Click to see reviews)</span>
            </button>

            {/* Price */}
            <div className="flex items-center gap-3 py-4 border-t border-b border-cream-200">
              <span className="font-playfair text-3xl text-warm-800">₹{product.price.toLocaleString()}</span>
              {product.original_price && (
                <span className="font-poppins text-lg text-warm-400 line-through">₹{product.original_price.toLocaleString()}</span>
              )}
              {discount > 0 && (
                <span className="bg-champagne-100 text-champagne-700 font-poppins text-xs px-2.5 py-1">Save {discount}%</span>
              )}
            </div>

            {/* Customization */}
            {product.is_customizable && product.customization_fields.length > 0 && (
              <div className="space-y-4 p-5 bg-cream-100 border border-cream-200">
                <h3 className="font-poppins text-sm font-medium text-warm-700 tracking-wide">Personalization</h3>
                {product.customization_fields.map((field, idx) => (
                  <div key={idx}>
                    <label className="font-poppins text-xs text-warm-600 mb-1.5 block">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        value={customization[field.label] || ''}
                        onChange={e => setCustomization(prev => ({ ...prev, [field.label]: e.target.value }))}
                        className="input-luxury text-xs"
                      />
                    )}
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={customization[field.label] || ''}
                        onChange={e => setCustomization(prev => ({ ...prev, [field.label]: e.target.value }))}
                        className="input-luxury text-xs"
                      />
                    )}
                    {field.type === 'image' && (
                      <label className="flex items-center gap-2 input-luxury text-xs cursor-pointer hover:border-champagne-400 transition-colors">
                        <Upload size={13} className="text-warm-400" />
                        <span className="text-warm-500">{customization[field.label] ? 'Photo selected' : 'Upload photo'}</span>
                        <input type="file" className="sr-only" accept="image/*" onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) setCustomization(prev => ({ ...prev, [field.label]: file.name }));
                        }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="font-poppins text-xs text-warm-600 mb-2 block tracking-wide uppercase">Quantity</label>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 border border-cream-300 flex items-center justify-center text-warm-600 hover:border-champagne-400 transition-colors"
                >
                  -
                </button>
                <span className="w-14 h-10 border-y border-cream-300 flex items-center justify-center font-poppins text-sm text-warm-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 border border-cream-300 flex items-center justify-center text-warm-600 hover:border-champagne-400 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                className="btn-gold w-full text-sm"
              >
                Buy Now
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-poppins text-sm tracking-wider border transition-all duration-200 ${
                    addedToCart || isInCart(product.id)
                      ? 'bg-warm-800 text-cream-100 border-warm-800'
                      : 'border-warm-800 text-warm-800 hover:bg-warm-800 hover:text-cream-100'
                  }`}
                >
                  {addedToCart ? (
                    <><Check size={14} /> Added to Cart</>
                  ) : (
                    <><ShoppingBag size={14} /> Add to Cart</>
                  )}
                </button>
                <button
                  onClick={() => toggle(product.id)}
                  className={`w-12 flex items-center justify-center border transition-all ${
                    isWishlisted(product.id) ? 'border-red-300 bg-red-50 text-red-500' : 'border-cream-300 text-warm-500 hover:border-champagne-400 hover:text-champagne-600'
                  }`}
                >
                  <Heart size={16} className={isWishlisted(product.id) ? 'fill-red-400' : ''} />
                </button>
              </div>
            </div>

            {/* Delivery info */}
            <div className="space-y-3 p-4 bg-cream-100 border border-cream-200">
              <div className="flex items-center gap-3">
                <Truck size={15} className="text-champagne-600 shrink-0" />
                <div>
                  <p className="font-poppins text-xs font-medium text-warm-700">Delivery in {product.delivery_days_min}–{product.delivery_days_max} Days</p>
                  <p className="font-poppins text-xs text-warm-400">Free shipping above ₹999</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw size={15} className="text-champagne-600 shrink-0" />
                <p className="font-poppins text-xs text-warm-600">Custom orders are non-returnable. Contact us within 24 hrs for damage claims.</p>
              </div>
            </div>

            {/* WhatsApp order */}
            <a
              href={(() => {
                const customText = Object.entries(customization).length > 0
                  ? `\n\n*Customization:*\n${Object.entries(customization).map(([k, v]) => `• ${k}: ${v}`).join('\n')}`
                  : '';
                const imageLink = images[0] ? `\n\n*Image:* ${images[0]}` : '';
                return `https://wa.me/+919876543210?text=${encodeURIComponent(`Hi Kala Vibez! I'd like to order:

*Product:* ${product.name}
*Price:* ₹${product.price.toLocaleString()}
*Quantity:* ${quantity}
*Delivery Time:* ${product.delivery_days_min}-${product.delivery_days_max} days${customText}${imageLink}`)}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 border border-[#25D366] text-[#25D366] font-poppins text-sm hover:bg-[#25D366]/5 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
              </svg>
              Order via WhatsApp
            </a>
          </div>
        </div>

        {/* Product tabs */}
        <div className="mt-16">
          <div className="flex border-b border-cream-200">
            {(['description', 'details', 'reviews'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 font-poppins text-sm capitalize transition-all ${
                  tab === t
                    ? 'border-b-2 border-champagne-500 text-champagne-600'
                    : 'text-warm-500 hover:text-warm-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="py-8">
            {tab === 'description' && (
              <div className="max-w-2xl">
                <p className="font-poppins text-sm text-warm-600 leading-relaxed">
                  {product.description || 'This beautiful handcrafted piece is made with premium materials and exceptional care. Each piece is unique and may have subtle variations — a testament to its handcrafted nature.'}
                </p>
                {product.is_customizable && (
                  <div className="mt-6 p-4 bg-champagne-50 border border-champagne-200">
                    <p className="font-poppins text-xs font-medium text-champagne-700 mb-1">Customization Available</p>
                    <p className="font-poppins text-xs text-warm-600">This product can be personalized with names, dates, or photos. Add your details above when ordering.</p>
                  </div>
                )}
              </div>
            )}
            {tab === 'details' && (
              <div className="max-w-lg space-y-3">
                {[
                  { label: 'Category', value: product.categories?.name || 'Handcrafted' },
                  { label: 'Delivery Time', value: `${product.delivery_days_min}–${product.delivery_days_max} business days` },
                  { label: 'Customizable', value: product.is_customizable ? 'Yes' : 'No' },
                  { label: 'Tags', value: product.tags.join(', ') || 'Handcrafted, Premium' },
                ].map(row => (
                  <div key={row.label} className="flex gap-8 py-3 border-b border-cream-200">
                    <span className="font-poppins text-xs text-warm-400 w-32 shrink-0">{row.label}</span>
                    <span className="font-poppins text-sm text-warm-700">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            {tab === 'reviews' && (
              <div className="max-w-4xl">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Review form */}
                  <div>
                    <ReviewForm
                      productId={product.id}
                      productName={product.name}
                      onSubmitted={() => setReviewRefreshKey(k => k + 1)}
                    />
                  </div>

                  {/* Reviews list */}
                  <div className="lg:order-first">
                    <h3 className="font-playfair text-lg text-warm-800 mb-4">Customer Reviews</h3>
                    <ReviewsList productId={product.id} refreshKey={reviewRefreshKey} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-playfair text-2xl text-warm-800 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onView={p => onNavigate('product-detail', { id: p.id })}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 bg-warm-900/90 flex items-center justify-center p-4" onClick={() => setZoomOpen(false)}>
          <div className="max-w-3xl max-h-[90vh] overflow-auto">
            <img src={images[selectedImage]} alt={product.name} className="max-w-full max-h-[90vh] object-contain" />
          </div>
          <button className="absolute top-4 right-4 text-white text-2xl">×</button>
        </div>
      )}
    </div>
  );
}
