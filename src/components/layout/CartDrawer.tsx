import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: 'products' | 'cart') => void;
};

export default function CartDrawer({ open, onClose, onNavigate }: CartDrawerProps) {
  const { items, count, total, removeItem, updateQuantity } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-warm-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-cream-50 shadow-luxury-lg flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200">
          <div>
            <h2 className="font-playfair text-xl text-warm-800">Your Cart</h2>
            <p className="font-poppins text-xs text-warm-500 mt-0.5">{count} {count === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={onClose} className="p-2 text-warm-600 hover:text-warm-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
              <ShoppingBag size={48} className="text-cream-300" />
              <p className="font-playfair text-xl text-warm-600">Your cart is empty</p>
              <p className="font-poppins text-sm text-warm-400 text-center">Discover our handcrafted collection and add something beautiful.</p>
              <button
                onClick={() => { onNavigate('products'); onClose(); }}
                className="btn-gold mt-2"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className="px-6 space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-4 bg-white p-4 shadow-card">
                  {/* Image */}
                  <div className="w-20 h-20 bg-cream-100 shrink-0 overflow-hidden">
                    {item.product.images[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-warm-300">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-poppins text-sm font-medium text-warm-800 truncate">{item.product.name}</h3>
                    <p className="font-poppins text-sm text-champagne-600 mt-0.5">₹{item.product.price.toLocaleString()}</p>

                    {/* Quantity */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center border border-cream-300 text-warm-600 hover:border-champagne-400 hover:text-champagne-600 transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="font-poppins text-sm text-warm-800 w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center border border-cream-300 text-warm-600 hover:border-champagne-400 hover:text-champagne-600 transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-warm-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-cream-200 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-poppins text-sm text-warm-600">Subtotal</span>
              <span className="font-playfair text-xl text-warm-800">₹{total.toLocaleString()}</span>
            </div>
            <p className="font-poppins text-xs text-warm-400">Shipping calculated at checkout</p>
            <button
              onClick={() => { onNavigate('cart'); onClose(); }}
              className="btn-gold w-full"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => { onNavigate('products'); onClose(); }}
              className="btn-outline-gold w-full"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
