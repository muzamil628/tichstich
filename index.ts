export type ProductCategory = 'All' | 'Girls 3pc & 2pc' | 'Clothes' | 'Shawls & Wraps' | 'Bags' | 'Caps & Headwear' | 'Accessories';

export type Model3DType = 'hoodie' | 'shawl' | 'bag' | 'cap' | 'tee';

export type TryOnType = 'upper_body' | 'shawl_wrap' | 'headwear' | 'accessory';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  image: string;
  secondaryImage?: string;
  images?: string[];
  model3dType?: Model3DType;
  tryonType: TryOnType;
  description: string;
  details: string[];
  tags: string[];
  inStock: boolean;
  featured?: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string; // unique item instance id
  product: Product;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
  quantity: number;
}

export interface DeliveryInfo {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  suiteOrApt?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  shippingInstructions: string;
}

export type PaymentMethod = 'cod' | 'online';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  deliveryInfo: DeliveryInfo;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    cardBrand?: string;
    last4?: string;
    transactionId?: string;
  };
  status: OrderStatus;
  estimatedDelivery: string;
  trackingNumber: string;
}
