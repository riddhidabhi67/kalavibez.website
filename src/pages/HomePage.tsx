import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Star, Award, Truck, RefreshCw, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { supabase, Product, Testimonial } from '../lib/supabase';
import ProductCard from '../components/ui/ProductCard';

type Page = 'home' | 'products' | 'gallery' | 'about' | 'contact' | 'product-detail' | 'auth' | 'dashboard' | 'admin' | 'cart';

type HomePageProps = {
  onNavigate: (page: Page, params?: Record<string, string>) => void;
};

const HERO_IMAGES = [
  'https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/5700184/pexels-photo-5700184.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=1600',
];

const COLLECTIONS = [
  {
    title: 'Resin Art',
    subtitle: 'Coasters, Trays & More',
    image: 'https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=600',
    slug: 'resin-products',
  },
  {
    title: 'Luxury Candles',
    subtitle: 'Scented & Decorative',
    image: 'https://images.pexels.com/photos/5700184/pexels-photo-5700184.jpeg?auto=compress&cs=tinysrgb&w=600',
    slug: 'candle-products',
  },
  {
    title: 'Wax Melts',
    subtitle: 'Aromatic Collections',
    image: 'https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=600',
    slug: 'wax-melts-diffuser',
  },
  {
    title: 'Artisan Clocks',
    subtitle: 'Resin Timepieces',
    image: 'https://images.pexels.com/photos/1178479/pexels-photo-1178479.jpeg?auto=compress&cs=tinysrgb&w=600',
    slug: 'clocks',
  },
];

const PROCESS_STEPS = [
  { num: '01', title: 'Choose Your Design', desc: 'Browse our catalog or share your vision. Every piece can be customized to your taste.' },
  { num: '02', title: 'Share Details', desc: 'Send us names, dates, photos, or color preferences via WhatsApp or our order form.' },
  { num: '03', title: 'We Craft It', desc: 'Our artisans handcraft your piece with premium resin, pigments, and materials.' },
  { num: '04', title: 'Delivered with Love', desc: 'Your order is carefully packed and delivered to your doorstep in 7–14 days.' },
];

const FAQS = [
  { q: 'Can I customize any product?', a: 'Yes! Most of our products are fully customizable. You can add names, dates, photos, and choose colors. Just mention your requirements during checkout or WhatsApp us.' },
  { q: 'How long does delivery take?', a: 'Custom orders are crafted and delivered within 7–14 business days. Ready-to-ship items are dispatched within 2–3 days.' },
  { q: 'Do you ship pan India?', a: 'Absolutely! We ship across India. Free shipping on orders above ₹999.' },
  { q: 'Are the products food safe?', a: 'Our resin coasters and trays are sealed with food-safe coating. However, we recommend using them for cold beverages only.' },
  { q: 'Can I return or exchange a product?', a: 'Custom-made products cannot be returned. For damaged items, please share a photo within 24 hours of delivery and we will replace them.' },
  { q: 'Do you take bulk or corporate orders?', a: 'Yes! We specialize in corporate gifting and bulk orders. Contact us via WhatsApp for special pricing.' },
];

const STATS = [
  { value: '500+', label: 'Happy Customers' },
  { value: '1000+', label: 'Orders Delivered' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '100%', label: 'Handcrafted' },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const [heroIdx, setHeroIdx] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const heroIntervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    heroIntervalRef.current = setInterval(() => {
      setHeroIdx(i => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(heroIntervalRef.current);
  }, []);

  useEffect(() => {
    supabase.from('products').select('*, categories(name, slug)').eq('is_featured', true).eq('is_active', true).limit(8)
      .then(({ data }) => setFeaturedProducts(data || []));
    supabase.from('testimonials').select('*').eq('is_active', true).order('sort_order').limit(6)
      .then(({ data }) => setTestimonials(data || []));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(prev => new Set([...prev, e.target.id]));
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function prevTestimonial() {
    setTestimonialIdx(i => (i - 1 + testimonials.length) % testimonials.length);
  }

  function nextTestimonial() {
    setTestimonialIdx(i => (i + 1) % testimonials.length);
  }

  return (
    <div className="bg-luxury-gradient min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background images */}
        {HERO_IMAGES.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === heroIdx ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-warm-900/75 via-warm-900/40 to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 w-full pt-24 pb-16">
          <div className="max-w-2xl">
            <p className="font-poppins text-xs text-champagne-300 tracking-[0.35em] uppercase mb-4 animate-fade-in">
              Handcrafted with Love
            </p>
            <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 animate-fade-up">
              Art that tells<br />
              <span className="text-gradient-gold italic">your story</span>
            </h1>
            <p className="font-poppins text-base text-cream-300 leading-relaxed mb-10 max-w-lg animate-fade-up">
              Bespoke resin art, luxury candles, and aromatic wax melts — each piece handcrafted to perfection. Made to order, made for you.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up">
              <button
                onClick={() => onNavigate('products')}
                className="btn-gold text-sm"
              >
                Explore Collection <ArrowRight size={15} />
              </button>
              <a
                href="https://wa.me/+919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-gold border-white/40 text-white hover:bg-white/10 hover:border-white text-sm"
              >
                Custom Order
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14">
              {STATS.map(stat => (
                <div key={stat.label}>
                  <p className="font-playfair text-2xl text-champagne-300">{stat.value}</p>
                  <p className="font-poppins text-xs text-cream-400 tracking-wide mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIdx(idx)}
              className={`h-0.5 transition-all duration-300 ${idx === heroIdx ? 'w-8 bg-champagne-400' : 'w-4 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="bg-warm-800 py-4">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {[
              { icon: <Award size={16} />, text: 'Premium Quality' },
              { icon: <Truck size={16} />, text: 'Pan India Shipping' },
              { icon: <RefreshCw size={16} />, text: 'Made to Order' },
              { icon: <Star size={16} className="fill-champagne-400" />, text: '4.9 Star Rated' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 text-cream-300">
                <span className="text-champagne-400">{item.icon}</span>
                <span className="font-poppins text-xs tracking-wider">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COLLECTIONS ─── */}
      <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-12" id="collections" data-animate>
          <p className="section-subtitle mb-3">Curated For You</p>
          <h2 className="section-title">Our Collections</h2>
          <div className="gold-divider mt-4" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {COLLECTIONS.map((col, idx) => (
            <button
              key={col.slug}
              onClick={() => onNavigate('products', { category: col.slug })}
              className="group relative overflow-hidden aspect-[3/4] block text-left"
            >
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-warm-900/80 via-warm-900/20 to-transparent group-hover:from-warm-900/90 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-playfair text-xl text-white">{col.title}</h3>
                <p className="font-poppins text-xs text-cream-300 mt-1">{col.subtitle}</p>
                <div className="flex items-center gap-1 mt-3 text-champagne-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="font-poppins text-xs tracking-wider">Shop Now</span>
                  <ArrowRight size={12} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      {featuredProducts.length > 0 && (
        <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="section-subtitle mb-3">Handpicked</p>
              <h2 className="section-title">Featured Pieces</h2>
              <div className="gold-divider mt-4 mx-0" />
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="hidden md:flex items-center gap-2 font-poppins text-sm text-champagne-600 hover:text-champagne-700 transition-colors animated-underline"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onView={p => onNavigate('product-detail', { id: p.id })}
              />
            ))}
          </div>

          <div className="text-center mt-10 md:hidden">
            <button onClick={() => onNavigate('products')} className="btn-outline-gold">
              View All Products <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}

      {/* ─── ABOUT KALA VIBEZ ─── */}
      <section className="py-24 bg-warm-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Resin art"
                className="aspect-[3/4] object-cover w-full"
              />
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.pexels.com/photos/5700184/pexels-photo-5700184.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Candles"
                  className="aspect-square object-cover w-full"
                />
                <img
                  src="https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Wax melts"
                  className="aspect-square object-cover w-full"
                />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-champagne-500 text-white p-6 shadow-luxury">
              <p className="font-playfair text-3xl">500+</p>
              <p className="font-poppins text-xs tracking-wider mt-1">Happy Customers</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="font-poppins text-xs text-champagne-400 tracking-[0.3em] uppercase mb-4">Our Story</p>
            <h2 className="font-playfair text-4xl md:text-5xl text-cream-100 leading-tight mb-6">
              Crafted with passion,<br />
              <span className="italic text-champagne-300">made for memories</span>
            </h2>
            <p className="font-poppins text-sm text-warm-300 leading-relaxed mb-5">
              Kala Vibez was born from a deep love for handcrafted art and a belief that every home deserves something truly unique. Founded by passionate artisans, we specialize in bespoke resin art, luxury candles, and aromatic wax melts.
            </p>
            <p className="font-poppins text-sm text-warm-300 leading-relaxed mb-8">
              Each piece is handcrafted in small batches using premium materials — vibrant resin pigments, pure soy wax, and carefully curated fragrances. Whether it's a wedding gift or a corporate keepsake, we pour our heart into every creation.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { val: '1000+', label: 'Pieces Crafted' },
                { val: '50+', label: 'Design Options' },
                { val: '7–14', label: 'Days Delivery' },
                { val: '100%', label: 'Handmade' },
              ].map(s => (
                <div key={s.label} className="border border-warm-700 p-4">
                  <p className="font-playfair text-2xl text-champagne-400">{s.val}</p>
                  <p className="font-poppins text-xs text-warm-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => onNavigate('about')} className="btn-gold">
              Learn More <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── CUSTOM ORDER PROCESS ─── */}
      <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-subtitle mb-3">Simple & Seamless</p>
          <h2 className="section-title">How Custom Orders Work</h2>
          <div className="gold-divider mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {PROCESS_STEPS.map((step, idx) => (
            <div key={idx} className="relative group">
              {idx < PROCESS_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-champagne-300 to-transparent z-0" />
              )}
              <div className="relative z-10 text-center p-6 glass-card-hover">
                <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-champagne-100 to-cream-200 flex items-center justify-center border border-champagne-200 group-hover:border-champagne-400 transition-colors">
                  <span className="font-playfair text-2xl text-champagne-600">{step.num}</span>
                </div>
                <h3 className="font-playfair text-lg text-warm-800 mb-3">{step.title}</h3>
                <p className="font-poppins text-xs text-warm-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://wa.me/+919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold"
          >
            Start Your Custom Order <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-cream-100">
          <div className="max-w-7xl mx-auto px-6 md:px-10">
            <div className="text-center mb-12">
              <p className="section-subtitle mb-3">Customer Love</p>
              <h2 className="section-title">What They Say</h2>
              <div className="gold-divider mt-4" />
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500"
                  style={{ transform: `translateX(-${testimonialIdx * 100}%)` }}
                >
                  {testimonials.map(t => (
                    <div key={t.id} className="w-full shrink-0 px-4">
                      <div className="bg-white p-8 md:p-12 shadow-luxury text-center">
                        <div className="flex justify-center gap-1 mb-6">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star key={i} size={16} className="fill-champagne-400 text-champagne-400" />
                          ))}
                        </div>
                        <blockquote className="font-playfair text-lg md:text-xl text-warm-700 leading-relaxed italic mb-6">
                          "{t.review}"
                        </blockquote>
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-champagne-100 flex items-center justify-center overflow-hidden">
                            {t.customer_image ? (
                              <img src={t.customer_image} alt={t.customer_name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-playfair text-lg text-champagne-600">
                                {t.customer_name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-poppins text-sm font-medium text-warm-800">{t.customer_name}</p>
                            {t.product_name && (
                              <p className="font-poppins text-xs text-warm-400">{t.product_name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nav buttons */}
              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={prevTestimonial}
                    className="absolute -left-4 md:-left-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-cream-200 flex items-center justify-center text-warm-600 hover:border-champagne-400 hover:text-champagne-600 transition-all shadow-card"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextTestimonial}
                    className="absolute -right-4 md:-right-8 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-cream-200 flex items-center justify-center text-warm-600 hover:border-champagne-400 hover:text-champagne-600 transition-all shadow-card"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              {/* Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTestimonialIdx(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${idx === testimonialIdx ? 'w-8 bg-champagne-500' : 'w-4 bg-champagne-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── GALLERY PREVIEW ─── */}
      <section className="py-20 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-subtitle mb-3">Our Work</p>
            <h2 className="section-title">Gallery</h2>
            <div className="gold-divider mt-4 mx-0" />
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="hidden md:flex items-center gap-2 font-poppins text-sm text-champagne-600 hover:text-champagne-700 transition-colors animated-underline"
          >
            View Full Gallery <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            'https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/5700184/pexels-photo-5700184.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1178479/pexels-photo-1178479.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/7679730/pexels-photo-7679730.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/3270223/pexels-photo-3270223.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/6707742/pexels-photo-6707742.jpeg?auto=compress&cs=tinysrgb&w=400',
          ].map((img, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden cursor-pointer ${idx === 0 || idx === 4 ? 'row-span-1 md:row-span-2' : ''}`}
              onClick={() => onNavigate('gallery')}
            >
              <img
                src={img}
                alt={`Gallery ${idx + 1}`}
                className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-warm-900/0 group-hover:bg-warm-900/30 transition-all duration-300 flex items-center justify-center">
                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} />
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 md:hidden">
          <button onClick={() => onNavigate('gallery')} className="btn-outline-gold">
            View Full Gallery <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-3xl mx-auto px-6 md:px-10">
          <div className="text-center mb-12">
            <p className="section-subtitle mb-3">Got Questions?</p>
            <h2 className="section-title">Frequently Asked</h2>
            <div className="gold-divider mt-4" />
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="bg-white border border-cream-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left group"
                >
                  <span className="font-poppins text-sm font-medium text-warm-800 group-hover:text-champagne-700 transition-colors pr-4">
                    {faq.q}
                  </span>
                  <span className={`shrink-0 w-5 h-5 border border-champagne-300 flex items-center justify-center text-champagne-500 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}>
                    {openFaq === idx ? <Minus size={12} /> : <Plus size={12} />}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-48' : 'max-h-0'}`}
                >
                  <p className="px-6 pb-5 font-poppins text-sm text-warm-500 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="font-poppins text-sm text-warm-500 mb-4">Still have questions?</p>
            <a
              href="https://wa.me/+919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
            >
              Chat With Us
            </a>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="relative py-24 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="CTA"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-warm-900/75" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <p className="font-poppins text-xs text-champagne-300 tracking-[0.35em] uppercase mb-4">
            Limited Custom Slots Available
          </p>
          <h2 className="font-playfair text-4xl md:text-5xl text-white mb-6 leading-tight">
            Create Something<br />
            <span className="italic text-champagne-300">Uniquely Yours</span>
          </h2>
          <p className="font-poppins text-sm text-cream-300 mb-10 leading-relaxed">
            Every piece is crafted with intention. From wedding gifts to corporate keepsakes, we transform your vision into art.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => onNavigate('products')} className="btn-gold">
              Shop Collection <ArrowRight size={14} />
            </button>
            <a
              href="https://wa.me/+919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-gold border-white/40 text-white hover:bg-white/10 hover:border-white"
            >
              Custom Order
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function Eye({ className, size }: { className?: string; size?: number }) {
  return (
    <svg width={size || 20} height={size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
