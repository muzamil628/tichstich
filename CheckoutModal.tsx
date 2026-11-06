import React, { useState, useEffect, useRef } from 'react';
import { CartItem, DeliveryInfo, Order, PaymentMethod } from '../types';
import { X, Check, Truck, CreditCard, Banknote, ShieldCheck, ArrowRight, Printer, Sparkles, MapPin, FileText, ChevronRight } from 'lucide-react';

interface CheckoutModalProps {
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  subtotal,
  onClose,
  onOrderPlaced,
}) => {
  const [step, setStep] = useState<'delivery' | 'payment' | 'processing' | 'confirmed'>('delivery');
  
  // Delivery form state
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    suiteOrApt: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: 'United States',
    shippingInstructions: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [cardInfo, setCardInfo] = useState({
    number: '4242 •••• •••• 4242',
    name: '',
    expiry: '12/28',
    cvv: '888',
  });

  // Confirmed order data
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Confetti canvas ref for smooth celebration animation
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  const shippingFee = subtotal >= 150 ? 0 : 15;
  const total = subtotal + shippingFee;

  const validateDeliveryForm = () => {
    const errors: Record<string, string> = {};
    if (!delivery.fullName.trim()) errors.fullName = 'Full name is required';
    if (!delivery.phone.trim()) errors.phone = 'Phone number is required for shipping updates';
    if (!delivery.email.trim()) errors.email = 'Email is required for order receipt';
    if (!delivery.addressLine1.trim()) errors.addressLine1 = 'Street address is required';
    if (!delivery.city.trim()) errors.city = 'City is required';
    if (!delivery.postalCode.trim()) errors.postalCode = 'Postal / ZIP code is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDeliveryForm()) {
      setStep('payment');
    }
  };

  const handlePlaceOrder = () => {
    setStep('processing');

    setTimeout(() => {
      const orderNum = `TS-${Math.floor(1000 + Math.random() * 9000)}`;
      const randomTrk = `TRK-${Math.floor(1000 + Math.random() * 9000)}-EXP`;
      
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: orderNum,
        date: new Date().toISOString(),
        items: [...items],
        subtotal,
        shippingFee,
        discount: 0,
        total,
        deliveryInfo: { ...delivery },
        paymentMethod,
        paymentDetails: paymentMethod === 'online' ? {
          cardBrand: 'Visa',
          last4: '4242',
          transactionId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        } : undefined,
        status: 'pending',
        estimatedDelivery: '3 to 5 business days',
        trackingNumber: randomTrk,
      };

      setConfirmedOrder(newOrder);
      onOrderPlaced(newOrder);
      setStep('confirmed');
    }, 1400);
  };

  // Run smooth celebratory particle animation when order confirmed
  useEffect(() => {
    if (step !== 'confirmed') return;

    const canvas = confettiCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      vRot: number;
    }> = [];

    const colors = ['#18181B', '#71717A', '#A1A1AA', '#E4E4E7', '#3F3F46'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height * 0.35,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 9 - 4,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }

    let animId: number;
    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.rotation += p.vRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      if (particles.some((p) => p.y < canvas.height + 20)) {
        animId = requestAnimationFrame(animateParticles);
      }
    };

    animId = requestAnimationFrame(animateParticles);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Checkout & Dispatch
            </span>
            {step !== 'confirmed' && (
              <span className="text-xs text-neutral-400">· Step {step === 'delivery' ? '1 of 2' : '2 of 2'}</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: DELIVERY ADDRESS & SPECIFIC SHIPPING INSTRUCTIONS */}
          {step === 'delivery' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-600" />
                  Delivery Address & Instructions
                </h3>
                <span className="text-xs text-neutral-500 tabular-nums">
                  {items.length} {items.length === 1 ? 'item' : 'items'} (${total})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Julian Vance"
                    value={delivery.fullName}
                    onChange={(e) => setDelivery({ ...delivery, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                  {formErrors.fullName && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Phone Number (for Courier & SMS Updates) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={delivery.phone}
                    onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                  {formErrors.phone && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Email Address (for Order Confirmation & Tracking) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="julian@example.com"
                    value={delivery.email}
                    onChange={(e) => setDelivery({ ...delivery, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                  {formErrors.email && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.email}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House / Building number, Street name"
                    value={delivery.addressLine1}
                    onChange={(e) => setDelivery({ ...delivery, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                  {formErrors.addressLine1 && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.addressLine1}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Apartment / Suite / Floor (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Apt 4B, 3rd Floor"
                    value={delivery.suiteOrApt}
                    onChange={(e) => setDelivery({ ...delivery, suiteOrApt: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="New York"
                    value={delivery.city}
                    onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                  {formErrors.city && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    placeholder="NY"
                    value={delivery.stateProvince}
                    onChange={(e) => setDelivery({ ...delivery, stateProvince: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Postal / ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10011"
                    value={delivery.postalCode}
                    onChange={(e) => setDelivery({ ...delivery, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all"
                  />
                  {formErrors.postalCode && <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.postalCode}</p>}
                </div>

                {/* SPECIFIC SHIPPING INSTRUCTIONS */}
                <div className="sm:col-span-2 pt-1">
                  <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-neutral-900">
                      <FileText className="w-3.5 h-3.5 text-neutral-500" />
                      Specific Shipping Instructions
                    </span>
                    <span className="text-[11px] text-neutral-400">Gate code, leave at door, call before delivery</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Doorman building. Leave with reception. Ring doorbell twice if leaving on porch. Gate code #4092."
                    value={delivery.shippingInstructions}
                    onChange={(e) => setDelivery({ ...delivery, shippingInstructions: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Return to Cart
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>Select Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD (COD OR ONLINE) */}
          {step === 'payment' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <h3 className="text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-neutral-600" />
                  Select Payment Method
                </h3>
                <button
                  onClick={() => setStep('delivery')}
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline"
                >
                  Edit Address
                </button>
              </div>

              {/* Payment Method Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-neutral-900 bg-neutral-50/70 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-neutral-200/60 rounded-lg text-neutral-800">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">Cash on Delivery</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'cod' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Pay securely in cash or mobile transfer upon physical package handover at your doorstep.
                  </p>
                </div>

                {/* Online Payment */}
                <div
                  onClick={() => setPaymentMethod('online')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'online'
                      ? 'border-neutral-900 bg-neutral-50/70 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-neutral-200/60 rounded-lg text-neutral-800">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">Online Card / UPI</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === 'online' ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300'
                    }`}>
                      {paymentMethod === 'online' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Instant verified digital checkout via Credit Card, Debit Card, or UPI with end-to-end encryption.
                  </p>
                </div>

              </div>

              {/* Online payment interactive simulator */}
              {paymentMethod === 'online' && (
                <div className="p-4 bg-neutral-900 text-white rounded-xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Instant Digital Card Gateway</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="col-span-2">
                      <label className="block text-[11px] text-neutral-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        readOnly
                        value={cardInfo.number}
                        className="w-full px-3 py-2 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Expires</label>
                      <input
                        type="text"
                        readOnly
                        value={cardInfo.expiry}
                        className="w-full px-3 py-2 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Security CVV</label>
                      <input
                        type="text"
                        readOnly
                        value={cardInfo.cvv}
                        className="w-full px-3 py-2 text-xs font-mono bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Review Summary */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-neutral-600 space-y-1">
                <div className="flex items-center justify-between font-medium text-neutral-900">
                  <span>Deliver to: {delivery.fullName}</span>
                  <span className="text-neutral-500">{delivery.phone}</span>
                </div>
                <p className="text-[11px] text-neutral-500">
                  {delivery.addressLine1} {delivery.suiteOrApt ? `, ${delivery.suiteOrApt}` : ''}, {delivery.city}, {delivery.postalCode}
                </p>
                {delivery.shippingInstructions && (
                  <p className="text-[11px] text-neutral-700 pt-1 border-t border-neutral-200/60 font-mono">
                    Instructions: "{delivery.shippingInstructions}"
                  </p>
                )}
              </div>

              {/* Order total & CTA */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 block">Total Due</span>
                  <span className="text-lg font-bold text-neutral-900 tabular-nums">
                    ${total}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep('delivery')}
                    className="px-3 py-2 text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-all shadow-md hover:scale-[1.01]"
                  >
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: SMOOTH PROCESSING STATE */}
          {step === 'processing' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" />
                <Truck className="w-6 h-6 text-neutral-900 absolute inset-0 m-auto" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900">
                Confirming Order & Generating Dispatch Docket...
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm">
                Allocating inventory, verifying delivery instructions, and reserving your handcrafted pieces.
              </p>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMED WITH SMOOTH CELEBRATION */}
          {step === 'confirmed' && confirmedOrder && (
            <div className="relative space-y-5 animate-in zoom-in-95 duration-300">
              {/* Confetti Particle Canvas */}
              <canvas
                ref={confettiCanvasRef}
                width={600}
                height={350}
                className="absolute inset-0 pointer-events-none w-full h-full z-10"
              />

              <div className="text-center space-y-2 pt-2">
                <div className="w-12 h-12 rounded-full bg-neutral-900 text-white mx-auto flex items-center justify-center shadow-lg">
                  <Check className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 font-display">
                  Order Successfully Placed
                </h3>
                <p className="text-xs text-neutral-600">
                  Confirmation receipt sent to <span className="font-semibold text-neutral-900">{confirmedOrder.deliveryInfo.email}</span>
                </p>
              </div>

              {/* Order Spec Card */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/90 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200 text-xs">
                  <span className="font-semibold text-neutral-900">
                    Order {confirmedOrder.orderNumber}
                  </span>
                  <span className="text-neutral-500 font-mono">
                    Tracking: {confirmedOrder.trackingNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-neutral-500 uppercase tracking-wider block">Estimated Delivery</span>
                    <span className="font-semibold text-neutral-900">{confirmedOrder.estimatedDelivery}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-500 uppercase tracking-wider block">Payment Method</span>
                    <span className="font-semibold text-neutral-900">
                      {confirmedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Verified)'}
                    </span>
                  </div>
                </div>

                {/* Delivery Address & Shipping Instructions Readout */}
                <div className="pt-2 border-t border-neutral-200/80 text-xs">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider block mb-0.5">Shipping Destination</span>
                  <p className="text-neutral-800">
                    {confirmedOrder.deliveryInfo.fullName} · {confirmedOrder.deliveryInfo.phone}
                  </p>
                  <p className="text-neutral-600 text-[11px]">
                    {confirmedOrder.deliveryInfo.addressLine1} {confirmedOrder.deliveryInfo.suiteOrApt ? `, ${confirmedOrder.deliveryInfo.suiteOrApt}` : ''}, {confirmedOrder.deliveryInfo.city}, {confirmedOrder.deliveryInfo.postalCode}
                  </p>
                  {confirmedOrder.deliveryInfo.shippingInstructions && (
                    <div className="mt-2 p-2 bg-white rounded-lg border border-neutral-200 text-[11px] text-neutral-700">
                      <span className="font-semibold text-neutral-900 block">Delivery Instructions:</span>
                      "{confirmedOrder.deliveryInfo.shippingInstructions}"
                    </div>
                  )}
                </div>

                {/* Items summary */}
                <div className="pt-2 border-t border-neutral-200/80">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-wider block mb-1">Purchased Items ({confirmedOrder.items.length})</span>
                  <div className="space-y-1.5">
                    {confirmedOrder.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-xs">
                        <span className="text-neutral-800 font-medium truncate max-w-[280px]">
                          {it.quantity}x {it.product.name} ({it.selectedSize})
                        </span>
                        <span className="tabular-nums font-semibold text-neutral-900">
                          ${it.product.price * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 rounded-lg text-xs font-medium text-neutral-700 flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Order Slip
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
