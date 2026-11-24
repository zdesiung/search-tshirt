export type CategorySlug =
  | 'hombre'
  | 'mujer'
  | 'ninos'
  | 'playa'
  | 'accesorios';

export type CollectionSlug = 'summer' | 'ocean' | 'beach-life';

export type PaymentStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_REVIEW'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'YAPE' | 'PLIN';

export type DeliveryMethod = 'domicilio' | 'agencia' | 'pickup';

export type ShippingZoneType =
  | 'LIMA_METRO'
  | 'CALLAO'
  | 'PROVINCIA'
  | 'ZONA_ESPECIAL';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  fabric: string;
  fit: string;
  price: number;
  compareAtPrice?: number;
  category: CategorySlug;
  collection: CollectionSlug;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: Record<string, number>;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  isBestSeller?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  description: string;
  image: string;
  objectPosition?: string;
}

export interface CollectionInfo {
  slug: CollectionSlug;
  name: string;
  subtitle: string;
  description: string;
  image: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  color: ProductColor;
  size: string;
  quantity: number;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  active: boolean;
  description: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentProof {
  id: string;
  method: PaymentMethod;
  operationNumber: string;
  paidAt: string;
  transferredAmount: number;
  proofDataUrl: string;
  submittedAt: string;
}

export interface PaymentRecord {
  id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  proof?: PaymentProof;
  reviewedBy?: string;
  reviewNote?: string;
  reviewedAt?: string;
}

export interface ShippingRate {
  id: string;
  zoneType: ShippingZoneType;
  department: string;
  province?: string;
  district?: string;
  carrier: string;
  deliveryModes: DeliveryMethod[];
  rate: number;
  estimatedDays: string;
  isManualQuote: boolean;
  active: boolean;
}

export interface Shipment {
  id: string;
  carrier: string;
  agencyOffice?: string;
  trackingNumber: string;
  dispatchedAt: string;
  deliveredAt?: string;
  notes?: string;
}

export interface OrderStatusHistoryEntry {
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: string;
  note: string;
  timestamp: string;
}

export interface Order {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    email: string;
  };
  deliveryMethod: DeliveryMethod;
  address?: {
    department: string;
    province: string;
    district: string;
    street: string;
    reference?: string;
    recipientName?: string;
    recipientPhone?: string;
  };
  shippingZoneLabel: string;
  carrierName: string;
  payment: PaymentRecord;
  shipment?: Shipment;
  statusHistory: OrderStatusHistoryEntry[];
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  joinedAt: string;
}

export interface StoryArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string[];
  image: string;
}

export interface BannerConfig {
  id: string;
  placement: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  announcementText: string;
  announcementVisible: boolean;
  freeShippingThreshold: number;
  limaShippingCost: number;
  provinceShippingCost: number;
  whatsappPhone: string;
  contactEmail: string;
  showroomAddress: string;
  instagramHandle: string;
  yapeNumber: string;
  yapeHolder: string;
  plinNumber: string;
  plinHolder: string;
}
