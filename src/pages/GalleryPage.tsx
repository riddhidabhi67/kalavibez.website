import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, GalleryItem } from '../lib/supabase';

const FILTER_TAGS = ['All', 'Resin', 'Candles', 'Wax Melts', 'Clocks', 'Wedding', 'Corporate'];

const FALLBACK_GALLERY = [
  { id: '1', title: 'Ocean Resin Tray', image_url: 'https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['Resin'] },
  { id: '2', title: 'Luxury Candle Set', image_url: 'https://images.pexels.com/photos/5700184/pexels-photo-5700184.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['Candles'] },
  { id: '3', title: 'Wax Melt Collection', image_url: 'https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['Wax Melts'] },
  { id: '4', title: 'Wedding Frame', image_url: 'https://images.pexels.com/photos/1178479/pexels-photo-1178479.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['Wedding', 'Resin'] },
  { id: '5', title: 'Corporate Gift Set', image_url: 'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['Corporate'] },
  { id: '6', title: 'Resin Clock', image_url: 'https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['Clocks'] },
  { id: '7', title: 'Scented Candles', image_url: 'https://images.pexels.com/photos/3270223/pexels-photo-3270223.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['Candles'] },
  { id: '8', title: 'Resin Coasters', image_url: 'https://images.pexels.com/photos/6707742/pexels-photo-6707742.jpeg?auto=compress&cs=tinysrgb&w=600', tags: ['Resin'] },
  { id: '9', title: 'Baby Detailing', image_url: 'https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=400', tags: ['Resin'] },
  { id: '10', title: 'Vanilla Wax Melt', image_url: 'https://images.pexels.com/photos/5700184/pexels-photo-5700184.jpeg?auto=compress&cs=tinysrgb&w=400', tags: ['Wax Melts'] },
  { id: '11', title: 'Wedding Candles', image_url: 'https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=400', tags: ['Candles', 'Wedding'] },
  { id: '12', title: 'Resin Jewelry', image_url: 'https://images.pexels.com/photos/1178479/pexels-photo-1178479.jpeg?auto=compress&cs=tinysrgb&w=400', tags: ['Resin'] },
];

export default function GalleryPage() {
  const [items, setItems] = useState<(GalleryItem | typeof FALLBACK_GALLERY[0])[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('gallery_items').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data);
        else setItems(FALLBACK_GALLERY as any);
      });
  }, []);

  const filtered = activeFilter === 'All'
    ? items
    : items.filter(item => item.tags.includes(activeFilter));

  function handleKeyDown(e: KeyboardEvent) {
    if (lightbox === null) return;
    if (e.key === 'ArrowRight') setLightbox(i => Math.min((i || 0) + 1, filtered.length - 1));
    if (e.key === 'ArrowLeft') setLightbox(i => Math.max((i || 0) - 1, 0));
    if (e.key === 'Escape') setLightbox(null);
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, filtered]);

  return (
    <div className="min-h-screen bg-luxury-gradient pt-20">
      {/* Header */}
      <div className="bg-warm-800 py-14 px-6 md:px-10 text-center">
        <p className="font-poppins text-xs text-champagne-400 tracking-[0.3em] uppercase mb-3">Our Work</p>
        <h1 className="font-playfair text-4xl md:text-5xl text-cream-100">Gallery</h1>
        <p className="font-poppins text-sm text-warm-400 mt-3 max-w-md mx-auto">
          A glimpse into our handcrafted world — every piece a labor of love.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {FILTER_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-5 py-2 font-poppins text-xs tracking-[0.15em] uppercase transition-all duration-200 ${
                activeFilter === tag
                  ? 'bg-champagne-500 text-white'
                  : 'border border-cream-300 text-warm-600 hover:border-champagne-400 hover:text-champagne-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <div className="masonry-grid">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              className="masonry-item group relative overflow-hidden cursor-pointer"
              onClick={() => setLightbox(idx)}
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-warm-900/0 group-hover:bg-warm-900/40 transition-all duration-300 flex items-end p-4">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-3 group-hover:translate-y-0 transition-transform">
                  <p className="font-poppins text-sm font-medium text-white">{item.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.tags.map(tag => (
                      <span key={tag} className="font-poppins text-[9px] tracking-wider bg-champagne-500/80 text-white px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center font-poppins text-warm-500 py-20">No items in this category yet.</p>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div className="fixed inset-0 z-50 bg-warm-900/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors" onClick={() => setLightbox(null)}>
            <X size={18} />
          </button>

          <div className="max-w-4xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <img
              src={filtered[lightbox].image_url}
              alt={filtered[lightbox].title}
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />
            <div className="text-center mt-4">
              <p className="font-playfair text-lg text-white">{filtered[lightbox].title}</p>
            </div>
          </div>

          {/* Prev/Next */}
          {lightbox > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >
              ‹
            </button>
          )}
          {lightbox < filtered.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
