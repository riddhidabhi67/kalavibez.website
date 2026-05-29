import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase, Product, Category } from '../lib/supabase';
import ProductCard from '../components/ui/ProductCard';

type Page = 'home' | 'products' | 'gallery' | 'about' | 'contact' | 'product-detail' | 'auth' | 'dashboard' | 'admin' | 'cart';

type ProductsPageProps = {
  onNavigate: (page: Page, params?: Record<string, string>) => void;
  initialCategory?: string;
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'featured', label: 'Featured' },
];

export default function ProductsPage({ onNavigate, initialCategory }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || '');
  const [selectedParent, setSelectedParent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase.from('categories').select('*').order('sort_order');
      if (data) {
        setParentCategories(data.filter(c => !c.parent_id));
        setCategories(data);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(initialCategory || '');
    if (initialCategory) {
      const cat = categories.find(c => c.slug === initialCategory);
      if (cat?.parent_id) {
        const parent = categories.find(c => c.id === cat.parent_id);
        if (parent) {
          setSelectedParent(parent.slug);
          setExpandedParents(new Set([parent.slug]));
        }
      } else if (cat) {
        setSelectedParent(initialCategory);
        setExpandedParents(new Set([initialCategory]));
      }
    }
  }, [initialCategory, categories]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  async function loadProducts() {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('is_active', true);

    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat) {
        const children = categories.filter(c => c.parent_id === cat.id);
        if (children.length > 0) {
          const ids = children.map(c => c.id);
          query = query.in('category_id', ids);
        } else {
          query = query.eq('category_id', cat.id);
        }
      }
    }

    if (sortBy === 'price-asc') query = query.order('price', { ascending: true });
    else if (sortBy === 'price-desc') query = query.order('price', { ascending: false });
    else if (sortBy === 'featured') query = query.eq('is_featured', true).order('created_at', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }

  const filteredProducts = searchQuery
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  function toggleParent(slug: string) {
    setExpandedParents(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  const activeCategoryLabel = selectedCategory
    ? categories.find(c => c.slug === selectedCategory)?.name || 'All Products'
    : 'All Products';

  return (
    <div className="min-h-screen bg-luxury-gradient pt-20">
      {/* Page header */}
      <div className="bg-warm-800 py-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <p className="font-poppins text-xs text-champagne-400 tracking-[0.3em] uppercase mb-2">Kala Vibez</p>
          <h1 className="font-playfair text-3xl md:text-4xl text-cream-100">{activeCategoryLabel}</h1>
          <p className="font-poppins text-sm text-warm-400 mt-2">{filteredProducts.length} pieces</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        <div className="flex gap-10">
          {/* ── Sidebar filters (desktop) ── */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            {/* Search */}
            <div>
              <h3 className="font-poppins text-xs tracking-[0.2em] uppercase text-warm-600 mb-3">Search</h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="input-luxury pl-9 text-xs"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-poppins text-xs tracking-[0.2em] uppercase text-warm-600 mb-3">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 font-poppins text-sm transition-colors ${
                      !selectedCategory ? 'text-champagne-600 bg-champagne-50' : 'text-warm-600 hover:text-champagne-600 hover:bg-cream-100'
                    }`}
                  >
                    All Products
                  </button>
                </li>
                {parentCategories.map(parent => {
                  const children = categories.filter(c => c.parent_id === parent.id);
                  const isExpanded = expandedParents.has(parent.slug);
                  return (
                    <li key={parent.id}>
                      <button
                        onClick={() => {
                          toggleParent(parent.slug);
                          setSelectedCategory(parent.slug);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 font-poppins text-sm transition-colors ${
                          selectedCategory === parent.slug ? 'text-champagne-600 bg-champagne-50' : 'text-warm-600 hover:text-champagne-600 hover:bg-cream-100'
                        }`}
                      >
                        {parent.name}
                        {children.length > 0 && (
                          <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                      {isExpanded && children.length > 0 && (
                        <ul className="pl-4 space-y-0.5 mt-0.5">
                          {children.map(child => (
                            <li key={child.id}>
                              <button
                                onClick={() => setSelectedCategory(child.slug)}
                                className={`w-full flex items-center gap-2 px-3 py-1.5 font-poppins text-xs transition-colors ${
                                  selectedCategory === child.slug ? 'text-champagne-600' : 'text-warm-500 hover:text-champagne-600'
                                }`}
                              >
                                <ChevronRight size={10} />
                                {child.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* ── Products grid ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              {/* Mobile search */}
              <div className="relative flex-1 max-w-xs lg:hidden">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="input-luxury pl-9 text-xs"
                />
              </div>

              {/* Filter toggle mobile */}
              <button
                onClick={() => setShowFilters(p => !p)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-cream-300 text-warm-600 text-sm font-poppins hover:border-champagne-400 transition-colors"
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <span className="font-poppins text-xs text-warm-400 hidden sm:block">{filteredProducts.length} results</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="input-luxury py-2 text-xs w-44"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filter tags */}
            {selectedCategory && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="font-poppins text-xs text-warm-500">Filtered by:</span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-champagne-100 text-champagne-700 text-xs font-poppins">
                  {activeCategoryLabel}
                  <button onClick={() => setSelectedCategory('')}><X size={10} /></button>
                </span>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-cream-200 shimmer-bg" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-playfair text-2xl text-warm-600 mb-3">No products found</p>
                <p className="font-poppins text-sm text-warm-400 mb-6">Try adjusting your filters or search query.</p>
                <button onClick={() => { setSelectedCategory(''); setSearchQuery(''); }} className="btn-outline-gold">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onView={p => onNavigate('product-detail', { id: p.id })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-warm-900/50" onClick={() => setShowFilters(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-cream-50 shadow-luxury-lg p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-playfair text-xl text-warm-800">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-warm-600"><X size={18} /></button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => { setSelectedCategory(''); setShowFilters(false); }}
                className={`w-full text-left px-3 py-2.5 font-poppins text-sm ${!selectedCategory ? 'text-champagne-600 bg-champagne-50' : 'text-warm-600'}`}
              >
                All Products
              </button>
              {parentCategories.map(parent => {
                const children = categories.filter(c => c.parent_id === parent.id);
                return (
                  <div key={parent.id}>
                    <button
                      onClick={() => { setSelectedCategory(parent.slug); setShowFilters(false); }}
                      className={`w-full text-left px-3 py-2.5 font-poppins text-sm font-medium ${
                        selectedCategory === parent.slug ? 'text-champagne-600 bg-champagne-50' : 'text-warm-700'
                      }`}
                    >
                      {parent.name}
                    </button>
                    <ul className="pl-4">
                      {children.map(child => (
                        <li key={child.id}>
                          <button
                            onClick={() => { setSelectedCategory(child.slug); setShowFilters(false); }}
                            className={`w-full text-left px-3 py-2 font-poppins text-xs ${
                              selectedCategory === child.slug ? 'text-champagne-600' : 'text-warm-500'
                            }`}
                          >
                            {child.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
