import React, { useState } from 'react';
import { Product } from '../types';
import { Heart, Camera, ShoppingBag, Check, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isFavorited: boolean;
  onToggleFavorite: (product: Product) => void;
  onSelect: (product: Product) => void;
  onOpenTryOn: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorited,
  onToggleFavorite,
  onSelect,
  onOpenTryOn,
  onQuickAdd,
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(product);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative flex flex-col bg-white rounded-2xl border border-neutral-200/90 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-3/4 sm:aspect-4/3 w-full bg-neutral-100 overflow-hidden flex items-center justify-center">
        <img
          src={images[currentImageIndex] || product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Persistent Wishlist Heart Button (Top Right) */}
        <button
          onClick={handleHeartClick}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full transition-all duration-200 ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 shadow-sm border border-rose-200 scale-105'
              : 'bg-white/85 text-neutral-500 hover:text-neutral-900 hover:bg-white shadow-xs border border-neutral-200/60'
          }`}
          title={isFavorited ? 'Remove from Favorites' : 'Save to Favorites'}
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-125 ${
              isFavorited ? 'fill-rose-500 text-rose-500' : 'text-neutral-600'
            }`}
          />
        </button>

        {/* Multi-Photo Detail Thumbnail Dots */}
        {images.length > 1 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
          >
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentImageIndex === idx ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'
                }`}
                title={`View Photo ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Quick action bar on mobile & desktop (3D view removed, clean Try On & Quick Add) */}
        <div
          className="absolute inset-x-2 bottom-2 z-10 flex items-center justify-center gap-1.5 transition-all duration-200 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0"
        >
          {/* Detail Photos / Inspect Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex-1 px-3 py-2 bg-white/95 hover:bg-white text-neutral-900 text-xs font-semibold rounded-xl shadow-sm border border-neutral-200/80 flex items-center justify-center gap-1.5 backdrop-blur-xs transition-colors min-h-[38px]"
            title="Inspect Details & Fabric Photos"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-700" />
            <span>Details</span>
          </button>

          {/* Virtual Try-On Camera Launch Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTryOn(product);
            }}
            className="flex-1 px-3 py-2 bg-neutral-900/95 hover:bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center justify-center gap-1.5 backdrop-blur-xs transition-colors min-h-[38px]"
            title="Open camera virtual try-on"
          >
            <Camera className="w-3.5 h-3.5 text-neutral-300" />
            <span>Try On</span>
          </button>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAddClick}
            className={`p-2 rounded-xl shadow-sm border text-xs font-medium transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
              justAdded
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white hover:bg-neutral-100 text-neutral-900 border-neutral-200'
            }`}
            title="Quick add to bag"
            aria-label="Quick Add"
          >
            {justAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Clean Unboxed Metadata */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-neutral-500 mb-1">
            <span className="uppercase font-medium tracking-wider">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span className={product.stock <= 5 && product.stock > 0 ? 'text-amber-600 font-medium' : ''}>
              {product.stock <= 5 && product.stock > 0
                ? `Only ${product.stock} left`
                : product.stock === 0
                ? 'Out of stock'
                : 'In stock'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Price & Color indicator dots */}
        <div className="flex items-center justify-between mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-neutral-100">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-neutral-900 tabular-nums">
              ${product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-neutral-400 line-through tabular-nums">
                ${product.originalPrice}
              </span>
            )}
          </div>

          {/* Color preview dots */}
          <div className="flex items-center gap-1">
            {product.colors.slice(0, 3).map((col) => (
              <span
                key={col.name}
                className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-[10px] text-neutral-400 font-mono">
                +{product.colors.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
