import { useState } from 'react';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Check, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type Page = 'home' | 'products' | 'gallery' | 'about' | 'contact' | 'product-detail' | 'auth' | 'dashboard' | 'admin' | 'cart';

type CartPageProps = {
  onNavigate: (page: Page, params?: Record<string, string>) => void;
};

export default function CartPage({ onNavigate }: CartPageProps) {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [orderPlaced, setOrderPlaced] = useState('');
  const [placing, setPlacing] = useState(false);
  const [shippingForm, setShippingForm] = useState({ full_name: '', phone: '', line1: '', city: '', state: '', pincode: '' });

  const shipping = total >= 999 ? 0 : 99;
  const grandTotal = total + shipping;

  async function placeOrder() {
    setPlacing(true);
    const orderNum = 'KV' + Date.now().toString().slice(-8);
    const { data: order, error } = await supabase.from('orders').insert({
      user_id: user?.id || null,
      order_number: orderNum,
      status: 'pending',
      total_amount: grandTotal,
      shipping_address: shippingForm,
    }).select().maybeSingle();

    if (!error && order) {
      await supabase.from('order_items').insert(
        items.map(item => ({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.images[0] || '',
          quantity: item.quantity,
          price: item.product.price,
          customization: item.customization,
        }))
      );
      setOrderPlaced(orderNum);
      clearCart();
      setStep('success');
    }
    setPlacing(false);
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-luxury-gradient pt-20 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-green-600" />
          </div>
          <h1 className="font-playfair text-3xl text-warm-800 mb-3">Order Placed!</h1>
          <p className="font-poppins text-sm text-warm-500 mb-2">Order #{orderPlaced}</p>
          <p className="font-poppins text-sm text-warm-500 leading-relaxed mb-8">
            Thank you for your order! We'll start crafting your piece with love. You'll receive a WhatsApp update soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => onNavigate('products')} className="btn-gold">Continue Shopping</button>
            {user && <button onClick={() => onNavigate('dashboard')} className="btn-outline-gold">View Orders</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-gradient pt-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        {/* Back */}
        <button onClick={() => step === 'checkout' ? setStep('cart') : onNavigate('products')} className="flex items-center gap-2 font-poppins text-sm text-warm-500 hover:text-champagne-600 transition-colors mb-8">
          <ArrowLeft size={14} />
          {step === 'checkout' ? 'Back to Cart' : 'Continue Shopping'}
        </button>

        <h1 className="font-playfair text-3xl text-warm-800 mb-8">
          {step === 'cart' ? 'Shopping Cart' : 'Checkout'}
        </h1>

        {items.length === 0 && step === 'cart' ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="text-cream-300 mx-auto mb-4" />
            <p className="font-playfair text-2xl text-warm-600 mb-3">Your cart is empty</p>
            <button onClick={() => onNavigate('products')} className="btn-gold mt-4">Shop Now</button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2">
              {step === 'cart' ? (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.product.id} className="bg-white p-5 shadow-card flex gap-5">
                      <div className="w-24 h-24 bg-cream-100 shrink-0 overflow-hidden">
                        {item.product.images[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-cream-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-poppins text-sm font-medium text-warm-800">{item.product.name}</h3>
                        <p className="font-poppins text-xs text-warm-400 mt-0.5">{item.product.categories?.name}</p>
                        {Object.entries(item.customization).length > 0 && (
                          <div className="mt-1">
                            {Object.entries(item.customization).map(([k, v]) => (
                              <p key={k} className="font-poppins text-xs text-champagne-600">{k}: {v}</p>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-cream-200">
                            <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-warm-500 hover:text-warm-800 text-sm">-</button>
                            <span className="w-10 text-center font-poppins text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-warm-500 hover:text-warm-800 text-sm">+</button>
                          </div>
                          <span className="font-poppins text-sm font-medium text-warm-800">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.product.id)} className="text-warm-300 hover:text-red-400 transition-colors shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                /* Checkout form */
                <div className="bg-white p-6 shadow-card">
                  <h2 className="font-playfair text-xl text-warm-800 mb-5">Delivery Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'full_name', label: 'Full Name', span: 2 },
                      { key: 'phone', label: 'Phone' },
                      { key: 'line1', label: 'Address', span: 2 },
                      { key: 'city', label: 'City' },
                      { key: 'state', label: 'State' },
                      { key: 'pincode', label: 'Pincode' },
                    ].map(f => (
                      <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                        <label className="font-poppins text-xs text-warm-600 mb-1.5 block">{f.label}</label>
                        <input
                          type="text"
                          required
                          value={(shippingForm as any)[f.key]}
                          onChange={e => setShippingForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="input-luxury"
                        />
                      </div>
                    ))}
                  </div>
                  {!user && (
                    <p className="font-poppins text-xs text-warm-400 mt-4 p-3 bg-cream-50 border border-cream-200">
                      <button onClick={() => onNavigate('auth')} className="text-champagne-600 font-medium">Sign in</button> to save your address and track your order.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="space-y-4">
              <div className="bg-white p-6 shadow-card">
                <h2 className="font-playfair text-xl text-warm-800 mb-5">Order Summary</h2>
                <div className="space-y-3 text-sm font-poppins">
                  <div className="flex justify-between text-warm-600">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-warm-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-warm-400">Add ₹{(999 - total).toFixed(0)} more for free shipping</p>
                  )}
                  <div className="border-t border-cream-200 pt-3 flex justify-between">
                    <span className="font-medium text-warm-800">Total</span>
                    <span className="font-playfair text-xl text-warm-800">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {step === 'cart' ? (
                    <button onClick={() => setStep('checkout')} className="btn-gold w-full">
                      Proceed to Checkout
                    </button>
                  ) : (
                    <button
                      onClick={placeOrder}
                      disabled={placing || !shippingForm.full_name || !shippingForm.phone || !shippingForm.line1}
                      className="btn-gold w-full disabled:opacity-60"
                    >
                      {placing ? 'Placing Order...' : 'Place Order'}
                    </button>
                  )}
                  <a
                    href={(() => {
                      const itemsText = items.map((item, idx) =>
                        `${idx + 1}. *${item.product.name}*\n   Qty: ${item.quantity} | Price: ₹${(item.product.price * item.quantity).toLocaleString()}${item.customization && Object.keys(item.customization).length > 0 ? `\n   Customization: ${Object.entries(item.customization).map(([k, v]) => `${k}: ${v}`).join(', ')}` : ''}${item.product.images[0] ? `\n   Image: ${item.product.images[0]}` : ''}`
                      ).join('\n\n');
                      return `https://wa.me/+919876543210?text=${encodeURIComponent(`Hi Kala Vibez! I'd like to order:

${itemsText}

*Order Summary:*
• Subtotal: ₹${total.toLocaleString()}
• Shipping: ${shipping === 0 ? 'FREE' : `₹${shipping}`}
• *Total: ₹${grandTotal.toLocaleString()}*

Please confirm my order. Thank you!`)}`;
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-poppins border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 transition-colors"
                  >
                    Order via WhatsApp
                  </a>
                </div>
              </div>

              <div className="bg-cream-50 p-4 border border-cream-200 flex gap-3">
                <Truck size={16} className="text-champagne-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-poppins text-xs font-medium text-warm-700">Delivery in 7–14 Days</p>
                  <p className="font-poppins text-xs text-warm-400 mt-0.5">Custom pieces crafted with love</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
