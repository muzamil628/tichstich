import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import {
  Search,
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  Printer,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  ExternalLink,
} from 'lucide-react';

interface OrderTrackerModalProps {
  orders: Order[];
  initialOrderNumber?: string;
  onClose: () => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  orders,
  initialOrderNumber = '',
  onClose,
}) => {
  const [orderQuery, setOrderQuery] = useState(initialOrderNumber);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    if (initialOrderNumber) {
      return orders.find((o) => o.orderNumber.toLowerCase() === initialOrderNumber.toLowerCase()) || null;
    }
    return orders[0] || null; // default to first demo order so user sees the rich interface immediately!
  });
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const cleaned = orderQuery.trim().toLowerCase();
    if (!cleaned) {
      setSearchError('Please enter an order number (e.g. TS-8924)');
      return;
    }

    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === cleaned ||
        o.trackingNumber.toLowerCase() === cleaned ||
        o.id.toLowerCase() === cleaned
    );

    if (found) {
      setSearchedOrder(found);
      setSearchError(null);
    } else {
      setSearchedOrder(null);
      setSearchError(`No order found matching "${orderQuery}". Try one of the recent demo orders below.`);
    }
  };

  const selectQuickOrder = (ord: Order) => {
    setOrderQuery(ord.orderNumber);
    setSearchedOrder(ord);
    setSearchError(null);
  };

  // Status mapping to steps (1 to 5)
  const getStepProgress = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 5;
      case 'cancelled':
        return 0;
      default:
        return 2;
    }
  };

  const currentStep = searchedOrder ? getStepProgress(searchedOrder.status) : 0;

  const timelineSteps = [
    {
      step: 1,
      title: 'Order Confirmed',
      desc: 'Payment verified and item allocated in warehouse.',
      time: 'Day 1 · 08:30 AM',
    },
    {
      step: 2,
      title: 'Artisan Inspection & Packing',
      desc: 'Hand-pressed, quality verified, and wrapped in protective muslin.',
      time: 'Day 1 · 02:45 PM',
    },
    {
      step: 3,
      title: 'Dispatched & In Transit',
      desc: 'Handed over to priority express courier service.',
      time: 'Day 2 · 09:15 AM',
    },
    {
      step: 4,
      title: 'Out for Delivery',
      desc: 'Courier driver en route to your specified address.',
      time: 'Delivery Day · 07:30 AM',
    },
    {
      step: 5,
      title: 'Delivered',
      desc: 'Package handed over per customer delivery instructions.',
      time: 'Completed',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-neutral-900">
              TICHSTICH · Live Order Tracker
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Search Box */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-700">
              Enter Order Number or Tracking ID
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. TS-8924, TS-8925..."
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:bg-white transition-all uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-sm"
              >
                Track Order
              </button>
            </div>

            {/* Quick click demo orders */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-500 flex-wrap">
              <span>Recent Orders:</span>
              {orders.slice(0, 3).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => selectQuickOrder(ord)}
                  className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-md font-mono transition-colors"
                >
                  {ord.orderNumber}
                </button>
              ))}
            </div>

            {searchError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </form>

          {/* Searched Order Details */}
          {searchedOrder && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Order Status Badge & Key Specs */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                      Order Reference
                    </span>
                    <h4 className="text-base font-bold text-neutral-900 font-display">
                      {searchedOrder.orderNumber}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-600 bg-white px-2.5 py-1 rounded-md border border-neutral-200">
                      {searchedOrder.trackingNumber}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                      searchedOrder.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : searchedOrder.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : searchedOrder.status === 'processing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-neutral-200 text-neutral-800'
                    }`}>
                      {searchedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Est. Delivery</span>
                    <span className="font-semibold text-neutral-900">{searchedOrder.estimatedDelivery}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Payment</span>
                    <span className="font-semibold text-neutral-900">
                      {searchedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Paid'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Order Placed</span>
                    <span className="font-semibold text-neutral-900">
                      {new Date(searchedOrder.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Interactive Step Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Shipment Progress Timeline
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                  {timelineSteps.map((s) => {
                    const isCompleted = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;

                    return (
                      <div key={s.step} className="relative flex items-start gap-3.5 group">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-neutral-900 border-neutral-900 text-white'
                              : 'bg-white border-neutral-300 text-neutral-300'
                          } ${isCurrent ? 'ring-4 ring-neutral-200' : ''}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-semibold ${isCompleted ? 'text-neutral-900' : 'text-neutral-400'}`}>
                              {s.title}
                            </span>
                            <span className="text-[11px] text-neutral-400">{s.time}</span>
                          </div>
                          <p className={`text-xs mt-0.5 leading-relaxed ${isCompleted ? 'text-neutral-600' : 'text-neutral-400'}`}>
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Destination Address & Specific Shipping Instructions */}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                  <MapPin className="w-4 h-4 text-neutral-600" />
                  <span>Delivery Destination</span>
                </div>

                <div className="pl-5 text-neutral-700 space-y-0.5">
                  <p className="font-semibold text-neutral-900">
                    {searchedOrder.deliveryInfo.fullName} · {searchedOrder.deliveryInfo.phone}
                  </p>
                  <p className="text-neutral-600 text-[11px]">
                    {searchedOrder.deliveryInfo.addressLine1} {searchedOrder.deliveryInfo.suiteOrApt ? `, ${searchedOrder.deliveryInfo.suiteOrApt}` : ''}, {searchedOrder.deliveryInfo.city}, {searchedOrder.deliveryInfo.postalCode}
                  </p>
                </div>

                {/* Specific shipping instructions box */}
                {searchedOrder.deliveryInfo.shippingInstructions && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                    <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-1">
                      Courier Delivery Instructions:
                    </span>
                    <p className="text-xs italic">
                      "{searchedOrder.deliveryInfo.shippingInstructions}"
                    </p>
                  </div>
                )}
              </div>

              {/* Purchased items preview */}
              <div className="pt-2 border-t border-neutral-100">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 block mb-2">
                  Items in this Parcel ({searchedOrder.items.length})
                </span>
                <div className="space-y-2">
                  {searchedOrder.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-xs py-1">
                      <span className="font-medium text-neutral-800">
                        {it.quantity}x {it.product.name} ({it.selectedSize})
                      </span>
                      <span className="font-semibold tabular-nums text-neutral-900">
                        ${it.product.price * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg text-xs font-medium text-neutral-700 flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Tracking Summary</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Close Tracker
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
