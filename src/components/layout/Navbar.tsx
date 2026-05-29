import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, User, Menu, X, Instagram, Search, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

type Page =
  | 'home' | 'products' | 'gallery' | 'about' | 'contact'
  | 'product-detail' | 'auth' | 'dashboard' | 'admin' | 'cart';

type NavbarProps = {
  currentPage: Page;
  onNavigate: (page: Page, params?: Record<string, string>) => void;
  onCartOpen: () => void;
};

const NAV_LINKS = [
  { label: 'Home', page: 'home' as Page },
  { label: 'Shop', page: 'products' as Page },
  { label: 'Gallery', page: 'gallery' as Page },
  { label: 'About', page: 'about' as Page },
  { label: 'Contact', page: 'contact' as Page },
];

export default function Navbar({ currentPage, onNavigate, onCartOpen }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { count } = useCart();
  const { wishlistIds } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const whatsappNumber = '+919876543210';
  const instagramUrl = 'https://instagram.com/kala_vibez.art';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-cream-50/95 backdrop-blur-md shadow-luxury border-b border-cream-200'
            : 'bg-transparent'
        }`}
      >
        {/* Top bar */}
        <div className={`hidden md:flex items-center justify-between px-8 py-1.5 text-xs font-poppins transition-all duration-300 ${scrolled ? 'opacity-0 h-0 overflow-hidden py-0' : 'opacity-100'} bg-warm-800 text-cream-200`}>
          <span className="tracking-widest">FREE SHIPPING ON ORDERS ABOVE ₹999</span>
          <div className="flex items-center gap-6">
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-champagne-300 transition-colors">WhatsApp Us</a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-champagne-300 transition-colors flex items-center gap-1">
              <Instagram size={11} /> @kalavibez
            </a>
          </div>
        </div>

        {/* Main nav */}
        <div className="flex items-center justify-between px-6 md:px-10 py-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex flex-col items-start group"
          >
            <span className="font-playfair text-2xl md:text-3xl text-warm-800 tracking-tight leading-none group-hover:text-champagne-600 transition-colors duration-300">
              Kala Vibez
            </span>
            <span className="font-poppins text-[9px] tracking-[0.35em] text-champagne-500 uppercase mt-0.5">
              Handcrafted Luxury
            </span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <button
                key={link.page}
                onClick={() => onNavigate(link.page)}
                className={`nav-link animated-underline font-medium transition-colors duration-200 ${
                  currentPage === link.page ? 'text-champagne-600' : 'text-warm-700'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Admin Link (visible for admins) */}
            {user && profile?.is_admin && (
              <button
                onClick={() => onNavigate('admin')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-warm-800 text-cream-100 font-poppins text-xs tracking-wide hover:bg-warm-700 transition-colors"
              >
                <Shield size={12} />
                Admin
              </button>
            )}

            {/* Instagram */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex p-2 text-warm-600 hover:text-champagne-600 transition-colors"
              title="Follow on Instagram"
            >
              <Instagram size={18} />
            </a>

            {/* Search */}
            <button
              onClick={() => onNavigate('products')}
              className="p-2 text-warm-600 hover:text-champagne-600 transition-colors"
            >
              <Search size={18} />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => user ? onNavigate('dashboard') : onNavigate('auth')}
              className="relative p-2 text-warm-600 hover:text-champagne-600 transition-colors"
            >
              <Heart size={18} />
              {wishlistIds.size > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-champagne-500 text-white text-[9px] font-poppins flex items-center justify-center rounded-full">
                  {wishlistIds.size}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onCartOpen}
              className="relative p-2 text-warm-600 hover:text-champagne-600 transition-colors"
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-champagne-500 text-white text-[9px] font-poppins flex items-center justify-center rounded-full">
                  {count}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(p => !p)}
                  className="hidden md:flex items-center gap-1.5 p-2 text-warm-600 hover:text-champagne-600 transition-colors"
                >
                  <User size={18} />
                  <ChevronDown size={12} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-cream-200 shadow-luxury-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-cream-100">
                      <p className="font-poppins text-xs text-warm-500">Signed in as</p>
                      <p className="font-poppins text-sm text-warm-800 truncate">{profile?.display_name || user.email}</p>
                    </div>
                    <button onClick={() => { onNavigate('dashboard'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 font-poppins text-sm text-warm-700 hover:bg-cream-50 hover:text-champagne-600 transition-colors">My Orders</button>
                    {profile?.is_admin && (
                      <button onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 font-poppins text-sm text-warm-700 hover:bg-cream-50 hover:text-champagne-600 transition-colors">Admin Dashboard</button>
                    )}
                    <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 font-poppins text-sm text-warm-700 hover:bg-cream-50 hover:text-champagne-600 transition-colors">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="hidden md:flex btn-outline-gold py-2 px-4 text-xs"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(p => !p)}
              className="lg:hidden p-2 text-warm-700"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-warm-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-72 bg-cream-50 shadow-luxury-lg transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200">
            <span className="font-playfair text-xl text-warm-800">Menu</span>
            <button onClick={() => setMobileOpen(false)} className="text-warm-600"><X size={20} /></button>
          </div>
          <nav className="p-6 space-y-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.page}
                onClick={() => { onNavigate(link.page); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-3 font-poppins text-sm transition-colors ${
                  currentPage === link.page
                    ? 'text-champagne-600 bg-champagne-50'
                    : 'text-warm-700 hover:text-champagne-600 hover:bg-cream-100'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t border-cream-200 space-y-2">
              {user ? (
                <>
                  <button onClick={() => { onNavigate('dashboard'); setMobileOpen(false); }} className="w-full text-left px-4 py-3 font-poppins text-sm text-warm-700 hover:text-champagne-600">My Orders</button>
                  {profile?.is_admin && (
                    <button onClick={() => { onNavigate('admin'); setMobileOpen(false); }} className="w-full text-left px-4 py-3 font-poppins text-sm text-warm-700 hover:text-champagne-600">Admin Dashboard</button>
                  )}
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="w-full text-left px-4 py-3 font-poppins text-sm text-warm-700 hover:text-champagne-600">Sign Out</button>
                </>
              ) : (
                <button onClick={() => { onNavigate('auth'); setMobileOpen(false); }} className="btn-gold w-full text-center">Sign In</button>
              )}
            </div>
            <div className="pt-4 flex items-center gap-4 px-4">
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-warm-500 hover:text-champagne-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="font-poppins text-sm text-warm-500 hover:text-champagne-600 transition-colors">
                WhatsApp Us
              </a>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay for user menu */}
      {userMenuOpen && <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />}
    </>
  );
}
