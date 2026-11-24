import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Package, Search, Truck, Upload, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types/ecommerce';
import { formatPEN } from '../utils/analytics';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';
import { SeoHead } from '../components/SeoHead';

export function AccountPage() {
  const { orders, wishlist } = useStore();
  const [name, setName] = useState('Mateo Paredes');
  const [email, setEmail] = useState('mateo.paredes@gmail.com');
  const [phone, setPhone] = useState('987654321');
  const [saved, setSaved] = useState(false);

  return (
    <div className="pt-28 pb-20 bg-[#FAF7F2] min-h-screen">
      <SeoHead
        title="Mi Cuenta | BEACH POLO Perú"
        description="Administra tu perfil, pedidos y lista de favoritos en BEACH POLO."
        canonicalPath="/account"
      />
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-3xl">Mi Cuenta</h1>
            <p className="text-sm text-[#0B0D0F]/65 mt-1">
              Club BEACH POLO · Lima, Perú
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/orders"
              className="px-4 py-2 bg-white border border-black/10 rounded-md text-xs font-semibold hover:border-[#0B0D0F] inline-flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-[#0E5A78]" />
              <span>Mis Pedidos ({orders.length})</span>
            </Link>
            <Link
              to="/wishlist"
              className="px-4 py-2 bg-white border border-black/10 rounded-md text-xs font-semibold hover:border-[#0B0D0F] inline-flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-[#0E5A78]" />
              <span>Favoritos ({wishlist.length})</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSaved(true);
              setTimeout(() => setSaved(false), 3000);
            }}
            className="md:col-span-7 bg-white rounded-xl p-6 border border-black/8 space-y-4"
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-black/8">
              <User className="w-5 h-5 text-[#0E5A78]" />
              <h2 className="font-display font-bold text-lg">Datos personales</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Celular</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-black/15 rounded-md outline-none focus:border-[#0E5A78] tabular-nums"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#0E5A78] transition-colors"
              >
                Guardar cambios
              </button>
              {saved && (
                <span className="text-xs font-medium text-[#0E5A78]">
                  Perfil actualizado
                </span>
              )}
            </div>
          </form>

          <div className="md:col-span-5 bg-white rounded-xl p-6 border border-black/8 space-y-4">
            <h2 className="font-display font-bold text-lg">Último pedido</h2>
            {orders[0] ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-mono font-semibold">{orders[0].id}</span>
                  <span className="text-xs font-semibold text-[#0E5A78]">
                    {orders[0].status}
                  </span>
                </div>
                <p className="text-xs text-[#0B0D0F]/65">
                  {orders[0].items.length} artículos · Total{' '}
                  <strong className="tabular-nums">{formatPEN(orders[0].total)}</strong>
                </p>
                <Link
                  to="/orders"
                  className="inline-block text-xs font-semibold text-[#0E5A78] hover:underline"
                >
                  Ver seguimiento detallado →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-[#0B0D0F]/60">Aún no registras pedidos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAYMENT_REVIEW: 'Pago en verificación',
  CONFIRMED: 'Pago confirmado',
  PROCESSING: 'En preparación y empaquetado',
  SHIPPED: 'Entregado a transporte',
  DELIVERED: 'Pedido entregado',
  CANCELLED: 'Cancelado',
};

const PAYMENT_STATUS_LABELS: Record<Order['payment']['status'], string> = {
  PENDING: 'Pendiente de comprobante',
  UNDER_REVIEW: 'Comprobante en revisión',
  APPROVED: 'Pago verificado',
  REJECTED: 'Comprobante rechazado',
};

export function OrdersPage() {
  const { orders, submitPaymentProof } = useStore();
  const [searchId, setSearchId] = useState('');
  const [trackingLookup, setTrackingLookup] = useState<{
    orderId: string;
    status: Order['status'];
    paymentStatus: Order['payment']['status'];
    carrierName: string;
    shippingZoneLabel: string;
    shipment: Order['shipment'] | null;
    statusHistory: Order['statusHistory'];
  } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Quick re-upload proof state for PENDING / REJECTED payments
  const [reuploadOrderId, setReuploadOrderId] = useState<string | null>(null);
  const [opNum, setOpNum] = useState('');
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [amount, setAmount] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [proofErr, setProofErr] = useState<string | null>(null);

  const filtered = searchId.trim()
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(searchId.toLowerCase()) ||
          o.customer.dni.includes(searchId)
      )
    : orders;

  const steps: { key: Order['status']; label: string }[] = [
    { key: 'PENDING_PAYMENT', label: '1. Registrado' },
    { key: 'PAYMENT_REVIEW', label: '2. Revisión pago' },
    { key: 'CONFIRMED', label: '3. Pago confirmado' },
    { key: 'PROCESSING', label: '4. Preparación' },
    { key: 'SHIPPED', label: '5. En transporte' },
    { key: 'DELIVERED', label: '6. Entregado' },
  ];

  const handleServerLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setTrackingLookup(null);
    if (!searchId.trim()) return;
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(searchId.trim())}/tracking`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data.error || 'No se encontró ese número de pedido.');
        return;
      }
      setTrackingLookup(data);
    } catch {
      setLookupError('Error consultando seguimiento.');
    }
  };

  return (
    <div className="pt-28 pb-20 bg-[#FAF7F2] min-h-screen">
      <SeoHead
        title="Seguimiento de Pedidos | BEACH POLO Perú"
        description="Consulta el estado de validación de tu pago Yape/Plin y el seguimiento de tu envío en Perú."
        canonicalPath="/orders"
      />
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-3xl">Seguimiento de Pedidos</h1>
            <p className="text-sm text-[#0B0D0F]/65 mt-1">
              Validación de pago Yape/Plin y trazabilidad de despacho nacional.
            </p>
          </div>

          <form onSubmit={handleServerLookup} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#0B0D0F]/45 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Orden (BP-2027-...) o DNI"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0B0D0F] text-white text-xs font-semibold rounded-md hover:bg-[#0E5A78]"
            >
              Consultar
            </button>
          </form>
        </div>

        {lookupError && (
          <p className="text-xs font-semibold text-red-600">{lookupError}</p>
        )}

        {trackingLookup && (
          <div className="bg-white rounded-xl p-6 border-2 border-[#0E5A78] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#0E5A78] font-bold uppercase">Consulta directa</p>
                <h2 className="font-mono font-bold text-lg">{trackingLookup.orderId}</h2>
              </div>
              <span className="text-xs font-bold text-[#0E5A78]">
                {ORDER_STATUS_LABELS[trackingLookup.status]}
              </span>
            </div>
            <p className="text-xs text-[#0B0D0F]/70">
              Destino: {trackingLookup.shippingZoneLabel} · Transporte: {trackingLookup.carrierName}
            </p>
            {trackingLookup.shipment && (
              <div className="p-3 rounded-lg bg-[#FAF7F2] text-xs flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#0E5A78]" />
                <span>
                  Tracking <strong>{trackingLookup.shipment.trackingNumber}</strong> ({trackingLookup.shipment.carrier})
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((order) => {
            const activeIdx = steps.findIndex((s) => s.key === order.status);
            const needsProof =
              order.payment.status === 'PENDING' || order.payment.status === 'REJECTED';

            return (
              <article
                key={order.id}
                className="bg-white rounded-xl p-6 border border-black/8 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 pb-4">
                  <div>
                    <p className="font-mono font-bold text-base">{order.id}</p>
                    <p className="text-xs text-[#0B0D0F]/60">
                      {new Date(order.createdAt).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · {order.customer.firstName} {order.customer.lastName} ·{' '}
                      {order.payment.method} ({PAYMENT_STATUS_LABELS[order.payment.status]})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0E5A78]">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <p className="font-bold text-base tabular-nums mt-0.5">
                      {formatPEN(order.total)}
                    </p>
                  </div>
                </div>

                {order.payment.status === 'REJECTED' && order.payment.reviewNote && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                    <strong>Comprobante observado:</strong> {order.payment.reviewNote}. Puedes volver a adjuntar tu comprobante debajo.
                  </div>
                )}

                {/* 6-step Progress */}
                {order.status !== 'CANCELLED' && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px]">
                    {steps.map((step, i) => (
                      <div key={step.key} className="space-y-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            i <= activeIdx ? 'bg-[#0E5A78]' : 'bg-black/10'
                          }`}
                        />
                        <p
                          className={`truncate ${
                            i <= activeIdx ? 'font-semibold text-[#0B0D0F]' : 'text-[#0B0D0F]/45'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {order.shipment && (
                  <div className="p-3.5 rounded-lg bg-[#FAF7F2] flex flex-wrap items-center justify-between gap-2 text-xs text-[#082B3A]">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#0E5A78]" />
                      <span>
                        <strong>{order.shipment.carrier}</strong>
                        {order.shipment.agencyOffice ? ` (${order.shipment.agencyOffice})` : ''}
                      </span>
                    </div>
                    <span className="font-mono font-bold">
                      Tracking: {order.shipment.trackingNumber}
                    </span>
                  </div>
                )}

                {needsProof && (
                  <div>
                    {reuploadOrderId === order.id ? (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setProofErr(null);
                          if (!proofUrl) {
                            setProofErr('Selecciona la imagen del comprobante.');
                            return;
                          }
                          try {
                            await submitPaymentProof({
                              orderId: order.id,
                              method: order.payment.method,
                              operationNumber: opNum.trim(),
                              paidAt,
                              transferredAmount: Number(amount),
                              proofDataUrl: proofUrl,
                            });
                            setReuploadOrderId(null);
                            setOpNum('');
                            setProofUrl('');
                          } catch (err) {
                            setProofErr(
                              err instanceof Error ? err.message : 'Error enviando comprobante.'
                            );
                          }
                        }}
                        className="p-4 rounded-xl bg-[#FAF7F2] space-y-3 text-xs"
                      >
                        <p className="font-bold">Subir comprobante {order.payment.method}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <input
                            type="text"
                            required
                            value={opNum}
                            onChange={(e) => setOpNum(e.target.value)}
                            placeholder="Nro. operación"
                            className="px-3 py-2 bg-white border border-black/15 rounded"
                          />
                          <input
                            type="datetime-local"
                            required
                            value={paidAt}
                            onChange={(e) => setPaidAt(e.target.value)}
                            className="px-3 py-2 bg-white border border-black/15 rounded"
                          />
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder={`Importe (${order.total})`}
                            className="px-3 py-2 bg-white border border-black/15 rounded"
                          />
                        </div>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const r = new FileReader();
                            r.onload = () => typeof r.result === 'string' && setProofUrl(r.result);
                            r.readAsDataURL(f);
                          }}
                          className="block text-xs"
                        />
                        {proofErr && <p className="text-red-600 font-semibold">{proofErr}</p>}
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#0B0D0F] text-white font-semibold rounded"
                          >
                            Enviar comprobante
                          </button>
                          <button
                            type="button"
                            onClick={() => setReuploadOrderId(null)}
                            className="px-4 py-2 border border-black/15 rounded"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReuploadOrderId(order.id);
                          setAmount(String(order.total));
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E5A78] hover:underline"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Adjuntar comprobante de pago ({order.payment.method})</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 bg-[#FAF7F2] px-3 py-2 rounded-lg text-xs"
                    >
                      <span className="font-semibold">
                        {it.quantity}× {it.name}
                      </span>
                      <span className="text-[#0B0D0F]/60">
                        ({it.color} · {it.size})
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function WishlistPage() {
  const { products, wishlist } = useStore();
  const wishedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SeoHead
        title="Favoritos | BEACH POLO Perú"
        description="Tus prendas favoritas guardadas en BEACH POLO."
        canonicalPath="/wishlist"
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="pb-8 border-b border-black/8 mb-8">
          <h1 className="font-display font-extrabold text-3xl">Tus Favoritos</h1>
          <p className="text-sm text-[#0B0D0F]/65 mt-1 tabular-nums">
            {wishedProducts.length} prendas guardadas
          </p>
        </div>

        {wishedProducts.length === 0 ? (
          <div className="py-20 text-center bg-[#FAF7F2] rounded-xl space-y-4">
            <p className="font-display font-bold text-xl">Tu lista está vacía</p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md"
            >
              Explorar colección
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StoriesPage() {
  const { stories } = useStore();
  const { slug } = useParams();

  if (slug) {
    const story = stories.find((s) => s.slug === slug) || stories[0];
    return (
      <div className="pt-28 pb-20 bg-white min-h-screen">
        <SeoHead
          title={`${story.title} | Beach Stories`}
          description={story.excerpt}
          canonicalPath={`/stories/${story.slug}`}
          ogImage={story.image}
        />
        <article className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <Link
            to="/stories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0E5A78] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Beach Stories</span>
          </Link>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#0B0D0F]/55">
              <span>{story.category}</span>
              <span>·</span>
              <span>{story.date}</span>
              <span>·</span>
              <span>{story.readTime}</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">
              {story.title}
            </h1>
            <p className="text-base sm:text-lg text-[#0B0D0F]/70 leading-relaxed">
              {story.excerpt}
            </p>
          </div>

          <div className="aspect-[16/9] rounded-xl overflow-hidden bg-[#FAF7F2]">
            <ResilientImage src={story.image} alt={story.title} />
          </div>

          <div className="space-y-5 text-base text-[#0B0D0F]/85 leading-relaxed pt-2">
            {story.content.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="pt-8 border-t border-black/10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold">Descubre las prendas de esta historia</p>
            <Link
              to="/shop"
              className="px-6 py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#0E5A78] transition-colors"
            >
              Ir a la tienda
            </Link>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-white min-h-screen">
      <SeoHead
        title="Beach Stories | Revista Digital BEACH POLO"
        description="Guías de estilo costero, mejores playas del Perú y cultura surf."
        canonicalPath="/stories"
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="pb-10 border-b border-black/8 mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B89B5E]">
            Magazine Digital
          </p>
          <h1 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
            BEACH STORIES
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#0B0D0F]/65">
            Playas del Perú, cultura surf, guías de estilo y el detrás de cámara de nuestras colecciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <article key={story.id} className="group flex flex-col">
              <Link
                to={`/stories/${story.slug}`}
                className="aspect-[16/10] rounded-xl overflow-hidden bg-[#FAF7F2]"
              >
                <ResilientImage
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#0B0D0F]/55">
                  <span>{story.category}</span>
                  <span>·</span>
                  <span>{story.date}</span>
                  <span>·</span>
                  <span>{story.readTime}</span>
                </div>
                <Link to={`/stories/${story.slug}`}>
                  <h2 className="font-display font-bold text-xl group-hover:text-[#0E5A78] transition-colors">
                    {story.title}
                  </h2>
                </Link>
                <p className="text-sm text-[#0B0D0F]/65">{story.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
