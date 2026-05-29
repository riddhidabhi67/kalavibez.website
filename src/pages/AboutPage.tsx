import { ArrowRight } from 'lucide-react';

type Page = 'home' | 'products' | 'gallery' | 'about' | 'contact' | 'product-detail' | 'auth' | 'dashboard' | 'admin' | 'cart';

type AboutPageProps = {
  onNavigate: (page: Page) => void;
};

const VALUES = [
  { title: 'Handcrafted with Heart', desc: 'Every piece is made by hand, not by machine. We believe the soul of an artisan lives in their work.' },
  { title: 'Premium Materials Only', desc: 'We use food-grade epoxy resin, non-toxic pigments, 100% natural soy wax, and premium fragrance oils.' },
  { title: 'Custom & Unique', desc: 'No two pieces are identical. Subtle variations are what make handcrafted art truly special.' },
  { title: 'Made with Purpose', desc: 'From wedding gifts to corporate keepsakes — we craft pieces that hold meaning for years to come.' },
];

const TEAM = [
  {
    name: 'The Artisan',
    role: 'Founder & Lead Artist',
    image: 'https://images.pexels.com/photos/3760137/pexels-photo-3760137.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'A passionate creator with a deep love for resin art and candle making. Every piece is a reflection of dedication and artistic vision.',
  },
];

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-luxury-gradient pt-20">
      {/* Header */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="About Kala Vibez"
          className="w-full h-80 object-cover"
        />
        <div className="absolute inset-0 bg-warm-900/70 flex items-center justify-center">
          <div className="text-center">
            <p className="font-poppins text-xs text-champagne-400 tracking-[0.3em] uppercase mb-3">Our Story</p>
            <h1 className="font-playfair text-5xl text-cream-100">About Kala Vibez</h1>
          </div>
        </div>
      </div>

      {/* Story section */}
      <section className="max-w-5xl mx-auto px-6 md:px-10 py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="font-poppins text-xs text-champagne-600 tracking-[0.25em] uppercase mb-4">Who We Are</p>
            <h2 className="font-playfair text-4xl text-warm-800 mb-6 leading-tight">
              Born from a passion for art and a love for beautiful things
            </h2>
            <p className="font-poppins text-sm text-warm-500 leading-relaxed mb-5">
              Kala Vibez was founded with a simple belief: every space deserves something truly beautiful, and every occasion deserves a gift that tells a story. We started in a small studio, experimenting with resin, pigments, and wax — and fell in love with the process.
            </p>
            <p className="font-poppins text-sm text-warm-500 leading-relaxed mb-5">
              Today, we craft premium resin art pieces, luxury candles, and aromatic wax melts — all made to order, all made by hand. Our pieces travel across India, bringing joy, warmth, and artistry into homes and hearts.
            </p>
            <p className="font-poppins text-sm text-warm-500 leading-relaxed">
              Whether you're looking for a wedding keepsake, a personalized corporate gift, or just something beautiful to elevate your space — Kala Vibez is here to craft it for you, with love and precision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.pexels.com/photos/6707628/pexels-photo-6707628.jpeg?auto=compress&cs=tinysrgb&w=500"
              alt=""
              className="aspect-[3/4] object-cover w-full"
            />
            <div className="space-y-4 pt-10">
              <img
                src="https://images.pexels.com/photos/5700184/pexels-photo-5700184.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt=""
                className="aspect-square object-cover w-full"
              />
              <img
                src="https://images.pexels.com/photos/4202325/pexels-photo-4202325.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt=""
                className="aspect-square object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-warm-800 py-20 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-poppins text-xs text-champagne-400 tracking-[0.3em] uppercase mb-3">What We Stand For</p>
            <h2 className="font-playfair text-4xl text-cream-100">Our Values</h2>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-champagne-400 to-transparent mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, idx) => (
              <div key={idx} className="border border-warm-700 p-6 hover:border-champagne-500 transition-all duration-300 group">
                <div className="w-10 h-10 bg-champagne-500/10 flex items-center justify-center mb-5 group-hover:bg-champagne-500/20 transition-colors">
                  <span className="font-playfair text-lg text-champagne-400">0{idx + 1}</span>
                </div>
                <h3 className="font-playfair text-lg text-cream-100 mb-3">{v.title}</h3>
                <p className="font-poppins text-xs text-warm-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 md:px-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: '500+', label: 'Happy Customers' },
            { num: '1000+', label: 'Pieces Crafted' },
            { num: '4.9★', label: 'Average Rating' },
            { num: '2+', label: 'Years of Craft' },
          ].map(s => (
            <div key={s.label} className="text-center p-6 bg-white shadow-card">
              <p className="font-playfair text-4xl text-champagne-600">{s.num}</p>
              <p className="font-poppins text-xs text-warm-500 mt-2 tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6 md:px-10 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="section-subtitle mb-3">The Creator</p>
          <h2 className="section-title">Meet the Artisan</h2>
          <div className="gold-divider mt-4" />
        </div>
        <div className="flex justify-center">
          {TEAM.map(member => (
            <div key={member.name} className="text-center max-w-xs">
              <div className="aspect-square w-40 mx-auto overflow-hidden mb-4">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-playfair text-xl text-warm-800">{member.name}</h3>
              <p className="font-poppins text-xs text-champagne-600 tracking-[0.15em] uppercase mt-1">{member.role}</p>
              <p className="font-poppins text-sm text-warm-500 leading-relaxed mt-3">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-champagne-50 border-y border-champagne-200">
        <div className="text-center max-w-xl mx-auto px-6">
          <h2 className="font-playfair text-3xl text-warm-800 mb-4">Ready to order something special?</h2>
          <p className="font-poppins text-sm text-warm-500 mb-8">Browse our collection or reach out for a custom creation.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => onNavigate('products')} className="btn-gold">Shop Now <ArrowRight size={14} /></button>
            <button onClick={() => onNavigate('contact')} className="btn-outline-gold">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  );
}
