import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  CreditCard,
  Edit3,
  FileText,
  History,
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Trash2,
  Truck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CATEGORIES, COLLECTIONS, MEDIA_ASSETS } from '../data/catalog';
import {
  CategorySlug,
  CollectionSlug,
  Order,
  OrderStatus,
  Product,
  ShippingRate,
} from '../types/ecommerce';
import { formatPEN } from '../utils/analytics';
import { BrandLogo } from '../components/BrandLogo';
import { ResilientImage } from '../components/ResilientImage';
import { SeoHead } from '../components/SeoHead';

type AdminTab =
  | 'dashboard'
  | 'payments'
  | 'orders'
  | 'shipments'
  | 'products'
  | 'rates'
  | 'customers'
  | 'reports'
  | 'settings';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAYMENT_REVIEW',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export function AdminDashboardPage() {
  const {
    products,
    orders,
    customers,
    shippingRates,
    auditLogs,
    settings,
    adminToken,
    adminActor,
    fetchAdminAuthStatus,
    bootstrapAdmin,
    loginAdmin,
    logoutAdmin,
    verifyPayment,
    updateOrderStatus,
    createShipment,
    saveShippingRates,
    saveProduct,
    deleteProduct,
    updateSettings,
  } = useStore();

  const [authStatus, setAuthStatus] = useState<{
    envConfigured: boolean;
    claimed: boolean;
    authenticated: boolean;
  } | null>(null);
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirm, setAuthConfirm] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState<string | null>(null);

  // Payment Verification Modal
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [paymentNote, setPaymentNote] = useState('');

  // Shipment Modal
  const [shipOrder, setShipOrder] = useState<Order | null>(null);
  const [shipCarrier, setShipCarrier] = useState('Shalom');
  const [shipAgency, setShipAgency] = useState('');
  const [shipTracking, setShipTracking] = useState('');
  const [shipNotes, setShipNotes] = useState('');

  // Order filter & history modal
  const [orderSearch, setOrderSearch] = useState('');
  const [historyOrder, setHistoryOrder] = useState<Order | null>(null);

  // Shipping rates local draft
  const [ratesDraft, setRatesDraft] = useState<ShippingRate[]>(shippingRates);
  useEffect(() => {
    setRatesDraft(shippingRates);
  }, [shippingRates]);

  // Product Form Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pPrice, setPPrice] = useState('89');
  const [pCompare, setPCompare] = useState('');
  const [pCat, setPCat] = useState<CategorySlug>('hombre');
  const [pCol, setPCol] = useState<CollectionSlug>('summer');
  const [pDesc, setPDesc] = useState('');
  const [pStockM, setPStockM] = useState('15');
  const [pImage, setPImage] = useState(MEDIA_ASSETS.poloOcean);

  // Settings draft
  const [whatsappDraft, setWhatsappDraft] = useState(settings.whatsappPhone);
  const [announcementDraft, setAnnouncementDraft] = useState(settings.announcementText);
  const [yapeNumberDraft, setYapeNumberDraft] = useState(settings.yapeNumber);
  const [yapeHolderDraft, setYapeHolderDraft] = useState(settings.yapeHolder);
  const [plinNumberDraft, setPlinNumberDraft] = useState(settings.plinNumber);
  const [plinHolderDraft, setPlinHolderDraft] = useState(settings.plinHolder);

  useEffect(() => {
    setWhatsappDraft(settings.whatsappPhone);
    setAnnouncementDraft(settings.announcementText);
    setYapeNumberDraft(settings.yapeNumber);
    setYapeHolderDraft(settings.yapeHolder);
    setPlinNumberDraft(settings.plinNumber);
    setPlinHolderDraft(settings.plinHolder);
  }, [settings]);

  useEffect(() => {
    fetchAdminAuthStatus().then(setAuthStatus);
  }, [adminToken]);

  const showSuccess = (msg: string) => {
    setActionErr(null);
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  };

  const showError = (err: unknown) => {
    setActionMsg(null);
    setActionErr(err instanceof Error ? err.message : 'Ocurrió un error.');
  };

  const pendingPayments = useMemo(
    () => orders.filter((o) => o.payment.status === 'UNDER_REVIEW'),
    [orders]
  );

  const verifiedRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.payment.status === 'APPROVED' && o.status !== 'CANCELLED')
        .reduce((acc, o) => acc + o.total, 0),
    [orders]
  );

  const readyToShipOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.payment.status === 'APPROVED' &&
          (o.status === 'CONFIRMED' || o.status === 'PROCESSING' || o.status === 'SHIPPED')
      ),
    [orders]
  );

  const totalStock = useMemo(
    () =>
      products.reduce(
        (acc, p) => acc + Object.values(p.stock).reduce((s, n) => s + n, 0),
        0
      ),
    [products]
  );

  // Auth Gate
  if (!adminToken) {
    const needsBootstrap =
      authStatus && !authStatus.envConfigured && !authStatus.claimed;

    const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError(null);
      if (needsBootstrap && authPassword !== authConfirm) {
        setAuthError('Las contraseñas no coinciden.');
        return;
      }
      try {
        setAuthLoading(true);
        if (needsBootstrap) {
          await bootstrapAdmin(authPassword);
        } else {
          await loginAdmin(authPassword);
        }
        setAuthPassword('');
        setAuthConfirm('');
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Error de autenticación.');
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#0B0D0F] text-white flex items-center justify-center p-4">
        <SeoHead
          title="Acceso Administrativo | BEACH POLO"
          description="Panel de control de ventas, pagos Yape/Plin y despachos."
          canonicalPath="/admin"
        />
        <div className="w-full max-w-md bg-white text-[#0B0D0F] rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/8 pb-4">
            <BrandLogo tone="dark" />
            <Lock className="w-5 h-5 text-[#0E5A78]" />
          </div>

          <div className="space-y-1.5">
            <h1 className="font-display font-extrabold text-xl">
              {needsBootstrap
                ? 'Configurar acceso administrativo'
                : 'Panel Administrativo BEACH POLO'}
            </h1>
            <p className="text-xs text-[#0B0D0F]/65 leading-relaxed">
              {needsBootstrap
                ? 'Define la contraseña inicial del administrador para proteger la validación de pagos Yape/Plin, pedidos e inventario.'
                : 'Ingresa la clave administrativa para validar pagos, gestionar pedidos y controlar despachos.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                {needsBootstrap ? 'Nueva contraseña (mín. 8 caracteres)' : 'Contraseña'}
              </label>
              <input
                type="password"
                required
                minLength={needsBootstrap ? 8 : 1}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
              />
            </div>

            {needsBootstrap && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={authConfirm}
                  onChange={(e) => setAuthConfirm(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                />
              </div>
            )}

            {authError && (
              <p role="alert" className="text-xs font-semibold text-red-600">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-md hover:bg-[#0E5A78] disabled:opacity-60 transition-colors"
            >
              {authLoading
                ? 'Verificando...'
                : needsBootstrap
                  ? 'Activar Panel Admin'
                  : 'Ingresar al Panel'}
            </button>
          </form>

          <Link
            to="/"
            className="block text-center text-xs text-[#0B0D0F]/60 hover:text-[#0B0D0F]"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingProduct(null);
    setPName('');
    setPSku(`BP-NEW-${Math.floor(10 + Math.random() * 89)}`);
    setPPrice('89');
    setPCompare('');
    setPCat('hombre');
    setPCol('summer');
    setPDesc('Polo de algodón Pima peruano de corte moderno.');
    setPStockM('15');
    setPImage(MEDIA_ASSETS.poloOcean);
    setModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPSku(prod.sku);
    setPPrice(String(prod.price));
    setPCompare(prod.compareAtPrice ? String(prod.compareAtPrice) : '');
    setPCat(prod.category);
    setPCol(prod.collection);
    setPDesc(prod.description);
    setPStockM(String(prod.stock['M'] ?? Object.values(prod.stock)[0] ?? 10));
    setPImage(prod.images[0]);
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(pPrice) || 89;
    const numericCompare = pCompare ? Number(pCompare) : undefined;
    const qty = Number(pStockM) || 10;
    const slug = pName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      if (editingProduct) {
        await saveProduct(
          {
            ...editingProduct,
            name: pName.trim(),
            sku: pSku.trim(),
            price: numericPrice,
            compareAtPrice: numericCompare,
            category: pCat,
            collection: pCol,
            description: pDesc.trim(),
            images: [pImage, ...editingProduct.images.slice(1)],
            stock: { ...editingProduct.stock, M: qty },
          },
          true
        );
        showSuccess('Producto actualizado en el catálogo.');
      } else {
        await saveProduct(
          {
            id: `prod-${Date.now()}`,
            sku: pSku.trim(),
            slug: slug || `producto-${Date.now()}`,
            name: pName.trim().toUpperCase(),
            subtitle: 'Algodón Pima Peruano · Edición Summer 2027',
            description: pDesc.trim(),
            fabric: '100% Algodón Pima Peruano',
            fit: 'Regular Modern Fit',
            price: numericPrice,
            compareAtPrice: numericCompare,
            category: pCat,
            collection: pCol,
            images: [pImage, MEDIA_ASSETS.heroDesktop],
            colors: [
              { name: 'Azul Océano', hex: '#0E5A78' },
              { name: 'Arena', hex: '#E8D8BD' },
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            stock: { S: qty, M: qty, L: qty, XL: Math.max(2, Math.floor(qty / 2)) },
            rating: 5.0,
            reviewCount: 0,
            reviews: [],
            isNew: true,
          },
          false
        );
        showSuccess('Nuevo producto publicado.');
      }
      setModalOpen(false);
    } catch (err) {
      showError(err);
    }
  };

  const menuItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'payments',
      label: 'Control de Pagos',
      icon: CreditCard,
      badge: pendingPayments.length || undefined,
    },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'shipments', label: 'Despachos', icon: Truck },
    { id: 'products', label: 'Inventario', icon: Package },
    { id: 'rates', label: 'Zonas y Tarifas', icon: MapPin },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'reports', label: 'Reportes & Auditoría', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const yapeCount = orders.filter((o) => o.payment.method === 'YAPE').length;
  const plinCount = orders.filter((o) => o.payment.method === 'PLIN').length;
  const totalPaymentCount = Math.max(1, yapeCount + plinCount);

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#0B0D0F] flex flex-col lg:flex-row">
      <SeoHead
        title="Panel Administrativo | BEACH POLO Perú"
        description="Control de pagos Yape/Plin, pedidos, inventario y despachos nacionales."
        canonicalPath="/admin"
      />

      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-[#0B0D0F] text-white shrink-0 flex flex-col justify-between">
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
            <Link to="/">
              <BrandLogo tone="light" showSymbol={false} />
            </Link>
            <span className="text-[11px] font-mono text-[#E8D8BD]">PERÚ OPS</span>
          </div>

          <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#0E5A78] text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded bg-[#B89B5E] text-[#0B0D0F] text-[10px] font-bold tabular-nums">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-4 border-t border-white/10 space-y-2">
          <div className="text-[11px] text-white/55 px-1">
            Sesión: <strong className="text-white">{adminActor || 'Admin'}</strong>
          </div>
          <Link
            to="/"
            className="block w-full py-2 px-3 text-center text-xs font-semibold bg-white/10 rounded-md hover:bg-white/20 transition-colors"
          >
            Ver tienda online →
          </Link>
          <button
            type="button"
            onClick={logoutAdmin}
            className="w-full py-2 px-3 text-xs text-white/75 hover:text-white inline-flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="h-16 bg-white border-b border-black/8 px-6 flex items-center justify-between gap-4">
          <div className="text-xs text-[#0B0D0F]/60 flex items-center gap-2">
            <span>BEACH POLO Operaciones</span>
            <span>/</span>
            <span className="font-semibold text-[#0B0D0F] capitalize">{tab}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#0B0D0F] text-white text-xs font-semibold rounded-md hover:bg-[#0E5A78] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8 space-y-6">
          {actionMsg && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
              {actionMsg}
            </div>
          )}
          {actionErr && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
              {actionErr}
            </div>
          )}

          {tab === 'dashboard' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Ingresos Verificados', value: formatPEN(verifiedRevenue) },
                  { label: 'Pagos por Verificar', value: String(pendingPayments.length) },
                  { label: 'Pedidos Totales', value: String(orders.length) },
                  { label: 'Stock Total', value: `${totalStock} u.` },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-white p-5 rounded-xl border border-black/8"
                  >
                    <p className="text-xs text-[#0B0D0F]/55">{kpi.label}</p>
                    <p className="mt-1.5 font-display font-bold text-2xl tabular-nums text-[#0B0D0F]">
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>

              {pendingPayments.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-[#B89B5E]/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display font-bold text-base">
                        Pagos Yape / Plin pendientes de verificación ({pendingPayments.length})
                      </h2>
                      <p className="text-xs text-[#0B0D0F]/60">
                        Contrasta el número de operación e importe en tu app antes de aprobar.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTab('payments')}
                      className="text-xs font-semibold text-[#0E5A78] hover:underline"
                    >
                      Ir a Control de Pagos →
                    </button>
                  </div>

                  <div className="divide-y divide-black/8">
                    {pendingPayments.map((ord) => (
                      <div
                        key={ord.id}
                        className="py-3 flex flex-wrap items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold">{ord.id}</span> ·{' '}
                          <span className="font-semibold">
                            {ord.customer.firstName} {ord.customer.lastName}
                          </span>{' '}
                          · {ord.payment.method} Op.{' '}
                          <span className="font-mono">
                            {ord.payment.proof?.operationNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold tabular-nums">
                            {formatPEN(ord.total)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setInspectOrder(ord);
                              setPaymentNote('');
                            }}
                            className="px-3 py-1.5 bg-[#0B0D0F] text-white rounded font-semibold hover:bg-[#0E5A78]"
                          >
                            Revisar comprobante
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-black/8 space-y-4">
                  <h2 className="font-display font-bold text-base">
                    Distribución Yape vs Plin
                  </h2>
                  <div className="space-y-3 text-xs">
                    {[
                      {
                        label: 'Yape',
                        count: yapeCount,
                        pct: Math.round((yapeCount / totalPaymentCount) * 100),
                        color: '#0E5A78',
                      },
                      {
                        label: 'Plin',
                        count: plinCount,
                        pct: Math.round((plinCount / totalPaymentCount) * 100),
                        color: '#B89B5E',
                      },
                    ].map((row) => (
                      <div key={row.label} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-semibold">{row.label}</span>
                          <span className="tabular-nums">
                            {row.count} pedidos ({row.pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-black/8 space-y-3">
                  <h2 className="font-display font-bold text-base">
                    Actividad reciente
                  </h2>
                  {auditLogs.length === 0 ? (
                    <p className="text-xs text-[#0B0D0F]/55">
                      Los cambios administrativos quedarán auditados aquí.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {auditLogs.slice(0, 5).map((log) => (
                        <li key={log.id} className="border-b border-black/5 pb-2">
                          <p className="font-semibold">{log.details}</p>
                          <p className="text-[#0B0D0F]/50">
                            {log.actor} · {new Date(log.timestamp).toLocaleTimeString('es-PE')}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'payments' && (
            <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/8">
                <h2 className="font-display font-bold text-base">
                  Control de Pagos Manuales (Yape & Plin)
                </h2>
                <p className="text-xs text-[#0B0D0F]/60">
                  Ningún pedido avanza a preparación sin aprobación manual del abono real.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#0B0D0F]/60 uppercase">
                    <tr>
                      <th className="py-3 px-4">Pedido</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Método / Op.</th>
                      <th className="py-3 px-4 text-right">Esperado</th>
                      <th className="py-3 px-4 text-right">Declarado</th>
                      <th className="py-3 px-4">Estado Pago</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#FAF7F2]/60">
                        <td className="py-3 px-4 font-mono font-bold">{ord.id}</td>
                        <td className="py-3 px-4">
                          {ord.customer.firstName} {ord.customer.lastName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold">{ord.payment.method}</span>{' '}
                          <span className="font-mono text-[#0B0D0F]/65">
                            {ord.payment.proof?.operationNumber || 'Sin comprobante'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums">
                          {formatPEN(ord.total)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">
                          {ord.payment.proof
                            ? formatPEN(ord.payment.proof.transferredAmount)
                            : '—'}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          {ord.payment.status}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setInspectOrder(ord);
                              setPaymentNote(ord.payment.reviewNote || '');
                            }}
                            className="px-3 py-1.5 bg-[#0B0D0F] text-white rounded text-xs font-semibold hover:bg-[#0E5A78]"
                          >
                            {ord.payment.status === 'UNDER_REVIEW' ? 'Validar' : 'Ver detalle'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display font-bold text-base">
                  Gestión de Pedidos ({orders.length})
                </h2>
                <input
                  type="search"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Filtrar por orden o cliente..."
                  className="px-3 py-1.5 text-xs border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#0B0D0F]/60 uppercase">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Destino / Modalidad</th>
                      <th className="py-3 px-4">Pago</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-right">Historial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6">
                    {orders
                      .filter(
                        (o) =>
                          o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          `${o.customer.firstName} ${o.customer.lastName}`
                            .toLowerCase()
                            .includes(orderSearch.toLowerCase())
                      )
                      .map((order) => (
                        <tr key={order.id} className="hover:bg-[#FAF7F2]/60">
                          <td className="py-3 px-4 font-mono font-semibold">{order.id}</td>
                          <td className="py-3 px-4">
                            <p className="font-semibold">
                              {order.customer.firstName} {order.customer.lastName}
                            </p>
                            <p className="text-[#0B0D0F]/55">
                              DNI {order.customer.dni} · {order.customer.phone}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium">{order.shippingZoneLabel}</p>
                            <p className="text-[#0B0D0F]/55 capitalize">{order.deliveryMethod}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">{order.payment.method}</span> ·{' '}
                            <span>{order.payment.status}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-bold tabular-nums">
                            {formatPEN(order.total)}
                          </td>
                          <td className="py-3 px-4">
                            <select
                              aria-label={`Estado de ${order.id}`}
                              value={order.status}
                              onChange={async (e) => {
                                try {
                                  await updateOrderStatus(
                                    order.id,
                                    e.target.value as OrderStatus
                                  );
                                  showSuccess(`Estado de ${order.id} actualizado.`);
                                } catch (err) {
                                  showError(err);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded border border-black/15 bg-white text-xs font-semibold outline-none focus:border-[#0E5A78]"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setHistoryOrder(order)}
                              aria-label={`Ver historial de ${order.id}`}
                              className="p-1.5 rounded hover:bg-black/5 text-[#0E5A78]"
                            >
                              <History className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'shipments' && (
            <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/8">
                <h2 className="font-display font-bold text-base">
                  Módulo de Despachos Nacionales
                </h2>
                <p className="text-xs text-[#0B0D0F]/60">
                  Solo pedidos con pago verificado pueden asignarse a transporte y tracking.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#0B0D0F]/60 uppercase">
                    <tr>
                      <th className="py-3 px-4">Pedido</th>
                      <th className="py-3 px-4">Destinatario & Dirección</th>
                      <th className="py-3 px-4">Transportista</th>
                      <th className="py-3 px-4">Tracking</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6">
                    {readyToShipOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="py-3 px-4 font-mono font-bold">{ord.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold">
                            {ord.address?.recipientName || `${ord.customer.firstName} ${ord.customer.lastName}`}
                          </p>
                          <p className="text-[#0B0D0F]/60">
                            {ord.address
                              ? `${ord.address.street}, ${ord.address.district} - ${ord.address.department}`
                              : 'Showroom Miraflores'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          {ord.shipment?.carrier || ord.carrierName}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {ord.shipment?.trackingNumber || 'Sin asignar'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setShipOrder(ord);
                              setShipCarrier(ord.shipment?.carrier || ord.carrierName || 'Shalom');
                              setShipAgency(ord.shipment?.agencyOffice || '');
                              setShipTracking(ord.shipment?.trackingNumber || '');
                              setShipNotes(ord.shipment?.notes || '');
                            }}
                            className="px-3 py-1.5 bg-[#0E5A78] text-white rounded font-semibold hover:bg-[#082B3A]"
                          >
                            {ord.shipment ? 'Editar tracking' : 'Registrar despacho'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'rates' && (
            <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-base">
                    Zonas y Tarifas de Envío Nacional (Perú)
                  </h2>
                  <p className="text-xs text-[#0B0D0F]/60">
                    Tarifas y agencias configurables sin valores fijos en el código.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await saveShippingRates(ratesDraft);
                      showSuccess('Tarifas de envío guardadas.');
                    } catch (err) {
                      showError(err);
                    }
                  }}
                  className="px-4 py-2 bg-[#0B0D0F] text-white text-xs font-semibold rounded-md hover:bg-[#0E5A78]"
                >
                  Guardar tarifas
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#0B0D0F]/60 uppercase">
                    <tr>
                      <th className="py-3 px-4">Zona</th>
                      <th className="py-3 px-4">Destino</th>
                      <th className="py-3 px-4">Transportista</th>
                      <th className="py-3 px-4">Tarifa (S/)</th>
                      <th className="py-3 px-4">Tiempo</th>
                      <th className="py-3 px-4">Activa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6">
                    {ratesDraft.map((r, idx) => (
                      <tr key={r.id}>
                        <td className="py-3 px-4 font-mono font-semibold">{r.zoneType}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold">{r.department}</p>
                          {r.district && <p className="text-[#0B0D0F]/55">{r.district}</p>}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={r.carrier}
                            onChange={(e) => {
                              const copy = [...ratesDraft];
                              copy[idx] = { ...r, carrier: e.target.value };
                              setRatesDraft(copy);
                            }}
                            className="w-full px-2 py-1 border border-black/15 rounded"
                          />
                        </td>
                        <td className="py-3 px-4 w-28">
                          <input
                            type="number"
                            min={0}
                            value={r.rate}
                            onChange={(e) => {
                              const copy = [...ratesDraft];
                              copy[idx] = { ...r, rate: Number(e.target.value) || 0 };
                              setRatesDraft(copy);
                            }}
                            className="w-20 px-2 py-1 border border-black/15 rounded tabular-nums"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={r.estimatedDays}
                            onChange={(e) => {
                              const copy = [...ratesDraft];
                              copy[idx] = { ...r, estimatedDays: e.target.value };
                              setRatesDraft(copy);
                            }}
                            className="w-full px-2 py-1 border border-black/15 rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={r.active}
                            onChange={(e) => {
                              const copy = [...ratesDraft];
                              copy[idx] = { ...r, active: e.target.checked };
                              setRatesDraft(copy);
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between">
                <h2 className="font-display font-bold text-base">
                  Inventario y Catálogo ({products.length})
                </h2>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="px-3.5 py-1.5 bg-[#0E5A78] text-white text-xs font-semibold rounded-md"
                >
                  + Crear producto
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#0B0D0F]/60 uppercase">
                    <tr>
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4 text-right">Precio</th>
                      <th className="py-3 px-4 text-right">Stock</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6">
                    {products.map((prod) => {
                      const sumStock = Object.values(prod.stock).reduce((a, b) => a + b, 0);
                      return (
                        <tr key={prod.id} className="hover:bg-[#FAF7F2]/60">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 rounded overflow-hidden bg-[#FAF7F2] shrink-0">
                                <ResilientImage src={prod.images[0]} alt={prod.name} />
                              </div>
                              <div>
                                <p className="font-bold">{prod.name}</p>
                                <p className="text-[#0B0D0F]/55 capitalize">{prod.collection}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">{prod.sku}</td>
                          <td className="py-3 px-4 capitalize">{prod.category}</td>
                          <td className="py-3 px-4 text-right font-bold tabular-nums">
                            {formatPEN(prod.price)}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">{sumStock} u.</td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(prod)}
                                aria-label={`Editar ${prod.name}`}
                                className="p-1.5 rounded hover:bg-black/5 text-[#0E5A78]"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await deleteProduct(prod.id);
                                    showSuccess('Producto eliminado.');
                                  } catch (err) {
                                    showError(err);
                                  }
                                }}
                                aria-label={`Eliminar ${prod.name}`}
                                className="p-1.5 rounded hover:bg-black/5 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'customers' && (
            <div className="bg-white rounded-xl border border-black/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-black/8">
                <h2 className="font-display font-bold text-base">Clientes ({customers.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] text-[#0B0D0F]/60 uppercase">
                    <tr>
                      <th className="py-3 px-4">Nombre</th>
                      <th className="py-3 px-4">DNI / Celular</th>
                      <th className="py-3 px-4">Ciudad</th>
                      <th className="py-3 px-4 text-right">Pedidos</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/6">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-4">
                          <p className="font-semibold">{c.firstName} {c.lastName}</p>
                          <p className="text-[#0B0D0F]/55">{c.email}</p>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {c.dni} · {c.phone}
                        </td>
                        <td className="py-3 px-4">{c.city}</td>
                        <td className="py-3 px-4 text-right tabular-nums">{c.ordersCount}</td>
                        <td className="py-3 px-4 text-right font-bold tabular-nums">
                          {formatPEN(c.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-black/8 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0E5A78]" />
                  <h2 className="font-display font-bold text-base">
                    Registro de Auditoría Administrativa ({auditLogs.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-[#0B0D0F]/60 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Fecha</th>
                        <th className="py-2.5 px-3">Actor</th>
                        <th className="py-2.5 px-3">Acción</th>
                        <th className="py-2.5 px-3">Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/6">
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="py-2.5 px-3 font-mono text-[#0B0D0F]/60">
                            {new Date(log.timestamp).toLocaleString('es-PE')}
                          </td>
                          <td className="py-2.5 px-3 font-semibold">{log.actor}</td>
                          <td className="py-2.5 px-3 font-mono">{log.action}</td>
                          <td className="py-2.5 px-3">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await updateSettings({
                    whatsappPhone: whatsappDraft.trim(),
                    announcementText: announcementDraft.trim(),
                    announcementVisible: true,
                    yapeNumber: yapeNumberDraft.trim(),
                    yapeHolder: yapeHolderDraft.trim(),
                    plinNumber: plinNumberDraft.trim(),
                    plinHolder: plinHolderDraft.trim(),
                  });
                  showSuccess('Configuración de Yape, Plin y tienda guardada.');
                } catch (err) {
                  showError(err);
                }
              }}
              className="bg-white p-6 rounded-xl border border-black/8 space-y-5 max-w-2xl"
            >
              <h2 className="font-display font-bold text-lg">
                Configuración de Cuentas Yape / Plin y Tienda
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold mb-1">Número Yape del negocio</label>
                  <input
                    type="tel"
                    value={yapeNumberDraft}
                    onChange={(e) => setYapeNumberDraft(e.target.value)}
                    placeholder="9XXXXXXXX"
                    className="w-full px-3.5 py-2 border border-black/15 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Titular Yape</label>
                  <input
                    type="text"
                    value={yapeHolderDraft}
                    onChange={(e) => setYapeHolderDraft(e.target.value)}
                    className="w-full px-3.5 py-2 border border-black/15 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Número Plin del negocio</label>
                  <input
                    type="tel"
                    value={plinNumberDraft}
                    onChange={(e) => setPlinNumberDraft(e.target.value)}
                    placeholder="9XXXXXXXX"
                    className="w-full px-3.5 py-2 border border-black/15 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Titular Plin</label>
                  <input
                    type="text"
                    value={plinHolderDraft}
                    onChange={(e) => setPlinHolderDraft(e.target.value)}
                    className="w-full px-3.5 py-2 border border-black/15 rounded-md"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">
                    Número WhatsApp Business (9 dígitos Perú)
                  </label>
                  <input
                    type="tel"
                    value={whatsappDraft}
                    onChange={(e) => setWhatsappDraft(e.target.value)}
                    placeholder="9XXXXXXXX"
                    className="w-full px-3.5 py-2 border border-black/15 rounded-md font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold mb-1">
                    Barra de Anuncio Superior
                  </label>
                  <input
                    type="text"
                    value={announcementDraft}
                    onChange={(e) => setAnnouncementDraft(e.target.value)}
                    className="w-full px-3.5 py-2 border border-black/15 rounded-md"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#0E5A78]"
              >
                Guardar configuración
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Modal: Validar Comprobante Yape / Plin */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setInspectOrder(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/8 pb-3">
              <div>
                <p className="text-xs font-semibold text-[#0E5A78]">
                  Validación de pago {inspectOrder.payment.method}
                </p>
                <h3 className="font-mono font-bold text-lg">{inspectOrder.id}</h3>
              </div>
              <button type="button" onClick={() => setInspectOrder(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF7F2] p-4 rounded-lg">
              <div>
                <span className="text-[#0B0D0F]/55 block">Total del pedido</span>
                <strong className="text-sm tabular-nums">{formatPEN(inspectOrder.total)}</strong>
              </div>
              <div>
                <span className="text-[#0B0D0F]/55 block">Importe transferido</span>
                <strong className="text-sm tabular-nums">
                  {inspectOrder.payment.proof
                    ? formatPEN(inspectOrder.payment.proof.transferredAmount)
                    : '—'}
                </strong>
              </div>
              <div>
                <span className="text-[#0B0D0F]/55 block">Nro. de operación</span>
                <strong className="font-mono">
                  {inspectOrder.payment.proof?.operationNumber || 'No enviado'}
                </strong>
              </div>
              <div>
                <span className="text-[#0B0D0F]/55 block">Fecha declarada</span>
                <strong>{inspectOrder.payment.proof?.paidAt || '—'}</strong>
              </div>
            </div>

            {inspectOrder.payment.proof?.proofDataUrl ? (
              <div className="border border-black/10 rounded-lg overflow-hidden bg-[#FAF7F2]">
                <img
                  src={inspectOrder.payment.proof.proofDataUrl}
                  alt="Comprobante adjunto por el cliente"
                  className="w-full max-h-72 object-contain mx-auto"
                />
              </div>
            ) : (
              <p className="text-xs text-[#0B0D0F]/60 italic">
                Este registro de demostración no contiene archivo de captura adjunto.
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1">
                Nota de verificación (obligatoria si se rechaza)
              </label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Ej. Abono confirmado en Yape / Monto no coincide"
                className="w-full px-3 py-2 text-sm border border-black/15 rounded-md"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await verifyPayment(inspectOrder.payment.id, 'REJECTED', paymentNote);
                    setInspectOrder(null);
                    showSuccess(`Pago rechazado en ${inspectOrder.id}.`);
                  } catch (err) {
                    showError(err);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-red-700 border border-red-300 rounded-md hover:bg-red-50 inline-flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazar</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await verifyPayment(inspectOrder.payment.id, 'APPROVED', paymentNote);
                    setInspectOrder(null);
                    showSuccess(`Pago verificado y pedido ${inspectOrder.id} confirmado.`);
                  } catch (err) {
                    showError(err);
                  }
                }}
                className="px-5 py-2 text-xs font-bold bg-[#0E5A78] text-white rounded-md hover:bg-[#082B3A] inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Aprobar Pago</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Despacho */}
      {shipOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShipOrder(null)} />
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await createShipment({
                  orderId: shipOrder.id,
                  carrier: shipCarrier,
                  agencyOffice: shipAgency,
                  trackingNumber: shipTracking,
                  notes: shipNotes,
                });
                setShipOrder(null);
                showSuccess(`Despacho registrado para ${shipOrder.id}.`);
              } catch (err) {
                showError(err);
              }
            }}
            className="relative w-full max-w-md bg-white rounded-xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-black/8 pb-3">
              <h3 className="font-display font-bold text-lg">
                Despacho · {shipOrder.id}
              </h3>
              <button type="button" onClick={() => setShipOrder(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1">Empresa de transporte *</label>
                <select
                  value={shipCarrier}
                  onChange={(e) => setShipCarrier(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md bg-white"
                >
                  <option value="Motorizado Express BEACH POLO">Motorizado Express Lima</option>
                  <option value="Olva Courier">Olva Courier</option>
                  <option value="Shalom">Shalom</option>
                  <option value="Urbano Express">Urbano Express</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Agencia / Sede (opcional)</label>
                <input
                  type="text"
                  value={shipAgency}
                  onChange={(e) => setShipAgency(e.target.value)}
                  placeholder="Ej. Agencia Shalom Máncora"
                  className="w-full px-3 py-2 border border-black/15 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Número de seguimiento *</label>
                <input
                  type="text"
                  required
                  value={shipTracking}
                  onChange={(e) => setShipTracking(e.target.value)}
                  placeholder="Ej. SHL-948102"
                  className="w-full px-3 py-2 border border-black/15 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Notas de despacho</label>
                <input
                  type="text"
                  value={shipNotes}
                  onChange={(e) => setShipNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShipOrder(null)}
                className="px-4 py-2 text-xs font-semibold border border-black/15 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#0B0D0F] text-white rounded-md hover:bg-[#0E5A78]"
              >
                Confirmar envío
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Order Status History */}
      {historyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setHistoryOrder(null)} />
          <div className="relative w-full max-w-md bg-white rounded-xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/8 pb-3">
              <h3 className="font-mono font-bold text-base">
                Historial · {historyOrder.id}
              </h3>
              <button type="button" onClick={() => setHistoryOrder(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="space-y-3 text-xs">
              {historyOrder.statusHistory.map((h, i) => (
                <li key={i} className="p-3 rounded-lg bg-[#FAF7F2] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>{h.toStatus}</span>
                    <span className="text-[#0B0D0F]/55">{h.changedBy}</span>
                  </div>
                  <p className="text-[#0B0D0F]/75">{h.note}</p>
                  <p className="text-[11px] font-mono text-[#0B0D0F]/50">
                    {new Date(h.timestamp).toLocaleString('es-PE')}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Product Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/55" onClick={() => setModalOpen(false)} />
          <form
            onSubmit={handleSaveProduct}
            className="relative w-full max-w-lg bg-white rounded-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-black/8 pb-3">
              <h3 className="font-display font-bold text-lg">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="BEACH POLO CORAL"
                  className="w-full px-3 py-2 border border-black/15 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">SKU *</label>
                <input
                  type="text"
                  required
                  value={pSku}
                  onChange={(e) => setPSku(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Stock talla M</label>
                <input
                  type="number"
                  min={0}
                  value={pStockM}
                  onChange={(e) => setPStockM(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Precio (S/) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Precio anterior (S/)</label>
                <input
                  type="number"
                  min={0}
                  value={pCompare}
                  onChange={(e) => setPCompare(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 border border-black/15 rounded-md tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Categoría</label>
                <select
                  value={pCat}
                  onChange={(e) => setPCat(e.target.value as CategorySlug)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Colección</label>
                <select
                  value={pCol}
                  onChange={(e) => setPCol(e.target.value as CollectionSlug)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md bg-white"
                >
                  {COLLECTIONS.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Fotografía</label>
                <select
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md bg-white"
                >
                  <option value={MEDIA_ASSETS.poloOcean}>Polo Ocean</option>
                  <option value={MEDIA_ASSETS.poloSunset}>Polo Sunset</option>
                  <option value={MEDIA_ASSETS.poloPalm}>Polo Palm</option>
                  <option value={MEDIA_ASSETS.poloBlack}>Polo Black / Premium</option>
                  <option value={MEDIA_ASSETS.poloSand}>Polo Sand</option>
                  <option value={MEDIA_ASSETS.poloWhite}>Polo Blanco & Short</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={pDesc}
                  onChange={(e) => setPDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold border border-black/15 rounded-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-[#0B0D0F] text-white rounded-md hover:bg-[#0E5A78]"
              >
                {editingProduct ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
