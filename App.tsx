import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, ProductCategory } from './types';
import {
  getStoredProducts,
  saveStoredProducts,
  getStoredOrders,
  saveStoredOrders,
  INITIAL_PRODUCTS,
} from './data/initialProducts';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { VirtualTryOnModal } from './components/VirtualTryOnModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminPanel } from './components/AdminPanel';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { Logo } from './components/Logo';
import {
  Camera,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Package,
  Heart,
  Eye,
} from 'lucide-react';

export default function App() {
  // Products and Orders from persistent storage
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());

  // Persistent Wishlist / My Favorites state
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('tichstich_wishlist_v4');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tichstich_cart_v4');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Modals & Viewers
  const [activeTryOnProduct, setActiveTryOnProduct] = useState<Product | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartInitialTab, setCartInitialTab] = useState<'bag' | 'favorites'>('bag');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState(false);

  // Subtle floating toast for feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tichstich_cart_v4', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tichstich_wishlist_v4', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // URL listener: ONLY open admin panel when /admin is in the browser URL!
  useEffect(() => {
    const checkAdminUrl = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        path.endsWith('/admin') ||
        path.endsWith('/admi') ||
        hash === '#admin' ||
        hash === '#/admin' ||
        hash === '#admi'
      ) {
        setIsAdminOpen(true);
      }
    };

    checkAdminUrl();
    window.addEventListener('popstate', checkAdminUrl);
    window.addEventListener('hashchange', checkAdminUrl);
    return () => {
      window.removeEventListener('popstate', checkAdminUrl);
      window.removeEventListener('hashchange', checkAdminUrl);
    };
  }, []);

  const handleCloseAdmin = () => {
    setIsAdminOpen(false);
    if (window.location.hash.includes('admin') || window.location.hash.includes('admi')) {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2600);
  };

  // Toggle Wishlist item
  const handleToggleFavorite = (product: Product) => {
    const isAlreadyFavorited = wishlist.some((p) => p.id === product.id);
    if (isAlreadyFavorited) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      triggerToast(`Removed ${product.name} from Favorites`);
    } else {
      setWishlist((prev) => [product, ...prev]);
      triggerToast(`Saved ${product.name} to My Favorites`);
    }
  };

  const handleRemoveFavorite = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
    triggerToast('Removed from Favorites');
  };

  const handleMoveFavoriteToBag = (product: Product) => {
    handleAddToCart(product);
    triggerToast(`Moved ${product.name} to Shopping Bag`);
  };

  // Add item to shopping bag
  const handleAddToCart = (
    product: Product,
    size?: string,
    color?: { name: string; hex: string }
  ) => {
    const chosenSize = size || product.sizes[0] || 'Standard';
    const chosenColor = color || product.colors[0] || { name: 'Default', hex: '#CCCCCC' };

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === chosenSize &&
          item.selectedColor.name === chosenColor.name
      );

      if (existingIndex > -1) {
        const next = [...prevCart];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1,
        };
        return next;
      } else {
        const newItem: CartItem = {
          id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          selectedSize: chosenSize,
          selectedColor: chosenColor,
          quantity: 1,
        };
        return [newItem, ...prevCart];
      }
    });

    triggerToast(`Added ${product.name} to Bag`);
  };

  const handleUpdateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
    triggerToast('Item removed from Bag');
  };

  const handleInstantBuy = (
    product: Product,
    size: string,
    color: { name: string; hex: string }
  ) => {
    handleAddToCart(product, size, color);
    setSelectedDetailProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleOrderPlaced = (newOrder: Order) => {
    const updatedProducts = products.map((prod) => {
      const purchased = newOrder.items.find((i) => i.product.id === prod.id);
      if (purchased) {
        const nextStock = Math.max(0, prod.stock - purchased.quantity);
        return { ...prod, stock: nextStock, inStock: nextStock > 0 };
      }
      return prod;
    });

    setProducts(updatedProducts);
    saveStoredProducts(updatedProducts);

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);

    setCart([]);
  };

  const cartItemCount = cart.reduce((acc, it) => acc + it.quantity, 0);
  const cartSubtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#18181B] flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      
      {/* Top Bar Announcement */}
      <div className="bg-neutral-900 text-neutral-300 text-[10px] sm:text-[11px] font-medium py-1.5 sm:py-2 px-3 text-center tracking-wide flex items-center justify-center gap-2 sm:gap-3">
        <span>Complimentary Express Delivery on Orders over $150</span>
        <span className="hidden sm:inline text-neutral-600">·</span>
        <span className="hidden sm:inline text-neutral-400">Cash on Delivery & Instant Card Available</span>
      </div>

      {/* Main Top Navigation Bar */}
      <Navbar
        cartCount={cartItemCount}
        wishlistCount={wishlist.length}
        onOpenCart={(initialTab = 'bag') => {
          setCartInitialTab(initialTab);
          setIsCartOpen(true);
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenOrderTracker={() => setIsOrderTrackerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* =========================================================
          HERO CAMPAIGN & EDITORIAL SHOWCASE
         ========================================================= */}
      <section className="relative border-b border-neutral-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Left Content Editorial */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <span>TICHSTICH STUDIO</span>
                <span aria-hidden="true">·</span>
                <span>Autumn / Winter 2026</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 font-display leading-[1.1] text-balance">
                Architectural Form. Handcrafted Luxury.
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-neutral-600 max-w-xl leading-relaxed">
                Explore luxury 3-piece (3pc) & 2-piece (2pc) tailored ensembles with matching sahwal wraps, heavy cotton apparel, structured calfskin totes, and merino wool caps. Inspect high-resolution macro textile weaves and try on via live camera.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 sm:gap-3 pt-1 flex-wrap">
                <button
                  onClick={() => {
                    const firstItem = products[0];
                    if (firstItem) setSelectedDetailProduct(firstItem);
                  }}
                  className="w-full sm:w-auto px-5 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <Eye className="w-4 h-4 text-neutral-300" />
                  <span>Inspect Detail Photos</span>
                </button>

                <button
                  onClick={() => {
                    const firstItem = products[0];
                    if (firstItem) setActiveTryOnProduct(firstItem);
                  }}
                  className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-semibold rounded-xl border border-neutral-300 flex items-center justify-center gap-2 transition-colors active:scale-95"
                >
                  <Camera className="w-4 h-4 text-neutral-700" />
                  <span>Try On with Camera</span>
                </button>
              </div>

              {/* Value trust bar */}
              <div className="pt-4 sm:pt-6 border-t border-neutral-100 grid grid-cols-3 gap-2 sm:gap-4 text-[11px] sm:text-xs text-neutral-600">
                <div>
                  <strong className="block text-neutral-900 font-semibold text-xs sm:text-sm">Macro Details</strong>
                  <span className="text-[10px] sm:text-[11px] text-neutral-400">Pure textile fidelity</span>
                </div>
                <div>
                  <strong className="block text-neutral-900 font-semibold text-xs sm:text-sm">Virtual Try-On</strong>
                  <span className="text-[10px] sm:text-[11px] text-neutral-400">AI body alignment</span>
                </div>
                <div>
                  <strong className="block text-neutral-900 font-semibold text-xs sm:text-sm">COD Available</strong>
                  <span className="text-[10px] sm:text-[11px] text-neutral-400">Doorstep payment</span>
                </div>
              </div>

            </div>

            {/* Right Hero Visual Feature */}
            <div className="lg:col-span-5 relative mt-2 lg:mt-0">
              <div className="relative aspect-3/4 sm:aspect-4/3 lg:aspect-square rounded-2xl overflow-hidden border border-neutral-200/90 shadow-xl bg-neutral-100 group">
                <img
                  src={products[0]?.image || '/src/assets/images/girls_3pc_luxury_suit_1793882263521.jpg'}
                  alt="Featured Piece"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Floating Micro-Badge */}
                <div className="absolute bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-4 bg-white/95 backdrop-blur-xs p-3 sm:p-3.5 rounded-xl border border-neutral-200 shadow-md flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                      Featured Piece
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                      {products[0]?.name || 'Minimalist Raw Silk 3-Piece (3pc)'}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      if (products[0]) setSelectedDetailProduct(products[0]);
                    }}
                    className="px-3.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-800 transition-colors shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          PRODUCT CATALOG & FILTERING
         ========================================================= */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12 w-full space-y-6 sm:space-y-8">
        
        {/* Desktop Category Filter & Search Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-neutral-200/90">
          
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {(['All', 'Girls 3pc & 2pc', 'Clothes', 'Shawls & Wraps', 'Bags', 'Caps & Headwear'] as ProductCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                }`}
              >
                {cat === 'All' ? 'All Pieces' : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between w-full lg:w-auto gap-3 text-xs text-neutral-500">
            {searchQuery && (
              <span className="truncate">
                Searching: "<strong className="text-neutral-900">{searchQuery}</strong>"
              </span>
            )}
            <span className="tabular-nums font-medium ml-auto">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
            </span>
          </div>
        </div>

        {/* Responsive Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorited={wishlist.some((p) => p.id === product.id)}
              onToggleFavorite={handleToggleFavorite}
              onSelect={(p) => setSelectedDetailProduct(p)}
              onOpenTryOn={(p) => setActiveTryOnProduct(p)}
              onQuickAdd={(p) => handleAddToCart(p)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-neutral-200 p-6">
            <p className="text-sm font-semibold text-neutral-800">No pieces found</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              No products match your active search or category filters. Tap below to see the full collection.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}

      </main>

      {/* =========================================================
          CRAFTSMANSHIP & EDITORIAL STORY SECTION
         ========================================================= */}
      <section className="bg-white border-t border-neutral-200/90 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-neutral-800">
            
            <div className="space-y-2.5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                01. Material Rigor
              </span>
              <h3 className="text-base sm:text-lg font-bold font-display text-neutral-900">
                Raw Silk, Cashmere & Cotton
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                From long-line 3-piece mulberry silk tunics to 480 GSM French Terry and baby alpaca sahwal wraps, every garment is tailored for tactile elegance and architectural drape.
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                02. Macro Detail Inspection
              </span>
              <h3 className="text-base sm:text-lg font-bold font-display text-neutral-900">
                High-Fidelity Photo Galleries
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Inspect high-resolution close-ups of delicate selvedge fringes, tonal thread embroidery, nickel aglets, and full-grain leather burnished seams.
              </p>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                03. Frictionless Dispatch
              </span>
              <h3 className="text-base sm:text-lg font-bold font-display text-neutral-900">
                Shipping Notes & Dual Payment
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Add specific delivery instructions (gate codes, leave at door, call ahead). Pay smoothly via Cash on Delivery (COD) or instant encrypted digital payment.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER WITH ORDER TRACKER LINK
         ========================================================= */}
      <footer className="bg-neutral-50 border-t border-neutral-200/80 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <span className="font-bold text-neutral-900 font-display tracking-wider">
              TICHSTICH
            </span>
            <span>·</span>
            <span className="hidden sm:inline">Minimalist Luxury Apparel, 3pc/2pc & Accessories</span>
          </div>

          <div className="flex items-center gap-5 sm:gap-6 flex-wrap justify-center">
            <button
              onClick={() => setIsOrderTrackerOpen(true)}
              className="text-neutral-800 hover:text-neutral-950 font-semibold underline flex items-center gap-1.5 transition-colors"
            >
              <Package className="w-3.5 h-3.5 text-neutral-700" />
              <span>Track Your Order</span>
            </button>

            <span className="text-neutral-300">·</span>
            <span>© 2026 TICHSTICH. All rights reserved.</span>
          </div>

        </div>
      </footer>

      {/* =========================================================
          TACTILE FLOATING TOAST FEEDBACK
         ========================================================= */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2.5 bg-neutral-900 text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl shadow-2xl border border-neutral-800 text-xs animate-in slide-in-from-bottom duration-200 max-w-[90vw]">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium truncate">{toastMessage}</span>
          <button
            onClick={() => setIsCartOpen(true)}
            className="ml-2 pl-2 border-l border-neutral-700 text-neutral-300 hover:text-white underline font-medium shrink-0"
          >
            View Bag
          </button>
        </div>
      )}

      {/* =========================================================
          MODALS & ACTIVE WORKFLOW OVERLAYS
         ========================================================= */}
      
      {/* 1. Virtual Camera Try-On with AI-powered Body Tracking */}
      {activeTryOnProduct && (
        <VirtualTryOnModal
          product={activeTryOnProduct}
          allProducts={products}
          onSelectProduct={(p) => setActiveTryOnProduct(p)}
          onClose={() => setActiveTryOnProduct(null)}
          onAddToCart={(size, color) => handleAddToCart(activeTryOnProduct, size, color)}
        />
      )}

      {/* 2. Product Detail Modal with Multi-Photo Detail Gallery & Wishlist */}
      {selectedDetailProduct && (
        <ProductDetailModal
          product={selectedDetailProduct}
          isFavorited={wishlist.some((p) => p.id === selectedDetailProduct.id)}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedDetailProduct(null)}
          onOpenTryOn={(p) => setActiveTryOnProduct(p)}
          onAddToCart={(p, size, color) => handleAddToCart(p, size, color)}
          onInstantBuy={(p, size, color) => handleInstantBuy(p, size, color)}
        />
      )}

      {/* 3. Slide-Out Shopping Bag Cart Drawer with 'My Favorites' Section */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cart}
        wishlist={wishlist}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onRemoveFavorite={handleRemoveFavorite}
        onMoveFavoriteToBag={handleMoveFavoriteToBag}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* 4. Checkout Modal with Delivery Form, Instructions & Payment */}
      {isCheckoutOpen && (
        <CheckoutModal
          items={cart}
          subtotal={cartSubtotal}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderPlaced={handleOrderPlaced}
        />
      )}

      {/* 5. Live Order Tracker Modal */}
      {isOrderTrackerOpen && (
        <OrderTrackerModal
          orders={orders}
          onClose={() => setIsOrderTrackerOpen(false)}
        />
      )}

      {/* 6. Admin Panel with Inventory Management (Only opens via /admin link) */}
      {isAdminOpen && (
        <AdminPanel
          products={products}
          orders={orders}
          onUpdateProducts={(updated) => {
            setProducts(updated);
            saveStoredProducts(updated);
          }}
          onUpdateOrders={(updated) => {
            setOrders(updated);
            saveStoredOrders(updated);
          }}
          onClose={handleCloseAdmin}
        />
      )}

    </div>
  );
}
