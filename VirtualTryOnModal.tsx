import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Product, TryOnType } from '../types';
import {
  Camera,
  RefreshCw,
  Sparkles,
  Download,
  X,
  Sliders,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  ShoppingBag,
  Eye,
  Info,
} from 'lucide-react';

// Photorealistic AR Filter Garment Overlays
import arHoodie from '../assets/images/ar_hoodie_overlay_1793884874075.jpg';
import arSilkSuit from '../assets/images/ar_silk_suit_overlay_1793884896671.jpg';
import arCashmereShawl from '../assets/images/ar_cashmere_shawl_1793884911150.jpg';
import arCoordTop from '../assets/images/ar_coord_top_1793884966515.jpg';
import arCap from '../assets/images/ar_cap_cutout_1793884952843.jpg';
import arTote from '../assets/images/ar_tote_cutout_1793884987157.jpg';

interface VirtualTryOnModalProps {
  product: Product;
  allProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
  onClose: () => void;
  onAddToCart?: (size: string, color: { name: string; hex: string }) => void;
}

interface ARConfig {
  src: string;
  type: TryOnType;
  yOffsetFactor: number;
  widthFactor: number;
  label: string;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({
  product,
  allProducts = [],
  onSelectProduct,
  onClose,
  onAddToCart,
}) => {
  const [currentProduct, setCurrentProduct] = useState<Product>(product);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera & Stream states
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMirror, setIsMirror] = useState<boolean>(true);
  const [autoTracking, setAutoTracking] = useState<boolean>(true);
  const [trackingConfidence, setTrackingConfidence] = useState<number>(96);

  // Garment Customization & Fit
  const [selectedColor, setSelectedColor] = useState(
    currentProduct.colors[0] || { name: 'Chalk White', hex: '#F4F4F5' }
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    currentProduct.sizes[0] || 'M'
  );
  const [fitScale, setFitScale] = useState<number>(1.0); // Size multiplier
  const [offsetY, setOffsetY] = useState<number>(0);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [blendMode, setBlendMode] = useState<'realistic' | 'vibrant'>('realistic');

  // UI state
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [showAdjustments, setShowAdjustments] = useState<boolean>(false);

  // Dynamic smoothed tracking coordinates
  const trackedX = useRef<number>(640);
  const trackedY = useRef<number>(240);
  const trackedW = useRef<number>(220);

  // Cached processed transparent garment sprites
  const spriteCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const [spriteReadyKey, setSpriteReadyKey] = useState<string>('');

  // Update product if prop changes
  useEffect(() => {
    setCurrentProduct(product);
    setSelectedColor(product.colors[0] || { name: 'Chalk White', hex: '#F4F4F5' });
    setSelectedSize(product.sizes[0] || 'M');
  }, [product]);

  // Map product to realistic AR garment config
  const arConfig = useMemo<ARConfig>(() => {
    const id = currentProduct.id;
    const type = currentProduct.tryonType;

    if (type === 'headwear' || currentProduct.category === 'Caps & Headwear') {
      return {
        src: arCap,
        type: 'headwear',
        yOffsetFactor: -0.55,
        widthFactor: 1.25,
        label: 'Wool Architectural Cap',
      };
    }
    if (type === 'accessory' || currentProduct.category === 'Bags') {
      return {
        src: arTote,
        type: 'accessory',
        yOffsetFactor: 0.95,
        widthFactor: 1.35,
        label: 'Architectural Leather Tote',
      };
    }
    if (id === 'prod-w1' || id === 'prod-w3') {
      return {
        src: arSilkSuit,
        type: 'shawl_wrap',
        yOffsetFactor: 0.30,
        widthFactor: 2.85,
        label: 'Raw Silk 3pc Ensemble & Draped Shawl',
      };
    }
    if (id === 'prod-w2' || id === 'prod-w4') {
      return {
        src: arCoordTop,
        type: 'upper_body',
        yOffsetFactor: 0.35,
        widthFactor: 2.65,
        label: 'Structured 2pc Drape Tunic',
      };
    }
    if (id === 'prod-2' || type === 'shawl_wrap') {
      return {
        src: arCashmereShawl,
        type: 'shawl_wrap',
        yOffsetFactor: 0.28,
        widthFactor: 2.95,
        label: 'Handwoven Cashmere Sahwal Drape',
      };
    }

    // Default: Heavyweight Hoodie
    return {
      src: arHoodie,
      type: 'upper_body',
      yOffsetFactor: 0.34,
      widthFactor: 2.85,
      label: 'Heavyweight Cotton Hoodie',
    };
  }, [currentProduct]);

  // Pre-process garment sprite: remove background and apply realistic textile tint
  useEffect(() => {
    const cacheKey = `${arConfig.src}_${selectedColor.hex}_${blendMode}`;
    if (spriteCache.current.has(cacheKey)) {
      setSpriteReadyKey(cacheKey);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = arConfig.src;

    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      const offCanvas = document.createElement('canvas');
      offCanvas.width = w;
      offCanvas.height = h;
      const ctx = offCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Smart background removal: key out studio white background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Neutral studio white check
        const isPureWhite =
          r >= 242 &&
          g >= 242 &&
          b >= 242 &&
          Math.abs(r - g) <= 6 &&
          Math.abs(g - b) <= 6;

        const isNearWhite =
          r >= 226 &&
          g >= 226 &&
          b >= 226 &&
          Math.abs(r - g) <= 8 &&
          Math.abs(g - b) <= 8;

        if (isPureWhite) {
          data[i + 3] = 0; // Transparent
        } else if (isNearWhite) {
          // Feathered antialiased edge
          const minVal = Math.min(r, g, b);
          const factor = Math.max(0, 1 - (minVal - 226) / 16);
          data[i + 3] = Math.round(data[i + 3] * factor);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Realistic fabric tinting while preserving creases, shadows and woven texture
      const isBaseTonal =
        selectedColor.hex === '#F4F4F5' ||
        selectedColor.hex === '#FAF9F6' ||
        selectedColor.hex === '#F8FAFC';

      if (!isBaseTonal) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = selectedColor.hex;
        ctx.globalAlpha = blendMode === 'realistic' ? 0.65 : 0.85;
        ctx.fillRect(0, 0, w, h);

        // Highlight recovery pass
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.18;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
      }

      spriteCache.current.set(cacheKey, offCanvas);
      setSpriteReadyKey(cacheKey);
    };
  }, [arConfig.src, selectedColor.hex, blendMode]);

  // Size scale map
  useEffect(() => {
    if (selectedSize === 'XS') setFitScale(0.88);
    else if (selectedSize === 'S') setFitScale(0.94);
    else if (selectedSize === 'M') setFitScale(1.0);
    else if (selectedSize === 'L') setFitScale(1.08);
    else if (selectedSize === 'XL') setFitScale(1.18);
  }, [selectedSize]);

  // Start webcam
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err: any) {
      console.warn('Webcam access error:', err);
      setCameraError('Camera access unavailable or declined. Studio Mirror Mode active.');
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Web Audio Synthetic Camera Shutter
  const playShutterSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      // Audio not supported or blocked
    }
  };

  // Main AR Rendering Loop
  useEffect(() => {
    let animId: number;

    // Create tracker offscreen canvas if needed
    if (!trackerCanvasRef.current) {
      const tc = document.createElement('canvas');
      tc.width = 160;
      tc.height = 120;
      trackerCanvasRef.current = tc;
    }

    const renderLoop = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Camera Feed or Studio Mannequin Stage
      if (streamActive && video && video.readyState >= 2) {
        ctx.save();
        if (isMirror) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();

        // 2. Real-Time Optical Body & Face Tracking
        if (autoTracking && trackerCanvasRef.current) {
          const tCanvas = trackerCanvasRef.current;
          const tCtx = tCanvas.getContext('2d', { willReadFrequently: true });
          if (tCtx) {
            tCtx.drawImage(video, 0, 0, 160, 120);
            const frame = tCtx.getImageData(0, 0, 160, 120);
            const d = frame.data;

            // Find skin tone / upper body centroid
            let sumX = 0;
            let sumY = 0;
            let count = 0;
            let minX = 160;
            let maxX = 0;
            let minY = 120;
            let maxY = 0;

            // Inspect upper 65% of the frame
            for (let y = 10; y < 80; y += 2) {
              for (let x = 15; x < 145; x += 2) {
                const idx = (y * 160 + x) * 4;
                const r = d[idx];
                const g = d[idx + 1];
                const b = d[idx + 2];

                // Skin tone heuristic filter
                if (
                  r > 80 &&
                  g > 40 &&
                  b > 25 &&
                  r > g &&
                  r > b &&
                  r - g > 10 &&
                  r - b > 15
                ) {
                  sumX += x;
                  sumY += y;
                  count++;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }

            if (count > 45) {
              let avgX = sumX / count;
              let avgY = sumY / count;
              let detectedW = (maxX - minX) * 1.35;

              // Mirror correction
              if (isMirror) {
                avgX = 160 - avgX;
              }

              const targetX = (avgX / 160) * w;
              const targetY = (avgY / 120) * h;
              const targetW = Math.max(160, Math.min(380, (detectedW / 160) * w));

              // Smooth Exponential Moving Average (EMA) to eliminate jitter
              trackedX.current += (targetX - trackedX.current) * 0.22;
              trackedY.current += (targetY - trackedY.current) * 0.22;
              trackedW.current += (targetW - trackedW.current) * 0.16;

              setTrackingConfidence(98);
            } else {
              // Smoothly settle toward center
              trackedX.current += (w / 2 - trackedX.current) * 0.08;
              trackedY.current += (h * 0.32 - trackedY.current) * 0.08;
              setTrackingConfidence(88);
            }
          }
        }
      } else {
        // Studio Mirror Fallback with Luxury Stage
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#ECEEF1');
        grad.addColorStop(0.5, '#E2E5EA');
        grad.addColorStop(1, '#D4D8DE');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Soft studio spotlight
        const spot = ctx.createRadialGradient(w / 2, h * 0.35, 40, w / 2, h * 0.5, 420);
        spot.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        spot.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, w, h);

        // Minimalist Mannequin Silhouette
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        // Head
        ctx.arc(w / 2, h * 0.24, 62, 0, Math.PI * 2);
        ctx.fill();
        // Neck & Shoulders
        ctx.beginPath();
        ctx.moveTo(w / 2 - 32, h * 0.32);
        ctx.lineTo(w / 2 - 130, h * 0.44);
        ctx.quadraticCurveTo(w / 2, h * 0.38, w / 2 + 130, h * 0.44);
        ctx.lineTo(w / 2 + 32, h * 0.32);
        ctx.closePath();
        ctx.fill();

        // Subtle studio breathing movement
        const time = Date.now() * 0.002;
        trackedX.current = w / 2;
        trackedY.current = h * 0.28 + Math.sin(time) * 2;
        trackedW.current = 200;
      }

      // 3. Render High-Resolution AR Garment Filter Overlay
      const currentKey = `${arConfig.src}_${selectedColor.hex}_${blendMode}`;
      const sprite = spriteCache.current.get(currentKey);

      if (sprite) {
        ctx.save();

        const baseFaceX = trackedX.current;
        const baseFaceY = trackedY.current;
        const faceWidth = trackedW.current;

        // Dynamic positioning based on garment type
        const gWidth = faceWidth * arConfig.widthFactor * fitScale;
        const gHeight = gWidth * (sprite.height / sprite.width);
        const gX = baseFaceX - gWidth / 2 + offsetX;
        const gY = baseFaceY + faceWidth * arConfig.yOffsetFactor + offsetY;

        // Organic micro-movement (cloth breathing)
        const time = Date.now() * 0.0018;
        const microSway = Math.sin(time) * 1.5;

        // Draw soft ambient drop shadow beneath garment
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 12;
        ctx.drawImage(sprite, gX, gY + microSway, gWidth, gHeight);
        ctx.restore();

        // Draw pristine garment
        ctx.drawImage(sprite, gX, gY + microSway, gWidth, gHeight);

        ctx.restore();
      }

      // 4. Subtle AR Filter HUD Reticle (Only active during camera tracking)
      if (streamActive && autoTracking) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);

        const fx = trackedX.current;
        const fy = trackedY.current;
        const fw = trackedW.current;

        // Neckline anchor tick
        ctx.beginPath();
        ctx.arc(fx, fy + fw * 0.35 + offsetY, 4, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    streamActive,
    isMirror,
    autoTracking,
    arConfig,
    selectedColor,
    fitScale,
    offsetY,
    offsetX,
    blendMode,
    spriteReadyKey,
  ]);

  // Take Snapshot
  const handleTakeSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    playShutterSound();
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 160);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.96);
    setCapturedSnapshot(dataUrl);
  };

  const handleDownloadSnapshot = () => {
    if (!capturedSnapshot) return;
    const link = document.createElement('a');
    link.download = `tichstich-ar-tryon-${currentProduct.sku.toLowerCase()}.jpg`;
    link.href = capturedSnapshot;
    link.click();
  };

  const handleSelectAnotherProduct = (p: Product) => {
    setCurrentProduct(p);
    setSelectedColor(p.colors[0] || { name: 'Default', hex: '#F4F4F5' });
    setSelectedSize(p.sizes[0] || 'M');
    if (onSelectProduct) {
      onSelectProduct(p);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-1.5 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[95vh] bg-neutral-950 text-neutral-100 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col shadow-2xl">
        
        {/* Shutter White Flash Effect */}
        {isFlashActive && (
          <div className="absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-150" />
        )}

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-neutral-900/90 border-b border-neutral-800 z-30 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs uppercase font-bold tracking-wider text-neutral-300">
              AR Clothing Mirror
            </span>
            <span className="text-xs text-neutral-600 hidden sm:inline">·</span>
            <span className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-md">
              {currentProduct.name}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {streamActive && (
              <span className="hidden sm:inline-flex text-[11px] font-medium text-emerald-400 items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                AR Fit Locked ({trackingConfidence}%)
              </span>
            )}

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              title="Close Try-On"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Canvas & Video Viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          
          {/* Hidden Webcam Source Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="hidden"
            onLoadedMetadata={() => {
              if (videoRef.current && canvasRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth || 1280;
                canvasRef.current.height = videoRef.current.videoHeight || 720;
              }
            }}
          />

          {/* Interactive Rendering Canvas */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="w-full h-full object-contain"
          />

          {/* Camera Permission Alert Banner */}
          {cameraError && !streamActive && (
            <div className="absolute top-4 left-4 z-20 max-w-sm bg-neutral-900/95 border border-neutral-800 p-3.5 rounded-xl text-xs text-neutral-300 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 font-semibold text-white mb-1">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Studio Mirror Mode Active</span>
              </div>
              <p className="text-[11px] text-neutral-400 mb-3 leading-relaxed">
                Camera access was declined or unavailable. The garment is rendered on the high-fashion studio mannequin with live size and color customization.
              </p>
              <button
                onClick={startCamera}
                className="px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors"
              >
                Enable Camera
              </button>
            </div>
          )}

          {/* Floating Live Adjustment Controls (Top-Right Overlay) */}
          <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
            <button
              onClick={() => setShowAdjustments((prev) => !prev)}
              className="px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-200 rounded-xl text-xs font-medium border border-neutral-800 backdrop-blur-md flex items-center gap-2 shadow-lg transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              <span>{showAdjustments ? 'Hide Nudge Controls' : 'Fine-Tune Fit'}</span>
            </button>

            {showAdjustments && (
              <div className="bg-neutral-900/95 border border-neutral-800 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs text-neutral-300 space-y-3 w-56 animate-in fade-in slide-in-from-top-2">
                
                {/* Position Nudge */}
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block mb-1.5">
                    Position Nudge
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setOffsetY((prev) => prev - 8)}
                      className="py-1 px-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] flex items-center justify-center gap-1"
                    >
                      <ChevronUp className="w-3.5 h-3.5" /> Up
                    </button>
                    <button
                      onClick={() => setOffsetY((prev) => prev + 8)}
                      className="py-1 px-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] flex items-center justify-center gap-1"
                    >
                      <ChevronDown className="w-3.5 h-3.5" /> Down
                    </button>
                    <button
                      onClick={() => setOffsetX((prev) => prev - 8)}
                      className="py-1 px-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] flex items-center justify-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Left
                    </button>
                    <button
                      onClick={() => setOffsetX((prev) => prev + 8)}
                      className="py-1 px-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] flex items-center justify-center gap-1"
                    >
                      <ChevronRight className="w-3.5 h-3.5" /> Right
                    </button>
                  </div>
                </div>

                {/* Tracking & Mirror Toggles */}
                <div className="pt-2 border-t border-neutral-800 space-y-2">
                  <label className="flex items-center justify-between text-[11px] cursor-pointer">
                    <span>Auto-Follow Body</span>
                    <input
                      type="checkbox"
                      checked={autoTracking}
                      onChange={(e) => setAutoTracking(e.target.checked)}
                      className="rounded accent-white"
                    />
                  </label>
                  <label className="flex items-center justify-between text-[11px] cursor-pointer">
                    <span>Mirror Selfie View</span>
                    <input
                      type="checkbox"
                      checked={isMirror}
                      onChange={(e) => setIsMirror(e.target.checked)}
                      className="rounded accent-white"
                    />
                  </label>
                </div>

                {/* Reset button */}
                <button
                  onClick={() => {
                    setOffsetX(0);
                    setOffsetY(0);
                    setFitScale(1.0);
                  }}
                  className="w-full py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Alignment</span>
                </button>
              </div>
            )}
          </div>

          {/* Captured Snapshot Modal Flash Overlay */}
          {capturedSnapshot && (
            <div className="absolute inset-0 z-40 bg-neutral-950/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col items-center text-center">
                <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden border border-neutral-800 shadow-md mb-3 bg-black">
                  <img
                    src={capturedSnapshot}
                    alt="AR Try-On Snapshot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-neutral-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                    TICHSTICH AR
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-white mb-0.5">Snapshot Ready</h4>
                <p className="text-xs text-neutral-400 mb-4">
                  Wearing {currentProduct.name} ({selectedSize}) in {selectedColor.name}
                </p>

                <div className="flex items-center gap-2.5 w-full">
                  <button
                    onClick={handleDownloadSnapshot}
                    className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-white text-neutral-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Photo</span>
                  </button>
                  <button
                    onClick={() => setCapturedSnapshot(null)}
                    className="py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium transition-colors"
                  >
                    Back to Mirror
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Quick Switch Outfit Carousel Strip */}
        {allProducts.length > 0 && (
          <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-850 overflow-x-auto no-scrollbar flex items-center gap-2.5 shrink-0 z-20">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 whitespace-nowrap pr-1">
              Try Another Piece:
            </span>
            {allProducts.map((p) => {
              const isSelected = p.id === currentProduct.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectAnotherProduct(p)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? 'bg-white text-neutral-950 font-bold border-white shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-850'
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-5 h-5 rounded-md object-cover"
                  />
                  <span className="truncate max-w-[120px] sm:max-w-[150px]">{p.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Interactive Control Deck */}
        <div className="p-3 sm:p-4 bg-neutral-900 border-t border-neutral-800 z-30 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 shrink-0">
          
          {/* Size & Color Swatches */}
          <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
            
            {/* Size Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Fit:
              </span>
              {(currentProduct.sizes.length > 0
                ? currentProduct.sizes
                : ['XS', 'S', 'M', 'L', 'XL']
              ).slice(0, 5).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-7 h-7 px-2 text-xs font-semibold rounded-lg transition-all ${
                    selectedSize === sz
                      ? 'bg-white text-neutral-950 shadow-md font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Live Color Tint Selector */}
            <div className="flex items-center gap-1.5 pl-3 border-l border-neutral-800">
              <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
                Color:
              </span>
              <div className="flex items-center gap-1.5">
                {currentProduct.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    title={c.name}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      selectedColor.name === c.name
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110 border-transparent shadow'
                        : 'border-neutral-700 hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={handleTakeSnapshot}
              className="px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-neutral-700 shadow-sm"
              title="Capture High-Res Photo"
            >
              <Camera className="w-4 h-4 text-neutral-300" />
              <span>Snapshot</span>
            </button>

            <button
              onClick={() => {
                if (onAddToCart) {
                  onAddToCart(selectedSize, selectedColor);
                  stopCamera();
                  onClose();
                }
              }}
              className="flex-1 md:flex-none px-6 py-2.5 bg-white hover:bg-neutral-100 text-neutral-950 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Bag · ${currentProduct.price}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
