import React, { useState } from 'react';
import { CartItem, Product } from '../types';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Heart, ArrowUpRight } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  wishlist: Product[];
  onClose: () => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onRemoveFavorite: (productId: string) => void;
  onMoveFavoriteToBag: (product: Product) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  wishlist,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onRemoveFavorite,
  onMoveFavoriteToBag,
  onCheckout,
}) => {
  const [activeTab, setActiveTab] = useState<'bag' | 'favorites'>('bag');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 150;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const diffForFree = freeShippingThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-white border-l border-neutral-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header with Close & Tab Toggle */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          {/* Segmented Controls for Bag vs My Favorites */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
            <button
              onClick={() => setActiveTab('bag')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'bag'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})</span>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'favorites'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              <span>My Favorites ({wishlist.length})</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =========================================================
            SECTION 1: SHOPPING BAG ITEMS
           ========================================================= */}
        {activeTab === 'bag' && (
          <>
            {/* Free Shipping Progress Indicator */}
            <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100">
              <div className="flex items-center justify-between text-xs text-neutral-600 mb-1.5">
                <span>
                  {diffForFree <= 0 ? (
                    <span className="text-emerald-700 font-semibold">Complimentary Express Shipping Unlocked!</span>
                  ) : (
                    <span>Add <strong className="text-neutral-900">${diffForFree}</strong> more for Free Shipping</span>
                  )}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                    <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-800">Your bag is empty</p>
                  <p className="text-xs text-neutral-500 max-w-xs">
                    Explore our collection of women's 3pc/2pc suits, heavy cotton apparel, artisan shawls, and leather totes.
                  </p>
                  {wishlist.length > 0 && (
                    <button
                      onClick={() => setActiveTab('favorites')}
                      className="text-xs font-semibold text-neutral-900 underline pt-1"
                    >
                      View {wishlist.length} Saved {wishlist.length === 1 ? 'Favorite' : 'Favorites'}
                    </button>
                  )}
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="py-4 flex gap-3.5 group">
                    <div className="w-20 h-24 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200/80">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-neutral-900 leading-snug">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-500">
                          <span>Size: {item.selectedSize}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            {item.selectedColor.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-neutral-200 rounded-md bg-neutral-50">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 text-neutral-500 hover:text-neutral-900 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-medium text-neutral-900 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 text-neutral-500 hover:text-neutral-900 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-semibold text-neutral-900 tabular-nums">
                          ${item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bag Subtotal & Checkout CTA */}
            {items.length > 0 && (
              <div className="p-6 border-t border-neutral-200 bg-neutral-50/60 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>Subtotal</span>
                  <span className="text-sm font-bold text-neutral-900 tabular-nums">
                    ${subtotal}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Estimated Shipping</span>
                  <span className="tabular-nums">
                    {subtotal >= freeShippingThreshold ? 'FREE' : '$15'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onCheckout();
                  }}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01]"
                >
                  <span>Proceed to Delivery & Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* =========================================================
            SECTION 2: 'MY FAVORITES' WISHLIST SECTION
           ========================================================= */}
        {activeTab === 'favorites' && (
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-100 flex flex-col justify-between">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                  <Heart className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-sm font-semibold text-neutral-800">Your Wishlist is Empty</p>
                <p className="text-xs text-neutral-500 max-w-xs">
                  Tap the heart icon on any outfit or accessory to save it here for later.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                <div className="pb-2 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Saved Pieces ({wishlist.length})</span>
                  <span>Instant Transfer</span>
                </div>

                {wishlist.map((fav) => (
                  <div key={fav.id} className="py-4 flex gap-3.5 group items-center">
                    <div className="w-20 h-24 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200/80">
                      <img
                        src={fav.image}
                        alt={fav.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between h-24">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                            {fav.category}
                          </span>
                          <button
                            onClick={() => onRemoveFavorite(fav.id)}
                            className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove from favorites"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="text-xs font-semibold text-neutral-900 leading-snug line-clamp-1">
                          {fav.name}
                        </h4>

                        <span className="text-xs font-bold text-neutral-900 tabular-nums block mt-1">
                          ${fav.price}
                        </span>
                      </div>

                      {/* Move to Bag Button */}
                      <button
                        onClick={() => onMoveFavoriteToBag(fav)}
                        className="w-full py-1.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
