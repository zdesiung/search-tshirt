import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck2,
  Lock,
  QrCode,
  ShieldAlert,
  Store,
  Truck,
  Upload,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PERU_UBIGEO, resolveShippingQuote } from '../data/peruUbigeo';
import { DeliveryMethod, Order, PaymentMethod } from '../types/ecommerce';
import { formatPEN, trackEcommerceEvent } from '../utils/analytics';
import { ResilientImage } from '../components/ResilientImage';
import { SeoHead } from '../components/SeoHead';

export function CheckoutPage() {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    appliedCoupon,
    shippingRates,
    settings,
    submitOrder,
    submitPaymentProof,
  } = useStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('domicilio');
  const [department, setDepartment] = useState('Lima');
  const [province, setProvince] = useState('Lima');
  const [district, setDistrict] = useState('Miraflores');
  const [street, setStreet] = useState('');
  const [reference, setReference] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('YAPE');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Post-order Yape/Plin Proof state
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [operationNumber, setOperationNumber] = useState('');
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [transferredAmount, setTransferredAmount] = useState('');
  const [proofDataUrl, setProofDataUrl] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const [copiedNum, setCopiedNum] = useState(false);

  useEffect(() => {
    if (cart.length > 0) {
      trackEcommerceEvent('begin_checkout', { value: cartSubtotal });
    }
  }, []);

  const currentDept = useMemo(
    () => PERU_UBIGEO.find((d) => d.name === department) || PERU_UBIGEO[0],
    [department]
  );

  const currentProv = useMemo(
    () =>
      currentDept.provinces.find((p) => p.name === province) ||
      currentDept.provinces[0],
    [currentDept, province]
  );

  const handleDepartmentChange = (deptName: string) => {
    setDepartment(deptName);
    const dept = PERU_UBIGEO.find((d) => d.name === deptName) || PERU_UBIGEO[0];
    const firstProv = dept.provinces[0];
    setProvince(firstProv.name);
    setDistrict(firstProv.districts[0]);
    if (deptName !== 'Lima' && deliveryMethod === 'pickup') {
      setDeliveryMethod('domicilio');
    }
  };

  const handleProvinceChange = (provName: string) => {
    setProvince(provName);
    const prov =
      currentDept.provinces.find((p) => p.name === provName) ||
      currentDept.provinces[0];
    setDistrict(prov.districts[0]);
  };

  const shippingQuote = useMemo(
    () =>
      resolveShippingQuote(shippingRates, {
        department,
        province,
        district,
        deliveryMethod,
        subtotal: cartSubtotal,
        freeShippingThreshold: settings.freeShippingThreshold,
      }),
    [shippingRates, department, province, district, deliveryMethod, cartSubtotal, settings.freeShippingThreshold]
  );

  const finalTotal = Math.max(0, cartSubtotal - cartDiscount + shippingQuote.cost);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!/^\d{8}$/.test(dni.trim())) {
      setErrorMsg('Ingresa un DNI válido de 8 dígitos.');
      return;
    }
    if (!/^9\d{8}$/.test(phone.trim())) {
      setErrorMsg('Ingresa un celular peruano válido de 9 dígitos (inicia con 9).');
      return;
    }
    if (deliveryMethod !== 'pickup' && !street.trim()) {
      setErrorMsg('Ingresa la dirección completa o agencia de destino.');
      return;
    }

    try {
      setSubmittingOrder(true);
      const order = await submitOrder({
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dni: dni.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
        deliveryMethod,
        address:
          deliveryMethod !== 'pickup'
            ? {
                department,
                province,
                district,
                street: street.trim(),
                reference: reference.trim(),
                recipientName: recipientName.trim() || `${firstName.trim()} ${lastName.trim()}`,
                recipientPhone: recipientPhone.trim() || phone.trim(),
              }
            : undefined,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });
      setCreatedOrder(order);
      setTransferredAmount(String(order.total));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar el pedido.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProofError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setProofError('Formato inválido. Sube una captura PNG, JPG o WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProofError('La imagen no debe superar los 2 MB.');
      return;
    }
    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;
    setProofError(null);

    if (!proofDataUrl) {
      setProofError('Adjunta la imagen de tu comprobante Yape o Plin.');
      return;
    }

    try {
      setSubmittingProof(true);
      const updated = await submitPaymentProof({
        orderId: createdOrder.id,
        method: createdOrder.payment.method,
        operationNumber: operationNumber.trim(),
        paidAt,
        transferredAmount: Number(transferredAmount),
        proofDataUrl,
      });
      setCreatedOrder(updated);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setProofError(err instanceof Error ? err.message : 'No se pudo enviar el comprobante.');
    } finally {
      setSubmittingProof(false);
    }
  };

  // Screen after Order Created: Yape/Plin Payment Instructions + Proof Upload OR Confirmation Under Review
  if (createdOrder) {
    const isYape = createdOrder.payment.method === 'YAPE';
    const walletNumber = isYape ? settings.yapeNumber : settings.plinNumber;
    const walletHolder = isYape ? settings.yapeHolder : settings.plinHolder;
    const isUnderReview = createdOrder.payment.status === 'UNDER_REVIEW';

    return (
      <div className="pt-28 pb-20 bg-[#FAF7F2] min-h-screen">
        <SeoHead
          title={`Pago ${createdOrder.payment.method} · ${createdOrder.id} | BEACH POLO`}
          description="Envía tu comprobante Yape o Plin para verificación manual."
          canonicalPath="/checkout"
        />

        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-9 border border-black/8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/8 pb-5">
              <div className="flex items-center gap-3">
                {isUnderReview ? (
                  <CheckCircle2 className="w-8 h-8 text-[#0E5A78] shrink-0" />
                ) : (
                  <Clock className="w-8 h-8 text-[#B89B5E] shrink-0" />
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0E5A78]">
                    {isUnderReview
                      ? 'Comprobante recibido · Pendiente de verificación'
                      : 'Pedido registrado · Pendiente de pago'}
                  </p>
                  <h1 className="font-display font-extrabold text-2xl text-[#0B0D0F]">
                    Orden {createdOrder.id}
                  </h1>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-[#0B0D0F]/55">Total a transferir</p>
                <p className="font-display font-extrabold text-2xl tabular-nums text-[#0B0D0F]">
                  {formatPEN(createdOrder.total)}
                </p>
              </div>
            </div>

            {isUnderReview ? (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#0E5A78]/20 space-y-2 text-sm text-[#082B3A]">
                  <div className="flex items-center gap-2 font-bold">
                    <FileCheck2 className="w-5 h-5 text-[#0E5A78]" />
                    <span>Tu pago está en revisión administrativa</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#0B0D0F]/75">
                    Registramos tu operación <strong>{createdOrder.payment.proof?.operationNumber}</strong> vía{' '}
                    <strong>{createdOrder.payment.method}</strong> por{' '}
                    <strong className="tabular-nums">
                      {formatPEN(createdOrder.payment.proof?.transferredAmount || createdOrder.total)}
                    </strong>
                    . Por seguridad, nuestro equipo verificará el abono en cuenta antes de pasar tu pedido a preparación y despacho.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white border border-black/8 rounded-xl p-4">
                  <div>
                    <span className="text-[#0B0D0F]/50 block">Destino</span>
                    <span className="font-semibold">{createdOrder.shippingZoneLabel}</span>
                  </div>
                  <div>
                    <span className="text-[#0B0D0F]/50 block">Transporte asignado</span>
                    <span className="font-semibold">{createdOrder.carrierName}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/orders"
                    className="px-6 py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#0E5A78] transition-colors"
                  >
                    Seguir estado de mi pedido
                  </Link>
                  <Link
                    to="/shop"
                    className="px-6 py-3 border border-black/15 text-xs font-semibold rounded-md hover:border-[#0B0D0F]"
                  >
                    Seguir comprando
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Payment Instructions Card */}
                <div className="md:col-span-5 bg-[#FAF7F2] rounded-xl p-5 border border-black/8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0E5A78]">
                      Pagar con {createdOrder.payment.method}
                    </span>
                    <QrCode className="w-5 h-5 text-[#082B3A]" />
                  </div>

                  {/* Clean vector QR emblem representation */}
                  <div className="aspect-square max-w-[160px] mx-auto bg-white rounded-xl p-4 border border-black/10 flex flex-col items-center justify-center text-center">
                    <QrCode className="w-24 h-24 text-[#0B0D0F]" strokeWidth={1.3} />
                    <span className="text-[10px] font-mono text-[#0B0D0F]/60 mt-1">
                      QR OFICIAL {createdOrder.payment.method}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-[#0B0D0F]/60">Titular de cuenta</p>
                    <p className="font-bold text-[#0B0D0F]">{walletHolder}</p>

                    <p className="text-[#0B0D0F]/60 pt-2">Número {createdOrder.payment.method}</p>
                    {walletNumber ? (
                      <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-md border border-black/10">
                        <span className="font-mono font-bold text-sm tabular-nums">
                          {walletNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(walletNumber);
                            setCopiedNum(true);
                            setTimeout(() => setCopiedNum(false), 2000);
                          }}
                          className="text-[#0E5A78] inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedNum ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-md bg-white border border-black/10 text-[11px] text-[#082B3A]">
                        Número comercial aún no configurado. Puedes configurarlo en{' '}
                        <Link to="/admin" className="underline font-semibold text-[#0E5A78]">
                          Panel Admin → Configuración
                        </Link>
                        .
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-white/80 text-[11px] text-[#0B0D0F]/70 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#B89B5E] shrink-0 mt-0.5" />
                    <span>
                      Validación administrativa manual: el pedido no pasa a preparación hasta confirmar el abono real.
                    </span>
                  </div>
                </div>

                {/* Upload Proof Form */}
                <form onSubmit={handleSubmitProof} className="md:col-span-7 space-y-4">
                  <h2 className="font-display font-bold text-lg">
                    Adjunta tu comprobante de pago
                  </h2>
                  <p className="text-xs text-[#0B0D0F]/65">
                    Una vez realizada la transferencia por {formatPEN(createdOrder.total)}, completa estos datos para verificar tu abono:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1">
                        Número de operación *
                      </label>
                      <input
                        type="text"
                        required
                        value={operationNumber}
                        onChange={(e) => setOperationNumber(e.target.value)}
                        placeholder="Ej. 00482910"
                        className="w-full px-3.5 py-2.5 border border-black/15 rounded-md font-mono outline-none focus:border-[#0E5A78]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Fecha y hora del pago *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={paidAt}
                        onChange={(e) => setPaidAt(e.target.value)}
                        className="w-full px-3 py-2.5 border border-black/15 rounded-md outline-none focus:border-[#0E5A78] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Importe transferido (S/) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        required
                        value={transferredAmount}
                        onChange={(e) => setTransferredAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-black/15 rounded-md tabular-nums outline-none focus:border-[#0E5A78]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1.5">
                        Captura / Imagen del comprobante (PNG, JPG, WEBP · máx 2MB) *
                      </label>
                      <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-black/15 rounded-xl cursor-pointer hover:border-[#0E5A78] bg-[#FAF7F2]/50 text-center">
                        <Upload className="w-5 h-5 text-[#0E5A78]" />
                        <span className="text-xs font-medium text-[#0B0D0F]/80">
                          {proofFileName ? proofFileName : 'Seleccionar imagen del comprobante'}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleProofFileChange}
                          className="sr-only"
                        />
                      </label>
                      {proofDataUrl && (
                        <div className="mt-3 flex items-center gap-3 p-2.5 rounded-lg bg-[#FAF7F2] border border-black/8">
                          <img
                            src={proofDataUrl}
                            alt="Vista previa comprobante"
                            className="w-12 h-12 object-cover rounded"
                          />
                          <span className="text-xs text-[#082B3A] font-medium">
                            Imagen lista para enviar a validación
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {proofError && (
                    <p role="alert" className="text-xs font-semibold text-red-600">
                      {proofError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submittingProof}
                    className="w-full py-3.5 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-md hover:bg-[#0E5A78] disabled:opacity-60 transition-colors"
                  >
                    {submittingProof ? 'Enviando comprobante...' : 'Enviar comprobante para verificación'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 bg-[#FAF7F2] min-h-screen">
      <SeoHead
        title="Finalizar Compra | BEACH POLO Perú"
        description="Checkout directo para Perú con Yape, Plin y envíos nacionales."
        canonicalPath="/checkout"
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
            Finalizar Compra
          </h1>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#082B3A]">
            <Lock className="w-3.5 h-3.5 text-[#0E5A78]" />
            <span>Pagos directos Yape y Plin · Perú</span>
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center space-y-4 border border-black/8">
            <p className="font-display font-bold text-xl">No tienes artículos en tu bolsa</p>
            <Link
              to="/shop"
              className="inline-block px-6 py-3 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-wider rounded-md"
            >
              Volver a la tienda
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Datos del Cliente */}
              <section className="bg-white rounded-xl p-6 border border-black/8 space-y-4">
                <h2 className="font-display font-bold text-lg">1. Datos del comprador</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Apellido *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">DNI (8 dígitos) *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      required
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ej. 72849103"
                      className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Celular (Perú) *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={9}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9XXXXXXXX"
                      className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78] tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                    />
                  </div>
                </div>
              </section>

              {/* 2. Envíos a todo el Perú */}
              <section className="bg-white rounded-xl p-6 border border-black/8 space-y-4">
                <h2 className="font-display font-bold text-lg">2. Envío nacional (Perú)</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('domicilio')}
                    className={`p-3.5 rounded-lg border text-left flex items-start gap-2.5 transition-colors ${
                      deliveryMethod === 'domicilio'
                        ? 'border-[#0E5A78] bg-[#0E5A78]/5'
                        : 'border-black/15'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-[#0E5A78] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Domicilio</p>
                      <p className="text-[11px] text-[#0B0D0F]/60 mt-0.5">Lima y provincias</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('agencia')}
                    className={`p-3.5 rounded-lg border text-left flex items-start gap-2.5 transition-colors ${
                      deliveryMethod === 'agencia'
                        ? 'border-[#0E5A78] bg-[#0E5A78]/5'
                        : 'border-black/15'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#0E5A78] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Agencia</p>
                      <p className="text-[11px] text-[#0B0D0F]/60 mt-0.5">Shalom / Olva</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDepartment('Lima');
                      setProvince('Lima');
                      setDistrict('Miraflores');
                      setDeliveryMethod('pickup');
                    }}
                    className={`p-3.5 rounded-lg border text-left flex items-start gap-2.5 transition-colors ${
                      deliveryMethod === 'pickup'
                        ? 'border-[#0E5A78] bg-[#0E5A78]/5'
                        : 'border-black/15'
                    }`}
                  >
                    <Store className="w-4 h-4 text-[#0E5A78] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Showroom</p>
                      <p className="text-[11px] text-[#0B0D0F]/60 mt-0.5">Miraflores gratis</p>
                    </div>
                  </button>
                </div>

                {deliveryMethod !== 'pickup' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Departamento *</label>
                      <select
                        value={department}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-black/15 rounded-md bg-white"
                      >
                        {PERU_UBIGEO.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Provincia *</label>
                      <select
                        value={province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-black/15 rounded-md bg-white"
                      >
                        {currentDept.provinces.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Distrito *</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm border border-black/15 rounded-md bg-white"
                      >
                        {currentProv.districts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium mb-1">
                        {deliveryMethod === 'agencia'
                          ? 'Sede de Agencia Shalom / Olva preferida *'
                          : 'Dirección completa *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder={
                          deliveryMethod === 'agencia'
                            ? 'Ej. Agencia Shalom Av. Piura 240'
                            : 'Av. / Calle / Mz / Lote / Dpto'
                        }
                        className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium mb-1">Referencia del domicilio</label>
                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Ej. Edificio gris frente al parque"
                        className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1">
                        Nombre de quien recibe (opcional)
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Por defecto, datos del comprador"
                        className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Celular destinatario
                      </label>
                      <input
                        type="tel"
                        maxLength={9}
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9XXXXXXXX"
                        className="w-full px-3.5 py-2.5 text-sm border border-black/15 rounded-md outline-none focus:border-[#0E5A78] tabular-nums"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-[#FAF7F2] text-xs text-[#082B3A]">
                    Recojo sin costo en <strong>{settings.showroomAddress}</strong> (Lun–Sáb 10:00 a.m. – 8:00 p.m.) presentando tu DNI.
                  </div>
                )}

                <div className="p-3.5 rounded-lg bg-[#FAF7F2] flex flex-wrap items-center justify-between gap-2 text-xs text-[#082B3A]">
                  <span>
                    <strong>Transportista:</strong> {shippingQuote.carrier} · {shippingQuote.estimatedDays}
                  </span>
                  <span className="font-bold tabular-nums">
                    {shippingQuote.isManualQuote
                      ? `Base ${formatPEN(shippingQuote.cost)} (Zona especial)`
                      : shippingQuote.cost === 0
                        ? 'Envío Gratis'
                        : formatPEN(shippingQuote.cost)}
                  </span>
                </div>
              </section>

              {/* 3. Selección de Pago: Yape o Plin */}
              <section className="bg-white rounded-xl p-6 border border-black/8 space-y-4">
                <h2 className="font-display font-bold text-lg">
                  3. Selecciona tu método de pago
                </h2>
                <p className="text-xs text-[#0B0D0F]/65">
                  Pagos directos sin recargos de pasarela. Al registrar tu pedido recibirás el QR / número oficial y podrás adjuntar tu comprobante.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('YAPE')}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      paymentMethod === 'YAPE'
                        ? 'border-[#0B0D0F] bg-[#0B0D0F] text-white'
                        : 'border-black/15 bg-[#FAF7F2] text-[#0B0D0F] hover:border-black/40'
                    }`}
                  >
                    <p className="font-display font-bold text-base">Pagar con Yape</p>
                    <p
                      className={`text-xs mt-1 ${
                        paymentMethod === 'YAPE' ? 'text-white/75' : 'text-[#0B0D0F]/60'
                      }`}
                    >
                      Transferencia al QR o número Yape del negocio
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PLIN')}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      paymentMethod === 'PLIN'
                        ? 'border-[#0B0D0F] bg-[#0B0D0F] text-white'
                        : 'border-black/15 bg-[#FAF7F2] text-[#0B0D0F] hover:border-black/40'
                    }`}
                  >
                    <p className="font-display font-bold text-base">Pagar con Plin</p>
                    <p
                      className={`text-xs mt-1 ${
                        paymentMethod === 'PLIN' ? 'text-white/75' : 'text-[#0B0D0F]/60'
                      }`}
                    >
                      BBVA, Interbank, Scotiabank y BanBif sin comisión
                    </p>
                  </button>
                </div>

                {errorMsg && (
                  <p role="alert" className="text-xs font-semibold text-red-600">
                    {errorMsg}
                  </p>
                )}
              </section>
            </div>

            {/* Order Summary */}
            <aside className="lg:col-span-5 bg-white rounded-xl p-6 border border-black/8 space-y-5 lg:sticky lg:top-28">
              <h2 className="font-display font-bold text-lg">Resumen ({cart.length})</h2>
              <ul className="divide-y divide-black/8 max-h-72 overflow-y-auto">
                {cart.map((item) => (
                  <li
                    key={`${item.productId}-${item.color.name}-${item.size}`}
                    className="py-3 flex items-center gap-3"
                  >
                    <div className="w-14 h-16 rounded bg-[#FAF7F2] overflow-hidden shrink-0">
                      <ResilientImage src={item.image} alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-xs text-[#0B0D0F]/55">
                        {item.color.name} · {item.size} · Cant. {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold tabular-nums">
                      {formatPEN(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 text-sm border-t border-black/8 pt-4">
                <div className="flex justify-between text-[#0B0D0F]/70">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatPEN(cartSubtotal)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-[#0E5A78]">
                    <span>Descuento ({appliedCoupon?.code})</span>
                    <span className="tabular-nums">− {formatPEN(cartDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#0B0D0F]/70">
                  <span>Envío ({shippingQuote.zoneLabel})</span>
                  <span className="tabular-nums">
                    {shippingQuote.cost === 0 ? 'Gratis' : formatPEN(shippingQuote.cost)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-black/8">
                  <span>Total a pagar</span>
                  <span className="tabular-nums">{formatPEN(finalTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingOrder}
                className="w-full py-4 bg-[#0B0D0F] text-white text-xs font-bold uppercase tracking-[0.14em] rounded-md hover:bg-[#0E5A78] disabled:opacity-60 transition-colors"
              >
                {submittingOrder
                  ? 'Registrando pedido...'
                  : `Continuar con ${paymentMethod} · ${formatPEN(finalTotal)}`}
              </button>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
