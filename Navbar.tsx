import React, { useState } from 'react';
import { ShoppingBag, Search, X, Package, Menu, Heart } from 'lucide-react';
import { ProductCategory } from '../types';
import { Logo } from './Logo';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: (initialTab?: 'bag' | 'favorites') => void;
  onSelectCategory: (cat: ProductCategory) => void;
  selectedCategory: ProductCategory;
  onOpenOrderTracker: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onSelectCategory,
  selectedCategory,
  onOpenOrderTracker,
  searchQuery,
  onSearchChange,
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories: { label: string; value: ProductCategory }[] = [
    { label: 'All Pieces', value: 'All' },
    { label: 'Girls 3pc & 2pc', value: 'Girls 3pc & 2pc' },
    { label: 'Apparel', value: 'Clothes' },
    { label: 'Shawls', value: 'Shawls & Wraps' },
    { label: 'Bags', value: 'Bags' },
    { label: 'Caps', value: 'Caps & Headwear' },
  ];

  const handleSearchInput = (val: string) => {
    onSearchChange(val);
    const cleaned = val.trim().toLowerCase();
    // If user explicitly types /admin in search, redirect to /admin URL
    if (cleaned === '/admin' || cleaned === 'admin') {
      window.location.hash = 'admin';
      onSearchChange('');
      setIsSearchActive(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/90 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Logo Monogram & Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory('All');
            setMobileMenuOpen(false);
          }}
          className="whitespace-nowrap shrink-0 group transition-transform duration-200 hover:scale-[1.01]"
        >
          <Logo size="md" />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-neutral-600">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => onSelectCategory(c.value)}
              className={`hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                selectedCategory === c.value
                  ? 'border-neutral-900 text-neutral-900 font-semibold'
                  : 'border-transparent text-neutral-500'
              }`}
            >
              {c.label}
            </button>
          ))}
        </nav>

        {/* Right Actions: Search, Wishlist Favorites, Order Tracker, Bag */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Search bar / trigger */}
          <div className="relative flex items-center">
            {isSearchActive ? (
              <div className="flex items-center gap-1.5 bg-neutral-100 rounded-lg px-2.5 py-1.5 border border-neutral-200 animate-in fade-in duration-200">
                <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search item..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="w-28 sm:w-44 text-xs bg-transparent focus:outline-none text-neutral-900 placeholder:text-neutral-400 font-medium"
                />
                <button
                  onClick={() => {
                    setIsSearchActive(false);
                    onSearchChange('');
                  }}
                  className="text-neutral-400 hover:text-neutral-800 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchActive(true)}
                className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                title="Search products"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Track Order Button */}
          <button
            onClick={onOpenOrderTracker}
            className="px-2.5 py-1.5 min-h-[40px] text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Track Order Status"
          >
            <Package className="w-3.5 h-3.5 text-neutral-600" />
            <span className="hidden md:inline">Track Order</span>
          </button>

          {/* Wishlist Favorites Heart Button */}
          <button
            onClick={() => onOpenCart('favorites')}
            className={`relative p-2 min-h-[40px] min-w-[40px] rounded-lg transition-colors flex items-center justify-center border ${
              wishlistCount > 0
                ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                : 'text-neutral-600 border-neutral-200 hover:bg-neutral-100'
            }`}
            title="My Favorites / Wishlist"
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Bag Button */}
          <button
            onClick={() => onOpenCart('bag')}
            className="relative px-3 py-1.5 sm:px-3.5 sm:py-2 min-h-[40px] bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 sm:gap-2 transition-all shadow-xs"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="tabular-nums font-bold text-white bg-neutral-800 px-1.5 py-0.2 rounded-full text-[10px]">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-neutral-700 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Collapsible Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
            Collections
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => {
                  onSelectCategory(c.value);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-left rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === c.value
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <button
              onClick={() => {
                onOpenOrderTracker();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-neutral-800 font-medium py-1"
            >
              <Package className="w-4 h-4 text-neutral-600" />
              <span>Track Existing Order</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Fast Horizontal Category Pills Bar */}
      <div className="lg:hidden px-3 py-2 bg-neutral-50/80 border-t border-neutral-200/60 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => onSelectCategory(c.value)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-all ${
              selectedCategory === c.value
                ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                : 'bg-white text-neutral-600 border border-neutral-200/80 hover:bg-neutral-100'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </header>
  );
};
