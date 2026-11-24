import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_BANNERS,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from './src/data/catalog.ts';
import { INITIAL_SHIPPING_RATES, resolveShippingQuote } from './src/data/peruUbigeo.ts';
import type {
  AuditLogEntry,
  BannerConfig,
  Coupon,
  CustomerProfile,
  DeliveryMethod,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ShippingRate,
  StoreSettings,
} from './src/types/ecommerce.ts';

interface ServerStore {
  products: Product[];
  orders: Order[];
  customers: CustomerProfile[];
  coupons: Coupon[];
  banners: BannerConfig[];
  shippingRates: ShippingRate[];
  settings: StoreSettings;
  auditLogs: AuditLogEntry[];
  adminCredential: {
    salt: string;
    hash: string;
  } | null;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'store.json');
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

function loadStore(): ServerStore {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<ServerStore>;
      return {
        products: parsed.products || INITIAL_PRODUCTS,
        orders: parsed.orders || INITIAL_ORDERS,
        customers: parsed.customers || INITIAL_CUSTOMERS,
        coupons: parsed.coupons || INITIAL_COUPONS,
        banners: parsed.banners || INITIAL_BANNERS,
        shippingRates: parsed.shippingRates || INITIAL_SHIPPING_RATES,
        settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
        auditLogs: parsed.auditLogs || [],
        adminCredential: parsed.adminCredential || null,
      };
    }
  } catch (err) {
    console.error('Error loading store.json, initializing fresh store:', err);
  }

  return {
    products: INITIAL_PRODUCTS,
    orders: INITIAL_ORDERS,
    customers: INITIAL_CUSTOMERS,
    coupons: INITIAL_COUPONS,
    banners: INITIAL_BANNERS,
    shippingRates: INITIAL_SHIPPING_RATES,
    settings: INITIAL_SETTINGS,
    auditLogs: [],
    adminCredential: null,
  };
}

let store: ServerStore = loadStore();

function persistStore(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store.json:', err);
  }
}

function appendAudit(
  actor: string,
  action: string,
  entityType: string,
  entityId: string,
  details: string
): void {
  store.auditLogs.unshift({
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 999)}`,
    actor,
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  });
  store.auditLogs = store.auditLogs.slice(0, 200);
}

function hashPassword(password: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { salt: actualSalt, hash: derived };
}

function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHash, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function signAdminToken(actor: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      actor,
      role: 'admin',
      exp: Date.now() + 1000 * 60 * 60 * 12,
    })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string): { actor: string } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      actor: string;
      role: string;
      exp: number;
    };
    if (parsed.role !== 'admin' || Date.now() > parsed.exp) return null;
    return { actor: parsed.actor };
  } catch {
    return null;
  }
}

interface AuthenticatedRequest extends Request {
  adminActor?: string;
}

function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Autenticación administrativa requerida.' });
    return;
  }
  const token = auth.slice(7).trim();
  const verified = verifyAdminToken(token);
  if (!verified) {
    res.status(401).json({ error: 'Sesión expirada o inválida.' });
    return;
  }
  req.adminActor = verified.actor;
  next();
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkLoginThrottle(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    return true;
  }
  return entry.count < 10;
}

function recordLoginFailure(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
  } else {
    entry.count += 1;
  }
}

function clearLoginFailures(ip: string): void {
  loginAttempts.delete(ip);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'beach-polo-peru-sales' });
  });

  // Public Catalog & Store Settings (exposes only public fields)
  app.get('/api/catalog', (_req, res) => {
    res.json({
      products: store.products,
      coupons: store.coupons.filter((c) => c.active),
      banners: store.banners.filter((b) => b.active),
      settings: store.settings,
      shippingRates: store.shippingRates.filter((r) => r.active),
    });
  });

  // Public Shipping Rates
  app.get('/api/shipping/rates', (_req, res) => {
    res.json({ rates: store.shippingRates.filter((r) => r.active) });
  });

  // Create Order (Server-calculated totals, stock check, PENDING_PAYMENT)
  app.post('/api/orders', (req, res) => {
    const body = req.body as {
      customer?: {
        firstName?: string;
        lastName?: string;
        dni?: string;
        phone?: string;
        email?: string;
      };
      deliveryMethod?: DeliveryMethod;
      address?: {
        department?: string;
        province?: string;
        district?: string;
        street?: string;
        reference?: string;
        recipientName?: string;
        recipientPhone?: string;
      };
      paymentMethod?: PaymentMethod;
      couponCode?: string;
      items?: {
        productId: string;
        colorName: string;
        size: string;
        quantity: number;
      }[];
    };

    const cust = body.customer;
    const firstName = cust?.firstName?.trim() || '';
    const lastName = cust?.lastName?.trim() || '';
    const dni = String(cust?.dni || '').trim();
    const phone = String(cust?.phone || '').trim();
    const email = cust?.email?.trim() || '';

    if (
      !firstName ||
      !lastName ||
      !/^\d{8}$/.test(dni) ||
      !/^9\d{8}$/.test(phone) ||
      !email.includes('@')
    ) {
      res.status(400).json({ error: 'Datos personales inválidos (DNI 8 dígitos, celular 9 dígitos).' });
      return;
    }

    const deliveryMethod: DeliveryMethod =
      body.deliveryMethod === 'agencia' || body.deliveryMethod === 'pickup'
        ? body.deliveryMethod
        : 'domicilio';

    if (deliveryMethod !== 'pickup') {
      if (
        !body.address?.department?.trim() ||
        !body.address?.province?.trim() ||
        !body.address?.district?.trim() ||
        !body.address?.street?.trim()
      ) {
        res.status(400).json({ error: 'Completa el departamento, provincia, distrito y dirección.' });
        return;
      }
    }

    const paymentMethod: PaymentMethod = body.paymentMethod === 'PLIN' ? 'PLIN' : 'YAPE';

    if (!Array.isArray(body.items) || body.items.length === 0) {
      res.status(400).json({ error: 'El carrito está vacío.' });
      return;
    }

    // Authoritative price & stock calculation on server
    const resolvedItems: Order['items'] = [];
    let subtotal = 0;

    for (const reqItem of body.items) {
      const qty = Math.floor(Number(reqItem.quantity));
      if (!Number.isFinite(qty) || qty <= 0 || qty > 20) {
        res.status(400).json({ error: 'Cantidad de producto inválida.' });
        return;
      }
      const prod = store.products.find((p) => p.id === reqItem.productId);
      if (!prod) {
        res.status(404).json({ error: 'Producto no encontrado en el catálogo.' });
        return;
      }
      const available = prod.stock[reqItem.size] ?? 0;
      if (available < qty) {
        res.status(409).json({
          error: `Stock insuficiente para ${prod.name} (Talla ${reqItem.size}). Disponible: ${available}.`,
        });
        return;
      }
      subtotal += prod.price * qty;
      resolvedItems.push({
        productId: prod.id,
        name: prod.name,
        image: prod.images[0],
        color: String(reqItem.colorName || prod.colors[0]?.name || 'Estándar'),
        size: String(reqItem.size),
        quantity: qty,
        unitPrice: prod.price,
      });
    }

    // Authoritative coupon check
    let discount = 0;
    let appliedCode: string | undefined;
    if (body.couponCode) {
      const cleanCode = String(body.couponCode).trim().toUpperCase();
      const coupon = store.coupons.find((c) => c.code === cleanCode && c.active);
      if (coupon && subtotal >= coupon.minOrder) {
        appliedCode = coupon.code;
        discount =
          coupon.type === 'percentage'
            ? Number(((subtotal * coupon.value) / 100).toFixed(2))
            : Math.min(coupon.value, subtotal);
      }
    }

    // Authoritative national shipping calculation
    const shippingQuote = resolveShippingQuote(store.shippingRates, {
      department: body.address?.department || 'Lima',
      province: body.address?.province || 'Lima',
      district: body.address?.district || 'Miraflores',
      deliveryMethod,
      subtotal,
      freeShippingThreshold: store.settings.freeShippingThreshold,
    });

    const total = Number(
      Math.max(0, subtotal - discount + shippingQuote.cost).toFixed(2)
    );
    let num = Math.floor(1050 + Math.random() * 8900);
    let orderId = `BP-2027-${num}`;
    while (store.orders.some((o) => o.id === orderId)) {
      num = Math.floor(1050 + Math.random() * 8900);
      orderId = `BP-2027-${num}`;
    }
    const now = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      customer: {
        firstName,
        lastName,
        dni,
        phone,
        email,
      },
      deliveryMethod,
      address:
        deliveryMethod !== 'pickup'
          ? {
              department: body.address!.department!.trim(),
              province: body.address!.province!.trim(),
              district: body.address!.district!.trim(),
              street: body.address!.street!.trim(),
              reference: body.address?.reference?.trim() || '',
              recipientName:
                body.address?.recipientName?.trim() || `${firstName} ${lastName}`,
              recipientPhone: body.address?.recipientPhone?.trim() || phone,
            }
          : undefined,
      shippingZoneLabel: shippingQuote.zoneLabel,
      carrierName: shippingQuote.carrier,
      payment: {
        id: `PAY-${num}`,
        method: paymentMethod,
        amount: total,
        status: 'PENDING',
      },
      statusHistory: [
        {
          fromStatus: null,
          toStatus: 'PENDING_PAYMENT',
          changedBy: 'Sistema',
          note: `Pedido registrado (${paymentMethod}). Esperando comprobante de pago.`,
          timestamp: now,
        },
      ],
      items: resolvedItems,
      subtotal,
      discount,
      shipping: shippingQuote.cost,
      total,
      couponCode: appliedCode,
      status: 'PENDING_PAYMENT',
      createdAt: now,
    };

    store.orders.unshift(newOrder);

    // Upsert customer record
    const custIdx = store.customers.findIndex(
      (c) => c.email.toLowerCase() === newOrder.customer.email.toLowerCase()
    );
    if (custIdx > -1) {
      store.customers[custIdx] = {
        ...store.customers[custIdx],
        ordersCount: store.customers[custIdx].ordersCount + 1,
        totalSpent: Number((store.customers[custIdx].totalSpent + total).toFixed(2)),
      };
    } else {
      store.customers.unshift({
        id: `cust-${Date.now()}`,
        firstName: newOrder.customer.firstName,
        lastName: newOrder.customer.lastName,
        email: newOrder.customer.email,
        phone: newOrder.customer.phone,
        dni: newOrder.customer.dni,
        city: newOrder.address
          ? `${newOrder.address.district}, ${newOrder.address.department}`
          : 'Showroom Miraflores, Lima',
        ordersCount: 1,
        totalSpent: total,
        joinedAt: now.slice(0, 10),
      });
    }

    appendAudit(
      'Cliente',
      'ORDER_CREATED',
      'Order',
      newOrder.id,
      `Pedido ${newOrder.id} por S/ ${total} vía ${paymentMethod}`
    );
    persistStore();

    res.status(201).json({ order: newOrder });
  });

  // Upload Yape / Plin Payment Proof (Sets UNDER_REVIEW, NEVER auto-approves!)
  app.post('/api/payments/proof', (req, res) => {
    const body = req.body as {
      orderId?: string;
      method?: PaymentMethod;
      operationNumber?: string;
      paidAt?: string;
      transferredAmount?: number;
      proofDataUrl?: string;
    };

    const order = store.orders.find((o) => o.id === body.orderId);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }
    if (order.status === 'CANCELLED') {
      res.status(400).json({ error: 'No se puede adjuntar comprobante a un pedido cancelado.' });
      return;
    }
    if (order.payment.status === 'APPROVED') {
      res.status(400).json({ error: 'Este pago ya fue verificado.' });
      return;
    }

    const method: PaymentMethod = body.method === 'PLIN' ? 'PLIN' : 'YAPE';
    const operationNumber = String(body.operationNumber || '').trim().toUpperCase();
    const paidAt = String(body.paidAt || '').trim();
    const transferredAmount = Number(body.transferredAmount);
    const proofDataUrl = String(body.proofDataUrl || '').trim();

    if (!operationNumber || operationNumber.length < 4 || operationNumber.length > 40) {
      res.status(400).json({ error: 'Ingresa un número de operación válido.' });
      return;
    }
    if (!paidAt) {
      res.status(400).json({ error: 'Indica la fecha y hora del pago.' });
      return;
    }
    if (!Number.isFinite(transferredAmount) || transferredAmount <= 0) {
      res.status(400).json({ error: 'Ingresa el importe transferido.' });
      return;
    }
    if (
      !proofDataUrl ||
      !/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/.test(proofDataUrl) ||
      proofDataUrl.length > 3_200_000
    ) {
      res.status(400).json({
        error: 'Adjunta una imagen válida del comprobante (PNG, JPG o WEBP, máx 2MB).',
      });
      return;
    }

    // Prevent duplicate operation number reuse across orders
    const duplicate = store.orders.find(
      (o) =>
        o.id !== order.id &&
        o.payment.proof &&
        o.payment.proof.method === method &&
        o.payment.proof.operationNumber.toUpperCase() === operationNumber &&
        o.payment.status !== 'REJECTED'
    );
    if (duplicate) {
      res.status(409).json({
        error: `El número de operación ${operationNumber} (${method}) ya fue registrado en otro pedido.`,
      });
      return;
    }

    const now = new Date().toISOString();
    const prevStatus = order.status;

    order.payment = {
      ...order.payment,
      method,
      status: 'UNDER_REVIEW',
      reviewNote: undefined,
      proof: {
        id: `PRF-${Date.now()}`,
        method,
        operationNumber,
        paidAt,
        transferredAmount,
        proofDataUrl,
        submittedAt: now,
      },
    };
    order.status = 'PAYMENT_REVIEW';
    order.statusHistory.push({
      fromStatus: prevStatus,
      toStatus: 'PAYMENT_REVIEW',
      changedBy: 'Cliente',
      note: `Comprobante ${method} Op. ${operationNumber} (S/ ${transferredAmount.toFixed(2)}) enviado para validación manual.`,
      timestamp: now,
    });

    appendAudit(
      'Cliente',
      'PAYMENT_PROOF_SUBMITTED',
      'Payment',
      order.payment.id,
      `Comprobante ${method} Op. ${operationNumber} adjuntado al pedido ${order.id}`
    );
    persistStore();

    res.json({ order });
  });

  // Public Order Lookup (limited safe tracking unless DNI matches)
  app.get('/api/orders/:id', (req, res) => {
    const order = store.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }
    const dni = String(req.query.dni || '').trim();
    if (dni && dni === order.customer.dni) {
      res.json({ order });
      return;
    }
    res.json({
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.payment.status,
        paymentMethod: order.payment.method,
        carrierName: order.carrierName,
        shippingZoneLabel: order.shippingZoneLabel,
        shipment: order.shipment,
        statusHistory: order.statusHistory,
        total: order.total,
        createdAt: order.createdAt,
      },
    });
  });

  // Public Tracking Endpoint
  app.get('/api/orders/:id/tracking', (req, res) => {
    const order = store.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }
    res.json({
      orderId: order.id,
      status: order.status,
      paymentStatus: order.payment.status,
      carrierName: order.carrierName,
      shippingZoneLabel: order.shippingZoneLabel,
      shipment: order.shipment || null,
      statusHistory: order.statusHistory,
    });
  });

  // Admin Authentication
  app.get('/api/admin/auth/status', (req, res) => {
    const envConfigured = Boolean(process.env.ADMIN_PASSCODE?.trim());
    const claimed = Boolean(store.adminCredential);
    const auth = req.headers.authorization || '';
    const authenticated = auth.startsWith('Bearer ')
      ? Boolean(verifyAdminToken(auth.slice(7).trim()))
      : false;
    res.json({ envConfigured, claimed, authenticated });
  });

  app.post('/api/admin/auth/bootstrap', (req, res) => {
    if (process.env.ADMIN_PASSCODE?.trim() || store.adminCredential) {
      res.status(403).json({ error: 'La contraseña administrativa ya está configurada.' });
      return;
    }
    const password = String((req.body as { password?: string }).password || '');
    if (password.length < 8) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }
    store.adminCredential = hashPassword(password);
    appendAudit('Sistema', 'ADMIN_CLAIMED', 'User', 'admin', 'Credencial administrativa inicial configurada');
    persistStore();
    const token = signAdminToken('Administrador');
    res.json({ token, actor: 'Administrador' });
  });

  app.post('/api/admin/auth/login', (req, res) => {
    const clientIp = req.ip || 'local';
    if (!checkLoginThrottle(clientIp)) {
      res.status(429).json({
        error: 'Demasiados intentos fallidos. Espera unos minutos antes de reintentar.',
      });
      return;
    }

    const password = String((req.body as { password?: string }).password || '');
    const envPass = process.env.ADMIN_PASSCODE?.trim();

    if (envPass) {
      const a = Buffer.from(password);
      const b = Buffer.from(envPass);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        recordLoginFailure(clientIp);
        res.status(401).json({ error: 'Clave administrativa incorrecta.' });
        return;
      }
      clearLoginFailures(clientIp);
      const token = signAdminToken('Administrador');
      res.json({ token, actor: 'Administrador' });
      return;
    }

    if (!store.adminCredential) {
      res.status(400).json({ error: 'Configura primero la contraseña de administrador.' });
      return;
    }

    const valid = verifyPassword(
      password,
      store.adminCredential.salt,
      store.adminCredential.hash
    );
    if (!valid) {
      recordLoginFailure(clientIp);
      res.status(401).json({ error: 'Clave administrativa incorrecta.' });
      return;
    }

    clearLoginFailures(clientIp);
    const token = signAdminToken('Administrador');
    res.json({ token, actor: 'Administrador' });
  });

  // Protected Admin Endpoints
  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    res.json({
      orders: store.orders,
      products: store.products,
      customers: store.customers,
      coupons: store.coupons,
      banners: store.banners,
      shippingRates: store.shippingRates,
      settings: store.settings,
      auditLogs: store.auditLogs,
    });
  });

  // Validate / Reject Yape or Plin Payment
  app.patch('/api/admin/payments/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const { decision, note } = req.body as {
      decision?: 'APPROVED' | 'REJECTED';
      note?: string;
    };
    const order = store.orders.find((o) => o.payment.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Pago no encontrado.' });
      return;
    }
    if (decision !== 'APPROVED' && decision !== 'REJECTED') {
      res.status(400).json({ error: 'Decisión de pago inválida.' });
      return;
    }

    const actor = req.adminActor || 'Administrador';
    const now = new Date().toISOString();
    const prevOrderStatus = order.status;

    if (decision === 'APPROVED') {
      if (order.payment.status !== 'APPROVED') {
        // Decrement inventory atomically when confirming payment
        for (const item of order.items) {
          const prod = store.products.find((p) => p.id === item.productId);
          if (prod && typeof prod.stock[item.size] === 'number') {
            prod.stock[item.size] = Math.max(0, prod.stock[item.size] - item.quantity);
          }
        }
      }

      order.payment = {
        ...order.payment,
        status: 'APPROVED',
        reviewedBy: actor,
        reviewNote: note?.trim() || 'Abono verificado en aplicación bancaria',
        reviewedAt: now,
      };
      order.status = 'CONFIRMED';
      order.statusHistory.push({
        fromStatus: prevOrderStatus,
        toStatus: 'CONFIRMED',
        changedBy: actor,
        note: `Pago ${order.payment.method} aprobado (${order.payment.reviewNote}).`,
        timestamp: now,
      });

      appendAudit(
        actor,
        'PAYMENT_APPROVED',
        'Payment',
        order.payment.id,
        `Pago aprobado para pedido ${order.id} (S/ ${order.total})`
      );
    } else {
      const rejectReason = note?.trim();
      if (!rejectReason) {
        res.status(400).json({ error: 'Indica el motivo del rechazo del comprobante.' });
        return;
      }
      order.payment = {
        ...order.payment,
        status: 'REJECTED',
        reviewedBy: actor,
        reviewNote: rejectReason,
        reviewedAt: now,
      };
      order.status = 'PENDING_PAYMENT';
      order.statusHistory.push({
        fromStatus: prevOrderStatus,
        toStatus: 'PENDING_PAYMENT',
        changedBy: actor,
        note: `Pago rechazado: ${rejectReason}`,
        timestamp: now,
      });

      appendAudit(
        actor,
        'PAYMENT_REJECTED',
        'Payment',
        order.payment.id,
        `Pago rechazado para pedido ${order.id}: ${rejectReason}`
      );
    }

    persistStore();
    res.json({ order, products: store.products, auditLogs: store.auditLogs });
  });

  // Update Order Status (Blocks preparation/dispatch if payment is not APPROVED)
  app.patch('/api/admin/orders/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const { status, note } = req.body as { status?: OrderStatus; note?: string };
    const order = store.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }

    const allowed: OrderStatus[] = [
      'PENDING_PAYMENT',
      'PAYMENT_REVIEW',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ error: 'Estado de pedido inválido.' });
      return;
    }

    const requiresApprovedPayment: OrderStatus[] = [
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
    ];
    if (requiresApprovedPayment.includes(status) && order.payment.status !== 'APPROVED') {
      res.status(409).json({
        error:
          'Bloqueado por seguridad: el pedido no puede pasar a preparación ni despacho sin que el pago Yape/Plin esté VERIFICADO.',
      });
      return;
    }

    const actor = req.adminActor || 'Administrador';
    const prev = order.status;
    const now = new Date().toISOString();
    order.status = status;
    order.statusHistory.push({
      fromStatus: prev,
      toStatus: status,
      changedBy: actor,
      note: note?.trim() || `Estado actualizado a ${status}`,
      timestamp: now,
    });

    appendAudit(
      actor,
      'ORDER_STATUS_UPDATED',
      'Order',
      order.id,
      `${prev} -> ${status}`
    );
    persistStore();
    res.json({ order, auditLogs: store.auditLogs });
  });

  // Register Shipment & Tracking Number
  app.post('/api/admin/shipments', requireAdmin, (req: AuthenticatedRequest, res) => {
    const body = req.body as {
      orderId?: string;
      carrier?: string;
      agencyOffice?: string;
      trackingNumber?: string;
      notes?: string;
    };

    const order = store.orders.find((o) => o.id === body.orderId);
    if (!order) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }
    if (order.payment.status !== 'APPROVED') {
      res.status(409).json({
        error: 'No se puede despachar un pedido cuyo pago no ha sido verificado.',
      });
      return;
    }
    if (!body.carrier?.trim() || !body.trackingNumber?.trim()) {
      res.status(400).json({ error: 'Ingresa empresa de transporte y número de seguimiento.' });
      return;
    }

    const actor = req.adminActor || 'Administrador';
    const now = new Date().toISOString();
    const prev = order.status;

    order.shipment = {
      id: `SHP-${Date.now()}`,
      carrier: body.carrier.trim(),
      agencyOffice: body.agencyOffice?.trim() || undefined,
      trackingNumber: body.trackingNumber.trim().toUpperCase(),
      dispatchedAt: now,
      notes: body.notes?.trim() || undefined,
    };
    order.carrierName = order.shipment.carrier;
    order.status = 'SHIPPED';
    order.statusHistory.push({
      fromStatus: prev,
      toStatus: 'SHIPPED',
      changedBy: actor,
      note: `Entregado a ${order.shipment.carrier} · Tracking ${order.shipment.trackingNumber}`,
      timestamp: now,
    });

    appendAudit(
      actor,
      'SHIPMENT_DISPATCHED',
      'Shipment',
      order.shipment.id,
      `Despacho pedido ${order.id} vía ${order.shipment.carrier} (${order.shipment.trackingNumber})`
    );
    persistStore();
    res.json({ order, auditLogs: store.auditLogs });
  });

  // Configurable Shipping Rates CRUD
  app.put('/api/admin/shipping/rates', requireAdmin, (req: AuthenticatedRequest, res) => {
    const body = req.body as { rates?: ShippingRate[] };
    if (!Array.isArray(body.rates)) {
      res.status(400).json({ error: 'Lista de tarifas inválida.' });
      return;
    }
    store.shippingRates = body.rates;
    appendAudit(
      req.adminActor || 'Administrador',
      'SHIPPING_RATES_UPDATED',
      'ShippingRate',
      'ALL',
      `Actualizadas ${body.rates.length} reglas de envío nacional`
    );
    persistStore();
    res.json({ rates: store.shippingRates, auditLogs: store.auditLogs });
  });

  // Products CRUD
  app.post('/api/admin/products', requireAdmin, (req: AuthenticatedRequest, res) => {
    const product = req.body as Product;
    if (!product?.name || !product?.sku) {
      res.status(400).json({ error: 'Nombre y SKU obligatorios.' });
      return;
    }
    store.products.unshift(product);
    appendAudit(req.adminActor || 'Administrador', 'PRODUCT_CREATED', 'Product', product.id, product.name);
    persistStore();
    res.status(201).json({ products: store.products });
  });

  app.put('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    const updated = req.body as Product;
    store.products = store.products.map((p) => (p.id === req.params.id ? updated : p));
    appendAudit(req.adminActor || 'Administrador', 'PRODUCT_UPDATED', 'Product', req.params.id, updated.name);
    persistStore();
    res.json({ products: store.products });
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req: AuthenticatedRequest, res) => {
    store.products = store.products.filter((p) => p.id !== req.params.id);
    appendAudit(req.adminActor || 'Administrador', 'PRODUCT_DELETED', 'Product', req.params.id, 'Producto eliminado');
    persistStore();
    res.json({ products: store.products });
  });

  // Store Settings (Yape/Plin numbers, WhatsApp, Announcement)
  app.put('/api/admin/settings', requireAdmin, (req: AuthenticatedRequest, res) => {
    const body = req.body as Partial<StoreSettings>;
    const sanitized: Partial<StoreSettings> = {};
    if (typeof body.brandName === 'string') sanitized.brandName = body.brandName.trim();
    if (typeof body.tagline === 'string') sanitized.tagline = body.tagline.trim();
    if (typeof body.announcementText === 'string') sanitized.announcementText = body.announcementText.trim();
    if (typeof body.announcementVisible === 'boolean') sanitized.announcementVisible = body.announcementVisible;
    if (typeof body.whatsappPhone === 'string') sanitized.whatsappPhone = body.whatsappPhone.trim();
    if (typeof body.contactEmail === 'string') sanitized.contactEmail = body.contactEmail.trim();
    if (typeof body.showroomAddress === 'string') sanitized.showroomAddress = body.showroomAddress.trim();
    if (typeof body.instagramHandle === 'string') sanitized.instagramHandle = body.instagramHandle.trim();
    if (typeof body.yapeNumber === 'string') sanitized.yapeNumber = body.yapeNumber.trim();
    if (typeof body.yapeHolder === 'string') sanitized.yapeHolder = body.yapeHolder.trim();
    if (typeof body.plinNumber === 'string') sanitized.plinNumber = body.plinNumber.trim();
    if (typeof body.plinHolder === 'string') sanitized.plinHolder = body.plinHolder.trim();
    if (typeof body.freeShippingThreshold === 'number' && Number.isFinite(body.freeShippingThreshold)) {
      sanitized.freeShippingThreshold = Math.max(0, body.freeShippingThreshold);
    }
    if (typeof body.limaShippingCost === 'number' && Number.isFinite(body.limaShippingCost)) {
      sanitized.limaShippingCost = Math.max(0, body.limaShippingCost);
    }
    if (typeof body.provinceShippingCost === 'number' && Number.isFinite(body.provinceShippingCost)) {
      sanitized.provinceShippingCost = Math.max(0, body.provinceShippingCost);
    }

    store.settings = { ...store.settings, ...sanitized };
    appendAudit(
      req.adminActor || 'Administrador',
      'SETTINGS_UPDATED',
      'Settings',
      'store',
      'Configuración general / Yape / Plin actualizada'
    );
    persistStore();
    res.json({ settings: store.settings, auditLogs: store.auditLogs });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`BEACH POLO Perú Sales Server running on http://localhost:${port}`);
  });
}

startServer();
