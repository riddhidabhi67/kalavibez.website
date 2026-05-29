import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/layout/WhatsAppButton';
import CartDrawer from './components/layout/CartDrawer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/AdminDashboard';
import CartPage from './pages/CartPage';

type Page =
  | 'home' | 'products' | 'gallery' | 'about' | 'contact'
  | 'product-detail' | 'auth' | 'dashboard' | 'admin' | 'cart';

const NO_FOOTER_PAGES: Page[] = ['auth'];

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [cartOpen, setCartOpen] = useState(false);

  function navigate(page: Page, params: Record<string, string> = {}) {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const showFooter = !NO_FOOTER_PAGES.includes(currentPage);

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar
              currentPage={currentPage}
              onNavigate={navigate}
              onCartOpen={() => setCartOpen(true)}
            />

            <main className="flex-1">
              {currentPage === 'home' && (
                <HomePage onNavigate={navigate} />
              )}
              {currentPage === 'products' && (
                <ProductsPage onNavigate={navigate} initialCategory={pageParams.category} />
              )}
              {currentPage === 'product-detail' && (
                <ProductDetailPage productId={pageParams.id || ''} onNavigate={navigate} />
              )}
              {currentPage === 'gallery' && (
                <GalleryPage />
              )}
              {currentPage === 'about' && (
                <AboutPage onNavigate={navigate} />
              )}
              {currentPage === 'contact' && (
                <ContactPage />
              )}
              {currentPage === 'auth' && (
                <AuthPage onNavigate={(page) => navigate(page as Page)} />
              )}
              {currentPage === 'dashboard' && (
                <DashboardPage onNavigate={navigate} />
              )}
              {currentPage === 'admin' && (
                <AdminDashboard onNavigate={navigate} />
              )}
              {currentPage === 'cart' && (
                <CartPage onNavigate={navigate} />
              )}
            </main>

            {showFooter && <Footer onNavigate={navigate} />}

            <CartDrawer
              open={cartOpen}
              onClose={() => setCartOpen(false)}
              onNavigate={(page) => { navigate(page as Page); setCartOpen(false); }}
            />

            <WhatsAppButton />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
