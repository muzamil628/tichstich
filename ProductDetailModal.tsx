import React, { useState } from 'react';
import { Product } from '../types';
import { X, Camera, ShoppingBag, Check, ShieldCheck, Truck, Heart, ZoomIn } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  isFavorited: boolean;
  onToggleFavorite: (product: Product) => void;
  onClose: () => void;
  onOpenTryOn: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }) => void;
  onInstantBuy: (product: Product, size: string, color: { name: string; hex: string }) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isFavorited,
  onToggleFavorite,
  onClose,
  onOpenTryOn,
  onAddToCart,
  onInstantBuy,
}) => {
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'Default', hex: '#E4E4E7' });
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'Standard');
  const [addedSuccess, setAddedSuccess] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1600);
  };

  const handleBuyNow = () => {
    onInstantBuy(product, selectedSize, selectedColor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Top Control Buttons (Close & Favorite) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(product)}
            className={`p-2.5 rounded-full backdrop-blur-xs transition-colors shadow-sm ${
              isFavorited
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-white/85 text-neutral-600 hover:text-neutral-900 border border-neutral-200/80 hover:bg-white'
            }`}
            title={isFavorited ? 'Saved in My Favorites' : 'Add to Favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 text-neutral-400 hover:text-neutral-900 rounded-full bg-white/85 hover:bg-white border border-neutral-200/80 backdrop-blur-xs transition-colors shadow-sm"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Left: High-Res Detail Photo Gallery */}
        <div className="w-full md:w-1/2 bg-neutral-100 relative flex flex-col justify-between overflow-hidden">
          
          {/* Active Main Photo Display */}
          <div className="relative aspect-4/3 md:h-[460px] w-full overflow-hidden bg-neutral-100 flex items-center justify-center">
            <img
              src={images[activeImageIndex] || product.image}
              alt={`${product.name} detail`}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Photo Label Indicator */}
            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-xs text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md">
              {activeImageIndex === 0 ? 'Full Garment View' : `Macro Detail ${activeImageIndex + 1}`}
            </div>
          </div>

          {/* Thumbnail Gallery & Virtual Try-On Bar */}
          <div className="p-3 bg-white/95 border-t border-neutral-200 flex items-center justify-between gap-3">
            
            {/* Gallery Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-neutral-900 scale-105 shadow-sm'
                      : 'border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Camera Virtual Try-On CTA */}
            <button
              onClick={() => onOpenTryOn(product)}
              className="py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all shrink-0"
              title="Test fit using live webcam"
            >
              <Camera className="w-4 h-4 text-neutral-300" />
              <span>Camera Try-On</span>
            </button>
          </div>

        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-5">
          <div>
            {/* Header metadata */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <span className="uppercase font-medium tracking-wider">{product.category}</span>
              <span>·</span>
              <span className="font-mono">{product.sku}</span>
              <span>·</span>
              <span className={product.stock <= 5 && product.stock > 0 ? 'text-amber-600 font-semibold' : 'text-emerald-700 font-medium'}>
                {product.stock <= 5 && product.stock > 0
                  ? `Only ${product.stock} items in stock`
                  : product.stock === 0
                  ? 'Out of stock'
                  : 'In Stock · Ready to dispatch'}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 font-display leading-tight">
              {product.name}
            </h2>

            {/* Pricing */}
            <div className="flex items-center gap-2.5 mt-2">
              <span className="text-xl font-bold text-neutral-900 tabular-nums">
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-neutral-400 line-through tabular-nums">
                  ${product.originalPrice}
                </span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Save ${product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-neutral-600 leading-relaxed mt-3">
              {product.description}
            </p>

            {/* Color Selector */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-700">Selected Finish / Color:</span>
                <span className="text-neutral-500 font-medium">{selectedColor.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full border transition-all ${
                      selectedColor.name === c.name
                        ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110 border-transparent'
                        : 'border-neutral-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-700">Select Size:</span>
                <span className="text-neutral-400">Regular tailored fit</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      selectedSize === sz
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Craftsmanship Bullet Points */}
            <div className="mt-5 pt-4 border-t border-neutral-100">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2">
                Craftsmanship & Macro Specifications
              </span>
              <ul className="text-xs text-neutral-600 space-y-1">
                {product.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-neutral-400 shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-neutral-100 space-y-2.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  addedSuccess
                    ? 'bg-emerald-700 text-white'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="py-3 px-5 border border-neutral-300 hover:bg-neutral-50 rounded-xl text-xs font-semibold text-neutral-900 transition-colors"
              >
                Buy Now
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-neutral-400" />
                COD & Online Payment Available
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                Complimentary 30-Day Returns
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
