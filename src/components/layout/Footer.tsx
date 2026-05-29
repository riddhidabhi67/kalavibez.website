import { Instagram, Heart, Mail, Phone, MapPin } from 'lucide-react';

type Page = 'home' | 'products' | 'gallery' | 'about' | 'contact' | 'product-detail' | 'auth' | 'dashboard' | 'admin' | 'cart';

type FooterProps = {
  onNavigate: (page: Page) => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-warm-900 text-cream-200">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <button onClick={() => onNavigate('home')} className="block mb-4">
            <span className="font-playfair text-3xl text-cream-100 leading-none">Kala Vibez</span>
            <span className="block font-poppins text-[9px] tracking-[0.35em] text-champagne-400 uppercase mt-1">Handcrafted Luxury</span>
          </button>
          <p className="font-poppins text-sm text-warm-400 leading-relaxed mb-6">
            Every piece tells a story. Handcrafted resin art and luxury candles, made with love and care for your most treasured moments.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/kala_vibez.art"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center border border-warm-700 text-warm-400 hover:border-champagne-400 hover:text-champagne-400 transition-all duration-200"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://wa.me/+919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center border border-warm-700 text-warm-400 hover:border-champagne-400 hover:text-champagne-400 transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="font-playfair text-lg text-cream-100 mb-5">Quick Links</h4>
          <ul className="space-y-3">
            {[
              { label: 'Shop All', page: 'products' as Page },
              { label: 'Gallery', page: 'gallery' as Page },
              { label: 'About Us', page: 'about' as Page },
              { label: 'Contact', page: 'contact' as Page },
            ].map(link => (
              <li key={link.label}>
                <button
                  onClick={() => onNavigate(link.page)}
                  className="font-poppins text-sm text-warm-400 hover:text-champagne-400 transition-colors animated-underline"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Collections */}
        <div>
          <h4 className="font-playfair text-lg text-cream-100 mb-5">Collections</h4>
          <ul className="space-y-3">
            {['Resin Art', 'Luxury Candles', 'Wax Melts', 'Clocks', 'Wedding Gifts', 'Corporate Gifts'].map(cat => (
              <li key={cat}>
                <button
                  onClick={() => onNavigate('products')}
                  className="font-poppins text-sm text-warm-400 hover:text-champagne-400 transition-colors animated-underline"
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-playfair text-lg text-cream-100 mb-5">Get In Touch</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Phone size={15} className="text-champagne-400 mt-0.5 shrink-0" />
              <a href="tel:+919876543210" className="font-poppins text-sm text-warm-400 hover:text-champagne-400 transition-colors">+91 98765 43210</a>
            </li>
            <li className="flex items-start gap-3">
              <Mail size={15} className="text-champagne-400 mt-0.5 shrink-0" />
              <a href="mailto:kala.vibez.art@gmail.com" className="font-poppins text-sm text-warm-400 hover:text-champagne-400 transition-colors">kala.vibez.art@gmail.com</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={15} className="text-champagne-400 mt-0.5 shrink-0" />
              <span className="font-poppins text-sm text-warm-400">Ships across India</span>
            </li>
          </ul>
          <div className="mt-6 p-4 bg-warm-800 border border-warm-700">
            <p className="font-poppins text-xs text-warm-400">Custom orders delivered in</p>
            <p className="font-playfair text-lg text-champagne-400 mt-0.5">7 — 14 Days</p>
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-champagne-700 to-transparent mx-10" />

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="font-poppins text-xs text-warm-500">
          © {year} Kala Vibez. All rights reserved.
        </p>
        <p className="font-poppins text-xs text-warm-500 flex items-center gap-1">
          Made with <Heart size={11} className="text-champagne-500 fill-champagne-500" /> for handcraft lovers
        </p>
      </div>
    </footer>
  );
}
