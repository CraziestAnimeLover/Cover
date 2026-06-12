import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiArrowLeft, FiTag } from 'react-icons/fi';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 font-sans selection:bg-orange-500/20">
        <div className="bg-white border border-slate-100 rounded-[20px] p-12 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <FiShoppingBag size={28} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Your cart is empty</h2>
          <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto mb-8">
            Looks like you haven't added any premium courses to your selection yet.
          </p>
          <Link 
            to="/courses" 
            className="inline-flex items-center bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95"
          >
            Browse Courses Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 font-sans selection:bg-orange-500/20">
      {/* Return Navigation Anchor */}
      <div className="mb-6">
        <Link 
          to="/courses" 
          className="inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100/60 px-4 py-2 rounded-xl transition-all"
        >
          <FiArrowLeft className="mr-2 stroke-[2.5]" /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Items Block */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Shopping Cart <span className="text-slate-400 font-medium ml-1">({cartItems.length})</span>
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 flex justify-between items-center group hover:bg-slate-50/40 transition-colors">
                  <div className="flex-1 pr-4">
                    <h3 className="font-bold text-slate-800 text-base tracking-tight line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                      By {item.instructor || 'Lead Expert'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <span className="font-black text-slate-900 text-lg">₹{item.price}</span>
                    <button 
                      type="button"
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                      title="Remove Item"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary sticky side bracket */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] p-6 sticky top-24">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight border-b border-slate-100 pb-4 mb-4">
              Order Summary
            </h3>
            
            <div className="space-y-3 mb-6 text-sm font-medium text-slate-500">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="text-slate-800 font-bold">₹{totalAmount}</span>
              </div>
              
              <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/60 px-3 py-1.5 rounded-xl border border-emerald-100/50">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <FiTag /> Discount
                </span>
                <span className="font-bold">-₹0</span>
              </div>
              
              <div className="border-t border-slate-100 pt-4 mt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-900 font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-orange-600 tracking-tight">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-orange-500/20 tracking-wide text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => alert('Checkout functionality coming soon!')}
            >
              {loading ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;