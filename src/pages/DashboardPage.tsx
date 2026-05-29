import { useState, useEffect } from 'react';
import { User, Package, Heart, MapPin, LogOut, ArrowLeft, ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { supabase, Order, Address } from '../lib/supabase';

type Page = 'home' | 'products' | 'gallery' | 'about' | 'contact' | 'product-detail' | 'auth' | 'dashboard' | 'admin' | 'cart';

type DashboardPageProps = {
  onNavigate: (page: Page, params?: Record<string, string>) => void;
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  shipped: 'bg-sky-50 text-sky-700 border-sky-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

type Tab = 'orders' | 'wishlist' | 'profile' | 'addresses';

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { wishlistIds, toggle } = useWishlist();
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [profileForm, setProfileForm] = useState({ display_name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });

  useEffect(() => {
    if (!user) { onNavigate('auth'); return; }
    setProfileForm({ display_name: profile?.display_name || '', phone: profile?.phone || '' });
  }, [user, profile]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoadingOrders(true);
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoadingOrders(false);

      const { data: addrs } = await supabase.from('addresses').select('*').eq('user_id', user!.id).order('is_default', { ascending: false });
      setAddresses(addrs || []);
    }
    load();
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setSavingProfile(true);
    await supabase.from('profiles').update({ display_name: profileForm.display_name, phone: profileForm.phone, updated_at: new Date().toISOString() }).eq('id', user.id);
    await refreshProfile();
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  async function addAddress() {
    if (!user) return;
    await supabase.from('addresses').insert({ ...addrForm, user_id: user.id });
    const { data } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false });
    setAddresses(data || []);
    setAddingAddress(false);
    setAddrForm({ label: 'Home', full_name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
  }

  async function deleteAddress(id: string) {
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  }

  if (!user) return null;

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'orders', label: 'My Orders', icon: <Package size={16} /> },
    { key: 'wishlist', label: 'Wishlist', icon: <Heart size={16} /> },
    { key: 'addresses', label: 'Addresses', icon: <MapPin size={16} /> },
    { key: 'profile', label: 'Profile', icon: <User size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-luxury-gradient pt-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => onNavigate('home')} className="flex items-center gap-1.5 font-poppins text-sm text-warm-400 hover:text-champagne-600 mb-2"><ArrowLeft size={13} /> Home</button>
            <h1 className="font-playfair text-3xl text-warm-800">My Account</h1>
            <p className="font-poppins text-sm text-warm-500 mt-1">{profile?.display_name || user.email}</p>
          </div>
          <button onClick={() => { signOut(); onNavigate('home'); }} className="flex items-center gap-2 font-poppins text-xs text-warm-500 hover:text-red-500 transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 shrink-0">
            <nav className="bg-white shadow-card">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 font-poppins text-sm transition-all ${
                    tab === t.key ? 'bg-champagne-50 text-champagne-600 border-l-2 border-champagne-500' : 'text-warm-600 hover:bg-cream-50 border-l-2 border-transparent'
                  }`}
                >
                  {t.icon}
                  {t.label}
                  <ChevronRight size={12} className="ml-auto" />
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Orders */}
            {tab === 'orders' && (
              <div>
                <h2 className="font-playfair text-xl text-warm-800 mb-5">Order History</h2>
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-cream-200 shimmer-bg" />)}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white p-12 text-center shadow-card">
                    <Package size={40} className="text-cream-300 mx-auto mb-4" />
                    <p className="font-playfair text-xl text-warm-600 mb-2">No orders yet</p>
                    <p className="font-poppins text-sm text-warm-400 mb-6">Start shopping to see your orders here.</p>
                    <button onClick={() => onNavigate('products')} className="btn-gold">Shop Now</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white p-5 shadow-card">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-poppins text-sm font-medium text-warm-800">#{order.order_number}</p>
                            <p className="font-poppins text-xs text-warm-400 mt-0.5">
                              {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={`font-poppins text-xs px-2.5 py-1 border capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-cream-100 pt-3">
                          <span className="font-poppins text-xs text-warm-500">
                            {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                          </span>
                          <span className="font-poppins text-sm font-medium text-warm-800">₹{order.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            {tab === 'wishlist' && (
              <div>
                <h2 className="font-playfair text-xl text-warm-800 mb-5">My Wishlist</h2>
                {wishlistIds.size === 0 ? (
                  <div className="bg-white p-12 text-center shadow-card">
                    <Heart size={40} className="text-cream-300 mx-auto mb-4" />
                    <p className="font-playfair text-xl text-warm-600 mb-2">Your wishlist is empty</p>
                    <p className="font-poppins text-sm text-warm-400 mb-6">Save your favorite pieces here.</p>
                    <button onClick={() => onNavigate('products')} className="btn-gold">Browse Products</button>
                  </div>
                ) : (
                  <p className="font-poppins text-sm text-warm-500">{wishlistIds.size} saved item{wishlistIds.size !== 1 ? 's' : ''}</p>
                )}
              </div>
            )}

            {/* Addresses */}
            {tab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-playfair text-xl text-warm-800">Saved Addresses</h2>
                  <button onClick={() => setAddingAddress(p => !p)} className="flex items-center gap-1.5 btn-outline-gold py-2 text-xs">
                    <Plus size={12} /> Add Address
                  </button>
                </div>

                {addingAddress && (
                  <div className="bg-white p-6 shadow-card mb-5">
                    <h3 className="font-poppins text-sm font-medium text-warm-700 mb-4">New Address</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'label', label: 'Label', placeholder: 'Home / Work' },
                        { key: 'full_name', label: 'Full Name', placeholder: 'Your name' },
                        { key: 'phone', label: 'Phone', placeholder: '+91...' },
                        { key: 'line1', label: 'Address Line 1', placeholder: 'Street address' },
                        { key: 'city', label: 'City', placeholder: 'City' },
                        { key: 'state', label: 'State', placeholder: 'State' },
                        { key: 'pincode', label: 'Pincode', placeholder: '000000' },
                      ].map(field => (
                        <div key={field.key} className={field.key === 'line1' ? 'col-span-2' : ''}>
                          <label className="font-poppins text-xs text-warm-600 mb-1 block">{field.label}</label>
                          <input
                            type="text"
                            placeholder={field.placeholder}
                            value={addrForm[field.key as keyof typeof addrForm]}
                            onChange={e => setAddrForm(p => ({ ...p, [field.key]: e.target.value }))}
                            className="input-luxury text-xs"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={addAddress} className="btn-gold text-xs py-2">Save Address</button>
                      <button onClick={() => setAddingAddress(false)} className="btn-outline-gold text-xs py-2">Cancel</button>
                    </div>
                  </div>
                )}

                {addresses.length === 0 && !addingAddress ? (
                  <div className="bg-white p-12 text-center shadow-card">
                    <MapPin size={40} className="text-cream-300 mx-auto mb-4" />
                    <p className="font-poppins text-sm text-warm-500">No saved addresses. Add one for faster checkout.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(addr => (
                      <div key={addr.id} className="bg-white p-5 shadow-card flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-poppins text-xs tracking-wider text-champagne-600 uppercase">{addr.label}</span>
                            {addr.is_default && <span className="font-poppins text-[9px] bg-champagne-100 text-champagne-700 px-2 py-0.5">Default</span>}
                          </div>
                          <p className="font-poppins text-sm text-warm-800">{addr.full_name}</p>
                          <p className="font-poppins text-xs text-warm-500 mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                          <p className="font-poppins text-xs text-warm-500">{addr.city}, {addr.state} – {addr.pincode}</p>
                          <p className="font-poppins text-xs text-warm-500">{addr.phone}</p>
                        </div>
                        <button onClick={() => deleteAddress(addr.id)} className="text-warm-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            {tab === 'profile' && (
              <div>
                <h2 className="font-playfair text-xl text-warm-800 mb-5">My Profile</h2>
                <div className="bg-white p-6 shadow-card max-w-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Display Name</label>
                      <input
                        type="text"
                        value={profileForm.display_name}
                        onChange={e => setProfileForm(p => ({ ...p, display_name: e.target.value }))}
                        className="input-luxury"
                      />
                    </div>
                    <div>
                      <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Email</label>
                      <input type="email" value={user.email || ''} disabled className="input-luxury opacity-60 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="font-poppins text-xs text-warm-600 mb-1.5 block">Phone</label>
                      <input
                        type="tel"
                        placeholder="+91..."
                        value={profileForm.phone}
                        onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        className="input-luxury"
                      />
                    </div>
                    <button
                      onClick={saveProfile}
                      disabled={savingProfile}
                      className="btn-gold disabled:opacity-60"
                    >
                      {savingProfile ? 'Saving...' : profileSaved ? 'Saved!' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
