import { useState, useEffect, useRef } from 'react';
import { Package, Image, MessageSquare, Settings, BarChart2, Plus, Trash2, Edit2, X, Upload, Check, ArrowLeft, Star, Loader2 } from 'lucide-react';
import { supabase, Product, GalleryItem, Testimonial, Category, ProductReview } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Page = 'home' | 'products' | 'gallery' | 'about' | 'contact' | 'product-detail' | 'auth' | 'dashboard' | 'admin' | 'cart';

type AdminDashboardProps = {
  onNavigate: (page: Page) => void;
};

type AdminTab = 'overview' | 'products' | 'gallery' | 'testimonials' | 'reviews' | 'settings';

const EMPTY_PRODUCT: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categories'> = {
  name: '', slug: '', description: '', price: 0, original_price: null,
  category_id: null, images: [], tags: [], is_customizable: false,
  customization_fields: [], delivery_days_min: 7, delivery_days_max: 14,
  stock: 0, is_featured: false, is_active: true,
};

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { profile } = useAuth();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [productForm, setProductForm] = useState<typeof EMPTY_PRODUCT>({ ...EMPTY_PRODUCT });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [editTestimonial, setEditTestimonial] = useState<Partial<Testimonial> | null>(null);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);

  // Redirect if not admin
  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-luxury-gradient pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="font-playfair text-2xl text-warm-600 mb-4">Access Denied</p>
          <p className="font-poppins text-sm text-warm-400 mb-6">You don't have admin permissions.</p>
          <button onClick={() => onNavigate('home')} className="btn-gold">Go Home</button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, [tab]);

  async function loadData() {
    setLoading(true);
    if (tab === 'overview' || tab === 'products') {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order'),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
    }
    if (tab === 'gallery') {
      const { data } = await supabase.from('gallery_items').select('*').order('sort_order');
      setGalleryItems(data || []);
    }
    if (tab === 'testimonials') {
      setTestimonialsLoading(true);
      const { data } = await supabase.from('testimonials').select('*').order('sort_order');
      setTestimonials(data || []);
      setTestimonialsLoading(false);
    }
    if (tab === 'reviews') {
      const { data } = await supabase.from('product_reviews').select('*, products(name)').order('created_at', { ascending: false });
      setReviews(data || []);
    }
    if (tab === 'settings') {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) setSiteSettings(Object.fromEntries(data.map(s => [s.key, s.value])));
    }
    setLoading(false);
  }

  async function saveProduct() {
    const isEdit = editProduct?.id;
    const slug = productForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const data = { ...productForm, slug: isEdit ? productForm.slug : slug, updated_at: new Date().toISOString() };

    if (isEdit) {
      await supabase.from('products').update(data).eq('id', editProduct!.id);
    } else {
      await supabase.from('products').insert(data);
    }
    setEditProduct(null);
    setProductForm({ ...EMPTY_PRODUCT });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    await loadData();
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  async function toggleProductActive(product: Product) {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p));
  }

  async function saveSetting(key: string, value: string) {
    await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setSiteSettings(prev => ({ ...prev, [key]: value }));
  }

  async function deleteTestimonial(id: string) {
    await supabase.from('testimonials').delete().eq('id', id);
    setTestimonials(prev => prev.filter(t => t.id !== id));
  }

  async function saveTestimonial() {
    if (!editTestimonial) return;
    const isNew = !editTestimonial.id;
    if (isNew) {
      await supabase.from('testimonials').insert({
        customer_name: editTestimonial.customer_name || '',
        rating: editTestimonial.rating || 5,
        review: editTestimonial.review || '',
        product_name: editTestimonial.product_name || '',
        is_active: true,
      });
    } else {
      await supabase.from('testimonials').update({
        customer_name: editTestimonial.customer_name,
        rating: editTestimonial.rating,
        review: editTestimonial.review,
        product_name: editTestimonial.product_name,
      }).eq('id', editTestimonial.id);
    }
    setEditTestimonial(null);
    await loadData();
  }

  async function uploadImage(file: File): Promise<string | null> {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) newUrls.push(url);
    }

    if (newUrls.length > 0) {
      setProductForm(p => ({ ...p, images: [...p.images, ...newUrls] }));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
    { key: 'products', label: 'Products', icon: <Package size={16} /> },
    { key: 'gallery', label: 'Gallery', icon: <Image size={16} /> },
    { key: 'testimonials', label: 'Testimonials', icon: <MessageSquare size={16} /> },
    { key: 'reviews', label: 'Reviews', icon: <Star size={16} /> },
    { key: 'settings', label: 'Site Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => onNavigate('home')} className="flex items-center gap-1.5 font-poppins text-xs text-warm-400 hover:text-champagne-600 mb-2"><ArrowLeft size={12} /> Back to Site</button>
            <h1 className="font-playfair text-3xl text-warm-800">Admin Dashboard</h1>
          </div>
          {saved && (
            <span className="flex items-center gap-2 font-poppins text-xs text-green-600 bg-green-50 px-3 py-2 border border-green-200">
              <Check size={13} /> Saved successfully
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto scrollbar-hide gap-1 mb-8 border-b border-cream-200">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 font-poppins text-sm whitespace-nowrap transition-all ${
                tab === t.key
                  ? 'border-b-2 border-champagne-500 text-champagne-600'
                  : 'text-warm-500 hover:text-warm-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Products', value: products.length, color: 'champagne' },
                { label: 'Active Products', value: products.filter(p => p.is_active).length, color: 'green' },
                { label: 'Featured', value: products.filter(p => p.is_featured).length, color: 'amber' },
                { label: 'Categories', value: categories.length, color: 'blue' },
              ].map(stat => (
                <div key={stat.label} className="bg-white p-5 shadow-card">
                  <p className="font-poppins text-xs text-warm-400 mb-1">{stat.label}</p>
                  <p className="font-playfair text-3xl text-warm-800">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 shadow-card">
              <h3 className="font-playfair text-lg text-warm-800 mb-4">Recent Products</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-200">
                    {['Product', 'Category', 'Price', 'Status'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 font-poppins text-xs text-warm-400 tracking-wider uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 8).map(p => (
                    <tr key={p.id} className="border-b border-cream-100 hover:bg-cream-50">
                      <td className="py-3 pr-4 font-poppins text-sm text-warm-800 max-w-xs truncate">{p.name}</td>
                      <td className="py-3 pr-4 font-poppins text-xs text-warm-500">{(p as any).categories?.name || '–'}</td>
                      <td className="py-3 pr-4 font-poppins text-sm text-warm-700">₹{p.price.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`font-poppins text-xs px-2 py-0.5 ${p.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                          {p.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-playfair text-xl text-warm-800">Products</h2>
              <button
                onClick={() => { setEditProduct({}); setProductForm({ ...EMPTY_PRODUCT }); }}
                className="btn-gold text-xs py-2"
              >
                <Plus size={13} /> Add Product
              </button>
            </div>

            {/* Product form */}
            {editProduct !== null && (
              <div className="bg-white p-6 shadow-card mb-6 border border-champagne-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair text-lg text-warm-800">{editProduct.id ? 'Edit Product' : 'New Product'}</h3>
                  <button onClick={() => setEditProduct(null)}><X size={16} className="text-warm-400" /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Product Name', type: 'text', span: 2, placeholder: 'e.g., Vanilla Bean Wax Melt Set' },
                    { key: 'price', label: 'Price (₹)', type: 'number', placeholder: 'e.g., 599' },
                    { key: 'original_price', label: 'Original Price (₹) - for discount', type: 'number', placeholder: 'Optional' },
                    { key: 'stock', label: 'Stock Quantity', type: 'number', placeholder: 'e.g., 50' },
                    { key: 'delivery_days_min', label: 'Min Making Time (Days)', type: 'number', placeholder: 'e.g., 7' },
                    { key: 'delivery_days_max', label: 'Max Making Time (Days)', type: 'number', placeholder: 'e.g., 14' },
                  ].map(field => (
                    <div key={field.key} className={field.span === 2 ? 'col-span-2' : ''}>
                      <label className="font-poppins text-xs text-warm-600 mb-1 block">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={(productForm as any)[field.key] || ''}
                        onChange={e => setProductForm(p => ({ ...p, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                        className="input-luxury text-sm"
                      />
                    </div>
                  ))}

                  <div className="col-span-2 p-3 bg-champagne-50 border border-champagne-200">
                    <p className="font-poppins text-xs text-champagne-700">
                      <strong>Making Time:</strong> This is how long it takes to handcraft the product after order placement. Displayed to customers as "Delivery in 7–14 Days".
                    </p>
                  </div>

                  <div className="col-span-2">
                    <label className="font-poppins text-xs text-warm-600 mb-1 block">Category</label>
                    <select
                      value={productForm.category_id || ''}
                      onChange={e => setProductForm(p => ({ ...p, category_id: e.target.value || null }))}
                      className="input-luxury text-sm"
                    >
                      <option value="">Select category</option>
                      {categories.filter(c => c.parent_id).map(cat => {
                        const parent = categories.find(p => p.id === cat.parent_id);
                        return (
                          <option key={cat.id} value={cat.id}>
                            {parent ? `${parent.name} → ${cat.name}` : cat.name}
                          </option>
                        );
                      })}
                    </select>
                    <p className="font-poppins text-[10px] text-warm-400 mt-1">Choose a subcategory like Wax Melts → Vanilla</p>
                  </div>

                  <div className="col-span-2">
                    <label className="font-poppins text-xs text-warm-600 mb-1 block">Product Description</label>
                    <textarea
                      rows={4}
                      placeholder="Describe the product features, materials used, fragrance notes, etc..."
                      value={productForm.description}
                      onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                      className="input-luxury text-sm resize-none"
                    />
                    <p className="font-poppins text-[10px] text-warm-400 mt-1">This will appear on the product page under the Description tab</p>
                  </div>

                  <div className="col-span-2">
                    <label className="font-poppins text-xs text-warm-600 mb-1 block">Product Images (2-3 recommended)</label>

                    {/* Upload button */}
                    <div className="mb-3">
                      <label className={`flex items-center gap-2 px-4 py-2.5 border-2 border-dashed cursor-pointer transition-all ${uploading ? 'border-warm-300 bg-cream-50' : 'border-champagne-300 hover:border-champagne-400 hover:bg-champagne-50'}`}>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="sr-only"
                        />
                        {uploading ? (
                          <>
                            <Loader2 size={16} className="text-warm-500 animate-spin" />
                            <span className="font-poppins text-sm text-warm-500">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={16} className="text-champagne-600" />
                            <span className="font-poppins text-sm text-champagne-600">Click to upload images</span>
                          </>
                        )}
                      </label>
                      <p className="font-poppins text-[10px] text-warm-400 mt-1">Supported: JPG, PNG, WebP, GIF (max 5MB each). Select multiple files at once.</p>
                    </div>

                    {/* Or paste URLs */}
                    <div className="relative mb-3">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cream-200" /></div>
                      <div className="relative flex justify-center"><span className="bg-white px-3 font-poppins text-xs text-warm-400">or paste image URLs</span></div>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                      value={productForm.images.join('\n')}
                      onChange={e => setProductForm(p => ({
                        ...p,
                        images: e.target.value.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
                      }))}
                      className="input-luxury text-sm resize-none"
                    />

                    {/* Image previews */}
                    {productForm.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {productForm.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img src={img} alt={`Preview ${idx + 1}`} className="w-20 h-20 object-cover border border-cream-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <button
                              onClick={() => setProductForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.is_featured}
                        onChange={e => setProductForm(p => ({ ...p, is_featured: e.target.checked }))}
                        className="accent-champagne-500"
                      />
                      <span className="font-poppins text-sm text-warm-700">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.is_customizable}
                        onChange={e => setProductForm(p => ({ ...p, is_customizable: e.target.checked }))}
                        className="accent-champagne-500"
                      />
                      <span className="font-poppins text-sm text-warm-700">Customizable</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.is_active}
                        onChange={e => setProductForm(p => ({ ...p, is_active: e.target.checked }))}
                        className="accent-champagne-500"
                      />
                      <span className="font-poppins text-sm text-warm-700">Active</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={saveProduct} className="btn-gold text-xs py-2">Save Product</button>
                  <button onClick={() => setEditProduct(null)} className="btn-outline-gold text-xs py-2">Cancel</button>
                </div>
              </div>
            )}

            {/* Products list */}
            <div className="bg-white shadow-card overflow-hidden">
              <table className="w-full">
                <thead className="bg-cream-50 border-b border-cream-200">
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-poppins text-xs text-warm-400 tracking-wider uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-cream-100 hover:bg-cream-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.images[0] && <img src={p.images[0]} alt="" className="w-8 h-8 object-cover" />}
                          <span className="font-poppins text-sm text-warm-800 max-w-[180px] truncate">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-poppins text-xs text-warm-500">{(p as any).categories?.name || '–'}</td>
                      <td className="py-3 px-4 font-poppins text-sm text-warm-700">₹{p.price.toLocaleString()}</td>
                      <td className="py-3 px-4 font-poppins text-sm text-warm-700">{p.stock}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleProductActive(p)}
                          className={`font-poppins text-xs px-2.5 py-1 ${p.is_active ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-red-50 text-red-600 hover:bg-green-50 hover:text-green-700'} transition-colors`}
                        >
                          {p.is_active ? 'Active' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditProduct(p); setProductForm({ name: p.name, slug: p.slug, description: p.description, price: p.price, original_price: p.original_price, category_id: p.category_id, images: p.images, tags: p.tags, is_customizable: p.is_customizable, customization_fields: p.customization_fields, delivery_days_min: p.delivery_days_min, delivery_days_max: p.delivery_days_max, stock: p.stock, is_featured: p.is_featured, is_active: p.is_active }); }}
                            className="text-warm-400 hover:text-champagne-600 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="text-warm-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center font-poppins text-sm text-warm-400">No products yet. Add your first product.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gallery */}
        {tab === 'gallery' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-playfair text-xl text-warm-800">Gallery Images</h2>
              <p className="font-poppins text-xs text-warm-400">Add image URLs to display in the gallery</p>
            </div>
            <div className="bg-white p-6 shadow-card mb-5">
              <h3 className="font-poppins text-sm font-medium text-warm-700 mb-4">Add Gallery Image</h3>
              <GalleryAddForm onSave={async (item) => {
                await supabase.from('gallery_items').insert(item);
                await loadData();
              }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryItems.map(item => (
                <div key={item.id} className="relative group">
                  <img src={item.image_url} alt={item.title} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-0 bg-warm-900/0 group-hover:bg-warm-900/50 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={async () => {
                        await supabase.from('gallery_items').delete().eq('id', item.id);
                        setGalleryItems(prev => prev.filter(g => g.id !== item.id));
                      }}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-red-500 text-white flex items-center justify-center"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="font-poppins text-xs text-warm-600 mt-1 truncate">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {tab === 'testimonials' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-playfair text-xl text-warm-800">Testimonials</h2>
              <button onClick={() => setEditTestimonial({ rating: 5, is_active: true })} className="btn-gold text-xs py-2">
                <Plus size={13} /> Add Testimonial
              </button>
            </div>

            {editTestimonial && (
              <div className="bg-white p-6 shadow-card mb-5 border border-champagne-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair text-lg text-warm-800">{editTestimonial.id ? 'Edit' : 'New'} Testimonial</h3>
                  <button onClick={() => setEditTestimonial(null)}><X size={16} className="text-warm-400" /></button>
                </div>
                <div className="grid gap-4 max-w-lg">
                  {[
                    { key: 'customer_name', label: 'Customer Name' },
                    { key: 'product_name', label: 'Product Name' },
                    { key: 'review', label: 'Review', textarea: true },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="font-poppins text-xs text-warm-600 mb-1 block">{f.label}</label>
                      {f.textarea ? (
                        <textarea
                          rows={3}
                          value={(editTestimonial as any)[f.key] || ''}
                          onChange={e => setEditTestimonial(p => ({ ...p, [f.key]: e.target.value }))}
                          className="input-luxury text-sm resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={(editTestimonial as any)[f.key] || ''}
                          onChange={e => setEditTestimonial(p => ({ ...p, [f.key]: e.target.value }))}
                          className="input-luxury text-sm"
                        />
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="font-poppins text-xs text-warm-600 mb-1 block">Rating (1–5)</label>
                    <input type="number" min={1} max={5} value={editTestimonial.rating || 5}
                      onChange={e => setEditTestimonial(p => ({ ...p, rating: Number(e.target.value) }))}
                      className="input-luxury text-sm w-20"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={saveTestimonial} className="btn-gold text-xs py-2">Save</button>
                  <button onClick={() => setEditTestimonial(null)} className="btn-outline-gold text-xs py-2">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {testimonials.map(t => (
                <div key={t.id} className="bg-white p-5 shadow-card flex items-start justify-between">
                  <div>
                    <p className="font-poppins text-sm font-medium text-warm-800">{t.customer_name}</p>
                    <p className="font-poppins text-xs text-warm-400">{t.product_name}</p>
                    <p className="font-poppins text-sm text-warm-600 mt-2 italic">"{t.review}"</p>
                    <p className="font-poppins text-xs text-champagne-500 mt-1">{'★'.repeat(t.rating)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditTestimonial(t)} className="text-warm-400 hover:text-champagne-600"><Edit2 size={14} /></button>
                    <button onClick={() => deleteTestimonial(t.id)} className="text-warm-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {tab === 'reviews' && (
          <div>
            <h2 className="font-playfair text-xl text-warm-800 mb-5">Customer Reviews</h2>
            <p className="font-poppins text-xs text-warm-400 mb-6">Manage product reviews submitted by customers. Hide or delete inappropriate reviews.</p>

            {reviews.length === 0 ? (
              <div className="bg-white p-12 text-center shadow-card">
                <Star size={40} className="text-cream-300 mx-auto mb-4" />
                <p className="font-poppins text-sm text-warm-500">No reviews yet. Reviews will appear here once customers share their experience.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white p-5 shadow-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star
                                key={s}
                                size={12}
                                className={s <= r.rating ? 'fill-champagne-400 text-champagne-400' : 'text-cream-300'}
                              />
                            ))}
                          </div>
                          <span className="font-poppins text-xs text-warm-400">
                            {r.rating === 1 && 'Poor'}
                            {r.rating === 2 && 'Fair'}
                            {r.rating === 3 && 'Good'}
                            {r.rating === 4 && 'Very Good'}
                            {r.rating === 5 && 'Excellent'}
                          </span>
                        </div>
                        <p className="font-poppins text-sm text-warm-800 leading-relaxed">{r.review || <span className="text-warm-400 italic">No written review</span>}</p>
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-cream-100">
                          <div>
                            <span className="font-poppins text-xs font-medium text-warm-700">{r.customer_name || 'Anonymous'}</span>
                            {r.is_verified && <span className="ml-2 font-poppins text-[9px] text-green-600 tracking-wider uppercase">Verified</span>}
                          </div>
                          <span className="font-poppins text-xs text-warm-400">
                            {(r as any).products?.name || 'Unknown Product'}
                          </span>
                          <span className="font-poppins text-xs text-warm-400">
                            {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={async () => {
                            await supabase.from('product_reviews').update({ is_visible: !r.is_visible }).eq('id', r.id);
                            await loadData();
                          }}
                          className={`font-poppins text-xs px-3 py-1 transition-colors ${
                            r.is_visible
                              ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600'
                              : 'bg-red-50 text-red-600 hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          {r.is_visible ? 'Visible' : 'Hidden'}
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this review?')) return;
                            await supabase.from('product_reviews').delete().eq('id', r.id);
                            await loadData();
                          }}
                          className="text-warm-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings */}
        {tab === 'settings' && (
          <div>
            <h2 className="font-playfair text-xl text-warm-800 mb-5">Site Settings</h2>
            <div className="bg-white p-6 shadow-card max-w-2xl">
              <p className="font-poppins text-xs text-warm-400 mb-6">Changes take effect immediately on your live site. No coding required.</p>
              <div className="space-y-5">
                {[
                  { key: 'hero_title', label: 'Hero Title' },
                  { key: 'hero_subtitle', label: 'Hero Subtitle' },
                  { key: 'whatsapp_number', label: 'WhatsApp Number' },
                  { key: 'instagram_url', label: 'Instagram URL' },
                  { key: 'about_text', label: 'About Text', textarea: true },
                  { key: 'logo_url', label: 'Logo Image URL' },
                  { key: 'hero_banner_url', label: 'Hero Banner URL' },
                ].map(setting => (
                  <div key={setting.key}>
                    <label className="font-poppins text-xs text-warm-600 mb-1.5 block">{setting.label}</label>
                    {setting.textarea ? (
                      <textarea
                        rows={3}
                        value={siteSettings[setting.key] || ''}
                        onChange={e => setSiteSettings(p => ({ ...p, [setting.key]: e.target.value }))}
                        onBlur={e => saveSetting(setting.key, e.target.value)}
                        className="input-luxury text-sm resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={siteSettings[setting.key] || ''}
                        onChange={e => setSiteSettings(p => ({ ...p, [setting.key]: e.target.value }))}
                        onBlur={e => saveSetting(setting.key, e.target.value)}
                        className="input-luxury text-sm"
                      />
                    )}
                  </div>
                ))}
                <p className="font-poppins text-xs text-warm-400 italic">Settings auto-save when you click away from each field.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryAddForm({ onSave }: { onSave: (item: Omit<GalleryItem, 'id' | 'created_at'>) => Promise<void> }) {
  const [form, setForm] = useState({ title: '', image_url: '', tags: '', sort_order: 0, is_active: true });
  async function handleSave() {
    if (!form.image_url) return;
    await onSave({ ...form, tags: form.tags.split(',').map(s => s.trim()).filter(Boolean) });
    setForm({ title: '', image_url: '', tags: '', sort_order: 0, is_active: true });
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="font-poppins text-xs text-warm-600 mb-1 block">Image URL</label>
        <input type="text" placeholder="https://..." value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="input-luxury text-sm" />
      </div>
      <div>
        <label className="font-poppins text-xs text-warm-600 mb-1 block">Title</label>
        <input type="text" placeholder="Image title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-luxury text-sm" />
      </div>
      <div>
        <label className="font-poppins text-xs text-warm-600 mb-1 block">Tags (comma-separated)</label>
        <input type="text" placeholder="Resin, Candles" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="input-luxury text-sm" />
      </div>
      <div className="col-span-1 md:col-span-3">
        <button onClick={handleSave} className="btn-gold text-xs py-2">Add to Gallery</button>
      </div>
    </div>
  );
}
