import { Product, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // ==========================================
  // WOMEN'S / GIRLS' 3-PIECE & 2-PIECE COLLECTIONS (WITH MODEL WEARS & DETAIL PHOTOS)
  // ==========================================
  {
    id: 'prod-w1',
    name: 'Minimalist Raw Silk 3-Piece (3pc) Ensemble',
    category: 'Girls 3pc & 2pc',
    price: 245,
    originalPrice: 295,
    stock: 18,
    sku: 'TS-3PC-01',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Ivory Cream', hex: '#FAF9F6' },
      { name: 'Pale Slate Heather', hex: '#D1D5DB' },
      { name: 'Charcoal Ombre', hex: '#374151' },
    ],
    image: '/src/assets/images/girls_3pc_luxury_suit_1793882263521.jpg',
    images: [
      '/src/assets/images/girls_3pc_luxury_suit_1793882263521.jpg',
      '/src/assets/images/girls_3pc_detail_fabric_1793884044645.jpg',
      '/src/assets/images/cashmere_shawl_grey_1793871978037.jpg',
    ],
    tryonType: 'shawl_wrap',
    description: 'An ethereal 3-piece (3pc) tailored ensemble featuring an architectural long-line fluid tunic, matching pleated wide-leg trousers, and a hand-draped fine cashmere sahwal wrap. Cut from pre-washed raw mulberry silk blend for a graceful silhouette.',
    details: [
      '3-Piece Set: Long Tunic + Wide-Leg Trousers + Draped Shawl',
      'Raw Mulberry Silk & Fine Alpaca Blend',
      'Pre-washed for non-creasing fluid movement',
      'Concealed tonal side seam pockets in trousers',
      'Hand-finished selvedge hems and eyelash fringe',
    ],
    tags: ['Women 3pc', 'Raw Silk', 'Model Wear', 'Best Seller'],
    inStock: true,
    featured: true,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'prod-w2',
    name: 'Tailored Structured 2-Piece (2pc) Co-ord Set',
    category: 'Girls 3pc & 2pc',
    price: 195,
    originalPrice: 230,
    stock: 14,
    sku: 'TS-2PC-02',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Slate Grey', hex: '#64748B' },
      { name: 'Muted Ash', hex: '#94A3B8' },
      { name: 'Obsidian Black', hex: '#1E293B' },
    ],
    image: '/src/assets/images/girls_2pc_minimal_coord_1793882263872.jpg',
    images: [
      '/src/assets/images/girls_2pc_minimal_coord_1793882263872.jpg',
      '/src/assets/images/girls_3pc_detail_fabric_1793884044645.jpg',
      '/src/assets/images/girls_2pc_monochrome_set_1793882266083.jpg',
    ],
    tryonType: 'upper_body',
    description: 'A contemporary 2-piece (2pc) tailored set featuring a high mandarin neck button-up tunic with sculptural drape pleats and matching relaxed tailored trousers with subtle white architectural piping.',
    details: [
      '2-Piece Set: Draped Pleated Tunic + Tailored Ankle Trousers',
      'Heavyweight 320 GSM Crepe Wool & Viscose Twill',
      'Architectural front asymmetric tuck detail',
      'Elasticated rear waistband for tailored comfort',
      'Dry clean recommended',
    ],
    tags: ['Women 2pc', 'Co-ord Set', 'Architectural', 'Model Wear'],
    inStock: true,
    featured: true,
    createdAt: '2026-11-02T11:30:00Z',
  },
  {
    id: 'prod-w3',
    name: 'Tonal Embroidered Jacquard 3-Piece (3pc) Suit',
    category: 'Girls 3pc & 2pc',
    price: 280,
    originalPrice: 340,
    stock: 10,
    sku: 'TS-3PC-03',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Heather Stone', hex: '#CBD5E1' },
      { name: 'Chalk White', hex: '#F8FAFC' },
    ],
    image: '/src/assets/images/girls_3pc_embroidered_set_1793882266333.jpg',
    images: [
      '/src/assets/images/girls_3pc_embroidered_set_1793882266333.jpg',
      '/src/assets/images/girls_3pc_detail_fabric_1793884044645.jpg',
      '/src/assets/images/cashmere_shawl_grey_1793871978037.jpg',
    ],
    tryonType: 'shawl_wrap',
    description: 'A statement 3-piece (3pc) occasion suit featuring a structured tailored vest tunic with tonal geometric jacquard embroidery, pressed cigarette trousers, and a lightweight ivory woven shawl with eyelash fringe.',
    details: [
      '3-Piece Set: Embroidered Vest Tunic + Cigarette Pants + Jacquard Shawl',
      'Tonal silver-grey silk thread geometric embroidery',
      'High stand collar with horn-finish button fastening',
      'Includes matching silk organza dupatta shawl',
      'Dry clean only',
    ],
    tags: ['Women 3pc', 'Embroidered', 'Occasion Wear', 'Model Wear'],
    inStock: true,
    featured: true,
    createdAt: '2026-11-03T14:15:00Z',
  },
  {
    id: 'prod-w4',
    name: 'Asymmetrical Relaxed Linen 2-Piece (2pc) Set',
    category: 'Girls 3pc & 2pc',
    price: 175,
    originalPrice: 210,
    stock: 22,
    sku: 'TS-2PC-04',
    sizes: ['S', 'M', 'L'],
    colors: [
      { name: 'Cement & Cream', hex: '#6B7280' },
      { name: 'Oatmeal', hex: '#E5E7EB' },
    ],
    image: '/src/assets/images/girls_2pc_monochrome_set_1793882266083.jpg',
    images: [
      '/src/assets/images/girls_2pc_monochrome_set_1793882266083.jpg',
      '/src/assets/images/girls_3pc_detail_fabric_1793884044645.jpg',
    ],
    tryonType: 'upper_body',
    description: 'Effortless 2-piece (2pc) lounge and day ensemble crafted from breathable washed European flax linen. Features an off-the-shoulder boatneck asymmetric top paired with breezy straight-cut cream trousers.',
    details: [
      '2-Piece Set: Asymmetrical Boatneck Top + Straight-Cut Trousers',
      '100% Pre-washed European Flax Linen',
      'Raw-edge micro seam accent along collar',
      'Deep functional side pockets',
      'Machine wash gentle cold',
    ],
    tags: ['Women 2pc', 'European Linen', 'Model Wear', 'Minimalist'],
    inStock: true,
    featured: false,
    createdAt: '2026-11-03T16:40:00Z',
  },

  // ==========================================
  // UNISEX APPAREL & ACCESSORIES WITH DETAIL SHOTS
  // ==========================================
  {
    id: 'prod-1',
    name: 'Oversized Heavy Cotton Hoodie',
    category: 'Clothes',
    price: 145,
    originalPrice: 180,
    stock: 24,
    sku: 'TS-CLO-01',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Chalk White', hex: '#F4F4F5' },
      { name: 'Ash Grey', hex: '#D4D4D8' },
      { name: 'Slate', hex: '#52525B' },
      { name: 'Pitch Black', hex: '#18181B' },
    ],
    image: '/src/assets/images/minimal_hoodie_white_1793871978766.jpg',
    images: [
      '/src/assets/images/minimal_hoodie_white_1793871978766.jpg',
      '/src/assets/images/hoodie_macro_stitch_detail_1793884045132.jpg',
    ],
    tryonType: 'upper_body',
    description: 'Constructed from custom-developed 480 GSM French Terry loopback cotton. Features a relaxed drop-shoulder silhouette, double-layered architectural hood, and concealed kangaroo pocket with tonal bartacks.',
    details: [
      '480 GSM Heavyweight French Terry Cotton',
      'Pre-shrunk vintage wash for soft drape',
      'Double-needle lockstitch construction',
      'Custom brushed nickel hardware aglets',
      'Crafted in Portugal',
    ],
    tags: ['Heavyweight', 'Best Seller', 'Drop Shoulder'],
    inStock: true,
    featured: true,
    createdAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Handwoven Cashmere Sahwal Drape',
    category: 'Shawls & Wraps',
    price: 210,
    originalPrice: 260,
    stock: 12,
    sku: 'TS-SHW-02',
    sizes: ['One Size (200 x 85 cm)'],
    colors: [
      { name: 'Muted Heather Grey', hex: '#C4C4C8' },
      { name: 'Raw Oatmeal', hex: '#E2DEC9' },
      { name: 'Charcoal Ombre', hex: '#3F3F46' },
    ],
    image: '/src/assets/images/cashmere_shawl_grey_1793871978037.jpg',
    images: [
      '/src/assets/images/cashmere_shawl_grey_1793871978037.jpg',
      '/src/assets/images/girls_3pc_detail_fabric_1793884044645.jpg',
    ],
    tryonType: 'shawl_wrap',
    description: 'Artisan hand-loomed grade-A Himalayan cashmere and brushed alpaca blend. Delivers featherweight thermal insulation with an ethereal tactile fall and raw eyelash fringe selvedge.',
    details: [
      '70% Grade-A Mongolian Cashmere, 30% Baby Alpaca',
      'Hand-twisted selvedge eyelash fringe',
      'Naturally dyed with plant-based mineral pigments',
      'Generous 200cm length for sculptural drapes',
      'Dry clean only',
    ],
    tags: ['Artisan Weave', 'Pure Cashmere', 'Sculptural'],
    inStock: true,
    featured: true,
    createdAt: '2026-10-18T10:30:00Z',
  },
  {
    id: 'prod-3',
    name: 'Structured Architectural Leather Tote',
    category: 'Bags',
    price: 320,
    originalPrice: 380,
    stock: 8,
    sku: 'TS-BAG-03',
    sizes: ['Medium (38 x 30 x 14 cm)'],
    colors: [
      { name: 'Slate & Chalk Grey', hex: '#71717A' },
      { name: 'Monochrome Off-White', hex: '#E4E4E7' },
      { name: 'Obsidian Black', hex: '#18181B' },
    ],
    image: '/src/assets/images/structured_leather_tote_1793871978391.jpg',
    images: [
      '/src/assets/images/structured_leather_tote_1793871978391.jpg',
      '/src/assets/images/leather_tote_hardware_detail_1793884045406.jpg',
    ],
    tryonType: 'accessory',
    description: 'A study in minimalist geometric proportions. Crafted from full-grain matte calfskin with beveled edges, dual reinforced tubular handles, internal padded 15" laptop sleeve, and brushed palladium protective feet.',
    details: [
      'Vegetable-tanned full grain calf leather',
      'Reinforced internal canvas lining with key lanyard',
      'Fits up to 15" MacBook Pro in dedicated compartment',
      'Magnetic bridge closure with subtle engraved logo',
      'Hand-painted tonal burnished edges & palladium hardware',
    ],
    tags: ['Full Grain Leather', 'Architectural', 'Laptop Ready'],
    inStock: true,
    featured: true,
    createdAt: '2026-10-20T14:15:00Z',
  },
  {
    id: 'prod-4',
    name: 'Tailored Wool Architectural Cap',
    category: 'Caps & Headwear',
    price: 75,
    originalPrice: 90,
    stock: 35,
    sku: 'TS-CAP-04',
    sizes: ['Adjustable Strap (54 - 61 cm)'],
    colors: [
      { name: 'Pale Heather Grey', hex: '#A1A1AA' },
      { name: 'Chalk White', hex: '#F4F4F5' },
      { name: 'Charcoal Felt', hex: '#27272A' },
    ],
    image: '/src/assets/images/minimal_tailored_cap_1793871978780.jpg',
    images: [
      '/src/assets/images/minimal_tailored_cap_1793871978780.jpg',
      '/src/assets/images/wool_cap_texture_detail_1793884045125.jpg',
    ],
    tryonType: 'headwear',
    description: 'Clean six-panel unstructured profile crafted from Australian Merino wool twill. Finished with an understated curved peak, embroidered ventilation eyelets, and self-fabric strap with custom matte gunmetal buckle.',
    details: [
      '100% Australian Merino Wool Twill',
      'Internal moisture-wicking organic cotton sweatband',
      'Stealth tonal matte hardware slide adjuster',
      'Reinforced pre-curved shape memory visor',
      'Unstructured low-profile silhouette',
    ],
    tags: ['Merino Wool', 'Adjustable', 'Minimalist'],
    inStock: true,
    featured: true,
    createdAt: '2026-10-22T09:00:00Z',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'TS-8924',
    date: '2026-11-04T15:20:00Z',
    items: [
      {
        id: 'ci-1',
        product: INITIAL_PRODUCTS[0],
        selectedSize: 'M',
        selectedColor: { name: 'Ivory Cream', hex: '#FAF9F6' },
        quantity: 1,
      },
      {
        id: 'ci-2',
        product: INITIAL_PRODUCTS[7],
        selectedSize: 'Adjustable Strap (54 - 61 cm)',
        selectedColor: { name: 'Pale Heather Grey', hex: '#A1A1AA' },
        quantity: 1,
      },
    ],
    subtotal: 320,
    shippingFee: 0,
    discount: 0,
    total: 320,
    deliveryInfo: {
      fullName: 'Amina Tariq',
      phone: '+1 (555) 234-8901',
      email: 'amina.tariq@designcollective.com',
      addressLine1: '450 West 24th Street',
      suiteOrApt: 'Apt 8B',
      city: 'New York',
      stateProvince: 'NY',
      postalCode: '10011',
      country: 'United States',
      shippingInstructions: 'Doorman building. Leave with reception desk. Please notify via SMS upon delivery.',
    },
    paymentMethod: 'online',
    paymentDetails: {
      cardBrand: 'Visa',
      last4: '4242',
      transactionId: 'TXN-90821-NY',
    },
    status: 'shipped',
    estimatedDelivery: 'November 8, 2026',
    trackingNumber: 'TRK-9820-FEDEX',
  },
  {
    id: 'ord-102',
    orderNumber: 'TS-8925',
    date: '2026-11-04T18:45:00Z',
    items: [
      {
        id: 'ci-3',
        product: INITIAL_PRODUCTS[1],
        selectedSize: 'S',
        selectedColor: { name: 'Slate Grey', hex: '#64748B' },
        quantity: 1,
      },
    ],
    subtotal: 195,
    shippingFee: 0,
    discount: 0,
    total: 195,
    deliveryInfo: {
      fullName: 'Zainab Qureshi',
      phone: '+1 (555) 890-4412',
      email: 'zainab.q@arch-studio.org',
      addressLine1: '1288 Commonwealth Ave',
      suiteOrApt: 'Unit 3',
      city: 'Boston',
      stateProvince: 'MA',
      postalCode: '02134',
      country: 'United States',
      shippingInstructions: 'Ring doorbell twice. If not home, leave safe under covered front porch.',
    },
    paymentMethod: 'cod',
    status: 'processing',
    estimatedDelivery: 'November 9, 2026',
    trackingNumber: 'TRK-1049-UPS',
  },
  {
    id: 'ord-103',
    orderNumber: 'TS-8926',
    date: '2026-11-05T08:10:00Z',
    items: [
      {
        id: 'ci-4',
        product: INITIAL_PRODUCTS[2],
        selectedSize: 'M',
        selectedColor: { name: 'Heather Stone', hex: '#CBD5E1' },
        quantity: 1,
      },
    ],
    subtotal: 280,
    shippingFee: 0,
    discount: 0,
    total: 280,
    deliveryInfo: {
      fullName: 'Maya Lin',
      phone: '+1 (555) 773-9021',
      email: 'maya.lin@atelier.co',
      addressLine1: '742 Montgomery St',
      suiteOrApt: 'Floor 4',
      city: 'San Francisco',
      stateProvince: 'CA',
      postalCode: '94111',
      country: 'United States',
      shippingInstructions: 'Gate code #9021. Call on arrival for lobby elevator release.',
    },
    paymentMethod: 'online',
    paymentDetails: {
      cardBrand: 'Mastercard',
      last4: '8819',
      transactionId: 'TXN-77192-SF',
    },
    status: 'delivered',
    estimatedDelivery: 'Delivered Yesterday',
    trackingNumber: 'TRK-8812-DHL',
  },
];

const PRODUCTS_STORAGE_KEY = 'tichstich_products_v4';
const ORDERS_STORAGE_KEY = 'tichstich_orders_v4';

export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read products from localStorage', e);
  }
  return INITIAL_PRODUCTS;
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read orders from localStorage', e);
  }
  return INITIAL_ORDERS;
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage', e);
  }
}
