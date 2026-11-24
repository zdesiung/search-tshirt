import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_BANNERS,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  STORIES,
} from '../data/catalog';
import { INITIAL_SHIPPING_RATES } from '../data/peruUbigeo';
import {
  AuditLogEntry,
  BannerConfig,
  CartItem,
  Coupon,
  CustomerProfile,
  DeliveryMethod,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductColor,
  ShippingRate,
  StoreSettings,
  StoryArticle,
} from '../types/ecommerce';
import { trackEcommerceEvent } from '../utils/analytics';

interface CreateOrderInput {
  customer: Order['customer'];
  deliveryMethod: DeliveryMethod;
  address?: Order['address'];
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

interface SubmitProofInput {
  orderId: string;
  method: PaymentMethod;
  operationNumber: string;
  paidAt: string;
  transferredAmount: number;
  proofDataUrl: string;
}

interface CreateShipmentInput {
  orderId: string;
  carrier: string;
  agencyOffice?: string;
  trackingNumber: string;
  notes?: string;
}

interface StoreContextValue {
  products: Product[];
  orders: Order[];
  customers: CustomerProfile[];
  coupons: Coupon[];
  banners: BannerConfig[];
  stories: StoryArticle[];
  shippingRates: ShippingRate[];
  auditLogs: AuditLogEntry[];
  settings: StoreSettings;
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  appliedCoupon: Coupon | null;
  cartOpen: boolean;
  searchOpen: boolean;
  adminToken: string | null;
  adminActor: string | null;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  addToCart: (product: Product, color: ProductColor, size: string, quantity?: number) => void;
  updateCartQty: (productId: string, colorName: string, size: string, delta: number) => void;
  removeFromCart: (productId: string, colorName: string, size: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  recordRecentlyViewed: (slug: string) => void;
  applyCouponCode: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  submitOrder: (input: CreateOrderInput) => Promise<Order>;
  submitPaymentProof: (input: SubmitProofInput) => Promise<Order>;
  fetchAdminAuthStatus: () => Promise<{ envConfigured: boolean; claimed: boolean; authenticated: boolean }>;
  bootstrapAdmin: (password: string) => Promise<void>;
  loginAdmin: (password: string) => Promise<void>;
  logoutAdmin: () => void;
  refreshAdminOverview: (overrideToken?: string) => Promise<void>;
  verifyPayment: (paymentId: string, decision: 'APPROVED' | 'REJECTED', note: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  createShipment: (input: CreateShipmentInput) => Promise<void>;
  saveShippingRates: (rates: ShippingRate[]) => Promise<void>;
  saveProduct: (product: Product, isEdit: boolean) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleBanner: (bannerId: string) => void;
  toggleCoupon: (code: string) => void;
  updateSettings: (partial: Partial<StoreSettings>) => Promise<void>;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  dismissAnnouncement: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEYS = {
  cart: 'bp_cart_v1',
  wishlist: 'bp_wishlist_v1',
  recent: 'bp_recent_v1',
  myOrders: 'bp_my_orders_v2',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(() =>
    readStorage(STORAGE_KEYS.myOrders, INITIAL_ORDERS)
  );
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [banners, setBanners] = useState<BannerConfig[]>(INITIAL_BANNERS);
  const [stories] = useState<StoryArticle[]>(STORIES);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>(INITIAL_SHIPPING_RATES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  const [cart, setCart] = useState<CartItem[]>(() => readStorage(STORAGE_KEYS.cart, []));
  const [wishlist, setWishlist] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.wishlist, ['prod-bp-ocean', 'prod-bp-wave'])
  );
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() =>
    readStorage(STORAGE_KEYS.recent, ['beach-polo-ocean', 'beach-polo-sunset'])
  );
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Admin auth token stays strictly in React memory (never localStorage)
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminActor, setAdminActor] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/catalog')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.coupons)) setCoupons(data.coupons);
        if (Array.isArray(data.banners)) setBanners(data.banners);
        if (Array.isArray(data.shippingRates)) setShippingRates(data.shippingRates);
        if (data.settings) setSettings(data.settings);
      })
      .catch(() => {
        // Keep initial defaults if API unavailable
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlist));
    } catch {
      // ignore
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recentlyViewed));
    } catch {
      // ignore
    }
  }, [recentlyViewed]);

  const addToCart = (
    product: Product,
    color: ProductColor,
    size: string,
    quantity = 1
  ) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) =>
          item.productId === product.id &&
          item.color.name === color.name &&
          item.size === size
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0],
          price: product.price,
          color,
          size,
          quantity,
        },
      ];
    });
    trackEcommerceEvent('add_to_cart', {
      item_id: product.sku,
      item_name: product.name,
      price: product.price,
      quantity,
      variant: `${color.name} / ${size}`,
    });
    setCartOpen(true);
  };

  const updateCartQty = (
    productId: string,
    colorName: string,
    size: string,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.productId === productId &&
            item.color.name === colorName &&
            item.size === size
          ) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string, colorName: string, size: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.color.name === colorName &&
            item.size === size
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (!exists) {
        trackEcommerceEvent('wishlist', { item_id: productId });
      }
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  };

  const recordRecentlyViewed = (slug: string) => {
    setRecentlyViewed((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 6));
  };

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal < appliedCoupon.minOrder) return 0;
    if (appliedCoupon.type === 'percentage') {
      return Number(((cartSubtotal * appliedCoupon.value) / 100).toFixed(2));
    }
    return Math.min(appliedCoupon.value, cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);

  const applyCouponCode = (rawCode: string): { ok: boolean; message: string } => {
    const clean = rawCode.trim().toUpperCase();
    const found = coupons.find((c) => c.code === clean && c.active);
    if (!found) {
      return { ok: false, message: 'Código de cupón inválido o expirado.' };
    }
    if (cartSubtotal < found.minOrder) {
      return {
        ok: false,
        message: `Este cupón requiere una compra mínima de S/ ${found.minOrder}.`,
      };
    }
    setAppliedCoupon(found);
    return { ok: true, message: `Cupón ${found.code} aplicado: ${found.description}` };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const submitOrder = async (input: CreateOrderInput): Promise<Order> => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        items: cart.map((c) => ({
          productId: c.productId,
          colorName: c.color.name,
          size: c.size,
          quantity: c.quantity,
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo registrar el pedido.');
    }
    const created = data.order as Order;
    setOrders((prev) => {
      const next = [created, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.myOrders, JSON.stringify(next.slice(0, 15)));
      } catch {
        // ignore
      }
      return next;
    });
    trackEcommerceEvent('purchase', {
      transaction_id: created.id,
      value: created.total,
      payment_type: created.payment.method,
    });
    clearCart();
    return created;
  };

  const submitPaymentProof = async (input: SubmitProofInput): Promise<Order> => {
    const res = await fetch('/api/payments/proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al enviar comprobante.');
    }
    const updated = data.order as Order;
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === updated.id ? updated : o));
      try {
        localStorage.setItem(STORAGE_KEYS.myOrders, JSON.stringify(next.slice(0, 15)));
      } catch {
        // ignore
      }
      return next;
    });
    return updated;
  };

  const fetchAdminAuthStatus = async () => {
    const res = await fetch('/api/admin/auth/status', {
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined,
    });
    if (!res.ok) {
      return { envConfigured: false, claimed: false, authenticated: false };
    }
    return (await res.json()) as {
      envConfigured: boolean;
      claimed: boolean;
      authenticated: boolean;
    };
  };

  const refreshAdminOverview = async (overrideToken?: string) => {
    const token = overrideToken || adminToken;
    if (!token) return;
    const res = await fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      if (res.status === 401) {
        setAdminToken(null);
        setAdminActor(null);
      }
      throw new Error('No autorizado para consultar el panel.');
    }
    const data = await res.json();
    if (Array.isArray(data.orders)) setOrders(data.orders);
    if (Array.isArray(data.products)) setProducts(data.products);
    if (Array.isArray(data.customers)) setCustomers(data.customers);
    if (Array.isArray(data.coupons)) setCoupons(data.coupons);
    if (Array.isArray(data.banners)) setBanners(data.banners);
    if (Array.isArray(data.shippingRates)) setShippingRates(data.shippingRates);
    if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
    if (data.settings) setSettings(data.settings);
  };

  const bootstrapAdmin = async (password: string) => {
    const res = await fetch('/api/admin/auth/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo configurar el acceso.');
    setAdminToken(data.token);
    setAdminActor(data.actor || 'Administrador');
    await refreshAdminOverview(data.token);
  };

  const loginAdmin = async (password: string) => {
    const res = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Credenciales incorrectas.');
    setAdminToken(data.token);
    setAdminActor(data.actor || 'Administrador');
    await refreshAdminOverview(data.token);
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminActor(null);
  };

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken || ''}`,
  });

  const verifyPayment = async (
    paymentId: string,
    decision: 'APPROVED' | 'REJECTED',
    note: string
  ) => {
    const res = await fetch(`/api/admin/payments/${paymentId}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ decision, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo validar el pago.');
    const updatedOrder = data.order as Order;
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    if (Array.isArray(data.products)) setProducts(data.products);
    if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: adminHeaders(),
      body: JSON.stringify({ status, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo actualizar el estado.');
    const updatedOrder = data.order as Order;
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
  };

  const createShipment = async (input: CreateShipmentInput) => {
    const res = await fetch('/api/admin/shipments', {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo registrar el despacho.');
    const updatedOrder = data.order as Order;
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
  };

  const saveShippingRates = async (rates: ShippingRate[]) => {
    const res = await fetch('/api/admin/shipping/rates', {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ rates }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudieron guardar las tarifas.');
    setShippingRates(data.rates);
    if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
  };

  const saveProduct = async (product: Product, isEdit: boolean) => {
    const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products';
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error guardando producto.');
    if (Array.isArray(data.products)) setProducts(data.products);
  };

  const deleteProduct = async (productId: string) => {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error eliminando producto.');
    if (Array.isArray(data.products)) setProducts(data.products);
  };

  const toggleBanner = (bannerId: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, active: !b.active } : b))
    );
  };

  const toggleCoupon = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
  };

  const updateSettings = async (partial: Partial<StoreSettings>) => {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify(partial),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudo actualizar la configuración.');
    if (data.settings) setSettings(data.settings);
    if (Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
  };

  const dismissAnnouncement = () => {
    setSettings((prev) => ({ ...prev, announcementVisible: false }));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        customers,
        coupons,
        banners,
        stories,
        shippingRates,
        auditLogs,
        settings,
        cart,
        wishlist,
        recentlyViewed,
        appliedCoupon,
        cartOpen,
        searchOpen,
        adminToken,
        adminActor,
        setCartOpen,
        setSearchOpen,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        recordRecentlyViewed,
        applyCouponCode,
        removeCoupon,
        submitOrder,
        submitPaymentProof,
        fetchAdminAuthStatus,
        bootstrapAdmin,
        loginAdmin,
        logoutAdmin,
        refreshAdminOverview,
        verifyPayment,
        updateOrderStatus,
        createShipment,
        saveShippingRates,
        saveProduct,
        deleteProduct,
        toggleBanner,
        toggleCoupon,
        updateSettings,
        cartCount,
        cartSubtotal,
        cartDiscount,
        dismissAnnouncement,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
